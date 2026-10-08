/* Comparar dois Pokémon: os atributos de base frente a frente. O par escolhido fica no endereço. */
import { ESPECIES } from "./dados/especies.js";
import { especie, porSlug, porNome, procurarEspecie } from "./especies-logica.js";
import { colorirAoApontar } from "./gaveta.js";

const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
const TETO = 255;                                    // o maior atributo de base que existe
const raiz = document.querySelector("[data-duelo]");
const campos = { a: raiz.querySelector("#duelo-a"), b: raiz.querySelector("#duelo-b") };
const lados = { a: raiz.querySelector('[data-lado="a"]'), b: raiz.querySelector('[data-lado="b"]') };
const linhas = [...raiz.querySelectorAll(".duelo-atributos li")];
const numero = (v, casas = 0) => v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: 1 });

raiz.querySelector("#lista-especies").innerHTML = ESPECIES.map((l) => `<option value="${l[2]}">`).join("");

const inicial = new URLSearchParams(location.search);
const estado = { a: porSlug(ESPECIES, inicial.get("a") ?? ""), b: porSlug(ESPECIES, inicial.get("b") ?? "") };
if (!inicial.has("a") && !inicial.has("b")) { estado.a = porSlug(ESPECIES, "charizard"); estado.b = porSlug(ESPECIES, "blastoise"); }   // um par de exemplo, para a página não abrir vazia

function lado(l) {
  if (!l) return '<p class="duelo-vazio">Escolha um Pokémon no campo acima.</p>';
  const e = especie(l);
  return `<a href="/pokedex/${e.slug}/"><span class="dex-arte"><img src="/arte/mini/${e.id}.webp" data-cor="/arte/mini/${e.id}-cor.webp" alt="" width="184" height="184"></span><span class="dex-numero">Nº ${String(e.id).padStart(4, "0")}</span><h2>${e.nome}</h2></a>
    <p class="duelo-tipos">${e.tipos.join(", ")}</p>
    <dl class="duelo-ficha"><div><dt>Altura</dt><dd>${numero(e.altura, 1)} m</dd></div><div><dt>Peso</dt><dd>${numero(e.peso, 1)} kg</dd></div><div><dt>Geração</dt><dd>${ROMANOS[e.geracao]}</dd></div></dl>`;
}

function desenhar(gravar = true) {
  const a = especie(estado.a), b = especie(estado.b);
  lados.a.innerHTML = lado(estado.a);
  lados.b.innerHTML = lado(estado.b);
  for (const k of ["a", "b"]) if (document.activeElement !== campos[k]) campos[k].value = estado[k]?.[2] ?? "";
  linhas.forEach((li, i) => {
    const total = i === 6, va = a ? (total ? a.atributos.reduce((s, v) => s + v, 0) : a.atributos[i]) : null, vb = b ? (total ? b.atributos.reduce((s, v) => s + v, 0) : b.atributos[i]) : null;
    for (const [k, v, outro] of [["a", va, vb], ["b", vb, va]]) {
      const valor = li.querySelector(`[data-valor="${k}"]`), barra = li.querySelector(`[data-barra="${k}"]`);
      valor.textContent = v ?? "";
      valor.classList.toggle("maior", v !== null && outro !== null && v > outro);
      if (barra) { barra.style.width = v === null ? "0" : `${(v / TETO) * 100}%`; barra.classList.toggle("maior", v !== null && outro !== null && v > outro); }
    }
  });
  if (gravar) {
    const busca = new URLSearchParams();
    if (estado.a) busca.set("a", estado.a[1]);
    if (estado.b) busca.set("b", estado.b[1]);
    history.replaceState(null, "", busca.size ? `?${busca}` : location.pathname);
  }
}

for (const k of ["a", "b"]) {
  // escolher na lista de sugestões ou digitar o nome inteiro já vale; Enter aceita a primeira sugestão
  campos[k].addEventListener("input", () => { const l = porNome(ESPECIES, campos[k].value); if (l) { estado[k] = l; desenhar(); } else if (!campos[k].value.trim()) { estado[k] = null; desenhar(); } });
  campos[k].addEventListener("change", () => { const l = porNome(ESPECIES, campos[k].value) ?? procurarEspecie(ESPECIES, campos[k].value, 1)[0]; if (l) { estado[k] = l; campos[k].value = l[2]; desenhar(); } });
}
raiz.querySelector("form").addEventListener("submit", (e) => e.preventDefault());
raiz.querySelector("[data-trocar]").addEventListener("click", () => { [estado.a, estado.b] = [estado.b, estado.a]; desenhar(); });
colorirAoApontar(raiz);
desenhar(false);
