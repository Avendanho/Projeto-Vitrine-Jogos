#!/usr/bin/env node
/* Baixa dos dados públicos da PokéAPI (github.com/PokeAPI/pokeapi, data/v2/csv) a tabela de encontros e
 * grava dados/encontros.json: para cada jogo do atlas e cada rota numerada da região dele, as espécies que
 * aparecem ali, separadas por jeito de achar:
 *   { "<jogo>": { "<rota>": [[andando], [na água], [pescando], [de outros jeitos]] } }
 * A rota tem o mesmo rótulo de dados/atlas.mjs ("1", "3–4"). A PokéAPI não tem a tabela de todos os jogos:
 * os que faltam ficam de fora, e o script diz quais.
 * O arquivo gerado fica no repositório; o build não depende deste script nem da rede.
 *
 * Uso: node scripts/encontros.mjs
 */
import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { JOGOS } from "../dados/jogos.mjs";
import { ROTAS } from "../dados/atlas.mjs";

const BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/";
const csv = async (nome) => (await (await fetch(BASE + nome)).text()).trim().split("\n").slice(1).map((l) => l.split(","));

/* as versões da PokéAPI que formam cada jogo do atlas */
const VERSOES = {
  "red-blue-yellow": ["red", "blue", "yellow"], "gold-silver-crystal": ["gold", "silver", "crystal"], "ruby-sapphire-emerald": ["ruby", "sapphire", "emerald"],
  "firered-leafgreen": ["firered", "leafgreen"], "diamond-pearl-platinum": ["diamond", "pearl", "platinum"], "heartgold-soulsilver": ["heartgold", "soulsilver"],
  "black-white": ["black", "white"], "black-2-white-2": ["black-2", "white-2"], "x-y": ["x", "y"], "omega-ruby-alpha-sapphire": ["omega-ruby", "alpha-sapphire"],
  "sun-moon": ["sun", "moon"], "ultra-sun-ultra-moon": ["ultra-sun", "ultra-moon"], "lets-go-pikachu-eevee": ["lets-go-pikachu", "lets-go-eevee"],
  "sword-shield": ["sword", "shield"], "brilliant-diamond-shining-pearl": ["brilliant-diamond", "shining-pearl"], "legends-arceus": ["legends-arceus"],
  "scarlet-violet": ["scarlet", "violet"], "legends-z-a": ["legends-za"]
};
const JEITOS = [
  ["walk", "dark-grass", "grass-spots", "cave-spots", "bridge-spots", "yellow-flowers", "purple-flowers", "red-flowers", "rough-terrain", "overworld", "overworld-flying", "horde", "sos"],
  ["surf", "surf-spots", "seaweed", "overworld-water", "bubbling-spots", "sos-from-bubbling-spot"],
  ["old-rod", "good-rod", "super-rod", "super-rod-spots", "feebas-tile-fishing"]
];                                                   // o que não está aqui (pedra quebrada, cabeçada, presente, árvore de mel...) conta como "de outros jeitos"

const [versoes, metodos, vagas, areas, lugares, pokemon, encontros] = await Promise.all(["versions.csv", "encounter_methods.csv", "encounter_slots.csv", "location_areas.csv", "locations.csv", "pokemon.csv", "encounters.csv"].map(csv));
const idDaVersao = Object.fromEntries(versoes.map(([id, , nome]) => [nome, id]));
const nomeDoMetodo = Object.fromEntries(metodos.map(([id, nome]) => [id, nome]));
const jeitoDaVaga = Object.fromEntries(vagas.map(([id, , metodo]) => { const k = JEITOS.findIndex((l) => l.includes(nomeDoMetodo[metodo])); return [id, k < 0 ? 3 : k]; }));
const lugarDaArea = Object.fromEntries(areas.map(([id, lugar]) => [id, lugar]));
const nomeDoLugar = Object.fromEntries(lugares.map(([id, , nome]) => [id, nome]));
const especieDe = Object.fromEntries(pokemon.map(([id, , especie]) => [id, Number(especie)]));

const saida = {}, semDados = [];
for (const jogo of JOGOS) {
  const nomes = VERSOES[jogo.slug], rotas = ROTAS[jogo.regiao] || [];
  if (!nomes || !rotas.length) continue;
  for (const nome of nomes) if (!idDaVersao[nome]) { console.error(`A PokéAPI não conhece a versão "${nome}".`); process.exit(1); }
  const ids = new Set(nomes.map((n) => idDaVersao[n]));
  // rota do atlas -> lugares da PokéAPI: "kanto-route-1" e, para as rotas de mar, "kanto-sea-route-19"
  const rotulos = new Map();
  for (const r of rotas) for (const n of String(r.n).split(/[–-]/).map((p) => p.trim()).filter((p) => /^\d+$/.test(p))) for (const prefixo of ["route", "sea-route"]) rotulos.set(`${jogo.regiao}-${prefixo}-${n}`, String(r.n));
  const doJogo = {};
  for (const [, versao, area, vaga, quem] of encontros) {
    if (!ids.has(versao)) continue;
    const rota = rotulos.get(nomeDoLugar[lugarDaArea[area]]);
    if (!rota) continue;
    ((doJogo[rota] ??= [new Set(), new Set(), new Set(), new Set()])[jeitoDaVaga[vaga] ?? 3]).add(especieDe[quem]);
  }
  if (!Object.keys(doJogo).length) { semDados.push(jogo.curto); continue; }
  // quem aparece andando, na água ou pescando não precisa repetir em "outros jeitos"
  saida[jogo.slug] = Object.fromEntries(Object.entries(doJogo).map(([rota, [a, b, c, d]]) => [rota, [a, b, c, new Set([...d].filter((e) => !a.has(e) && !b.has(e) && !c.has(e)))].map((s) => [...s].sort((x, y) => x - y))]));
}
await writeFile(join(dirname(fileURLToPath(import.meta.url)), "..", "dados", "encontros.json"), JSON.stringify(saida));
console.log(`Encontros: ${Object.keys(saida).length} jogos com tabela (${Object.entries(saida).map(([j, r]) => `${j} ${Object.keys(r).length}`).join(", ")})`);
if (semDados.length) console.log(`Sem tabela de encontros na PokéAPI para as rotas de: ${semDados.join(", ")}`);
