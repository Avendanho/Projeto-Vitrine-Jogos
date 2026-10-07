#!/usr/bin/env node
/* Monta dados/fichas.json: a ficha de cada espécie para as páginas da Pokédex
 * (atributos, medidas, habilidades, evolução, formas, nome em japonês e a
 * entrada oficial mais recente). Fonte: tabelas públicas da PokéAPI.
 *
 * Uso: node scripts/fichas.mjs
 * O arquivo gerado fica no repositório; o build não acessa a rede.
 */
import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/";

/* Leitor de CSV com campos entre aspas (as entradas da Pokédex têm vírgulas e quebras de linha). */
function lerCSV(texto) {
  const linhas = [];
  let campo = "", linha = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ",") { linha.push(campo); campo = ""; }
    else if (c === "\n") { linha.push(campo); linhas.push(linha); linha = []; campo = ""; }
    else if (c !== "\r") campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const [colunas, ...resto] = linhas;
  return resto.map((l) => Object.fromEntries(l.map((v, i) => [colunas[i], v])));
}
async function tabela(nome) {
  const resposta = await fetch(`${BASE}${nome}.csv`);
  if (!resposta.ok) throw new Error(`${nome}.csv: ${resposta.status}`);
  return lerCSV(await resposta.text());
}

const NOMES = ["pokemon_species", "pokemon_species_names", "pokemon", "pokemon_stats", "pokemon_abilities", "ability_names",
  "pokemon_evolution", "evolution_triggers", "item_names", "pokemon_egg_groups", "egg_groups", "growth_rates",
  "pokemon_habitats", "pokemon_colors", "pokemon_species_flavor_text", "version_names"];
const T = Object.fromEntries(await Promise.all(NOMES.map(async (n) => [n, await tabela(n)])));
const EN = "9", KANA = "1", ROMAJI = "2";

const OVOS = { monster: "Monstro", water1: "Água 1", bug: "Inseto", flying: "Voador", ground: "Campo", fairy: "Fada",
  plant: "Planta", humanshape: "Humanoide", water3: "Água 3", mineral: "Mineral", indeterminate: "Amorfo",
  water2: "Água 2", ditto: "Ditto", dragon: "Dragão", "no-eggs": "Sem ovos" };
const CRESCIMENTO = { slow: "Lento", medium: "Médio", fast: "Rápido", "medium-slow": "Médio-lento",
  "slow-then-very-fast": "Errático", "fast-then-very-slow": "Flutuante" };
const HABITAT = { cave: "Caverna", forest: "Floresta", grassland: "Campo", mountain: "Montanha", rare: "Raro",
  "rough-terrain": "Terreno acidentado", sea: "Mar", urban: "Cidade", "waters-edge": "Beira d'água" };
const COR = { black: "Preto", blue: "Azul", brown: "Marrom", gray: "Cinza", green: "Verde", pink: "Rosa",
  purple: "Roxo", red: "Vermelho", white: "Branco", yellow: "Amarelo" };

const porId = (lista, chave = "id") => Object.fromEntries(lista.map((r) => [r[chave], r]));
const nomeEn = (lista, chave) => Object.fromEntries(lista.filter((r) => r.local_language_id === EN).map((r) => [r[chave], r.name]));
const HABILIDADE = nomeEn(T.ability_names, "ability_id");
const ITEM = nomeEn(T.item_names, "item_id");
const VERSAO = nomeEn(T.version_names, "version_id");
const GATILHO = Object.fromEntries(T.evolution_triggers.map((r) => [r.id, r.identifier]));
const idOvo = porId(T.egg_groups), idCresc = porId(T.growth_rates), idHab = porId(T.pokemon_habitats), idCor = porId(T.pokemon_colors);

/* Como uma espécie evolui, em poucas palavras. O que não cabe numa frase curta vira "em condição especial". */
function metodo(r) {
  const gatilho = GATILHO[r.evolution_trigger_id];
  const hora = r.time_of_day === "day" ? ", de dia" : r.time_of_day === "night" ? ", à noite" : r.time_of_day ? ", em certo horário" : "";
  const genero = r.gender_id === "1" ? " (só fêmeas)" : r.gender_id === "2" ? " (só machos)" : "";
  if (gatilho === "use-item" && ITEM[r.trigger_item_id]) return `com ${ITEM[r.trigger_item_id]}${genero}`;
  if (gatilho === "trade") {
    if (ITEM[r.held_item_id]) return `por troca, segurando ${ITEM[r.held_item_id]}`;
    return r.trade_species_id ? "por troca com uma espécie específica" : "por troca";
  }
  if (gatilho === "level-up") {
    let extra = hora + genero;
    if (r.relative_physical_stats !== "") extra += ", conforme o Ataque e a Defesa";
    if (r.needs_overworld_rain === "1") extra += ", com chuva";
    if (r.turn_upside_down === "1") extra += ", com o console de cabeça para baixo";
    if (r.party_species_id || r.party_type_id) extra += ", com certo companheiro na equipe";
    if (r.minimum_level) return `no nível ${r.minimum_level}${extra}`;
    if (r.minimum_happiness) return `com amizade alta${r.known_move_type_id ? ", sabendo um golpe de certo tipo" : ""}${extra}`;
    if (r.minimum_affection) return `com afeto alto${r.known_move_type_id ? ", sabendo um golpe de certo tipo" : ""}`;
    if (r.minimum_beauty) return "com beleza alta";
    if (ITEM[r.held_item_id]) return `subindo de nível segurando ${ITEM[r.held_item_id]}${hora}`;
    if (r.known_move_id) return "subindo de nível sabendo certo golpe";
    if (r.known_move_type_id) return "subindo de nível sabendo um golpe de certo tipo";
    if (r.location_id) return "subindo de nível em certo lugar";
    if (extra) return `subindo de nível${extra}`;
  }
  return "em condição especial";
}

const especies = T.pokemon_species.sort((a, b) => a.id - b.id);
const nomes = {}, generos = {}, kana = {}, romaji = {};
for (const n of T.pokemon_species_names) {
  if (n.local_language_id === EN) { nomes[n.pokemon_species_id] = n.name; generos[n.pokemon_species_id] = n.genus; }
  if (n.local_language_id === KANA) kana[n.pokemon_species_id] = n.name;
  if (n.local_language_id === ROMAJI) romaji[n.pokemon_species_id] = n.name;
}
const padrao = {};
const formas = {};
for (const p of T.pokemon) {
  if (p.is_default === "1") padrao[p.species_id] = p;
  else if (!/totem|-cap$|starter/.test(p.identifier)) (formas[p.species_id] ??= []).push(p.identifier);
}
const atributos = {}, habilidades = {};
for (const s of T.pokemon_stats) (atributos[s.pokemon_id] ??= [])[Number(s.stat_id) - 1] = Number(s.base_stat);
for (const a of T.pokemon_abilities.sort((x, y) => x.slot - y.slot)) (habilidades[a.pokemon_id] ??= []).push([HABILIDADE[a.ability_id], a.is_hidden === "1" ? 1 : 0]);
const ovos = {};
for (const o of T.pokemon_egg_groups) (ovos[o.species_id] ??= []).push(OVOS[idOvo[o.egg_group_id].identifier]);
const evolucao = {};
for (const e of T.pokemon_evolution.sort((a, b) => (b.is_default === "1") - (a.is_default === "1") || a.id - b.id)) evolucao[e.evolved_species_id] ??= metodo(e);
// a entrada em inglês do jogo mais recente
const entrada = {};
for (const f of T.pokemon_species_flavor_text) {
  if (f.language_id !== EN) continue;
  if (!entrada[f.species_id] || Number(f.version_id) > entrada[f.species_id][1]) {
    entrada[f.species_id] = [f.flavor_text.replace(/[\n\f\r­]+/g, " ").replace(/\s+/g, " ").trim(), Number(f.version_id)];
  }
}

const fichas = {};
for (const e of especies) {
  const id = e.id, p = padrao[id];
  if (!p || atributos[p.id]?.length !== 6) throw new Error(`espécie ${id} sem forma padrão ou sem os seis atributos`);
  const f = formas[id] || [];
  const regionais = ["alola", "galar", "hisui", "paldea"].filter((r) => f.some((x) => x.endsWith(`-${r}`) || x.includes(`-${r}-`)));
  fichas[id] = {
    slug: e.identifier, nome: nomes[id], categoria: generos[id], geracao: Number(e.generation_id),
    altura: Number(p.height) / 10, peso: Number(p.weight) / 10,
    atributos: atributos[p.id], habilidades: habilidades[p.id],
    captura: Number(e.capture_rate), crescimento: CRESCIMENTO[idCresc[e.growth_rate_id].identifier],
    femeas: Number(e.gender_rate),                     // em oitavos; -1 = sem gênero
    ovos: ovos[id] || [],
    habitat: e.habitat_id ? HABITAT[idHab[e.habitat_id].identifier] : null,
    cor: COR[idCor[e.color_id].identifier],
    classe: e.is_mythical === "1" ? "mitico" : e.is_legendary === "1" ? "lendario" : e.is_baby === "1" ? "bebe" : null,
    de: e.evolves_from_species_id ? Number(e.evolves_from_species_id) : null,
    cadeia: Number(e.evolution_chain_id),
    como: e.evolves_from_species_id ? evolucao[id] || "em condição especial" : null,
    japones: [kana[id], romaji[id]],
    megas: f.filter((x) => /-mega(-|$)/.test(x)).length,
    gmax: f.some((x) => x.endsWith("-gmax")),
    regionais,
    entrada: entrada[id] ? [entrada[id][0], VERSAO[entrada[id][1]]] : null
  };
}

for (const [id, f] of Object.entries(fichas)) {
  for (const k of ["nome", "categoria", "crescimento", "cor"]) if (!f[k]) throw new Error(`espécie ${id}: falta ${k}`);
  if (f.habilidades.some(([n]) => !n) || f.ovos.includes(undefined)) throw new Error(`espécie ${id}: habilidade ou grupo de ovos sem nome`);
}
await writeFile(join(RAIZ, "dados", "fichas.json"), JSON.stringify(fichas), "utf8");
const lista = Object.values(fichas);
console.log(`fichas.json: ${lista.length} espécies; ${lista.filter((f) => f.entrada).length} com entrada da Pokédex; ` +
  `${lista.filter((f) => f.megas).length} com megaevolução; ${lista.filter((f) => f.gmax).length} com Gigantamax`);
