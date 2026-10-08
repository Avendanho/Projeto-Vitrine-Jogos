/* Página de uma espécie: a gravura grande é feita aqui, a partir da arte em cor (src/js/gravura.js). */
import { colorirAoApontar } from "./gaveta.js";
import { gravar } from "./gravura.js";

/* A prancha principal e a de cada forma especial: cada uma é gravada quando a arte em cor termina de carregar. */
for (const arte of document.querySelectorAll(".especie .prancha-arte")) {
  const canvas = arte.querySelector("canvas"), cor = arte.querySelector(".prancha-cor");
  if (!canvas || !cor) continue;
  const pronto = () => { gravar(canvas, cor); arte.classList.add("gravada"); };
  if (cor.complete && cor.naturalWidth) pronto();
  else cor.addEventListener("load", pronto, { once: true });
}

const evolucao = document.querySelector(".evolucao");
if (evolucao) colorirAoApontar(evolucao);

/* a prancha grande se inclina para o ponteiro, e a cor vai um pouco à frente do traço */
const prancha = document.querySelector(".especie-prancha");
if (prancha && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  prancha.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const r = prancha.getBoundingClientRect();
    prancha.style.setProperty("--ix", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    prancha.style.setProperty("--iy", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });
  prancha.addEventListener("pointerleave", () => { prancha.style.removeProperty("--ix"); prancha.style.removeProperty("--iy"); });
}
