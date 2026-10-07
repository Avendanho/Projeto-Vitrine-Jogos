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
| Biblioteca | `/biblioteca/` | Os 30 jogos, filtráveis por geração, região, console, estilo e perfil de jogador |
| Jogo | `/jogos/<nome>/` | Página de cada título: relevo, ficha, para quem é, espécimes, jogos parecidos |
| Linha do tempo | `/linha-do-tempo/` | De 1996 a 2027, com filtro por categoria |
| Comparar | `/comparar/` | Dois ou três jogos sobrepostos, nota por nota |

## Rodar na sua máquina

Precisa só do Node 20 ou mais novo. O build não usa nenhuma dependência.

```bash
npm run dev        # gera dist/ e serve em http://localhost:4600
npm run build      # só gera dist/
```

Dois scripts opcionais usam dependências de desenvolvimento (`npm install`):

```bash
npm run arte       # baixa e grava a arte dos Pokémon citados nos dados
npm run verificar  # fotografa todas as páginas rolando (precisa do Google Chrome)
```

## Estrutura

```
dados/            o conteúdo: jogos, regiões, perguntas da bússola, espécies
scripts/          build.mjs (gera o site), paginas.mjs (modelos), cenario.mjs (desenhos), arte.mjs, servir.mjs
src/estilo.css    toda a identidade visual
src/js/relevo.js  o gerador de ilhas, usado pelo build (SVG) e pelo navegador (canvas)
src/js/           um arquivo por página
src/arte/         arte dos Pokémon, em cor e em gravura
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
- **Fontes:** Archivo e Alegreya, sob a SIL Open Font License (licenças em
  `src/fontes/`).
- **Motor de rolagem:** © Enzo Barbatto, Sparo Automações.
- **Notas dos jogos:** opinião editorial, não dado oficial.
