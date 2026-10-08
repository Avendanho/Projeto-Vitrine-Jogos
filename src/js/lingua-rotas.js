/* Os endereços do atlas nas duas línguas. Cada seção tem um prefixo em português e o seu par em inglês; o
 * resto do caminho (o nome da espécie, do jogo, da região) é igual nos dois. Serve ao build e ao navegador. */

/* Do mais específico para o mais geral: vale o primeiro prefixo que casar. */
export const ROTAS = [
  ["/comparar/pokemon/", "/en/compare/pokemon/"],
  ["/comparar/", "/en/compare/"],
  ["/linha-do-tempo/", "/en/timeline/"],
  ["/pokedex/", "/en/pokedex/"],
  ["/regioes/", "/en/regions/"],
  ["/jogos/", "/en/games/"],
  ["/bussola/", "/en/compass/"],
  ["/time/", "/en/team/"],
  ["/tipos/", "/en/types/"],
  ["/desenhar/", "/en/draw/"],
  ["/desafios/", "/en/challenges/"],
  ["/diario/", "/en/journal/"]
];

/* O endereço em inglês de uma página (ou o mesmo endereço, se a página só existe em português ou é um arquivo). */
export function rotaEmIngles(caminho) {
  if (caminho === "/") return "/en/";
  for (const [pt, en] of ROTAS) if (caminho.startsWith(pt)) return en + caminho.slice(pt.length);
  return caminho;
}
/* E o caminho de volta. */
export function rotaEmPortugues(caminho) {
  if (caminho === "/en/") return "/";
  for (const [pt, en] of ROTAS) if (caminho.startsWith(en)) return pt + caminho.slice(en.length);
  return caminho;
}
