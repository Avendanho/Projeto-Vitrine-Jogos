/* Receitas em grade: a bancada da Poké Bola, os nomes nas casas e a largura no celular. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";
import { COBBLEMON } from "../../scripts/base.mjs";

const fotos = process.argv[2];
const { navegador, pagina, erros } = await abrir();
await pagina.goto(`${BASE}/cobblemon/itens/`, { waitUntil: "networkidle" });
const comReceita = COBBLEMON.itens.filter((i) => i.receita).length, deOutras = COBBLEMON.itens.reduce((n, i) => n + (i.outras?.length ?? 0), 0);
conferir(`há um desenho para cada uma das ${comReceita} receitas de bancada e das ${deOutras} de outras estações`, await pagina.locator(".bancada").count() === comReceita + deOutras);
const maxPP = pagina.locator(`.cb-itens-lista li:has(strong:text-is("${COBBLEMON.itens.find((i) => i.id === "pp_max").nome}")) .bancada`);
conferir("a receita de suporte de poções diz a estação e mostra as duas entradas em fila", (await maxPP.locator(".bancada-titulo").textContent()).includes("Poções") && await maxPP.locator(".bancada-fila .bancada-casa").count() === 2);
await pagina.fill("#item-procurar", "panela de fogueira");
conferir("buscar pela estação acha as receitas dela", await pagina.locator(".cb-itens-lista li:not([hidden])").count() >= 50);
await pagina.fill("#item-procurar", "");
const nomeDe = (id) => COBBLEMON.itens.find((i) => i.id === id).nome;
const bola = pagina.locator(`.cb-itens-lista li:has(strong:text-is("${nomeDe("poke_ball")}")) .bancada`);
conferir("a Poké Bola tem nove casas, cinco preenchidas", await bola.locator(".bancada-casa").count() === 9 && await bola.locator(".bancada-casa[title]").count() === 5);
conferir("a casa do meio diz o grupo de materiais", (await bola.locator(".bancada-casa").nth(4).getAttribute("title")).includes("Materiais"));
conferir("e a saída mostra que rende quatro", (await bola.locator(".bancada-rende").textContent()) === "4");
const figuras = await pagina.evaluate(() => [...document.querySelectorAll(".bancada-casa[title]")].filter((c) => !c.querySelector(".item-icone, .ing-icone, .item-bloco")).length);
conferir("nenhuma casa preenchida ficou sem figura", figuras === 0, String(figuras));
conferir("o texto da receita continua para leitor de tela e busca", (await pagina.locator(`.cb-itens-lista li:has(strong:text-is("${nomeDe("pc")}")) .cb-receita`).first().textContent()).includes("Lingote de Ferro"), nomeDe("pc"));
if (fotos) { await bola.scrollIntoViewIfNeeded(); await pagina.screenshot({ path: `${fotos}/t7.png` }); }
if (fotos) { await maxPP.scrollIntoViewIfNeeded(); await pagina.screenshot({ path: `${fotos}/t7-estacoes.png` }); }
// bagas: de onde vem cada uma
const lum = pagina.locator("#item-lum_berry");
conferir("a Baga Lum mostra os pares de bagas que a geram", await lum.locator(".cb-par").count() === COBBLEMON.itens.find((i) => i.id === "lum_berry").cruzas.length && (await lum.locator(".cb-par").first().getAttribute("title")).includes(" com "));
await pagina.fill("#item-procurar", "silvestre");
conferir("buscar \"silvestre\" acha as bagas que o mundo gera", await pagina.locator("#g-bagas li:not([hidden])").count() === COBBLEMON.itens.filter((i) => i.silvestre).length);
await pagina.fill("#item-procurar", "");
const cel = await abrir({ celular: true });
await cel.pagina.goto(`${BASE}/cobblemon/itens/`, { waitUntil: "networkidle" });
conferir("no celular a página não estoura para os lados", await cel.pagina.evaluate(() => document.documentElement.scrollWidth) === 390);
await cel.navegador.close();
await fechar(navegador, erros);
