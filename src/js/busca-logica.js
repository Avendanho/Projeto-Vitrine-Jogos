/* A ordem dos resultados da busca global, sem tocar na página. O índice (js/dados/busca.js) é uma lista de
 * [tipo, nome, endereço, edição, número], com edição "pokemon" ou "cobblemon" e número só para os Pokémon. */

const semAcento = (texto) => String(texto).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
const ORDEM = ["Ferramenta", "Jogo", "Região", "Bioma", "Pokémon", "Desafio", "Estrutura", "Item"];

/* Devolve até `limite` entradas: primeiro o nome que começa pelo texto, depois a palavra que começa, depois o
 * trecho solto. No empate, vem antes o que é da edição em que a pessoa está. Um número acha o Pokémon daquele número. */
export function procurar(indice, texto, edicao = "pokemon", limite = 24) {
  const t = semAcento(texto);
  if (!t) return [];
  const numero = /^\d+$/.test(t) ? Number(t) : null, achados = [];
  for (const entrada of indice) {
    const nome = semAcento(entrada[1]);
    let nota = -1;
    if (numero !== null && entrada[4] === numero) nota = 0;
    else if (nome.startsWith(t)) nota = 0;
    else if (nome.split(/[\s,:'’-]+/).some((palavra) => palavra.startsWith(t))) nota = 1;
    else if (t.length >= 3 && nome.includes(t)) nota = 2;
    if (nota >= 0) achados.push([nota, entrada[3] === edicao ? 0 : 1, ORDEM.indexOf(entrada[0]), nome.length, entrada]);
  }
  achados.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3] || a[4][1].localeCompare(b[4][1], "pt-BR"));
  return achados.slice(0, limite).map((a) => a[4]);
}
