/* Maquetes de estruturas e biomas: entram com clique, giram, aproximam, uma viva por vez, com e sem WebGL. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";

for (const semWebgl of [false, true]) {
  const modo = semWebgl ? "sem WebGL" : "com WebGL";
  const { navegador, pagina, erros } = await abrir({ semWebgl });
  await pagina.goto(`${BASE}/cobblemon/estruturas/`, { waitUntil: "networkidle" });
  const fig = pagina.locator(".maquete").nth(3);
  await fig.scrollIntoViewIfNeeded();
  await fig.hover(); await pagina.waitForTimeout(500);
  conferir(`${modo}: parar o ponteiro em cima não liga nada`, await pagina.locator(".maquete.viva").count() === 0);
  await fig.locator(".maquete-girar").click();
  await pagina.waitForSelector(".maquete.viva canvas");
  await pagina.waitForTimeout(600);
  const tela = fig.locator(".maquete-tela"), caixa = await tela.boundingBox(), foto = () => tela.screenshot();
  const a = await foto();
  await pagina.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2); await pagina.mouse.down(); await pagina.mouse.move(caixa.x + caixa.width / 2 + 140, caixa.y + caixa.height / 2 - 30, { steps: 5 }); await pagina.mouse.up();
  await pagina.waitForTimeout(250);
  const b = await foto();
  conferir(`${modo}: arrastar gira`, !a.equals(b));
  for (let k = 0; k < 4; k++) { await pagina.mouse.wheel(0, -200); await pagina.waitForTimeout(60); }
  await pagina.waitForTimeout(250);
  const c = await foto();
  conferir(`${modo}: a roda aproxima depois do clique`, !b.equals(c));
  await fig.locator('.maquete-barra [data-zoom="0.667"]').click(); await pagina.waitForTimeout(200);
  conferir(`${modo}: o botão − afasta`, !c.equals(await foto()));
  await pagina.locator(".maquete img").nth(5).click();
  await pagina.waitForTimeout(900);
  conferir(`${modo}: abrir outra desliga a anterior`, await pagina.locator(".maquete.viva").count() === 1 && await pagina.locator(".maquete canvas").count() === 1 && await fig.locator(".maquete-girar").isVisible());
  await pagina.goto(`${BASE}/cobblemon/biomas/`, { waitUntil: "networkidle" });
  await pagina.evaluate(() => document.querySelector("#floresta").scrollIntoView({ block: "center" }));
  await pagina.waitForSelector("#floresta .maquete.viva canvas", { timeout: 8000 });
  conferir(`${modo}: nos biomas a maquete do meio da tela acorda sozinha`, true);
  await fechar(navegador, erros);
}
