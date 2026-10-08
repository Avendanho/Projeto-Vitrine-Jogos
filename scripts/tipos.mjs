#!/usr/bin/env node
/* Baixa a tabela de efetividade dos 18 tipos dos dados públicos da PokéAPI (github.com/PokeAPI/pokeapi,
 * data/v2/csv) e grava dados/tipos.json: { tipos: [nomes em português], tabela: [atacante][defensor] = fator }.
 * O arquivo gerado fica no repositório; o build não depende deste script nem da rede.
 *
 * Uso: node scripts/tipos.mjs
 */
import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ORDEM_TIPOS } from "./base.mjs";

const BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/";
const NOMES = {
  normal: "Normal", fighting: "Lutador", flying: "Voador", poison: "Venenoso", ground: "Terrestre", rock: "Pedra", bug: "Inseto", ghost: "Fantasma",
  steel: "Aço", fire: "Fogo", water: "Água", grass: "Planta", electric: "Elétrico", psychic: "Psíquico", ice: "Gelo", dragon: "Dragão", dark: "Sombrio", fairy: "Fada"
};
const csv = async (nome) => (await (await fetch(BASE + nome)).text()).trim().split("\n").slice(1).map((l) => l.split(","));

const porId = Object.fromEntries((await csv("types.csv")).filter(([, id]) => NOMES[id]).map(([n, id]) => [n, NOMES[id]]));
const tabela = ORDEM_TIPOS.map(() => ORDEM_TIPOS.map(() => 1));
let lidas = 0;
for (const [atacante, defensor, fator] of await csv("type_efficacy.csv")) {
  const a = ORDEM_TIPOS.indexOf(porId[atacante]), d = ORDEM_TIPOS.indexOf(porId[defensor]);
  if (a < 0 || d < 0) continue;
  tabela[a][d] = Number(fator) / 100;
  lidas++;
}
if (lidas !== 18 * 18) { console.error(`Esperava 324 pares de tipos e vieram ${lidas}.`); process.exit(1); }
await writeFile(join(dirname(fileURLToPath(import.meta.url)), "..", "dados", "tipos.json"), JSON.stringify({ tipos: ORDEM_TIPOS, tabela }));
console.log(`Tipos: ${ORDEM_TIPOS.length} tipos, ${lidas} pares em dados/tipos.json`);
