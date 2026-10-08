/* Quiz diário: os dois enigmas, o que fica guardado, o fim de jogo e o navegador sem armazenamento. */
import { abrir, conferir, fechar, BASE } from "./_comum.mjs";
import { especiesParaONavegador } from "../../scripts/dados-navegador.mjs";
import { diaDoQuiz, alvoDoDia, TENTATIVAS } from "../../src/js/quiz-logica.js";

const L = especiesParaONavegador(), dia = diaDoQuiz(Date.now());
const alvo = (modo) => L[alvoDoDia(dia, modo, L.length)][2];
const errados = L.map((l) => l[2]).filter((n) => n !== alvo("ficha") && n !== alvo("gravura"));
const fotos = process.argv[2];

const { navegador, pagina, erros } = await abrir();
const palpitar = async (p, nome) => { await p.fill("#quiz-campo", nome); await p.click('.quiz-palpite button[type="submit"]'); };
await pagina.goto(`${BASE}/quiz/`, { waitUntil: "networkidle" });
await palpitar(pagina, errados[0]);
await palpitar(pagina, errados[40]);
conferir("cada palpite vira uma linha de sete pistas", await pagina.locator(".quiz-tabela tbody tr").count() === 2 && await pagina.locator(".quiz-tabela tbody tr:first-child .pista").count() === 7);
await palpitar(pagina, errados[0]);
conferir("palpite repetido é recusado com aviso", (await pagina.textContent("[data-aviso]")).includes("já foi") && await pagina.locator(".quiz-tabela tbody tr").count() === 2);
await palpitar(pagina, "xyzxyz");
conferir("nome que não existe pede para escolher da lista", (await pagina.textContent("[data-aviso]")).includes("lista"));
if (fotos) await pagina.screenshot({ path: `${fotos}/t3-ficha.png` });
await pagina.reload({ waitUntil: "networkidle" });
conferir("recarregar mantém os palpites do dia", await pagina.locator(".quiz-tabela tbody tr").count() === 2);
await palpitar(pagina, alvo("ficha"));
conferir("palpitar o Pokémon do dia encerra com vitória", (await pagina.textContent("[data-fim] h2")).includes(`Era ${alvo("ficha")}`) && await pagina.locator("[data-form]").isHidden());
conferir("a sequência começa em um dia", (await pagina.textContent("[data-sequencia]")).includes("1 dia"));
await pagina.click("[data-copiar]");
await pagina.waitForTimeout(1200);
conferir("o resultado é copiado ou aparece para copiar à mão", (await pagina.textContent("[data-copiar]")) === "Copiado" || await pagina.locator("[data-texto]").isVisible());

await pagina.click('[data-modo="gravura"]');
await pagina.waitForTimeout(500);
const tinta = () => pagina.evaluate(() => { const c = document.querySelector(".quiz-gravura canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 3; i < d.length; i += 4) s += d[i]; return s; });
const antes = await tinta();
if (fotos) await pagina.screenshot({ path: `${fotos}/t3-gravura.png` });
await palpitar(pagina, errados[3]);
await pagina.waitForTimeout(300);
conferir("a gravura começa com pouca tinta e ganha traço a cada erro", antes > 0 && await tinta() > antes * 1.2, `${antes} -> ${await tinta()}`);
for (let k = 1; k < TENTATIVAS.gravura; k++) await palpitar(pagina, errados[10 + k]);
conferir("esgotar as chances encerra dizendo quem era", (await pagina.textContent("[data-fim] h2")).includes(`era ${alvo("gravura")}`));
if (fotos) await pagina.screenshot({ path: `${fotos}/t3-fim.png` });

const sem = await abrir({ semArmazenamento: true });
await sem.pagina.goto(`${BASE}/quiz/`, { waitUntil: "networkidle" });
await palpitar(sem.pagina, errados[5]);
conferir("sem localStorage o quiz joga normalmente", await sem.pagina.locator(".quiz-tabela tbody tr").count() === 1 && sem.erros.length === 0, sem.erros.join(" | "));
await sem.navegador.close();

const cel = await abrir({ celular: true });
await cel.pagina.goto(`${BASE}/quiz/`, { waitUntil: "networkidle" });
await palpitar(cel.pagina, errados[7]);
conferir("no celular a tabela rola dentro da caixa, não a página", await cel.pagina.evaluate(() => document.documentElement.scrollWidth) === 390);
if (fotos) await cel.pagina.screenshot({ path: `${fotos}/t3-cel.png` });
await cel.navegador.close();

await pagina.goto(`${BASE}/pokedex/charizard/`, { waitUntil: "networkidle" });
await pagina.waitForSelector(".especie-prancha .gravada", { timeout: 6000 });
conferir("a página de espécie continua gravando a prancha", true);
await fechar(navegador, erros);
