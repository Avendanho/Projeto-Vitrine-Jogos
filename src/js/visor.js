/* O visor 3D do atlas: gira, aproxima, desloca e abre em tela cheia o que um "desenhista" souber desenhar.
 * Serve às maquetes de blocos (src/js/maquete.js) e aos modelos de Pokémon (src/js/modelo3d.js).
 *
 * Quem usa chama acordar(figura, preparar): `preparar` baixa o que for preciso e devolve
 *   { fabricar(tela, semWebgl) -> { desenhar(guinada, inclina, zoom, dx, dy), soltar() } ou null, opcoes }.
 * O visor tenta primeiro com WebGL e, se o navegador não entregar (aceleração de vídeo desligada ou placa
 * bloqueada, comum no Chrome em Linux) ou tirar o contexto no meio, pede de novo um desenhista de software.
 *
 * Arrastar gira; as setas do teclado também. Para aproximar: a roda do mouse (depois de clicar no modelo,
 * para a página continuar rolando normalmente), os botões + e −, a pinça no toque ou as teclas + e −.
 * Com Shift, ou com o botão direito, o arrasto desloca. Dois cliques voltam ao começo.
 * Só um modelo fica vivo por vez na página. */

const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
let viva = null;

function ligar(figura, fabricar, opcoes, semWebgl = false) {
  const { guinada: GUINADA = -0.66, inclina: INCLINA = 0.47, inclinaMin = 0.04, inclinaMax = 1.45, sentido = 1 } = opcoes;
  let tela = document.createElement("canvas"), fechada = false;
  let desenhista = semWebgl ? null : fabricar(tela, false);
  if (!desenhista) { tela = document.createElement("canvas"); desenhista = fabricar(tela, true); }
  if (!desenhista) return null;
  let guinada = GUINADA, inclina = INCLINA, sozinha = !calmo, quadro = 0, antes = 0, visivel = true;
  let zoom = 1, dx = 0, dy = 0;                       // dx e dy em metades de tela: 1 leva o centro até a borda

  function passo(agora) {
    quadro = 0;
    if (sozinha && visivel) {
      guinada += Math.min(0.05, (agora - (antes || agora)) / 1000) * 0.32 * sentido;
      antes = agora;
      quadro = requestAnimationFrame(passo);
    }
    const inicio = performance.now();
    desenhista.desenhar(guinada, inclina, zoom, dx, dy);
    if (performance.now() - inicio > 70) sozinha = false;       // maquete pesada demais para girar sozinha: fica só o arrasto
  }
  const pedir = () => { if (!quadro) quadro = requestAnimationFrame(passo); };

  /* aproxima ou afasta mantendo parado o ponto (cx, cy) da tela, de -1 a 1 */
  const aproximar = (fator, cx = 0, cy = 0) => {
    const novo = Math.min(16, Math.max(1, zoom * fator)), f = novo / zoom;
    dx = cx - (cx - dx) * f;
    dy = cy - (cy - dy) * f;
    zoom = novo;
    if (zoom === 1) dx = dy = 0;
    sozinha = false;
    pedir();
  };
  const voltar = () => { zoom = 1; dx = dy = 0; guinada = GUINADA; inclina = INCLINA; pedir(); };
  const naTela = (x, y) => { const r = tela.getBoundingClientRect(); return [((x - r.left) / r.width) * 2 - 1, 1 - ((y - r.top) / r.height) * 2]; };
  const deslocar = (px, py) => { const r = tela.getBoundingClientRect(); dx += (px / r.width) * 2; dy -= (py / r.height) * 2; };

  const dedos = new Map();
  tela.addEventListener("pointerdown", (e) => {
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    sozinha = false;
    tela.setPointerCapture(e.pointerId);
    tela.focus({ preventScroll: true });
    figura.classList.add("girando");
  });
  tela.addEventListener("pointermove", (e) => {
    const antes = dedos.get(e.pointerId);
    if (!antes) return;
    const agora = { x: e.clientX, y: e.clientY };
    if (dedos.size === 1) {
      if (e.shiftKey || e.buttons === 2 || e.buttons === 4) deslocar(agora.x - antes.x, agora.y - antes.y);
      else {
        guinada += (agora.x - antes.x) * 0.011 * sentido;
        inclina = Math.min(inclinaMax, Math.max(inclinaMin, inclina + (agora.y - antes.y) * 0.008));
      }
    } else {                                         // dois dedos: a distância entre eles aproxima, o meio deles desloca
      const outro = [...dedos].find(([id]) => id !== e.pointerId)[1];
      const d0 = Math.hypot(antes.x - outro.x, antes.y - outro.y), d1 = Math.hypot(agora.x - outro.x, agora.y - outro.y);
      if (d0 > 4) aproximar(d1 / d0, ...naTela((agora.x + outro.x) / 2, (agora.y + outro.y) / 2));
      deslocar((agora.x - antes.x) / 2, (agora.y - antes.y) / 2);
    }
    dedos.set(e.pointerId, agora);
    pedir();
  });
  const soltar = (e) => { dedos.delete(e.pointerId); if (!dedos.size) figura.classList.remove("girando"); };
  tela.addEventListener("pointerup", soltar);
  tela.addEventListener("pointercancel", soltar);
  tela.addEventListener("pointerleave", () => { if (!dedos.size) tela.blur(); });
  tela.addEventListener("contextmenu", (e) => e.preventDefault());
  tela.addEventListener("dblclick", voltar);
  // a roda só aproxima depois de um clique na maquete (ou com Ctrl); fora disso, a página rola como sempre
  tela.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && document.activeElement !== tela) return;
    e.preventDefault();
    aproximar(Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0022)), ...naTela(e.clientX, e.clientY));
  }, { passive: false });
  tela.addEventListener("keydown", (e) => {
    if (e.key === "+" || e.key === "=") { e.preventDefault(); return aproximar(1.3); }
    if (e.key === "-" || e.key === "_") { e.preventDefault(); return aproximar(1 / 1.3); }
    if (e.key === "0") { e.preventDefault(); return voltar(); }
    const passos = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, 0.12], ArrowDown: [0, -0.12] }[e.key];
    if (!passos) return;
    e.preventDefault();
    sozinha = false;
    guinada += passos[0] * sentido;
    inclina = Math.min(inclinaMax, Math.max(inclinaMin, inclina + passos[1]));
    pedir();
  });
  /* os botões: aproximar, afastar e tela cheia */
  const barra = document.createElement("div");
  barra.className = "maquete-barra";
  barra.innerHTML = `<button type="button" data-zoom="1.5" aria-label="Aproximar">+</button><button type="button" data-zoom="0.667" aria-label="Afastar">−</button>${figura.requestFullscreen ? '<button type="button" data-cheia>Tela cheia</button>' : ""}`;
  barra.addEventListener("click", (e) => {
    const botao = e.target.closest("button");
    if (!botao) return;
    if (botao.dataset.zoom) aproximar(Number(botao.dataset.zoom));
    else if (document.fullscreenElement === figura) document.exitFullscreen();
    else figura.requestFullscreen().catch(() => {});
  });
  const aoMudarDeTela = () => {
    const cheia = document.fullscreenElement === figura, botao = barra.querySelector("[data-cheia]");
    if (botao) botao.textContent = cheia ? "Sair da tela cheia" : "Tela cheia";
    requestAnimationFrame(pedir);
  };
  figura.addEventListener("fullscreenchange", aoMudarDeTela);
  figura.append(barra);
  const olho = "IntersectionObserver" in window ? new IntersectionObserver(([e]) => { visivel = e.isIntersecting; antes = 0; if (visivel) pedir(); }) : null;
  olho?.observe(tela);
  addEventListener("resize", pedir);

  tela.className = "maquete-tela";
  tela.tabIndex = 0;
  tela.setAttribute("role", "img");
  tela.setAttribute("aria-label", `${figura.querySelector("img")?.alt || "Maquete"}. Arraste ou use as setas para girar; + e − aproximam.`);
  figura.append(tela);
  figura.classList.add("viva");
  pedir();
  const fechar = () => {
    fechada = true;
    cancelAnimationFrame(quadro);
    olho?.disconnect();
    removeEventListener("resize", pedir);
    desenhista.soltar();
    figura.removeEventListener("fullscreenchange", aoMudarDeTela);
    if (document.fullscreenElement === figura) document.exitFullscreen();
    barra.remove();
    tela.remove();
    figura.classList.remove("viva", "girando");
  };
  // se o navegador tirar o WebGL no meio do caminho, a maquete continua no desenhista de software
  tela.addEventListener("webglcontextlost", () => {
    if (fechada || viva?.figura !== figura) return;
    fechar();
    const desligar = ligar(figura, fabricar, opcoes, true);
    viva = desligar ? { figura, desligar } : null;
    if (!desligar) figura.dataset.estado = "falhou";
  });
  fechar.pedir = pedir;                              // para quem troca algo no desenhista (a textura shiny) e precisa de um quadro novo
  return fechar;
}


/* Liga o visor numa figura, desligando o que estiver vivo. Devolve a função que o desliga (com .pedir para
 * redesenhar) ou null se não deu. O estado fica em figura.dataset.estado: carregando, viva, parada ou falhou. */
export async function acordar(figura, preparar, focar = false) {
  if (viva?.figura === figura) return viva.desligar;
  if (figura.dataset.estado === "falhou" || figura.dataset.estado === "carregando") return null;
  const botao = figura.querySelector(".maquete-girar"), dica = figura.querySelector(".maquete-dica");
  figura.dataset.estado = "carregando";
  if (botao) { botao.dataset.texto ??= botao.textContent; botao.textContent = "Carregando…"; }
  try {
    const { fabricar, opcoes = {} } = await preparar();
    if (viva?.figura === figura) return viva.desligar;
    if (viva) { viva.desligar(); viva.figura.dataset.estado = "parada"; }
    viva = null;
    const desligar = ligar(figura, fabricar, opcoes);
    if (!desligar) throw new Error("sem canvas");
    viva = { figura, desligar };
    figura.dataset.estado = "viva";
    if (focar) figura.querySelector(".maquete-tela")?.focus({ preventScroll: true });
    return desligar;
  } catch (erro) {
    figura.dataset.estado = "falhou";               // a imagem parada continua valendo, e a página diz o que houve
    if (dica) dica.textContent = erro?.message === "sem canvas" ? "Este navegador não desenha o modelo 3D" : "Não deu para baixar o modelo. Recarregue a página";
    return null;
  } finally {
    if (botao) botao.textContent = botao.dataset.texto;
  }
}
export const estaViva = (figura) => viva?.figura === figura;
