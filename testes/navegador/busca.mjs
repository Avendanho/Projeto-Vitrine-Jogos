/* Busca global: abre por botão e por atalho, acha nas duas edições, navega por teclado, fecha com Esc. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";
import { COBBLEMON } from "../../scripts/base.mjs";

const fotos = process.argv[2];
const { navegador, pagina, erros } = await abrir();
await pagina.goto(`${BASE}/regioes/`, { waitUntil: "networkidle" });
const baixou = () => pagina.evaluate(() => performance.getEntriesByType("resource").some((r) => r.name.includes("/js/dados/busca.js")));
conferir("o índice não é baixado antes de alguém abrir a busca", !(await baixou()));
await pagina.click("[data-busca-abrir]");
await pagina.waitForSelector("dialog.busca[open]");
conferir("o botão abre a busca e baixa o índice", await baixou());
await pagina.keyboard.type("char");
await pagina.waitForSelector(".busca-resultados li");
const primeiros = await pagina.$$eval(".busca-resultados .busca-nome", (els) => els.slice(0, 3).map((e) => e.textContent));
conferir("\"char\" traz primeiro os nomes que começam assim", primeiros.every((n) => n.toLowerCase().startsWith("char")), primeiros.join(", "));
conferir("resultados da outra edição dizem de onde são", (await pagina.textContent(".busca-resultados")).includes("no Cobblemon"));
if (fotos) await pagina.screenshot({ path: `${fotos}/t10.png` });
await pagina.keyboard.press("ArrowDown");
const alvo = await pagina.getAttribute('.busca-resultados li[aria-selected="true"] a', "href");
await Promise.all([pagina.waitForURL((u) => u.pathname === alvo.split("#")[0]), pagina.keyboard.press("Enter")]);
conferir("seta e Enter abrem o resultado marcado", true, alvo);
await pagina.keyboard.press("/");
await pagina.waitForSelector("dialog.busca[open]");
conferir("a barra abre a busca quando não se está escrevendo", true);
await pagina.keyboard.type("zzzzqq");
conferir("sem resultado, a busca diz que não achou", (await pagina.textContent("[data-dica]")).includes("Nada com"));
await pagina.keyboard.press("Escape");
conferir("Esc fecha", await pagina.locator("dialog.busca[open]").count() === 0);
await pagina.goto(`${BASE}/quiz/`, { waitUntil: "networkidle" });
await pagina.click("#quiz-campo"); await pagina.keyboard.type("a/b");
conferir("a barra digitada num campo não abre a busca", await pagina.locator("dialog.busca[open]").count() === 0 && (await pagina.inputValue("#quiz-campo")) === "a/b");
await pagina.keyboard.press("Control+k");
await pagina.waitForSelector("dialog.busca[open]");
conferir("Ctrl+K abre de qualquer lugar", true);
await pagina.keyboard.press("Escape");

await pagina.goto(`${BASE}/cobblemon/`, { waitUntil: "networkidle" });
await pagina.click("[data-busca-abrir]"); await pagina.waitForSelector("dialog.busca[open]");
await pagina.keyboard.type("wooper"); await pagina.waitForSelector(".busca-resultados li");
conferir("na edição Cobblemon, o Wooper do Cobblemon vem primeiro", (await pagina.getAttribute(".busca-resultados li:first-child a", "href")) === "/cobblemon/pokemon/wooper/");
await pagina.fill("#busca-texto", COBBLEMON.itens.find((i) => i.id === "healing_machine").nome); await pagina.waitForSelector(".busca-resultados li");
const item = await pagina.getAttribute('.busca-resultados a[href*="/cobblemon/itens/#item-"]', "href");
await pagina.goto(BASE + item, { waitUntil: "networkidle" });
// a rolagem até a âncora acontece depois da transição entre páginas: espera um instante antes de medir
const naTela = await pagina.waitForFunction(() => { const el = document.querySelector(location.hash); if (!el) return false; const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }, null, { timeout: 5000 }).then(() => true, () => false);
conferir("um item leva à âncora dele na página de itens", naTela, item);
if (fotos) { await pagina.goto(`${BASE}/cobblemon/biomas/`, { waitUntil: "networkidle" }); await pagina.keyboard.press("/"); await pagina.waitForSelector("dialog.busca[open]"); await pagina.keyboard.type("ruin"); await pagina.waitForTimeout(300); await pagina.screenshot({ path: `${fotos}/t10-cb.png` }); }
const cel = await abrir({ celular: true });
await cel.pagina.goto(`${BASE}/pokedex/`, { waitUntil: "networkidle" });
const dentro = await cel.pagina.evaluate(() => [...document.querySelectorAll(".topo .marca, .topo .edicoes, .topo-menu")].every((el) => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }));
conferir("no celular logotipo, seletor e Menu cabem inteiros na tela", dentro);
await cel.pagina.click(".topo-menu");
const noMenu = await cel.pagina.locator(".topo-nav-busca").waitFor({ state: "visible", timeout: 3000 }).then(() => true, () => false);      // o menu abre com uma transição curta
conferir("e a busca fica dentro do menu", noMenu && await cel.pagina.locator(".topo-busca").isHidden());
await cel.pagina.click(".topo-nav-busca"); await cel.pagina.waitForSelector("dialog.busca[open]");
await cel.pagina.fill("#busca-texto", "pika"); await cel.pagina.waitForSelector(".busca-resultados li");
conferir("e a caixa cabe na tela", await cel.pagina.evaluate(() => document.querySelector("dialog.busca").getBoundingClientRect().right <= innerWidth && document.documentElement.scrollWidth === 390));
await cel.navegador.close();
await fechar(navegador, erros);
