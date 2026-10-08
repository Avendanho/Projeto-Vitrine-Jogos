/* Bússola: cada resposta puxa um vértice do perfil do visitante; no fim, os três jogos
 * do catálogo com o perfil mais parecido, e o porquê de cada um. */
import { EIXOS as EIXOS_BASE, encaixe } from "./hexagono.js";
import { hexVivo } from "./hex-vivo.js";
import { textosDaPagina } from "./bussola-textos.js";
import { rota } from "./lingua.js";

/* A página existe em português e em inglês: os textos e os dados vêm na língua dela. */
const T = textosDaPagina();
const { JOGOS, PEDIDOS, PERGUNTAS, NOMES_DOS_EIXOS } = await import(T.dados);
const EIXOS = EIXOS_BASE.map((e) => ({ ...e, nome: NOMES_DOS_EIXOS[e.id] }));

const secao = document.querySelector(".bussola");
const passo = secao.querySelector("[data-passo]");
const quadro = secao.querySelector("[data-pergunta]");
const voltar = secao.querySelector("[data-voltar]");
const legenda = secao.querySelector("[data-legenda]");
const caixa = secao.querySelector(".hex-vivo");
const direcoes = [...caixa.querySelectorAll(".hex-eixo")];
const resultado = document.querySelector("[data-resultado]");
const meuPerfil = hexVivo(caixa.querySelector("canvas"), { pulso: true });
caixa.classList.add("vivo");

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const lista = (itens) => itens.length <= 1 ? itens.join("") : `${itens.slice(0, -1).join(", ")} ${T.e} ${itens[itens.length - 1]}`;

/* teto de cada eixo: a soma da melhor opção de cada pergunta */
const TETO = EIXOS.map((e) => PERGUNTAS.reduce((soma, p) => soma + Math.max(0, ...p.opcoes.map((o) => o.pesos?.[e.id] || 0)), 0));

let respostas = [];
let atual = 0;

function perfil(ate = respostas.length) {
  return EIXOS.map((e, i) => {
    let soma = 0;
    for (let q = 0; q < ate; q++) soma += PERGUNTAS[q].opcoes[respostas[q]]?.pesos?.[e.id] || 0;
    return (5 * soma) / TETO[i];
  });
}

function mostrarPerfil() {
  meuPerfil.definir([{ valores: perfil() }]);
}

function mostrarPergunta(foco = true) {
  const p = PERGUNTAS[atual];
  passo.textContent = T.passo(atual + 1, PERGUNTAS.length);
  voltar.hidden = atual === 0;
  quadro.innerHTML = `<h2 tabindex="-1">${esc(p.pergunta)}</h2>
    <div class="opcoes">${p.opcoes.map((o, i) => `<button type="button" class="opcao" data-opcao="${i}" aria-pressed="${respostas[atual] === i}">${esc(o.texto)}</button>`).join("")}</div>`;
  quadro.classList.remove("saindo");
  quadro.classList.add("entrando");
  if (foco) quadro.querySelector("h2").focus({ preventScroll: true });
}

function responder(indice) {
  const antes = perfil(atual);
  respostas[atual] = indice;
  respostas.length = atual + 1;
  const depois = perfil();
  mostrarPerfil();

  const subiram = EIXOS.filter((_, i) => depois[i] - antes[i] > 0.01);
  for (const d of direcoes) d.classList.toggle("ativo", subiram.some((e) => e.id === d.dataset.eixo));
  legenda.textContent = PERGUNTAS[atual].filtro
    ? T.filtro
    : subiram.length ? T.esticou(lista(subiram.map((e) => e.nome.toLowerCase()))) : T.nada;

  quadro.classList.remove("entrando");
  quadro.classList.add("saindo");
  setTimeout(() => {
    if (atual + 1 < PERGUNTAS.length) { atual++; mostrarPergunta(); }
    else concluir(true);
  }, 240);
}

/* ---------- resultado ---------- */

function candidatos() {
  let restantes = JOGOS;
  PERGUNTAS.forEach((p, q) => {
    const o = p.opcoes[respostas[q]];
    if (p.filtro === "plataforma" && o.plataformas) restantes = restantes.filter((j) => j.plataformas.some((x) => o.plataformas.includes(x)));
    if (p.filtro === "tipo" && o.tipos) restantes = restantes.filter((j) => o.tipos.includes(j.tipo));
  });
  return restantes;
}

function explicar(jogo, u) {
  const eixos = EIXOS.map((e, i) => ({ e, i, seu: u[i], dele: jogo.valores[i] }));
  const frase = (x) => jogo.notas[x.e.id] ?? T.esteJogo(PEDIDOS[x.e.id].alto);
  let comuns = eixos.filter((x) => x.seu >= 2.5 && x.dele >= 4).sort((a, b) => b.seu + b.dele - a.seu - a.dele).slice(0, 2);
  if (!comuns.length) comuns = eixos.filter((x) => x.dele >= 3).sort((a, b) => Math.min(b.seu, b.dele) - Math.min(a.seu, a.dele)).slice(0, 1);
  const porque = comuns.map((x) => `<li><strong>${x.e.nome}.</strong> ${esc(frase(x))}</li>`).join("");

  const maior = eixos.map((x) => ({ ...x, d: x.dele - x.seu })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d))[0];
  let atencao = "";
  if (maior.d >= 2 && maior.dele >= 4) atencao = T.pesa(maior.e.nome, frase(maior));
  else if (maior.d <= -2.5) atencao = T.puxou(maior.e.nome.toLowerCase(), PEDIDOS[maior.e.id].baixo);
  return { porque, atencao };
}

function concluir(rolar) {
  const u = perfil();
  const escolhidos = candidatos().map((j) => ({ j, s: encaixe(u, j.valores) })).sort((a, b) => b.s - a.s).slice(0, 3).map((x) => x.j);
  const fortes = EIXOS.map((e, i) => ({ e, v: u[i] })).sort((a, b) => b.v - a.v).filter((x) => x.v > 0).slice(0, 2);

  secao.dataset.estado = "resultado";
  passo.textContent = T.completo;
  voltar.hidden = false;
  for (const d of direcoes) d.classList.remove("ativo");
  legenda.textContent = T.legendaFinal;
  quadro.classList.remove("saindo");
  quadro.innerHTML = `<h2 tabindex="-1">${T.pronto}</h2><p class="prosa">${fortes.length ? T.puxa(lista(fortes.map((x) => x.e.nome.toLowerCase()))) : T.curto} ${T.abaixo}</p>`;

  const n = escolhidos.length;
  resultado.querySelector("[data-resumo]").textContent = T.resumo(n);
  resultado.querySelector("[data-lista]").innerHTML = escolhidos.map((j, k) => {
    const { porque, atencao } = explicar(j, u);
    const outro = escolhidos[k === 0 ? 1 : 0];
    return `<li>
      <figure>
        <div class="hex-vivo vivo" data-sobre="${j.slug}">
          <img class="hex" src="/hex/${j.slug}.svg" alt="" width="480" height="480">
          <canvas role="img" aria-label="${esc(T.sobre(j.curto))}"></canvas>
        </div>
        <figcaption class="resultado-chave"><span class="serie"></span>${T.chave}</figcaption>
      </figure>
      <div>
        <p class="resultado-ordem">${T.ordem[k]}</p>
        <h3><a href="${T.fichas}${j.slug}/">${esc(j.titulo)}</a></h3>
        <p class="resultado-chamada">${esc(j.chamada)}</p>
        <div class="resultado-porque"><h4>${T.porque}</h4><ul class="lista-marcada">${porque}</ul></div>
        ${atencao ? `<p class="resultado-atencao"><strong>${T.atencao}</strong> ${esc(atencao)}</p>` : ""}
        <p class="resultado-ligacoes"><a class="botao botao-contorno" href="${T.fichas}${j.slug}/">${esc(T.ficha(j.curto))}</a>${outro ? `<a class="ligacao" href="${rota("/comparar/")}?a=${j.slug}&amp;b=${outro.slug}">${esc(T.comparar(outro.curto))}</a>` : ""}</p>
      </div>
    </li>`;
  }).join("");

  // sobre cada jogo recomendado, o contorno do perfil do visitante
  for (const alvo of resultado.querySelectorAll("[data-sobre]")) {
    const sobre = hexVivo(alvo.querySelector("canvas"), { grade: false });
    sobre.definir([{ valores: u, cor: "#DC0A2D" }]);
    alvo.querySelector(".hex").style.opacity = "1";
  }

  // o perfil que saiu das respostas pode ser ajustado à mão, vértice por vértice
  let ajuste = resultado.querySelector("[data-ajustar]");
  if (!ajuste) {
    ajuste = Object.assign(document.createElement("a"), { className: "ligacao", textContent: T.ajustar });
    ajuste.dataset.ajustar = "";
    resultado.querySelector(".resultado-acoes").insertBefore(ajuste, resultado.querySelector("[data-copiar]"));
  }
  ajuste.href = `${rota("/desenhar/")}#p=${u.map((v) => Math.round(v * 10)).join(",")}`;

  resultado.hidden = false;
  if (rolar) {
    history.replaceState(null, "", `#r=${respostas.join("")}`);
    const titulo = resultado.querySelector("h2");
    titulo.focus({ preventScroll: true });
    titulo.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }
}

function recomecar(ate) {
  respostas.length = ate;
  atual = ate;
  secao.dataset.estado = "perguntas";
  resultado.hidden = true;
  history.replaceState(null, "", location.pathname);
  mostrarPerfil();
  mostrarPergunta();
}

quadro.addEventListener("click", (e) => {
  const botao = e.target.closest("[data-opcao]");
  if (botao && !quadro.classList.contains("saindo")) responder(Number(botao.dataset.opcao));
});
voltar.addEventListener("click", () => {
  if (secao.dataset.estado === "resultado") recomecar(PERGUNTAS.length - 1);
  else if (atual > 0) { atual--; respostas.length = atual + 1; mostrarPerfil(); mostrarPergunta(); }
});
resultado.querySelector("[data-refazer]").addEventListener("click", () => {
  recomecar(0);
  legenda.textContent = T.emBranco;
  secao.scrollIntoView({ block: "start" });
});
resultado.querySelector("[data-copiar]").addEventListener("click", async () => {
  const aviso = resultado.querySelector("[data-copiado]");
  try {
    await navigator.clipboard.writeText(location.href);
    aviso.textContent = T.copiado;
    resultado.querySelector("[data-copiar]").textContent = T.copiadoBotao;
  } catch {
    aviso.textContent = T.naoCopiou;
  }
});

/* um resultado guardado no endereço abre direto no perfil completo */
const guardado = /^#r=(\d+)$/.exec(location.hash);
if (guardado && guardado[1].length === PERGUNTAS.length &&
    [...guardado[1]].every((d, q) => Number(d) < PERGUNTAS[q].opcoes.length)) {
  respostas = [...guardado[1]].map(Number);
  atual = PERGUNTAS.length - 1;
  mostrarPerfil();
  concluir(false);
} else {
  mostrarPerfil();
  mostrarPergunta(false);
}
