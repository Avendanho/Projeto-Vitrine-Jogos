/* Fotografa páginas da edição Cobblemon com movimento reduzido, para comparar antes e depois de uma mudança
 * de estilo que não deveria tocá-la: node testes/navegador/_cobblemon-fotos.mjs <pasta> */
import { abrir, BASE } from "./_comum.mjs";
const pasta = process.argv[2];
const paginas = ["/cobblemon/", "/cobblemon/pokemon/", "/cobblemon/pokemon/wooper/", "/cobblemon/itens/", "/cobblemon/estruturas/", "/cobblemon/biomas/", "/cobblemon/cacada/?alvos=194,54", "/cobblemon/desafios/"];
for (const celular of [false, true]) {
  const { navegador, pagina } = await abrir({ celular, calmo: true });
  if (celular) await pagina.emulateMedia({ reducedMotion: "reduce" });
  for (const [i, caminho] of paginas.entries()) {
    await pagina.goto(BASE + caminho, { waitUntil: "networkidle" });
    await pagina.waitForTimeout(500);
    await pagina.screenshot({ path: `${pasta}/${celular ? "cel" : "desk"}-${i}.png` });
    await pagina.evaluate(() => scrollTo(0, 2400)); await pagina.waitForTimeout(400);
    await pagina.screenshot({ path: `${pasta}/${celular ? "cel" : "desk"}-${i}-b.png` });
  }
  await navegador.close();
}
