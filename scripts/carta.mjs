/* A carta de uma região como peça de página. Todas as páginas usam a mesma
 * peça: o terreno (um SVG só de relevo, em /cartas/) e, por cima, um SVG com as
 * rotas e os lugares, que se desenham quando a carta entra na tela.
 *
 * A caixa tem sempre a proporção da própria carta (--proporcao): quem decide o
 * tamanho é a página, e a carta nunca é cortada nem ganha faixas vazias. */
import { MAPAS, ROTAS } from "../dados/atlas.mjs";
import { CARTAS, esc } from "./base.mjs";

/* As rotas de uma carta, prontas para desenhar e para listar. O traçado vem
 * de cartas.json (mapas antigos) ou dos pontos marcados à mão em ROTAS. */
export function rotasDaCarta(id) {
  const carta = CARTAS[id], mapa = MAPAS[id], A = carta.altura;
  // tamanho com que a carta costuma aparecer na tela, para estimar o que cada rótulo cobre
  const L = carta.proporcao < 0.7 ? 460 : 1100, H = L / carta.proporcao;
  const ocupado = [];
  const lugar = (x, y, nome, lado, marco) => {
    const px = (x / 100) * L, py = (y / 100) * H, w = nome.length * (marco ? 6.6 : 7.4);
    ocupado.push([px - 13, py - 13, px + 13, py + 13]);
    if (lado === "d") ocupado.push([px + 14, py - 9, px + 16 + w, py + 9]);
    if (lado === "e") ocupado.push([px - 16 - w, py - 9, px - 14, py + 9]);
    if (lado === "c") ocupado.push([px - w / 2, py - 31, px + w / 2, py - 13]);
    if (lado === "b") ocupado.push([px - w / 2, py + 13, px + w / 2, py + 31]);
  };
  for (const [nome, x, y, lado] of mapa.cidades) lugar(x, y, nome, lado, false);
  for (const [nome, x, y, lado] of mapa.marcos) lugar(x, y, nome, lado, true);
  for (const [nome, x, y] of mapa.areas || []) {
    const px = (x / 100) * L, py = (y / 100) * H, w = nome.length * 8.6;
    ocupado.push([px - w / 2, py - 10, px + w / 2, py + 10]);
  }
  const sobrepoe = (c) => ocupado.reduce((soma, o) =>
    soma + Math.max(0, Math.min(c[2], o[2]) - Math.max(c[0], o[0])) * Math.max(0, Math.min(c[3], o[3]) - Math.max(c[1], o[1])), 0);

  return (ROTAS[id] || []).map((r, k) => {
    const pts = r.pts || carta.rotas[k];
    const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${(x * 10).toFixed(1)} ${((y * A) / 100).toFixed(1)}`).join("");
    // o número fica sobre a rota, no ponto livre mais próximo do meio dela
    let x = null, y = null;
    if (r.n) {
      const tela = pts.map(([px, py]) => [(px / 100) * L, (py / 100) * H]);
      const trechos = tela.slice(1).map((q, i) => Math.hypot(q[0] - tela[i][0], q[1] - tela[i][1]));
      const total = trechos.reduce((a, b) => a + b, 0);
      const em = (t) => {
        let resto = total * t;
        for (let i = 0; i < trechos.length; i++) {
          if (resto <= trechos[i] || i === trechos.length - 1) {
            const f = trechos[i] ? Math.min(1, resto / trechos[i]) : 0;
            return [tela[i][0] + (tela[i + 1][0] - tela[i][0]) * f, tela[i][1] + (tela[i + 1][1] - tela[i][1]) * f];
          }
          resto -= trechos[i];
        }
      };
      const meiaLargura = 8 + r.n.length * 3.4;
      let melhor = null;
      for (const t of [0.5, 0.42, 0.58, 0.35, 0.65, 0.28, 0.72, 0.2, 0.8, 0.13, 0.87]) {
        const [cx, cy] = em(t);
        const caixa = [cx - meiaLargura, cy - 10, cx + meiaLargura, cy + 10];
        const custo = sobrepoe(caixa);
        if (!melhor || custo < melhor.custo) melhor = { custo, caixa, cx, cy };
        if (custo === 0) break;
      }
      ocupado.push(melhor.caixa);
      x = (melhor.cx / L) * 100; y = (melhor.cy / H) * 100;
    }
    const de = typeof r.de === "string" ? `De ${r.de}` : r.desde.replace(/^A /, "Da ").replace(/^O /, "Do ");
    const para = typeof r.para === "string" ? `a ${r.para}` : `até ${r.ate}`;
    return { n: r.n, nome: r.nome, d, x, y, texto: `${de} ${para}${r.por ? `, por ${r.por}` : ""}` };
  });
}

/* Cidades e marcos de uma carta, numerados na ordem em que aparecem na lista. */
export function lugaresDaCarta(id) {
  const mapa = MAPAS[id];
  return [
    ...mapa.cidades.map((l, i) => ({ nome: l[0], x: l[1], y: l[2], lado: l[3], n: i + 1, tipo: "cidade" })),
    ...mapa.marcos.map((l, i) => ({ nome: l[0], x: l[1], y: l[2], lado: l[3], n: mapa.cidades.length + i + 1, tipo: "marco" }))
  ];
}

let serie = 0;       // cada carta na página precisa de um id próprio para a sua máscara

/* O SVG que vai por cima do terreno. As rotas ficam atrás de uma máscara que
 * percorre o mesmo traçado: é ela que o CSS anima para a rota "se desenhar".
 *   pontos      desenha um ponto para cada cidade e marco (as miniaturas);
 *               a carta grande usa marcadores numerados em HTML no lugar deles
 *   destacavel  cada rota é um traço próprio, que a página pode destacar */
export function tracosDaCarta(id, { pontos = true, destacavel = false } = {}) {
  const carta = CARTAS[id], A = carta.altura;
  const rotas = rotasDaCarta(id);
  const mascara = `m${++serie}`;
  const y = (v) => ((v * A) / 100).toFixed(1);
  let svg = "";
  if (rotas.length) {
    svg += `<mask id="${mascara}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="${A}"><path class="t-revela" pathLength="1" d="${rotas.map((r) => r.d).join("")}"/></mask>`;
    svg += `<g class="t-rotas" mask="url(#${mascara})">${destacavel
      ? rotas.map((r, k) => `<path data-rota="${k}" d="${r.d}"/>`).join("")
      : `<path d="${rotas.map((r) => r.d).join("")}"/>`}</g>`;
  }
  if (pontos) {
    const lugares = lugaresDaCarta(id);
    svg += `<g class="t-lugares">${lugares.map((p, i) => (p.tipo === "cidade"
      ? `<circle class="t-cidade" style="--i:${i}" cx="${(p.x * 10).toFixed(1)}" cy="${y(p.y)}" r="7"/>`
      : `<path class="t-marco" style="--i:${i}" d="M${(p.x * 10).toFixed(1)} ${(Number(y(p.y)) - 9).toFixed(1)}l9 9l-9 9l-9 -9Z"/>`)).join("")}</g>`;
  }
  return `<svg class="carta-tracos" viewBox="0 0 1000 ${A}" aria-hidden="true" focusable="false">${svg}</svg>`;
}

/* A carta em miniatura: terreno, rotas e lugares, na proporção certa.
 *   ligacao  endereço para onde a caixa leva (ela vira um link)
 *   rotulo   texto alternativo */
export function caixaCarta(id, { ligacao = null, rotulo = "", preguica = true } = {}) {
  const carta = CARTAS[id];
  const dentro = `<img class="carta-terreno" src="/cartas/${id}.svg" alt="${esc(rotulo)}" width="1000" height="${carta.altura}"${preguica ? ' loading="lazy" decoding="async"' : ""}>${tracosDaCarta(id)}`;
  const atributos = `class="carta-caixa" data-carta="${id}" style="--proporcao:${carta.proporcao}"`;
  return ligacao ? `<a ${atributos} href="${ligacao}">${dentro}</a>` : `<div ${atributos}>${dentro}</div>`;
}
