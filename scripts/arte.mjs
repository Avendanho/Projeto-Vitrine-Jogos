#!/usr/bin/env node
/* Baixa a arte oficial dos Pokémon (repositório público PokeAPI/sprites) e a
 * reimprime em gravura.
 *
 *   node scripts/arte.mjs            pranchas grandes das espécies de dados/especies.mjs,
 *                                    em src/arte/pokemon/: <id>.webp (cor) e
 *                                    <id>-tinta.webp (hachura só no canal alfa, que o CSS tinge)
 *   node scripts/arte.mjs 6 25 384   só essas, refeitas
 *   node scripts/arte.mjs --mini     todas as espécies de dados/pokedex.json, em src/arte/mini/:
 *                                    <id>.webp (miniatura em gravura, já em tinta) e
 *                                    <id>-cor.webp (a arte em cor, maior, usada ao apontar
 *                                    e na página de cada espécie)
 *   node scripts/arte.mjs --formas   arte em cor de cada forma especial de dados/fichas.json
 *                                    (megas, Gigantamax, regionais), em src/arte/formas/<id>.webp
 *
 * Os arquivos gerados ficam no repositório; o build não depende deste script.
 */
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = join(RAIZ, "src", "arte", "pokemon");
const ORIGEM = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";

const SAIDA_MINI = join(RAIZ, "src", "arte", "mini");
const LADO_COR = 440;
const LADO_TINTA = 640;
const LADO_MINI = 184;
const LADO_MINI_COR = 320;       // a página de cada espécie refaz a gravura a partir desta imagem

async function idsDosDados() {
  const { ESPECIES } = await import("../dados/especies.mjs");
  return Object.keys(ESPECIES).map(Number);
}

function degrau(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/* Gravura: o tom escuro vira linha grossa, o claro vira linha fina, o branco some.
 * Tons bem escuros ganham uma segunda trama cruzada; o contorno preto fica cheio. */
async function gravar(png) {
  const { data, info } = await sharp(png)
    .resize(LADO_TINTA, LADO_TINTA, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const L = info.width;
  const saida = Buffer.alloc(L * L * 4);
  const passo = 6.5;
  const ang = (38 * Math.PI) / 180;
  const cx = Math.cos(ang), sx = Math.sin(ang);

  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      const i = (y * L + x) * 4;
      const alfa = data[i + 3] / 255;
      if (alfa === 0) continue;
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      const escuro = Math.min(1, Math.max(0, (1 - lum - 0.1) * 1.3));

      const t1 = ((x * cx + y * sx) / passo) % 1;
      const onda1 = Math.abs(2 * (t1 < 0 ? t1 + 1 : t1) - 1);
      let tinta = degrau(-0.16, 0.16, escuro * 0.92 - onda1);

      if (escuro > 0.5) {
        const t2 = ((x * -sx + y * cx) / passo) % 1;
        const onda2 = Math.abs(2 * (t2 < 0 ? t2 + 1 : t2) - 1);
        tinta = Math.max(tinta, degrau(-0.16, 0.16, (escuro - 0.5) * 1.5 - onda2));
      }
      tinta = Math.max(tinta, degrau(0.74, 0.9, escuro));

      saida[i + 3] = Math.round(tinta * alfa * 255);
    }
  }
  return sharp(saida, { raw: { width: L, height: L, channels: 4 } })
    .webp({ quality: 70, alphaQuality: 88, effort: 6 })
    .toBuffer();
}

/* Miniatura: hachura sobre uma aguada leve, para o rosto não sumir em 90 pixels. */
async function gravarMini(png) {
  const L = LADO_MINI;
  const { data } = await sharp(png)
    .resize(L, L, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const saida = Buffer.alloc(L * L * 4);
  const passo = 4.1, ang = (38 * Math.PI) / 180;
  const cx = Math.cos(ang), sx = Math.sin(ang);
  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      const i = (y * L + x) * 4;
      const alfa = data[i + 3] / 255;
      if (alfa === 0) continue;
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      const escuro = Math.min(1, Math.max(0, (1 - lum - 0.1) * 1.3));
      const t = ((x * cx + y * sx) / passo) % 1;
      const onda = Math.abs(2 * (t < 0 ? t + 1 : t) - 1);
      let tinta = Math.max(0.07 + 0.36 * escuro, degrau(-0.22, 0.22, escuro * 0.9 - onda));
      tinta = Math.max(tinta, degrau(0.68, 0.9, escuro));
      saida[i] = 15; saida[i + 1] = 42; saida[i + 2] = 58;
      saida[i + 3] = Math.round(tinta * alfa * 255);
    }
  }
  return sharp(saida, { raw: { width: L, height: L, channels: 4 } })
    .webp({ quality: 60, alphaQuality: 80, effort: 6 }).toBuffer();
}

async function existe(caminho) {
  try { await access(caminho); return true; } catch { return false; }
}

async function baixar(id) {
  for (let tentativa = 1; ; tentativa++) {
    try {
      const resposta = await fetch(`${ORIGEM}${id}.png`);
      if (resposta.status === 404) return null;
      if (!resposta.ok) throw new Error(String(resposta.status));
      return Buffer.from(await resposta.arrayBuffer());
    } catch (erro) {
      if (tentativa === 4) throw erro;
      await new Promise((ok) => setTimeout(ok, 800 * tentativa));
    }
  }
}

const args = process.argv.slice(2);

if (args.includes("--formas")) {
  const destino = join(RAIZ, "src", "arte", "formas");
  await mkdir(destino, { recursive: true });
  const fichas = JSON.parse(await readFile(join(RAIZ, "dados", "fichas.json"), "utf8"));
  const fila = Object.values(fichas).flatMap((f) => f.formas.map((x) => x.id));
  let feitas = 0, existentes = 0;
  const semArte = [];
  await Promise.all(Array.from({ length: 10 }, async () => {
    while (fila.length) {
      const id = fila.shift(), arquivo = join(destino, `${id}.webp`);
      if (await existe(arquivo)) { existentes++; continue; }
      const png = await baixar(id);
      if (!png) { semArte.push(id); continue; }
      await writeFile(arquivo, await sharp(png).resize(240, 240, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 72, alphaQuality: 88, effort: 6 }).toBuffer());
      feitas++;
    }
  }));
  // a página só mostra a figura das formas que têm arte; a lista fica em dados/ para o build saber
  const { readdir } = await import("node:fs/promises");
  const comArte = (await readdir(destino)).map((n) => Number(n.replace(".webp", ""))).sort((a, b) => a - b);
  await writeFile(join(RAIZ, "dados", "formas-com-arte.json"), JSON.stringify(comArte), "utf8");
  console.log(`Arte das formas: ${feitas} gerada(s), ${existentes} já existente(s), ${semArte.length} sem arte na origem${semArte.length ? ` (${semArte.join(", ")})` : ""}`);
  process.exit(0);
}

const mini = args.includes("--mini");
const pedidos = args.map(Number).filter(Boolean);
const refazer = pedidos.length > 0;
const pasta = mini ? SAIDA_MINI : SAIDA;
await mkdir(pasta, { recursive: true });

let ids = pedidos;
if (!ids.length) {
  if (mini) {
    const { dex, formas } = JSON.parse(await readFile(join(RAIZ, "dados", "pokedex.json"), "utf8"));
    const regionais = Object.values(formas).flatMap((f) => Object.values(f).map(([id]) => id));
    ids = [...new Set([...Object.values(dex).flat().map(([, especie]) => especie), ...regionais])].sort((a, b) => a - b);
  } else {
    ids = await idsDosDados();
  }
}

let feitos = 0, pulados = 0;
const faltando = [];
async function processar(id) {
  const [gravura, cor] = mini
    ? [join(pasta, `${id}.webp`), join(pasta, `${id}-cor.webp`)]
    : [join(pasta, `${id}-tinta.webp`), join(pasta, `${id}.webp`)];
  if (!refazer && (await existe(gravura)) && (await existe(cor))) { pulados++; return; }
  const png = await baixar(id);
  if (!png) { faltando.push(id); return; }
  const lado = mini ? LADO_MINI_COR : LADO_COR;
  await writeFile(cor, await sharp(png)
    .resize(lado, lado, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: mini ? 70 : 80, alphaQuality: 88, effort: 6 }).toBuffer());
  await writeFile(gravura, await (mini ? gravarMini(png) : gravar(png)));
  feitos++;
  if (feitos % 50 === 0) console.log(`  ${feitos} de ${ids.length - pulados}`);
}

// alguns downloads ao mesmo tempo, sem sobrecarregar a origem
const fila = [...ids];
await Promise.all(Array.from({ length: 10 }, async () => {
  while (fila.length) await processar(fila.shift());
}));

console.log(`Arte${mini ? " em miniatura" : ""}: ${feitos} gerada(s), ${pulados} já existente(s), em ${pasta.replace(RAIZ + "/", "")}/`);
if (faltando.length) {
  console.error(`Sem arte na origem: ${faltando.join(", ")}`);
  process.exitCode = 1;
}
