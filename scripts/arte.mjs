#!/usr/bin/env node
/* Baixa a arte oficial dos Pokémon (repositório público PokeAPI/sprites) e gera,
 * para cada espécie, duas versões em src/arte/pokemon/:
 *   <id>.webp        a arte em cor
 *   <id>-tinta.webp  uma gravura em hachura, só no canal alfa, que o CSS tinge
 *
 * Uso: node scripts/arte.mjs            (todas as espécies citadas nos dados)
 *      node scripts/arte.mjs 6 25 384   (só essas)
 * Os arquivos gerados ficam no repositório; o build não depende deste script.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = join(RAIZ, "src", "arte", "pokemon");
const ORIGEM = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";

const LADO_COR = 440;
const LADO_TINTA = 640;

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

async function existe(caminho) {
  try { await access(caminho); return true; } catch { return false; }
}

const pedidos = process.argv.slice(2).map(Number).filter(Boolean);
const ids = pedidos.length ? pedidos : await idsDosDados();
const refazer = pedidos.length > 0;
await mkdir(SAIDA, { recursive: true });

let feitos = 0, pulados = 0;
for (const id of ids) {
  const cor = join(SAIDA, `${id}.webp`);
  const tinta = join(SAIDA, `${id}-tinta.webp`);
  if (!refazer && (await existe(cor)) && (await existe(tinta))) { pulados++; continue; }

  const resposta = await fetch(`${ORIGEM}${id}.png`);
  if (!resposta.ok) {
    console.error(`  ${id}: falhou (${resposta.status})`);
    process.exitCode = 1;
    continue;
  }
  const png = Buffer.from(await resposta.arrayBuffer());
  await writeFile(cor, await sharp(png).resize(LADO_COR, LADO_COR, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toBuffer());
  await writeFile(tinta, await gravar(png));
  feitos++;
  process.stdout.write(`  ${id} `);
}
console.log(`\nArte: ${feitos} gerada(s), ${pulados} já existente(s), em src/arte/pokemon/`);
