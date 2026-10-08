/* Diário de desafio: acompanha uma campanha (capturas por lugar, time, caixa, quem caiu, insígnias).
 * Tudo fica guardado neste navegador; exportar gera um arquivo para guardar ou levar a outro aparelho.
 * As regras estão em diario-logica.js; aqui é a página. */
import { ESPECIES } from "./dados/especies.js";
import { JOGOS } from "./dados/jogos.js";
import { especie, porId, porNome, procurarEspecie } from "./especies-logica.js";
import * as D from "./diario-logica.js";
import { b, b as b_, rota, nomeDoJogo } from "./lingua.js";

const CHAVE = "pokeatlas.diario", CHAVE_ATIVA = "pokeatlas.diario.ativa";
const raiz = document.querySelector("[data-diario]");
const $ = (s) => raiz.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const familiaDe = (id) => porId(ESPECIES, id)?.[10] ?? id;
const jogoDe = (slug) => JOGOS.find((j) => j.slug === slug) ?? null;
const nomeDaRota = ([n, de, para]) => b(`Rota ${n} (${de} a ${para})`, `Route ${n} (${de} to ${para})`);

let campanhas = [], ativa = null, aviso = "", ultimoLocal = null;      // ultimoLocal: a rota escolhida não volta para a primeira a cada registro
try {
  const lidas = D.importar(localStorage.getItem(CHAVE) ?? "");
  if (lidas.campanhas) campanhas = lidas.campanhas;
  ativa = localStorage.getItem(CHAVE_ATIVA);
} catch { /* sem armazenamento, o diário vale só nesta visita, e a página avisa */ }
let semArmazenamento = false;
function guardar() {
  try { localStorage.setItem(CHAVE, D.exportar(campanhas)); if (ativa) localStorage.setItem(CHAVE_ATIVA, ativa); semArmazenamento = false; }
  catch { semArmazenamento = true; }
}
const atual = () => campanhas.find((c) => c.id === ativa) ?? campanhas[campanhas.length - 1] ?? null;
function trocar(campanha) { campanhas = campanhas.map((c) => (c.id === campanha.id ? campanha : c)); guardar(); desenhar(); }

/* quem chega de um desafio ou da roleta traz nome, jogo e regras no endereço */
const chegada = new URLSearchParams(location.search);
const rascunho = { nome: chegada.get("nome") ?? "", jogo: jogoDe(chegada.get("jogo"))?.slug ?? "", regras: chegada.get("regras") ?? "" };
let criando = Boolean(rascunho.nome || rascunho.regras) || !campanhas.length;

function formularioDeCriacao() {
  return `<form class="diario-nova painel-claro" data-criar>
    <h2>${campanhas.length ? b("Nova campanha", "New run") : b("Começar uma campanha", "Start a run")}</h2>
    <label class="escolha"><span>${b("Nome", "Name")}</span><input name="nome" type="text" maxlength="80" value="${esc(rascunho.nome)}" placeholder="${b("Os Super Woopers", "The Super Woopers")}" required></label>
    <label class="escolha"><span>${b("Jogo", "Game")}</span><select name="jogo">${JOGOS.map((j) => `<option value="${j.slug}"${j.slug === rascunho.jogo ? " selected" : ""}>${esc(nomeDoJogo(j.nome))} (${esc(j.regiao)})</option>`).join("")}</select></label>
    <label class="escolha diario-regras"><span>${b("Regras, se houver", "Rules, if any")}</span><textarea name="regras" rows="5" maxlength="4000" placeholder="${b("Só o primeiro encontro de cada rota. Quem desmaia não volta. Todo mundo ganha apelido.", "Only the first encounter on each route. Whoever faints does not come back. Everyone gets a nickname.")}">${esc(rascunho.regras)}</textarea></label>
    <p class="diario-botoes"><button type="submit" class="botao">${b("Começar", "Start")}</button>${campanhas.length ? `<button type="button" class="ligacao" data-cancelar>${b("Cancelar", "Cancel")}</button>` : ""}</p>
  </form>`;
}

function cartao(c, campanha) {
  const e = especie(porId(ESPECIES, c.especie));
  if (!e) return "";
  const vivo = c.estado === "vivo";
  return `<li class="diario-cartao${vivo ? "" : " caiu"}">
    <img src="/arte/mini/${e.id}.webp" alt="" width="64" height="64" loading="lazy">
    <div><strong>${esc(c.apelido || e.nome)}</strong>${c.apelido ? `<span>${e.nome}</span>` : ""}<span>${esc(c.local)}</span>${vivo ? "" : `<label class="diario-nota"><span class="so-leitor">${b(`Como ${esc(c.apelido || e.nome)} caiu`, `How ${esc(c.apelido || e.nome)} fell`)}</span><input type="text" maxlength="120" value="${esc(c.nota)}" placeholder="${b("Onde ou como caiu", "Where or how it fell")}" data-nota="${c.id}"></label>`}</div>
    <p class="diario-acoes">${vivo ? `<button type="button" class="ligacao" data-time="${c.id}">${c.time ? b("Tirar do time", "Remove from team") : b("Pôr no time", "Add to team")}</button><button type="button" class="ligacao" data-caiu="${c.id}">${b("Caiu", "Fell")}</button>` : `<button type="button" class="ligacao" data-reviver="${c.id}">${b("Desfazer", "Undo")}</button>`}<button type="button" class="ligacao" data-apagar-captura="${c.id}" aria-label="${b(`Apagar a captura de ${esc(c.apelido || e.nome)}`, `Delete the catch of ${esc(c.apelido || e.nome)}`)}">${b("Apagar", "Delete")}</button></p>
  </li>`;
}

function desenhar() {
  const c = atual();
  if (c) ativa = c.id;
  const jogo = c ? jogoDe(c.jogo) : null, rotas = jogo?.rotas ?? [];
  const grupo = (titulo, lista, vazio) => `<section class="diario-grupo"><h3>${titulo} <span class="dex-conta">${lista.length}</span></h3>${lista.length ? `<ul class="diario-lista">${lista.map((x) => cartao(x, c)).join("")}</ul>` : `<p class="diario-vazio">${vazio}</p>`}</section>`;
  const comCaptura = c ? new Set(c.capturas.map((x) => x.local)) : new Set();
  raiz.querySelector("[data-palco]").innerHTML = `
    ${semArmazenamento ? `<p class="diario-alerta">${b("Este navegador não está deixando o site guardar dados. O diário vale só enquanto esta página ficar aberta: exporte antes de sair.", "This browser is not letting the site store data. The journal only lasts while this page stays open: export before you leave.")}</p>` : ""}
    ${aviso ? `<p class="diario-alerta" role="status">${esc(aviso)}</p>` : ""}
    <div class="diario-barra">
      ${campanhas.length > 1 ? `<label class="escolha"><span>${b("Campanha", "Run")}</span><select data-escolher>${campanhas.map((x) => `<option value="${x.id}"${x.id === ativa ? " selected" : ""}>${esc(x.nome)}</option>`).join("")}</select></label>` : ""}
      <button type="button" class="ligacao" data-nova>${b("Nova campanha", "New run")}</button>
      ${campanhas.length ? `<button type="button" class="ligacao" data-exportar>${b("Exportar o diário", "Export the journal")}</button>` : ""}
      <label class="ligacao diario-importar">${b("Importar um arquivo", "Import a file")}<input type="file" accept="application/json,.json" data-importar class="so-leitor"></label>
    </div>
    ${criando ? formularioDeCriacao() : ""}
    ${c && !criando ? `<article class="diario-campanha">
      <header><h2>${esc(c.nome)}</h2><p>${jogo ? `<a href="${rota(`/jogos/${jogo.slug}/`)}">${esc(nomeDoJogo(jogo.nome))}</a>, ${esc(jogo.regiao)}` : b("Jogo não informado", "Game not given")}</p></header>
      ${c.regras ? `<details class="diario-regras-lidas" open><summary>${b("Regras", "Rules")}</summary><p>${esc(c.regras).replace(/\n/g, "<br>")}</p></details>` : ""}
      <div class="diario-placar">
        <p><span class="diario-numero">${c.insignias}</span> ${b(`de ${D.INSIGNIAS} insígnias ou provas`, `of ${D.INSIGNIAS} badges or trials`)} <button type="button" class="botao botao-contorno botao-pequeno" data-insignia="-1" aria-label="${b("Uma insígnia a menos", "One badge fewer")}"${c.insignias ? "" : " disabled"}>−</button> <button type="button" class="botao botao-contorno botao-pequeno" data-insignia="1" aria-label="${b("Uma insígnia a mais", "One more badge")}"${c.insignias < D.INSIGNIAS ? "" : " disabled"}>+</button></p>
        ${rotas.length ? `<p><span class="diario-numero">${rotas.filter((r) => comCaptura.has(nomeDaRota(r))).length}</span> ${b(`de ${rotas.length} rotas com captura`, `of ${rotas.length} routes with a catch`)}</p>` : ""}
        <p><span class="diario-numero">${c.capturas.filter((x) => x.estado === "caiu").length}</span> ${c.capturas.filter((x) => x.estado === "caiu").length === 1 ? b("queda", "fallen") : b("quedas", "fallen")}</p>
      </div>
      <form class="diario-captura" data-capturar>
        <h3>${b("Registrar captura", "Record a catch")}</h3>
        <label class="escolha"><span>${b("Onde", "Where")}</span><select name="local">${rotas.map((r) => `<option value="${esc(nomeDaRota(r))}"${nomeDaRota(r) === ultimoLocal ? " selected" : ""}>${esc(nomeDaRota(r))}${comCaptura.has(nomeDaRota(r)) ? b(" (já tem captura)", " (already has a catch)") : ""}</option>`).join("")}<option value=""${ultimoLocal === "" ? " selected" : ""}>${b("Outro lugar", "Somewhere else")}</option></select></label>
        <label class="escolha" data-outro hidden><span>${b("Que lugar", "Which place")}</span><input name="outro" type="text" maxlength="80" placeholder="${b("Caverna, cidade, presente", "Cave, city, gift")}"></label>
        <div class="dex-busca"><label for="diario-especie">Pokémon</label><input id="diario-especie" name="especie" type="search" list="lista-diario" placeholder="${b("Nome ou número", "Name or number")}" autocomplete="off" spellcheck="false" required></div>
        <label class="escolha"><span>${b("Apelido", "Nickname")}</span><input name="apelido" type="text" maxlength="24"></label>
        <button type="submit" class="botao">${b("Registrar", "Record")}</button>
        <div class="diario-encontros" data-encontros aria-live="polite"></div>
        <datalist id="lista-diario">${ESPECIES.filter((l) => !jogo || jogo.especies.includes(l[0])).map((l) => `<option value="${l[2]}">`).join("")}</datalist>
      </form>
      ${grupo(b("Time", "Team"), c.capturas.filter((x) => x.estado === "vivo" && x.time), b("Ninguém no time ainda.", "Nobody in the team yet."))}
      ${grupo(b("Caixa", "Box"), c.capturas.filter((x) => x.estado === "vivo" && !x.time), b("A caixa está vazia.", "The box is empty."))}
      ${grupo(b("Caíram", "Fallen"), c.capturas.filter((x) => x.estado === "caiu"), b("Ninguém caiu. Que continue assim.", "Nobody has fallen. May it stay that way."))}
      <p class="diario-fim"><button type="button" class="ligacao" data-apagar-campanha>${b("Apagar esta campanha", "Delete this run")}</button></p>
    </article>` : ""}`;
  const local = raiz.querySelector('[data-capturar] select[name="local"]');
  if (local) raiz.querySelector("[data-outro]").hidden = local.value !== "";
  mostrarEncontros();
  aviso = "";
}

/* O que aparece na rota escolhida, para os jogos em que a PokéAPI tem a tabela. Clicar num nome preenche o campo. */
const JEITOS = b(["Andando", "Na água", "Pescando", "De outros jeitos"], ["Walking", "On the water", "Fishing", "Other ways"]);
function mostrarEncontros() {
  const caixa = raiz.querySelector("[data-encontros]"), seletor = raiz.querySelector('[data-capturar] select[name="local"]');
  if (!caixa || !seletor) return;
  const jogo = jogoDe(atual().jogo), trecho = jogo?.rotas.find((r) => nomeDaRota(r) === seletor.value), grupos = trecho && jogo.encontros?.[trecho[0]];
  caixa.innerHTML = !grupos ? (trecho && jogo.encontros ? `<p class="diario-encontros-nota">${b("A PokéAPI não lista encontros nesta rota.", "PokéAPI lists no encounters on this route.")}</p>` : "")
    : `<p class="diario-encontros-nota">${b("Nesta rota, em", "On this route, in")} ${esc(nomeDoJogo(jogo.nome))}:</p>${grupos.map((ids, k) => (ids.length ? `<p><span>${JEITOS[k]}</span>${ids.map((id) => `<button type="button" class="ficha" data-sugerir="${id}">${porId(ESPECIES, id)?.[2] ?? id}</button>`).join("")}</p>` : "")).join("")}`;
}

raiz.addEventListener("submit", (e) => {
  e.preventDefault();
  const dados = new FormData(e.target);
  if (e.target.matches("[data-criar]")) {
    const nova = D.novaCampanha({ nome: dados.get("nome"), jogo: dados.get("jogo"), regras: dados.get("regras") });
    campanhas = [...campanhas, nova]; ativa = nova.id; criando = false;
    rascunho.nome = rascunho.regras = "";
    history.replaceState(null, "", location.pathname);
    guardar(); desenhar();
  } else if (e.target.matches("[data-capturar]")) {
    const c = atual(), jogo = jogoDe(c.jogo), pool = jogo ? ESPECIES.filter((l) => jogo.especies.includes(l[0])) : ESPECIES;
    const escrito = String(dados.get("especie"));
    const l = porNome(ESPECIES, escrito) ?? (procurarEspecie(pool, escrito, 2).length === 1 ? procurarEspecie(pool, escrito, 1)[0] : null);
    if (!l) { aviso = b("Escolha o Pokémon na lista de sugestões.", "Pick the Pokémon from the list of suggestions."); return desenhar(); }
    const seletor = e.target.querySelector('select[name="local"]');
    ultimoLocal = seletor.value;
    const local = String(ultimoLocal || dados.get("outro") || "");
    const avisos = [];
    const igual = D.repetida(c, l[0], familiaDe);
    if (igual) avisos.push(b(`Atenção: ${porId(ESPECIES, igual.especie)[2]}, da mesma família, já foi capturado em ${igual.local}.`, `Note: ${porId(ESPECIES, igual.especie)[2]}, from the same family, was already caught at ${igual.local}.`));
    if (local && D.noLocal(c, local).length) avisos.push(b(`${local} já tinha captura. No Nuzlocke clássico vale só a primeira de cada lugar.`, `${local} already had a catch. In a classic Nuzlocke only the first one in each place counts.`));
    aviso = avisos.join(" ");
    trocar(D.registrar(c, { local, especie: l[0], apelido: dados.get("apelido") }));
  }
});
raiz.addEventListener("change", async (e) => {
  if (e.target.matches("[data-escolher]")) { ativa = e.target.value; guardar(); desenhar(); }
  else if (e.target.matches('[data-capturar] select[name="local"]')) { raiz.querySelector("[data-outro]").hidden = e.target.value !== ""; mostrarEncontros(); }
  else if (e.target.matches("[data-nota]")) { campanhas = campanhas.map((c) => (c.id === ativa ? D.anotar(c, e.target.dataset.nota, e.target.value) : c)); guardar(); }
  else if (e.target.matches("[data-importar]")) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    const lido = D.importar(await arquivo.text().catch(() => ""));
    if (lido.erro) aviso = `${lido.erro} ${b("Nada foi alterado.", "Nothing was changed.")}`;
    else { campanhas = D.juntar(campanhas, lido.campanhas); ativa = lido.campanhas[0].id; criando = false; guardar(); aviso = `${lido.campanhas.length === 1 ? b("Uma campanha importada", "One run imported") : b(`${lido.campanhas.length} campanhas importadas`, `${lido.campanhas.length} runs imported`)}.`; }
    desenhar();
  }
});
raiz.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const c = atual(), d = b.dataset;
  if (d.sugerir) { const campo = raiz.querySelector("#diario-especie"); campo.value = porId(ESPECIES, d.sugerir)[2]; raiz.querySelector('[data-capturar] input[name="apelido"]').focus(); }
  else if ("nova" in d) { criando = true; desenhar(); raiz.querySelector('[data-criar] input[name="nome"]')?.focus(); }
  else if ("cancelar" in d) { criando = false; desenhar(); }
  else if ("exportar" in d) {
    const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([D.exportar(campanhas)], { type: "application/json" })), download: "diario-pokeatlas.json" });
    document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
  }
  else if (!c) return;
  else if (d.insignia) trocar(D.comInsignias(c, c.insignias + Number(d.insignia)));
  else if (d.time) { const r = D.alternarTime(c, d.time); aviso = r.erro ?? ""; trocar(r.campanha); }
  else if (d.caiu) trocar(D.marcarQueda(c, d.caiu));
  else if (d.reviver) trocar(D.reviver(c, d.reviver));
  else if (d.apagarCaptura) trocar(D.remover(c, d.apagarCaptura));
  else if ("apagarCampanha" in d) {
    if (!b.dataset.certeza) { b.dataset.certeza = "1"; b.textContent = b_(`Apagar "${c.nome}" de vez? Clique de novo para confirmar`, `Delete "${c.nome}" for good? Click again to confirm`); return; }
    campanhas = campanhas.filter((x) => x.id !== c.id); ativa = null; criando = !campanhas.length; guardar(); desenhar();
  }
});
guardar();
desenhar();
