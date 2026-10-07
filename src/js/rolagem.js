/* Rolagem — o que as páginas de abertura fazem enquanto se rola.
 * Código próprio do PokéAtlas; a página declara o que quer com atributos:
 *
 *   data-entra="surgir"            aparece ao entrar na tela
 *   data-entra="palavras"          o texto se monta palavra por palavra (data-ritmo: duração total, em ms)
 *   data-entra="contar" data-ate   o número sobe de zero até data-ate
 *   data-cena data-telas="6"       seção que dura 6 telas de rolagem; o .palco dentro dela fica preso.
 *                                  A seção recebe --avanco, de 0 a 1.
 *   data-trilho                    dentro de uma cena: fileira que desliza de lado conforme o avanço
 *   data-fundo / data-tinta        cor de fundo e de texto da página enquanto a seção ocupa o meio da tela
 *   data-deriva="0.2"              o elemento anda um pouco contra a rolagem (paralaxe)
 *   data-segue="14"                o elemento acompanha o ponteiro, até 14 px
 *
 * Com movimento reduzido nada disso se mexe: as cenas viram seções comuns e tudo aparece pronto.
 */
const raiz = document.documentElement;
const PARADO = matchMedia("(prefers-reduced-motion: reduce)").matches;
raiz.classList.toggle("sem-movimento", PARADO);

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- o que entra na tela ---------- */

function separarPalavras(el) {
  const texto = el.textContent;
  el.setAttribute("aria-label", texto);
  el.textContent = "";
  const palavras = texto.trim().split(/\s+/);
  el.style.setProperty("--passo", `${Math.round((Number(el.dataset.ritmo) || 900) / palavras.length)}ms`);
  palavras.forEach((palavra, i) => {
    const caixa = document.createElement("span");
    caixa.className = "palavra";
    caixa.setAttribute("aria-hidden", "true");
    caixa.style.setProperty("--i", i);
    caixa.textContent = palavra;
    el.append(caixa, i < palavras.length - 1 ? " " : "");
  });
}

function subirNumero(el) {
  const alvo = Number(el.dataset.ate) || 0, duracao = 1500;
  let inicio = 0;
  (function quadro(agora) {
    inicio ||= agora;
    const t = limitar((agora - inicio) / duracao, 0, 1);
    el.textContent = Math.round(alvo * (1 - (1 - t) ** 3)).toLocaleString("pt-BR");
    if (t < 1) requestAnimationFrame(quadro);
  })(performance.now());
}

const entradas = [...document.querySelectorAll("[data-entra]")];
for (const el of entradas) if (el.dataset.entra === "palavras") separarPalavras(el);
if (PARADO) {
  for (const el of entradas) el.classList.add("entrou");
} else {
  const olho = new IntersectionObserver((vistos) => {
    for (const { isIntersecting, target } of vistos) {
      if (!isIntersecting) continue;
      olho.unobserve(target);
      target.classList.add("entrou");
      if (target.dataset.entra === "contar") subirNumero(target);
    }
  }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });
  for (const el of entradas) olho.observe(el);
}

/* ---------- fundo que acompanha a seção ---------- */

const comFundo = document.querySelectorAll("[data-fundo]");
if (comFundo.length) {
  raiz.classList.add("fundo-vivo");
  const meio = new IntersectionObserver((vistos) => {
    for (const { isIntersecting, target } of vistos) {
      if (!isIntersecting) continue;
      raiz.style.setProperty("--fundo-vivo", target.dataset.fundo);
      if (target.dataset.tinta) raiz.style.setProperty("--tinta-viva", target.dataset.tinta);
    }
  }, { rootMargin: "-45% 0px -45% 0px" });
  for (const secao of comFundo) meio.observe(secao);
}

/* ---------- cenas presas, deriva e ponteiro ---------- */

if (!PARADO) {
  const cenas = [...document.querySelectorAll("[data-cena]")].map((el) => {
    el.style.height = `${(Number(el.dataset.telas) || 3) * 100}vh`;
    return { el, trilho: el.querySelector("[data-trilho]") };
  });
  // a deriva guarda o próprio deslocamento para medir sempre a partir da posição natural do elemento
  const derivas = [...document.querySelectorAll("[data-deriva]")]
    .filter((el) => !el.closest("[data-cena]"))
    .map((el) => ({ el, forca: Number(el.dataset.deriva) || 0.2, y: 0 }));

  function medir() {
    const tela = window.innerHeight;
    for (const { el, trilho } of cenas) {
      const sobra = el.offsetHeight - tela;
      if (sobra <= 0) continue;
      const avanco = limitar(-el.getBoundingClientRect().top / sobra, 0, 1);
      el.style.setProperty("--avanco", avanco.toFixed(4));
      if (trilho) {
        const folga = trilho.scrollWidth - trilho.clientWidth;
        if (folga > 0) trilho.style.transform = `translate3d(${(-avanco * folga).toFixed(1)}px, 0, 0)`;
      }
    }
    for (const d of derivas) {
      const caixa = d.el.getBoundingClientRect();
      if (caixa.bottom - d.y < -tela || caixa.top - d.y > tela * 2) continue;       // longe da tela: não mexe
      d.y = (caixa.top - d.y + caixa.height / 2 - tela / 2) * -d.forca;
      d.el.style.transform = `translate3d(0, ${d.y.toFixed(1)}px, 0)`;
    }
  }

  let pedido = false;
  const pedir = () => {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(() => { pedido = false; medir(); });
  };
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  medir();

  const seguidores = [...document.querySelectorAll("[data-segue]")];
  if (seguidores.length && matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1, y = (e.clientY / window.innerHeight) * 2 - 1;
      for (const el of seguidores) {
        const alcance = Number(el.dataset.segue) || 10;
        el.style.transform = `translate(${(x * alcance).toFixed(1)}px, ${(y * alcance).toFixed(1)}px)`;
      }
    }, { passive: true });
  }
}

raiz.classList.add("rolagem-pronta");
