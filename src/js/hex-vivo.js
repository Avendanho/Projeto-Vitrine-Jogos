/* Um ou mais perfis desenhados ao vivo num canvas quadrado: o hexágono de atributos que se estica até as
 * notas novas em vez de pular para elas. É o que a página de jogo, a comparação, a bússola e a abertura usam. */
import { vertices, NOTA_MAXIMA, TEMAS } from "./hexagono.js";

export const REDUZIDO = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* opções:
 *   tema     "tela" (sobre a tela clara) ou "noite" (sobre a tela apagada)
 *   grade    desenha o hexágono de fundo, com os anéis de cada nota e os raios
 *   pulso    o perfil respira devagar, como um aparelho ligado
 * Cada camada: { valores, cor?, tracejado? }. Sem "cor", a camada sai em amarelo com contorno escuro;
 * com "cor", sai vazada na cor dada, para sobrepor (as séries da comparação). */
export function hexVivo(canvas, opc = {}) {
  const { tema: nomeDoTema = "tela", grade = true, pulso = false } = opc;
  const tema = TEMAS[nomeDoTema], ctx = canvas.getContext("2d"), inicio = performance.now();
  let camadas = [], lado = 0, visivel = false, quadro = 0, sujo = true;

  function medir() {
    const novo = Math.round(canvas.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2));
    if (novo && novo !== lado) { lado = canvas.width = canvas.height = novo; sujo = true; }
  }
  const tracar = (pontos) => { ctx.beginPath(); pontos.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };

  function pintar(tempo) {
    if (!lado) return;
    const c = lado / 2, raio = lado * 0.44, fino = lado / 320;
    ctx.clearRect(0, 0, lado, lado);
    ctx.lineJoin = "round";
    if (grade) {
      const cheio = vertices(Array(6).fill(NOTA_MAXIMA), raio, c, c);
      tracar(cheio); ctx.fillStyle = tema.fundo; ctx.fill();
      ctx.strokeStyle = tema.grade; ctx.lineWidth = fino;
      for (let n = 1; n < NOTA_MAXIMA; n++) { tracar(vertices(Array(6).fill(n), raio, c, c)); ctx.stroke(); }
      for (const [x, y] of cheio) { ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(x, y); ctx.stroke(); }
      tracar(cheio); ctx.lineWidth = fino * 2; ctx.stroke();
    }
    for (const camada of camadas) {
      const sopro = pulso && !REDUZIDO && !camada.cor ? 1 + Math.sin(tempo * 1.6) * 0.012 : 1;
      const pontos = vertices(camada.atual, raio * sopro, c, c);
      tracar(pontos);
      ctx.setLineDash((camada.tracejado || []).map((v) => v * fino * 1.6));
      if (camada.cor) {
        ctx.globalAlpha = 0.2; ctx.fillStyle = camada.cor; ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = camada.cor; ctx.lineWidth = lado / 110; ctx.stroke();
      } else {
        ctx.globalAlpha = 0.93; ctx.fillStyle = tema.forma; ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = tema.contorno; ctx.lineWidth = lado / 96; ctx.stroke();
        ctx.fillStyle = tema.ponto;
        for (const [x, y] of pontos) { ctx.beginPath(); ctx.arc(x, y, lado / 68, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.setLineDash([]);
    }
  }

  function laco(agora) {
    quadro = 0;
    if (!visivel) return;
    let mexeu = false;
    for (const c of camadas) {
      for (let i = 0; i < 6; i++) {
        const d = c.alvo[i] - c.atual[i];
        if (Math.abs(d) > 0.004) { c.atual[i] += d * 0.1; mexeu = true; } else c.atual[i] = c.alvo[i];
      }
    }
    const animado = pulso && !REDUZIDO;
    if (mexeu || animado || sujo) { pintar((agora - inicio) / 1000); sujo = false; }
    if (mexeu || animado) quadro = requestAnimationFrame(laco);
  }
  const pedir = () => { if (!quadro && visivel) quadro = requestAnimationFrame(laco); };

  new ResizeObserver(() => { medir(); pedir(); }).observe(canvas);
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; pedir(); }).observe(canvas);
  medir();

  return {
    /* Troca os perfis desenhados. Cada um se estica do que estava para o que chega. */
    definir(novas) {
      camadas = novas.map((n, i) => {
        const antiga = camadas[i], alvo = n.valores.slice();
        return { ...n, alvo, atual: antiga && !REDUZIDO ? antiga.atual : alvo.slice() };
      });
      sujo = true;
      pedir();
    }
  };
}
