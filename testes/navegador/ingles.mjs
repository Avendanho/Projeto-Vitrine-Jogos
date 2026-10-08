/* As páginas que existem em inglês (o início, a bússola e a ficha de cada jogo), e a bússola em português, que divide o código com a outra. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";

/* Palavras que só apareceriam se um trecho tivesse ficado sem tradução. */
const PORTUGUES = /\b(você|jogos?|perguntas?|abrir|regiões|seu perfil|vértice|bússola|ligar|desligar)\b/i;
const responderTudo = async (pagina) => {
  for (let q = 0; q < 8; q++) { await pagina.locator(".opcao").first().click(); await pagina.waitForTimeout(420); }
  await pagina.waitForSelector("[data-resultado]:not([hidden])");
};

const { navegador, pagina, erros } = await abrir();

// a bússola em português continua inteira
await pagina.goto(`${BASE}/bussola/`, { waitUntil: "networkidle" });
conferir("a bússola abre na primeira pergunta", (await pagina.textContent("[data-passo]")) === "Pergunta 1 de 8" && await pagina.locator(".opcao").count() === 4);
await pagina.locator(".opcao").first().click();
conferir("a resposta estica o perfil e a legenda diz onde", (await pagina.textContent("[data-legenda]")).startsWith("O perfil esticou em nostalgia"), await pagina.textContent("[data-legenda]"));
await pagina.waitForTimeout(420);
for (let q = 1; q < 8; q++) { await pagina.locator(".opcao").first().click(); await pagina.waitForTimeout(420); }
await pagina.waitForSelector("[data-resultado]:not([hidden])");
const pt = await pagina.innerText("[data-resultado]");
conferir("no fim vêm três jogos, cada um com o porquê", await pagina.locator(".resultado-lista > li").count() === 3 && pt.includes("Por que combina com você") && pt.includes("Primeiro da lista"));
conferir("o resultado vai para o endereço", /#r=\d{8}$/.test(pagina.url()), pagina.url());
conferir("a página em português aponta para a versão em inglês", (await pagina.getAttribute(".topo-lingua", "href")) === "/en/compass/" && (await pagina.textContent(".topo-lingua")) === "English");

// o início em inglês
await pagina.goto(`${BASE}/en/`, { waitUntil: "networkidle" });
await pagina.waitForTimeout(1500);
conferir("o início em inglês se declara em inglês e aponta de volta", await pagina.evaluate(() => document.documentElement.lang) === "en" && (await pagina.getAttribute(".topo-lingua", "href")) === "/" && await pagina.locator('link[rel="alternate"][hreflang="pt-BR"]').count() === 1);
const inicio = await pagina.innerText("main");
conferir("o texto do início está em inglês", inicio.includes("Every Pokémon game has a profile") && inicio.includes("Thirty games, one hexagon") && !PORTUGUES.test(inicio), (inicio.match(PORTUGUES) || [""])[0]);
conferir("os nomes dos eixos, os jogos e a leitura da tela também", (await pagina.textContent('.abertura-hex [data-eixo="exploracao"]')) === "Exploration" && (await pagina.textContent(".abertura-teclas button")) === "HeartGold and SoulSilver" && (await pagina.textContent("[data-leitura-nota]")) === "2009, Nintendo DS");
await pagina.click(".abertura-teclas button:nth-child(6)");
conferir("as teclas trocam o perfil, com o nome em inglês", (await pagina.textContent("[data-perfil-atual]")) === "Red, Blue and Yellow");
conferir("o que leva às seções em português é marcado como tal", (await pagina.getAttribute('.topo-nav a[href="/pokedex/"]', "hreflang")) === "pt-BR" && (await pagina.getAttribute(".pico-final a", "href")) === "/en/compass/");
await pagina.click(".topo-som");
conferir("o painel de som vem em inglês", (await pagina.textContent("[data-som-chave]")) === "Turn sound on" && (await pagina.innerText(".som-painel")).includes("Key sounds"));
await pagina.keyboard.press("Escape");

// a bússola em inglês, do começo ao resultado
await pagina.goto(`${BASE}/en/compass/`, { waitUntil: "networkidle" });
conferir("a bússola em inglês abre na primeira pergunta", (await pagina.textContent("[data-passo]")) === "Question 1 of 8" && (await pagina.textContent(".bussola-pergunta h2")) === "What brings you here?");
await pagina.locator(".opcao").first().click();
conferir("a legenda acompanha em inglês", (await pagina.textContent("[data-legenda]")) === "The profile stretched toward nostalgia.", await pagina.textContent("[data-legenda]"));
await pagina.waitForTimeout(420);
for (let q = 1; q < 8; q++) { await pagina.locator(".opcao").first().click(); await pagina.waitForTimeout(420); }
await pagina.waitForSelector("[data-resultado]:not([hidden])");
const en = await pagina.innerText("[data-resultado]"), topo = await pagina.innerText(".bussola");
conferir("o resultado vem em inglês, com o porquê de cada jogo", await pagina.locator(".resultado-lista > li").count() === 3 && en.includes("Why it suits you") && en.includes("First on the list") && topo.includes("Your profile is ready."));
conferir("sem trecho esquecido em português", !PORTUGUES.test(en) && !PORTUGUES.test(topo), (en.match(PORTUGUES) || topo.match(PORTUGUES) || [""])[0]);
const mesmoJogo = await pagina.getAttribute(".resultado-lista h3 a", "href");
conferir("o resultado leva às fichas em inglês", mesmoJogo.startsWith("/en/games/") && (await pagina.getAttribute(".resultado-ligacoes .botao", "href")) === mesmoJogo, mesmoJogo);
await pagina.goto(`${BASE}/bussola/#r=00000000`, { waitUntil: "networkidle" });
conferir("as mesmas respostas dão o mesmo primeiro jogo nas duas línguas", (await pagina.getAttribute(".resultado-lista h3 a", "href")) === mesmoJogo.replace("/en/games/", "/jogos/"), mesmoJogo);

// a ficha de um jogo em inglês
await pagina.goto(`${BASE}/en/games/scarlet-violet/`, { waitUntil: "networkidle" });
const ficha = await pagina.evaluate(() => { const c = document.querySelector("main").cloneNode(true); c.querySelectorAll(".gaveta").forEach((g) => g.remove()); return c.innerText; });   // sem os nomes das espécies
conferir("a ficha em inglês tem título, leitura e listas traduzidos", (await pagina.textContent("h1")) === "Pokémon Scarlet and Violet" && ficha.includes("Reading the profile") && ficha.includes("It is for you if you") && ficha.includes("One continuous map, with no gates between areas."));
conferir("sem trecho esquecido em português na ficha", !PORTUGUES.test(ficha.replace(/\(in Portuguese\)/g, "").replace(/\(timeline, in Portuguese\)/g, "")), (ficha.match(PORTUGUES) || [""])[0]);
conferir("a ficha aponta para a versão em português, e os vizinhos para as fichas em inglês", (await pagina.getAttribute(".topo-lingua", "href")) === "/jogos/scarlet-violet/" && (await pagina.getAttribute(".jogo-vizinhas .hex-item", "href")).startsWith("/en/games/") && (await pagina.getAttribute(".jogo-passos a", "href")).startsWith("/en/games/"));
conferir("os tipos da Pokédex do jogo vêm em inglês", (await pagina.textContent('.dex-controles [data-tipo="fogo"]')) === "Fire" && (await pagina.textContent(".gaveta li .tipo")) !== "" && (await pagina.textContent("[data-dex-rotulo]")) === "species");
const todas = Number(await pagina.textContent("[data-dex-contagem]"));
await pagina.click('.dex-controles [data-tipo="fogo"]');
const deFogo = Number(await pagina.textContent("[data-dex-contagem]"));
conferir("o filtro por tipo funciona na ficha em inglês", deFogo > 0 && deFogo < todas, `${deFogo} de ${todas}`);
await pagina.goto(`${BASE}/en/games/colosseum-xd/`, { waitUntil: "networkidle" });
conferir("jogo sem Pokédex e fora das regiões também tem ficha em inglês", (await pagina.innerText(".jogo-pokedex")).includes("Orre has no regional Pokédex") && (await pagina.innerText(".ficha-tecnica")).includes("Setting"));
await pagina.goto(`${BASE}/jogos/scarlet-violet/`, { waitUntil: "networkidle" });
conferir("a ficha em português aponta para a versão em inglês", (await pagina.getAttribute(".topo-lingua", "href")) === "/en/games/scarlet-violet/" && (await pagina.textContent("[data-dex-rotulo]")) === "espécies");

const cel = await abrir({ celular: true });
for (const caminho of ["/en/games/scarlet-violet/", "/en/", "/en/compass/"]) {
  await cel.pagina.goto(BASE + caminho, { waitUntil: "networkidle" });
  conferir(`${caminho} cabe na largura do celular`, await cel.pagina.evaluate(() => document.documentElement.scrollWidth) === 390);
}
await cel.pagina.click(".topo-menu");
await cel.pagina.waitForTimeout(450);             // o menu abre com uma transição curta
conferir("no celular o menu traz o link para o português", await cel.pagina.locator(".topo-nav .topo-lingua").isVisible() && (await cel.pagina.textContent(".topo-nav .topo-lingua")) === "Português");
conferir("sem erros de JavaScript no celular", cel.erros.length === 0, cel.erros.join(" | ").slice(0, 200));
await cel.navegador.close();
await fechar(navegador, erros);
