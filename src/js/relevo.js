/* Relevo vivo — o movimento-assinatura do PokéAtlas.
 *
 * Um jogo tem seis notas (1 a 5). Cada nota é um morro numa direção fixa da rosa
 * dos ventos; a soma dos morros, mais uma ilhota central e um pouco de ruído, é um
 * campo de alturas. O nível 0,5 é o mar: o que passa dele vira ilha. Nota alta
 * significa morro mais alto e costa mais distante naquela direção.
 *
 * Este módulo não toca no DOM: serve ao navegador (canvas) e ao build (SVG).
 */

export const EIXOS = [
  { id: "exploracao", nome: "Exploração", ang: -90 },
  { id: "liberdade", nome: "Liberdade", ang: -30 },
  { id: "competitivo", nome: "Competitivo", ang: 30 },
  { id: "dificuldade", nome: "Dificuldade", ang: 90 },
  { id: "historia", nome: "História", ang: 150 },
  { id: "nostalgia", nome: "Nostalgia", ang: 210 }
];

/* Quanto maior a nota, mais alto o morro E mais longe do centro ele fica: a costa
 * se estica na direção do que o jogo tem de forte, como num gráfico de radar. */
const RAIO_BASE = 0.16, RAIO_POR_PONTO = 0.085;
const SIGMA = 0.17;               // largura de cada morro
const SIGMA_CENTRO = 0.24;
const GANHO = 0.82;               // altura por ponto de nota
const MACICO = 0.62;              // ilhota central, que existe mesmo com tudo zerado
export const NIVEL_MAR = 0.5;

/* Onde fica o cume de um eixo, dado o valor (0 a 5). Em unidades do mundo. */
export function cume(indice, valor) {
  const r = RAIO_BASE + RAIO_POR_PONTO * valor;
  const a = (EIXOS[indice].ang * Math.PI) / 180;
  return [Math.cos(a) * r, Math.sin(a) * r];
}
/* A cor do cume acompanha a nota: nota 1 mal passa do primeiro nível, nota 5 chega ao último. */
export const NIVEIS = [0.5, 1.3, 2.1, 2.9, 3.7];
const MEIO_NIVEL = 0.4;

export const TINTAS = {
  dia: {
    raso: "#E7F0EC",
    marLinha: "rgba(15, 42, 58, 0.15)",
    terra: ["#BFD4A4", "#DADFA9", "#EEDDA6", "#E0BC7C", "#C4905F"],
    curva: "rgba(84, 56, 30, 0.42)",
    costa: "#0F2A3A"
  },
  noite: {
    raso: "rgba(241, 232, 207, 0.05)",
    marLinha: "rgba(241, 232, 207, 0.1)",
    terra: ["#15404C", "#1D4D56", "#285C61", "#366D6B", "#4A8076"],
    curva: "rgba(241, 232, 207, 0.34)",
    costa: "#F1E8CF"
  }
};

export function valoresDe(atributos) {
  return EIXOS.map((e) => atributos[e.id] || 0);
}

export function sementeDe(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 9973;
}

function acaso(ix, iy, s) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(s, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function ruido(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = acaso(ix, iy, s), b = acaso(ix + 1, iy, s);
  const c = acaso(ix, iy + 1, s), d = acaso(ix + 1, iy + 1, s);
  const cima = a + (b - a) * fx, baixo = c + (d - c) * fx;
  return (cima + (baixo - cima) * fy) * 2 - 1;
}

/* Malha de gx por gy nós cobrindo o retângulo [x0,x1] x [y0,y1] do mundo. */
export function criarMalha(gx, gy, x0, x1, y0, y1) {
  const n = gx * gy;
  const xs = new Float32Array(n), ys = new Float32Array(n);
  for (let j = 0; j < gy; j++) {
    for (let i = 0; i < gx; i++) {
      xs[j * gx + i] = x0 + ((x1 - x0) * i) / (gx - 1);
      ys[j * gx + i] = y0 + ((y1 - y0) * j) / (gy - 1);
    }
  }
  return {
    gx, gy, n, xs, ys, x0, x1, y0, y1,
    h: new Float32Array(n),
    _a: new Int32Array(n * 4), _b: new Int32Array(n * 4),
    _e1: new Int32Array(n * 2), _e2: new Int32Array(n * 2),
    _u: new Uint8Array(n * 4)
  };
}

/* Preenche malha.h.
 *   valores  seis notas (0 a 5), na ordem de EIXOS
 *   emersao  0 = tudo submerso, 1 = ilha inteira
 *   tempo    desloca o ruído (a maré)
 *   toque    {x, y, forca} morro extra sob o ponteiro
 */
const _cx = new Float64Array(6), _cy = new Float64Array(6), _alt = new Float64Array(6);

export function calcular(malha, valores, opc = {}) {
  const { semente = 1, emersao = 1, tempo = 0, amplitude = 0.33, toque = null } = opc;
  const { gx, gy, n, xs, ys, h } = malha;
  const dx = tempo * 0.045, dy = tempo * -0.03;
  const k1 = -1 / (2 * SIGMA * SIGMA), kc = -1 / (2 * SIGMA_CENTRO * SIGMA_CENTRO);
  for (let e = 0; e < 6; e++) {
    const c = cume(e, valores[e]);
    _cx[e] = c[0]; _cy[e] = c[1]; _alt[e] = GANHO * valores[e];
  }
  for (let k = 0; k < n; k++) {
    const x = xs[k], y = ys[k];
    let v = MACICO * Math.exp((x * x + y * y) * kc);
    for (let e = 0; e < 6; e++) {
      const ex = x - _cx[e], ey = y - _cy[e];
      const d2 = ex * ex + ey * ey;
      if (d2 < 0.55) v += _alt[e] * Math.exp(d2 * k1);
    }
    v *= emersao;
    v += amplitude * (0.66 * ruido(x * 2.1 + dx, y * 2.1 + dy, semente) +
                      0.34 * ruido(x * 5.3 - dy, y * 5.3 + dx, semente + 31));
    if (toque && toque.forca > 0.001) {
      const tx = x - toque.x, ty = y - toque.y;
      v += toque.forca * Math.exp(-(tx * tx + ty * ty) / 0.03);
    }
    h[k] = v;
  }
  // a borda fica sempre no fundo: assim toda curva de nível se fecha dentro da malha
  for (let i = 0; i < gx; i++) { h[i] = -9; h[(gy - 1) * gx + i] = -9; }
  for (let j = 0; j < gy; j++) { h[j * gx] = -9; h[j * gx + gx - 1] = -9; }
  return malha;
}

/* Curvas de nível por "marching squares", com os segmentos já ligados em anéis.
 * Devolve uma lista de anéis; cada anel é [i0, j0, i1, j1, ...] em coordenadas da malha. */
export function aneis(malha, nivel) {
  const { gx, gy, h, _a: sa, _b: sb, _e1: e1, _e2: e2, _u: usado } = malha;
  let ns = 0;
  e1.fill(-1); e2.fill(-1);

  function seg(p, q) {
    sa[ns] = p; sb[ns] = q;
    if (e1[p] < 0) e1[p] = ns; else e2[p] = ns;
    if (e1[q] < 0) e1[q] = ns; else e2[q] = ns;
    ns++;
  }

  for (let j = 0; j < gy - 1; j++) {
    for (let i = 0; i < gx - 1; i++) {
      const k = j * gx + i;
      const a = h[k], b = h[k + 1], c = h[k + gx + 1], d = h[k + gx];
      const caso = (a > nivel ? 8 : 0) | (b > nivel ? 4 : 0) | (c > nivel ? 2 : 0) | (d > nivel ? 1 : 0);
      if (caso === 0 || caso === 15) continue;
      const T = 2 * k, B = 2 * (k + gx), L = 2 * k + 1, R = 2 * (k + 1) + 1;
      switch (caso) {
        case 1: case 14: seg(L, B); break;
        case 2: case 13: seg(B, R); break;
        case 3: case 12: seg(L, R); break;
        case 4: case 11: seg(T, R); break;
        case 6: case 9: seg(T, B); break;
        case 7: case 8: seg(T, L); break;
        case 5:
          if ((a + b + c + d) / 4 > nivel) { seg(T, L); seg(B, R); } else { seg(T, R); seg(L, B); }
          break;
        case 10:
          if ((a + b + c + d) / 4 > nivel) { seg(T, R); seg(L, B); } else { seg(T, L); seg(B, R); }
          break;
      }
    }
  }

  usado.fill(0, 0, ns);
  const lista = [];
  function ponto(e, anel) {
    const k = e >> 1, i = k % gx, j = (k / gx) | 0;
    if (e & 1) { const p = h[k], q = h[k + gx]; anel.push(i, j + (nivel - p) / (q - p)); }
    else { const p = h[k], q = h[k + 1]; anel.push(i + (nivel - p) / (q - p), j); }
  }
  for (let s = 0; s < ns; s++) {
    if (usado[s]) continue;
    const anel = [];
    let atual = s, borda = sb[s];
    ponto(sa[s], anel);
    for (;;) {
      usado[atual] = 1;
      ponto(borda, anel);
      const prox = e1[borda] === atual ? e2[borda] : e1[borda];
      if (prox < 0 || usado[prox]) break;
      atual = prox;
      borda = sa[prox] === borda ? sb[prox] : sa[prox];
    }
    if (anel.length >= 8) lista.push(anel);
  }
  return lista;
}

/* ---------- desenho em canvas ---------- */

/* Traça os anéis como curvas suaves: os vértices viram pontos de controle e a
 * curva passa pelos pontos médios. t = {ox, oy, sx, sy} leva malha -> pixels. */
export function tracar(ctx, lista, t) {
  for (const anel of lista) {
    const n = anel.length / 2;
    const px = (q) => t.ox + anel[(q % n) * 2] * t.sx;
    const py = (q) => t.oy + anel[(q % n) * 2 + 1] * t.sy;
    ctx.moveTo((px(n - 1) + px(0)) / 2, (py(n - 1) + py(0)) / 2);
    for (let q = 0; q < n; q++) {
      ctx.quadraticCurveTo(px(q), py(q), (px(q) + px(q + 1)) / 2, (py(q) + py(q + 1)) / 2);
    }
    ctx.closePath();
  }
}

/* Desenha a malha já calculada.
 *   mar        desenha as curvas batimétricas ao redor
 *   traco      espessura base das linhas, em pixels do canvas
 *   contorno   se definido, não preenche: só linhas nessa cor (para sobrepor ilhas)
 */
export function desenhar(ctx, malha, t, tinta, opc = {}) {
  const { mar = true, traco = 1, contorno = null, preenchimento = null } = opc;
  ctx.lineJoin = "round";

  if (mar) {
    ctx.strokeStyle = tinta.marLinha;
    ctx.lineWidth = traco;
    for (const nivel of [-0.16, 0.0, 0.16]) {
      ctx.beginPath();
      tracar(ctx, aneis(malha, nivel), t);
      ctx.stroke();
    }
    ctx.fillStyle = tinta.raso;
    ctx.beginPath();
    tracar(ctx, aneis(malha, 0.32), t);
    ctx.fill("evenodd");
  }

  const porNivel = NIVEIS.map((nivel) => aneis(malha, nivel));

  if (contorno) {
    if (preenchimento) {
      ctx.fillStyle = preenchimento;
      for (const lista of porNivel) {
        if (!lista.length) continue;
        ctx.beginPath(); tracar(ctx, lista, t); ctx.fill("evenodd");
      }
    }
    ctx.strokeStyle = contorno;
    porNivel.forEach((lista, i) => {
      if (!lista.length) return;
      ctx.lineWidth = i === 0 ? traco * 2 : traco;
      ctx.beginPath(); tracar(ctx, lista, t); ctx.stroke();
    });
    return;
  }

  porNivel.forEach((lista, i) => {
    if (!lista.length) return;
    ctx.fillStyle = tinta.terra[i];
    ctx.beginPath(); tracar(ctx, lista, t); ctx.fill("evenodd");
  });

  ctx.strokeStyle = tinta.curva;
  ctx.lineWidth = traco * 0.75;
  for (let i = 0; i < NIVEIS.length - 1; i++) {
    const lista = aneis(malha, NIVEIS[i] + MEIO_NIVEL);
    if (!lista.length) continue;
    ctx.beginPath(); tracar(ctx, lista, t); ctx.stroke();
  }
  ctx.lineWidth = traco * 1.1;
  for (let i = 1; i < NIVEIS.length; i++) {
    if (!porNivel[i].length) continue;
    ctx.beginPath(); tracar(ctx, porNivel[i], t); ctx.stroke();
  }
  ctx.strokeStyle = tinta.costa;
  ctx.lineWidth = traco * 1.7;
  ctx.beginPath(); tracar(ctx, porNivel[0], t); ctx.stroke();
}

/* ---------- saída em SVG (usada pelo build) ---------- */

function caminho(lista, t) {
  let d = "";
  const r = (v) => Math.round(v);
  for (const anel of lista) {
    const total = anel.length / 2;
    const passo = total >= 24 ? 2 : 1;
    const xs = [], ys = [];
    for (let q = 0; q < total; q += passo) {
      xs.push(t.ox + anel[q * 2] * t.sx);
      ys.push(t.oy + anel[q * 2 + 1] * t.sy);
    }
    const n = xs.length;
    const mx = (q) => r((xs[q % n] + xs[(q + 1) % n]) / 2), my = (q) => r((ys[q % n] + ys[(q + 1) % n]) / 2);
    d += `M${mx(n - 1)} ${my(n - 1)}`;
    for (let q = 0; q < n; q++) d += `Q${r(xs[q])} ${r(ys[q])} ${mx(q)} ${my(q)}`;
    d += "Z";
  }
  return d;
}

export const MUNDO = 1.08;
const MALHA_SVG = 60;
const LADO_SVG = 480;

export function malhaQuadrada(g = MALHA_SVG) {
  return criarMalha(g, g, -MUNDO, MUNDO, -MUNDO, MUNDO);
}

/* variante: "dia" (cores de altitude), "noite" (linhas claras sobre mar escuro)
 * ou uma cor (ilha em uma tinta só, para sobreposições). */
export function svgIlha(valores, semente, variante = "dia", malha = malhaQuadrada()) {
  calcular(malha, valores, { semente });
  const t = { ox: 0, oy: 0, sx: LADO_SVG / (malha.gx - 1), sy: LADO_SVG / (malha.gy - 1) };
  const porNivel = NIVEIS.map((nivel) => caminho(aneis(malha, nivel), t));
  let corpo = "";

  if (variante === "dia" || variante === "noite") {
    const tinta = TINTAS[variante];
    corpo += `<path d="${caminho(aneis(malha, 0.32), t)}" fill="${tinta.raso}" fill-rule="evenodd"/>`;
    porNivel.forEach((d, i) => { if (d) corpo += `<path d="${d}" fill="${tinta.terra[i]}" fill-rule="evenodd"/>`; });
    let meias = "";
    for (let i = 0; i < NIVEIS.length - 1; i++) meias += caminho(aneis(malha, NIVEIS[i] + MEIO_NIVEL), t);
    corpo += `<path d="${meias}" fill="none" stroke="${tinta.curva}" stroke-width="1.5"/>`;
    corpo += `<path d="${porNivel.slice(1).join("")}" fill="none" stroke="${tinta.curva}" stroke-width="2.2"/>`;
    corpo += `<path d="${porNivel[0]}" fill="none" stroke="${tinta.costa}" stroke-width="3.4" stroke-linejoin="round"/>`;
  } else {
    porNivel.forEach((d) => { if (d) corpo += `<path d="${d}" fill="${variante}" fill-opacity="0.13" fill-rule="evenodd"/>`; });
    corpo += `<path d="${porNivel.slice(1).join("")}" fill="none" stroke="${variante}" stroke-width="2"/>`;
    corpo += `<path d="${porNivel[0]}" fill="none" stroke="${variante}" stroke-width="4" stroke-linejoin="round"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LADO_SVG} ${LADO_SVG}">${corpo}</svg>`;
}

/* ---------- semelhança entre perfis ---------- */

/* Correlação entre os formatos (onde cada ilha é alta e baixa), suavizada pela
 * distância direta entre as notas. Devolve de -1 a 1. */
export function encaixe(u, g) {
  const n = u.length;
  let mu = 0, mg = 0;
  for (let i = 0; i < n; i++) { mu += u[i]; mg += g[i]; }
  mu /= n; mg /= n;
  let num = 0, du = 0, dg = 0, dist = 0;
  for (let i = 0; i < n; i++) {
    num += (u[i] - mu) * (g[i] - mg);
    du += (u[i] - mu) ** 2;
    dg += (g[i] - mg) ** 2;
    dist += (u[i] - g[i]) ** 2;
  }
  const correlacao = du > 0 && dg > 0 ? num / Math.sqrt(du * dg) : 0;
  const proximidade = 1 - Math.sqrt(dist / n) / 5;
  return 0.7 * correlacao + 0.3 * (proximidade * 2 - 1);
}
