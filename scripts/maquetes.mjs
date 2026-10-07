#!/usr/bin/env node
/* Faz as maquetes de blocos do atlas do Cobblemon:
 *   - cada estrutura do mod, montada a partir dos arquivos .nbt e das regras de encaixe (jigsaw) dele;
 *   - um pedaço de terreno para cada ambiente (scripts/lib/dioramas.mjs).
 * Grava, para cada uma:
 *   src/maquetes/<nome>.json        os blocos, para o modelo que gira no navegador
 *   src/arte/maquete/<nome>.webp    a mesma maquete desenhada parada
 * e dados/maquetes.json com o que o build precisa saber delas.
 *
 * As maquetes não levam textura: cada bloco entra com a cor média da textura dele. As texturas
 * do Minecraft são lidas aqui só para tirar essa média e não vão para o repositório.
 *
 * Uso: node scripts/maquetes.mjs --dados <data/cobblemon do mod> --ativos <assets/cobblemon do mod> --minecraft <assets/minecraft do jogo>
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { lerNbt } from "./lib/nbt.mjs";
import { DIORAMAS } from "./lib/dioramas.mjs";
import { malhaDaMaquete } from "../src/js/maquete-malha.js";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const arg = (n) => args[args.indexOf(n) + 1];
const DADOS = arg("--dados"), ATIVOS = { cobblemon: arg("--ativos"), minecraft: arg("--minecraft") };
if (![DADOS, ATIVOS.cobblemon, ATIVOS.minecraft].every((c) => c && existsSync(c))) { console.error("Uso: node scripts/maquetes.mjs --dados <data/cobblemon> --ativos <assets/cobblemon> --minecraft <assets/minecraft>"); process.exit(1); }
const json = (c) => JSON.parse(readFileSync(c, "utf8"));
const sem = (ref) => String(ref).split(":").pop();
const espaco = (ref) => (String(ref).includes(":") ? String(ref).split(":")[0] : "minecraft");

/* ---------- a cor de cada bloco ---------- */

const TINTAS = [                                   // texturas que o jogo guarda em cinza e pinta conforme o bioma
  [/^(grass_block|short_grass|tall_grass|fern|large_fern|grass)$/, 0x8EB85A], [/^birch_leaves$/, 0x80A755], [/^spruce_leaves$/, 0x619961],
  [/^(oak|jungle|acacia|dark_oak|mangrove)_leaves$|^vine$/, 0x6BA03A], [/^lily_pad$/, 0x2F8A33], [/^(water|bubble_column)$/, 0x3F76E4]
];
const medias = new Map();
async function media(arquivo) {
  if (medias.has(arquivo)) return medias.get(arquivo);
  let cor = null;
  if (existsSync(arquivo)) {
    const { data, info } = await sharp(arquivo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let r = 0, g = 0, b = 0, a = 0;
    for (let i = 0; i < info.width * Math.min(info.height, info.width) * 4; i += 4) { const p = data[i + 3] / 255; r += data[i] * p; g += data[i + 1] * p; b += data[i + 2] * p; a += p; }
    if (a > 0) cor = [r / a, g / a, b / a];
  }
  medias.set(arquivo, cor);
  return cor;
}
function texturasDoModelo(ref, nivel = 0) {
  const arquivo = join(ATIVOS[espaco(ref)] ?? "", "models", `${sem(ref)}.json`);
  if (nivel > 5 || !existsSync(arquivo)) return {};
  const m = json(arquivo);
  return { ...(m.parent ? texturasDoModelo(m.parent, nivel + 1) : {}), ...(m.textures || {}) };
}
const cores = new Map(), semCor = new Set();
const APELIDOS = { "minecraft:grass": "minecraft:short_grass", "minecraft:dirt_block": "minecraft:dirt" };   // nomes antigos ou trocados nos arquivos do mod
async function corDoBloco(nome) {
  nome = APELIDOS[nome] ?? nome;
  if (cores.has(nome)) return cores.get(nome);
  const id = sem(nome), estados = join(ATIVOS[espaco(nome)] ?? "", "blockstates", `${id}.json`);
  let texturas = {};
  if (existsSync(estados)) {
    const e = json(estados);
    const primeiro = e.variants ? Object.values(e.variants)[0] : e.multipart?.[0]?.apply;
    const modelo = (Array.isArray(primeiro) ? primeiro[0] : primeiro)?.model;
    if (modelo) texturas = texturasDoModelo(modelo);
  }
  const resolver = (v, n = 0) => (typeof v === "string" && v.startsWith("#") && n < 5 ? resolver(texturas[v.slice(1)], n + 1) : v);
  const escolher = async (chaves) => {
    for (const k of [...chaves, ...Object.keys(texturas)]) {
      const ref = resolver(texturas[k]);
      if (!ref) continue;
      const cor = await media(join(ATIVOS[espaco(ref)] ?? "", "textures", `${sem(ref)}.png`));
      if (cor) return cor;
    }
    const pasta = ATIVOS[espaco(nome)];
    if (!pasta) return null;
    return (await media(join(pasta, "textures", "block", `${id}.png`))) ?? (await media(join(pasta, "textures", "block", `${id}_still.png`)));
  };
  let topo = await escolher(["top", "end", "up", "all", "texture", "cross", "plant", "particle"]);
  let lado = await escolher(["side", "all", "texture", "cross", "plant", "wall", "particle"]);
  if (!topo && !lado) { semCor.add(nome); topo = lado = [150, 150, 150]; }
  topo ??= lado; lado ??= topo;
  const tinta = TINTAS.find(([r]) => r.test(id))?.[1];
  const pintar = (c, forcar) => (tinta && forcar ? [(c[0] * (tinta >> 16 & 255)) / 255 * 1.25, (c[1] * (tinta >> 8 & 255)) / 255 * 1.25, (c[2] * (tinta & 255)) / 255 * 1.25] : c);
  const inteiro = (c) => (Math.min(255, Math.round(c[0])) << 16) | (Math.min(255, Math.round(c[1])) << 8) | Math.min(255, Math.round(c[2]));
  const so = id === "grass_block";                   // na grama só o topo é pintado
  const par = [inteiro(pintar(topo, true)), inteiro(pintar(lado, !so))];
  cores.set(nome, par);
  return par;
}

/* ---------- a forma de cada bloco ---------- */

const IGNORAR = /(^|:)(air|cave_air|void_air|structure_void|structure_block|barrier|light|vine|glow_lichen|ladder|sculk_vein|tripwire|redstone_wire|fire|soul_fire|cobweb|bubble_column)$|_wall_(sign|torch|banner|head|skull|fan)$|wall_torch$|_banner$|hanging_sign$/;
const LADOS = { north: 0, east: 1, south: 2, west: 3 };
function formaDe(nome, props = {}) {
  const id = sem(nome);
  if (IGNORAR.test(nome) || !ATIVOS[espaco(nome)] || id === "strucutre_void") return -1;   // blocos de outros mods ficam de fora
  if (/^(water|flowing_water)$/.test(id)) return 6;
  if (/_slab$/.test(id)) return props.type === "double" ? 0 : props.type === "top" ? 2 : 1;
  if (/_stairs$/.test(id)) return (props.half === "top" ? 12 : 8) + (LADOS[props.facing] ?? 0);
  if (/glass|^ice$|^frosted_ice$|slime_block|honey_block/.test(id) && !/pane/.test(id)) return 7;
  if (/_fence$|_fence_gate$|_wall$|_pane$|iron_bars|chain$|_rod$|bamboo$|scaffolding|pointed_dripstone|_door$|cactus|sugar_cane|kelp|chorus_plant|candle|_post$|torch$|totem/.test(id)) return 3;
  if (/carpet|_pressure_plate$|^snow$|lily_pad|rail$|_trapdoor$|frogspawn|pink_petals|leaf_litter|^.*_layer$|repeater|comparator/.test(id)) return 5;
  if (/lantern|flower_pot|^potted_|_head$|_skull$|_button$|lever|_egg$|sea_pickle|campfire|_candle_cake|brewing_stand|bell$|amethyst_cluster|_bud$|berries_plant|pokeball|display_case|gilded_chest|relic_coin/.test(id)) return 16;
  if (/sapling|tulip|orchid|dandelion|poppy|allium|bluet|daisy|cornflower|lily_of_the_valley|torchflower|sunflower|lilac|peony|rose|_grass$|^fern$|large_fern|dead_bush|mushroom$|fungus$|roots$|sprouts|seagrass|coral$|coral_fan$|wheat|carrots|potatoes|beetroots|sweet_berry_bush|nether_wart$|azalea$|dripleaf|spore_blossom|hanging_roots|propagule|pitcher|mint|vivichoke|revival_herb|medicinal_leek|big_root|energy_root|_berry$|apricorn_sapling|galarica|hearty_grains|tumblestone_cluster|^grass$|_bush$|eyeblossom|firefly_bush|cocoa|melon_stem|pumpkin_stem|attached_.*_stem|saccharine_sapling|nut_bush/.test(id)) return 4;
  return 0;
}

/* ---------- peças e encaixes ---------- */

const pecas = new Map();
function peca(local) {
  if (pecas.has(local)) return pecas.get(local);
  const arquivo = join(DADOS, "structure", `${sem(local)}.nbt`);
  let p = null;
  if (existsSync(arquivo)) {
    const n = lerNbt(readFileSync(arquivo)), paleta = n.palette ?? n.palettes?.[0] ?? [];
    const blocos = [], encaixes = [];
    for (const b of n.blocks) {
      const e = paleta[b.state];
      if (e.Name === "minecraft:jigsaw") {
        const [frente, cima] = (e.Properties?.orientation ?? "north_up").split("_");
        encaixes.push({ pos: b.pos, frente, cima, nome: b.nbt?.name, alvo: b.nbt?.target, pool: b.nbt?.pool, junta: b.nbt?.joint ?? "rollable", fim: b.nbt?.final_state ?? "minecraft:air" });
      } else blocos.push({ pos: b.pos, nome: e.Name, props: e.Properties || {} });
    }
    p = { tamanho: n.size, blocos, encaixes, solidos: blocos.filter((b) => !IGNORAR.test(b.nome)).length };   // o arquivo guarda também o ar; ele não conta no tamanho
  }
  pecas.set(local, p);
  return p;
}
const DIRECOES = { north: [0, 0, -1], south: [0, 0, 1], east: [1, 0, 0], west: [-1, 0, 0], up: [0, 1, 0], down: [0, -1, 0] };
const girarPonto = ([x, y, z], r) => (r === 0 ? [x, y, z] : r === 1 ? [-z, y, x] : r === 2 ? [-x, y, -z] : [z, y, -x]);
const NOMES = ["north", "east", "south", "west"];
const girarLado = (lado, r) => (lado in LADOS ? NOMES[(LADOS[lado] + r) % 4] : lado);
const elementos = (ref) => {
  const arquivo = join(DADOS, "worldgen", "template_pool", `${sem(ref)}.json`);
  if (espaco(ref) !== "cobblemon" || !existsSync(arquivo)) return [];
  return json(arquivo).elements.flatMap((x) => (x.element.location ? [{ local: x.element.location, peso: x.weight, regras: x.element.processors }] : [])).filter((x) => peca(x.local));
};
/* Os processadores de uma peça: regras que trocam um bloco por outro na hora de gerar. O mod constrói
 * as peças com blocos marcadores (ouro, pedra-negra) e é aqui que eles viram terreno, ou somem. */
const listas = new Map();
function processadores(ref) {
  if (!ref) return [];
  if (typeof ref === "object") return ref.processors || [];
  if (!listas.has(ref)) {
    const arquivo = join(DADOS, "worldgen", "processor_list", `${sem(ref)}.json`);
    listas.set(ref, espaco(ref) === "cobblemon" && existsSync(arquivo) ? json(arquivo).processors || [] : []);
  }
  return listas.get(ref);
}
function processar(blocos, ref, rnd) {
  for (const proc of processadores(ref)) {
    const regra = proc.processor_type === "minecraft:capped" ? proc.delegate : proc;
    if (regra?.processor_type !== "minecraft:rule") continue;
    let resta = proc.processor_type === "minecraft:capped" ? (typeof proc.limit === "number" ? proc.limit : 8) : Infinity;
    for (const b of proc.processor_type === "minecraft:capped" ? embaralhar(blocos.map((x) => ({ x, peso: 1 })), rnd).map((x) => x.x) : blocos) {
      if (resta <= 0) break;
      for (const r of regra.rules || []) {
        const e = r.input_predicate || {}, alvo = e.block ?? e.block_state?.Name;
        if (alvo !== b.nome) continue;
        if (e.block_state?.Properties && !Object.entries(e.block_state.Properties).every(([k, v]) => String(b.props[k]) === String(v))) continue;
        if (e.probability !== undefined && rnd() >= e.probability) continue;
        b.nome = r.output_state.Name; b.props = r.output_state.Properties || {};
        resta--;
        break;
      }
    }
  }
  return blocos;
}
function acaso(semente) {                            // o mesmo sorteio a cada execução
  let s = [...semente].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7) >>> 0;
  return () => { s = (Math.imul(s ^ (s >>> 15), 0x2C1B3C6D) + 0x9E3779B9) >>> 0; return ((s ^ (s >>> 13)) >>> 0) / 4294967296; };
}
const embaralhar = (lista, rnd) => lista.map((x) => [x, Math.pow(rnd(), 1 / Math.max(1, x.peso))]).sort((a, b) => b[1] - a[1]).map(([x]) => x);

/* Monta uma estrutura como o jogo: começa pela peça inicial e encaixa as outras nos conectores,
 * sem deixar duas peças ocuparem o mesmo lugar. O sorteio é fixo, para a maquete não mudar. */
function montar(inicio, profundidade, semente) {
  const rnd = acaso(semente), postas = [], fila = [];
  let volume = 0;
  const LIMITE = 9000;                               // as enseadas de naufrágio têm cavernas enormes: a maquete fica com o miolo delas
  const caixaDe = (p, origem, r) => {
    const a = girarPonto([0, 0, 0], r), b = girarPonto([p.tamanho[0] - 1, p.tamanho[1] - 1, p.tamanho[2] - 1], r);
    return [0, 1, 2].flatMap((k) => [origem[k] + Math.min(a[k], b[k])]).concat([0, 1, 2].map((k) => origem[k] + Math.max(a[k], b[k])));
  };
  const cruza = (a, b) => a[0] <= b[3] && a[3] >= b[0] && a[1] <= b[4] && a[4] >= b[1] && a[2] <= b[5] && a[5] >= b[2];
  const dentro = (a, b) => a[0] >= b[0] && a[3] <= b[3] && a[1] >= b[1] && a[4] <= b[4] && a[2] >= b[2] && a[5] <= b[5];
  const por = (p, origem, r, nivel, pai, regras) => { volume += p.solidos; const nova = { p, origem, r, regras, caixa: caixaDe(p, origem, r), pai, usados: new Set() }; postas.push(nova); fila.push([nova, nivel]); return nova; };
  const primeira = embaralhar(elementos(inicio), rnd)[0];
  if (!primeira) return [];
  por(peca(primeira.local), [0, 0, 0], 0, 0, null, primeira.regras);
  while (fila.length && postas.length < 140 && volume < LIMITE) {
    const [mae, nivel] = fila.shift();
    if (nivel >= profundidade) continue;
    for (const e of mae.p.encaixes) {
      const candidatos = embaralhar(elementos(e.pool), rnd);
      if (!candidatos.length) continue;
      const g = girarPonto(e.pos, mae.r), aqui = [mae.origem[0] + g[0], mae.origem[1] + g[1], mae.origem[2] + g[2]];
      const frente = girarPonto(DIRECOES[e.frente], mae.r), cima = girarPonto(DIRECOES[e.cima] ?? [0, 1, 0], mae.r);
      const alvo = [aqui[0] + frente[0], aqui[1] + frente[1], aqui[2] + frente[2]];
      let posta = false;
      for (const c of candidatos) {
        const filha = peca(c.local);
        for (const r of embaralhar([0, 1, 2, 3].map((x) => ({ x, peso: 1 })), rnd).map((x) => x.x)) {
          for (const k of filha.encaixes) {
            if (sem(k.nome) !== sem(e.alvo)) continue;
            const kf = girarPonto(DIRECOES[k.frente], r);
            if (kf[0] !== -frente[0] || kf[1] !== -frente[1] || kf[2] !== -frente[2]) continue;
            if (frente[1] !== 0 && e.junta === "aligned") { const kc = girarPonto(DIRECOES[k.cima] ?? [0, 1, 0], r); if (kc[0] !== cima[0] || kc[2] !== cima[2]) continue; }
            const kp = girarPonto(k.pos, r), origem = [alvo[0] - kp[0], alvo[1] - kp[1], alvo[2] - kp[2]];
            const caixa = caixaDe(filha, origem, r);
            // cabe se ficar toda dentro da mãe ou se não esbarrar em nenhuma outra peça
            const livre = dentro(caixa, mae.caixa) ? !postas.some((o) => o !== mae && o.pai === mae && cruza(caixa, o.caixa)) : !postas.some((o) => cruza(caixa, o.caixa));
            if (!livre) continue;
            const nova = por(filha, origem, r, nivel + 1, mae, c.regras);
            nova.usados.add(k);
            mae.usados.add(e);
            posta = true;
            break;
          }
          if (posta) break;
        }
        if (posta) break;
      }
    }
  }
  // os blocos de todas as peças, já no lugar; cada conector vira o bloco que ele deixa no fim
  const blocos = new Map();
  const estado = (texto) => { const [nome, resto] = texto.split("["); return { nome: nome.includes(":") ? nome : `minecraft:${nome}`, props: Object.fromEntries((resto || "").replace("]", "").split(",").filter(Boolean).map((x) => x.split("="))) }; };
  for (const { p, origem, r, regras } of postas) {
    const colocar = (pos, nome, props) => {
      const g = girarPonto(pos, r), girado = props.facing ? { ...props, facing: girarLado(props.facing, r) } : props;
      blocos.set(`${origem[0] + g[0]},${origem[1] + g[1]},${origem[2] + g[2]}`, { nome, props: girado });
    };
    for (const b of processar(p.blocos.map((b) => ({ ...b })), regras, rnd)) colocar(b.pos, b.nome, b.props);
    for (const e of p.encaixes) { const f = estado(e.fim); colocar(e.pos, f.nome, f.props); }
  }
  return { blocos, pecas: postas.length, parcial: fila.length > 0 && volume >= LIMITE };
}

/* ---------- da lista de blocos à maquete ---------- */

async function maquete(blocos) {                    // blocos: Map "x,y,z" -> { nome, props }
  const lista = [];
  let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const [chave, b] of blocos) {
    let forma = formaDe(b.nome, b.props);
    if (forma < 0) continue;
    const pos = chave.split(",").map(Number);
    lista.push({ pos, forma, cor: await corDoBloco(b.nome) });
    if (b.props.waterlogged === "true" && forma !== 0 && forma !== 6) lista.push({ pos, forma: 6, cor: await corDoBloco("minecraft:water") });
    for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], pos[k]); max[k] = Math.max(max[k], pos[k]); }
  }
  if (!lista.length) return null;
  const cheios = new Set(lista.filter((b) => b.forma === 0).map((b) => b.pos.join(","))), agua = new Set(lista.filter((b) => b.forma === 6).map((b) => b.pos.join(",")));
  const paleta = [], indice = new Map(), v = [];
  for (const b of lista) {
    const [x, y, z] = b.pos;
    // bloco cercado de cubos pelos seis lados nunca aparece: fica de fora
    if (b.forma === 6 && agua.has(`${x},${y + 1},${z}`)) b.forma = 17;
    if (b.forma === 0 && [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].every(([a, c, d]) => cheios.has(`${x + a},${y + c},${z + d}`))) continue;
    const k = `${b.cor[0]},${b.cor[1]},${b.forma}`;
    if (!indice.has(k)) { indice.set(k, paleta.length); paleta.push([b.cor[0], b.cor[1], b.forma]); }
    v.push(x - min[0], y - min[1], z - min[2], indice.get(k));
  }
  return { t: [max[0] - min[0] + 1, max[1] - min[1] + 1, max[2] - min[2] + 1], p: paleta, v };
}

/* ---------- a imagem parada ---------- */

const LADO = 960, GUINADA = (-38 * Math.PI) / 180, INCLINA = (27 * Math.PI) / 180;
async function retrato(m, arquivo) {
  const malha = malhaDaMaquete(m), [W, H, D] = m.t;
  const cg = Math.cos(GUINADA), sg = Math.sin(GUINADA), ci = Math.cos(INCLINA), si = Math.sin(INCLINA);
  const ver = (x, y, z) => { const a = x - W / 2, b = y - H / 2, c = z - D / 2; const x1 = a * cg + c * sg, z1 = -a * sg + c * cg; return [x1, b * ci - z1 * si, b * si + z1 * ci]; };
  const pts = new Float32Array(malha.n * 12);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < malha.n * 4; i++) {
    const [x, y, z] = ver(malha.pos[i * 3], malha.pos[i * 3 + 1], malha.pos[i * 3 + 2]);
    pts[i * 3] = x; pts[i * 3 + 1] = y; pts[i * 3 + 2] = z;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const escala = (LADO * 0.94) / Math.max(x1 - x0, y1 - y0, 1e-6), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const cor = new Uint8ClampedArray(LADO * LADO * 4), fundo = new Float32Array(LADO * LADO).fill(-Infinity);
  for (let f = 0; f < malha.n; f++) {
    const vidro = f >= malha.vidro, q = [0, 1, 2, 3].map((k) => [(pts[(f * 4 + k) * 3] - cx) * escala + LADO / 2, LADO / 2 - (pts[(f * 4 + k) * 3 + 1] - cy) * escala, pts[(f * 4 + k) * 3 + 2]]);
    const [r, g, b, a] = malha.cor.subarray(f * 4, f * 4 + 4);
    for (const [i, j, k] of [[0, 1, 2], [0, 2, 3]]) {
      const [ax, ay, az] = q[i], [bx, by, bz] = q[j], [qx, qy, qz] = q[k];
      const area = (bx - ax) * (qy - ay) - (qx - ax) * (by - ay);
      if (Math.abs(area) < 1e-9) continue;
      const minX = Math.max(0, Math.floor(Math.min(ax, bx, qx))), maxX = Math.min(LADO - 1, Math.ceil(Math.max(ax, bx, qx)));
      const minY = Math.max(0, Math.floor(Math.min(ay, by, qy))), maxY = Math.min(LADO - 1, Math.ceil(Math.max(ay, by, qy)));
      for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5, py = y + 0.5;
        const w0 = ((bx - px) * (qy - py) - (qx - px) * (by - py)) / area, w1 = ((qx - px) * (ay - py) - (ax - px) * (qy - py)) / area, w2 = 1 - w0 - w1;
        if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
        const z = w0 * az + w1 * bz + w2 * qz, o = y * LADO + x;          // maior z = mais perto de quem olha
        if (z < fundo[o] - 1e-5) continue;
        if (!vidro) { if (z <= fundo[o]) continue; fundo[o] = z; cor[o * 4] = r; cor[o * 4 + 1] = g; cor[o * 4 + 2] = b; cor[o * 4 + 3] = 255; }
        else { const f1 = a / 255, f0 = (cor[o * 4 + 3] / 255) * (1 - f1), soma = f1 + f0; cor[o * 4] = (r * f1 + cor[o * 4] * f0) / soma; cor[o * 4 + 1] = (g * f1 + cor[o * 4 + 1] * f0) / soma; cor[o * 4 + 2] = (b * f1 + cor[o * 4 + 2] * f0) / soma; cor[o * 4 + 3] = soma * 255; }
      }
    }
  }
  await sharp(Buffer.from(cor.buffer), { raw: { width: LADO, height: LADO, channels: 4 } }).resize(480, 480, { kernel: "lanczos3" }).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(arquivo);
}

/* ---------- execução ---------- */

const cobblemon = JSON.parse(await readFile(join(RAIZ, "dados", "cobblemon.json"), "utf8"));
await mkdir(join(RAIZ, "src", "maquetes"), { recursive: true });
await mkdir(join(RAIZ, "src", "arte", "maquete"), { recursive: true });
const indice = { estruturas: {}, ambientes: {} }, falhas = [];
async function gravar(nome, m) {
  await writeFile(join(RAIZ, "src", "maquetes", `${nome}.json`), JSON.stringify(m));
  await retrato(m, join(RAIZ, "src", "arte", "maquete", `${nome}.webp`));
}
for (const e of cobblemon.estruturas) {
  const regra = json(join(DADOS, "worldgen", "structure", `${sem(e.id)}.json`)), nome = sem(e.id).replace(/\//g, "-");
  const montada = montar(regra.start_pool, regra.size ?? 1, e.id);
  const m = montada.blocos ? await maquete(montada.blocos) : null;
  if (!m) { falhas.push(e.id); continue; }
  await gravar(nome, m);
  indice.estruturas[e.id] = { nome, tamanho: m.t, blocos: m.v.length / 4, pecas: montada.pecas, ...(montada.parcial ? { parcial: true } : {}) };
}
for (const [id, fazer] of Object.entries(DIORAMAS)) {
  const m = await maquete(fazer());
  await gravar(`ambiente-${id}`, m);
  indice.ambientes[id] = { nome: `ambiente-${id}`, tamanho: m.t, blocos: m.v.length / 4 };
}
await writeFile(join(RAIZ, "dados", "maquetes.json"), JSON.stringify(indice));
console.log(`Maquetes: ${Object.keys(indice.estruturas).length} estruturas e ${Object.keys(indice.ambientes).length} ambientes${falhas.length ? `; sem maquete: ${falhas.join(", ")}` : ""}`);
if (semCor.size) console.log(`Blocos sem textura encontrada (ficaram cinza): ${[...semCor].join(", ")}`);
