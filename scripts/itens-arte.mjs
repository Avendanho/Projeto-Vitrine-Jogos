#!/usr/bin/env node
/* Monta o atlas com o ícone de cada item do Cobblemon, a partir das texturas do
 * próprio mod (gitlab.com/cable-mc/cobblemon, licença MPL 2.0):
 *   src/arte/itens.png        todos os ícones de 16 px, lado a lado
 *   src/arte/item/<id>.png    os itens que são blocos com modelo próprio (PC, máquina de cura...), desenhados em 3D
 *   dados/itens-arte.json     { colunas, celula, itens: { id: posição no atlas }, blocos: [id, ...] }
 *
 * Uso: node scripts/itens-arte.mjs --ativos <pasta assets/cobblemon do mod>
 * O arquivo gerado fica no repositório; o build não depende deste script.
 */
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const ATIVOS = args[args.indexOf("--ativos") + 1];
if (!ATIVOS || !existsSync(ATIVOS)) { console.error("Uso: node scripts/itens-arte.mjs --ativos <pasta assets/cobblemon do mod>"); process.exit(1); }

const CELULA = 16, COLUNAS = 32;
const { itens } = JSON.parse(await readFile(join(RAIZ, "dados", "cobblemon.json"), "utf8"));
const caminhoDe = (ref, pasta) => join(ATIVOS, pasta, `${ref.split(":").pop()}`);

async function todos(pasta) {
  const lista = [];
  for (const e of await readdir(pasta, { withFileTypes: true })) {
    if (e.isDirectory()) lista.push(...await todos(join(pasta, e.name)));
    else lista.push(join(pasta, e.name));
  }
  return lista;
}
const texturasDeItem = await todos(join(ATIVOS, "textures", "item"));

/* As camadas de textura de um item: as do modelo dele ou, sem modelo plano, a textura com o mesmo nome. */
async function camadas(id) {
  const modelo = join(ATIVOS, "models", "item", `${id}.json`);
  if (existsSync(modelo)) {
    const m = JSON.parse(await readFile(modelo, "utf8"));
    const refs = Object.entries(m.textures || {}).filter(([k]) => /^layer\d$/.test(k)).sort().map(([, v]) => `${caminhoDe(v, "textures")}.png`).filter(existsSync);
    if (refs.length) return refs;
  }
  const igual = texturasDeItem.find((c) => c.endsWith(`/${id}.png`));
  return igual ? [igual] : [];
}

/* ---------- itens que são blocos: o modelo do bloco, visto como no inventário do jogo ---------- */

async function modeloDeBloco(ref, nivel = 0) {
  const arquivo = join(ATIVOS, "models", `${ref.split(":").pop()}.json`);
  if (nivel > 4 || !ref.startsWith("cobblemon:") || !existsSync(arquivo)) return { elements: null, textures: {} };
  const m = JSON.parse(await readFile(arquivo, "utf8")), pai = m.parent ? await modeloDeBloco(m.parent, nivel + 1) : { elements: null, textures: {} };
  return { elements: m.elements ?? pai.elements, textures: { ...pai.textures, ...(m.textures || {}) } };
}
const CANTOS = {                                     // por face: os cantos na ordem da textura (alto-esquerda, alto-direita, baixo-direita, baixo-esquerda) e a luz
  north: [[1, 1, 0], [0, 1, 0], [0, 0, 0], [1, 0, 0], 0.8], south: [[0, 1, 1], [1, 1, 1], [1, 0, 1], [0, 0, 1], 0.8],
  west: [[0, 1, 0], [0, 1, 1], [0, 0, 1], [0, 0, 0], 0.62], east: [[1, 1, 1], [1, 1, 0], [1, 0, 0], [1, 0, 1], 0.62],
  up: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1], 1], down: [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0], 0.5]
};
async function desenharBloco(id) {
  const item = JSON.parse(await readFile(join(ATIVOS, "models", "item", `${id}.json`), "utf8"));
  const { elements, textures } = await modeloDeBloco(item.parent ?? "");
  if (!elements?.length) return null;
  const imagens = {};
  const textura = async (ref, n = 0) => {
    if (ref?.startsWith("#") && n < 5) return textura(textures[ref.slice(1)], n + 1);
    const arquivo = ref ? `${caminhoDe(ref, "textures")}.png` : "";
    if (!existsSync(arquivo)) return null;
    return (imagens[arquivo] ??= await sharp(arquivo).ensureAlpha().raw().toBuffer({ resolveWithObject: true }));
  };
  const L = 384, ry = (225 * Math.PI) / 180, rx = (30 * Math.PI) / 180;
  const ver = ([x, y, z]) => { const a = x - 8, b = y - 8, c = z - 8, x1 = a * Math.cos(ry) + c * Math.sin(ry), z1 = -a * Math.sin(ry) + c * Math.cos(ry); return [x1, b * Math.cos(rx) - z1 * Math.sin(rx), b * Math.sin(rx) + z1 * Math.cos(rx)]; };
  const faces = [];
  for (const e of elements) {
    const girar = (p) => {
      if (!e.rotation?.angle) return p;
      const o = e.rotation.origin, t = (e.rotation.angle * Math.PI) / 180, c = Math.cos(t), s2 = Math.sin(t), [x, y, z] = [p[0] - o[0], p[1] - o[1], p[2] - o[2]];
      const g = e.rotation.axis === "x" ? [x, y * c - z * s2, y * s2 + z * c] : e.rotation.axis === "y" ? [x * c + z * s2, y, -x * s2 + z * c] : [x * c - y * s2, x * s2 + y * c, z];
      return [g[0] + o[0], g[1] + o[1], g[2] + o[2]];
    };
    for (const [lado, f] of Object.entries(e.faces || {})) {
      const tex = await textura(f.texture);
      if (!tex || !CANTOS[lado]) continue;
      const [u0, v0, u1, v1] = f.uv ?? [0, 0, 16, 16], uvs = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], passo = ((f.rotation || 0) / 90) % 4;
      const cantos = CANTOS[lado].slice(0, 4).map((k, i) => ({ p: ver(girar(k.map((b, eixo) => (b ? e.to : e.from)[eixo]))), uv: uvs[(i + 4 - passo) % 4] }));
      faces.push({ cantos, tex, luz: CANTOS[lado][4] });
    }
  }
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const f of faces) for (const { p } of f.cantos) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  const escala = (L * 0.94) / Math.max(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const cor = new Uint8ClampedArray(L * L * 4), fundo = new Float32Array(L * L).fill(-Infinity);
  for (const f of faces) {
    const q = f.cantos.map(({ p, uv }) => [(p[0] - cx) * escala + L / 2, L / 2 - (p[1] - cy) * escala, p[2], uv[0] / 16, uv[1] / 16]);
    for (const [i, j, k] of [[0, 1, 2], [0, 2, 3]]) {
      const [ax, ay, az, au, av] = q[i], [bx, by, bz, bu, bv] = q[j], [qx, qy, qz, qu, qv] = q[k], area = (bx - ax) * (qy - ay) - (qx - ax) * (by - ay);
      if (Math.abs(area) < 1e-9) continue;
      for (let y = Math.max(0, Math.floor(Math.min(ay, by, qy))); y <= Math.min(L - 1, Math.ceil(Math.max(ay, by, qy))); y++) for (let x = Math.max(0, Math.floor(Math.min(ax, bx, qx))); x <= Math.min(L - 1, Math.ceil(Math.max(ax, bx, qx))); x++) {
        const px = x + 0.5, py = y + 0.5, w0 = ((bx - px) * (qy - py) - (qx - px) * (by - py)) / area, w1 = ((qx - px) * (ay - py) - (ax - px) * (qy - py)) / area, w2 = 1 - w0 - w1;
        if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
        const z = w0 * az + w1 * bz + w2 * qz, o = y * L + x;
        if (z <= fundo[o]) continue;
        const { data, info } = f.tex, lado = info.width;      // texturas animadas empilham quadros: vale o primeiro
        const tx = Math.min(lado - 1, Math.max(0, Math.floor((w0 * au + w1 * bu + w2 * qu) * lado))), ty = Math.min(lado - 1, Math.max(0, Math.floor((w0 * av + w1 * bv + w2 * qv) * lado))), t = (ty * info.width + tx) * 4;
        if (data[t + 3] < 128) continue;
        fundo[o] = z;
        cor[o * 4] = data[t] * f.luz; cor[o * 4 + 1] = data[t + 1] * f.luz; cor[o * 4 + 2] = data[t + 2] * f.luz; cor[o * 4 + 3] = 255;
      }
    }
  }
  return sharp(Buffer.from(cor.buffer), { raw: { width: L, height: L, channels: 4 } }).resize(96, 96, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
}

const posicoes = {}, pecas = [], faltam = [], blocos = [];
await mkdir(join(RAIZ, "src", "arte", "item"), { recursive: true });
for (const item of itens) {
  const arquivos = await camadas(item.id);
  if (!arquivos.length) {
    const bloco = existsSync(join(ATIVOS, "models", "item", `${item.id}.json`)) ? await desenharBloco(item.id) : null;
    if (bloco) { await writeFile(join(RAIZ, "src", "arte", "item", `${item.id}.png`), bloco); blocos.push(item.id); } else faltam.push(item.id);
    continue;
  }
  const quadro = async (c) => {                    // texturas animadas empilham os quadros: vale o primeiro
    const { width } = await sharp(c).metadata();
    return sharp(c).extract({ left: 0, top: 0, width, height: width }).resize(CELULA, CELULA, { kernel: "nearest" }).ensureAlpha().png().toBuffer();
  };
  const [base, ...resto] = await Promise.all(arquivos.map(quadro));
  const icone = resto.length ? await sharp(base).composite(resto.map((input) => ({ input }))).png().toBuffer() : base;
  const i = pecas.length;
  posicoes[item.id] = i;
  pecas.push({ input: icone, left: (i % COLUNAS) * CELULA, top: Math.floor(i / COLUNAS) * CELULA });
}
const linhas = Math.ceil(pecas.length / COLUNAS);
await sharp({ create: { width: COLUNAS * CELULA, height: linhas * CELULA, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(pecas).png({ compressionLevel: 9 }).toFile(join(RAIZ, "src", "arte", "itens.png"));
await writeFile(join(RAIZ, "dados", "itens-arte.json"), JSON.stringify({ colunas: COLUNAS, linhas, celula: CELULA, itens: posicoes, blocos }));
console.log(`Itens: ${pecas.length} ícones em src/arte/itens.png (${COLUNAS}×${linhas}), ${blocos.length} blocos em src/arte/item/${faltam.length ? `; sem modelo nem textura no mod: ${faltam.join(", ")}` : ""}`);
