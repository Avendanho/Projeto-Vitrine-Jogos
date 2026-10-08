/* Receitas em grade: a bancada da Poké Bola, os nomes nas casas e a largura no celular. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";
import { COBBLEMON } from "../../scripts/base.mjs";

const fotos = process.argv[2];
const { navegador, pagina, erros } = await abrir();
await pagina.goto(`${BASE}/cobblemon/itens/`, { waitUntil: "networkidle" });
const comReceita = COBBLEMON.itens.filter((i) => i.receita).length;
conferir(`há uma bancada para cada uma das ${comReceita} receitas`, await pagina.locator(".bancada").count() === comReceita);
const nomeDe = (id) => COBBLEMON.itens.find((i) => i.id === id).nome;
const bola = pagina.locator(`.cb-itens-lista li:has(strong:text-is("${nomeDe("poke_ball")}")) .bancada`);
conferir("a Poké Bola tem nove casas, cinco preenchidas", await bola.locator(".bancada-casa").count() === 9 && await bola.locator(".bancada-casa[title]").count() === 5);
conferir("a casa do meio diz o grupo de materiais", (await bola.locator(".bancada-casa").nth(4).getAttribute("title")).includes("Materiais"));
conferir("e a saída mostra que rende quatro", (await bola.locator(".bancada-rende").textContent()) === "4");
const figuras = await pagina.evaluate(() => [...document.querySelectorAll(".bancada-casa[title]")].filter((c) => !c.querySelector(".item-icone, .ing-icone, .item-bloco")).length);
conferir("nenhuma casa preenchida ficou sem figura", figuras === 0, String(figuras));
conferir("o texto da receita continua para leitor de tela e busca", (await pagina.locator(`.cb-itens-lista li:has(strong:text-is("${nomeDe("pc")}")) .cb-receita`).first().textContent()).includes("Lingote de Ferro"), nomeDe("pc"));
if (fotos) { await bola.scrollIntoViewIfNeeded(); await pagina.screenshot({ path: `${fotos}/t7.png` }); }
const cel = await abrir({ celular: true });
await cel.pagina.goto(`${BASE}/cobblemon/itens/`, { waitUntil: "networkidle" });
conferir("no celular a página não estoura para os lados", await cel.pagina.evaluate(() => document.documentElement.scrollWidth) === 390);
await cel.navegador.close();
await fechar(navegador, erros);
