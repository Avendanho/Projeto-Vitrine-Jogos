#!/usr/bin/env node
/* Monta o atlas com o ícone de cada item do Cobblemon, a partir das texturas do
 * próprio mod (gitlab.com/cable-mc/cobblemon, licença MPL 2.0):
 *   src/arte/itens.png        todos os ícones de 16 px, lado a lado
 *   dados/itens-arte.json     { colunas, celula, itens: { id: posição no atlas } }
 *
 * Uso: node scripts/itens-arte.mjs --ativos <pasta assets/cobblemon do mod>
 * O arquivo gerado fica no repositório; o build não depende deste script.
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
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

const posicoes = {}, pecas = [], faltam = [];
for (const item of itens) {
  const arquivos = await camadas(item.id);
  if (!arquivos.length) { faltam.push(item.id); continue; }
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
await writeFile(join(RAIZ, "dados", "itens-arte.json"), JSON.stringify({ colunas: COLUNAS, linhas, celula: CELULA, itens: posicoes }));
console.log(`Itens: ${pecas.length} ícones em src/arte/itens.png (${COLUNAS}×${linhas})${faltam.length ? `; sem ícone: ${faltam.join(", ")}` : ""}`);
