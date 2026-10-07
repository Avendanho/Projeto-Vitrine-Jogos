/* O que as gavetas de espécies têm em comum, na Pokédex geral, na de cada jogo e na linha evolutiva. */

export const semAcento = (t) => t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

/* A arte em cor só é pedida quando alguém aponta para a espécie (ou chega nela pelo teclado). */
export function colorirAoApontar(raiz) {
  function colorir(evento) {
    const arte = evento.target.closest?.("a")?.querySelector(".dex-arte");
    if (!arte || arte.querySelector(".cor")) return;
    const cor = new Image();
    cor.className = "cor";
    cor.alt = "";
    cor.src = arte.querySelector("img").dataset.cor;
    arte.append(cor);
  }
  raiz.addEventListener("pointerover", colorir);
  raiz.addEventListener("focusin", colorir);
}
