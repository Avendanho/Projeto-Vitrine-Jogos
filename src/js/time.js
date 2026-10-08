/* Montador de time: até seis Pokémon, com o que o time sofre e o que ele alcança. O time e o jogo
 * escolhido ficam no endereço, para mandar a alguém. As contas estão em time-logica.js. */
import { ESPECIES } from "./dados/especies.js";
import { TIPOS, TABELA } from "./dados/tipos.js";
import { JOGOS } from "./dados/jogos.js";
import { especie, porNome, procurarEspecie, lerLista } from "./especies-logica.js";
import { analisar, escrito } from "./time-logica.js";
import { colorirAoApontar } from "./gaveta.js";

const VAGAS = 6;
const raiz = document.querySelector("[data-time]");
const $ = (s) => raiz.querySelector(s);
const campo = $("#time-campo"), seletor = $('select[name="jogo"]'), aviso = $("[data-aviso]"), vagas = $("[data-vagas]"), resumo = $("[data-resumo]"), tabela = $("[data-tabela]"), sugestoes = $("#lista-time");

const inicial = new URLSearchParams(location.search);
let time = lerLista(inicial.get("t"), ESPECIES, VAGAS);
let jogo = JOGOS.find((j) => j.slug === inicial.get("jogo")) ?? null;
seletor.value = jogo?.slug ?? "";

const doJogo = () => (jogo ? new Set(jogo.especies) : null);
const fichas = (lista) => (lista.length ? `<span class="time-fichas">${lista.map((t) => `<span class="ficha ficha-tipo">${t}</span>`).join("")}</span>` : "");
const classeDoFator = (f) => (f === 0 ? "f-imune" : f >= 4 ? "f-fraco f-quadruplo" : f > 1 ? "f-fraco" : f < 1 ? "f-resiste" : "");

function desenhar(gravar = true) {
  const permitidas = doJogo(), membros = time.map(especie);
  sugestoes.innerHTML = ESPECIES.filter((l) => !permitidas || permitidas.has(l[0])).map((l) => `<option value="${l[2]}">`).join("");
  vagas.innerHTML = Array.from({ length: VAGAS }, (_, i) => {
    const e = membros[i];
    if (!e) return `<li class="time-vaga time-vaga-vazia"><span>Vaga ${i + 1}</span></li>`;
    return `<li class="time-vaga"><a href="/pokedex/${e.slug}/"><span class="dex-arte"><img src="/arte/mini/${e.id}.webp" data-cor="/arte/mini/${e.id}-cor.webp" alt="" width="184" height="184"></span><span class="dex-nome">${e.nome}</span></a>
      <span class="dex-tipos">${e.tipos.join(", ")}</span>${permitidas && !permitidas.has(e.id) ? `<span class="time-fora">Não está na Pokédex de ${jogo.nome}</span>` : ""}
      <button type="button" class="ligacao" data-tirar="${e.id}" aria-label="Tirar ${e.nome} do time">Tirar</button></li>`;
  }).join("");
  $("[data-limpar]").hidden = !time.length;

  const a = analisar(TABELA, TIPOS, membros);
  resumo.innerHTML = !time.length
    ? '<p class="time-vazio">O time está vazio. Ponha o primeiro Pokémon no campo acima.</p>'
    : `<div><h2>Buracos</h2>${a.buracos.length ? `<p>Dois ou mais apanham em dobro e ninguém segura:</p>${fichas(a.buracos)}` : "<p>Nenhum. Toda fraqueza repetida tem alguém no time que resiste.</p>"}</div>
       <div><h2>Sem resposta</h2>${a.semResposta.length ? `<p>Tipos que nenhum tipo do time atinge com vantagem:</p>${fichas(a.semResposta)}` : "<p>Nenhum. O time atinge os 18 tipos com vantagem.</p>"}</div>`;
  tabela.hidden = !time.length;
  tabela.tBodies[0].innerHTML = membros.map((e, i) => `<tr><th scope="row">${e.nome}</th>${a.porTipo.map((t) => `<td class="${classeDoFator(t.fatores[i])}">${escrito(t.fatores[i])}</td>`).join("")}</tr>`).join("");
  tabela.tFoot.innerHTML = time.length
    ? `<tr><th scope="row">Apanham mais</th>${a.porTipo.map((t) => `<td class="${a.buracos.includes(t.tipo) ? "buraco" : ""}">${t.fracos || ""}</td>`).join("")}</tr>
       <tr><th scope="row">Resistem ou são imunes</th>${a.porTipo.map((t) => `<td>${t.resistentes + t.imunes || ""}</td>`).join("")}</tr>` : "";
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
