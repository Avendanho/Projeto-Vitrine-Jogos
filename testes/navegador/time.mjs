/* Montador de time: montar, tirar, filtrar por jogo, endereço e endereço com lixo. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";
import { jogosParaONavegador } from "../../scripts/dados-navegador.mjs";

const fotos = process.argv[2];
const { navegador, pagina, erros } = await abrir();
const por = async (nome) => { await pagina.fill("#time-campo", nome); await pagina.click('.time-controles button[type="submit"]'); };
const nomes = () => pagina.$$eval(".time-vaga .dex-nome", (els) => els.map((e) => e.textContent));
await pagina.goto(`${BASE}/time/`, { waitUntil: "networkidle" });
conferir("abre vazio, com seis vagas e sem leitura do time", await pagina.locator(".time-vaga-vazia").count() === 6 && await pagina.locator(".time-grupo").count() === 0);
await por("Charizard"); await por("Moltres");
conferir("dois de Fogo e Voador abrem buraco para Pedra", (await pagina.textContent("[data-resumo]")).includes("Pedra"));
conferir("a vaga do Charizard mostra Pedra em quádruplo e Terrestre como imunidade", (await pagina.textContent('.time-vaga:first-child [data-fator="4"] dd')).trim() === "Pedra" && (await pagina.textContent('.time-vaga:first-child [data-fator="0"] dd')).trim() === "Terrestre");
conferir("a leitura do time conta quantos apanham de cada tipo", (await pagina.textContent(".time-grupo:nth-child(3)")).replace(/\s+/g, " ").includes("Pedra, 2 do time"));
await por("Charizard");
conferir("repetido é recusado", (await pagina.textContent("[data-aviso]")).includes("já está") && (await nomes()).length === 2);
await por("Blastoise"); await por("Venusaur"); await por("Pikachu"); await por("Snorlax"); await por("Mew");
conferir("o sétimo não entra", (await nomes()).length === 6 && (await pagina.textContent("[data-aviso]")).includes("seis"));
conferir("o endereço guarda o time", pagina.url().includes("t=charizard,moltres,blastoise,venusaur,pikachu,snorlax"), pagina.url());
if (fotos) await pagina.screenshot({ path: `${fotos}/t4.png`, fullPage: true });
await pagina.click('[data-tirar="146"]');
conferir("tirar libera a vaga", (await nomes()).length === 5 && !(await nomes()).includes("Moltres"));

// jogo: a lista de sugestões encolhe e quem não está na Pokédex dele é avisado
const jogo = jogosParaONavegador().find((j) => j.slug.includes("emerald")) ?? jogosParaONavegador()[0];
await pagina.selectOption('select[name="jogo"]', jogo.slug);
const sugestoes = await pagina.locator("#lista-time option").count();
conferir(`com ${jogo.nome} escolhido, as sugestões são as ${jogo.especies.length} espécies dele`, sugestoes === jogo.especies.length, String(sugestoes));
const fora = await pagina.locator(".time-fora").count();
const esperado = [6, 9, 3, 25, 143].filter((id) => !jogo.especies.includes(id)).length;
conferir("quem não está na Pokédex do jogo é marcado", fora === esperado, `${fora} de ${esperado}`);
conferir("o jogo vai para o endereço", pagina.url().includes(`jogo=${jogo.slug}`));
await pagina.reload({ waitUntil: "networkidle" });
conferir("recarregar pelo endereço devolve o time e o jogo", (await nomes()).length === 5 && await pagina.inputValue('select[name="jogo"]') === jogo.slug);
await pagina.goto(`${BASE}/time/?t=abc,99999,%3Cb%3E,pikachu&jogo=naoexiste`, { waitUntil: "networkidle" });
conferir("endereço com lixo fica só com o que existe", (await nomes()).join() === "Pikachu" && await pagina.inputValue('select[name="jogo"]') === "");

const cel = await abrir({ celular: true });
await cel.pagina.goto(`${BASE}/time/?t=charizard,blastoise,venusaur,pikachu,snorlax,mew`, { waitUntil: "networkidle" });
conferir("no celular as vagas e os selos cabem na largura da tela", await cel.pagina.evaluate(() => document.documentElement.scrollWidth) === 390);
if (fotos) await cel.pagina.screenshot({ path: `${fotos}/t4-cel.png` });
await cel.navegador.close();
await fechar(navegador, erros);
