/* O plano de caçada, sem tocar na página. Recebe os alvos (números das espécies) e as regras de spawn
 * (js/dados/spawns.js) e devolve os biomas em ordem, do que rende mais alvos para o que rende menos.
 *
 * `spawns[n]` é a lista de regras da espécie: [raridade, [biomas], [contextos], [nível mínimo, máximo], hora, [condições], forma],
 * com raridade de 0 (comum) a 3 (ultrarrara) e os biomas como posições na lista de nomes. */

const PESO = [8, 4, 2, 1];                           // um alvo comum vale mais na hora de escolher para onde ir

/* Devolve { lugares: [{ bioma, acha: [{ n, regras }], falta: [n] }], semLugar: [n] }.
 * Em `acha`, as regras de cada alvo naquele bioma vêm da mais comum para a mais rara. */
export function planejar(alvos, spawns) {
  const unicos = [...new Set(alvos.map(Number))].filter((n) => Number.isInteger(n) && n > 0);
  const porBioma = new Map(), semLugar = [];
  for (const n of unicos) {
    const regras = spawns[n] ?? [];
    if (!regras.length) { semLugar.push(n); continue; }
    for (const regra of regras) {
      for (const bioma of regra[1]) {
        if (!porBioma.has(bioma)) porBioma.set(bioma, new Map());
        const doAlvo = porBioma.get(bioma);
        if (!doAlvo.has(n)) doAlvo.set(n, []);
        doAlvo.get(n).push(regra);
      }
    }
  }
  const lugares = [...porBioma].map(([bioma, doAlvo]) => {
    const acha = [...doAlvo].map(([n, regras]) => ({ n, regras: [...regras].sort((a, b) => a[0] - b[0]) })).sort((a, b) => a.regras[0][0] - b.regras[0][0] || a.n - b.n);
    return { bioma, acha, falta: unicos.filter((n) => !doAlvo.has(n)), valor: acha.reduce((s, a) => s + PESO[a.regras[0][0]], 0) };
  });
  lugares.sort((a, b) => b.acha.length - a.acha.length || b.valor - a.valor || a.bioma - b.bioma);
  return { lugares: lugares.map(({ valor, ...resto }) => resto), semLugar };
}

/* A lista de alvos vinda do endereço ou do armazenamento: fica só o que existe, sem repetir. */
export function lerAlvos(valor, existe, limite = 24) {
  const pedacos = Array.isArray(valor) ? valor : String(valor ?? "").split(",");
  const alvos = [];
  for (const p of pedacos) {
    const n = Number(String(p).trim());
    if (Number.isInteger(n) && existe(n) && !alvos.includes(n)) alvos.push(n);
    if (alvos.length === limite) break;
  }
  return alvos;
}
