/* Comparar dois Pokémon: par de exemplo, troca de espécie, endereço e endereço com lixo. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";

const { navegador, pagina, erros } = await abrir();
await pagina.goto(`${BASE}/comparar/pokemon/`, { waitUntil: "networkidle" });
const nomes = () => pagina.$$eval(".duelo-lado h2", (els) => els.map((e) => e.textContent));
conferir("sem nada no endereço, abre com um par de exemplo", (await nomes()).join(" x ") === "Charizard x Blastoise");
conferir("o total de Charizard é 534 e o de Blastoise é 530", (await pagina.$$eval(".duelo-total .duelo-valor", (els) => els.map((e) => e.textContent))).join(",") === "534,530");
conferir("a vantagem fica marcada em quem tem mais", await pagina.locator('.duelo-total [data-valor="a"].maior').count() === 1);
await pagina.fill("#duelo-b", "Pikachu");
conferir("digitar o nome inteiro troca a espécie", (await nomes())[1] === "Pikachu");
conferir("e o endereço acompanha", pagina.url().endsWith("?a=charizard&b=pikachu"), pagina.url());
await pagina.click("[data-trocar]");
conferir("trocar de lado inverte o par", (await nomes()).join(" x ") === "Pikachu x Charizard");
await pagina.goto(`${BASE}/comparar/pokemon/?a=naoexiste&b=%3Cscript%3E`, { waitUntil: "networkidle" });
conferir("endereço com lixo abre vazio, sem quebrar", await pagina.locator(".duelo-vazio").count() === 2);
await pagina.goto(`${BASE}/pokedex/wooper/`, { waitUntil: "networkidle" });
await pagina.click(".atributos-mais a");
await pagina.waitForSelector(".duelo-lado h2");
conferir("a página da espécie leva ao comparador com ela escolhida", (await nomes())[0] === "Wooper");
const cel = await abrir({ celular: true });
await cel.pagina.goto(`${BASE}/comparar/pokemon/`, { waitUntil: "networkidle" });
conferir("no celular a página não estoura para os lados", await cel.pagina.evaluate(() => document.documentElement.scrollWidth) === 390);
await cel.pagina.screenshot({ path: process.argv[2] ? `${process.argv[2]}/t2-cel.png` : "/dev/null" }).catch(() => {});
await cel.navegador.close();
if (process.argv[2]) { await pagina.goto(`${BASE}/comparar/pokemon/?a=garchomp&b=tyranitar`, { waitUntil: "networkidle" }); await pagina.screenshot({ path: `${process.argv[2]}/t2.png` }); }
await fechar(navegador, erros);
