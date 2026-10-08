#!/usr/bin/env node
/* Servidor local do dist/, com as mesmas regras de endereço da Vercel
 * (pasta -> index.html, endereço inexistente -> 404.html).
 * Uso: node scripts/servir.mjs [porta] */
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RAIZ, "dist");
// os mesmos redirecionamentos que a Vercel aplica
const REDIRECIONA = Object.fromEntries((JSON.parse(await readFile(join(RAIZ, "vercel.json"), "utf8")).redirects || []).map((r) => [r.source, r.destination]));
const porta = Number(process.argv[2]) || 4600;

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".woff2": "font/woff2", ".ogg": "audio/ogg", ".webmanifest": "application/manifest+json", ".xml": "application/xml; charset=utf-8", ".json": "application/json", ".txt": "text/plain; charset=utf-8"
};

async function resolver(caminho) {
  const alvo = normalize(join(DIST, caminho));
  if (!alvo.startsWith(DIST)) return null;
  try {
    const info = await stat(alvo);
    return info.isDirectory() ? join(alvo, "index.html") : alvo;
  } catch {
    return null;
  }
}

http.createServer(async (req, res) => {
  const caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (REDIRECIONA[caminho]) { res.writeHead(307, { Location: REDIRECIONA[caminho] }).end(); return; }
  const arquivo = await resolver(caminho);
  try {
    const corpo = await readFile(arquivo ?? join(DIST, "404.html"));
    res.writeHead(arquivo ? 200 : 404, {
      "Content-Type": TIPOS[arquivo ? extname(arquivo) : ".html"] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(corpo);
  } catch {
    res.writeHead(404).end("Não encontrado.");
  }
}).listen(porta, () => console.log(`PokéAtlas em http://localhost:${porta}`));
