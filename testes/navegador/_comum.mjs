/* O que todo roteiro de navegador usa. Os roteiros esperam o site servido em http://localhost:4600
 * (npm run dev) e um Chrome ou Chromium instalado. Cada um imprime o que conferiu e sai com erro se algo falhar. */
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";

export const BASE = process.env.ATLAS_URL || "http://localhost:4600";
const CHROME = ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find(existsSync);

/* semWebgl: nega o WebGL, como o Chrome sem aceleração de vídeo. semArmazenamento: localStorage lança erro. */
export async function abrir({ celular = false, semWebgl = false, semArmazenamento = false, calmo = false } = {}) {
  const navegador = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const contexto = await navegador.newContext(celular
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }
    : { viewport: { width: 1440, height: 900 }, reducedMotion: calmo ? "reduce" : "no-preference" });
  const pagina = await contexto.newPage();
  const erros = [];
  pagina.on("pageerror", (e) => erros.push(String(e)));
  if (semWebgl) await pagina.addInitScript(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...r) { return /webgl/.test(t) ? null : o.call(this, t, ...r); }; });
  if (semArmazenamento) await pagina.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new Error("bloqueado"); } }); });
  return { navegador, pagina, erros };
}

let falhas = 0;
export function conferir(nome, ok, detalhe = "") {
  console.log(`${ok ? "ok    " : "FALHOU"} ${nome}${detalhe ? `  (${detalhe})` : ""}`);
  if (!ok) falhas++;
}
export async function fechar(navegador, erros = []) {
  conferir("sem erros de JavaScript na página", erros.length === 0, erros.join(" | ").slice(0, 300));
  await navegador.close();
  if (falhas) process.exit(1);
}
