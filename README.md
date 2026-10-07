# PokéAtlas

Um guia visual para descobrir qual jogo de Pokémon combina com você. Cada jogo
é desenhado como uma ilha: seis qualidades (exploração, liberdade, competitivo,
dificuldade, história, nostalgia) viram seis morros, e o formato da ilha mostra
onde o jogo é forte.

Projeto de fã, sem fins lucrativos e sem vínculo com Nintendo, Game Freak,
Creatures ou The Pokémon Company.

## O que tem no site

| Área | Endereço | O que faz |
|---|---|---|
| Início | `/` | A história em seis cenas, guiada pela rolagem |
| Bússola | `/bussola/` | Oito perguntas; o relevo do visitante se desenha a cada resposta e o resultado explica cada recomendação |
| Pokédex | `/pokedex/` e `/pokedex/<nome>/` | As 1.025 espécies em gravura, com busca e filtro por geração e tipo; cada uma tem página própria, com atributos, ficha, linha evolutiva, curiosidades e os jogos em que aparece |
| Jogo | `/jogos/<nome>/` | Página de cada título: relevo, ficha, para quem é, a carta de onde se passa, espécimes, Pokédex do jogo com busca e filtro por tipo, jogos parecidos |
| Regiões | `/regioes/` e `/regioes/<nome>/` | A carta de cada região, redesenhada a partir do mapa dos jogos, com cidades, marcos e rotas numeradas; a lista e a carta se destacam uma à outra |
| Linha do tempo | `/linha-do-tempo/` | De 1996 a 2027, com filtro por categoria. É também o índice de todos os jogos |
| Comparar | `/comparar/` | Dois ou três jogos sobrepostos, nota por nota |

## Rodar na sua máquina

Precisa só do Node 20 ou mais novo. O build não usa nenhuma dependência.

```bash
npm run dev        # gera dist/ e serve em http://localhost:4600
npm run build      # só gera dist/
```

Os scripts abaixo são opcionais e usam dependências de desenvolvimento
(`npm install`). Tudo o que eles geram já está no repositório; só é preciso
rodá-los para atualizar os dados.

```bash
npm run pokedex    # refaz dados/pokedex.json e dados/fichas.json a partir das tabelas da PokéAPI
npm run arte       # baixa e grava as pranchas grandes (mascotes e iniciais)
npm run arte:mini  # baixa a arte de todas as espécies: miniatura em gravura e a versão em cor
npm run cartas -- --ref <pasta>   # retraça as cartas das regiões (veja abaixo)
npm run verificar  # fotografa as páginas rolando (precisa do Google Chrome)
```

## Estrutura

```
dados/            o conteúdo: jogos, regiões e lugares das cartas, perguntas da bússola, espécies
dados/pokedex.json   nomes, tipos e listas regionais (gerado por scripts/pokedex.mjs)
dados/fichas.json    a ficha de cada espécie: atributos, medidas, evolução, formas (gerado por scripts/fichas.mjs)
dados/cartas.json    costa, relevo e rotas de cada região (gerado por scripts/cartas.mjs)
scripts/build.mjs            gera o site
scripts/base.mjs             cores, dados gerados e utilidades de texto, comuns a todos os modelos
scripts/paginas.mjs          modelos das páginas (início, jogo, regiões, linha do tempo, comparar, bússola)
scripts/paginas-pokedex.mjs  a Pokédex: a lista, a página de cada espécie e as curiosidades
scripts/carta.mjs            a carta de uma região como peça de página (rotas, lugares, a caixa)
scripts/cenario.mjs          desenhos em SVG (terreno das cartas, perfis, bússola, régua de anos)
scripts/                     e os que geram dados: arte.mjs, cartas.mjs, pokedex.mjs, fichas.mjs
src/estilo.css    toda a identidade visual
src/js/relevo.js  o gerador de ilhas, usado pelo build (SVG) e pelo navegador (canvas)
src/js/           um arquivo por página
src/arte/pokemon/ pranchas grandes, em cor e em gravura
src/arte/mini/    todas as espécies: miniatura em gravura e a arte em cor, da qual a página de cada espécie refaz a gravura grande
src/fontes/       Archivo e Alegreya
src/motor/        motor de rolagem da página inicial (não editar)
```

## Acrescentar ou corrigir um jogo

1. Edite `dados/jogos.mjs`. Cada jogo tem fatos (ano, console, região) e seis
   notas de 1 a 5, que são leitura editorial do atlas.
2. Se citar um Pokémon novo em `mascotes`, acrescente o número e o nome em
   `dados/especies.mjs` e rode `npm run arte`.
3. Rode `npm run build`. O build confere os dados e para com uma mensagem clara
   se algo estiver inconsistente (nota fora de 1 a 5, console desconhecido,
   espécie sem nome).

A ilha, a página do jogo, os filtros, a linha do tempo e os números da página
inicial se atualizam sozinhos a partir desse arquivo.

## A Pokédex

A lista e as 1.025 páginas de espécie saem de `dados/fichas.json` e
`dados/pokedex.json`. As **curiosidades** são calculadas em
`scripts/paginas-pokedex.mjs`, comparando cada espécie com as outras (tipos que
ninguém mais tem, atributos entre os maiores, tamanho, formas, nome em japonês),
sempre entre as formas padrão. Nenhuma é escrita à mão. A categoria, as
habilidades, os itens e a entrada oficial da Pokédex aparecem em inglês, como
nos jogos: a base pública não os traz em português.

A Pokédex de um jogo é ligada pelo campo `pokedex`, com o nome da lista na
PokéAPI (por exemplo `[["galar", "Galar"]]`). Jogo sem lista confiável leva
`semPokedex`, com uma frase explicando o motivo: o atlas não inventa elenco.

## Cartas das regiões

Todas as páginas mostram a carta com a mesma peça (`caixaCarta`, em
`scripts/carta.mjs`): a caixa tem sempre a proporção da própria carta, então
ela nunca é cortada; a página só decide a largura. As rotas e os lugares se
desenham quando a carta entra na tela.

Cada carta tem três partes:

- **O traçado** (`dados/cartas.json`): costa, faixas de altitude e, nos mapas
  antigos, o caminho de cada rota. É extraído por `scripts/cartas.mjs` de uma
  imagem de referência do mapa de cada região, separando terra e mar pela cor.
  As imagens de referência não ficam no repositório; para retraçar, baixe os
  mapas das regiões (kanto.png, johto.png, ... paldea.jpg) numa pasta e passe-a
  em `--ref`. Com `--conferir <pasta>` o script grava a referência com o
  traçado por cima, para conferir a olho.
- **Os lugares** (`MAPAS` em `dados/atlas.mjs`): cidades e marcos, marcados à
  mão em porcentagem do quadro. Para mover um nome que encavalou, troque o
  quarto valor do lugar (`d`, `e`, `c` ou `b`: direita, esquerda, cima, baixo).
- **As rotas** (`ROTAS` em `dados/atlas.mjs`): cada rota diz o número e os dois
  lugares que liga. Em Kanto, Johto, Hoenn e Sinnoh o caminho é calculado pelo
  script, que procura o trajeto mais curto pela faixa da rota no mapa de
  referência; depois de mexer nessas rotas, rode `npm run cartas` de novo. Em
  Unova, Kalos e Galar o caminho é marcado à mão (`pts`). O número de cada rota
  é posicionado no build, no ponto livre mais próximo do meio dela.

O relevo é interpretação do atlas, e a carta de Unova segue o mapa de Black 2 e
White 2. Rotas vizinhas que formam um só caminho aparecem juntas ("3–4").
Ramais e rotas isoladas ficaram de fora (por exemplo as Rotas 125 e 126 de
Hoenn, a 224 e a 227 de Sinnoh, a 10, a 17, a 18 e a 21 de Unova). Alola, Hisui
e Paldea não mostram rotas, e a página de cada uma explica por quê.

## Publicar

### GitHub

```bash
gh auth login
gh repo create pokeatlas --private --source=. --push
```

Use repositório **privado**: a pasta `src/motor/` contém o motor da skill Sites
Incríveis, cuja licença permite publicar os sites feitos com ela, mas não
redistribuir o motor em repositório público.

### Vercel

O `vercel.json` já define o build (`node scripts/build.mjs`) e a pasta de saída
(`dist`). Há dois caminhos:

- **Pelo painel:** em vercel.com/new, importe o repositório do GitHub e confirme.
  Não é preciso mudar nenhuma configuração. Cada `git push` publica de novo.
- **Pelo terminal:** `npx vercel` para uma prévia, `npx vercel --prod` para
  publicar.

## Créditos e avisos

- **Pokémon** e os nomes dos jogos pertencem aos seus donos. A arte dos Pokémon
  é a oficial, obtida do repositório público
  [PokeAPI/sprites](https://github.com/PokeAPI/sprites) e reimpressa em gravura
  por `scripts/arte.mjs`. Se os detentores dos direitos pedirem, remova
  `src/arte/` e as pranchas: o restante do site é arte própria.
- **Pokédex:** nomes, tipos e listas regionais vêm das tabelas públicas da
  [PokéAPI](https://github.com/PokeAPI/pokeapi). Nos jogos de Alola, Galar,
  Hisui e Paldea, as espécies com forma regional aparecem com a arte e os tipos
  dessa forma; nos demais, com a forma padrão.
- **Cartas das regiões:** redesenhos do atlas. A costa foi traçada sobre os
  mapas das regiões nos jogos; nenhuma imagem dos jogos é publicada.
- **Fontes:** Archivo e Alegreya, sob a SIL Open Font License (licenças em
  `src/fontes/`).
- **Motor de rolagem:** © Enzo Barbatto, Sparo Automações.
- **Notas dos jogos:** opinião editorial, não dado oficial.
