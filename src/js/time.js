/* Montador de time, no formato da tela de equipe dos jogos: seis vagas, cada uma com o Pokémon, os tipos
 * dele e o que ele sofre; embaixo, a leitura do time inteiro em selos de tipo. O time e o jogo escolhido
 * ficam no endereço, para mandar a alguém. As contas estão em time-logica.js. */
import { b, rota, nomeDoJogo } from "./lingua.js";
import { ESPECIES } from "./dados/especies.js";
import { TIPOS, TABELA } from "./dados/tipos.js";
import { JOGOS } from "./dados/jogos.js";
import { especie, porNome, procurarEspecie, lerLista, selo } from "./especies-logica.js";
import { analisar, sofre } from "./time-logica.js";
import { colorirAoApontar } from "./gaveta.js";

const VAGAS = 6;
/* Os grupos do que um Pokémon sofre, do pior para o melhor: chave em sofre(), fator e como se lê. */
const GRUPOS = [["quadruplo", "4", b("Apanha 4×", "Takes 4×")], ["dobro", "2", b("Apanha 2×", "Takes 2×")], ["metade", "0.5", b("Resiste ½", "Resists ½")], ["quarto", "0.25", b("Resiste ¼", "Resists ¼")], ["imune", "0", b("Imune", "Immune")]];
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
const contados = (lista) => `<span class="time-selos">${lista.map(([t, n]) => selo(t, `<b><span class="so-leitor">, </span>${n}<span class="so-leitor">${b(" do time", " in the team")}</span></b>`)).join(" ")}</span>`;

function vaga(e, i, permitidas) {
  if (!e) return `<li class="time-vaga time-vaga-vazia"><span class="vaga-ordem" aria-hidden="true">${i + 1}</span><span>${b("Vaga", "Slot")} ${i + 1}</span></li>`;
  const s = sofre(TABELA, TIPOS, e.tipos);
  return `<li class="time-vaga"><span class="vaga-ordem" aria-hidden="true">${i + 1}</span>
    <div class="vaga-topo">
      <a class="vaga-quem" href="${rota(`/pokedex/${e.slug}/`)}"><span class="dex-arte"><img src="/arte/mini/${e.id}.webp" data-cor="/arte/mini/${e.id}-cor.webp" alt="" width="184" height="184"></span>
        <span class="vaga-dados"><span class="dex-nome">${e.nome}</span> <span class="vaga-tipos">${e.tipos.map((t) => selo(t)).join(" ")}</span></span></a>
      <button type="button" class="vaga-tirar" data-tirar="${e.id}" aria-label="${b(`Tirar ${e.nome} do time`, `Remove ${e.nome} from the team`)}">${b("Tirar", "Remove")}</button>
    </div>
    ${permitidas && !permitidas.has(e.id) ? `<p class="time-fora">${b("Não está na Pokédex de", "Not in the Pokédex of")} ${nomeDoJogo(jogo.nome)}</p>` : ""}
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
    ? `<p class="time-vazio">${b("O time está vazio. Ponha o primeiro Pokémon no campo acima.", "The team is empty. Put the first Pokémon in the field above.")}</p>`
    : `<div class="time-grupo time-buracos"><h2>${b("Buracos", "Holes")}</h2>${a.buracos.length ? `<p>${b("Dois ou mais apanham em dobro e ninguém segura.", "Two or more take double damage and nobody resists.")}</p>${selos(a.buracos)}` : `<p>${b("Nenhum. Toda fraqueza repetida tem alguém no time que resiste.", "None. Every repeated weakness has someone in the team who resists it.")}</p>`}</div>
       <div class="time-grupo"><h2>${b("Sem resposta", "No answer")}</h2>${a.semResposta.length ? `<p>${b("Tipos que nenhum tipo do time atinge com vantagem.", "Types that no type in the team hits for double damage.")}</p>${selos(a.semResposta)}` : `<p>${b("Nenhum. O time atinge os 18 tipos com vantagem.", "None. The team hits all 18 types for double damage.")}</p>`}</div>
       <div class="time-grupo"><h2>${b("O time apanha de", "The team is weak to")}</h2>${apanha.length ? `<p>${b("Quantos recebem em dobro ou mais.", "How many take double damage or more.")}</p>${contados(apanha)}` : `<p>${b("Nada em dobro.", "Nothing for double damage.")}</p>`}</div>
       <div class="time-grupo"><h2>${b("O time segura", "The team holds")}</h2>${segura.length ? `<p>${b("Quantos resistem ou são imunes.", "How many resist or are immune.")}</p>${contados(segura)}` : `<p>${b("Ninguém resiste a nada.", "Nobody resists anything.")}</p>`}</div>`;
  if (gravar) {
    const busca = new URLSearchParams();
    if (time.length) busca.set("t", time.map((l) => l[1]).join(","));
    if (jogo) busca.set("jogo", jogo.slug);
    history.replaceState(null, "", busca.size ? `?${busca.toString().replace(/%2C/g, ",")}` : location.pathname);
  }
}

function adicionar(l) {
  aviso.textContent = "";
  if (!l) { aviso.textContent = b("Escolha um Pokémon da lista de sugestões.", "Pick a Pokémon from the list of suggestions."); return; }
  if (time.includes(l)) { aviso.textContent = b(`${l[2]} já está no time.`, `${l[2]} is already in the team.`); return; }
  if (time.length >= VAGAS) { aviso.textContent = b("O time já tem seis. Tire um para pôr outro.", "The team already has six. Remove one to add another."); return; }
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
