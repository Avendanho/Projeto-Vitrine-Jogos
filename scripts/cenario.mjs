/* Cenários desenhados pelo próprio atlas: perfis de elevação das regiões, o terreno das cartas
 * e a régua de anos. Tudo gerado em SVG na hora do build. */
import { ruido } from "../src/js/ruido.js";
import { EIXOS } from "../src/js/hexagono.js";

/* As cores das cartas: o mapa da região como ele aparece nos jogos, com mar azul e a terra subindo do verde
 * ao marrom. São as mesmas de --terra-1 a --terra-5 em src/pokedex.css (a legenda da página de regiões). */
const TINTA = "#20232B";
const CARTA = { raso: "#D5EEFB", terra: ["#A8D98A", "#CDE39A", "#F0E29C", "#E3B873", "#C08A5C"], curva: "rgba(74, 52, 30, 0.4)", costa: TINTA, neve: "#FFFFFF" };

function ondas(x, semente, aspereza) {
  return 0.55 * ruido(x * 2.2, 0.5, semente) +
         0.28 * ruido(x * 5.6, 1.5, semente + 3) +
         aspereza * 0.17 * ruido(x * 15, 2.5, semente + 7);
}

function sino(x, centro, largura) {
  const d = (x - centro) / largura;
  return Math.exp(-d * d);
}

/* Altura do terreno (0 a 1) em x (0 a 1) para uma camada do perfil. */
function terreno(x, c, camada) {
  const recuo = [1, 0.7, 0.42][camada];
  // regiões baixas ainda ocupam boa parte da folha; as altas chegam perto do topo
  const porte = 0.5 + 0.5 * c.altura;
  let y = (0.52 + 0.4 * ondas(x + camada * 3.1, c.semente + camada * 17, c.aspereza)) * porte * recuo;
  if (camada === 0) {
    const m = c.marcoX;
    if (c.marco === "cone") y = Math.max(y, 0.9 * c.altura * Math.pow(sino(x, m, 0.11), 0.8));
    if (c.marco === "pico") y = Math.max(y, 0.98 * c.altura * Math.pow(Math.max(0, 1 - Math.abs(x - m) / 0.17), 1.5) + 0.05 * ruido(x * 40, 3, c.semente));
    if (c.marco === "vulcao") y = Math.max(y, Math.min(0.9 * c.altura * sino(x, m, 0.12), 0.66 * c.altura - 0.05 * sino(x, m, 0.022)));
    if (c.marco === "cratera") y = Math.max(y, 0.78 * c.altura * (sino(x, m - 0.1, 0.07) + sino(x, m + 0.1, 0.07)) + 0.24 * c.altura * sino(x, m, 0.2));
  }
  if (c.mar) {
    // o terreno afunda antes da borda direita: sobra mar aberto
    const borda = 1 - c.mar;
    y *= 1 - Math.min(1, Math.max(0, (x - borda + 0.16) / 0.16)) ** 2;
  }
  return Math.max(0, y);
}

function construcoes(c, L, A, chao) {
  const x = c.marcoX * L;
  if (c.marco === "agulha") {
    return `<path d="M${x - 9} ${chao}L${x - 3} ${chao - A * 0.5}L${x - 1.5} ${chao - A * 0.5}L${x} ${chao - A * 0.82}L${x + 1.5} ${chao - A * 0.5}L${x + 3} ${chao - A * 0.5}L${x + 9} ${chao}Z" fill="${TINTA}"/>`;
  }
  if (c.marco === "torre") {
    // pagode: três andares, cada um com beiral mais largo que o corpo
    let d = "";
    for (let k = 0; k < 3; k++) {
      const y = chao - k * 27, w = 26 - k * 6;
      d += `M${x - w + 7} ${y}v-15h${(w - 7) * 2}v15Z`;
      d += `M${x - w - 9} ${y - 13}L${x - w + 5} ${y - 25}L${x + w - 5} ${y - 25}L${x + w + 9} ${y - 13}Z`;
    }
    d += `M${x - 1.5} ${chao - 79}h3v-24h-3Z`;
    return `<path d="${d}" fill="${TINTA}"/>`;
  }
  if (c.marco === "cidade") {
    let d = "";
    for (let k = -7; k <= 7; k++) {
      const alto = 20 + 62 * (0.5 + 0.5 * ruido(k * 1.7, 9, c.semente)) * Math.exp(-(k * k) / 34);
      const w = 9 + 5 * (0.5 + 0.5 * ruido(k * 2.3, 4, c.semente));
      d += `M${(x + k * 15 - w / 2).toFixed(1)} ${chao}v${(-alto).toFixed(1)}h${w.toFixed(1)}v${alto.toFixed(1)}Z`;
    }
    return `<path d="${d}" fill="${TINTA}"/>`;
  }
  return "";
}

/* Perfil de elevação de uma região: três cordilheiras sobrepostas e o mar. */
export function perfilRegiao(c) {
  const L = 1000, A = 200, chao = 214, passos = 125;
  const cores = [CARTA.terra[2], CARTA.terra[1], CARTA.terra[0]];
  let svg = "";
  for (let camada = 0; camada < 3; camada++) {
    // o traçado começa e termina fora do quadro, para o contorno não riscar as laterais
    let d = `M-6 ${chao + 4}`;
    for (let p = 0; p <= passos; p++) {
      const x = p / passos;
      d += `L${Math.round(x * L)} ${(chao - terreno(x, c, camada) * A).toFixed(1)}`;
    }
    d += `L${L + 6} ${chao + 4}Z`;
    const frente = camada === 2;
    svg += `<path d="${d}" fill="${cores[camada]}" stroke="${TINTA}" stroke-width="${frente ? 1.6 : 1}" stroke-opacity="${frente ? 1 : 0.55}" stroke-linejoin="round"/>`;
    if (c.neve && camada === 0) {
      svg += `<clipPath id="neve-${c.semente}"><rect x="0" y="0" width="${L}" height="${Math.round(chao - A * 0.56 * c.altura)}"/></clipPath>`;
      svg += `<path d="${d}" fill="${CARTA.neve}" stroke="${TINTA}" stroke-opacity="0.55" clip-path="url(#neve-${c.semente})"/>`;
    }
    if (camada === 1) svg += construcoes(c, L, A, chao - terreno(c.marcoX, c, 2) * A + 4);
  }
  svg += `<rect x="0" y="${chao}" width="${L}" height="26" fill="${CARTA.raso}"/>`;
  svg += `<path d="M0 ${chao}H${L}" stroke="${TINTA}" stroke-width="1.6"/>`;
  svg += `<path d="M0 ${chao + 9}H${L}M0 ${chao + 17}H${L}" stroke="${TINTA}" stroke-opacity="0.2" stroke-dasharray="26 14"/>`;
  return `<svg class="perfil" viewBox="0 0 ${L} 240" preserveAspectRatio="none" aria-hidden="true" focusable="false">${svg}</svg>`;
}

/* Posição (em %) de cada rótulo de eixo em volta de um quadrado. */
export function posicoesDosEixos(raio = 50) {
  return EIXOS.map((e) => {
    const a = (e.ang * Math.PI) / 180;
    return { ...e, x: 50 + Math.cos(a) * raio, y: 50 + Math.sin(a) * raio };
  });
}

/* Régua de anos: um traço por ano, um ponto por jogo. */
export function reguaDeAnos(jogos, anoFinal) {
  const anoInicial = Math.min(...jogos.map((j) => j.ano));
  const anos = anoFinal - anoInicial;
  const L = 1000, base = 96, passo = L / anos;
  let svg = `<path d="M0 ${base}H${L}" stroke="currentColor" stroke-width="1.5"/>`;
  for (let a = anoInicial; a <= anoFinal; a++) {
    const x = (a - anoInicial) * passo;
    const cheio = a === anoInicial || a === anoFinal || a % 5 === 0;
    svg += `<path d="M${x.toFixed(1)} ${base}v${cheio ? 14 : 7}" stroke="currentColor" stroke-width="${cheio ? 1.5 : 1}"/>`;
    if (cheio) svg += `<text x="${x.toFixed(1)}" y="${base + 34}" text-anchor="${a === anoInicial ? "start" : a === anoFinal ? "end" : "middle"}">${a}</text>`;
  }
  const pilha = {};
  for (const j of jogos) {
    const n = (pilha[j.ano] = (pilha[j.ano] || 0) + 1);
    const x = (j.ano - anoInicial) * passo, y = base - 2 - n * 17;
    svg += j.tipo === "derivado"
      ? `<circle cx="${x.toFixed(1)}" cy="${y}" r="5" fill="none" stroke="currentColor" stroke-width="1.6"/>`
      : `<circle cx="${x.toFixed(1)}" cy="${y}" r="6" fill="currentColor"/>`;
  }
  return `<svg class="regua" viewBox="-8 0 ${L + 16} 140" aria-hidden="true" focusable="false">${svg}</svg>`;
}

/* O terreno de uma carta: o traçado de dados/cartas.json nas cores do atlas.
 * Rotas e lugares não entram aqui; quem os desenha é scripts/carta.mjs, por cima. */
export function terrenoSVG(carta) {
  const A = carta.altura, T = CARTA;
  // cada caminho é escrito uma vez e reaproveitado para preencher e para contornar
  const defs = carta.niveis.map((d, i) => `<path id="n${i}" d="${d}"/>`).join("");
  let svg = `<use href="#n0" fill="none" stroke="${T.raso}" stroke-width="30" stroke-linejoin="round"/>`;
  carta.niveis.forEach((d, i) => { if (d) svg += `<use href="#n${i}" fill="${T.terra[i]}" fill-rule="evenodd"/>`; });
  svg += `<g fill="none" stroke="${T.curva}" stroke-width="1.6">${carta.niveis.slice(1).map((d, i) => (d ? `<use href="#n${i + 1}"/>` : "")).join("")}</g>`;
  svg += `<use href="#n0" fill="none" stroke="${T.costa}" stroke-width="3" stroke-linejoin="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${A}"><defs>${defs}</defs>${svg}</svg>`;
}
