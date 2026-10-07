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
