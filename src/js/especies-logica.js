/* Regras sobre a lista de espécies que o navegador recebe (js/dados/especies.js), sem tocar na página:
 * servem ao comparador, ao time e ao diário, e rodam igual no Node, para os testes. */

export const semAcento = (texto) => String(texto).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
/* O selo de um tipo, na cor dele. `extra` entra depois do nome (uma contagem, por exemplo). */
export const selo = (tipo, extra = "") => `<span class="tipo" data-tipo="${semAcento(tipo)}">${tipo}${extra}</span>`;

/* Cada espécie chega como uma linha enxuta; aqui ela ganha nomes. */
export const especie = (l) => l && ({ id: l[0], slug: l[1], nome: l[2], tipos: l[3], atributos: l[4], altura: l[5], peso: l[6], geracao: l[7], cor: l[8], estagio: l[9], familia: l[10] });

export const porId = (lista, id) => lista.find((l) => l[0] === Number(id)) ?? null;
export const porSlug = (lista, slug) => lista.find((l) => l[1] === String(slug).toLowerCase()) ?? null;

/* Procura por nome (sem acento, começo do nome primeiro) ou por número. */
export function procurarEspecie(lista, texto, limite = 8) {
  const t = semAcento(texto);
  if (!t) return [];
  if (/^\d+$/.test(t)) { const exata = porId(lista, Number(t)); return exata ? [exata] : []; }
  const comeca = [], contem = [];
  for (const l of lista) {
    const nome = semAcento(l[2]);
    if (nome.startsWith(t) || l[1].startsWith(t)) comeca.push(l);
    else if (nome.includes(t)) contem.push(l);
  }
  return [...comeca, ...contem].slice(0, limite);
}

/* O nome exato, como a pessoa escolheu na lista de sugestões ou digitou inteiro. */
export const porNome = (lista, texto) => { const t = semAcento(texto); return t ? lista.find((l) => semAcento(l[2]) === t || l[1] === t) ?? null : null; };

/* Uma lista vinda do endereço ("charizard,9,xyz"): fica só o que existe, sem repetir, até o limite. */
export function lerLista(parametro, lista, limite = 6) {
  const achadas = [];
  for (const pedaco of String(parametro ?? "").split(",")) {
    const p = pedaco.trim();
    if (!p) continue;
    const l = /^\d+$/.test(p) ? porId(lista, p) : porSlug(lista, p);
    if (l && !achadas.includes(l)) achadas.push(l);
    if (achadas.length === limite) break;
  }
  return achadas;
}
