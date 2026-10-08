/* Comportamentos comuns a todas as páginas.
 * (A classe "js" já foi posta em <html> por um script no cabeçalho, antes de a página aparecer.) */

/* menu em telas estreitas */
const botaoMenu = document.querySelector(".topo-menu");
const menu = document.getElementById("menu");
if (botaoMenu && menu) {
  const fechar = () => {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
  };
  botaoMenu.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", String(aberto));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("aberto")) { fechar(); botaoMenu.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".topo")) fechar();
  });
}

/* pranchas: no toque e no teclado não há "passar o cursor", então alternam */
document.addEventListener("click", (e) => {
  const prancha = e.target.closest(".prancha");
  if (prancha) prancha.classList.toggle("revelada");
});
document.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.classList?.contains("prancha")) {
    e.preventDefault();
    e.target.classList.toggle("revelada");
  }
});

/* cada carta se desenha uma vez, quando boa parte dela entra na tela */
const cartas = document.querySelectorAll(".carta-caixa");
if (cartas.length) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    for (const c of cartas) c.classList.add("desenhada");
  } else {
    const olho = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("desenhada");
        olho.unobserve(e.target);
      }
    }, { threshold: 0.3 });
    for (const c of cartas) olho.observe(c);
  }
}

/* Ao abrir a página de uma espécie ou de um jogo, a miniatura clicada viaja até a figura grande.
 * O nome da transição só é dado na hora do clique, e só à miniatura clicada. */
document.addEventListener("click", (e) => {
  const ligacao = e.target.closest?.("a[href]");
  if (!ligacao) return;
  const destino = ligacao.getAttribute("href");
  if (destino.startsWith("/pokedex/")) {
    const arte = ligacao.querySelector(".dex-arte") || ligacao.querySelector('img[src^="/arte/mini/"]');
    if (arte) arte.style.viewTransitionName = "especie";
  } else if (destino.startsWith("/jogos/")) {
    const ilha = ligacao.querySelector("img.ilha");
    if (ilha) ilha.style.viewTransitionName = "ilha";
  }
});

/* Edição Cobblemon: cada Pokémon fica em tinta de mapa até alguém apontar para ele; aí entra o
 * modelo do jogo, em cor. As espécies cuja página já foi aberta ficam reveladas de vez, como o
 * trecho do mapa por onde se andou (quem guarda a visita é src/js/cobblemon-especie.js). */
if (document.body.classList.contains("edicao-cobblemon")) {
  const colorir = (slot, preguica = false) => {
    const tinta = slot.querySelector("img[data-cor]");
    if (!tinta || slot.querySelector(".cor")) return;
    const cor = new Image();
    cor.className = "cor";
    cor.alt = "";
    cor.decoding = "async";
    if (preguica) cor.loading = "lazy";
    cor.addEventListener("load", () => slot.classList.add("tem-cor"), { once: true });
    slot.append(cor);
    cor.src = tinta.dataset.cor;
  };
  const apontar = (e) => {
    const raiz = e.target.closest?.("a, .slot");
    if (!raiz) return;
    for (const slot of raiz.matches(".slot") ? [raiz] : raiz.querySelectorAll(".slot")) colorir(slot);
  };
  document.addEventListener("pointerover", apontar);
  document.addEventListener("focusin", apontar);

  let vistos = [];
  try { vistos = JSON.parse(localStorage.getItem("pokeatlas.cobblemon.vistos") || "[]").map(Number); } catch { /* sem armazenamento, nada fica revelado */ }
  if (vistos.length) {
    const conjunto = new Set(vistos);
    for (const slot of document.querySelectorAll(".slot[data-n]")) {
      if (!conjunto.has(Number(slot.dataset.n))) continue;
      slot.classList.add("visto");
      colorir(slot, true);
    }
  }
}

/* Busca global: o botão do cabeçalho e os atalhos "/" e Ctrl+K (ou ⌘K). O módulo da busca e o índice só são
 * baixados na primeira vez que alguém abre. */
const abrirBusca = () => import("./busca.js").then((m) => m.abrirBusca()).catch(() => { location.href = document.body.classList.contains("edicao-cobblemon") ? "/cobblemon/pokemon/" : "/pokedex/"; });
document.addEventListener("click", (e) => {
  if (!e.target.closest?.("[data-busca-abrir]")) return;
  menu?.classList.remove("aberto");                // no celular o botão fica dentro do menu: ele fecha antes de a busca abrir
  botaoMenu?.setAttribute("aria-expanded", "false");
  abrirBusca();
});
document.addEventListener("keydown", (e) => {
  const escrevendo = e.target.closest?.("input, textarea, select, [contenteditable]");
  if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !escrevendo && !e.ctrlKey && !e.metaKey && !e.altKey)) { e.preventDefault(); abrirBusca(); }
});
