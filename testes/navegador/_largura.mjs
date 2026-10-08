/* Diz que elementos passam da largura da tela no celular: node testes/navegador/_largura.mjs <caminho> */
import { abrir, BASE } from "./_comum.mjs";
const { navegador, pagina } = await abrir({ celular: true });
await pagina.goto(BASE + process.argv[2], { waitUntil: "networkidle" });
if (process.argv[3]) { await pagina.fill(process.argv[3], process.argv[4]); await pagina.keyboard.press("Enter"); await pagina.waitForTimeout(400); }
console.log(await pagina.evaluate(() => {
  const largura = document.documentElement.clientWidth, fora = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > largura + 1 && !el.closest(".quiz-tabela-caixa, .time-tabela-caixa, [data-rola]")) fora.push(`${el.tagName.toLowerCase()}.${el.className.toString().split(" ")[0]} direita=${Math.round(r.right)}`);
  }
  return { rolavel: document.documentElement.scrollWidth, fora: fora.slice(0, 8) };
}));
await navegador.close();
