/* Itens do Cobblemon: a busca esconde o que não combina, e os grupos que ficarem vazios. */
import { semAcento } from "./gaveta.js";

const secao = document.querySelector("[data-cb-itens]");
const campo = secao.querySelector("#item-procurar");
const grupos = [...secao.querySelectorAll(".cb-grupo")].map((el) => ({ el, itens: [...el.querySelectorAll("li")] }));
const contagem = secao.querySelector("[data-dex-contagem]");
const rotulo = secao.querySelector("[data-dex-rotulo]");
const vazio = secao.querySelector("[data-dex-vazio]");

function aplicar() {
  const texto = semAcento(campo.value);
  let visiveis = 0;
  for (const grupo of grupos) {
    let noGrupo = 0;
    for (const li of grupo.itens) {
      li.hidden = Boolean(texto) && !li.dataset.busca.includes(texto);
      if (!li.hidden) noGrupo++;
    }
    grupo.el.hidden = noGrupo === 0;
    visiveis += noGrupo;
  }
  contagem.textContent = visiveis;
  rotulo.textContent = visiveis === 1 ? "item" : "itens";
  vazio.hidden = visiveis > 0;
}
campo.addEventListener("input", aplicar);
secao.querySelector("form").addEventListener("submit", (e) => e.preventDefault());
