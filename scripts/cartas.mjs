#!/usr/bin/env node
/* Traça a carta de cada região a partir de um mapa de referência e grava o
 * resultado em dados/cartas.json: a costa, as faixas de altitude e as rotas,
 * já como caminhos vetoriais. As imagens de referência NÃO entram no
 * repositório; servem só de molde para o traçado.
 *
 * Uso: node scripts/cartas.mjs --ref <pasta com kanto.png, johto.png, ...> [--conferir <pasta>] [região ...]
 *   --conferir  grava, para cada região, a referência ampliada com grade e o
 *               traçado por cima, para conferir a olho
 *
 * O arquivo gerado fica no repositório; o build não depende deste script.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { criarMalha, aneis, ruido, NIVEIS } from "../src/js/relevo.js";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
function opcao(nome) {
  const i = args.indexOf(`--${nome}`);
  if (i < 0) return null;
  return args.splice(i, 2)[1];
}
const REF = opcao("ref");
const CONFERIR = opcao("conferir");
if (!REF) { console.error("Informe --ref <pasta das imagens de referência>."); process.exit(1); }

/* ---------- como ler cada referência ---------- */

const ciano = (r, g, b) => (b > g && g > r + 60 && r < 110) ||     // mar dos mapas em pixel
  (g > 232 && b > 208 && r > 130 && r < 206);                      // e os lagos, em verde-água claro
const laranja = (r, g, b) => r >= 236 && g >= 148 && g <= 212 && b <= 132;
const cidadeVermelha = (r, g, b) => r > 196 && g < 140 && b < 150;
const cidadeAzul = (r, g, b) => b > 196 && g < 160 && r < 140;
const claro = (r, g, b) => r > 208 && g > 208 && b > 208;
// nos mapas em pixel, a cor do terreno já diz a altitude: verde é baixo, amarelo e oliva são altos
const altitudePelaCor = (r, g) => (r - g + 64) / 72;

// verdes e olivas do terreno; rotas, cidades e contornos claros ficam de fora
const terreno = (r, g, b) => (g > r && g > b + 56) || (Math.abs(r - g) <= 28 && b < 112 && r > 118 && r < 236);

/* Nos mapas em pixel, só mar e terreno têm cor própria. O resto (faixas de rota,
 * quadrados de cidade, contornos) é decidido pelos vizinhos: assim uma rota
 * marítima não vira uma língua de terra. */
const PIXEL = {
  mar: ciano,
  terra: terreno,
  rota: (r, g, b) => laranja(r, g, b) || cidadeVermelha(r, g, b) || cidadeAzul(r, g, b) || claro(r, g, b),
  cidade: (r, g, b) => cidadeVermelha(r, g, b) || cidadeAzul(r, g, b),
  altitude: altitudePelaCor
};

/* Por região:
 *   recorte   [x, y, largura, altura] da parte da imagem que interessa
 *   ignorar   retângulos (nuvens, placas, botões) cuja cor não diz nada: os vizinhos decidem
 *   ilhota    menor mancha de terra que conta, em fração da área (abaixo disso é ruído)
 *   furo      menor mancha de água dentro da terra que conta
 *   semRotas  as rotas desta região são traçadas à mão em dados/atlas.mjs
 */
const REGIOES = {
  kanto: { arquivo: "kanto.png", recorte: [0, 0, 200, 150], ...PIXEL },
  johto: { arquivo: "johto.png", ...PIXEL },
  hoenn: { arquivo: "hoenn.png", ...PIXEL },
  sinnoh: { arquivo: "sinnoh.png", ...PIXEL },
  unova: {
    arquivo: "unova.png", semRotas: true,
    mar: (r, g, b) => b > r + 60 && b > g + 18,
    rota: (r, g, b) => r > 215 && g > 150 && g < 225 && b < 150
  },
  kalos: {
    arquivo: "kalos.png", semRotas: true, ilhota: 0.003, furo: 0.004,
    ignorar: [[0, 0, 172, 19], [0, 0, 320, 6], [0, 203, 320, 7]],        // a moldura enevoada da imagem
    mar: (r, g, b) => b > r + 70 && b > g + 26,
    rota: (r, g, b) => r > 222 && g > 222 && b > 222
  },
  alola: {
    arquivo: "alola.png",
    mar: (r, g, b) => (b > r + 50 && b >= g - 6) || (r > 150 && g > 196 && b > 222),
    ignorar: [[0, 150, 262, 90], [0, 0, 84, 16], [326, 220, 74, 20]]     // a placa com o nome e os cantos da moldura
  },
  galar: { arquivo: "galar.png", ilhota: 0.0026, mar: (r, g, b) => r < 126 && g > 128 && b > 150 && b >= g - 12 },
  hisui: {
    arquivo: "hisui.jpg", recorte: [12, 10, 616, 338],
    mar: (r, g, b) => g > r + 22 && b > r + 16,
    // nuvens e botões da tela do jogo, que têm cor de terra
    ignorar: [[25, 88, 115, 40], [355, 0, 261, 58], [530, 47, 56, 25], [0, 257, 142, 81], [487, 264, 129, 74],
      [0, 314, 616, 24], [0, 0, 616, 10], [0, 0, 10, 338], [606, 0, 10, 338]]
  },
  paldea: { arquivo: "paldea.jpg", mar: (r, g, b) => r < 126 && b > g + 8 && b > r + 42 }
};

/* Montanhas que os mapas ilustrados não deixam ler pela cor. [x, y, altura, largura], em fração do quadro. */
const CUMES = {
  unova: [[0.17, 0.22, 0.9, 0.09], [0.52, 0.1, 0.7, 0.1], [0.79, 0.44, 0.75, 0.08], [0.5, 0.46, 0.35, 0.07]],
  kalos: [[0.8, 0.36, 0.9, 0.12], [0.72, 0.62, 0.7, 0.1], [0.3, 0.52, 0.4, 0.08]],
  alola: [[0.34, 0.27, 0.6, 0.05], [0.7, 0.3, 0.95, 0.06], [0.83, 0.71, 1, 0.05], [0.9, 0.6, 0.5, 0.04], [0.17, 0.45, 0.5, 0.045]],
  galar: [[0.5, 0.31, 0.95, 0.13], [0.78, 0.36, 0.6, 0.08], [0.2, 0.33, 0.5, 0.07], [0.24, 0.44, 0.5, 0.06]],
  hisui: [[0.47, 0.33, 1, 0.1], [0.36, 0.12, 0.85, 0.12], [0.62, 0.2, 0.6, 0.09], [0.72, 0.62, 0.45, 0.1]],
  paldea: [[0.52, 0.23, 0.95, 0.1], [0.2, 0.55, 0.3, 0.08], [0.76, 0.42, 0.3, 0.08]]
};
/* Depressões: a Grande Cratera de Paldea. */
const CRATERAS = { paldea: [[0.495, 0.545, 0.085]] };

/* ---------- operações sobre a grade de pixels ---------- */

function borrar(campo, w, h, raio, vezes = 2) {
  let a = campo, b = new Float32Array(w * h);
  const r = Math.max(1, Math.round(raio));
  for (let v = 0; v < vezes * 2; v++) {
    const horizontal = v % 2 === 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let soma = 0, n = 0;
        for (let k = -r; k <= r; k++) {
          const xx = horizontal ? x + k : x, yy = horizontal ? y : y + k;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          soma += a[yy * w + xx]; n++;
        }
        b[y * w + x] = soma / n;
      }
    }
    [a, b] = [b, a];
  }
  return a;
}

/* Espalha os valores conhecidos sobre os desconhecidos (o mais próximo vence). */
function preencher(valores, conhecido, w, h) {
  const fila = [];
  for (let i = 0; i < w * h; i++) if (conhecido[i]) fila.push(i);
  for (let p = 0; p < fila.length; p++) {
    const i = fila[p], x = i % w, y = (i / w) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const j = yy * w + xx;
      if (conhecido[j]) continue;
      conhecido[j] = 1; valores[j] = valores[i]; fila.push(j);
    }
  }
}

/* Distância (em pixels) de cada ponto de terra até o mar. */
function distanciaAoMar(terra, w, h) {
  const d = new Float32Array(w * h).fill(1e9);
  const fila = [];
  for (let i = 0; i < w * h; i++) if (!terra[i]) { d[i] = 0; fila.push(i); }
  for (let p = 0; p < fila.length; p++) {
    const i = fila[p], x = i % w, y = (i / w) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const j = yy * w + xx;
      if (d[j] > d[i] + 1) { d[j] = d[i] + 1; fila.push(j); }
    }
  }
  return d;
}

/* Apaga manchas pequenas (rótulos, ícones, nuvens) de um tipo, trocando-as pelo outro. */
function limparManchas(mascara, w, h, valor, minimo) {
  const visto = new Uint8Array(w * h);
  for (let ini = 0; ini < w * h; ini++) {
    if (visto[ini] || mascara[ini] !== valor) continue;
    const grupo = [ini]; visto[ini] = 1;
    for (let p = 0; p < grupo.length; p++) {
      const i = grupo[p], x = i % w, y = (i / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = yy * w + xx;
        if (!visto[j] && mascara[j] === valor) { visto[j] = 1; grupo.push(j); }
      }
    }
    if (grupo.length < minimo) for (const i of grupo) mascara[i] = 1 - valor;
  }
}

/* Centro de cada mancha de uma cor (os quadradinhos de cidade dos mapas em pixel). */
function manchas(marca, w, h) {
  const visto = new Uint8Array(w * h), lista = [];
  for (let ini = 0; ini < w * h; ini++) {
    if (visto[ini] || !marca[ini]) continue;
    const grupo = [ini]; visto[ini] = 1;
    for (let p = 0; p < grupo.length; p++) {
      const i = grupo[p], x = i % w, y = (i / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = yy * w + xx;
        if (!visto[j] && marca[j]) { visto[j] = 1; grupo.push(j); }
      }
    }
    if (grupo.length < 6) continue;
    let sx = 0, sy = 0;
    for (const i of grupo) { sx += i % w; sy += (i / w) | 0; }
    lista.push({ x: (sx / grupo.length + 0.5) / w, y: (sy / grupo.length + 0.5) / h, n: grupo.length });
  }
  return lista;
}

/* Afinamento de Zhang-Suen: descasca a máscara até restar uma linha de um pixel. */
function afinar(m, w, h) {
  const apagar = [];
  for (let mudou = true; mudou;) {
    mudou = false;
    for (let fase = 0; fase < 2; fase++) {
      apagar.length = 0;
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (!m[i]) continue;
          const p2 = m[i - w], p3 = m[i - w + 1], p4 = m[i + 1], p5 = m[i + w + 1];
          const p6 = m[i + w], p7 = m[i + w - 1], p8 = m[i - 1], p9 = m[i - w - 1];
          const vizinhos = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          if (vizinhos < 2 || vizinhos > 6) continue;
          const voltas = (!p2 && p3) + (!p3 && p4) + (!p4 && p5) + (!p5 && p6) + (!p6 && p7) + (!p7 && p8) + (!p8 && p9) + (!p9 && p2);
          if (voltas !== 1) continue;
          if (fase === 0 ? (p2 && p4 && p6) || (p4 && p6 && p8) : (p2 && p4 && p8) || (p2 && p6 && p8)) continue;
          apagar.push(i);
        }
      }
      for (const i of apagar) m[i] = 0;
      if (apagar.length) mudou = true;
    }
  }
}

/* Distância de um ponto à reta entre dois outros, para simplificar linhas. */
function simplificar(pts, tolerancia) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const comprimento = Math.hypot(bx - ax, by - ay) || 1;
  let pior = 0, onde = 0;
  for (let k = 1; k < pts.length - 1; k++) {
    const d = Math.abs((bx - ax) * (ay - pts[k][1]) - (ax - pts[k][0]) * (by - ay)) / comprimento;
    if (d > pior) { pior = d; onde = k; }
  }
  if (pior <= tolerancia) return [pts[0], pts[pts.length - 1]];
  return [...simplificar(pts.slice(0, onde + 1), tolerancia).slice(0, -1), ...simplificar(pts.slice(onde), tolerancia)];
}

/* Percorre a linha de um pixel e devolve um caminho de segmentos retos. */
function linhasDoEixo(m, w, h, farpa) {
  const vizinhos = (i) => {
    const x = i % w, y = (i / w) | 0, lista = [];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h && m[yy * w + xx]) lista.push(yy * w + xx);
    }
    // a diagonal só conta quando não há caminho em L pelos lados
    for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h || !m[yy * w + xx]) continue;
      if (m[y * w + xx] || m[yy * w + x]) continue;
      lista.push(yy * w + xx);
    }
    return lista;
  };
  const usado = new Set();
  const chave = (a, b) => (a < b ? a * w * h + b : b * w * h + a);
  const pontos = [];
  for (let i = 0; i < w * h; i++) if (m[i]) pontos.push(i);
  const grau = new Map(pontos.map((i) => [i, vizinhos(i).length]));
  const linhas = [];
  function seguir(inicio, primeiro) {
    const linha = [inicio];
    let anterior = inicio, atual = primeiro;
    usado.add(chave(inicio, primeiro));
    for (;;) {
      linha.push(atual);
      if (grau.get(atual) !== 2) break;
      const proximo = vizinhos(atual).find((v) => v !== anterior && !usado.has(chave(atual, v)));
      if (proximo === undefined) break;
      usado.add(chave(atual, proximo));
      anterior = atual; atual = proximo;
    }
    linhas.push(linha);
  }
  for (const i of pontos) if (grau.get(i) !== 2) for (const v of vizinhos(i)) if (!usado.has(chave(i, v))) seguir(i, v);
  for (const i of pontos) for (const v of vizinhos(i)) if (!usado.has(chave(i, v))) seguir(i, v);   // voltas fechadas

  const ex = LARGURA / w, ey = (LARGURA * h) / w / h;
  let d = "";
  for (const linha of linhas) {
    const pts = simplificar(linha.map((i) => [i % w + 0.5, ((i / w) | 0) + 0.5]), 1.3);
    const comprimento = pts.reduce((s, p, k) => (k ? s + Math.hypot(p[0] - pts[k - 1][0], p[1] - pts[k - 1][1]) : 0), 0);
    const ponta = grau.get(linha[0]) === 1 || grau.get(linha[linha.length - 1]) === 1;
    if (ponta && comprimento < Math.min(w, h) * farpa) continue;      // farpas do afinamento
    d += pts.map((p, k) => `${k ? "L" : "M"}${Math.round(p[0] * ex)} ${Math.round(p[1] * ey)}`).join("");
  }
  return d;
}

/* ---------- da grade de pixels ao caminho vetorial ---------- */

const LARGURA = 1000;          // largura do quadro vetorial; a altura segue a proporção
const SOBRA = 3;               // nós além do quadro, para a costa não riscar a moldura

/* Reamostra um campo w x h numa malha com sobra em volta e devolve os caminhos de cada nível. */
function tracarNiveis(campo, w, h, niveis, nosLargura) {
  const gx = nosLargura + 2 * SOBRA, gy = Math.round((nosLargura * h) / w) + 2 * SOBRA;
  const malha = criarMalha(gx, gy, 0, 1, 0, 1);
  const cel = LARGURA / (gx - 1 - 2 * SOBRA);
  for (let j = 0; j < gy; j++) {
    for (let i = 0; i < gx; i++) {
      // a sobra repete o valor da borda do quadro; o último anel de nós fica no fundo
      const fx = Math.min(1, Math.max(0, (i - SOBRA) / (gx - 1 - 2 * SOBRA))) * (w - 1);
      const fy = Math.min(1, Math.max(0, (j - SOBRA) / (gy - 1 - 2 * SOBRA))) * (h - 1);
      const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
      const tx = fx - x0, ty = fy - y0;
      const cima = campo[y0 * w + x0] * (1 - tx) + campo[y0 * w + x1] * tx;
      const baixo = campo[y1 * w + x0] * (1 - tx) + campo[y1 * w + x1] * tx;
      const borda = i === 0 || j === 0 || i === gx - 1 || j === gy - 1;
      malha.h[j * gx + i] = borda ? -9 : cima * (1 - ty) + baixo * ty;
    }
  }
  const r = (v) => Math.round(v);
  return niveis.map((nivel) => {
    let d = "";
    for (const anel of aneis(malha, nivel)) {
      const total = anel.length / 2, passo = total >= 30 ? 2 : 1;
      const xs = [], ys = [];
      for (let q = 0; q < total; q += passo) {
        xs.push((anel[q * 2] - SOBRA) * cel);
        ys.push((anel[q * 2 + 1] - SOBRA) * cel);
      }
      const n = xs.length;
      if (n < 4) continue;
      const mx = (q) => r((xs[q % n] + xs[(q + 1) % n]) / 2), my = (q) => r((ys[q % n] + ys[(q + 1) % n]) / 2);
      d += `M${mx(n - 1)} ${my(n - 1)}`;
      for (let q = 0; q < n; q++) d += `Q${r(xs[q])} ${r(ys[q])} ${mx(q)} ${my(q)}`;
      d += "Z";
    }
    return d;
  });
}

/* ---------- uma região ---------- */

async function tracar(id) {
  const c = REGIOES[id];
  let imagem = sharp(join(REF, c.arquivo)).removeAlpha();
  if (c.recorte) imagem = imagem.extract({ left: c.recorte[0], top: c.recorte[1], width: c.recorte[2], height: c.recorte[3] });
  const { data, info } = await imagem.raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, n = w * h;

  // 1. cada pixel: mar, terra, ou "em cima de uma rota ou cidade" (decidido depois pelos vizinhos)
  const terra = new Float32Array(n), sabido = new Uint8Array(n);
  const rota = new Float32Array(n), cidade = new Uint8Array(n);
  const cor = new Float32Array(n), corSabida = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const x = i % w, y = (i / w) | 0;
    if ((c.ignorar || []).some(([ix, iy, iw, ih]) => x >= ix && x < ix + iw && y >= iy && y < iy + ih)) continue;
    if (c.rota && c.rota(r, g, b)) { rota[i] = 1; if (c.cidade && c.cidade(r, g, b)) cidade[i] = 1; continue; }
    const ehMar = c.mar(r, g, b);
    if (c.terra && !ehMar && !c.terra(r, g, b)) continue;      // cor sem dono: os vizinhos decidem
    sabido[i] = 1;
    if (!ehMar) {
      terra[i] = 1;
      if (c.altitude) { cor[i] = Math.min(1, Math.max(0, c.altitude(r, g, b))); corSabida[i] = 1; }
    }
  }
  preencher(terra, sabido, w, h);
  const mascara = Uint8Array.from(terra, (v) => (v > 0.5 ? 1 : 0));
  limparManchas(mascara, w, h, 1, Math.max(10, Math.round(n * (c.ilhota || 0.0007))));   // ilhotas falsas: rótulos, ícones, nuvens
  limparManchas(mascara, w, h, 0, Math.max(10, Math.round(n * (c.furo || 0.0007))));     // furos falsos: marcadores sobre a terra

  // 2. relevo: 0 no mar; em terra, 1 na costa subindo até 5 nos cumes
  const raio = Math.max(1, Math.min(w, h) / 110);
  const terraSuave = borrar(Float32Array.from(mascara), w, h, raio);
  const dist = distanciaAoMar(mascara, w, h);
  const alcance = Math.min(w, h) * 0.11;
  let alto = new Float32Array(n);
  if (c.altitude) {
    preencher(cor, corSabida, w, h);
    const corSuave = borrar(cor, w, h, raio * 2.4);
    for (let i = 0; i < n; i++) alto[i] = 0.3 * Math.min(1, dist[i] / alcance) + 0.78 * corSuave[i];
  } else {
    for (let i = 0; i < n; i++) {
      const x = (i % w) / w, y = ((i / w) | 0) / h;
      let v = 0.34 * Math.min(1, dist[i] / alcance);
      for (const [px, py, alt, larg] of CUMES[id] || []) {
        const dx = (x - px) * (w / Math.min(w, h)), dy = (y - py) * (h / Math.min(w, h));
        v += alt * 0.8 * Math.exp(-(dx * dx + dy * dy) / (2 * larg * larg));
      }
      for (const [px, py, larg] of CRATERAS[id] || []) {
        const dx = (x - px) * (w / Math.min(w, h)), dy = (y - py) * (h / Math.min(w, h));
        const q = Math.sqrt(dx * dx + dy * dy) / larg;
        v += 0.34 * Math.exp(-((q - 1.25) ** 2) / 0.1) - 0.7 * Math.exp(-(q * q) / 0.5);   // borda alta, fundo baixo
      }
      alto[i] = v;
    }
    alto = borrar(alto, w, h, raio);
  }
  const campo = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i % w, y = (i / w) | 0;
    const ondula = 0.09 * ruido((x / w) * 9, (y / w) * 9, 17) + 0.05 * ruido((x / w) * 23, (y / w) * 23, 5);
    const e = Math.min(1, Math.max(0, alto[i] + ondula));
    // de 0 (mar) a 1 (costa) pela máscara suavizada; daí para cima pelo relevo
    campo[i] = terraSuave[i] * (1 + 3.6 * e * Math.min(1, dist[i] / 2));
  }

  const nos = id === "galar" ? 96 : 190;
  const niveis = tracarNiveis(campo, w, h, [...NIVEIS], nos);

  // 3. rotas: a faixa larga do mapa é afinada até sobrar só o eixo, que vira linha
  let rotas = "";
  if (c.rota && !c.semRotas) {
    // marcos e lagos ficam como furos dentro da faixa: tapados, não viram laço
    const faixa = Uint8Array.from(rota);
    limparManchas(faixa, w, h, 0, Math.round(n * 0.012));
    // ampliada e arredondada antes de afinar: quadrados de cidade deixam de soltar farpas nas quinas
    const W = w * 2, H = h * 2;
    const dobro = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) dobro[y * W + x] = faixa[(y >> 1) * w + (x >> 1)];
    const redonda = Uint8Array.from(borrar(dobro, W, H, 3), (v) => (v > 0.5 ? 1 : 0));
    afinar(redonda, W, H);
    rotas = linhasDoEixo(redonda, W, H, 0.045);
  }

  const resultado = { proporcao: +(w / h).toFixed(4), altura: Math.round((LARGURA * h) / w), niveis, rotas };
  const cidades = c.cidade ? manchas(cidade, w, h) : [];

  if (CONFERIR) await conferir(id, c, w, h, resultado, cidades);
  return { resultado, cidades };
}

/* Folha de conferência: a referência ampliada, com grade a cada 10%, o traçado
 * por cima e, nos mapas em pixel, o número de cada cidade detectada. */
async function conferir(id, c, w, h, carta, cidades) {
  const L = 1200, A = Math.round((L * h) / w);
  let base = sharp(join(REF, c.arquivo)).removeAlpha();
  if (c.recorte) base = base.extract({ left: c.recorte[0], top: c.recorte[1], width: c.recorte[2], height: c.recorte[3] });
  const fundo = await base.resize(L, A, { kernel: w < 500 ? "nearest" : "lanczos3" }).modulate({ saturation: 0.55, brightness: 1.08 }).png().toBuffer();
  let grade = "";
  for (let k = 1; k < 10; k++) {
    grade += `<path d="M${(L * k) / 10} 0V${A}M0 ${(A * k) / 10}H${L}" stroke="#000" stroke-opacity=".28"/>`;
    grade += `<text x="${(L * k) / 10 + 3}" y="14">${k * 10}</text><text x="3" y="${(A * k) / 10 - 3}">${k * 10}</text>`;
  }
  const marcas = cidades.map((p, i) => `<circle cx="${p.x * L}" cy="${p.y * A}" r="13" fill="#fff" stroke="#000"/><text x="${p.x * L}" y="${p.y * A + 5}" text-anchor="middle">${i}</text>`).join("");
  const esc = L / LARGURA;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}" font-family="sans-serif" font-size="13" font-weight="700">
    <g transform="scale(${esc})" fill="none">
      <path d="${carta.niveis[0]}" stroke="#E4007C" stroke-width="2.4"/>
      <path d="${carta.niveis.slice(1).join("")}" stroke="#E4007C" stroke-width="1" stroke-opacity=".6"/>
      <path d="${carta.rotas}" stroke="#0057FF" stroke-width="4" stroke-linejoin="round"/>
    </g>${grade}${marcas}</svg>`;
  await mkdir(CONFERIR, { recursive: true });
  await sharp(fundo).composite([{ input: Buffer.from(svg) }]).png().toFile(join(CONFERIR, `${id}.png`));
}

/* ---------- execução ---------- */

const pedidas = args.length ? args : Object.keys(REGIOES);
const destino = join(RAIZ, "dados", "cartas.json");
let cartas = {};
try { cartas = JSON.parse(await readFile(destino, "utf8")); } catch { /* primeira vez */ }

for (const id of pedidas) {
  const { resultado, cidades } = await tracar(id);
  cartas[id] = resultado;
  const tamanho = resultado.niveis.join("").length + resultado.rotas.length;
  console.log(`${id}: ${Math.round(tamanho / 1024)} KB de traçado, proporção ${resultado.proporcao}` +
    (cidades.length ? `\n  cidades detectadas: ${cidades.map((p, i) => `${i}(${Math.round(p.x * 100)},${Math.round(p.y * 100)})`).join(" ")}` : ""));
}
await writeFile(destino, JSON.stringify(cartas), "utf8");
