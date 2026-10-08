/* Som: o painel liga e desliga, guarda a escolha e os volumes, a música toca de verdade e o grito de uma espécie carrega e toca. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";

/* Conta o que a página pede ao áudio do navegador, para dar para conferir sem ouvir. */
const escuta = () => {
  window.__som = { contextos: [], notas: 0, tocados: [] };
  const Original = window.AudioContext;
  window.AudioContext = class extends Original {
    constructor(...a) { super(...a); window.__som.contextos.push(this); }
    createOscillator() { window.__som.notas++; return super.createOscillator(); }
  };
  const tocar = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { window.__som.tocados.push(this.src); return tocar.call(this); };
};
const estado = (pagina) => pagina.evaluate(() => ({ html: document.documentElement.dataset.som, botao: document.querySelector(".topo-som")?.dataset.ligado, guardado: (() => { try { return localStorage.getItem("pokeatlas.som"); } catch { return "bloqueado"; } })(), contexto: window.__som.contextos[0]?.state ?? "nenhum", notas: window.__som.notas }));

/* Abre o painel pelo botão do alto, aperta a chave e fecha com Esc. */
const chavear = async (pagina, botao = ".topo-som") => { await pagina.click(botao); await pagina.click("[data-som-chave]"); await pagina.keyboard.press("Escape"); };

const { navegador, pagina, erros } = await abrir();
await pagina.addInitScript(escuta);
await pagina.goto(`${BASE}/`, { waitUntil: "networkidle" });
let e = await estado(pagina);
conferir("o atlas abre em silêncio, sem criar áudio", e.html === "desligado" && e.botao === "false" && e.contexto === "nenhum", JSON.stringify(e));
await pagina.click(".abertura-teclas button:nth-child(2)");
conferir("com o som desligado, as teclas não fazem barulho", (await estado(pagina)).notas === 0);
await pagina.click(".topo-som");
conferir("o botão do alto abre o painel de som, com a chave e dois volumes", await pagina.locator(".som-painel[open]").isVisible() && (await pagina.textContent("[data-som-chave]")) === "Ligar o som" && await pagina.locator(".som-painel [data-volume]").count() === 2);
await pagina.click("[data-som-chave]");
conferir("a chave passa a oferecer o contrário", (await pagina.textContent("[data-som-chave]")) === "Desligar o som");
await pagina.keyboard.press("Escape");
conferir("Esc fecha o painel e devolve o foco ao botão", await pagina.locator(".som-painel").isHidden() && await pagina.evaluate(() => document.activeElement?.classList.contains("topo-som")));
await pagina.waitForTimeout(1600);
e = await estado(pagina);
conferir("a chave liga o som e guarda a escolha", e.html === "ligado" && e.botao === "true" && e.guardado === "1", JSON.stringify(e));
conferir("a música está tocando", e.contexto === "running" && e.notas > 8, JSON.stringify(e));
const antes = e.notas;
await pagina.waitForTimeout(1500);
conferir("e continua, nota após nota", (await estado(pagina)).notas > antes);

// a escolha vale na página seguinte, e o grito de uma espécie carrega e toca
const gritos = [];
pagina.on("response", (r) => { if (r.url().includes("/gritos/")) gritos.push([r.status(), r.headers()["content-type"]]); });
await pagina.goto(`${BASE}/pokedex/charizard/`, { waitUntil: "networkidle" });
conferir("na página seguinte o som continua ligado", (await estado(pagina)).botao === "true");
await pagina.click("[data-grito]");
await pagina.waitForFunction(() => window.__som.tocados.length === 1 && !document.querySelector("[data-grito]").classList.contains("tocando"), null, { timeout: 8000 }).catch(() => {});
conferir("o grito do Charizard é pedido e toca até o fim", (await pagina.evaluate(() => window.__som.tocados[0] || "")).endsWith("/gritos/6.ogg") && gritos[0]?.[0] === 200 && (await pagina.textContent("[data-grito-aviso]")) === "", JSON.stringify(gritos));
conferir("o arquivo chega como áudio", /audio\/ogg/.test(gritos[0]?.[1] || ""), gritos[0]?.[1]);
// o volume da música vai a zero e fica guardado
await pagina.click(".topo-som");
await pagina.locator('[data-volume="musica"]').fill("0");
await pagina.keyboard.press("Escape");
conferir("o volume escolhido fica guardado", JSON.parse(await pagina.evaluate(() => localStorage.getItem("pokeatlas.som.volumes"))).musica === 0);
await pagina.reload({ waitUntil: "networkidle" });
await pagina.click(".topo-som");
conferir("e volta no painel depois de recarregar", await pagina.inputValue('[data-volume="musica"]') === "0" && await pagina.inputValue('[data-volume="teclas"]') === "80");
await pagina.locator('[data-volume="musica"]').fill("80");
await pagina.click("[data-som-chave]");
await pagina.keyboard.press("Escape");
e = await estado(pagina);
conferir("a chave desliga e guarda", e.html === "desligado" && e.botao === "false" && e.guardado === "0", JSON.stringify(e));
const jaTocados = await pagina.evaluate(() => window.__som.tocados.length);
await pagina.click("[data-grito]");
await pagina.waitForTimeout(400);
conferir("com o som desligado, o grito ainda toca quando pedido", await pagina.evaluate(() => window.__som.tocados.length) === jaTocados + 1);

// edição Cobblemon: mesmo botão, mesma escolha
await pagina.goto(`${BASE}/cobblemon/pokemon/wooper/`, { waitUntil: "networkidle" });
conferir("o Cobblemon tem o botão de som e o grito da espécie", await pagina.locator(".topo-som").isVisible() && (await pagina.getAttribute("[data-grito]", "data-grito")) === "/gritos/194.ogg");
await chavear(pagina);
await pagina.waitForTimeout(900);
e = await estado(pagina);
conferir("e a música dele toca", e.botao === "true" && e.contexto === "running" && e.notas > 1, JSON.stringify(e));
await chavear(pagina);

// celular: o botão fica dentro do menu; sem armazenamento, liga do mesmo jeito
const cel = await abrir({ celular: true, semArmazenamento: true });
await cel.pagina.addInitScript(escuta);
await cel.pagina.goto(`${BASE}/`, { waitUntil: "networkidle" });
conferir("no celular o botão redondo some do alto", await cel.pagina.locator(".topo-som").isHidden());
await cel.pagina.click(".topo-menu");
await chavear(cel.pagina, ".topo-nav-som");
await cel.pagina.waitForTimeout(700);
conferir("o botão do menu abre o painel, e a chave liga o som mesmo sem armazenamento", (await cel.pagina.getAttribute(".topo-nav-som", "data-ligado")) === "true" && await cel.pagina.evaluate(() => window.__som.contextos[0]?.state) === "running");
conferir("a página não passa da largura da tela", await cel.pagina.evaluate(() => document.documentElement.scrollWidth) === 390);
conferir("sem erros de JavaScript no celular", cel.erros.length === 0, cel.erros.join(" | ").slice(0, 200));
await cel.navegador.close();
await fechar(navegador, erros);
