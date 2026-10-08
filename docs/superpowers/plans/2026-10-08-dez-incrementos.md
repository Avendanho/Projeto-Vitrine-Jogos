# Dez incrementos do PokéAtlas: plano de implementação

> **Para quem executa:** as tarefas são independentes e seguem a ordem abaixo. Cada uma termina com
> testes passando, verificação no navegador e um commit. Os passos usam caixas (`- [ ]`) para marcar o andamento.
> Execução combinada: nativa, nesta sessão, tarefa por tarefa.

**Objetivo:** dar ao visitante motivos para voltar e ferramentas que ele use de verdade, nas duas edições do atlas.

**Arquitetura:** o site continua estático. Cada incremento é uma página nova (ou uma seção de página existente)
gerada por `scripts/build.mjs`, com um módulo de navegador em `src/js/`. Toda regra que dá para testar sem
navegador fica num módulo puro `src/js/<nome>-logica.js`, que roda igual no Node e no navegador. O que o
visitante guarda (sequência do quiz, time, diário, lista de caçada) fica no `localStorage` dele.

**Pilha:** Node 20+ (build e testes com `node:test`), HTML/CSS/JS sem biblioteca, WebGL com desenhista de
software de reserva, `sharp` e `playwright-core` só em desenvolvimento.

**Origem:** não há documento de especificação separado. As dez ideias foram apresentadas e aprovadas na
conversa de 08/10/2026; o desenho de cada uma está na própria tarefa.

## Restrições que valem para todas as tarefas

- O build do Vercel roda sem instalar dependências: `scripts/build.mjs` e o que ele importa não podem usar `sharp` nem `playwright-core`.
- Nenhum número, fato ou regra escrito de memória. Dado novo vem de fonte baixada (PokéAPI, arquivos do Cobblemon 1.8.1) e fica em `dados/`.
- Texto em português do Brasil, no tom do site. Sem setinha de "role para baixo".
- Movimento reduzido: tudo aparece pronto e parado.
- Sem JavaScript, a página continua legível e diz o que precisa de JavaScript.
- `localStorage` sempre dentro de `try/catch`; sem ele a ferramenta funciona durante a visita.
- O que não existe no Cobblemon 1.8.1 não entra.
- README do usuário: só acréscimos pontuais, no formato dele.
- Cada tarefa: `npm test`, `node scripts/build.mjs`, teste de navegador da tarefa, commit com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Pontos de atenção na revisão

1. **Chrome sem WebGL** (é o caso do dono do projeto): o Pokémon em 3D tem de girar pelo desenhista de software. Teste na Tarefa 9.
2. **Navegador sem `localStorage`** (aba anônima restrita): quiz, time, diário e caçada não podem quebrar. Teste de navegador em cada uma.
3. **Endereço compartilhado com lixo** (`?t=abc,99999`, `?a=naoexiste`): a página ignora o que não reconhece e abre vazia. Teste de unidade nas Tarefas 2, 4 e 6.
4. **Virada do dia no quiz**: quem abre às 23h59 e palpita à 0h01 continua no enigma que abriu. Teste de unidade na Tarefa 3.
5. **Diário importado de arquivo estragado**: recusa com mensagem, sem apagar o que já existe. Teste de unidade na Tarefa 5.

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `testes/*.test.mjs` | Testes de unidade dos módulos `-logica.js` (`npm test`) |
| `testes/navegador/*.mjs` | Roteiros de navegador por incremento (precisam de `npm run dev` na porta 4600) |
| `scripts/baixar-mod.mjs` | Baixa do GitLab as pastas do Cobblemon 1.8.1 para `.mod/` (fora do Git) |
| `scripts/tipos.mjs` → `dados/tipos.json` | Tabela de efetividade dos 18 tipos, da PokéAPI |
| `scripts/paginas-ferramentas.mjs` | Páginas novas da edição Pokémon: quiz, time, comparar Pokémon, diário |
| `scripts/paginas-cobblemon.mjs` | Recebe caçada, "deixado por", receitas em grade, botões de 3D e shiny |
| `scripts/dados-navegador.mjs` | Gera os módulos de dados que o navegador importa (`js/dados/*.js`) |
| `src/js/visor.js` | Núcleo do visor 3D: giro, zoom, tela cheia, troca de desenhista (sai de `maquete.js`) |
| `src/js/modelo-malha.js`, `src/js/modelo-desenho.js` | Geometria e desenho com textura dos modelos do mod, para Node e navegador |

## Ordem e dependências

`0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10`. As Tarefas 2, 3 e 4 usam o módulo de dados criado na 2.
A 9 usa o visor criado na 8. A 7 e a 8 precisam de `.mod/` (Tarefa 0). A 10 vem por último porque indexa tudo.

---

### Tarefa 0: base (endereço novo, testes, download do mod)

**Arquivos:** modificar `README.md`, `package.json`, `.gitignore`; criar `scripts/baixar-mod.mjs`, `testes/base.test.mjs`.

- [ ] Trocar `pokeatlas-swart.vercel.app` por `pokeatlas-eight.vercel.app` nas três ocorrências do README.
- [ ] `package.json`: `"test": "node --test testes/*.test.mjs"`, `"mod": "node scripts/baixar-mod.mjs"`.
- [ ] `scripts/baixar-mod.mjs`: baixa `archive.zip?sha=1.8.1&path=<pasta>` de `gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/` para cada pasta (`assets/cobblemon/{bedrock/pokemon,textures/pokemon,textures/item,textures/block,models,blockstates}` e `data/cobblemon/{recipe,structure,worldgen}`), descompacta em `.mod/` e imprime quantos arquivos vieram. `.mod/` entra no `.gitignore`.
- [ ] `testes/base.test.mjs`: importa `scripts/base.mjs` e confere que `COBBLEMON.itens.length === 490`, `COBBLEMON.estruturas.length === 65` e que todo item tem arte.
- [ ] Rodar `npm test` (passa), `npm run mod` (termina sem erro), build. Commit.

### Tarefa 1: quem deixa cair o quê (ideia 7)

**Arquivos:** modificar `scripts/paginas-cobblemon.mjs` (página de itens), `src/js/cobblemon-itens.js`, `src/estilo.css`; criar `testes/navegador/drops.mjs`.

**Desenho:** no build, inverter `especie.drops` (`[nome do item, quanto]`) em `nome do item → [espécies]`. Cada item do mod com quem o deixa cair ganha a linha "Deixado por" com até 10 slots e "e mais N". Uma seção nova no fim, "Itens do Minecraft que os Pokémon deixam cair", lista os que não são do mod. A busca passa a achar pelo nome da espécie (`data-busca` recebe os nomes).

- [ ] Função `quemDeixa()` em `paginas-cobblemon.mjs` devolvendo `Map<string, number[]>`; teste em `testes/base.test.mjs`: "Pó de Blaze" inclui o 6 (Charizard).
- [ ] Marcação e estilo; build.
- [ ] `testes/navegador/drops.mjs`: buscar "charizard" na página de itens deixa visíveis só itens que ele deixa cair; a contagem bate com `drops` do dado.
- [ ] Commit.

### Tarefa 2: comparar dois Pokémon (ideia 3) e o módulo de dados das espécies

**Arquivos:** criar `scripts/dados-navegador.mjs`, `scripts/paginas-ferramentas.mjs`, `src/js/comparar-pokemon.js`, `src/js/especies-logica.js`, `testes/especies.test.mjs`, `testes/navegador/comparar-pokemon.mjs`; modificar `scripts/build.mjs`, `scripts/paginas.mjs` (link em `/comparar/`), `src/estilo.css`.

**Interfaces:**
- Produz `js/dados/especies.js`: `export const ESPECIES = [[id, slug, nome, [tipos], [6 atributos], altura, peso, geracao, cor, estagio, familia], ...]`. `estagio` é 1, 2 ou 3, contado seguindo `de`; `familia` é o id da forma básica.
- Produz `src/js/especies-logica.js`: `porSlug(lista, slug)`, `procurarEspecie(lista, texto)` (sem acento, aceita número), `lerLista(parametro, lista, limite)` (ignora o que não reconhece).

**Desenho:** página `/comparar/pokemon/?a=charizard&b=blastoise`. Dois campos de busca, as duas gravuras, os seis atributos em barras espelhadas (a maior de cada linha em destaque), total, tipos, altura e peso. O estado fica no endereço.

- [ ] Testes: `lerLista("charizard,naoexiste,blastoise", L, 6)` devolve os dois válidos; `procurarEspecie(L, "6")` acha Charizard; `estagio` de Charizard é 3 e `familia` é 4.
- [ ] Implementar, build, roteiro de navegador (troca de espécie atualiza barras e endereço; endereço com lixo abre vazio).
- [ ] Commit.

### Tarefa 3: Quem é esse Pokémon? diário (ideia 1)

**Arquivos:** criar `src/js/quiz-logica.js`, `src/js/quiz.js`, `src/js/gravura.js` (o `gravar` sai de `especie.js` e ganha o parâmetro `forca`), `testes/quiz.test.mjs`, `testes/navegador/quiz.mjs`; modificar `scripts/paginas-ferramentas.mjs`, `scripts/paginas.mjs` (item "Quiz" no menu), `src/js/especie.js`, `src/estilo.css`.

**Interfaces de `quiz-logica.js`:**
- `diaDoQuiz(ms)`: número do dia no fuso de Brasília (`Math.floor((ms - 3 * 3600e3) / 864e5)`).
- `alvoDoDia(dia, modo, total)`: índice da espécie; permutação fixa por modo, sem repetir dentro de um ciclo de `total` dias.
- `comparar(palpite, alvo)`: uma pista por campo, `{ campo, estado: "certo" | "parcial" | "errado", seta: "mais" | "menos" | null }`, para tipo 1, tipo 2, geração, cor, estágio, altura e peso. Habitat fica de fora: a PokéAPI só tem para 386 espécies.
- `resultadoEmTexto(palpites, dia, modo)`: a grade para copiar, sem nomes.

**Desenho:** página `/quiz/` com dois enigmas por dia. "Ficha": cada palpite vira uma linha de pistas. "Gravura": a gravura do Pokémon do dia começa com `forca` 0,12 e ganha traço a cada erro, até seis tentativas. Palpites do dia e sequência ficam no navegador; o dia do enigma é fixado quando a página abre.

- [ ] Testes: `alvoDoDia` não repete em 1025 dias seguidos; `diaDoQuiz` muda às 3h UTC; `comparar` de Charmander contra Charizard dá tipo 1 certo, tipo 2 errado, geração certa, estágio errado com seta "mais"; tipo no lugar trocado dá "parcial".
- [ ] Implementar; conferir que a página de espécie continua gravando igual (roteiro `r6` de antes: `.gravada` aparece).
- [ ] Roteiro de navegador: palpitar o alvo (lido de `quiz-logica`) vence; recarregar mantém os palpites; com `localStorage` bloqueado a página joga normalmente.
- [ ] Commit.

### Tarefa 4: montador de time (ideia 2)

**Arquivos:** criar `scripts/tipos.mjs`, `dados/tipos.json`, `src/js/time-logica.js`, `src/js/time.js`, `testes/time.test.mjs`, `testes/navegador/time.mjs`; modificar `scripts/dados-navegador.mjs` (gera `js/dados/tipos.js` e `js/dados/jogos.js` com as espécies de cada jogo), `scripts/paginas-ferramentas.mjs`, `scripts/paginas.mjs` (item "Time"), `src/estilo.css`.

**Interfaces de `time-logica.js`:**
- `multiplicador(tabela, atacante, tiposDoDefensor)`: 0, 0,25, 0,5, 1, 2 ou 4.
- `analisar(tabela, time)`: `{ porTipo: [{ tipo, fracos, resistentes, imunes }], buracos: [tipo], cobertos: [tipo], semResposta: [tipo] }`. Buraco: três ou mais fracos e ninguém resiste. Coberto: algum tipo do time bate com vantagem.

**Desenho:** página `/time/?t=6,9,25&jogo=emerald`. Até seis espécies, com filtro opcional por jogo (só o que existe na Pokédex dele). Tabela com os 18 tipos atacantes nas colunas e o time nas linhas, resumo de fraquezas, buracos e tipos sem resposta. `scripts/tipos.mjs` baixa `pokeapi.co/api/v2/type/<nome>` dos 18 tipos e grava a matriz com os nomes em português.

- [ ] Rodar `node scripts/tipos.mjs`; teste confere fatos da tabela baixada: Água contra Fogo é 2, Elétrico contra Terrestre é 0, Gelo contra Dragão/Voador é 4.
- [ ] Testes de `analisar`: time só com Charizard tem Pedra como fraqueza 4×; time vazio devolve listas vazias.
- [ ] Implementar, roteiro de navegador (montar, filtrar por jogo, recarregar pelo endereço, endereço com lixo).
- [ ] Commit.

### Tarefa 5: diário de desafio (ideia 4)

**Arquivos:** criar `src/js/diario-logica.js`, `src/js/diario.js`, `testes/diario.test.mjs`, `testes/navegador/diario.mjs`; modificar `scripts/paginas-ferramentas.mjs`, `scripts/dados-navegador.mjs` (rotas de cada região em `js/dados/jogos.js`), `scripts/paginas-desafios.mjs` (botão "Acompanhar no diário" em cada desafio e na roleta), `src/estilo.css`.

**Interfaces de `diario-logica.js`:**
- `novaCampanha({ nome, jogo, regras })`, `registrar(campanha, { local, especie, apelido })`, `marcarQueda(campanha, idDaCaptura, nota)`, `repetida(campanha, especie, especies)` (mesma família já capturada), `exportar(campanhas)`, `importar(texto)` (devolve `{ campanhas }` ou `{ erro }`).

**Desenho:** página `/diario/`. Várias campanhas guardadas no navegador. Cada uma tem jogo, regras (texto livre, ou as do desafio de onde veio), a lista de rotas numeradas da região com a captura de cada uma (escolhida na Pokédex do jogo, com aviso de família repetida), o time, a caixa, os que caíram e um contador de insígnias ou provas de 0 a 8. Exporta e importa um arquivo `.json`, porque o que fica no navegador some se ele for limpo. O atlas não tem a tabela de encontros por rota: a página diz isso.

- [ ] Testes: registrar e derrubar; `repetida` acusa Charmeleon depois de Charmander; `importar("lixo")` devolve `{ erro }`; exportar e importar devolve o mesmo conteúdo.
- [ ] Implementar, roteiro de navegador (criar, registrar, derrubar, recarregar, exportar, importar arquivo estragado sem perder nada, vir de um desafio com as regras preenchidas).
- [ ] Commit.

### Tarefa 6: plano de caçada (ideia 6)

**Arquivos:** criar `src/js/cacada-logica.js`, `src/js/cacada.js`, `testes/cacada.test.mjs`, `testes/navegador/cacada.mjs`; modificar `scripts/dados-navegador.mjs` (gera `js/dados/spawns.js`, com os biomas numa tabela para não repetir nomes), `scripts/paginas-cobblemon.mjs` (página `/cobblemon/cacada/` e botão "Pôr na caçada" na página da espécie), `scripts/paginas.mjs` (item "Caçada"), `src/estilo.css`.

**Interface:** `planejar(alvos, spawns)` devolve os lugares em ordem: `[{ bioma, acha: [{ n, raridade, condicoes }], falta: [n] }]`, do que cobre mais alvos para o que cobre menos; no empate, vence a soma de raridade mais comum.

- [ ] Testes: com Wooper (194) e Charizard (6), o primeiro lugar de cada um aparece e nenhum lugar lista alvo que não nasce nele; alvo que não nasce no mundo aparece em `falta` de todos; lista vazia devolve `[]`.
- [ ] Implementar, roteiro de navegador (adicionar pela página da espécie, ver o plano, recarregar mantém, endereço com lixo).
- [ ] Commit.

### Tarefa 7: receitas em grade (ideia 9)

**Arquivos:** modificar `scripts/cobblemon.mjs` (a receita passa a guardar `grade` e `forma`), `dados/cobblemon.json`, `scripts/itens-arte.mjs` (silhueta dos ingredientes do Minecraft), `scripts/paginas-cobblemon.mjs`, `src/estilo.css`; criar `testes/navegador/receitas.mjs`.

**Desenho:** cada receita aparece como a bancada do jogo: grade 3×3 de slots, seta e o resultado com a quantidade. Ingrediente do mod usa o ícone dele. Ingrediente do Minecraft aparece em **silhueta de tinta de mapa** (forma do ícone, cor média), não com a textura do jogo, pelo mesmo motivo das maquetes. Receita sem forma mostra os ingredientes em fila. Etiqueta de grupo (`#cobblemon:apricorns`) mostra um representante e o nome do grupo. O texto "Feito com…" continua, para leitor de tela e busca.

- [ ] Antes de escrever: contar em `.mod/` quantas das 204 receitas têm forma, quantas não, e quantos ingredientes distintos do Minecraft aparecem. Se a contagem mostrar algo fora do desenho acima, avisar o dono do projeto antes de seguir.
- [ ] Teste em `testes/base.test.mjs`: toda receita com `grade` tem no máximo 3×3 e todo ingrediente tem ícone ou silhueta.
- [ ] Implementar, roteiro de navegador (a Poké Bola mostra a grade; largura no celular não estoura).
- [ ] Commit.

### Tarefa 8: visor 3D comum e Pokémon giratório (ideia 5)

**Arquivos:** criar `src/js/visor.js`, `src/js/modelo-malha.js`, `src/js/modelo-desenho.js`, `src/js/modelo3d.js`, `testes/modelo.test.mjs`, `testes/navegador/modelo3d.mjs`; modificar `src/js/maquete.js` (passa a usar o visor), `scripts/modelos.mjs` (importa geometria e desenho dos módulos novos e grava `src/modelos3d/<n>.json` + `<n>.png`), `scripts/build.mjs` (copia `src/modelos3d`), `vercel.json` (cache), `scripts/paginas-cobblemon.mjs` (botão "Girar em 3D" no retrato), `src/estilo.css`.

**Interfaces:**
- `visor.js`: `criarVisor(figura, criarDesenhistas)`, onde `criarDesenhistas(tela, semWebgl)` devolve `{ desenhar(guinada, inclina, zoom, dx, dy), soltar() }` ou `null`. O visor cuida de giro, zoom, tela cheia, teclado, uma maquete viva por vez e troca para software se o WebGL cair.
- `modelo-malha.js`: `facesDoModelo(modelo)` devolve faces com `pontos`, `normal`, `uvs`, já na pose; `modelo` é `{ t: [larguraDaTextura, altura], m: [matrizes de 12 números], c: [cubos] }`.
- `modelo-desenho.js`: `desenharModelo(faces, texturas, lado, vista)` devolve `Uint8ClampedArray` RGBA. É o mesmo código que hoje vive em `scripts/modelos.mjs`.

**Desenho:** no retrato da espécie, "Girar em 3D" troca a imagem pelo modelo do mod com a textura dele, com os mesmos controles das maquetes. WebGL com textura sem suavização; sem WebGL, o desenhista de software. O arquivo de cada espécie leva os cubos e as matrizes da pose, não os triângulos, para caber: orçamento de 30 MB para as 888. Se a medição passar disso, trocar para arquivo binário antes de continuar.

- [ ] Refatorar `maquete.js` sobre `visor.js` sem mudar comportamento; rodar os roteiros de maquete (giro, zoom, tela cheia, sem WebGL).
- [ ] Mover geometria e desenho para os módulos comuns; teste: as imagens de 1, 6, 25, 94, 577 geradas depois da mudança são idênticas, byte a byte, às que estão no repositório.
- [ ] Exportar os 888 modelos; medir o tamanho; teste: `facesDoModelo` do arquivo exportado do Charizard dá o mesmo número de faces que o gerador.
- [ ] Página, estilo e roteiro de navegador: com WebGL e com WebGL negado, o modelo entra, gira e aproxima; Solosis mostra o miolo através da gelatina.
- [ ] Commit.

### Tarefa 9: versão shiny (ideia 8)

**Arquivos:** modificar `scripts/modelos.mjs` (grava `src/modelos3d/<n>-shiny.png` quando o mod tem a variação), `dados/modelos.json` (passa a dizer quem tem shiny), `scripts/paginas-cobblemon.mjs`, `src/js/modelo3d.js`, `src/estilo.css`; criar `testes/navegador/shiny.mjs`.

**Desenho (mudou em relação à proposta):** o botão "Shiny" troca a textura do modelo 3D, ligando o visor se ele estiver parado. Assim não é preciso guardar 888 imagens paradas a mais: entram só as texturas, cerca de 5 MB em vez de 18. Sem JavaScript o botão não aparece.

- [ ] Teste em `testes/base.test.mjs`: toda espécie marcada com shiny tem o arquivo de textura.
- [ ] Implementar, roteiro de navegador (ligar e desligar o shiny muda a imagem; funciona sem WebGL).
- [ ] Commit.

### Tarefa 10: busca global (ideia 10)

**Arquivos:** criar `src/js/busca-logica.js`, `src/js/busca.js`, `testes/busca.test.mjs`, `testes/navegador/busca.mjs`; modificar `scripts/dados-navegador.mjs` (gera `js/dados/busca.js`), `scripts/paginas.mjs` (botão "Buscar" no cabeçalho das duas edições), `src/js/base.js`, `src/estilo.css`.

**Interface:** `procurar(indice, texto, edicao, limite = 24)` devolve entradas `[tipo, nome, endereco, edicao]` em ordem: nome que começa pelo texto, depois palavra que começa, depois trecho; no empate, primeiro a edição em que a pessoa está. Sem acento e sem diferença de maiúscula.

**Desenho:** botão "Buscar" no cabeçalho e os atalhos `/` e Ctrl+K abrem um `<dialog>` com um campo e os resultados agrupados (jogos, regiões, Pokémon, desafios, ferramentas e, do Cobblemon, Pokémon, itens, estruturas e biomas). Setas escolhem, Enter abre. O índice só é baixado na primeira abertura.

- [ ] Testes: "char" traz Charizard antes de "Bola Charme"; "agua" acha "Água"; texto vazio devolve `[]`; na edição Cobblemon, "wooper" traz primeiro a página do Cobblemon.
- [ ] Implementar, roteiro de navegador (abrir por atalho e por botão, navegar por teclado, fechar com Esc, celular).
- [ ] Atualizar `scripts/verificar-paginas.mjs` com as páginas novas, rodar `npm run verificar`, atualizar BRIEF e README. Commit.

---

## Publicação

O site está no ar em `https://pokeatlas-eight.vercel.app` e cada push em `main` gera um deploy novo. Nenhuma
variável de ambiente ou configuração a mais é necessária: `vercel.json` já define build, pasta de saída,
redirecionamentos e cache. A Tarefa 8 acrescenta a pasta `modelos3d` ao cache longo.
