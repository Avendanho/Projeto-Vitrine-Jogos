/* As regras do diário de desafio, sem tocar na página. Uma campanha é
 *   { id, nome, jogo, regras, insignias, criada, capturas: [{ id, local, especie, apelido, estado, time, nota }] }
 * com estado "vivo" ou "caiu". Nada aqui muda o que recebe: cada função devolve uma campanha nova. */
import { b } from "./lingua.js";

export const MARCA = "pokeatlas-diario", VERSAO = 1, VAGAS = 6, INSIGNIAS = 8;
const texto = (v, limite) => String(v ?? "").slice(0, limite).trim();
let contador = 0;
const novoId = (agora) => `${agora.toString(36)}${(contador++).toString(36)}`;

export function novaCampanha({ nome, jogo, regras } = {}, agora = Date.now()) {
  return { id: novoId(agora), nome: texto(nome, 80) || b("Campanha sem nome", "Unnamed run"), jogo: texto(jogo, 60), regras: texto(regras, 4000), insignias: 0, criada: agora, capturas: [] };
}

export function registrar(campanha, { local, especie, apelido } = {}, agora = Date.now()) {
  const captura = { id: novoId(agora), local: texto(local, 80) || b("Lugar não anotado", "Place not noted"), especie: Number(especie), apelido: texto(apelido, 24), estado: "vivo", time: false, nota: "" };
  return { ...campanha, capturas: [...campanha.capturas, captura] };
}
const trocar = (campanha, id, fazer) => ({ ...campanha, capturas: campanha.capturas.map((c) => (c.id === id ? fazer(c) : c)) });

/* Quem cai sai do time. A nota diz onde ou como foi. */
export const marcarQueda = (campanha, id, nota = "") => trocar(campanha, id, (c) => ({ ...c, estado: "caiu", time: false, nota: texto(nota, 120) }));
export const reviver = (campanha, id) => trocar(campanha, id, (c) => ({ ...c, estado: "vivo" }));
export const anotar = (campanha, id, nota) => trocar(campanha, id, (c) => ({ ...c, nota: texto(nota, 120) }));
export const remover = (campanha, id) => ({ ...campanha, capturas: campanha.capturas.filter((c) => c.id !== id) });
export const comInsignias = (campanha, n) => ({ ...campanha, insignias: Math.min(INSIGNIAS, Math.max(0, Math.round(Number(n) || 0))) });

/* Põe no time ou tira dele. O time tem seis vagas e só aceita quem está vivo. */
export function alternarTime(campanha, id) {
  const alvo = campanha.capturas.find((c) => c.id === id);
  if (!alvo || alvo.estado !== "vivo") return { campanha, erro: b("Só quem está vivo entra no time.", "Only those still standing can join the team.") };
  if (!alvo.time && campanha.capturas.filter((c) => c.time).length >= VAGAS) return { campanha, erro: b("O time já tem seis. Tire um para pôr outro.", "The team already has six. Remove one to add another.") };
  return { campanha: trocar(campanha, id, (c) => ({ ...c, time: !c.time })), erro: null };
}

/* A captura que já existe da mesma família evolutiva, ou null. `familiaDe(id)` devolve o número da forma básica. */
export const repetida = (campanha, especie, familiaDe) => campanha.capturas.find((c) => familiaDe(c.especie) === familiaDe(Number(especie))) ?? null;
export const noLocal = (campanha, local) => campanha.capturas.filter((c) => c.local === local);

export const exportar = (campanhas) => JSON.stringify({ atlas: MARCA, versao: VERSAO, campanhas });

/* Lê o que foi exportado. Devolve { campanhas } já saneadas, ou { erro } sem mexer em nada. */
export function importar(conteudo) {
  let dados;
  try { dados = JSON.parse(conteudo); } catch { return { erro: b("Este arquivo não é um diário do PokéAtlas: não deu para ler o conteúdo.", "This file is not a PokéAtlas journal: its content could not be read.") }; }
  if (!dados || dados.atlas !== MARCA || !Array.isArray(dados.campanhas)) return { erro: b("Este arquivo não é um diário do PokéAtlas.", "This file is not a PokéAtlas journal.") };
  const campanhas = dados.campanhas.filter((c) => c && typeof c === "object" && Array.isArray(c.capturas)).map((c, i) => ({
    id: texto(c.id, 24) || `importada${i}`, nome: texto(c.nome, 80) || b("Campanha sem nome", "Unnamed run"), jogo: texto(c.jogo, 60), regras: texto(c.regras, 4000),
    insignias: Math.min(INSIGNIAS, Math.max(0, Math.round(Number(c.insignias) || 0))), criada: Number(c.criada) || 0,
    capturas: c.capturas.filter((x) => x && Number.isInteger(Number(x.especie)) && Number(x.especie) > 0).map((x, k) => ({
      id: texto(x.id, 24) || `c${i}-${k}`, local: texto(x.local, 80) || b("Lugar não anotado", "Place not noted"), especie: Number(x.especie), apelido: texto(x.apelido, 24),
      estado: x.estado === "caiu" ? "caiu" : "vivo", time: x.estado !== "caiu" && Boolean(x.time), nota: texto(x.nota, 120)
    }))
  }));
  if (!campanhas.length) return { erro: b("O arquivo não traz nenhuma campanha.", "The file has no runs in it.") };
  return { campanhas };
}

/* Junta o que foi importado ao que já existe: campanha com o mesmo id é substituída, as outras entram no fim. */
export function juntar(atuais, novas) {
  const ids = new Set(novas.map((c) => c.id));
  return [...atuais.filter((c) => !ids.has(c.id)), ...novas];
}
