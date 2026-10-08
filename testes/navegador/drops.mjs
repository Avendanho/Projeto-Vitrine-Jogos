/* Itens do Cobblemon: cada item mostra quem o deixa cair, e a busca acha pelo nome do Pokémon. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";
import { COBBLEMON } from "../../scripts/base.mjs";

const { navegador, pagina, erros } = await abrir();
await pagina.goto(`${BASE}/cobblemon/itens/`, { waitUntil: "networkidle" });
const charizard = COBBLEMON.especies[6];
await pagina.fill("#item-procurar", "charizard");
const visiveis = await pagina.$$eval(".cb-itens-lista li:not([hidden]) strong", (els) => els.map((e) => e.textContent));
const esperados = charizard.drops.map(([nome]) => nome);
conferir("buscar \"charizard\" mostra os itens que ele deixa cair", esperados.every((n) => visiveis.includes(n)), `${visiveis.join(", ")}`);
conferir("e nada além deles e de itens com o nome dele", visiveis.every((n) => esperados.includes(n) || /charizard/i.test(n)), visiveis.join(", "));
await pagina.fill("#item-procurar", "");
conferir("sem busca, a contagem volta aos itens do mod", (await pagina.textContent("[data-dex-contagem]")).trim() === String(COBBLEMON.itens.length));
conferir("o item mostra os slots de quem o deixa cair", await pagina.locator(".cb-deixado .slot").count() > 100);
const celular = await abrir({ celular: true });
await celular.pagina.goto(`${BASE}/cobblemon/itens/`, { waitUntil: "networkidle" });
conferir("no celular a página não estoura para os lados", await celular.pagina.evaluate(() => document.documentElement.scrollWidth) === 390);
await celular.navegador.close();
await fechar(navegador, erros);
