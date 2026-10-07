/* A Pokédex inteira: busca por nome ou número, filtro por geração e por tipo.
 * O que está escolhido fica no endereço, para o link poder ser guardado. */
import { colorirAoApontar, semAcento } from "./gaveta.js";

const secao = document.querySelector("[data-pokedex-geral]");
const formulario = secao.querySelector("form");
const campo = secao.querySelector("#dex-procurar");
const grupos = [...secao.querySelectorAll(".dex-geracao")].map((el) => ({ el, geracao: el.dataset.geracao, itens: [...el.querySelectorAll("li")] }));
const botoesGeracao = [...secao.querySelectorAll("button[data-geracao]")];
const botoesTipo = [...secao.querySelectorAll("button[data-tipo]")];
const contagem = secao.querySelector("[data-dex-contagem]");
const rotulo = secao.querySelector("[data-dex-rotulo]");
const limpar = secao.querySelector("[data-dex-limpar]");
const vazio = secao.querySelector("[data-dex-vazio]");

const inicial = new URLSearchParams(location.search);
const estado = {
  q: inicial.get("q") || "",
  g: botoesGeracao.some((b) => b.dataset.geracao === inicial.get("g")) ? inicial.get("g") : "",
  tipo: botoesTipo.some((b) => b.dataset.tipo === inicial.get("tipo")) ? inicial.get("tipo") : ""
};

/* quem chega com o nome exato de uma espécie (a busca da página inicial) vai direto para a página dela */
if (estado.q) {
  const alvo = semAcento(estado.q);
  const exato = grupos.flatMap((g) => g.itens).find((li) => li.dataset.nome === alvo);
  if (exato) location.replace(exato.querySelector("a").href);
}
campo.value = estado.q;

function visiveisAgora() {
  return grupos.flatMap((g) => (g.el.hidden ? [] : g.itens.filter((li) => !li.hidden)));
}

function aplicar(gravar = true) {
  const texto = semAcento(estado.q);
  const numero = /^\d+$/.test(texto) ? Number(texto) : null;
  let visiveis = 0;
  for (const grupo of grupos) {
    let noGrupo = 0;
    if (!estado.g || grupo.geracao === estado.g) {
      for (const li of grupo.itens) {
        const porTexto = !texto || (numero !== null ? Number(li.dataset.n) === numero : li.dataset.nome.includes(texto));
        const porTipo = !estado.tipo || li.dataset.tipos.split(" ").includes(estado.tipo);
        li.hidden = !(porTexto && porTipo);
        if (!li.hidden) noGrupo++;
      }
    }
    grupo.el.hidden = noGrupo === 0;
    visiveis += noGrupo;
  }
  for (const b of botoesGeracao) b.setAttribute("aria-pressed", String(b.dataset.geracao === estado.g));
  for (const b of botoesTipo) b.setAttribute("aria-pressed", String(b.dataset.tipo === estado.tipo));
  contagem.textContent = visiveis.toLocaleString("pt-BR");
  rotulo.textContent = visiveis === 1 ? "espécie" : "espécies";
  limpar.hidden = !(estado.q || estado.g || estado.tipo);
  vazio.hidden = visiveis > 0;

  if (gravar) {
    const busca = new URLSearchParams();
    for (const [chave, valor] of Object.entries(estado)) if (valor) busca.set(chave, valor);
    const endereco = busca.toString();
    history.replaceState(null, "", endereco ? `?${endereco}` : location.pathname);
  }
}

campo.addEventListener("input", () => { estado.q = campo.value.trim(); aplicar(); });
for (const b of botoesGeracao) b.addEventListener("click", () => { estado.g = estado.g === b.dataset.geracao ? "" : b.dataset.geracao; aplicar(); });
for (const b of botoesTipo) b.addEventListener("click", () => { estado.tipo = estado.tipo === b.dataset.tipo ? "" : b.dataset.tipo; aplicar(); });
limpar.addEventListener("click", () => {
  estado.q = estado.g = estado.tipo = "";
  campo.value = "";
  aplicar();
  campo.focus();
});
/* Enter abre a espécie quando só sobrou uma */
formulario.addEventListener("submit", (e) => {
  e.preventDefault();
  const sobraram = visiveisAgora();
  if (sobraram.length === 1) sobraram[0].querySelector("a").click();
});

colorirAoApontar(secao);
aplicar(false);
