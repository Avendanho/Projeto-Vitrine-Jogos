/* Pokémon em 3D na página da espécie do Cobblemon: entra com clique, gira, aproxima, troca para shiny, com e sem WebGL. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";

const fotos = process.argv[2];
for (const semWebgl of [false, true]) {
  const modo = semWebgl ? "sem WebGL" : "com WebGL";
  const { navegador, pagina, erros } = await abrir({ semWebgl });
  await pagina.goto(`${BASE}/cobblemon/pokemon/charizard/`, { waitUntil: "networkidle" });
  await pagina.waitForSelector(".cb-retrato.revelado");
  const fig = pagina.locator(".cb-retrato");
  conferir(`${modo}: o retrato parado continua lá antes do clique`, await fig.locator(".cb-modelo").isVisible() && await pagina.locator(".cb-retrato canvas.maquete-tela").count() === 0);
  await fig.locator(".maquete-girar").click();
  await pagina.waitForSelector(".cb-retrato.viva .maquete-tela");
  await pagina.waitForTimeout(700);
  const tela = fig.locator(".maquete-tela"), caixa = await tela.boundingBox(), foto = () => tela.screenshot();
  // pára o giro automático com um clique antes de comparar imagens
  await pagina.mouse.click(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2); await pagina.waitForTimeout(200);
  const a = await foto();
  const pintado = await pagina.evaluate(() => { const t = document.querySelector(".cb-retrato .maquete-tela"), k = Object.assign(document.createElement("canvas"), { width: 64, height: 64 }), x = k.getContext("2d"); x.drawImage(t, 0, 0, 64, 64); const d = x.getImageData(0, 0, 64, 64).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
  if (semWebgl) conferir(`${modo}: o modelo foi pintado`, pintado > 400, `${pintado} pontos`);
  if (fotos) await pagina.screenshot({ path: `${fotos}/t8-${semWebgl ? "soft" : "gl"}.png` });
  await pagina.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2); await pagina.mouse.down(); await pagina.mouse.move(caixa.x + caixa.width / 2 + 150, caixa.y + caixa.height / 2 + 20, { steps: 5 }); await pagina.mouse.up();
  await pagina.waitForTimeout(250);
  const b = await foto();
  conferir(`${modo}: arrastar gira o modelo`, !a.equals(b));
  for (let k = 0; k < 4; k++) { await pagina.mouse.wheel(0, -200); await pagina.waitForTimeout(60); }
  await pagina.waitForTimeout(250);
  const c = await foto();
  conferir(`${modo}: a roda aproxima`, !b.equals(c));
  await pagina.keyboard.press("0"); await pagina.waitForTimeout(250);
  const d = await foto();
  await fig.locator("[data-shiny-botao]").click(); await pagina.waitForTimeout(700);
  const e = await foto();
  conferir(`${modo}: o botão Shiny troca a textura`, !d.equals(e) && await fig.locator("[data-shiny-botao]").getAttribute("aria-pressed") === "true");
  if (fotos) await pagina.screenshot({ path: `${fotos}/t9-${semWebgl ? "soft" : "gl"}.png` });
  await fig.locator("[data-shiny-botao]").click(); await pagina.waitForTimeout(700);
  conferir(`${modo}: e desligar volta à cor normal`, d.equals(await foto()) || await fig.locator("[data-shiny-botao]").getAttribute("aria-pressed") === "false");
  // shiny direto, sem ter ligado o 3D antes
  await pagina.goto(`${BASE}/cobblemon/pokemon/gyarados/`, { waitUntil: "networkidle" });
  await pagina.locator("[data-shiny-botao]").click();
  await pagina.waitForSelector(".cb-retrato.viva .maquete-tela");
  conferir(`${modo}: Shiny com o 3D parado já liga o modelo na versão shiny`, await pagina.locator("[data-shiny-botao]").getAttribute("aria-pressed") === "true");
  if (fotos) { await pagina.waitForTimeout(600); await pagina.screenshot({ path: `${fotos}/t9-gyarados-${semWebgl ? "soft" : "gl"}.png` }); }
  // a gelatina do Solosis deixa ver o miolo
  await pagina.goto(`${BASE}/cobblemon/pokemon/solosis/`, { waitUntil: "networkidle" });
  await pagina.locator(".maquete-girar").click();
  await pagina.waitForSelector(".cb-retrato.viva .maquete-tela"); await pagina.waitForTimeout(600);
  if (fotos) await pagina.locator(".cb-retrato").screenshot({ path: `${fotos}/t8-solosis-${semWebgl ? "soft" : "gl"}.png` });
  await fechar(navegador, erros);
}
const cel = await abrir({ celular: true });
await cel.pagina.goto(`${BASE}/cobblemon/pokemon/wooper/`, { waitUntil: "networkidle" });
await cel.pagina.locator(".maquete-girar").click();
await cel.pagina.waitForSelector(".cb-retrato.viva .maquete-tela");
conferir("no celular o modelo entra e a página não estoura para os lados", await cel.pagina.evaluate(() => document.documentElement.scrollWidth) === 390);
await cel.navegador.close();
const calmo = await abrir({ calmo: true });
await calmo.pagina.goto(`${BASE}/cobblemon/pokemon/wooper/`, { waitUntil: "networkidle" });
await calmo.pagina.locator(".maquete-girar").click();
await calmo.pagina.waitForSelector(".cb-retrato.viva .maquete-tela"); await calmo.pagina.waitForTimeout(500);
const t1 = await calmo.pagina.locator(".maquete-tela").screenshot(); await calmo.pagina.waitForTimeout(700);
conferir("com movimento reduzido o modelo não gira sozinho", t1.equals(await calmo.pagina.locator(".maquete-tela").screenshot()));
await calmo.navegador.close();
process.exit(0);
