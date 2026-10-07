/* Comportamentos comuns a todas as páginas. */
const raiz = document.documentElement;
raiz.classList.add("js");

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
