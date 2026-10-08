#!/usr/bin/env node
/* Monta dados/cobblemon.json a partir dos arquivos do próprio Cobblemon
 * (gitlab.com/cable-mc/cobblemon, licença MPL 2.0): espécies implementadas,
 * onde cada uma nasce, o que deixa cair, como evolui no mod, itens, receitas,
 * estruturas e fósseis. Os nomes em português são os da tradução do mod; os de
 * itens e biomas do jogo base vêm da tradução oficial do Minecraft.
 *
 * Uso:
 *   git clone --depth 1 --branch 1.8.1 https://gitlab.com/cable-mc/cobblemon.git
 *   node scripts/cobblemon.mjs --fonte cobblemon [--minecraft pt_br.json]
 *
 * Sem --minecraft, a tradução do Minecraft é baixada dos servidores da Mojang.
 * O arquivo gerado fica no repositório; o build não acessa a rede.
 */
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, relative, basename, sep } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opcao = (nome) => { const i = args.indexOf(`--${nome}`); return i >= 0 ? args[i + 1] : null; };
const FONTE = opcao("fonte");
if (!FONTE) { console.error("Informe --fonte <pasta do repositório do Cobblemon>."); process.exit(1); }
const RECURSOS = join(FONTE, "common", "src", "main", "resources");
const DADOS = join(RECURSOS, "data", "cobblemon");
if (!existsSync(join(DADOS, "species"))) { console.error(`Não achei ${join(DADOS, "species")}.`); process.exit(1); }

const json = async (caminho) => JSON.parse(await readFile(caminho, "utf8"));
async function arquivos(pasta, sufixo = ".json") {
  if (!existsSync(pasta)) return [];
  const lista = [];
  for (const item of await readdir(pasta, { withFileTypes: true })) {
    const caminho = join(pasta, item.name);
    if (item.isDirectory()) lista.push(...await arquivos(caminho, sufixo));
    else if (item.name.endsWith(sufixo)) lista.push(caminho);
  }
  return lista.sort();
}
const semExt = (caminho, base) => relative(base, caminho).split(sep).join("/").replace(/\.json$/, "");

/* ---------- traduções ---------- */

const PT = await json(join(RECURSOS, "assets", "cobblemon", "lang", "pt_br.json"));
const EN = await json(join(RECURSOS, "assets", "cobblemon", "lang", "en_us.json"));
const texto = (chave) => PT[chave] ?? EN[chave] ?? null;

async function traducaoDoMinecraft() {
  if (opcao("minecraft")) return json(opcao("minecraft"));
  const ler = async (u) => (await fetch(u)).json();
  const manifesto = await ler("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json");
  const versao = manifesto.versions.find((v) => v.id === "1.21.1");
  const indice = await ler((await ler(versao.url)).assetIndex.url);
  const { hash } = indice.objects["minecraft/lang/pt_br.json"];
  return ler(`https://resources.download.minecraft.net/${hash.slice(0, 2)}/${hash}`);
}
const MC = await traducaoDoMinecraft();

const bonito = (id) => id.split(/[/:]/).pop().split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
/* O nome de um item ou bloco, pelo identificador ("cobblemon:oran_berry", "minecraft:clay_ball"). */
function nomeDoItem(id) {
  const [espaco, caminho] = id.includes(":") ? id.split(":") : ["minecraft", id];
  if (espaco === "cobblemon") return texto(`item.cobblemon.${caminho}`) ?? texto(`block.cobblemon.${caminho}`) ?? bonito(caminho);
  if (espaco === "minecraft") return MC[`item.minecraft.${caminho}`] ?? MC[`block.minecraft.${caminho}`] ?? bonito(caminho);
  return null;                                    // item de outro mod
}

const TIPOS = Object.fromEntries(Object.keys(EN).filter((k) => /^cobblemon\.type\.[a-z]+$/.test(k) && !k.endsWith("suffix")).map((k) => [k.split(".").pop(), texto(k)]));

/* ---------- tags ---------- */

/* Lê uma tag do mod e devolve os valores finais, abrindo as tags do próprio mod que ela cita. */
const cacheDeTags = new Map();
async function tag(registro, nome, vistos = new Set()) {
  const chave = `${registro}/${nome}`;
  if (cacheDeTags.has(chave)) return cacheDeTags.get(chave);
  const caminho = join(DADOS, "tags", ...registro.split("/"), ...`${nome}.json`.split("/"));
  const resultado = { valores: [], externas: [] };
  if (existsSync(caminho) && !vistos.has(chave)) {
    vistos.add(chave);
    for (const bruto of (await json(caminho)).values || []) {
      const v = typeof bruto === "string" ? bruto : bruto.id;
      if (v.startsWith("#cobblemon:")) {
        const dentro = await tag(registro, v.slice(11), vistos);
        resultado.valores.push(...dentro.valores); resultado.externas.push(...dentro.externas);
      } else if (v.startsWith("#")) resultado.externas.push(v);
      else resultado.valores.push(v);
    }
  }
  resultado.valores = [...new Set(resultado.valores)];
  cacheDeTags.set(chave, resultado);
  return resultado;
}

/* ---------- biomas ---------- */

const BIOMAS = {
  "#cobblemon:is_overworld": "Qualquer bioma da Superfície",
  "#cobblemon:is_plains": "Planícies", "#cobblemon:is_grassland": "Pradarias", "#cobblemon:is_temperate": "Regiões temperadas",
  "#cobblemon:is_shrubland": "Matagais", "#cobblemon:is_floral": "Campos floridos", "#cobblemon:is_magical": "Biomas mágicos",
  "#cobblemon:is_forest": "Florestas", "#cobblemon:is_taiga": "Taigas", "#cobblemon:is_cherry_blossom": "Bosques de cerejeiras",
  "#cobblemon:is_spooky": "Biomas sombrios", "#cobblemon:is_mushroom": "Campos de cogumelos",
  "#cobblemon:is_jungle": "Selvas", "#cobblemon:is_bamboo": "Selvas de bambu", "#cobblemon:is_tropical_island": "Ilhas tropicais",
  "#cobblemon:is_island": "Ilhas",
  "#cobblemon:is_mountain": "Montanhas", "#cobblemon:is_hills": "Colinas", "#cobblemon:is_peak": "Picos",
  "#cobblemon:is_highlands": "Terras altas", "#cobblemon:is_plateau": "Planaltos", "#cobblemon:is_sky": "Biomas do céu",
  "#cobblemon:is_desert": "Desertos", "#cobblemon:is_arid": "Regiões áridas", "#cobblemon:is_badlands": "Ermos", "#cobblemon:is_savanna": "Savanas",
  "#cobblemon:is_volcanic": "Regiões vulcânicas", "#cobblemon:is_thermal": "Regiões termais",
  "#cobblemon:is_snowy": "Biomas nevados", "#cobblemon:is_freezing": "Regiões congelantes", "#cobblemon:is_cold": "Regiões frias",
  "#cobblemon:is_tundra": "Tundras", "#cobblemon:is_glacial": "Regiões glaciais", "#cobblemon:is_snowy_forest": "Florestas nevadas",
  "#cobblemon:is_snowy_taiga": "Taigas nevadas",
  "#cobblemon:is_swamp": "Pântanos", "#cobblemon:has_block/mud": "Biomas com lama", "#cobblemon:is_freshwater": "Água doce", "#cobblemon:is_river": "Rios",
  "#cobblemon:is_ocean": "Oceanos", "#cobblemon:is_deep_ocean": "Oceano profundo", "#cobblemon:is_cold_ocean": "Oceanos frios",
  "#cobblemon:is_frozen_ocean": "Oceanos congelados", "#cobblemon:is_warm_ocean": "Oceanos quentes", "#cobblemon:is_lukewarm_ocean": "Oceanos mornos",
  "#cobblemon:is_coast": "Litoral", "#cobblemon:is_beach": "Praias",
  "#cobblemon:is_lush": "Cavernas exuberantes", "#cobblemon:is_dripstone": "Cavernas de espeleotemas", "#cobblemon:is_deep_dark": "Escuridão profunda",
  "#cobblemon:is_cave": "Cavernas",
  "#minecraft:is_nether": "Nether, qualquer bioma",
  "#cobblemon:nether/is_basalt": "Nether: deltas de basalto", "#cobblemon:nether/is_crimson": "Nether: floresta carmesim",
  "#cobblemon:nether/is_warped": "Nether: floresta distorcida", "#cobblemon:nether/is_forest": "Nether: florestas",
  "#cobblemon:nether/is_fungus": "Nether: áreas de fungos", "#cobblemon:nether/is_overgrowth": "Nether: áreas tomadas pela vegetação",
  "#cobblemon:nether/is_wasteland": "Nether: descampados", "#cobblemon:nether/is_desert": "Nether: desertos",
  "#cobblemon:nether/is_frozen": "Nether: áreas congeladas", "#cobblemon:nether/is_mountain": "Nether: montanhas",
  "#cobblemon:nether/is_quartz": "Nether: áreas de quartzo", "#cobblemon:nether/is_soul_fire": "Nether: fogo das almas",
  "#cobblemon:nether/is_soul_sand": "Nether: vale das almas", "#cobblemon:nether/is_toxic": "Nether: áreas tóxicas",
  "#cobblemon:is_end": "O Fim",
  // usados só por estruturas
  "#cobblemon:has_block/sand": "Biomas com areia", "#cobblemon:has_block/red_sand": "Biomas com areia vermelha",
  "#cobblemon:is_snowy_flat": "Planícies nevadas", "#c:is_snowy_plains": "Planícies nevadas",
  "#cobblemon:is_lukewarm_and_temperate_ocean": "Oceanos mornos e temperados", "#cobblemon:is_cold_and_temperate_ocean": "Oceanos frios e temperados"
};
/* Os ambientes que o site usa para filtrar e resumir: cada tag de bioma cai em um. */
const AMBIENTES = [
  ["campo", "Campos e planícies", ["is_plains", "is_grassland", "is_temperate", "is_shrubland", "is_floral", "is_magical", "minecraft:sunflower_plains"]],
  ["floresta", "Florestas", ["is_forest", "is_taiga", "is_cherry_blossom", "is_spooky", "is_mushroom", "minecraft:mushroom_fields"]],
  ["selva", "Selvas e ilhas tropicais", ["is_jungle", "is_bamboo", "is_tropical_island", "is_island"]],
  ["montanha", "Montanhas", ["is_mountain", "is_hills", "is_peak", "is_highlands", "is_plateau", "is_sky"]],
  ["arido", "Desertos e savanas", ["is_desert", "is_arid", "is_badlands", "is_savanna", "is_volcanic", "is_thermal"]],
  ["frio", "Neve e gelo", ["is_snowy", "is_freezing", "is_cold", "is_tundra", "is_glacial", "is_snowy_forest", "is_snowy_taiga", "minecraft:snowy_beach", "minecraft:frozen_river"]],
  ["agua-doce", "Pântanos, rios e lagos", ["is_swamp", "has_block/mud", "is_freshwater", "is_river"]],
  ["oceano", "Oceanos e litoral", ["is_ocean", "is_deep_ocean", "is_cold_ocean", "is_frozen_ocean", "is_warm_ocean", "is_lukewarm_ocean", "is_coast", "is_beach"]],
  ["caverna", "Cavernas", ["is_lush", "is_dripstone", "is_deep_dark", "is_cave"]],
  ["nether", "Nether", ["nether/", "minecraft:is_nether"]],
  ["fim", "O Fim", ["is_end"]]
];
const OUTROS_MODS = /^#?(aether|the_bumblezone|biomesoplenty|terralith|wythers|byg|promenade|regions_unexplored|create)[:]/;
const naoVistos = new Set();
function nomeDoBioma(id) {
  if (BIOMAS[id]) return BIOMAS[id];
  if (id.startsWith("minecraft:") && MC[`biome.minecraft.${id.slice(10)}`]) return MC[`biome.minecraft.${id.slice(10)}`];
  naoVistos.add(`bioma ${id}`);
  return bonito(id);
}
function ambientesDe(biomas) {
  const achados = new Set();
  for (const id of biomas) {
    if (id === "#cobblemon:is_overworld") { achados.add("qualquer"); continue; }
    const curto = id.replace(/^#?cobblemon:/, "").replace(/^#/, "");
    for (const [amb, , chaves] of AMBIENTES) if (chaves.some((c) => (c.endsWith("/") ? curto.startsWith(c) : curto === c))) achados.add(amb);
  }
  return [...achados];
}

/* ---------- condições de spawn, em português ---------- */

const PRESETS = {
  treetop: "na copa das árvores", urban: "perto de blocos de concreto, fora das vilas", derelict: "no escuro, em construções abandonadas",
  mansion: "em mansões", mansion_bedrooms: "nos quartos de mansões", mansion_dining: "nas salas de jantar de mansões",
  ancient_city: "em cidades ancestrais", desert_pyramid: "em templos do deserto", jungle_pyramid: "em templos da selva",
  end_city: "em cidades do Fim", foliage: "perto de folhas", illager_structures: "em postos de saqueadores, cabanas de bruxa e mansões",
  lava: "na lava", nether_fossil: "perto de fósseis do Nether", nether_structures: "em bastiões e fortalezas do Nether",
  ocean_monument: "em monumentos oceânicos", ocean_ruins: "em ruínas oceânicas", pillager_outpost: "em postos de saqueadores",
  redstone: "perto de redstone", ruined_portal: "em portais em ruínas", saccharine_tree: "perto de árvores sacarinas",
  stronghold: "em fortalezas subterrâneas", trail_ruins: "em ruínas de trilha"
};
const PRESETS_DE_OUTROS_MODS = new Set(["salt", "webs"]);
const ESTRUTURAS_DO_JOGO = {
  "#minecraft:village": "em vilas", "minecraft:swamp_hut": "em cabanas de bruxa", "minecraft:monument": "em monumentos oceânicos",
  "#minecraft:shipwreck": "em naufrágios", "minecraft:igloo": "em iglus", "minecraft:desert_well": "em poços do deserto",
  "#cobblemon:ruin": "em ruínas do Cobblemon", "#cobblemon:ruins/arch": "em ruínas em arco", "#cobblemon:shipwreck_cove": "em enseadas de naufrágio"
};
const BLOCOS_POR_TAG = {
  "#cobblemon:flowers": "flores", "#cobblemon:white_flowers": "flores brancas", "#cobblemon:red_flowers": "flores vermelhas",
  "#cobblemon:pink_flowers": "flores cor-de-rosa", "#cobblemon:orange_flowers": "flores laranja", "#cobblemon:yellow_flowers": "flores amarelas",
  "#cobblemon:blue_flowers": "flores azuis", "#cobblemon:small_flowers": "flores pequenas",
  "#cobblemon:saccharine_trees": "árvores sacarinas", "#cobblemon:dead_coral": "coral morto", "#cobblemon:gemstones": "pedras preciosas",
  "#cobblemon:apricorns": "bolotas", "#cobblemon:berries": "pés de baga", "#cobblemon:concrete_blocks": "blocos de concreto",
  "#minecraft:coral_blocks": "blocos de coral", "#minecraft:corals": "corais", "#minecraft:sand": "areia",
  "#minecraft:iron_ores": "minério de ferro", "#minecraft:coal_ores": "minério de carvão", "#minecraft:redstone_ores": "minério de redstone",
  "#minecraft:leaves": "folhas", "#minecraft:gold_ores": "minério de ouro", "#minecraft:copper_ores": "minério de cobre",
  "#minecraft:diamond_ores": "minério de diamante", "#minecraft:emerald_ores": "minério de esmeralda", "#minecraft:lapis_ores": "minério de lápis-lazúli",
  "#minecraft:beehives": "colmeias", "#minecraft:candles": "velas", "#minecraft:campfires": "fogueiras", "#minecraft:logs": "troncos"
};
const HORAS = { day: "de dia", night: "à noite", dusk: "ao entardecer", dawn: "ao amanhecer", noon: "ao meio-dia", midnight: "à meia-noite", morning: "de manhã", afternoon: "à tarde" };
const LUAS = { "0": "na lua cheia", "4": "na lua nova", "0,4": "na lua cheia ou na lua nova", "1-3": "na lua minguante", "5-7": "na lua crescente" };
const CONTEXTOS = { grounded: "Em terra", submerged: "Debaixo d'água", surface: "Na superfície da água", seafloor: "No fundo do mar", fishing: "Pescando" };
const FORMAS = { alolan: "Alola", galarian: "Galar", hisuian: "Hisui", paldean: "Paldea", valencian: "Valência" };
const lista = (itens) => (itens.length <= 1 ? itens.join("") : `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`);

function nomesDeBlocos(ids) {
  const nomes = [];
  for (const id of ids) {
    if (OUTROS_MODS.test(id) || id.startsWith("#c:")) continue;
    if (id.startsWith("#")) { if (BLOCOS_POR_TAG[id]) nomes.push(BLOCOS_POR_TAG[id]); else naoVistos.add(`bloco ${id}`); continue; }
    const nome = nomeDoItem(id);
    if (nome) nomes.push(nome.toLowerCase());
  }
  return [...new Set(nomes)];
}

let nomeDaEstrutura = () => null;             // definido depois de ler as estruturas

function condicoes(regra) {
  const c = regra.condition || {}, frases = [];
  for (const p of regra.presets || []) if (PRESETS[p]) frases.push(PRESETS[p]);
  for (const e of c.structures || []) {
    if (OUTROS_MODS.test(e)) continue;
    const nome = ESTRUTURAS_DO_JOGO[e] ?? (nomeDaEstrutura(e) ? `em ${nomeDaEstrutura(e)}` : null);
    if (nome) frases.push(nome); else naoVistos.add(`estrutura ${e}`);
  }
  if (c.canSeeSky === true) frases.push("a céu aberto");
  else if (c.canSeeSky === false) frases.push("sem céu à vista");
  else if (c.maxSkyLight !== undefined && c.maxSkyLight <= 7) frases.push("longe da luz do céu");
  if (c.isThundering) frases.push("com trovoada");
  else if (c.isRaining === true) frases.push("com chuva");
  else if (c.isRaining === false) frases.push("sem chuva");
  if (c.moonPhase !== undefined) frases.push(LUAS[String(c.moonPhase)] ?? "em certa fase da lua");
  if (c.minY !== undefined && c.maxY !== undefined) frases.push(`entre Y ${c.minY} e Y ${c.maxY}`);
  else if (c.maxY !== undefined) frases.push(`abaixo de Y ${c.maxY}`);
  else if (c.minY !== undefined) frases.push(`acima de Y ${c.minY}`);
  const perto = nomesDeBlocos(c.neededNearbyBlocks || []);
  if (perto.length) frases.push(`perto de ${lista(perto.slice(0, 4))}`);
  const sobre = nomesDeBlocos(c.neededBaseBlocks || []);
  if (sobre.length) frases.push(`sobre ${lista(sobre.slice(0, 3))}`);
  if (c.isSlimeChunk) frases.push("em chunk de slime");
  if (c.minLureLevel) frases.push(`com encantamento Isca ${c.minLureLevel} ou maior`);
  if (c.rodType || c.bait) frases.push("com vara ou isca específica");
  return [...new Set(frases)];
}

/* ---------- espécies ---------- */

const chaveDeNome = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, "");
const brutas = [];
for (const caminho of await arquivos(join(DADOS, "species"))) brutas.push(await json(caminho));
brutas.sort((a, b) => a.nationalPokedexNumber - b.nationalPokedexNumber);
const porChave = Object.fromEntries(brutas.map((d) => [chaveDeNome(d.name), d]));
const ATRIBUTOS = { hp: "PS", attack: "Ataque", defence: "Defesa", special_attack: "Ataque Especial", special_defence: "Defesa Especial", speed: "Velocidade" };

/* "typhlosion hisuian" -> { d: espécie, forma: "Hisui" } */
function alvo(textoDoAlvo) {
  const [id, ...resto] = textoDoAlvo.split(" ");
  const forma = resto.map((r) => FORMAS[r] ?? (r.startsWith("region_bias=") ? null : undefined)).find((f) => f);
  return { d: porChave[chaveDeNome(id)], forma: forma || null, extras: resto };
}

async function biomasDaTag(id) {                 // nomes dos biomas do jogo base que uma tag do mod cobre
  if (!id.startsWith("#cobblemon:")) return id.startsWith("minecraft:") ? [nomeDoBioma(id)] : [];
  const { valores } = await tag("worldgen/biome", id.slice(11));
  return valores.filter((v) => v.startsWith("minecraft:")).map((v) => MC[`biome.minecraft.${v.slice(10)}`]).filter(Boolean);
}

async function requisito(r) {
  switch (r.variant) {
    case "level": return `nível ${r.minLevel}`;
    case "held_item": return `segurando ${nomeDoItem(String(r.itemCondition).replace(/^#/, "")) ?? "certo item"}`;
    case "time_range": return HORAS[r.range] ?? "em certo horário";
    case "friendship": return `amizade ${r.amount} ou mais`;
    case "has_move": return `sabendo ${texto(`cobblemon.move.${r.move}`) ?? r.move}`;
    case "has_move_type": return `sabendo um golpe do tipo ${TIPOS[r.type] ?? r.type}`;
    case "use_move": return `depois de usar ${texto(`cobblemon.move.${r.move}`) ?? r.move} ${r.amount} vezes`;
    case "stat_compare": return `com ${ATRIBUTOS[r.highStat] ?? r.highStat} maior que ${ATRIBUTOS[r.lowStat] ?? r.lowStat}`;
    case "stat_equal": return `com ${ATRIBUTOS[r.statOne] ?? r.statOne} e ${ATRIBUTOS[r.statTwo] ?? r.statTwo} iguais`;
    case "moon_phase": return r.moonPhase === "FULL_MOON" ? "na lua cheia" : "em certa fase da lua";
    case "party_member": return `com ${alvo(r.target).d?.name ?? r.target} na equipe`;
    case "weather": return r.isThundering ? "com trovoada" : r.isRaining ? "com chuva" : "sem chuva";
    case "blocks_traveled": return `depois de andar ${r.amount} blocos com ele`;
    case "defeat": { const a = alvo(r.target); return `depois de derrotar ${r.amount} ${a.d?.name ?? r.target}`; }
    case "properties": return r.target === "gender=female" ? "se for fêmea" : r.target === "gender=male" ? "se for macho" : null;
    case "structure": return r.structureCondition ? "dentro de certa estrutura" : r.structureAnticondition === "#minecraft:village" ? "fora de vilas" : "longe de certa estrutura";
    case "biome": {
      const id = r.biomeCondition ?? r.biomeAnticondition;
      const nomes = id ? await biomasDaTag(id) : [];
      if (!nomes.length) return r.biomeCondition ? "em certos biomas" : "fora de certos biomas";
      const mostra = nomes.length > 5 ? `${nomes.slice(0, 4).join(", ")} e outros ${nomes.length - 4}` : lista(nomes);
      return r.biomeCondition ? `em ${mostra}` : `fora de ${mostra}`;
    }
    case "advancement": return "com certa conquista do jogo";
    case "property_range": return "com certa quantidade acumulada";
    default: naoVistos.add(`requisito ${r.variant}`); return null;
  }
}

async function evolucoes(d) {
  const saida = [];
  for (const e of d.evolutions || []) {
    const a = alvo(e.result);
    if (!a.d) continue;
    const partes = [];
    if (e.variant === "trade") partes.push(e.requiredContext ? `por troca com ${alvo(e.requiredContext).d?.name ?? e.requiredContext}` : "por troca, ou com o Cabo de Ligação");
    if (e.variant === "item_interact") {
      const item = String(e.requiredContext ?? "").replace(/^#/, "");
      partes.push(item.includes(":") ? `usando ${nomeDoItem(item) ?? "certo item"}` : `interagindo com ${alvo(item).d?.name ?? item}`);
    }
    for (const r of e.requirements || []) { const frase = await requisito(r); if (frase) partes.push(frase); }
    if (e.variant === "level_up" && !partes.length) partes.push("ao subir de nível");
    saida.push({ n: a.d.nationalPokedexNumber, forma: a.forma, como: lista(partes) });
  }
  return saida;
}

function drops(d) {
  return (d.drops?.entries || []).map((e) => {
    const nome = nomeDoItem(e.item);
    if (!nome) return null;
    const detalhe = e.percentage !== undefined ? `${String(e.percentage).replace(".", ",")}% das vezes`
      : e.quantityRange ? `${e.quantityRange.replace("-", " a ")} por vez` : "sempre";
    return [nome, detalhe];
  }).filter(Boolean);
}

const ROTULOS = { legendary: "Lendário", mythical: "Mítico", starter: "Inicial", fossil: "Fóssil", paradox: "Paradoxo", ultra_beast: "Ultra Beast", baby: "Bebê" };
const MODOS = { LAND: "em terra", AIR: "pelo ar", LIQUID: "pela água" };

const especies = {};
for (const d of brutas) {
  especies[d.nationalPokedexNumber] = {
    n: d.nationalPokedexNumber, nome: d.name, impl: Boolean(d.implemented),
    tipos: [d.primaryType, d.secondaryType].filter(Boolean).map((t) => TIPOS[t] ?? t),
    desc: texto((d.pokedex || [])[0]) ?? null,
    rotulos: (d.labels || []).map((l) => ROTULOS[l]).filter(Boolean),
    drops: drops(d),
    montaria: d.riding ? Object.keys(d.riding.behaviours || {}).map((m) => MODOS[m]).filter(Boolean) : [],
    assentos: d.riding ? (d.riding.seats || []).length : 0,
    ombro: Boolean(d.shoulderMountable),
    evolui: await evolucoes(d),
    spawns: [], bandos: [], ambientes: [], raridade: null, bando: false, alfa: false
  };
}

/* ---------- estruturas (lidas antes dos spawns, que as citam) ---------- */

const FAMILIAS = {
  habitats: ["Habitats", "Pequenos recantos naturais, cada um feito para certo grupo de Pokémon."],
  ruins: ["Ruínas", "Restos de construções antigas, quase sempre com algo enterrado."],
  shipwreck_coves: ["Enseadas de naufrágio", "Cascos encalhados em oceanos frios."],
  fishing_boat: ["Barcos de pesca", "Embarcações pequenas, na praia ou em alto-mar."]
};
const nomesDeHabitat = Object.fromEntries(Object.keys(EN).filter((k) => /^cobblemon\.habitat\..+\.name$/.test(k)).map((k) => [k.split(".")[2].replace(/_/g, "").replace("deserted", "desert"), texto(k)]));
const estruturas = [];
const baseDeEstruturas = join(DADOS, "worldgen", "structure");
for (const caminho of await arquivos(baseDeEstruturas)) {
  const id = semExt(caminho, baseDeEstruturas), d = await json(caminho);
  const [familia, curto] = id.split("/");
  const oficial = nomesDeHabitat[curto.replace(/_/g, "").replace("deserted", "desert")] ?? null;
  const biomas = Array.isArray(d.biomes) ? d.biomes : [d.biomes];
  estruturas.push({ id: `cobblemon:${id}`, familia, nome: oficial ?? bonito(curto), oficial: Boolean(oficial), biomas: biomas.map(nomeDoBioma), especies: [] });
}
const estruturaPorId = Object.fromEntries(estruturas.map((e) => [e.id, e]));
nomeDaEstrutura = (id) => estruturaPorId[id]?.nome ?? null;
/* quais estruturas cada tag de estrutura do mod cobre */
async function estruturasDe(id) {
  if (estruturaPorId[id]) return [estruturaPorId[id]];
  if (!id.startsWith("#cobblemon:")) return [];
  return (await tag("worldgen/structure", id.slice(11))).valores.map((v) => estruturaPorId[v]).filter(Boolean);
}
const noJogoBase = {};                            // estruturas do Minecraft -> espécies que nascem nelas

/* ---------- spawns ---------- */

const ORDEM = ["common", "uncommon", "rare", "ultra-rare"];
const PARES = [["a céu aberto", "sem céu à vista"], ["com chuva", "sem chuva"]];
const agrupadas = {};                             // espécie -> chave -> linha
const emBando = {};                               // espécie -> raridade (ou "alfa") -> biomas
let regrasLidas = 0, regrasDeOutrosMods = 0;
for (const caminho of await arquivos(join(DADOS, "spawn_pool_world"))) {
  const arquivo = await json(caminho);
  if (arquivo.enabled === false || (arquivo.neededInstalledMods || []).length) continue;
  for (const regra of arquivo.spawns || []) {
    regrasLidas++;
    const c = regra.condition || {};
    const biomas = (c.biomes || []).filter((b) => !OUTROS_MODS.test(b));
    const soDeOutros = ((c.biomes || []).length && !biomas.length) || (regra.presets || []).some((p) => PRESETS_DE_OUTROS_MODS.has(p)) ||
      ((c.structures || []).length && (c.structures || []).every((e) => OUTROS_MODS.test(e)));
    if (soDeOutros) { regrasDeOutrosMods++; continue; }

    if (regra.type === "pokemon-herd") {
      for (const membro of regra.herdablePokemon || []) {
        const a = alvo(membro.pokemon);
        if (!a.d) continue;
        const e = especies[a.d.nationalPokedexNumber];
        const alfa = membro.pokemon.includes("alpha=true");
        if (alfa) e.alfa = true; else e.bando = true;
        // os bandos também são um jeito de a espécie nascer: guarda-se onde, por raridade
        const chave = `${alfa ? "alfa" : regra.bucket}`;
        ((emBando[a.d.nationalPokedexNumber] ??= {})[chave] ??= []).push(...biomas);
      }
      continue;
    }
    if (regra.type !== "pokemon" || !ORDEM.includes(regra.bucket)) continue;
    const a = alvo(regra.pokemon);
    if (!a.d) { naoVistos.add(`espécie ${regra.pokemon}`); continue; }
    const frases = condicoes(regra);
    const hora = HORAS[c.timeRange] ?? null;
    const [minimo, maximo] = String(regra.level).split("-").map(Number);
    const linha = { b: regra.bucket, c: [regra.spawnablePositionType], n: [minimo, maximo ?? minimo], h: hora, f: a.forma, q: frases, bi: biomas };
    const chave = [linha.b, linha.h, linha.f, frases.join(";")].join("|");
    const daEspecie = (agrupadas[a.d.nationalPokedexNumber] ??= {});
    const igual = daEspecie[chave];
    if (igual) {
      igual.bi.push(...biomas); igual.c.push(...linha.c);
      igual.n = [Math.min(igual.n[0], linha.n[0]), Math.max(igual.n[1], linha.n[1])];
    } else daEspecie[chave] = linha;

    for (const e of c.structures || []) {
      for (const est of await estruturasDe(e)) est.especies.push(a.d.nationalPokedexNumber);
      if (ESTRUTURAS_DO_JOGO[e] && !e.includes("cobblemon")) (noJogoBase[e] ??= []).push(a.d.nationalPokedexNumber);
    }
  }
}
for (const [n, linhas] of Object.entries(agrupadas)) {
  const e = especies[n];
  // duas linhas que só diferem em "a céu aberto" e "sem céu à vista" (ou em chover e não chover) viram uma, sem essa condição
  const fundidas = {};
  for (const l of Object.values(linhas)) {
    l.bi = [...new Set(l.bi)].sort(); l.c = [...new Set(l.c)].sort();
    for (const par of PARES) {
      const semPar = l.q.filter((f) => !par.includes(f));
      if (semPar.length === l.q.length) continue;
      const chave = [l.b, l.h, l.f, l.bi.join(","), l.c.join(","), semPar.join(";"), par[0]].join("|");
      (fundidas[chave] ??= []).push(l);
    }
  }
  for (const grupo of Object.values(fundidas)) {
    const par = PARES.find((p) => grupo.every((l) => l.q.some((f) => p.includes(f))));
    if (grupo.length < 2 || new Set(grupo.map((l) => l.q.find((f) => par.includes(f)))).size < 2) continue;
    grupo[0].q = grupo[0].q.filter((f) => !par.includes(f));
    grupo[0].n = [Math.min(...grupo.map((l) => l.n[0])), Math.max(...grupo.map((l) => l.n[1]))];
    for (const l of grupo.slice(1)) l.descartada = true;
  }
  e.spawns = Object.values(linhas).filter((l) => !l.descartada)
    .sort((x, y) => ORDEM.indexOf(x.b) - ORDEM.indexOf(y.b) || (x.f ? 1 : 0) - (y.f ? 1 : 0) || x.q.length - y.q.length);
  e.ambientes = [...new Set(e.spawns.flatMap((l) => ambientesDe(l.bi)))];
  e.raridade = e.spawns.length ? ORDEM.find((b) => e.spawns.some((l) => l.b === b)) : null;       // o balde mais comum em que aparece
  for (const l of e.spawns) l.bi = l.bi.map(nomeDoBioma);
}
for (const [n, porRaridade] of Object.entries(emBando)) {
  const e = especies[n];
  e.bandos = Object.entries(porRaridade)
    .filter(([b]) => b === "alfa" || ORDEM.includes(b))
    .sort(([x], [y]) => (x === "alfa") - (y === "alfa") || ORDEM.indexOf(x) - ORDEM.indexOf(y))
    .map(([b, bi]) => ({ b, bi: [...new Set(bi)].sort() }));
  const todos = e.bandos.flatMap((l) => l.bi);
  e.ambientes = [...new Set([...(e.ambientes || []), ...ambientesDe(todos)])];
  e.raridade ??= ORDEM.find((b) => e.bandos.some((l) => l.b === b)) ?? null;
  for (const l of e.bandos) l.bi = l.bi.map(nomeDoBioma);
}
for (const est of estruturas) est.especies = [...new Set(est.especies)].sort((a, b) => a - b);
const estruturasDoJogo = Object.entries(noJogoBase).map(([id, ns]) => ({ nome: ESTRUTURAS_DO_JOGO[id].replace(/^em /, ""), especies: [...new Set(ns)].sort((a, b) => a - b) }))
  .sort((a, b) => b.especies.length - a.especies.length);

/* ---------- glossário de biomas ---------- */

const usados = new Set(Object.values(agrupadas).flatMap((ls) => Object.values(ls).flatMap((l) => l.bi)));
const biomas = [];
for (const id of Object.keys(BIOMAS)) {
  if (!usados.has(id) || id === "#cobblemon:is_overworld") continue;
  biomas.push({ nome: BIOMAS[id], ambiente: ambientesDe([id])[0] ?? null, inclui: await biomasDaTag(id) });
}

/* ---------- itens ---------- */

const GRUPOS = [
  ["bolas", "Poké Bolas", ["poke_balls"]],
  ["bolotas", "Bolotas", ["apricorns", "apricorn_sprouts"]],
  ["bagas", "Bagas", ["berries"]],
  ["hortelas", "Hortelãs", ["mints", "mint_leaves", "mint_seeds"]],
  ["evolucao", "Itens de evolução", ["evolution_items", "evolution_stones"]],
  ["segurados", "Itens segurados", ["held/is_held_item", "type_gems"]],
  ["remedios", "Remédios, vitaminas e itens de batalha", ["potions", "restores", "revives", "remedies", "ethers", "vitamins", "candies", "experience_candies", "iv_candies", "feathers", "mochis", "ability_changers", "herbs", "full_heal_bottles", "battle_items"]],
  ["comidas", "Comida de Pokémon", ["poke_food", "sweets", "aprijuices", "regional_delicacies", "apples"]],
  ["fosseis", "Fósseis", ["fossils"]],
  ["varas", "Pokévaras", ["poke_rods"]],
  ["maquinas", "Máquinas e blocos", ["machines", "fossil_machine_parts"]]
];
const grupoDe = {};
for (const [grupo, , tags] of GRUPOS) for (const t of tags) for (const id of (await tag("item", t)).valores) grupoDe[id] ??= grupo;

/* Os itens de uma etiqueta, para representá-la numa receita. As do mod estão nos dados dele; as do
 * Minecraft, no pacote do jogo (.mod/minecraft, se houver); as de convenção entre mods ("c:lingotes/ferro")
 * são baixadas do repositório público do NeoForge e guardadas em .mod/etiquetas-c para a próxima vez.
 * Devolve todos os itens da etiqueta, abrindo as etiquetas que ela cita. */
const etiquetasSemItem = new Set();
async function valoresDaEtiqueta(id) {
  const [espaco, caminho] = id.split(":");
  if (espaco === "cobblemon") { const t = await tag("item", caminho); return [...t.valores, ...t.externas]; }
  if (espaco === "minecraft") {
    const arquivo = join(FONTE, "minecraft", "data", "minecraft", "tags", "item", ...`${caminho}.json`.split("/"));
    return existsSync(arquivo) ? (await json(arquivo)).values : [];
  }
  if (espaco === "c") {
    const local = join(FONTE, "etiquetas-c", `${caminho.replace(/\//g, "__")}.json`);
    if (!existsSync(local)) {
      const resposta = await fetch(`https://raw.githubusercontent.com/neoforged/NeoForge/1.21.1/src/generated/resources/data/c/tags/item/${caminho}.json`);
      await mkdir(dirname(local), { recursive: true });
      await writeFile(local, resposta.ok ? await resposta.text() : '{"values":[]}');
    }
    return (await json(local)).values;
  }
  return [];
}
async function itensDaEtiqueta(id, nivel = 0) {
  const itens = [];
  for (const bruto of nivel > 4 ? [] : await valoresDaEtiqueta(id)) {
    const v = typeof bruto === "string" ? bruto : bruto.id;
    if (v.startsWith("#")) itens.push(...await itensDaEtiqueta(v.slice(1), nivel + 1));
    else if (/^(minecraft|cobblemon):/.test(v)) itens.push(v);
  }
  return [...new Set(itens)];
}

/* Receitas de bancada: item -> a grade 3×3 como aparece no jogo, os ingredientes por nome e quanto rende.
 * Cada casa da grade é null (vazia) ou [id do item que aparece nela, nome a mostrar]. Para etiquetas, o item é o
 * primeiro da etiqueta e o nome é o do grupo. */
const receitas = {};
for (const caminho of await arquivos(join(DADOS, "recipe"))) {
  const r = await json(caminho);
  const feito = r.result?.id ?? r.result?.item;
  if (!feito || !/crafting_(shaped|shapeless)/.test(r.type || "") || receitas[feito]) continue;
  const casa = async (bruto) => {
    const ing = Array.isArray(bruto) ? bruto[0] : bruto;                 // com alternativas, vale a primeira
    if (ing?.item) return nomeDoItem(ing.item) ? [ing.item, nomeDoItem(ing.item)] : null;
    if (!ing?.tag) return null;
    const curto = ing.tag.replace(":", ".").replace(/\//g, ".");
    const membros = await itensDaEtiqueta(ing.tag), representante = membros.find((m) => nomeDoItem(m));
    if (!representante) { etiquetasSemItem.add(ing.tag); return null; }
    // etiqueta com nome na tradução usa o nome; sem nome e com vários itens, vale "o primeiro ou equivalente"
    const grupo = texto(`tag.item.${curto}`) ?? MC[`tag.item.${curto}`] ?? (membros.length > 1 ? `${nomeDoItem(representante)} ou equivalente` : null);
    return [representante, grupo ?? nomeDoItem(representante)];
  };
  const grade = Array(9).fill(null);
  if (r.pattern) {
    for (let y = 0; y < Math.min(3, r.pattern.length); y++) for (let x = 0; x < Math.min(3, r.pattern[y].length); x++) {
      const letra = r.pattern[y][x];
      if (letra !== " " && r.key[letra]) grade[y * 3 + x] = await casa(r.key[letra]);
    }
  } else for (const [k, ing] of (r.ingredients || []).slice(0, 9).entries()) grade[k] = await casa(ing);
  const nomes = [...new Set(grade.filter(Boolean).map(([, nome]) => nome))];
  if (nomes.length) receitas[feito] = { ingredientes: nomes, rende: r.result.count ?? 1, forma: r.pattern ? "grade" : "livre", grade };
}
if (etiquetasSemItem.size) console.warn(`Etiquetas de receita sem item conhecido (a casa ficou vazia): ${[...etiquetasSemItem].join(", ")}`);

const itens = [];
const idsDeItem = new Set([...Object.keys(EN).filter((k) => /^item\.cobblemon\.[a-z0-9_]+$/.test(k)).map((k) => `cobblemon:${k.split(".")[2]}`),
  ...Object.keys(grupoDe).filter((id) => id.startsWith("cobblemon:") && grupoDe[id] === "maquinas")]);
for (const id of idsDeItem) {
  const curto = id.split(":")[1];
  const nome = texto(`item.cobblemon.${curto}`) ?? texto(`block.cobblemon.${curto}`);
  if (!nome || nome.includes("%")) continue;      // nomes com lacuna são montados pelo jogo na hora
  const dica = ["tooltip", "tooltip_1", "tooltip1"].map((t) => texto(`item.cobblemon.${curto}.${t}`) ?? texto(`block.cobblemon.${curto}.${t}`)).find(Boolean) ?? null;
  itens.push({ id: curto, nome, dica, grupo: grupoDe[id] ?? "outros", receita: receitas[id] ?? null });
}
itens.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
// o mesmo nome no mesmo grupo (as seis cores de Pokédex, por exemplo) aparece uma vez só
for (let i = itens.length - 1; i > 0; i--) if (itens[i].nome === itens[i - 1].nome && itens[i].grupo === itens[i - 1].grupo) itens.splice(i, 1);

/* ---------- fósseis ---------- */

const fosseis = [];
for (const caminho of await arquivos(join(DADOS, "fossils"))) {
  const f = await json(caminho), a = alvo(f.result);
  if (a.d) fosseis.push({ n: a.d.nationalPokedexNumber, fosseis: f.fossils.map(nomeDoItem) });
}
fosseis.sort((a, b) => a.n - b.n);

/* ---------- versões ---------- */

let versoes = [];
try {
  const tags = await (await fetch("https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/tags?per_page=100")).json();
  versoes = tags.map((t) => [t.name.replace(/^v/, ""), t.commit.created_at.slice(0, 10)]).filter(([n]) => /^\d/.test(n)).reverse();
} catch {
  try { versoes = (await json(join(RAIZ, "dados", "cobblemon.json"))).versoes; } catch { /* sem rede e sem arquivo anterior */ }
}
const propriedades = existsSync(join(FONTE, "gradle.properties")) ? await readFile(join(FONTE, "gradle.properties"), "utf8") : "";
const versao = /mod_version=(.+)/.exec(propriedades)?.[1].trim() ?? opcao("versao") ?? versoes.at(-1)?.[0] ?? null;

const saida = {
  versao, versoes,
  ambientes: AMBIENTES.map(([id, nome]) => ({ id, nome })),
  grupos: [...GRUPOS.map(([id, nome]) => ({ id, nome })), { id: "outros", nome: "Outros itens" }],
  familias: Object.entries(FAMILIAS).map(([id, [nome, texto]]) => ({ id, nome, texto })),
  contextos: CONTEXTOS,
  especies, biomas, itens, estruturas, estruturasDoJogo, fosseis,
  contagens: {
    regras: regrasLidas, deOutrosMods: regrasDeOutrosMods,
    bagas: (await arquivos(join(DADOS, "berries"))).length, varas: (await arquivos(join(DADOS, "pokerods"))).length,
    temperos: (await arquivos(join(DADOS, "seasonings"))).length, estilosDeMontaria: (await arquivos(join(DADOS, "ride_settings"))).length
  }
};
await writeFile(join(RAIZ, "dados", "cobblemon.json"), JSON.stringify(saida), "utf8");

const lidas = Object.values(especies);
console.log(`cobblemon.json (versão ${versao}): ${lidas.filter((e) => e.impl).length} de ${lidas.length} espécies implementadas; ` +
  `${lidas.filter((e) => e.spawns.length || e.bandos.length).length} nascem no mundo; ${itens.length} itens; ${estruturas.length} estruturas; ${fosseis.length} fósseis; ` +
  `${regrasDeOutrosMods} regras de spawn ignoradas por dependerem de outros mods`);
console.log("itens por grupo:", Object.fromEntries(saida.grupos.map((g) => [g.id, itens.filter((i) => i.grupo === g.id).length])));
if (naoVistos.size) console.log("Sem rótulo (confira):", [...naoVistos].sort().join(" | "));
