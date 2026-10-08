/* A roleta de desafios. Sorteia, a partir de uma semente, um desafio montado com
 * as peças de dados/desafios.mjs e com dados do atlas. A semente vai no endereço:
 * o mesmo link sempre dá o mesmo desafio. */
const secao = document.querySelector("[data-roleta]");
const { EDICAO, PECAS, MUNDO, ESCRITOS } = await import(`./roleta-${secao.dataset.roleta}.js`);
const resultado = secao.querySelector("[data-resultado]");
const copiar = secao.querySelector("[data-copiar]");
const aviso = secao.querySelector("[data-copiado]");

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const lista = (itens) => (itens.length <= 1 ? itens.join("") : `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`);

/* Gerador de números a partir de um texto: mesma semente, mesma sequência. */
function gerador(semente) {
  let a = 2166136261;
  for (const c of semente) a = Math.imul(a ^ c.charCodeAt(0), 16777619);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sortear(semente) {
  const acaso = gerador(semente);
  const um = (itens) => itens[Math.floor(acaso() * itens.length)];
  const varios = (itens, n) => { const copia = [...itens]; return Array.from({ length: Math.min(n, copia.length) }, () => copia.splice(Math.floor(acaso() * copia.length), 1)[0]); };
  const nome = (id) => MUNDO.especies[id][0];
  const v = {};                                   // o que preenche as lacunas dos textos
  let regras = PECAS.regras, cenario = [];

  if (EDICAO === "pokemon") {
    const jogo = um(MUNDO.jogos);
    const comuns = jogo.especies.filter((id) => !MUNDO.especies[id][3]);
    const contar = (chave) => { const m = new Map(); for (const id of comuns) for (const k of [].concat(chave(id))) m.set(k, (m.get(k) || 0) + 1); return [...m].filter(([, n]) => n >= 8).map(([k]) => k); };
    v.regiao = jogo.regiao;
    v.tipo = um(contar((id) => MUNDO.especies[id][1]));
    v.cor = um(contar((id) => MUNDO.especies[id][2])).toLowerCase();
    v.letra = um(contar((id) => nome(id)[0]));
    v.especie = nome(um(comuns));
    v.seis = lista(varios(comuns, 6).map(nome));
    cenario = [["Jogo", `<a href="/jogos/${jogo.slug}/">${esc(jogo.nome)}</a>`], ["Região", esc(jogo.regiao)]];
    v.jogoSlug = jogo.slug;
  } else {
    const ambiente = um(MUNDO.ambientes.filter((a) => a.especies.length >= 8));
    const todas = Object.keys(MUNDO.especies);
    const tipos = new Map();
    for (const id of todas) for (const t of MUNDO.especies[id][1]) tipos.set(t, (tipos.get(t) || 0) + 1);
    v.emAmbiente = ambiente.em; v.doAmbiente = ambiente.de;
    v.quantos = ambiente.especies.length;
    v.exemplos = lista(varios(ambiente.especies, 3).map(nome));
    v.especie = nome(um(ambiente.especies));
    v.tipo = um([...tipos].filter(([, n]) => n >= 12).map(([t]) => t));
    v.onde = [["Onde", esc(ambiente.em.replace(/^(n[oa]s?) /, (m) => m[0].toUpperCase() + m.slice(1)))]];
  }

  const preencher = (texto) => texto.replace(/\{(\w+)\}/g, (_, chave) => v[chave] ?? "");
  const regra = um(regras);
  // o ambiente só aparece no resultado quando a regra sorteada depende dele
  if (v.onde && /Ambiente\}/.test(regra.texto)) cenario = v.onde;
  const complicacoes = varios(PECAS.complicacoes, acaso() < 0.5 ? 1 : 2);
  v.tema = PECAS.temas.length ? um(PECAS.temas) : "";
  const vitoria = um(PECAS.vitorias), derrota = um(PECAS.derrotas);
  const limite = (n) => Math.min(5, Math.max(1, Math.round(n)));
  return {
    titulo: preencher(regra.titulo), cenario, jogo: v.jogoSlug ?? null,
    regra: preencher(regra.texto), complicacoes: complicacoes.map((c) => preencher(c.texto)),
    vitoria: vitoria.texto, derrota,
    dificuldade: limite(regra.d + complicacoes.reduce((s, c) => s + c.d, 0) * 0.6 + vitoria.d * 0.6),
    caos: limite(regra.c + complicacoes.reduce((s, c) => s + c.c, 0) * 0.7)
  };
}

function medida(rotulo, valor) {
  return `<span class="medida"><span class="medida-rotulo">${rotulo}</span><span class="estratos" role="img" aria-label="${rotulo}: ${valor} de 5">${[1, 2, 3, 4, 5].map((n) => `<span class="estrato${n <= valor ? ` estrato-${n}` : ""}"></span>`).join("")}</span></span>`;
}

function mostrar(semente, gravar) {
  const d = sortear(semente);
  resultado.innerHTML = `
    <h3>${esc(d.titulo)}</h3>
    <p class="desafio-medidas">${medida("Dificuldade", d.dificuldade)}${medida("Caos", d.caos)}</p>
    <dl class="roleta-pecas">
      ${d.cenario.map(([t, valor]) => `<div><dt>${t}</dt><dd>${valor}</dd></div>`).join("")}
      <div><dt>A regra</dt><dd>${esc(d.regra)}</dd></div>
      <div><dt>${d.complicacoes.length > 1 ? "As complicações" : "A complicação"}</dt><dd>${d.complicacoes.map(esc).join("<br>")}</dd></div>
      <div><dt>Vitória</dt><dd>${esc(d.vitoria)}</dd></div>
      <div><dt>Derrota</dt><dd>${esc(d.derrota)}</dd></div>
    </dl>`;
  resultado.classList.remove("girou");
  void resultado.offsetWidth;                      // reinicia a animação de entrada
  resultado.classList.add("girou");
  copiar.hidden = false;
  copiar.textContent = "Copiar o link deste desafio";
  // o diário abre com este desafio já anotado: nome, jogo e regras vão no endereço
  const diario = secao.querySelector("[data-diario-link]");
  if (diario) {
    diario.href = `/diario/?${new URLSearchParams({ nome: d.titulo, ...(d.jogo ? { jogo: d.jogo } : {}), regras: [d.regra, ...d.complicacoes, `Vitória: ${d.vitoria}`, `Derrota: ${d.derrota}`].join("\n") })}`;
    diario.textContent = "Acompanhar este desafio no diário";
  }
  if (gravar) history.replaceState(null, "", `?roleta=${semente}#roleta`);
}

const novaSemente = () => Math.random().toString(36).slice(2, 8);
secao.querySelector("[data-girar]").addEventListener("click", (e) => {
  mostrar(novaSemente(), true);
  e.currentTarget.textContent = "Girar de novo";
});
copiar.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    copiar.textContent = "Link copiado";
    aviso.textContent = "Link copiado.";
  } catch {
    aviso.textContent = "Não foi possível copiar. O link está na barra de endereço.";
  }
});

/* quem chega com um desafio no endereço já o vê montado */
const guardada = new URLSearchParams(location.search).get("roleta");
if (guardada && /^[a-z0-9]{1,12}$/.test(guardada)) {
  mostrar(guardada, false);
  secao.querySelector("[data-girar]").textContent = "Girar de novo";
}

/* os desafios escritos mudam de ordem a cada visita, e um botão escolhe um por você */
const escritos = document.querySelector("[data-embaralhar]");
if (escritos) {
  const cartoes = [...escritos.children];
  for (let i = cartoes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cartoes[i], cartoes[j]] = [cartoes[j], cartoes[i]];
  }
  escritos.append(...cartoes);
}
document.querySelector("[data-sortear-escrito]")?.addEventListener("click", () => {
  location.href = ESCRITOS[Math.floor(Math.random() * ESCRITOS.length)];
});
