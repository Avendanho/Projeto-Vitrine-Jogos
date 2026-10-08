/* As duas páginas que existem em inglês (o início e a bússola), e a bússola em português, que divide o código com ela. */
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
conferir("sem trecho esquecido em português", !PORTUGUES.test(en.replace(/\(in Portuguese\)/g, "")) && !PORTUGUES.test(topo), (en.match(PORTUGUES) || topo.match(PORTUGUES) || [""])[0]);
conferir("as fichas dos jogos avisam que estão em português", (await pagina.getAttribute(".resultado-lista h3 a", "hreflang")) === "pt-BR" && en.includes("(in Portuguese)"));
const mesmoJogo = await pagina.getAttribute(".resultado-lista h3 a", "href");
await pagina.goto(`${BASE}/bussola/#r=00000000`, { waitUntil: "networkidle" });
conferir("as mesmas respostas dão o mesmo primeiro jogo nas duas línguas", (await pagina.getAttribute(".resultado-lista h3 a", "href")) === mesmoJogo, mesmoJogo);

const cel = await abrir({ celular: true });
for (const caminho of ["/en/", "/en/compass/"]) {
  await cel.pagina.goto(BASE + caminho, { waitUntil: "networkidle" });
  conferir(`${caminho} cabe na largura do celular`, await cel.pagina.evaluate(() => document.documentElement.scrollWidth) === 390);
}
await cel.pagina.click(".topo-menu");
await cel.pagina.waitForTimeout(450);             // o menu abre com uma transição curta
conferir("no celular o menu traz o link para o português", await cel.pagina.locator(".topo-nav .topo-lingua").isVisible() && (await cel.pagina.textContent(".topo-nav .topo-lingua")) === "Português");
conferir("sem erros de JavaScript no celular", cel.erros.length === 0, cel.erros.join(" | ").slice(0, 200));
await cel.navegador.close();
await fechar(navegador, erros);
