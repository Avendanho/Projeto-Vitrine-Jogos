#!/usr/bin/env node
/* O que o atlas mostra fora dele: os ícones que o celular usa ao instalá-lo, a imagem de prévia que aparece
 * quando alguém cola um link numa rede social e as capturas de tela do README. Só roda em desenvolvimento,
 * com o site servido em http://localhost:4600 (npm run dev); o que ele gera é versionado.
 *
 *   node scripts/vitrine.mjs            tudo
 *   node scripts/vitrine.mjs icones     só os ícones (não precisa do site no ar)
 *   node scripts/vitrine.mjs cartoes    só as imagens de prévia
 *   node scripts/vitrine.mjs capturas   só as capturas do README
 */
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { chromium } from "playwright-core";
import { FAVICON, ICONE_CHEIO } from "./icone.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), ".."), ARTE = join(RAIZ, "src", "arte"), IMAGENS = join(RAIZ, "docs", "imagens");
const BASE = process.env.ATLAS_URL || "http://localhost:4600";
const quais = process.argv.slice(2), fazer = (nome) => !quais.length || quais.includes(nome);
const CHROME = ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find(existsSync);

if (fazer("icones")) {
  for (const [nome, svg, lado] of [["icone-180", ICONE_CHEIO, 180], ["icone-192", FAVICON, 192], ["icone-512", FAVICON, 512], ["icone-cheio-512", ICONE_CHEIO, 512]]) {
    await sharp(Buffer.from(svg), { density: 72 * lado / 64 }).resize(lado, lado).png({ compressionLevel: 9 }).toFile(join(ARTE, `${nome}.png`));
  }
  console.log("ícones em src/arte/");
}

/* A imagem de prévia da edição Pokémon: o aparelho com a ficha de um jogo na tela, no formato 1200 × 630
 * que as redes pedem. Usa as fontes e o hexágono do próprio site. */
const CARTAO_POKEMON = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><base href="${BASE}/"><style>
@font-face { font-family: "M PLUS Rounded 1c"; src: url("/fontes/mplus-800.woff2") format("woff2"); font-weight: 800; }
@font-face { font-family: "M PLUS Rounded 1c"; src: url("/fontes/mplus-700.woff2") format("woff2"); font-weight: 700; }
@font-face { font-family: "DotGothic16"; src: url("/fontes/dotgothic.woff2") format("woff2"); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #DC0A2D; font-family: "M PLUS Rounded 1c", sans-serif; color: #20232B; overflow: hidden; }
.alto { height: 92px; display: flex; align-items: center; gap: 18px; padding: 0 44px; border-bottom: 5px solid #9C0A22; color: #fff; font-weight: 800; font-size: 34px; }
.lente { width: 58px; height: 58px; border-radius: 50%; border: 5px solid #fff; box-shadow: 0 0 0 4px #20232B; background: radial-gradient(circle at 34% 30%, #EAF8FF 0 10%, transparent 11%), radial-gradient(circle, #62C6FF 0 30%, #29AAFD 31% 60%, #1672C2 61%); }
.luzes { display: flex; gap: 10px; margin-left: 6px; align-self: flex-start; margin-top: 22px; }
.luzes i { width: 18px; height: 18px; border-radius: 50%; border: 4px solid #20232B; }
.endereco { margin-left: auto; font-family: "DotGothic16", monospace; font-weight: 400; font-size: 26px; }
.tela { position: absolute; inset: 118px 30px 30px; display: grid; grid-template-columns: 400px 1fr; align-items: center; gap: 46px; padding: 0 46px; background: #F1F5EA radial-gradient(rgb(32 35 43 / 0.06) 1px, transparent 1.6px) 0 0 / 8px 8px; border: 12px solid #20232B; border-radius: 30px; }
.visor { padding: 22px; background: #fff; border: 4px solid #20232B; border-radius: 26px; box-shadow: 8px 8px 0 #20232B; }
.visor img { display: block; width: 100%; }
h1 { font-size: 118px; font-weight: 800; letter-spacing: -0.02em; line-height: 0.95; }
p { margin-top: 20px; font-size: 39px; font-weight: 700; line-height: 1.2; }
</style></head><body>
<div class="alto"><span class="lente"></span>PokéAtlas<span class="luzes"><i style="background:#B8001F"></i><i style="background:#FFCB05"></i><i style="background:#45B25D"></i></span><span class="endereco">pokeatlas-eight.vercel.app</span></div>
<div class="tela"><div class="visor"><img src="/hex/heartgold-soulsilver.svg" alt=""></div><div><h1>PokéAtlas</h1><p>Todo jogo de Pokémon tem um perfil. Um deles é o seu.</p></div></div>
</body></html>`;

/* As capturas do README: [arquivo, caminho, o que fazer antes da foto]. */
const CAPTURAS = [
  ["inicio", "/", null],
  ["pico", "/", async (p) => { await p.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.6)); }],
  ["bussola", "/bussola/", async (p) => { for (let i = 0; i < 4; i++) { await p.locator(".opcao").first().click(); await p.waitForTimeout(700); } }],
  ["time", "/time/?t=charizard,gengar,lucario,garchomp,gardevoir,blastoise", async (p) => { await p.evaluate(() => scrollTo(0, 430)); }],
  ["regiao", "/regioes/kanto/", async (p) => { await p.evaluate(() => scrollTo(0, 250)); }],
  ["cobblemon", "/cobblemon/pokemon/wooper/", null]
];

if (fazer("cartoes") || fazer("capturas")) {
  const navegador = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  if (fazer("cartoes")) {
    const pagina = await (await navegador.newContext({ viewport: { width: 1200, height: 630 }, reducedMotion: "reduce" })).newPage();
    await pagina.goto(BASE + "/", { waitUntil: "networkidle" });           // o cartão usa as fontes e o hexágono servidos pelo site
    await pagina.setContent(CARTAO_POKEMON, { waitUntil: "networkidle" });
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.screenshot({ path: join(ARTE, "cartao-pokemon.png") });
    await pagina.goto(BASE + "/cobblemon/", { waitUntil: "networkidle" });  // o do Cobblemon é a própria abertura da edição
    await pagina.waitForTimeout(900);
    await pagina.screenshot({ path: join(ARTE, "cartao-cobblemon.png") });
    console.log("imagens de prévia em src/arte/");
  }
  if (fazer("capturas")) {
    await mkdir(IMAGENS, { recursive: true });
    const pagina = await (await navegador.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    for (const [nome, caminho, antes] of CAPTURAS) {
      await pagina.goto(BASE + caminho, { waitUntil: "networkidle" });
      await pagina.waitForTimeout(1800);
      if (antes) { await antes(pagina); await pagina.waitForTimeout(1400); }
      await sharp(await pagina.screenshot()).resize(1280).webp({ quality: 82 }).toFile(join(IMAGENS, `${nome}.webp`));
    }
    console.log(`${CAPTURAS.length} capturas em docs/imagens/`);
  }
  await navegador.close();
}
