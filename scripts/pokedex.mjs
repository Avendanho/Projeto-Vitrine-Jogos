#!/usr/bin/env node
/* Monta dados/pokedex.json a partir das tabelas públicas da PokéAPI
 * (github.com/PokeAPI/pokeapi, pasta data/v2/csv): nome e tipos de cada espécie
 * e a ordem de cada Pokédex regional.
 *
 * Uso: node scripts/pokedex.mjs
 * O arquivo gerado fica no repositório; o build não acessa a rede.
 */
import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/";

const TIPOS = {
  normal: "Normal", fighting: "Lutador", flying: "Voador", poison: "Venenoso", ground: "Terrestre",
  rock: "Pedra", bug: "Inseto", ghost: "Fantasma", steel: "Aço", fire: "Fogo", water: "Água",
  grass: "Planta", electric: "Elétrico", psychic: "Psíquico", ice: "Gelo", dragon: "Dragão",
  dark: "Sombrio", fairy: "Fada"
};

async function tabela(nome) {
  const resposta = await fetch(`${BASE}${nome}.csv`);
  if (!resposta.ok) throw new Error(`${nome}.csv: ${resposta.status}`);
  const [cabecalho, ...linhas] = (await resposta.text()).trim().split("\n");
  const colunas = cabecalho.split(",");
  // nenhuma destas tabelas tem vírgula dentro de campo
  return linhas.map((l) => Object.fromEntries(l.split(",").map((v, i) => [colunas[i], v])));
}

const [dexes, numeros, nomes, tiposDe, tipos, pokemon] = await Promise.all(
  ["pokedexes", "pokemon_dex_numbers", "pokemon_species_names", "pokemon_types", "types", "pokemon"].map(tabela));

const idTipo = Object.fromEntries(tipos.map((t) => [t.id, t.identifier]));
const especies = {};
for (const n of nomes) if (n.local_language_id === "9") especies[n.pokemon_species_id] = [n.name, []];
for (const t of tiposDe.sort((a, b) => a.slot - b.slot)) {
  // nesta tabela, o id da forma padrão é o próprio número da espécie
  if (especies[t.pokemon_id]) especies[t.pokemon_id][1].push(TIPOS[idTipo[t.type_id]]);
}

const nomeDex = Object.fromEntries(dexes.map((d) => [d.id, d.identifier]));
const dex = {};
for (const n of numeros) {
  const chave = nomeDex[n.pokedex_id];
  if (chave === "national") continue;
  (dex[chave] ??= []).push([Number(n.pokedex_number), Number(n.species_id)]);
}
for (const lista of Object.values(dex)) lista.sort((a, b) => a[0] - b[0]);

/* Formas regionais: em Alola, Galar, Hisui e Paldea, algumas espécies têm uma
 * forma própria, com outra arte e outros tipos. Para cada região, guarda-se
 * espécie -> [id da forma, tipos]. Formas de totem, de boné e afins ficam de fora. */
const formas = { alola: {}, galar: {}, hisui: {}, paldea: {} };
const tiposDaForma = {};
for (const t of tiposDe) (tiposDaForma[t.pokemon_id] ??= []).push(TIPOS[idTipo[t.type_id]]);
for (const p of pokemon.sort((a, b) => a.id - b.id)) {
  if (Number(p.id) < 10000 || /totem|-cap$|gmax|starter/.test(p.identifier)) continue;
  for (const regiao of Object.keys(formas)) {
    const ehDaRegiao = p.identifier.endsWith(`-${regiao}`) || p.identifier.includes(`-${regiao}-`);
    if (ehDaRegiao && !formas[regiao][p.species_id]) formas[regiao][p.species_id] = [Number(p.id), tiposDaForma[p.id]];
  }
}

const semTipo = Object.entries(especies).filter(([, v]) => !v[1].length || v[1].includes(undefined));
if (semTipo.length) throw new Error(`espécies sem tipo: ${semTipo.map(([k]) => k).join(", ")}`);

await writeFile(join(RAIZ, "dados", "pokedex.json"), JSON.stringify({ especies, dex, formas }), "utf8");
console.log(`pokedex.json: ${Object.keys(especies).length} espécies, ${Object.keys(dex).length} Pokédex regionais, ` +
  `formas regionais: ${Object.entries(formas).map(([r, f]) => `${r} ${Object.keys(f).length}`).join(", ")}`);
