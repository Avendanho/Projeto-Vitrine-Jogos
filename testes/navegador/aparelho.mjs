/* O aparelho e as páginas de brincar: roda de tipos, desenho do perfil, a Pokédex que fala, o direcional, as luzes e o número digitado. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";
import { JOGOS } from "../../dados/jogos.mjs";
import { valoresDe, encaixe } from "../../src/js/hexagono.js";

/* Guarda o que a página manda falar e as classes que passam pelo <html>, para conferir sem ouvir nem ver piscar. */
const escuta = () => {
  window.__fala = { ditas: [], cancelamentos: 0 };
  if (window.speechSynthesis) {
    speechSynthesis.speak = (frase) => window.__fala.ditas.push({ texto: frase.text, lingua: frase.lang });
    speechSynthesis.cancel = () => { window.__fala.cancelamentos++; };
  }
  window.__luzes = new Set();
  const olheiro = new MutationObserver(() => { for (const c of document.documentElement.classList) if (c.startsWith("luz-")) window.__luzes.add(c); });
  // este trecho roda antes de a página existir: espera o <html> nascer para começar a olhar
  const olhar = () => (document.documentElement ? olheiro.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] }) : setTimeout(olhar, 5));
  olhar();
};
const maisParecido = (perfil) => [...JOGOS].sort((a, b) => encaixe(perfil, valoresDe(b.atributos)) - encaixe(perfil, valoresDe(a.atributos)))[0].slug;

const { navegador, pagina, erros } = await abrir();
await pagina.addInitScript(escuta);

// ---------- roda de tipos ----------
await pagina.goto(`${BASE}/tipos/`, { waitUntil: "networkidle" });
conferir("a roda abre com os 18 tipos e o Fogo escolhido", await pagina.locator(".roda-tipo").count() === 18 && (await pagina.getAttribute('.roda-tipo[data-tipo="fogo"]', "aria-pressed")) === "true");
conferir("quatro linhas cheias saem do Fogo e três tracejadas chegam nele", await pagina.locator(".roda-linha-atinge").count() === 4 && await pagina.locator(".roda-linha-apanha").count() === 3);
conferir("a Planta fica marcada como atingida e a Água como atacante", await pagina.locator('.roda-tipo[data-tipo="planta"].atingido').count() === 1 && await pagina.locator('.roda-tipo[data-tipo="agua"].atacante').count() === 1);
await pagina.click('.roda-tipo[data-tipo="dragao"]');
const dragao = (await pagina.innerText("[data-leitura]")).replace(/\s+/g, " ");
conferir("escolher Dragão troca o centro, as listas e o endereço", (await pagina.textContent("[data-centro] strong")) === "Dragão" && dragao.includes("Não faz efeito em Fada") && pagina.url().endsWith("#dragao"), dragao.slice(0, 160));
conferir("o tipo contra ele mesmo aparece na lista, sem linha para si", dragao.includes("Atinge em dobro Dragão") && await pagina.locator(".roda-linha-atinge").count() === 0);
await pagina.focus('.roda-tipo[data-tipo="dragao"]');
await pagina.keyboard.press("ArrowRight");
conferir("as setas do teclado andam pela roda", (await pagina.textContent("[data-centro] strong")) === "Sombrio");
await pagina.goto(`${BASE}/tipos/#fantasma`, { waitUntil: "networkidle" });
conferir("o endereço com um tipo abre a roda nele", (await pagina.textContent("[data-centro] strong")) === "Fantasma");

// ---------- desenhe o seu perfil ----------
await pagina.goto(`${BASE}/desenhar/`, { waitUntil: "networkidle" });
const primeiro = () => pagina.getAttribute("[data-lista] li:first-child", "data-slug");
conferir("o perfil começa regular e a lista mostra oito jogos", await pagina.locator("[data-lista] li:visible").count() === 8 && await primeiro() === maisParecido([3, 3, 3, 3, 3, 3]), await primeiro());
// pelo teclado: competitivo e dificuldade no máximo, o resto no zero
for (const [eixo, tecla] of [["exploracao", "Home"], ["liberdade", "Home"], ["competitivo", "End"], ["dificuldade", "End"], ["historia", "Home"], ["nostalgia", "Home"]]) { await pagina.focus(`.hex-pega[data-eixo="${eixo}"]`); await pagina.keyboard.press(tecla); }
await pagina.waitForTimeout(400);
conferir("mover os vértices pelo teclado reordena a lista", await primeiro() === maisParecido([0, 0, 5, 5, 0, 0]) && (await pagina.getAttribute('.hex-pega[data-eixo="competitivo"]', "aria-valuenow")) === "5", await primeiro());
conferir("o desenho vai para o endereço", pagina.url().endsWith("#p=0,0,50,50,0,0"), pagina.url());
// com o ponteiro: arrastar o vértice de exploração do centro até a borda de cima
const caixa = await pagina.locator(".desenhar-hex .hex-vivo").boundingBox(), alca = await pagina.locator('.hex-pega[data-eixo="exploracao"]').boundingBox();
await pagina.mouse.move(alca.x + alca.width / 2, alca.y + alca.height / 2);
await pagina.mouse.down();
await pagina.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height * 0.2, { steps: 6 });
await pagina.mouse.move(caixa.x + caixa.width / 2, caixa.y - 30, { steps: 6 });
await pagina.mouse.up();
await pagina.waitForTimeout(400);
conferir("arrastar o vértice até a borda leva a nota a cinco", (await pagina.getAttribute('.hex-pega[data-eixo="exploracao"]', "aria-valuenow")) === "5" && await primeiro() === maisParecido([5, 0, 5, 5, 0, 0]), await primeiro());
await pagina.click("[data-todos]");
conferir("o botão abre os trinta jogos", await pagina.locator("[data-lista] li:visible").count() === JOGOS.length);
await pagina.click("[data-zerar]");
conferir("começar de novo volta ao perfil regular e limpa o endereço", (await pagina.getAttribute('.hex-pega[data-eixo="exploracao"]', "aria-valuenow")) === "3" && !pagina.url().includes("#"));
await pagina.goto(`${BASE}/bussola/#r=00000000`, { waitUntil: "networkidle" });
conferir("o resultado da bússola leva ao desenho com o mesmo perfil", /^\/desenhar\/#p=(\d+,){5}\d+$/.test(await pagina.getAttribute("[data-ajustar]", "href")), await pagina.getAttribute("[data-ajustar]", "href"));

// ---------- a Pokédex que fala ----------
await pagina.goto(`${BASE}/pokedex/charizard/`, { waitUntil: "networkidle" });
const temVoz = await pagina.evaluate(() => "speechSynthesis" in window);
if (temVoz) {
  conferir("o botão de ouvir a Pokédex aparece onde o navegador sabe falar", await pagina.locator("[data-falar]").isVisible());
  await pagina.click("[data-falar]");
  const dita = await pagina.evaluate(() => window.__fala.ditas[0]);
  conferir("ele manda ler o nome, a categoria e a entrada, em inglês", dita?.texto.startsWith("Charizard, the Flame Pokémon. ") && dita.texto.length > 60 && dita.lingua === "en-US", JSON.stringify(dita));
  conferir("enquanto fala, o botão vira Parar", (await pagina.textContent("[data-falar]")) === "Parar" && await pagina.evaluate(() => document.documentElement.classList.contains("falando")));
  await pagina.click("[data-falar]");
  conferir("o segundo toque interrompe e devolve o botão", (await pagina.textContent("[data-falar]")) === "Ouvir a Pokédex" && await pagina.evaluate(() => window.__fala.ditas.length === 1 && !document.documentElement.classList.contains("falando")));
  await pagina.goto(`${BASE}/cobblemon/pokemon/wooper/`, { waitUntil: "networkidle" });
  await pagina.click("[data-falar]");
  const descricao = await pagina.evaluate(() => window.__fala.ditas[0]);
  conferir("no Cobblemon a descrição é lida em português", descricao?.texto.startsWith("Wooper. ") && descricao.lingua === "pt-BR", JSON.stringify(descricao));
} else conferir("este navegador não tem síntese de voz: o botão fica escondido", await pagina.locator("[data-falar]").isHidden());

// ---------- o direcional ----------
await pagina.goto(`${BASE}/time/`, { waitUntil: "networkidle" });
conferir("o direcional leva às seções vizinhas e ao alto da página", (await pagina.getAttribute(".direcional-esquerda", "href")) === "/desafios/" && (await pagina.getAttribute(".direcional-direita", "href")) === "/" && (await pagina.getAttribute(".direcional-cima", "href")) === "#conteudo");
conferir("cada tecla diz o que faz", (await pagina.getAttribute(".direcional-esquerda", "aria-label")) === "Seção anterior: Desafios" && (await pagina.getAttribute(".direcional-baixo", "aria-label")) === "Abrir um Pokémon ao acaso");
await Promise.all([pagina.waitForURL(/\/pokedex\/[a-z0-9-]+\/$/), pagina.click(".direcional-baixo")]);
conferir("a tecla de baixo abre um Pokémon ao acaso", /\/pokedex\/[a-z0-9-]+\/$/.test(pagina.url()), pagina.url());
await pagina.goto(`${BASE}/cobblemon/itens/`, { waitUntil: "networkidle" });
conferir("a edição Cobblemon não tem direcional", await pagina.locator(".direcional").count() === 0);

// ---------- o número digitado ----------
await pagina.goto(`${BASE}/regioes/`, { waitUntil: "networkidle" });
await pagina.keyboard.type("25", { delay: 60 });
await pagina.waitForSelector(".visor-numero:not([hidden])");
conferir("digitar um número mostra a espécie daquele número", (await pagina.innerText(".visor-numero")).replace(/\s+/g, " ") === "Nº 0025 Pikachu");
await pagina.waitForURL(/\/pokedex\/pikachu\/$/, { timeout: 4000 });
conferir("e abre a página dela", pagina.url().endsWith("/pokedex/pikachu/"));
await pagina.keyboard.type("7", { delay: 60 });
await pagina.waitForSelector(".visor-numero:not([hidden])");
await pagina.keyboard.press("Escape");
await pagina.waitForTimeout(1500);
conferir("Esc desiste do número", await pagina.locator(".visor-numero").isHidden() && pagina.url().endsWith("/pokedex/pikachu/"));
await pagina.keyboard.type("9999", { delay: 60 });
await pagina.waitForSelector(".visor-numero.sem-registro");
conferir("número que não existe aparece sem registro e não leva a lugar nenhum", (await pagina.innerText(".visor-numero")).includes("???") && pagina.url().endsWith("/pokedex/pikachu/"));
await pagina.goto(`${BASE}/pokedex/`, { waitUntil: "networkidle" });
await pagina.fill(".dex-busca input", "");
await pagina.focus(".dex-busca input");
await pagina.keyboard.type("25", { delay: 60 });
await pagina.waitForTimeout(1500);
conferir("quem digita num campo de busca não chama o aparelho", await pagina.locator(".visor-numero").count() === 0 && pagina.url().includes("/pokedex/") && !pagina.url().endsWith("/pikachu/"));
await pagina.goto(`${BASE}/cobblemon/biomas/`, { waitUntil: "networkidle" });
await pagina.keyboard.type("194", { delay: 60 });
await pagina.keyboard.press("Enter");
await pagina.waitForURL(/\/cobblemon\/pokemon\/wooper\/$/, { timeout: 4000 });
conferir("no Cobblemon o número abre a página da espécie no mod, e Enter não espera", pagina.url().endsWith("/cobblemon/pokemon/wooper/"));

// ---------- as luzes ----------
await pagina.goto(`${BASE}/`, { waitUntil: "networkidle" });
await pagina.click(".topo-som");
await pagina.click("[data-som-chave]");
await pagina.keyboard.press("Escape");
await pagina.waitForTimeout(2600);
const luzes = await pagina.evaluate(() => [...window.__luzes].sort());
conferir("com a música tocando, as luzes do alto acendem no ritmo dela", luzes.includes("luz-1") && luzes.includes("luz-2") && luzes.includes("luz-3"), luzes.join());
await pagina.click(".topo-som");
await pagina.click("[data-som-chave]");
await pagina.keyboard.press("Escape");

const cel = await abrir({ celular: true });
for (const caminho of ["/tipos/", "/desenhar/"]) {
  await cel.pagina.goto(BASE + caminho, { waitUntil: "networkidle" });
  conferir(`${caminho} cabe na largura do celular`, await cel.pagina.evaluate(() => document.documentElement.scrollWidth) === 390);
}
conferir("sem erros de JavaScript no celular", cel.erros.length === 0, cel.erros.join(" | ").slice(0, 200));
await cel.navegador.close();
await fechar(navegador, erros);
