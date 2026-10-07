/* Página de uma espécie: a gravura grande é feita aqui, a partir da arte em cor.
 * É o mesmo traço de scripts/arte.mjs: o tom escuro vira linha grossa, o claro
 * vira linha fina, o branco some; tons bem escuros ganham uma segunda trama
 * cruzada e o contorno fica cheio. */
import { colorirAoApontar } from "./gaveta.js";

const TINTA = [15, 42, 58];

function degrau(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function gravar(canvas, imagem) {
  const L = canvas.width;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, L, L);
  ctx.drawImage(imagem, 0, 0, L, L);
  const quadro = ctx.getImageData(0, 0, L, L), d = quadro.data;
  const passo = L / 98, angulo = (38 * Math.PI) / 180;      // a trama acompanha o tamanho da prancha
  const cx = Math.cos(angulo), sx = Math.sin(angulo);
  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      const i = (y * L + x) * 4;
      const alfa = d[i + 3] / 255;
      if (alfa === 0) continue;
      const luz = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
      const escuro = Math.min(1, Math.max(0, (1 - luz - 0.1) * 1.3));
      const t1 = ((x * cx + y * sx) / passo) % 1;
      const onda1 = Math.abs(2 * (t1 < 0 ? t1 + 1 : t1) - 1);
      let tinta = degrau(-0.16, 0.16, escuro * 0.92 - onda1);
      if (escuro > 0.5) {
        const t2 = ((x * -sx + y * cx) / passo) % 1;
        const onda2 = Math.abs(2 * (t2 < 0 ? t2 + 1 : t2) - 1);
        tinta = Math.max(tinta, degrau(-0.16, 0.16, (escuro - 0.5) * 1.5 - onda2));
      }
      tinta = Math.max(tinta, degrau(0.74, 0.9, escuro));
      d[i] = TINTA[0]; d[i + 1] = TINTA[1]; d[i + 2] = TINTA[2];
      d[i + 3] = Math.round(tinta * alfa * 255);
    }
  }
  ctx.putImageData(quadro, 0, 0);
}

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
