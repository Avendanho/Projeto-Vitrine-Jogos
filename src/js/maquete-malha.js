/* A malha de uma maquete de blocos. Serve aos dois lados: scripts/maquetes.mjs desenha com ela
 * a imagem parada, e src/js/maquete.js desenha o modelo que gira no navegador.
 *
 * Uma maquete é { t: [largura, altura, fundo], p: [[corDeCima, corDoLado, forma], ...], v: [x, y, z, p, ...] }.
 * A forma diz que caixas o bloco ocupa dentro da célula dele. */

const LAJE_BAIXA = [0, 0, 0, 1, 0.5, 1], LAJE_ALTA = [0, 0.5, 0, 1, 1, 1];
const METADES = [[0, 0, 0, 1, 1, 0.5], [0.5, 0, 0, 1, 1, 1], [0, 0, 0.5, 1, 1, 1], [0, 0, 0, 0.5, 1, 1]];   // norte, leste, sul, oeste
const degrau = (lado, alto) => { const m = [...METADES[lado]]; if (alto) m[1] = 0.5; else m[4] = 0.5; return m; };
export const FORMAS = [
  [[0, 0, 0, 1, 1, 1]],                              // 0 cubo
  [LAJE_BAIXA],                                      // 1 laje de baixo
  [LAJE_ALTA],                                       // 2 laje de cima
  [[0.36, 0, 0.36, 0.64, 1, 0.64]],                  // 3 poste: cerca, muro, grade, corrente
  [[0.24, 0, 0.24, 0.76, 0.72, 0.76]],               // 4 planta
  [[0, 0, 0, 1, 0.12, 1]],                           // 5 tapete: neve fina, placa, vitória-régia
  [[0, 0, 0, 1, 0.9, 1]],                            // 6 água
  [[0, 0, 0, 1, 1, 1]],                              // 7 vidro e gelo
  ...[0, 1, 2, 3].map((l) => [LAJE_BAIXA, degrau(l, true)]),    // 8 a 11 escada subindo para norte, leste, sul, oeste
  ...[0, 1, 2, 3].map((l) => [LAJE_ALTA, degrau(l, false)]),    // 12 a 15 escada invertida
  [[0.28, 0, 0.28, 0.72, 0.5, 0.72]],                // 16 objeto pequeno: lanterna, vaso, cabeça
  [[0, 0, 0, 1, 1, 1]]                               // 17 água com mais água por cima
];
export const TRANSLUCIDA = (forma) => forma === 6 || forma === 7 || forma === 17;

/* as seis faces de uma caixa: eixo, sentido, luz fixa (como o jogo sombreia cada lado) e os quatro cantos */
const FACES = [
  { e: 1, s: 1, luz: 1, c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },       // cima
  { e: 1, s: -1, luz: 0.5, c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },    // baixo
  { e: 2, s: -1, luz: 0.8, c: [[1, 1, 0], [0, 1, 0], [0, 0, 0], [1, 0, 0]] },    // norte
  { e: 2, s: 1, luz: 0.8, c: [[0, 1, 1], [1, 1, 1], [1, 0, 1], [0, 0, 1]] },     // sul
  { e: 0, s: -1, luz: 0.64, c: [[0, 1, 0], [0, 1, 1], [0, 0, 1], [0, 0, 0]] },   // oeste
  { e: 0, s: 1, luz: 0.64, c: [[1, 1, 1], [1, 1, 0], [1, 0, 0], [1, 0, 1]] }     // leste
];

/* Devolve as faces visíveis: { n, pos (12 números por face), cor (4 bytes por face), vidro (índice da primeira face translúcida) }. */
export function malhaDaMaquete(m) {
  const [W, H] = m.t, total = m.v.length / 4;
  const chave = (x, y, z) => x + W * (y + H * z);
  const cheio = new Map();                           // célula -> 1 cubo opaco, 2 cubo translúcido
  for (let i = 0; i < total; i++) {
    const forma = m.p[m.v[i * 4 + 3]][2];
    if (forma === 0) cheio.set(chave(m.v[i * 4], m.v[i * 4 + 1], m.v[i * 4 + 2]), 1);
    else if (forma === 7) cheio.set(chave(m.v[i * 4], m.v[i * 4 + 1], m.v[i * 4 + 2]), 2);
    else if (forma === 17) cheio.set(chave(m.v[i * 4], m.v[i * 4 + 1], m.v[i * 4 + 2]), 3);
  }
  const solidas = { pos: [], cor: [] }, vidros = { pos: [], cor: [] };
  for (let i = 0; i < total; i++) {
    const x = m.v[i * 4], y = m.v[i * 4 + 1], z = m.v[i * 4 + 2], [topo, lado, forma] = m.p[m.v[i * 4 + 3]];
    const vidro = TRANSLUCIDA(forma), destino = vidro ? vidros : solidas;
    const proprio = cheio.get(chave(x, y, z));
    const ruido = 0.94 + 0.09 * ((((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0) % 97) / 97;   // cada bloco um pouco diferente do vizinho
    for (const caixa of FORMAS[forma] || FORMAS[0]) {
      for (const f of FACES) {
        const borda = f.s > 0 ? caixa[f.e + 3] === 1 : caixa[f.e] === 0;
        if (borda) {
          const viz = cheio.get(chave(x + (f.e === 0 ? f.s : 0), y + (f.e === 1 ? f.s : 0), z + (f.e === 2 ? f.s : 0)));
          const fora = (f.e === 0 && (x + f.s < 0 || x + f.s >= W)) || (f.e === 1 && (y + f.s < 0 || y + f.s >= H));
          if (!fora && (viz === 1 || (vidro && viz === proprio))) continue;      // face encostada em outro bloco: ninguém vê
        }
        const base = f.e === 1 && f.s > 0 ? topo : lado, luz = f.luz * ruido;
        for (const c of f.c) destino.pos.push(x + caixa[c[0] * 3], y + caixa[c[1] * 3 + 1], z + caixa[c[2] * 3 + 2]);
        destino.cor.push(Math.min(255, ((base >> 16) & 255) * luz), Math.min(255, ((base >> 8) & 255) * luz), Math.min(255, (base & 255) * luz), vidro ? (forma === 7 ? 120 : 150) : 255);
      }
    }
  }
  return { n: (solidas.pos.length + vidros.pos.length) / 12, vidro: solidas.pos.length / 12, pos: new Float32Array([...solidas.pos, ...vidros.pos]), cor: new Uint8Array([...solidas.cor, ...vidros.cor]) };
}
