/* Os módulos de dados que o navegador importa, gerados no build em dist/js/dados/.
 * Cada função devolve o texto de um módulo. As páginas só baixam o que usam. */
import { FICHAS, POKEDEX } from "./base.mjs";

const cabecalho = "/* Gerado por scripts/build.mjs a partir de dados/. Não edite à mão. */\n";

/* Uma linha por espécie: [id, slug, nome, tipos, atributos, altura, peso, geração, cor, estágio, família].
 * Estágio é a posição na linha evolutiva (1 a 3) e família é o número da forma básica. */
export function especiesParaONavegador() {
  const raiz = (id) => { let atual = id, passos = 1; while (FICHAS[atual].de) { atual = FICHAS[atual].de; passos++; } return [atual, Math.min(passos, 3)]; };
  return Object.keys(FICHAS).map(Number).sort((a, b) => a - b).map((id) => {
    const f = FICHAS[id], [familia, estagio] = raiz(id);
    return [id, f.slug, f.nome, POKEDEX.especies[id][1], f.atributos, f.altura, f.peso, f.geracao, f.cor, estagio, familia];
  });
}
export const moduloEspecies = () => `${cabecalho}export const ESPECIES = ${JSON.stringify(especiesParaONavegador())};\n`;
