#!/usr/bin/env node
/* Procura português esquecido nas páginas em inglês de dist/en/: lê o texto e os rótulos (alt, aria-label,
 * title, placeholder, descrição) de cada página e aponta os trechos com palavras que só existem em português.
 * Roda depois do build: node scripts/conferir-ingles.mjs [quantos trechos mostrar]. Sai com erro se achar algum. */
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const EN = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "en");
const mostrar = Number(process.argv[2]) || 40;
/* Palavras que denunciam português. Ficam de fora as que também são inglês ou nome próprio (no, do, a, as, de, forma…). */
const PORTUGUES = /(?<![\p{L}\p{N}'’-])(você|não|são|está|estão|para|com|uma|dos|das|que|mais|também|espécies?|jogos?|nível|sem|onde|cada|todos|todas|abrir|ver|pelo|pela|seu|sua|deste|desta|neste|nesta|quando|até|só|já|têm|região|regiões|geração|página|número|nome|ou|os|ao|à|é|em|na|nos|nas|um|isso|este|esta|aqui|como|muito|pouco|outro|outra|entre|sobre|depois|antes|ainda|então|porque|ser|foi|vai|pode|deve|faz|tem)(?![\p{L}\p{N}'’-])/iu;
/* Trechos que são português de propósito numa página em inglês. */
const DE_PROPOSITO = [/^Português$/, /^Ouvir /, /pt-BR/];

async function* paginas(pasta) {
  for (const e of await readdir(pasta, { withFileTypes: true })) {
    if (e.isDirectory()) yield* paginas(join(pasta, e.name));
    else if (e.name.endsWith(".html")) yield join(pasta, e.name);
  }
}
const achados = new Map();
let total = 0;
for await (const arquivo of paginas(EN)) {
  total++;
  const html = (await readFile(arquivo, "utf8")).replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
  const trechos = [
    ...html.replace(/<[^>]*\blang="(?!en)[^"]*"[^>]*>[^<]*/g, " ").replace(/<[^>]+>/g, "\n").split("\n"),
    ...[...html.matchAll(/\b(?:alt|aria-label|title|placeholder|content)="([^"]*)"/g)].map((m) => m[1])
  ];
  for (const bruto of trechos) {
    const texto = bruto.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
    if (!texto || !PORTUGUES.test(texto) || DE_PROPOSITO.some((r) => r.test(texto))) continue;
    const chave = texto.replace(/\d+/g, "N").slice(0, 110);
    const a = achados.get(chave) ?? { vezes: 0, onde: arquivo.slice(EN.length) };
    a.vezes++;
    achados.set(chave, a);
  }
}
const lista = [...achados.entries()].sort((a, b) => b[1].vezes - a[1].vezes);
console.log(`${total} páginas em inglês; ${lista.length} trechos diferentes com cara de português`);
for (const [texto, { vezes, onde }] of lista.slice(0, mostrar)) console.log(`${String(vezes).padStart(6)}  ${texto}   [${onde}]`);
process.exit(lista.length ? 1 : 0);
