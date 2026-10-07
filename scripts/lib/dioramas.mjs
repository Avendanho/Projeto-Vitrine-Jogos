/* Um pedaço de terreno de 16 por 16 blocos para cada ambiente do atlas do Cobblemon.
 * São desenhos do atlas, feitos com os blocos que o jogo usa em cada bioma: não saem de um mundo real.
 * Cada função devolve Map "x,y,z" -> { nome, props }, como as estruturas em scripts/maquetes.mjs. */

const N = 16;
function mundo(semente) {
  let s = [...semente].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 11) >>> 0;
  const rnd = () => { s = (Math.imul(s ^ (s >>> 15), 0x2C1B3C6D) + 0x9E3779B9) >>> 0; return ((s ^ (s >>> 13)) >>> 0) / 4294967296; };
  const blocos = new Map();
  const por = (x, y, z, nome, props = {}) => { if (x >= 0 && x < N && z >= 0 && z < N && y >= 0) blocos.set(`${x},${y},${z}`, { nome: `minecraft:${nome}`, props }); };
  const tem = (x, y, z) => blocos.has(`${x},${y},${z}`);
  const tirar = (x, y, z) => blocos.delete(`${x},${y},${z}`);
  const fases = [rnd() * 6, rnd() * 6, rnd() * 6];
  // relevo suave: três ondas somadas, de -1 a 1
  const onda = (x, z, f = 0.42) => (Math.sin(x * f + fases[0]) + Math.sin(z * f * 1.13 + fases[1]) + Math.sin((x + z) * f * 0.7 + fases[2])) / 3;
  const escolher = (lista) => lista[Math.floor(rnd() * lista.length)];
  const cada = (fazer) => { for (let x = 0; x < N; x++) for (let z = 0; z < N; z++) fazer(x, z); };
  const coluna = (x, z, altura, camadas) => { for (let y = 0; y < altura; y++) por(x, y, z, camadas(y, altura)); };
  const arvore = (x, y, z, tronco, folhas, altura, raio = 2) => {
    for (let k = 0; k < altura; k++) por(x, y + k, z, tronco, { axis: "y" });
    for (let dy = -1; dy <= 2; dy++) {
      const r = dy >= 1 ? raio - 1 : raio;
      for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
        if (Math.abs(dx) === r && Math.abs(dz) === r && (r > 1 || rnd() < 0.6)) continue;
        if (!tem(x + dx, y + altura - 1 + dy, z + dz)) por(x + dx, y + altura - 1 + dy, z + dz, folhas);
      }
    }
  };
  return { rnd, blocos, por, tem, tirar, onda, escolher, cada, coluna, arvore };
}
const solo = (cima, meio = "dirt", fundo = "stone") => (y, h) => (y === h - 1 ? cima : y >= h - 3 ? meio : fundo);

export const DIORAMAS = {
  campo() {
    const m = mundo("campo"), alt = (x, z) => Math.round(4 + m.onda(x, z, 0.3) * 1.2);
    m.cada((x, z) => {
      const lago = Math.hypot(x - 11, z - 4) < 2.6, h = alt(x, z);
      if (lago) { m.coluna(x, z, 3, solo("clay")); m.por(x, 3, z, "water"); return; }
      m.coluna(x, z, h, solo("grass_block"));
      const r = m.rnd();
      if (r < 0.2) m.por(x, h, z, "short_grass");
      else if (r < 0.3) m.por(x, h, z, m.escolher(["poppy", "dandelion", "cornflower", "oxeye_daisy", "azure_bluet", "allium"]));
    });
    m.arvore(4, alt(4, 10), 10, "oak_log", "oak_leaves", 5);
    return m.blocos;
  },
  floresta() {
    const m = mundo("floresta"), alt = (x, z) => Math.round(4 + m.onda(x, z, 0.36) * 1.3);
    m.cada((x, z) => {
      const h = alt(x, z);
      m.coluna(x, z, h, solo(m.rnd() < 0.12 ? "podzol" : "grass_block"));
      const r = m.rnd();
      if (r < 0.16) m.por(x, h, z, "fern"); else if (r < 0.2) m.por(x, h, z, m.escolher(["red_mushroom", "brown_mushroom", "lily_of_the_valley"]));
    });
    for (const [x, z, bétula, a] of [[3, 3, 0, 6], [12, 2, 1, 7], [8, 7, 0, 5], [2, 11, 1, 6], [13, 12, 0, 6], [7, 14, 1, 5], [12, 7, 1, 6]]) m.arvore(x, alt(x, z), z, bétula ? "birch_log" : "oak_log", bétula ? "birch_leaves" : "oak_leaves", a);
    return m.blocos;
  },
  selva() {
    const m = mundo("selva"), alt = (x, z) => Math.round(4 + m.onda(x, z, 0.4) * 1.5);
    m.cada((x, z) => {
      const h = alt(x, z);
      m.coluna(x, z, h, solo("grass_block"));
      const r = m.rnd();
      if (r < 0.25) m.por(x, h, z, "fern"); else if (r < 0.29) m.por(x, h, z, "melon"); else if (r < 0.4) { m.por(x, h, z, "jungle_log", { axis: "y" }); m.por(x, h + 1, z, "jungle_leaves"); }
    });
    m.arvore(5, alt(5, 5), 5, "jungle_log", "jungle_leaves", 11, 3);
    m.arvore(12, alt(12, 11), 11, "jungle_log", "jungle_leaves", 8, 2);
    for (const [x, z] of [[13, 2], [14, 3], [12, 3], [14, 1], [2, 13], [3, 14], [1, 12]]) for (let k = 0, a = 4 + Math.floor(m.rnd() * 4); k < a; k++) m.por(x, alt(x, z) + k, z, "bamboo");
    return m.blocos;
  },
  montanha() {
    const m = mundo("montanha"), alt = (x, z) => Math.round(3 + 12 * Math.pow(Math.max(0, 1 - Math.hypot(x - 10, z - 9) / 12), 1.5) + m.onda(x, z, 0.7));
    m.cada((x, z) => {
      const h = alt(x, z), cima = h > 11 ? "snow_block" : h > 6 ? (m.rnd() < 0.25 ? "gravel" : "stone") : "grass_block";
      m.coluna(x, z, h, (y, a) => (y === a - 1 ? cima : cima === "grass_block" && y >= a - 3 ? "dirt" : m.rnd() < 0.05 ? m.escolher(["coal_ore", "iron_ore", "emerald_ore", "andesite"]) : "stone"));
      if (cima === "grass_block" && m.rnd() < 0.14) m.por(x, h, z, "short_grass");
    });
    for (const [x, z] of [[1, 2], [2, 13], [14, 1]]) m.arvore(x, alt(x, z), z, "spruce_log", "spruce_leaves", 6);
    return m.blocos;
  },
  arido() {
    const m = mundo("arido"), alt = (x, z) => Math.round(4 + m.onda(x, z, 0.33) * 1.4);
    m.cada((x, z) => {
      const h = alt(x, z), savana = x + z > 22, ermo = x < 5 && z > 9;
      if (ermo) { const a = h + (x < 3 && z > 11 ? 4 : 1); m.coluna(x, z, a, (y) => ["red_sand", "terracotta", "orange_terracotta", "yellow_terracotta", "white_terracotta", "red_terracotta", "terracotta", "orange_terracotta", "brown_terracotta"][y % 9]); return; }
      m.coluna(x, z, h, savana ? solo("grass_block") : solo("sand", "sand", "sandstone"));
      const r = m.rnd();
      if (!savana && r < 0.06) for (let k = 0, a = 1 + Math.floor(m.rnd() * 3); k < a; k++) m.por(x, h + k, z, "cactus");
      else if (r < 0.12) m.por(x, h, z, savana ? "short_grass" : "dead_bush");
    });
    m.arvore(13, alt(13, 12), 12, "acacia_log", "acacia_leaves", 5);
    return m.blocos;
  },
  frio() {
    const m = mundo("frio"), alt = (x, z) => Math.round(4 + m.onda(x, z, 0.34) * 1.3);
    m.cada((x, z) => {
      const lago = Math.hypot(x - 4, z - 11) < 3.2, h = alt(x, z);
      if (lago) { m.coluna(x, z, 3, solo("gravel")); m.por(x, 3, z, "ice"); return; }
      m.coluna(x, z, h, solo("snow_block"));
    });
    for (const [x, z, a] of [[12, 3, 9], [14, 5, 5], [10, 2, 4], [13, 1, 6]]) for (let k = 0; k < a; k++) { m.por(x, alt(x, z) + k, z, "packed_ice"); if (k < a / 2) { m.por(x + 1, alt(x, z) + k, z, "packed_ice"); m.por(x, alt(x, z) + k, z + 1, "packed_ice"); } }
    for (const [x, z] of [[11, 11], [7, 5], [13, 13]]) {
      const y = alt(x, z); m.arvore(x, y, z, "spruce_log", "spruce_leaves", 6);
      for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let k = 9; k > 2; k--) if (m.tem(x + dx, y + k, z + dz)) { m.por(x + dx, y + k + 1, z + dz, "snow"); break; }
    }
    return m.blocos;
  },
  "agua-doce"() {
    const m = mundo("pantano"), fundo = (x, z) => 3 + m.onda(x, z, 0.5) * 1.6;
    m.cada((x, z) => {
      const f = fundo(x, z), h = Math.max(2, Math.round(f));
      if (f < 3.1) {
        m.coluna(x, z, Math.min(h, 3), solo(m.rnd() < 0.5 ? "mud" : "clay", "mud"));
        for (let y = Math.min(h, 3); y < 4; y++) m.por(x, y, z, "water");
        if (m.rnd() < 0.16) m.por(x, 4, z, "lily_pad");
      } else {
        m.coluna(x, z, 4 + (f > 4 ? 1 : 0), solo(m.rnd() < 0.3 ? "mud" : "grass_block"));
        const r = m.rnd(), y = 4 + (f > 4 ? 1 : 0);
        if (r < 0.14) for (let k = 0; k < 3; k++) m.por(x, y + k, z, "sugar_cane"); else if (r < 0.3) m.por(x, y, z, m.escolher(["short_grass", "blue_orchid", "brown_mushroom"]));
      }
    });
    for (const [x, z] of [[4, 4], [11, 10], [3, 12]]) { for (let y = 2; y < 5; y++) m.por(x, y, z, "mangrove_roots"); m.arvore(x, 5, z, "mangrove_log", "mangrove_leaves", 5); }
    return m.blocos;
  },
  oceano() {
    const m = mundo("oceano"), NIVEL = 8;
    m.cada((x, z) => {
      const praia = Math.max(0, 1 - Math.hypot(x, z) / 9), h = Math.round(2 + m.onda(x, z, 0.5) + praia * 9);
      m.coluna(x, z, Math.max(1, h), (y, a) => (y >= a - 2 ? (m.rnd() < 0.2 && !praia ? "gravel" : "sand") : "stone"));
      if (h >= NIVEL) return;
      const r = m.rnd();
      if (r < 0.07) { const coral = m.escolher(["brain", "tube", "fire", "horn", "bubble"]); m.por(x, h, z, `${coral}_coral_block`); if (m.rnd() < 0.6) m.por(x, h + 1, z, `${coral}_coral_block`); }
      else if (r < 0.15) for (let k = 0, a = 2 + Math.floor(m.rnd() * 4); k < a && h + k < NIVEL - 1; k++) m.por(x, h + k, z, "kelp_plant");
      else if (r < 0.24) m.por(x, h, z, "seagrass");
      for (let y = h; y < NIVEL; y++) if (!m.tem(x, y, z)) m.por(x, y, z, "water");
    });
    return m.blocos;
  },
  caverna() {
    const m = mundo("caverna"), ALT = 12;
    m.cada((x, z) => {
      const parede = x < 3 || z < 3, chao = Math.round(3 + m.onda(x, z, 0.6));
      const teto = x < 10 && z < 10 ? Math.round(9 - m.onda(x, z, 0.8)) : ALT + 1;
      for (let y = 0; y < ALT; y++) {
        if (!parede && y >= chao && y < teto) continue;
        const pedra = y < 4 ? "deepslate" : "stone", r = m.rnd();
        m.por(x, y, z, r < 0.05 ? m.escolher(y < 4 ? ["deepslate_diamond_ore", "deepslate_redstone_ore", "deepslate_gold_ore"] : ["iron_ore", "copper_ore", "coal_ore"]) : pedra);
      }
      if (parede) return;
      const r = m.rnd();
      if (Math.hypot(x - 12, z - 12) < 2.4) { m.por(x, chao - 1, z, "lava"); for (let y = chao; y < chao + 1; y++) m.tirar(x, y, z); return; }
      if (x > 9 && z < 9) { m.por(x, chao - 1, z, "moss_block"); if (r < 0.3) m.por(x, chao, z, "azalea"); else if (r < 0.5) m.por(x, chao, z, "moss_carpet"); return; }
      if (r < 0.08) for (let k = 0, a = 1 + Math.floor(m.rnd() * 2); k < a; k++) m.por(x, chao + k, z, "pointed_dripstone");
      else if (r < 0.11) m.por(x, chao, z, "amethyst_cluster");
      if (teto <= ALT && m.rnd() < 0.2) for (let k = 1, a = 1 + Math.floor(m.rnd() * 3); k <= a; k++) m.por(x, teto - k, z, "pointed_dripstone");
    });
    return m.blocos;
  },
  nether() {
    const m = mundo("nether"), alt = (x, z) => Math.round(4 + m.onda(x, z, 0.45) * 1.8);
    m.cada((x, z) => {
      const lava = Math.hypot(x - 5, z - 11) < 3.4, h = alt(x, z), carmim = x > 8 && z < 8, distorcido = x > 9 && z > 10;
      if (lava) { m.coluna(x, z, 3, () => "netherrack"); m.por(x, 3, z, "lava"); return; }
      const cima = carmim ? "crimson_nylium" : distorcido ? "warped_nylium" : x < 5 && z < 5 ? "soul_sand" : "netherrack";
      m.coluna(x, z, h, (y, a) => (y === a - 1 ? cima : m.rnd() < 0.05 ? m.escolher(["nether_quartz_ore", "nether_gold_ore", "magma_block"]) : "netherrack"));
      const r = m.rnd();
      if (carmim && r < 0.2) m.por(x, h, z, m.escolher(["crimson_fungus", "crimson_roots"])); else if (distorcido && r < 0.2) m.por(x, h, z, m.escolher(["warped_fungus", "warped_roots"]));
    });
    const cogumelo = (x, z, caule, chapeu, a) => { const y = alt(x, z); for (let k = 0; k < a; k++) m.por(x, y + k, z, caule, { axis: "y" }); for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) { if (Math.abs(dx) + Math.abs(dz) < 4) m.por(x + dx, y + a, z + dz, m.rnd() < 0.1 ? "shroomlight" : chapeu); if (Math.abs(dx) + Math.abs(dz) < 2) m.por(x + dx, y + a + 1, z + dz, chapeu); } };
    cogumelo(12, 3, "crimson_stem", "nether_wart_block", 6);
    cogumelo(13, 13, "warped_stem", "warped_wart_block", 5);
    for (const [x, z, a] of [[2, 2, 7], [3, 3, 4], [1, 4, 5]]) for (let k = 0; k < a; k++) m.por(x, alt(x, z) + k, z, "basalt", { axis: "y" });
    for (const [dx, dy, dz] of [[0, 0, 0], [1, 0, 0], [0, -1, 0], [0, 0, 1], [0, -2, 0]]) m.por(2 + dx, alt(2, 2) + 7 + dy + 1, 2 + dz, "glowstone");
    return m.blocos;
  },
  fim() {
    const m = mundo("fim"), TOPO = 8;
    m.cada((x, z) => {
      const r = Math.hypot(x - 7.5, z - 7.5) / 8.2;
      if (r > 1) return;
      const fundo = Math.round((1 - r * r) * 7 + m.onda(x, z, 0.9));
      for (let y = TOPO - 1 - Math.max(0, fundo); y < TOPO; y++) m.por(x, y, z, "end_stone");
    });
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (let k = 0; k < 9; k++) m.por(4 + dx, TOPO + k, 5 + dz, "obsidian");
    m.por(4, TOPO + 9, 5, "bedrock");
    const coro = (x, z, a) => { for (let k = 0; k < a; k++) m.por(x, TOPO + k, z, "chorus_plant"); m.por(x, TOPO + a, z, "chorus_flower"); if (a > 3) { m.por(x + 1, TOPO + a - 2, z, "chorus_plant"); m.por(x + 1, TOPO + a - 1, z, "chorus_flower"); } };
    coro(11, 4, 5); coro(12, 10, 3); coro(8, 12, 6); coro(10, 8, 2);
    for (let k = 0; k < 4; k++) m.por(6, TOPO + k, 11, "purpur_pillar", { axis: "y" });
    m.por(6, TOPO + 4, 11, "end_rod");
    return m.blocos;
  }
};
