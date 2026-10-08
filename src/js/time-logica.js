/* As contas do montador de time, sem tocar na página: quanto um golpe de certo tipo rende contra um
 * Pokémon, e o que isso diz do time inteiro. `tipos` é a lista dos 18 nomes e `tabela[a][d]` o fator
 * do tipo atacante `a` contra o tipo defensor `d` (js/dados/tipos.js). */

/* O fator de um golpe contra um Pokémon de um ou dois tipos: 0, 0,25, 0,5, 1, 2 ou 4. */
export function multiplicador(tabela, tipos, atacante, tiposDoDefensor) {
  const a = tipos.indexOf(atacante);
  return tiposDoDefensor.reduce((fator, t) => fator * (tabela[a]?.[tipos.indexOf(t)] ?? 1), 1);
}

/* O que um Pokémon sofre, separado pelo fator: os tipos que batem em quádruplo e em dobro, os que rendem a
 * metade e um quarto, e os que não fazem efeito. Dano normal fica de fora. */
export function sofre(tabela, tipos, tiposDoDefensor) {
  const grupos = { 4: [], 2: [], 0.5: [], 0.25: [], 0: [] };
  for (const t of tipos) grupos[multiplicador(tabela, tipos, t, tiposDoDefensor)]?.push(t);
  return { quadruplo: grupos[4], dobro: grupos[2], metade: grupos[0.5], quarto: grupos[0.25], imune: grupos[0] };
}

/* time: lista de espécies, cada uma com `tipos`. Devolve, para cada tipo atacante, quantos do time
 * apanham mais, quantos resistem e quantos são imunes; e três listas:
 *   buracos       tipos a que dois ou mais são fracos e ninguém resiste nem é imune
 *   cobertos      tipos que algum tipo do próprio time atinge com vantagem
 *   semResposta   os que ninguém do time atinge com vantagem */
export function analisar(tabela, tipos, time) {
  const porTipo = tipos.map((tipo) => {
    const fatores = time.map((e) => multiplicador(tabela, tipos, tipo, e.tipos));
    return { tipo, fatores, fracos: fatores.filter((f) => f > 1).length, resistentes: fatores.filter((f) => f > 0 && f < 1).length, imunes: fatores.filter((f) => f === 0).length };
  });
  const doTime = [...new Set(time.flatMap((e) => e.tipos))];
  const cobertos = time.length ? tipos.filter((alvo) => doTime.some((meu) => tabela[tipos.indexOf(meu)][tipos.indexOf(alvo)] > 1)) : [];
  return {
    porTipo,
    buracos: porTipo.filter((t) => t.fracos >= 2 && t.resistentes + t.imunes === 0).map((t) => t.tipo),
    cobertos,
    semResposta: time.length ? tipos.filter((t) => !cobertos.includes(t)) : []
  };
}

/* Como o fator aparece escrito. O 1 fica em branco. */
export const escrito = (fator) => ({ 0: "0", 0.25: "¼", 0.5: "½", 1: "", 2: "2", 4: "4" })[fator] ?? String(fator);
