/* Montador de time, no formato da tela de equipe dos jogos: seis vagas, cada uma com o Pokémon, os tipos
 * dele e o que ele sofre; embaixo, a leitura do time inteiro em selos de tipo. O time e o jogo escolhido
 * ficam no endereço, para mandar a alguém. As contas estão em time-logica.js. */
import { ESPECIES } from "./dados/especies.js";
import { TIPOS, TABELA } from "./dados/tipos.js";
import { JOGOS } from "./dados/jogos.js";
import { especie, porNome, procurarEspecie, lerLista, selo } from "./especies-logica.js";
import { analisar, sofre } from "./time-logica.js";
import { colorirAoApontar } from "./gaveta.js";

const VAGAS = 6;
/* Os grupos do que um Pokémon sofre, do pior para o melhor: chave em sofre(), fator e como se lê. */
const GRUPOS = [["quadruplo", "4", "Apanha 4×"], ["dobro", "2", "Apanha 2×"], ["metade", "0.5", "Resiste ½"], ["quarto", "0.25", "Resiste ¼"], ["imune", "0", "Imune"]];
const raiz = document.querySelector("[data-time]");
const $ = (s) => raiz.querySelector(s);
const campo = $("#time-campo"), seletor = $('select[name="jogo"]'), aviso = $("[data-aviso]"), vagas = $("[data-vagas]"), resumo = $("[data-resumo]"), sugestoes = $("#lista-time");

const inicial = new URLSearchParams(location.search);
let time = lerLista(inicial.get("t"), ESPECIES, VAGAS);
let jogo = JOGOS.find((j) => j.slug === inicial.get("jogo")) ?? null;
seletor.value = jogo?.slug ?? "";

const doJogo = () => (jogo ? new Set(jogo.especies) : null);
const selos = (lista) => `<span class="time-selos">${lista.map((t) => selo(t)).join(" ")}</span>`;
/* Selos com a contagem de quantos do time estão naquela situação. */
const contados = (lista) => `<span class="time-selos">${lista.map(([t, n]) => selo(t, `<b><span class="so-leitor">, </span>${n}<span class="so-leitor"> do time</span></b>`)).join(" ")}</span>`;

function vaga(e, i, permitidas) {
  if (!e) return `<li class="time-vaga time-vaga-vazia"><span class="vaga-ordem" aria-hidden="true">${i + 1}</span><span>Vaga ${i + 1}</span></li>`;
  const s = sofre(TABELA, TIPOS, e.tipos);
  return `<li class="time-vaga"><span class="vaga-ordem" aria-hidden="true">${i + 1}</span>
    <div class="vaga-topo">
      <a class="vaga-quem" href="/pokedex/${e.slug}/"><span class="dex-arte"><img src="/arte/mini/${e.id}.webp" data-cor="/arte/mini/${e.id}-cor.webp" alt="" width="184" height="184"></span>
        <span class="vaga-dados"><span class="dex-nome">${e.nome}</span> <span class="vaga-tipos">${e.tipos.map((t) => selo(t)).join(" ")}</span></span></a>
      <button type="button" class="vaga-tirar" data-tirar="${e.id}" aria-label="Tirar ${e.nome} do time">Tirar</button>
    </div>
    ${permitidas && !permitidas.has(e.id) ? `<p class="time-fora">Não está na Pokédex de ${jogo.nome}</p>` : ""}
    <dl class="vaga-sofre">${GRUPOS.filter(([chave]) => s[chave].length).map(([chave, fator, rotulo]) => `<div data-fator="${fator}"><dt>${rotulo}</dt><dd>${selos(s[chave])}</dd></div>`).join("")}</dl></li>`;
}

function desenhar(gravar = true) {
  const permitidas = doJogo(), membros = time.map(especie);
  sugestoes.innerHTML = ESPECIES.filter((l) => !permitidas || permitidas.has(l[0])).map((l) => `<option value="${l[2]}">`).join("");
  vagas.innerHTML = Array.from({ length: VAGAS }, (_, i) => vaga(membros[i], i, permitidas)).join("");
  $("[data-limpar]").hidden = !time.length;

  const a = analisar(TABELA, TIPOS, membros);
  const apanha = a.porTipo.filter((t) => t.fracos).sort((x, y) => y.fracos - x.fracos).map((t) => [t.tipo, t.fracos]);
  const segura = a.porTipo.filter((t) => t.resistentes + t.imunes).sort((x, y) => y.resistentes + y.imunes - x.resistentes - x.imunes).map((t) => [t.tipo, t.resistentes + t.imunes]);
  resumo.innerHTML = !time.length
    ? '<p class="time-vazio">O time está vazio. Ponha o primeiro Pokémon no campo acima.</p>'
    : `<div class="time-grupo time-buracos"><h2>Buracos</h2>${a.buracos.length ? `<p>Dois ou mais apanham em dobro e ninguém segura.</p>${selos(a.buracos)}` : "<p>Nenhum. Toda fraqueza repetida tem alguém no time que resiste.</p>"}</div>
       <div class="time-grupo"><h2>Sem resposta</h2>${a.semResposta.length ? `<p>Tipos que nenhum tipo do time atinge com vantagem.</p>${selos(a.semResposta)}` : "<p>Nenhum. O time atinge os 18 tipos com vantagem.</p>"}</div>
       <div class="time-grupo"><h2>O time apanha de</h2>${apanha.length ? `<p>Quantos recebem em dobro ou mais.</p>${contados(apanha)}` : "<p>Nada em dobro.</p>"}</div>
       <div class="time-grupo"><h2>O time segura</h2>${segura.length ? `<p>Quantos resistem ou são imunes.</p>${contados(segura)}` : "<p>Ninguém resiste a nada.</p>"}</div>`;
  if (gravar) {
    const busca = new URLSearchParams();
    if (time.length) busca.set("t", time.map((l) => l[1]).join(","));
    if (jogo) busca.set("jogo", jogo.slug);
    history.replaceState(null, "", busca.size ? `?${busca.toString().replace(/%2C/g, ",")}` : location.pathname);
  }
}

function adicionar(l) {
  aviso.textContent = "";
  if (!l) { aviso.textContent = "Escolha um Pokémon da lista de sugestões."; return; }
  if (time.includes(l)) { aviso.textContent = `${l[2]} já está no time.`; return; }
  if (time.length >= VAGAS) { aviso.textContent = "O time já tem seis. Tire um para pôr outro."; return; }
  time.push(l);
  campo.value = "";
  desenhar();
}

raiz.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const permitidas = doJogo(), pool = permitidas ? ESPECIES.filter((l) => permitidas.has(l[0])) : ESPECIES;
  adicionar(porNome(pool, campo.value) ?? (campo.value.trim() ? procurarEspecie(pool, campo.value, 2).length === 1 ? procurarEspecie(pool, campo.value, 1)[0] : null : null));
});
// escolher uma sugestão já adiciona, sem precisar do botão
campo.addEventListener("input", (e) => { if (e.inputType === "insertReplacementText" || e.inputType === undefined) { const l = porNome(ESPECIES, campo.value); if (l) adicionar(l); } });
seletor.addEventListener("change", () => { jogo = JOGOS.find((j) => j.slug === seletor.value) ?? null; aviso.textContent = ""; desenhar(); });
raiz.addEventListener("click", (e) => {
  const tirar = e.target.closest("[data-tirar]");
  if (tirar) { time = time.filter((l) => l[0] !== Number(tirar.dataset.tirar)); aviso.textContent = ""; desenhar(); campo.focus(); }
  else if (e.target.closest("[data-limpar]")) { time = []; aviso.textContent = ""; desenhar(); campo.focus(); }
});
colorirAoApontar(raiz);
desenhar(false);
