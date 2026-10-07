/* Página de uma espécie do Cobblemon. O retrato chega em tinta de mapa e a cor do modelo
 * entra bloco a bloco, do centro para fora, como os chunks carregando em volta do jogador.
 * Depois ele acompanha o ponteiro e pula com um clique. A visita fica guardada no navegador:
 * nas listas, as espécies já abertas aparecem reveladas (src/js/base.js). */
const CHAVE = "pokeatlas.cobblemon.vistos";
const figura = document.querySelector("[data-retrato]");

if (figura) {
  try {
    const vistos = new Set(JSON.parse(localStorage.getItem(CHAVE) || "[]").map(Number));
    vistos.add(Number(figura.dataset.retrato));
    localStorage.setItem(CHAVE, JSON.stringify([...vistos]));
  } catch { /* sem armazenamento, a página funciona igual */ }

  const modelo = figura.querySelector(".cb-modelo"), tela = figura.querySelector(".cb-revela");
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pronta = (imagem) => imagem.complete && imagem.naturalWidth ? Promise.resolve() : new Promise((certo, erro) => {
    imagem.addEventListener("load", certo, { once: true });
    imagem.addEventListener("error", erro, { once: true });
  });

  function revelar(tinta) {
    const L = tela.width, BLOCOS = 10, T = L / BLOCOS, escala = modelo.naturalWidth / L;
    const ctx = tela.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tinta, 0, 0, L, L);
    figura.classList.add("revelando");
    // a ordem dos chunks: anéis a partir do centro, com um pouco de acaso dentro de cada anel
    const meio = (BLOCOS - 1) / 2, blocos = [];
    for (let y = 0; y < BLOCOS; y++) for (let x = 0; x < BLOCOS; x++) blocos.push([x, y, Math.max(Math.abs(x - meio), Math.abs(y - meio)) + Math.random() * 1.2]);
    blocos.sort((a, b) => a[2] - b[2]);
    const porVez = Math.ceil(blocos.length / 13);
    let i = 0;
    const passo = () => {
      ctx.imageSmoothingEnabled = true;
      for (let k = 0; k < porVez && i < blocos.length; k++, i++) {
        const [x, y] = blocos[i];
        ctx.clearRect(x * T, y * T, T, T);
        ctx.drawImage(modelo, x * T * escala, y * T * escala, T * escala, T * escala, x * T, y * T, T, T);
      }
      if (i < blocos.length) setTimeout(passo, 62);
      else figura.classList.add("revelado");
    };
    setTimeout(passo, 320);
  }

  if (calmo || !tela?.getContext) figura.classList.add("revelado");
  else {
    const tinta = new Image();
    tinta.src = tela.dataset.tinta;
    Promise.all([pronta(modelo), pronta(tinta)]).then(() => revelar(tinta)).catch(() => figura.classList.add("revelado"));
  }

  if (!calmo) {
    figura.addEventListener("pointermove", (e) => {
      const r = figura.getBoundingClientRect();
      figura.style.setProperty("--ix", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      figura.style.setProperty("--iy", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    figura.addEventListener("pointerleave", () => { figura.style.removeProperty("--ix"); figura.style.removeProperty("--iy"); });
    figura.addEventListener("click", () => {
      figura.classList.remove("pulando");
      void figura.offsetWidth;                    // recomeça a animação se o clique vier no meio de um pulo
      figura.classList.add("pulando");
    });
    figura.addEventListener("animationend", (e) => { if (e.animationName === "cb-pulo") figura.classList.remove("pulando"); });
  }
}
