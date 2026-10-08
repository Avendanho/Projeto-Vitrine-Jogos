/* Os módulos de dados que o navegador importa, gerados no build em dist/js/dados/.
 * Cada função devolve o texto de um módulo. As páginas só baixam o que usam. */
import { FICHAS, POKEDEX, TIPOS_E_FATORES, ENCONTROS, COBBLEMON, enderecoCobblemon, enderecoEspecie } from "./base.mjs";
import { DESAFIOS } from "../dados/desafios.mjs";
import { JOGOS } from "../dados/jogos.mjs";
import { REGIOES, ROTAS } from "../dados/atlas.mjs";

const cabecalho = "/* Gerado por scripts/build.mjs a partir de dados/. Não edite à mão. */\n";

/* Uma linha por espécie: [id, slug, nome, tipos, atributos, altura, peso, geração, cor, estágio, família].
 * Estágio é a posição na linha evolutiva (1 a 3) e família é o número da forma básica. */
export function especiesParaONavegador() {
  const raiz = (id) => { let atual = id, passos = 1; while (FICHAS[atual].de) { atual = FICHAS[atual].de; passos++; } return [atual, Math.min(passos, 3)]; };
  return Object.keys(FICHAS).map(Number).sort((a, b) => a - b).map((id) => {
    const f = FICHAS[id], [familia, estagio] = raiz(id);
    return [id, f.slug, f.nome, POKEDEX.especies[id][1], f.atributos, f.altura, f.peso, f.geracao, f.cor, estagio, familia];
  });
}
export const moduloEspecies = () => `${cabecalho}export const ESPECIES = ${JSON.stringify(especiesParaONavegador())};\n`;

/* Os 18 tipos e o fator de cada atacante contra cada defensor. */
export const moduloTipos = () => `${cabecalho}export const TIPOS = ${JSON.stringify(TIPOS_E_FATORES.tipos)};\nexport const TABELA = ${JSON.stringify(TIPOS_E_FATORES.tabela)};\n`;

/* As campanhas (jogos da série principal, remakes e Legends com Pokédex no atlas): que espécies cada uma
 * tem, as rotas numeradas da região dela e, onde a PokéAPI tem a tabela, o que aparece em cada rota
 * ([andando, na água, pescando, de outros jeitos]). Serve ao montador de time e ao diário de desafio. */
export function jogosParaONavegador() {
  return JOGOS.filter((j) => j.pokedex && j.tipo !== "derivado").map((j) => ({
    slug: j.slug, nome: j.curto, regiao: REGIOES.find((r) => r.id === j.regiao).nome,
    especies: [...new Set(j.pokedex.flatMap(([lista]) => POKEDEX.dex[lista].map(([, e]) => e)))].filter((id) => FICHAS[id]),
    rotas: (ROTAS[j.regiao] || []).map((r) => [r.n, r.de, r.para]),
    encontros: ENCONTROS[j.slug] ?? null
  }));
}
export const moduloJogos = () => `${cabecalho}export const JOGOS = ${JSON.stringify(jogosParaONavegador())};\n`;

/* As regras de spawn do Cobblemon para o plano de caçada. Os nomes dos biomas ficam numa lista só, e cada
 * regra aponta para eles pela posição: [raridade (0 comum a 3 ultrarrara), [biomas], [contextos], [nível mínimo, máximo], hora, [condições], forma]. */
const BALDES = ["common", "uncommon", "rare", "ultra-rare"];
export function spawnsParaONavegador() {
  const biomas = [], posicao = (nome) => { let i = biomas.indexOf(nome); if (i < 0) { i = biomas.length; biomas.push(nome); } return i; };
  const especies = Object.values(COBBLEMON.especies).filter((e) => e.impl).sort((a, b) => a.n - b.n);
  const spawns = {};
  for (const e of especies) if (e.spawns.length) spawns[e.n] = e.spawns.map((s) => [BALDES.indexOf(s.b), s.bi.map(posicao), s.c, s.n, s.h ?? "", s.q, s.f ?? ""]);
  return { biomas, spawns, especies: especies.map((e) => [e.n, enderecoCobblemon(e.n), e.nome]) };
}
export function moduloSpawns() {
  const d = spawnsParaONavegador();
  return `${cabecalho}export const BIOMAS = ${JSON.stringify(d.biomas)};\nexport const SPAWNS = ${JSON.stringify(d.spawns)};\nexport const ESPECIES = ${JSON.stringify(d.especies)};\nexport const CONTEXTOS = ${JSON.stringify(COBBLEMON.contextos)};\n`;
}

/* O índice da busca global: tudo o que tem página ou âncora nas duas edições.
 * Cada entrada é [tipo, nome, endereço, edição, número]; o número só existe para os Pokémon. */
export function indiceDaBusca() {
  const P = "pokemon", C = "cobblemon", ancora = (id) => id.split(":").pop().replace(/\//g, "-");
  return [
    ...[["Abrir a bússola", "/bussola/"], ["Pokédex", "/pokedex/"], ["Regiões", "/regioes/"], ["Linha do tempo", "/linha-do-tempo/"], ["Comparar jogos", "/comparar/"], ["Comparar Pokémon", "/comparar/pokemon/"],
      ["Desafios", "/desafios/"], ["Montar um time", "/time/"], ["Diário de desafio", "/diario/"], ["Roda de tipos", "/tipos/"], ["Desenhar o perfil", "/desenhar/"]].map(([nome, url]) => ["Ferramenta", nome, url, P]),
    ...[["Pokémon do Cobblemon", "/cobblemon/pokemon/"], ["Itens do Cobblemon", "/cobblemon/itens/"], ["Estruturas do Cobblemon", "/cobblemon/estruturas/"], ["Biomas do Cobblemon", "/cobblemon/biomas/"],
      ["Plano de caçada", "/cobblemon/cacada/"], ["Desafios de Cobblemon", "/cobblemon/desafios/"]].map(([nome, url]) => ["Ferramenta", nome, url, C]),
    ...JOGOS.map((j) => ["Jogo", j.titulo ?? j.curto, `/jogos/${j.slug}/`, P]),
    ...REGIOES.map((r) => ["Região", r.nome, `/regioes/${r.id}/`, P]),
    ...Object.keys(FICHAS).map(Number).sort((a, b) => a - b).map((id) => ["Pokémon", FICHAS[id].nome, enderecoEspecie(id), P, id]),
    ...DESAFIOS.map((d) => ["Desafio", d.nome, `${d.edicao === C ? "/cobblemon/desafios/" : "/desafios/"}${d.slug}/`, d.edicao]),
    ...COBBLEMON.ambientes.map((a) => ["Bioma", a.nome, `/cobblemon/biomas/#${a.id}`, C]),
    ...Object.values(COBBLEMON.especies).filter((e) => e.impl).sort((a, b) => a.n - b.n).map((e) => ["Pokémon", e.nome, enderecoCobblemon(e.n), C, e.n]),
    ...COBBLEMON.estruturas.map((e) => ["Estrutura", e.nome, `/cobblemon/estruturas/#${ancora(e.id)}`, C]),
    ...COBBLEMON.itens.map((i) => ["Item", i.nome, `/cobblemon/itens/#item-${i.id}`, C])
  ];
}
/* Cada espécie pelo número: [endereço, nome, endereço no Cobblemon ou nada]. É o que o aparelho consulta quando
 * alguém digita um número ou pede um Pokémon ao acaso. */
export const moduloNumeros = () => `${cabecalho}export const NUMEROS = ${JSON.stringify(Object.keys(FICHAS).map(Number).sort((a, b) => a - b).map((id) => [enderecoEspecie(id), FICHAS[id].nome, COBBLEMON.especies[id]?.impl ? enderecoCobblemon(id) : 0]))};\n`;

export const moduloBusca = () => `${cabecalho}export const INDICE = ${JSON.stringify(indiceDaBusca())};\n`;
