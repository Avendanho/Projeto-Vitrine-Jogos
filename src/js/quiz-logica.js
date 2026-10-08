/* As regras do quiz diário, sem tocar na página: que dia é, qual é o Pokémon do dia e o que cada
 * palpite revela. Rodam igual no Node, para os testes. */

export const MODOS = ["ficha", "gravura"];
export const TENTATIVAS = { ficha: 8, gravura: 6 };
export const PRIMEIRO_DIA = 20734;                   // 8 de outubro de 2026: o enigma nº 1
/* quanto de tinta a gravura mostra antes de cada palpite, do primeiro ao último */
export const FORCAS = [0.16, 0.28, 0.42, 0.58, 0.78, 1];

/* O dia do quiz vira à meia-noite de Brasília (UTC-3), igual para todo mundo. */
export const diaDoQuiz = (ms) => Math.floor((ms - 3 * 3600e3) / 864e5);

/* Uma ordem fixa das espécies para cada modo: embaralhada uma vez, percorrida dia a dia.
 * Dentro de um ciclo de `total` dias ninguém se repete. */
const ordens = new Map();
function ordem(modo, total) {
  const chave = `${modo}:${total}`;
  if (ordens.has(chave)) return ordens.get(chave);
  let s = [...`pokeatlas-${modo}`].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 17) >>> 0;
  const acaso = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const lista = Array.from({ length: total }, (_, i) => i);
  for (let i = total - 1; i > 0; i--) { const j = Math.floor(acaso() * (i + 1)); [lista[i], lista[j]] = [lista[j], lista[i]]; }
  ordens.set(chave, lista);
  return lista;
}
/* A posição, na lista de espécies, do Pokémon do dia. */
export const alvoDoDia = (dia, modo, total) => ordem(modo, total)[((dia % total) + total) % total];

const numero = (campo, palpite, alvo) => ({ campo, valor: palpite, estado: palpite === alvo ? "certo" : "errado", seta: palpite === alvo ? null : alvo > palpite ? "mais" : "menos" });

/* O que um palpite revela. palpite e alvo são espécies já com nomes (especies-logica.js: especie()). */
export function comparar(palpite, alvo) {
  const p2 = palpite.tipos[1] ?? null, a2 = alvo.tipos[1] ?? null;
  return [
    { campo: "tipo1", valor: palpite.tipos[0], estado: palpite.tipos[0] === alvo.tipos[0] ? "certo" : alvo.tipos.includes(palpite.tipos[0]) ? "parcial" : "errado", seta: null },
    { campo: "tipo2", valor: p2, estado: p2 === a2 ? "certo" : p2 && alvo.tipos.includes(p2) ? "parcial" : "errado", seta: null },
    numero("geracao", palpite.geracao, alvo.geracao),
    { campo: "cor", valor: palpite.cor, estado: palpite.cor === alvo.cor ? "certo" : "errado", seta: null },
    numero("estagio", palpite.estagio, alvo.estagio),
    numero("altura", palpite.altura, alvo.altura),
    numero("peso", palpite.peso, alvo.peso)
  ];
}

/* A sequência de dias com acerto: cresce se o último acerto foi ontem, recomeça se houve um dia em branco. */
export function novaSequencia(sequencia, dia) {
  if (sequencia?.dia === dia) return sequencia;
  return { dia, n: sequencia?.dia === dia - 1 ? sequencia.n + 1 : 1 };
}
export const sequenciaViva = (sequencia, dia) => (sequencia && sequencia.dia >= dia - 1 ? sequencia.n : 0);

/* O resultado para copiar e mandar a alguém, sem dizer quem era o Pokémon. */
const QUADRO = { certo: "🟩", parcial: "🟨", errado: "⬜" };
export function resultadoEmTexto(linhas, dia, modo, venceu) {
  const titulo = `PokéAtlas, quiz nº ${dia - PRIMEIRO_DIA + 1} (${modo}): ${venceu ? linhas.length : "X"}/${TENTATIVAS[modo]}`;
  const grade = modo === "ficha"
    ? linhas.map((pistas) => pistas.map((p) => (p.seta === "mais" ? "🔼" : p.seta === "menos" ? "🔽" : QUADRO[p.estado])).join(""))
    : linhas.map((acertou) => (acertou ? "🟩" : "⬜"));
  return [titulo, ...(modo === "ficha" ? grade : [grade.join("")])].join("\n");
}
