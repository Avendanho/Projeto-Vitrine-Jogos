/* Tira uma foto de uma página, para conferir o visual: node testes/navegador/_foto.mjs <caminho> <arquivo.png> [seletor para rolar até ele] [celular] */
import { abrir, BASE } from "./_comum.mjs";
const [caminho, arquivo, seletor, modo] = process.argv.slice(2);
const { navegador, pagina } = await abrir({ celular: modo === "celular" });
await pagina.goto(BASE + caminho, { waitUntil: "networkidle" });
if (seletor && seletor !== "-") await pagina.locator(seletor).first().scrollIntoViewIfNeeded();
await pagina.waitForTimeout(600);
await pagina.screenshot({ path: arquivo });
await navegador.close();
