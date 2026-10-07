#!/usr/bin/env node
/* Verificação visual: rola cada página em passos de 75% da tela e fotografa,
 * em desktop, celular e com movimento reduzido. Monta folhas de contato para
 * conferir tudo de uma vez e lista os erros de console.
 *
 * Uso: node scripts/verificar-paginas.mjs [--url http://localhost:4600] [--saida verificacao] [caminho ...]
 * Precisa de: npm install (playwright-core e sharp) e do Google Chrome instalado.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const args = process.argv.slice(2);
function opcao(nome, padrao) {
  const i = args.indexOf(`--${nome}`);
  if (i < 0) return padrao;
  const valor = args[i + 1];
  args.splice(i, 2);
  return valor;
}
const base = opcao("url", "http://localhost:4600");
const saida = opcao("saida", "verificacao");
const so = opcao("so", "");            // "desktop", "celular" ou "reduzido"
const caminhos = args.length ? args : ["/", "/biblioteca/", "/jogos/heartgold-soulsilver/", "/linha-do-tempo/", "/comparar/", "/bussola/"];

const chrome = ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:/Program Files/Google/Chrome/Application/chrome.exe"].find((c) => existsSync(c));
if (!chrome) { console.error("Google Chrome não encontrado."); process.exit(1); }

const CONDICOES = [
  { nome: "desktop", largura: 1440, altura: 900, reduzido: false, colunas: 3, escala: 0.43 },
  { nome: "celular", largura: 390, altura: 844, reduzido: false, colunas: 8, escala: 0.56 },
  { nome: "reduzido", largura: 1440, altura: 900, reduzido: true, colunas: 3, escala: 0.43 }
].filter((c) => !so || c.nome === so);

const problemas = [];
const resumo = [];

async function folhas(imagens, c, pasta) {
  const porFolha = c.colunas * 3;
  const lw = Math.round(c.largura * c.escala), lh = Math.round(c.altura * c.escala);
  for (let f = 0; f * porFolha < imagens.length; f++) {
    const lote = imagens.slice(f * porFolha, (f + 1) * porFolha);
    const linhas = Math.ceil(lote.length / c.colunas);
    const partes = await Promise.all(lote.map(async (img, i) => ({
      input: await sharp(img).resize(lw, lh).toBuffer(),
      left: (i % c.colunas) * (lw + 6), top: Math.floor(i / c.colunas) * (lh + 6)
    })));
    await sharp({ create: { width: c.colunas * (lw + 6), height: linhas * (lh + 6), channels: 3, background: "#ff00aa" } })
      .composite(partes).png().toFile(join(pasta, `folha-${String(f + 1).padStart(2, "0")}.png`));
  }
}

const navegador = await chromium.launch({ executablePath: chrome, headless: true });
await rm(saida, { recursive: true, force: true });

for (const caminho of caminhos) {
  const rotulo = caminho === "/" ? "inicio" : caminho.replace(/^\/|\/$/g, "").replace(/[\/?=&]/g, "-");
  for (const c of CONDICOES) {
    const contexto = await navegador.newContext({
      viewport: { width: c.largura, height: c.altura },
      reducedMotion: c.reduzido ? "reduce" : "no-preference",
      deviceScaleFactor: 1, isMobile: c.nome === "celular", hasTouch: c.nome === "celular"
    });
    const pagina = await contexto.newPage();
    const onde = `${rotulo}/${c.nome}`;
    pagina.on("console", (m) => { if (m.type() === "error") problemas.push(`[${onde}] console: ${m.text()}`); });
    pagina.on("pageerror", (e) => problemas.push(`[${onde}] erro: ${e.message}`));
    pagina.on("requestfailed", (r) => problemas.push(`[${onde}] não carregou: ${r.url()}`));
    pagina.on("response", (r) => { if (r.status() >= 400) problemas.push(`[${onde}] ${r.status()}: ${r.url()}`); });

    await pagina.goto(base + caminho, { waitUntil: "networkidle", timeout: 30000 });
    await pagina.waitForTimeout(900);
    const pasta = join(saida, rotulo, c.nome);
    await mkdir(pasta, { recursive: true });

    const sobra = await pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (sobra > 1) problemas.push(`[${onde}] rolagem horizontal: a página passa ${sobra}px da largura da tela`);

    if (c.reduzido) {
      // imagens com loading="lazy" só carregam perto da tela: percorre a página antes da foto
      const alto = await pagina.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < alto; y += c.altura) {
        await pagina.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y);
        await pagina.waitForTimeout(120);
      }
      await pagina.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await pagina.waitForTimeout(500);
      await pagina.screenshot({ path: join(pasta, "pagina.png"), fullPage: true });
      resumo.push(`${onde}: página inteira`);
    } else {
      const total = await pagina.evaluate(() => document.documentElement.scrollHeight);
      const passo = Math.round(c.altura * 0.75);
      const n = Math.max(1, Math.ceil((total - c.altura) / passo) + 1);
      const imagens = [];
      for (let i = 0; i < n; i++) {
        await pagina.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), i * passo);
        await pagina.waitForTimeout(750);
        const arquivo = join(pasta, `passo-${String(i + 1).padStart(2, "0")}.png`);
        await pagina.screenshot({ path: arquivo });
        imagens.push(arquivo);
      }
      await folhas(imagens, c, pasta);
      resumo.push(`${onde}: ${n} passos`);
    }
    await contexto.close();
  }
}
await navegador.close();

const relatorio = ["# Verificação visual", "", `Base: ${base}`, "", "## Cobertura", ...resumo.map((r) => `- ${r}`), "",
  "## Problemas automáticos", ...(problemas.length ? problemas.map((p) => `- ${p}`) : ["- nenhum"])].join("\n");
await writeFile(join(saida, "RELATORIO.md"), relatorio, "utf8");
console.log(relatorio);
if (problemas.length) process.exitCode = 2;
