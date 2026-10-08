/* O que a moldura, a página inicial e a bússola dizem, em português e em inglês. São as únicas páginas com
 * as duas línguas; o resto do atlas é só em português. As traduções do conteúdo (jogos, regiões, perguntas)
 * estão em dados/en.mjs; aqui ficam as frases da interface. */
import { EIXOS_EN, CONSOLES_EN, JOGOS_EN, FICHAS_EN, REGIOES_EN, PEDIDOS_EN, PERGUNTAS_EN, ESTILOS_EN, CATEGORIAS_EN, TIPOS_EN, LISTAS_EN } from "../dados/en.mjs";
import { extenso, numero } from "./base.mjs";
import { emIngles } from "./lingua.mjs";

export { emIngles };
const eEmIngles = (t) => t.replace(/ e /g, " and ");   // "Red, Blue e Yellow": os nomes dos jogos já são os originais

export const LINGUAS = {
  "pt-BR": {
    codigo: "pt-BR", og: "pt_BR", inicio: "/", bussola: "/bussola/", jogos: "/jogos/",
    estilo: (e) => e.nome, categoria: (c) => c.nome, tipo: (t) => t, lista: (rotulo) => rotulo,
    jogo_: {
      todos: "Todos os jogos",
      ficha: { lancamento: "Lançamento", console: "Console", regiao: "Região", cenario: "Cenário", geracao: "Geração", estilo: "Estilo", categoria: "Categoria" },
      hexAlt: (jogo, notas) => `Hexágono de atributos de ${jogo}. Notas: ${notas}.`,
      leitura: "Leitura do perfil", notas: "Notas de 1 a 5, na avaliação do atlas.", nota: ["nota ", " de 5"], media: "fica na média dos jogos do atlas",
      paraVoce: "É para você, se", talvezNao: "Talvez não seja, se",
      onde: "Onde se passa", abrirCarta: (lugar) => `Abrir a carta de ${lugar}`,
      especimes: "Espécimes deste jogo", parecidos: "Jogos de perfil parecido", compararOsDois: "Comparar os dois",
      ordem: "Ordem de lançamento", antes: "Lançado antes", depois: "Lançado depois",
      descricao: (chamada, jogo) => `${chamada} Veja para quem é ${jogo}, o perfil do jogo e títulos parecidos.`,
      pokedex: "Pokédex", elenco: "Elenco de Pokémon", pokedexDe: (lista) => `Pokédex de ${lista}`,
      formaNativa: "Quando a espécie tem uma forma regional nativa deste jogo, é ela que aparece, com os tipos dela. ",
      formaPadrao: "A arte e os tipos são os da forma padrão de cada espécie. ",
      escolha: "Escolha uma espécie para abrir a página dela.",
      lista: "Lista", procurar: "Procurar nesta lista", nomeOuNumero: "Nome ou número", tipo: "Tipo",
      especie: "espécie", especies: "espécies", mostrarTodas: "Mostrar todas", mostrar: "Mostrar as {n} espécies",
      vazio: "Nenhuma espécie com esse nome ou tipo nesta lista.", formaDe: (regiao) => `forma de ${regiao}`
    },
    extenso, numero,
    eixo: (e) => e.nome,
    jogo: (j) => j,
    regiao: (r) => r,
    pedido: (p) => p,
    console: (c) => c.nome, e: "e",
    cromo: {
      pular: "Pular para o conteúdo", edicoes: "Edição do atlas", buscar: "Buscar", som: "Som: desligado", somTitulo: "Música e sons do atlas",
      menu: "Menu", secoes: "Seções", buscarNoAtlas: "Buscar no atlas", musicaESons: "Música e sons", rodape: "Rodapé",
      direcional: "Direcional", alto: "Voltar ao alto da página", acaso: "Abrir um Pokémon ao acaso", anterior: (secao) => `Seção anterior: ${secao}`, proxima: (secao) => `Próxima seção: ${secao}`
    },
    prancha: { arte: (nome) => `Arte oficial de ${nome}`, numero: "Nº" },
    inicio_: {
      titulo: "PokéAtlas — descubra qual jogo de Pokémon combina com você",
      descricao: "Um atlas visual dos jogos de Pokémon. Explore as regiões e a Pokédex, compare títulos e use a bússola para encontrar o jogo que tem o seu perfil.",
      lema: "Todo jogo de Pokémon tem um perfil. Um deles é o seu.",
      naTela: (ligacao) => `Na tela agora, ${ligacao}.`,
      vertices: "Seis vértices, seis qualidades. Quanto mais longe do centro, mais alta a nota.",
      teclas: "Pôr outro perfil na tela", de: "de",
      cartas: (n) => `${n} cartas, de Kanto a Paldea`,
      cartasTexto: "Cada região tem a sua carta, três primeiros companheiros e os jogos que se passam nela. Toque numa carta para abri-la com os nomes e as rotas.",
      geracao: "Geração", abrirCarta: (nome) => `Abrir a carta de ${nome}`,
      anos: (n) => `${n} anos de estrada`,
      anosTexto: "De um cartucho cinza de 1996 a mundos abertos para quatro pessoas. Cada ponto da régua é um jogo deste atlas, e nenhum se joga do mesmo jeito.",
      verLinha: "Ver a linha do tempo",
      contas: ["anos desde Red e Green", "gerações lançadas", "regiões mapeadas", "jogos neste atlas"],
      chaveCheia: "Série principal, remakes e Legends", chaveVazada: "Derivados",
      pico: (n) => `${n} jogos, um hexágono`,
      picoAbre: "Cada pedido puxa um vértice. Acendem os jogos que vão longe naquela direção, e o hexágono mostra o que o atlas escolheria.",
      picoResposta: (eixo, ligacao) => `O vértice mais distante em ${eixo.toLowerCase()} é o de ${ligacao}.`,
      picoFinal: "E você, o que procura?", abrirBussola: "Abrir a bússola",
      mosaico: "Algumas espécies da Pokédex",
      pokedex: "A Pokédex inteira, em gravura",
      pokedexTexto: (n) => `São ${n} espécies. Cada uma tem a sua página, com atributos, linha evolutiva, curiosidades e os jogos em que aparece.`,
      procurar: "Procurar um Pokémon", abrirPokedex: "Abrir a Pokédex",
      sobrepor: "Na dúvida entre dois, sobreponha",
      sobreporTexto: "Dois perfis, duas cores. Onde os contornos coincidem, os jogos se parecem. Onde um avança sozinho, está a diferença.",
      comparar: "Comparar dois jogos",
      fecho: (n) => `Um destes ${n} jogos tem o seu perfil.`,
      fechoTexto: (n) => `${n} perguntas. O hexágono se desenha enquanto você responde.`
    },
    bussola_: {
      titulo: "Bússola", h1: "Bússola",
      descricao: (n) => `${n} perguntas para descobrir qual jogo de Pokémon combina com você, com a explicação de cada recomendação.`,
      passo: (total) => `Pergunta 1 de ${total}`,
      semJs: 'A bússola precisa de JavaScript para desenhar o seu perfil. Enquanto isso, a <a href="/linha-do-tempo/">linha do tempo</a> mostra todos os jogos.',
      voltar: "Voltar uma pergunta", desenhar: "Prefere desenhar o perfil à mão?", perfil: "O seu perfil, que cresce a cada resposta",
      legenda: "O seu perfil ainda está em branco. Cada resposta puxa um vértice.",
      resultado: "Os jogos com o seu perfil", refazer: "Refazer a bússola", copiar: "Copiar o link deste resultado"
    }
  },
  en: {
    codigo: "en", og: "en_US", inicio: "/en/", bussola: "/en/compass/", jogos: "/en/games/",
    estilo: (e) => ESTILOS_EN[e.id], categoria: (c) => CATEGORIAS_EN[c.id], tipo: (t) => TIPOS_EN[t], lista: (rotulo) => LISTAS_EN[rotulo] ?? rotulo,
    jogo_: {
      todos: "All games",
      ficha: { lancamento: "Release", console: "Console", regiao: "Region", cenario: "Setting", geracao: "Generation", estilo: "Style", categoria: "Category" },
      hexAlt: (jogo, notas) => `Attribute hexagon of ${jogo}. Scores: ${notas}.`,
      leitura: "Reading the profile", notas: "Scores from 1 to 5, in the atlas's own assessment.", nota: ["score ", " out of 5"], media: "sits at the average of the games in the atlas",
      paraVoce: "It is for you if you", talvezNao: "Maybe not, if",
      onde: "Where it takes place", abrirCarta: (lugar) => `Open the map of ${lugar}`,
      especimes: "Specimens from this game", parecidos: "Games with a similar profile", compararOsDois: "Compare the two",
      ordem: "Release order", antes: "Released before", depois: "Released after",
      descricao: (chamada, jogo) => `${chamada} See who ${jogo} is for, the game's profile and similar titles.`,
      pokedex: "Pokédex", elenco: "Pokémon roster", pokedexDe: (lista) => `${lista} Pokédex`,
      formaNativa: "When a species has a regional form native to this game, that is the one shown, with its types. ",
      formaPadrao: "The art and types are those of each species' standard form. ",
      escolha: "Pick a species to open its page.",
      lista: "List", procurar: "Search this list", nomeOuNumero: "Name or number", tipo: "Type",
      especie: "species", especies: "species", mostrarTodas: "Show all", mostrar: "Show all {n} species",
      vazio: "No species with that name or type in this list.", formaDe: (regiao) => `${regiao} form`
    },
    extenso: emIngles, numero: (n) => n.toLocaleString("en-US"),
    eixo: (e) => EIXOS_EN[e.id],
    jogo: (j) => ({ ...j, titulo: eEmIngles(j.titulo), curto: eEmIngles(j.curto), chamada: JOGOS_EN[j.slug].chamada, notas: JOGOS_EN[j.slug].notas, ...FICHAS_EN[j.slug] }),
    regiao: (r) => ({ ...r, ...REGIOES_EN[r.id] }),
    pedido: (p, id) => ({ ...p, ...PEDIDOS_EN[id] }),
    console: (c) => CONSOLES_EN[c.id] ?? c.nome, e: "and",
    cromo: {
      pular: "Skip to content", edicoes: "Edition of the atlas", buscar: "Search", som: "Sound: off", somTitulo: "Music and sounds of the atlas",
      menu: "Menu", secoes: "Sections", buscarNoAtlas: "Search the atlas", musicaESons: "Music and sounds", rodape: "Footer",
      direcional: "D-pad", alto: "Back to the top of the page", acaso: "Open a random Pokémon", anterior: (secao) => `Previous section: ${secao}`, proxima: (secao) => `Next section: ${secao}`
    },
    prancha: { arte: (nome) => `Official art of ${nome}`, numero: "No." },
    /* A moldura das páginas em inglês, por edição. Os endereços ficam em português e são trocados no fim. */
    edicoes: { pokemon: {
      sufixo: "PokéAtlas",
      lema: "A guide to find out which Pokémon game suits you.",
      acao: { href: "/bussola/", texto: "Open the compass" },
      nav: [
        { href: "/pokedex/", texto: "Pokédex" },
        { href: "/regioes/", texto: "Regions" },
        { href: "/linha-do-tempo/", texto: "Timeline" },
        { href: "/comparar/", texto: "Compare" },
        { href: "/desafios/", texto: "Challenges" },
        { href: "/time/", texto: "Team" }
      ],
      avisos: [
        "Fan project, non-profit and not affiliated with Nintendo, Game Freak, Creatures or The Pokémon Company. Pokémon and the names of the games belong to their owners.",
        "The scores of each game are the atlas's own editorial reading, not official data. The Pokémon art is the official one, taken from the public PokeAPI/sprites repository and reprinted as engravings; the Pokédex lists come from PokéAPI. The region maps are redrawn by the atlas over the maps from the games. The music and the key sounds are the atlas's own, made in the browser; the cries are those of the games, from the public PokeAPI/cries repository. Fonts: M PLUS Rounded 1c and DotGothic16."
      ]
    } },
    inicio_: {
      titulo: "PokéAtlas — find out which Pokémon game suits you",
      descricao: "A visual atlas of the Pokémon games. Explore the regions and the Pokédex, compare titles and use the compass to find the game that has your profile.",
      lema: "Every Pokémon game has a profile. One of them is yours.",
      naTela: (ligacao) => `On screen now, ${ligacao}.`,
      vertices: "Six vertices, six qualities. The farther from the center, the higher the score.",
      teclas: "Put another profile on screen", de: "of",
      cartas: (n) => `${n} maps, from Kanto to Paldea`,
      cartasTexto: "Each region has its map, its three first partners and the games set in it. Tap a map to open it with names and routes.",
      geracao: "Generation", abrirCarta: (nome) => `Open the map of ${nome}`,
      anos: (n) => `${n} years on the road`,
      anosTexto: "From a gray cartridge in 1996 to open worlds for four players. Each dot on the ruler is a game in this atlas, and no two play the same way.",
      verLinha: "See the timeline",
      contas: ["years since Red and Green", "generations released", "regions mapped", "games in this atlas"],
      chaveCheia: "Main series, remakes and Legends", chaveVazada: "Spin-offs",
      pico: (n) => `${n} games, one hexagon`,
      picoAbre: "Each request pulls a vertex. The games that go far in that direction light up, and the hexagon shows what the atlas would pick.",
      picoResposta: (eixo, ligacao) => `The farthest vertex in ${eixo.toLowerCase()} belongs to ${ligacao}.`,
      picoFinal: "And you, what are you looking for?", abrirBussola: "Open the compass",
      mosaico: "Some species from the Pokédex",
      pokedex: "The whole Pokédex, engraved",
      pokedexTexto: (n) => `${n} species. Each one has its own page, with stats, evolution line, trivia and the games it appears in.`,
      procurar: "Find a Pokémon", abrirPokedex: "Open the Pokédex",
      sobrepor: "Torn between two? Overlay them",
      sobreporTexto: "Two profiles, two colors. Where the outlines match, the games are alike. Where one pushes out alone, that is the difference.",
      comparar: "Compare two games",
      fecho: (n) => `One of these ${n} games has your profile.`,
      fechoTexto: (n) => `${n} questions. The hexagon draws itself as you answer.`
    },
    bussola_: {
      titulo: "Compass", h1: "Compass",
      descricao: (n) => `${n} questions to find out which Pokémon game suits you, with the reason behind each recommendation.`,
      passo: (total) => `Question 1 of ${total}`,
      semJs: 'The compass needs JavaScript to draw your profile. Meanwhile, the <a href="/linha-do-tempo/">timeline</a> shows every game.',
      voltar: "Go back one question", desenhar: "Rather draw the profile by hand?", perfil: "Your profile, which grows with each answer",
      legenda: "Your profile is still blank. Each answer pulls a vertex.",
      resultado: "The games with your profile", refazer: "Retake the compass", copiar: "Copy the link to this result"
    }
  }
};

export { PERGUNTAS_EN };
