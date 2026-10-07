/* Uma ou mais ilhas desenhadas ao vivo num canvas quadrado. */
import { criarMalha, calcular, desenhar, TINTAS, MUNDO } from "./relevo.js";

export const REDUZIDO = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* opções:
 *   g        nós por lado da malha
 *   mar      desenha as curvas do mar em volta (só com uma camada em cores de altitude)
 *   mare     o relevo ondula devagar com o tempo
 *   emergir  a ilha sobe do mar ao aparecer
 * Cada camada: { valores, semente, cor?, tracejado?, preenchimento? }.
 * Sem "cor", a camada sai nas cores de altitude; com "cor", em uma tinta só. */
export function ilhaViva(canvas, opc = {}) {
  const { g = 84, mar = true, mare = true, emergir = true } = opc;
  const ctx = canvas.getContext("2d");
  // dois nós de sobra de cada lado: a borda da malha, forçada ao fundo, fica fora do quadro
  const SOBRA = 2;
  const alcance = (MUNDO * (g - 1)) / (g - 1 - 2 * SOBRA);
  const malha = criarMalha(g, g, -alcance, alcance, -alcance, alcance);
  const inicio = performance.now();
  let camadas = [];
  let lado = 0, visivel = false, quadro = 0, sujo = true;
  let emersao = emergir && !REDUZIDO ? 0 : 1;

  function medir() {
    const largura = canvas.getBoundingClientRect().width;
    const novo = Math.round(largura * Math.min(window.devicePixelRatio || 1, 2));
    if (novo && novo !== lado) {
      lado = novo;
      canvas.width = canvas.height = lado;
      sujo = true;
    }
  }

  function pintar(tempo) {
    if (!lado) return;
    ctx.clearRect(0, 0, lado, lado);
    const celula = lado / (g - 1 - 2 * SOBRA);
    const t = { ox: -SOBRA * celula, oy: -SOBRA * celula, sx: celula, sy: celula };
    const traco = lado / 560;
    const e = emersao * emersao * (3 - 2 * emersao);
    for (const c of camadas) {
      calcular(malha, c.atual, { semente: c.semente, emersao: e, tempo: mare && !REDUZIDO ? tempo : 0 });
      if (c.cor) {
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        ctx.setLineDash((c.tracejado || []).map((v) => v * traco));
        desenhar(ctx, malha, t, TINTAS.dia, { mar: false, traco: traco * 1.5, contorno: c.cor, preenchimento: c.preenchimento });
        ctx.restore();
      } else {
        desenhar(ctx, malha, t, TINTAS.dia, { mar, traco });
      }
    }
  }

  function laco(agora) {
    quadro = 0;
    if (!visivel) return;
    let mexeu = false;
    for (const c of camadas) {
      for (let i = 0; i < 6; i++) {
        const d = c.alvo[i] - c.atual[i];
        if (Math.abs(d) > 0.004) { c.atual[i] += d * 0.085; mexeu = true; } else c.atual[i] = c.alvo[i];
      }
    }
    if (emersao < 1) { emersao = Math.min(1, emersao + 0.016); mexeu = true; }
    const animado = mare && !REDUZIDO;
    if (mexeu || animado || sujo) { pintar((agora - inicio) / 1000); sujo = false; }
    if (mexeu || animado) quadro = requestAnimationFrame(laco);
  }

  function pedir() {
    if (!quadro && visivel) quadro = requestAnimationFrame(laco);
  }

  new ResizeObserver(() => { medir(); pedir(); }).observe(canvas);
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; pedir(); }).observe(canvas);
  medir();

  return {
    definir(novas) {
      camadas = novas.map((n, i) => {
        const antiga = camadas[i];
        const alvo = n.valores.slice();
        const atual = antiga && !REDUZIDO ? antiga.atual : alvo.slice();
        return { ...n, alvo, atual };
      });
      sujo = true;
      pedir();
    }
  };
}
