/* Diário de desafio: acompanha uma campanha (capturas por lugar, time, caixa, quem caiu, insígnias).
 * Tudo fica guardado neste navegador; exportar gera um arquivo para guardar ou levar a outro aparelho.
 * As regras estão em diario-logica.js; aqui é a página. */
import { ESPECIES } from "./dados/especies.js";
import { JOGOS } from "./dados/jogos.js";
import { especie, porId, porNome, procurarEspecie } from "./especies-logica.js";
import * as D from "./diario-logica.js";

const CHAVE = "pokeatlas.diario", CHAVE_ATIVA = "pokeatlas.diario.ativa";
const raiz = document.querySelector("[data-diario]");
const $ = (s) => raiz.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const familiaDe = (id) => porId(ESPECIES, id)?.[10] ?? id;
const jogoDe = (slug) => JOGOS.find((j) => j.slug === slug) ?? null;
const nomeDaRota = ([n, de, para]) => `Rota ${n} (${de} a ${para})`;

let campanhas = [], ativa = null, aviso = "";
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
    <h2>${campanhas.length ? "Nova campanha" : "Começar uma campanha"}</h2>
    <label class="escolha"><span>Nome</span><input name="nome" type="text" maxlength="80" value="${esc(rascunho.nome)}" placeholder="Os Super Woopers" required></label>
    <label class="escolha"><span>Jogo</span><select name="jogo">${JOGOS.map((j) => `<option value="${j.slug}"${j.slug === rascunho.jogo ? " selected" : ""}>${esc(j.nome)} (${esc(j.regiao)})</option>`).join("")}</select></label>
    <label class="escolha diario-regras"><span>Regras, se houver</span><textarea name="regras" rows="5" maxlength="4000" placeholder="Só o primeiro encontro de cada rota. Quem desmaia não volta. Todo mundo ganha apelido.">${esc(rascunho.regras)}</textarea></label>
    <p class="diario-botoes"><button type="submit" class="botao">Começar</button>${campanhas.length ? '<button type="button" class="ligacao" data-cancelar>Cancelar</button>' : ""}</p>
  </form>`;
}

function cartao(c, campanha) {
  const e = especie(porId(ESPECIES, c.especie));
  if (!e) return "";
  const vivo = c.estado === "vivo";
  return `<li class="diario-cartao${vivo ? "" : " caiu"}">
    <img src="/arte/mini/${e.id}.webp" alt="" width="64" height="64" loading="lazy">
    <div><strong>${esc(c.apelido || e.nome)}</strong>${c.apelido ? `<span>${e.nome}</span>` : ""}<span>${esc(c.local)}</span>${vivo ? "" : `<label class="diario-nota"><span class="so-leitor">Como ${esc(c.apelido || e.nome)} caiu</span><input type="text" maxlength="120" value="${esc(c.nota)}" placeholder="Onde ou como caiu" data-nota="${c.id}"></label>`}</div>
    <p class="diario-acoes">${vivo ? `<button type="button" class="ligacao" data-time="${c.id}">${c.time ? "Tirar do time" : "Pôr no time"}</button><button type="button" class="ligacao" data-caiu="${c.id}">Caiu</button>` : `<button type="button" class="ligacao" data-reviver="${c.id}">Desfazer</button>`}<button type="button" class="ligacao" data-apagar-captura="${c.id}" aria-label="Apagar a captura de ${esc(c.apelido || e.nome)}">Apagar</button></p>
  </li>`;
}

function desenhar() {
  const c = atual();
  if (c) ativa = c.id;
  const jogo = c ? jogoDe(c.jogo) : null, rotas = jogo?.rotas ?? [];
  const grupo = (titulo, lista, vazio) => `<section class="diario-grupo"><h3>${titulo} <span class="dex-conta">${lista.length}</span></h3>${lista.length ? `<ul class="diario-lista">${lista.map((x) => cartao(x, c)).join("")}</ul>` : `<p class="diario-vazio">${vazio}</p>`}</section>`;
  const comCaptura = c ? new Set(c.capturas.map((x) => x.local)) : new Set();
  raiz.querySelector("[data-palco]").innerHTML = `
    ${semArmazenamento ? '<p class="diario-alerta">Este navegador não está deixando o site guardar dados. O diário vale só enquanto esta página ficar aberta: exporte antes de sair.</p>' : ""}
    ${aviso ? `<p class="diario-alerta" role="status">${esc(aviso)}</p>` : ""}
    <div class="diario-barra">
      ${campanhas.length > 1 ? `<label class="escolha"><span>Campanha</span><select data-escolher>${campanhas.map((x) => `<option value="${x.id}"${x.id === ativa ? " selected" : ""}>${esc(x.nome)}</option>`).join("")}</select></label>` : ""}
      <button type="button" class="ligacao" data-nova>Nova campanha</button>
      ${campanhas.length ? '<button type="button" class="ligacao" data-exportar>Exportar o diário</button>' : ""}
      <label class="ligacao diario-importar">Importar um arquivo<input type="file" accept="application/json,.json" data-importar class="so-leitor"></label>
    </div>
    ${criando ? formularioDeCriacao() : ""}
    ${c && !criando ? `<article class="diario-campanha">
      <header><h2>${esc(c.nome)}</h2><p>${jogo ? `<a href="/jogos/${jogo.slug}/">${esc(jogo.nome)}</a>, ${esc(jogo.regiao)}` : "Jogo não informado"}</p></header>
      ${c.regras ? `<details class="diario-regras-lidas" open><summary>Regras</summary><p>${esc(c.regras).replace(/\n/g, "<br>")}</p></details>` : ""}
      <div class="diario-placar">
        <p><span class="diario-numero">${c.insignias}</span> de ${D.INSIGNIAS} insígnias ou provas <button type="button" class="botao botao-contorno botao-pequeno" data-insignia="-1" aria-label="Uma insígnia a menos"${c.insignias ? "" : " disabled"}>−</button> <button type="button" class="botao botao-contorno botao-pequeno" data-insignia="1" aria-label="Uma insígnia a mais"${c.insignias < D.INSIGNIAS ? "" : " disabled"}>+</button></p>
        ${rotas.length ? `<p><span class="diario-numero">${rotas.filter((r) => comCaptura.has(nomeDaRota(r))).length}</span> de ${rotas.length} rotas com captura</p>` : ""}
        <p><span class="diario-numero">${c.capturas.filter((x) => x.estado === "caiu").length}</span> ${c.capturas.filter((x) => x.estado === "caiu").length === 1 ? "queda" : "quedas"}</p>
      </div>
      <form class="diario-captura" data-capturar>
        <h3>Registrar captura</h3>
        <label class="escolha"><span>Onde</span><select name="local">${rotas.map((r) => `<option${comCaptura.has(nomeDaRota(r)) ? ' data-usada="1"' : ""}>${esc(nomeDaRota(r))}</option>`).join("")}<option value="">Outro lugar</option></select></label>
        <label class="escolha" data-outro hidden><span>Que lugar</span><input name="outro" type="text" maxlength="80" placeholder="Caverna, cidade, presente"></label>
        <div class="dex-busca"><label for="diario-especie">Pokémon</label><input id="diario-especie" name="especie" type="search" list="lista-diario" placeholder="Nome ou número" autocomplete="off" spellcheck="false" required></div>
        <label class="escolha"><span>Apelido</span><input name="apelido" type="text" maxlength="24"></label>
        <button type="submit" class="botao">Registrar</button>
        <datalist id="lista-diario">${ESPECIES.filter((l) => !jogo || jogo.especies.includes(l[0])).map((l) => `<option value="${l[2]}">`).join("")}</datalist>
      </form>
      ${grupo("Time", c.capturas.filter((x) => x.estado === "vivo" && x.time), "Ninguém no time ainda.")}
      ${grupo("Caixa", c.capturas.filter((x) => x.estado === "vivo" && !x.time), "A caixa está vazia.")}
      ${grupo("Caíram", c.capturas.filter((x) => x.estado === "caiu"), "Ninguém caiu. Que continue assim.")}
      <p class="diario-fim"><button type="button" class="ligacao" data-apagar-campanha>Apagar esta campanha</button></p>
    </article>` : ""}`;
  const local = raiz.querySelector('[data-capturar] select[name="local"]');
  if (local) raiz.querySelector("[data-outro]").hidden = local.value !== "";
  aviso = "";
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
    if (!l) { aviso = "Escolha o Pokémon na lista de sugestões."; return desenhar(); }
    const local = String(dados.get("local") || dados.get("outro") || "");
    const avisos = [];
    const igual = D.repetida(c, l[0], familiaDe);
    if (igual) avisos.push(`Atenção: ${porId(ESPECIES, igual.especie)[2]}, da mesma família, já foi capturado em ${igual.local}.`);
    if (local && D.noLocal(c, local).length) avisos.push(`${local} já tinha captura. No Nuzlocke clássico vale só a primeira de cada lugar.`);
    aviso = avisos.join(" ");
    trocar(D.registrar(c, { local, especie: l[0], apelido: dados.get("apelido") }));
  }
});
raiz.addEventListener("change", async (e) => {
  if (e.target.matches("[data-escolher]")) { ativa = e.target.value; guardar(); desenhar(); }
  else if (e.target.matches('[data-capturar] select[name="local"]')) raiz.querySelector("[data-outro]").hidden = e.target.value !== "";
  else if (e.target.matches("[data-nota]")) { campanhas = campanhas.map((c) => (c.id === ativa ? D.anotar(c, e.target.dataset.nota, e.target.value) : c)); guardar(); }
  else if (e.target.matches("[data-importar]")) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    const lido = D.importar(await arquivo.text().catch(() => ""));
    if (lido.erro) aviso = `${lido.erro} Nada foi alterado.`;
    else { campanhas = D.juntar(campanhas, lido.campanhas); ativa = lido.campanhas[0].id; criando = false; guardar(); aviso = `${lido.campanhas.length === 1 ? "Uma campanha importada" : `${lido.campanhas.length} campanhas importadas`}.`; }
    desenhar();
  }
});
raiz.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const c = atual(), d = b.dataset;
  if ("nova" in d) { criando = true; desenhar(); raiz.querySelector('[data-criar] input[name="nome"]')?.focus(); }
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
    if (!b.dataset.certeza) { b.dataset.certeza = "1"; b.textContent = `Apagar "${c.nome}" de vez? Clique de novo para confirmar`; return; }
    campanhas = campanhas.filter((x) => x.id !== c.id); ativa = null; criando = !campanhas.length; guardar(); desenhar();
  }
});
guardar();
desenhar();
