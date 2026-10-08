/* O que a moldura, a página inicial e a bússola dizem, em português e em inglês. São as únicas páginas com
 * as duas línguas; o resto do atlas é só em português. As traduções do conteúdo (jogos, regiões, perguntas)
 * estão em dados/en.mjs; aqui ficam as frases da interface. */
import { EIXOS_EN, CONSOLES_EN, JOGOS_EN, REGIOES_EN, PEDIDOS_EN, PERGUNTAS_EN } from "../dados/en.mjs";
import { extenso, numero } from "./base.mjs";

const UNIDADES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const DEZENAS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
/* Um número de 0 a 99 por extenso, em inglês. */
export const emIngles = (n) => (n < 20 ? UNIDADES[n] : DEZENAS[Math.floor(n / 10)] + (n % 10 ? `-${UNIDADES[n % 10]}` : ""));
const eEmIngles = (t) => t.replace(/ e /g, " and ");   // "Red, Blue e Yellow": os nomes dos jogos já são os originais

export const LINGUAS = {
  "pt-BR": {
    codigo: "pt-BR", og: "pt_BR", inicio: "/", bussola: "/bussola/",
    extenso, numero,
    eixo: (e) => e.nome,
    jogo: (j) => j,
    regiao: (r) => r,
    pedido: (p) => p,
    console: (c) => c.nome, e: "e",
    cromo: {
      pular: "Pular para o conteúdo", edicoes: "Edição do atlas", buscar: "Buscar", som: "Som: desligado", somTitulo: "Música e sons do atlas",
      menu: "Menu", secoes: "Seções", buscarNoAtlas: "Buscar no atlas", musicaESons: "Música e sons", rodape: "Rodapé"
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
      voltar: "Voltar uma pergunta", perfil: "O seu perfil, que cresce a cada resposta",
      legenda: "O seu perfil ainda está em branco. Cada resposta puxa um vértice.",
      resultado: "Os jogos com o seu perfil", refazer: "Refazer a bússola", copiar: "Copiar o link deste resultado"
    }
  },
  en: {
    codigo: "en", og: "en_US", inicio: "/en/", bussola: "/en/compass/",
    extenso: emIngles, numero: (n) => n.toLocaleString("en-US"),
    eixo: (e) => EIXOS_EN[e.id],
    jogo: (j) => ({ ...j, titulo: eEmIngles(j.titulo), curto: eEmIngles(j.curto), chamada: JOGOS_EN[j.slug].chamada, notas: JOGOS_EN[j.slug].notas }),
    regiao: (r) => ({ ...r, ...REGIOES_EN[r.id] }),
    pedido: (p, id) => ({ ...p, ...PEDIDOS_EN[id] }),
    console: (c) => CONSOLES_EN[c.id] ?? c.nome, e: "and",
    cromo: {
      pular: "Skip to content", edicoes: "Edition of the atlas", buscar: "Search", som: "Sound: off", somTitulo: "Music and sounds of the atlas",
      menu: "Menu", secoes: "Sections", buscarNoAtlas: "Search the atlas", musicaESons: "Music and sounds", rodape: "Footer"
    },
    prancha: { arte: (nome) => `Official art of ${nome}`, numero: "No." },
    /* A moldura das páginas em inglês: as abas levam às seções em português, e o rodapé avisa disso. */
    edicao: {
      nome: "Pokémon", inicio: "/en/", sufixo: "PokéAtlas",
      lema: "A guide to find out which Pokémon game suits you. Only this page and the compass are in English so far; the other sections are in Portuguese.",
      acao: { href: "/en/compass/", texto: "Open the compass" },
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
    },
    inicio_: {
      titulo: "PokéAtlas — find out which Pokémon game suits you",
      descricao: "A visual atlas of the Pokémon games. Explore the regions and the Pokédex, compare titles and use the compass to find the game that has your profile.",
      lema: "Every Pokémon game has a profile. One of them is yours.",
      naTela: (ligacao) => `On screen now, ${ligacao}.`,
      vertices: "Six vertices, six qualities. The farther from the center, the higher the score.",
      teclas: "Put another profile on screen", de: "of",
      cartas: (n) => `${n} maps, from Kanto to Paldea`,
      cartasTexto: "Each region has its map, its three first partners and the games set in it. Tap a map to open it with names and routes (in Portuguese).",
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
      semJs: 'The compass needs JavaScript to draw your profile. Meanwhile, the <a href="/linha-do-tempo/" hreflang="pt-BR">timeline</a> (in Portuguese) shows every game.',
      voltar: "Go back one question", perfil: "Your profile, which grows with each answer",
      legenda: "Your profile is still blank. Each answer pulls a vertex.",
      resultado: "The games with your profile", refazer: "Retake the compass", copiar: "Copy the link to this result"
    }
  }
};

export { PERGUNTAS_EN };
