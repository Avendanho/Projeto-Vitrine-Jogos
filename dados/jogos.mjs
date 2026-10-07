/* Catálogo do PokéAtlas.
 *
 * Fatos (título, ano do primeiro lançamento, console, região) são verificáveis.
 * "atributos" (1 a 5) e os textos são leitura editorial do atlas, não dado oficial.
 * Ordem dos atributos na rosa dos ventos: exploracao (N), liberdade (NE),
 * competitivo (SE), dificuldade (S), historia (SO), nostalgia (NO).
 */

function a(exploracao, liberdade, competitivo, dificuldade, historia, nostalgia) {
  return { exploracao, liberdade, competitivo, dificuldade, historia, nostalgia };
}

export const JOGOS = [
  {
    slug: "red-blue-yellow", pokedex: [["kanto", "Kanto"]], titulo: "Pokémon Red, Blue e Yellow", curto: "Red, Blue e Yellow",
    ano: 1996, plataformas: ["gb"], regiao: "kanto", geracao: 1, tipo: "principal", estilo: "rpg-classico",
    atributos: a(3, 2, 2, 3, 1, 5),
    chamada: "O começo de tudo: 151 espécies, oito ginásios e um rival sempre um passo à frente.",
    texto: [
      "É o molde de onde saiu a franquia inteira. Você escolhe um inicial, cruza Kanto de cidade em cidade, derrota oito líderes de ginásio e tenta completar a primeira Pokédex. Tudo em quatro tons, numa tela do tamanho de um selo.",
      "Jogar hoje é um exercício de arqueologia: a interface é dura, a mochila enche rápido e o equilíbrio entre os tipos tem furos famosos. Mas o ritmo é direto e o desenho do mapa continua exemplar. Yellow, de 1998, põe um Pikachu andando atrás de você."
    ],
    paraQuem: ["Quer ver de onde tudo veio", "Tem memória afetiva do Game Boy", "Gosta de jogos curtos e diretos"],
    naoSe: ["Interface antiga acaba com a sua paciência", "Você espera uma história elaborada"],
    notas: { nostalgia: "É a origem: cada tela virou referência para tudo o que veio depois." },
    mascotes: [6, 9, 25]
  },
  {
    slug: "gold-silver-crystal", pokedex: [["original-johto", "Johto"]], titulo: "Pokémon Gold, Silver e Crystal", curto: "Gold, Silver e Crystal",
    ano: 1999, plataformas: ["gbc"], regiao: "johto", geracao: 2, tipo: "principal", estilo: "rpg-classico",
    atributos: a(4, 3, 2, 3, 2, 5),
    chamada: "Duas regiões num cartucho só, com um relógio de verdade marcando dia e noite.",
    texto: [
      "Johto apresenta cem espécies novas, criação de Pokémon, itens que eles seguram e um relógio interno: há criaturas que só aparecem à noite e eventos que só acontecem em certos dias da semana. O mundo passa a ter rotina.",
      "Quando a Liga termina, o jogo abre Kanto inteira para uma segunda rodada de oito ginásios, até um último duelo no alto de uma montanha. Crystal, de 2000, acrescenta sprites animados e a opção de jogar com uma protagonista."
    ],
    paraQuem: ["Quer a sensação de um mundo que não acaba", "Valoriza pós-jogo generoso", "Lembra do Game Boy Color com carinho"],
    naoSe: ["Você prefere ritmo acelerado: os níveis sobem devagar", "Quer o conforto de uma interface moderna"],
    notas: {
      exploracao: "Dezesseis ginásios em duas regiões, com segredos presos ao relógio.",
      nostalgia: "Para muita gente, o ponto alto da era Game Boy."
    },
    mascotes: [250, 249, 245]
  },
  {
    slug: "ruby-sapphire-emerald", pokedex: [["hoenn", "Hoenn"]], titulo: "Pokémon Ruby, Sapphire e Emerald", curto: "Ruby, Sapphire e Emerald",
    ano: 2002, plataformas: ["gba"], regiao: "hoenn", geracao: 3, tipo: "principal", estilo: "rpg-classico",
    atributos: a(4, 2, 3, 3, 2, 4),
    chamada: "Um arquipélago tropical, batalhas em dupla e um mapa que continua debaixo d'água.",
    texto: [
      "Hoenn troca as planícies por selva, deserto, vulcão e muito mar. É aqui que surgem as batalhas em dupla, as habilidades e as naturezas: as peças que fazem do combate o que ele é até hoje.",
      "Com Surf e Dive, o mapa ganha uma camada submersa. Emerald, de 2004, junta as duas tramas e traz a Battle Frontier, um parque de desafios pós-jogo que continua sendo referência."
    ],
    paraQuem: ["Gosta de explorar por terra, por mar e pelo fundo do mar", "Quer entender as bases do competitivo", "Cresceu com o Game Boy Advance"],
    naoSe: ["Longos trechos de navegação te cansam", "Você busca um enredo com peso"],
    notas: {
      exploracao: "Rotas marítimas, cavernas submersas e bases secretas para montar.",
      nostalgia: "Os trompetes da trilha e as cores do Game Boy Advance."
    },
    mascotes: [383, 382, 384]
  },
  {
    slug: "firered-leafgreen", pokedex: [["kanto", "Kanto"]], titulo: "Pokémon FireRed e LeafGreen", curto: "FireRed e LeafGreen",
    ano: 2004, plataformas: ["gba"], regiao: "kanto", geracao: 3, tipo: "remake", estilo: "rpg-classico",
    atributos: a(3, 2, 2, 2, 1, 4),
    chamada: "A primeira viagem por Kanto, refeita com o conforto do Game Boy Advance.",
    texto: [
      "O roteiro é o de 1996, quase cena por cena, mas com as regras da terceira geração: habilidades, naturezas, mochila organizada e uma tela de ajuda para quem está chegando. É o jeito mais limpo de conhecer a história original.",
      "Depois da Liga, um arquipélago inédito, as Ilhas Sevii, estende a aventura e abre espaço para espécies de Johto."
    ],
    paraQuem: ["Quer Kanto sem as arestas de 1996", "Vai jogar Pokémon pela primeira vez num portátil clássico", "Gosta de pixel art colorida"],
    naoSe: ["Você já conhece Kanto de cor e quer novidade", "Procura desafio alto"],
    notas: { nostalgia: "Kanto como você lembra, não como ela realmente era." },
    mascotes: [6, 3]
  },
  {
    slug: "diamond-pearl-platinum", pokedex: [["extended-sinnoh", "Sinnoh"]], pokedexNota: "Lista de Platinum. Diamond e Pearl têm as 151 primeiras.", titulo: "Pokémon Diamond, Pearl e Platinum", curto: "Diamond, Pearl e Platinum",
    ano: 2006, plataformas: ["ds"], regiao: "sinnoh", geracao: 4, tipo: "principal", estilo: "rpg-classico",
    atributos: a(4, 2, 3, 4, 3, 4),
    chamada: "Mitos sobre a criação do mundo e uma campeã que não perdoa time mal montado.",
    texto: [
      "Sinnoh é fria, montanhosa e cheia de lendas sobre a origem do tempo e do espaço. A quarta geração passa a classificar cada golpe como físico ou especial, mudança que reorganizou o combate inteiro, e leva trocas e batalhas para a internet pela primeira vez.",
      "Platinum, de 2008, é a versão a procurar: ritmo mais rápido, mais espécies disponíveis, o Distortion World e uma Battle Frontier própria."
    ],
    paraQuem: ["Quer uma Liga que exige preparo", "Gosta de mitologia e de lendários com peso na trama", "Jogou no DS e quer rever o subsolo de Sinnoh"],
    naoSe: ["Ritmo lento incomoda, principalmente em Diamond e Pearl", "Você quer um jogo fácil"],
    notas: {
      exploracao: "O Monte Coronet no meio do mapa e um subsolo inteiro para escavar.",
      dificuldade: "A campeã Cynthia virou sinônimo de parede.",
      nostalgia: "O auge da era DS para quem começou por ali."
    },
    mascotes: [483, 484, 487]
  },
  {
    slug: "heartgold-soulsilver", pokedex: [["updated-johto", "Johto"]], titulo: "Pokémon HeartGold e SoulSilver", curto: "HeartGold e SoulSilver",
    ano: 2009, plataformas: ["ds"], regiao: "johto", geracao: 4, tipo: "remake", estilo: "rpg-classico",
    atributos: a(5, 3, 3, 3, 2, 5),
    chamada: "Johto e Kanto refeitas com capricho, e o seu Pokémon caminhando logo atrás.",
    texto: [
      "Um remake de Gold e Silver que não corta nada e soma muito. O primeiro Pokémon do time anda atrás de você pelo mapa, as duas regiões voltam com dezesseis ginásios, e a Battle Frontier de Platinum vem junto.",
      "O cartucho saía com o Pokéwalker, um pedômetro que levava um Pokémon para passear no bolso. Muita gente aponta este como o melhor jogo da série; depois de alguns ginásios, dá para entender por quê."
    ],
    paraQuem: ["Quer o máximo de conteúdo num só cartucho", "Jogou Gold ou Silver e quer voltar", "Gosta de criar vínculo com o time"],
    naoSe: ["Curva de níveis irregular te frustra", "Você procura algo novo de verdade"],
    notas: {
      exploracao: "Duas regiões inteiras, dezesseis ginásios e um parque de batalhas.",
      nostalgia: "A lembrança de Johto, do jeito que a memória embelezou."
    },
    mascotes: [250, 249]
  },
  {
    slug: "black-white", pokedex: [["original-unova", "Unova"]], titulo: "Pokémon Black e White", curto: "Black e White",
    ano: 2010, plataformas: ["ds"], regiao: "unova", geracao: 5, tipo: "principal", estilo: "rpg-classico",
    atributos: a(2, 1, 3, 3, 5, 3),
    chamada: "A geração que perguntou se é certo capturar Pokémon, e levou a pergunta a sério.",
    texto: [
      "Unova foi um recomeço: até os créditos, só aparecem espécies inéditas, como se fosse o primeiro jogo outra vez. A trama põe você diante de N e da Equipe Plasma, que defendem a libertação dos Pokémon, e o final quebra a ordem habitual de ginásios, Liga e campeão.",
      "Os sprites se mexem o tempo todo, as estações do ano mudam o mapa e a trilha reage à batalha. O caminho, em compensação, é uma linha quase reta."
    ],
    paraQuem: ["Quer a história mais ambiciosa da série principal", "Gosta de conhecer um elenco totalmente novo", "Acha que Pokémon pode ter algo a dizer"],
    naoSe: ["Você quer liberdade para sair da rota", "Faz questão dos Pokémon clássicos desde o início"],
    notas: { historia: "N e a Equipe Plasma dão à série o seu enredo mais ambicioso." },
    mascotes: [643, 644]
  },
  {
    slug: "black-2-white-2", pokedex: [["updated-unova", "Unova"]], titulo: "Pokémon Black 2 e White 2", curto: "Black 2 e White 2",
    ano: 2012, plataformas: ["ds"], regiao: "unova", geracao: 5, tipo: "principal", estilo: "rpg-classico",
    atributos: a(3, 2, 4, 5, 4, 3),
    chamada: "A continuação direta de Black e White: Unova dois anos depois, com modo difícil.",
    texto: [
      "Em vez de uma terceira versão, a quinta geração ganhou uma sequência. Unova volta dois anos mais velha, com cidades novas, rotas reorganizadas e espécies de todas as regiões disponíveis desde o início.",
      "Sobra o que fazer depois dos créditos: o Pokémon World Tournament reúne líderes e campeões das gerações anteriores, e o Modo Desafio sobe o nível dos adversários, um seletor de dificuldade raro na série."
    ],
    paraQuem: ["Quer desafio dentro da fórmula clássica", "Terminou Black ou White e quer saber o que veio depois", "Gosta de pós-jogo cheio"],
    naoSe: ["Você não jogou Black ou White: a trama perde força", "Ter de desbloquear o Modo Desafio te irrita"],
    notas: {
      dificuldade: "Tem Modo Desafio, um seletor de dificuldade raro na série.",
      competitivo: "O Pokémon World Tournament põe você contra líderes e campeões de todas as regiões.",
      historia: "Fecha as pontas soltas de Black e White."
    },
    mascotes: [646]
  },
  {
    slug: "x-y", pokedex: [["kalos-central", "Kalos Central"], ["kalos-coastal", "Kalos Costeira"], ["kalos-mountain", "Kalos Montanhosa"]], titulo: "Pokémon X e Y", curto: "X e Y",
    ano: 2013, plataformas: ["3ds"], regiao: "kalos", geracao: 6, tipo: "principal", estilo: "rpg-classico",
    atributos: a(3, 2, 3, 1, 2, 2),
    chamada: "O salto para o 3D, com Megaevolução e uma região inspirada na França.",
    texto: [
      "A primeira aventura principal toda em modelos 3D e o primeiro lançamento mundial simultâneo da série. Kalos traz a Megaevolução, o tipo Fada e a chance de personalizar o visual do treinador.",
      "É um jogo generoso: o Exp. Share distribui experiência para o time inteiro, e você ganha um inicial de Kanto pelo caminho. Fica fácil e a trama passa rápido, mas poucos títulos são tão acolhedores para quem está começando."
    ],
    paraQuem: ["Vai jogar Pokémon pela primeira vez", "Quer uma aventura leve e bonita", "Tem curiosidade pela Megaevolução"],
    naoSe: ["Você quer ser desafiado", "Espera um pós-jogo robusto"],
    notas: { dificuldade: "Um dos mais fáceis da série: ótimo para começar, raso para veteranos." },
    mascotes: [716, 717]
  },
  {
    slug: "omega-ruby-alpha-sapphire", pokedex: [["updated-hoenn", "Hoenn"]], titulo: "Pokémon Omega Ruby e Alpha Sapphire", curto: "Omega Ruby e Alpha Sapphire",
    ano: 2014, plataformas: ["3ds"], regiao: "hoenn", geracao: 6, tipo: "remake", estilo: "rpg-classico",
    atributos: a(4, 2, 3, 2, 3, 4),
    chamada: "Hoenn em 3D, com voo livre sobre o mapa e um epílogo no espaço.",
    texto: [
      "Um remake de Ruby e Sapphire com tudo o que a sexta geração trouxe: Megaevolução, formas primitivas para Groudon e Kyogre e um radar que mostra quais espécies ainda faltam em cada rota.",
      "Com a Eon Flute, você sobrevoa Hoenn nas costas de Latios ou Latias e pousa onde quiser. Depois da Liga, o Delta Episode entrega um capítulo extra de história. A Battle Frontier de Emerald, porém, ficou de fora."
    ],
    paraQuem: ["Ama Hoenn e quer revê-la em 3D", "Gosta de caçar espécies raras", "Quer um remake com capítulo inédito"],
    naoSe: ["Você esperava a Battle Frontier", "Quer dificuldade acima da média"],
    notas: {
      exploracao: "Dá para sobrevoar a região inteira e pousar em ilhas que só existem vistas do alto.",
      nostalgia: "As mesmas rotas e os mesmos trompetes, agora com profundidade."
    },
    mascotes: [383, 382]
  },
  {
    slug: "sun-moon", pokedex: [["original-alola", "Alola"]], titulo: "Pokémon Sun e Moon", curto: "Sun e Moon",
    ano: 2016, plataformas: ["3ds"], regiao: "alola", geracao: 7, tipo: "principal", estilo: "rpg-classico",
    atributos: a(2, 1, 3, 3, 4, 2),
    chamada: "Quatro ilhas tropicais onde os ginásios deram lugar a provas e rituais.",
    texto: [
      "Alola troca a estrutura de ginásios por um desafio das ilhas: provas com regras próprias, encerradas por um Pokémon Dominante que chama reforços. É uma das maiores mudanças de fórmula que a série já fez.",
      "A história dá muito tempo de tela aos personagens, sobretudo a Lillie, e por isso o começo é carregado de diálogos. Formas regionais e Movimentos Z estreiam aqui."
    ],
    paraQuem: ["Quer personagens com arco de verdade", "Cansou de oito ginásios", "Gosta de clima tropical e ritmo sem pressa"],
    naoSe: ["Tutoriais e cenas longas te impacientam", "Você quer explorar livremente"],
    notas: { historia: "A família de Lillie sustenta um dos enredos mais pessoais da série." },
    mascotes: [791, 792]
  },
  {
    slug: "ultra-sun-ultra-moon", pokedex: [["updated-alola", "Alola"]], titulo: "Pokémon Ultra Sun e Ultra Moon", curto: "Ultra Sun e Ultra Moon",
    ano: 2017, plataformas: ["3ds"], regiao: "alola", geracao: 7, tipo: "principal", estilo: "rpg-classico",
    atributos: a(3, 1, 4, 4, 4, 2),
    chamada: "Alola revista, com mais espécies, mais desafio e um chefe temido.",
    texto: [
      "Versões ampliadas de Sun e Moon: a mesma viagem pelas ilhas, com a trama alterada na reta final, áreas novas e muito mais Pokémon disponíveis. As provas ficaram mais exigentes, e a luta contra Ultra Necrozma está entre as mais difíceis que a série já pôs no caminho obrigatório.",
      "Depois dos créditos, o episódio da Equipe Rainbow Rocket reúne os vilões das gerações anteriores. Para quem só vai jogar uma dupla de Alola, costuma ser esta."
    ],
    paraQuem: ["Quer a versão mais completa de Alola", "Gosta de chefes que exigem estratégia", "Quer reencontrar vilões antigos"],
    naoSe: ["Você acabou de terminar Sun ou Moon: muita coisa se repete", "Diálogos longos te cansam"],
    notas: {
      dificuldade: "Ultra Necrozma é um dos chefes obrigatórios mais duros da série.",
      competitivo: "Elenco amplo e tutores de golpes para montar times.",
      historia: "Mantém o elenco de Alola e soma um epílogo com vilões clássicos."
    },
    mascotes: [800]
  },
  {
    slug: "lets-go-pikachu-eevee", pokedex: [["letsgo-kanto", "Kanto"]], titulo: "Pokémon: Let's Go, Pikachu! e Let's Go, Eevee!", curto: "Let's Go, Pikachu! e Eevee!",
    ano: 2018, plataformas: ["switch"], regiao: "kanto", geracao: 7, tipo: "remake", estilo: "rpg-classico",
    atributos: a(2, 2, 1, 1, 1, 5),
    chamada: "Kanto para jogar no sofá, capturando com o movimento do controle.",
    texto: [
      "Uma releitura de Yellow feita para receber quem veio do Pokémon GO. Os Pokémon selvagens aparecem andando pelo mapa e a captura dispensa batalha: basta arremessar a Poké Bola com o gesto certo. As batalhas contra treinadores seguem no formato clássico.",
      "Uma segunda pessoa pode entrar a qualquer momento para ajudar, e o seu parceiro, Pikachu ou Eevee, vai no ombro a viagem inteira. É curto, fácil e foi feito para ser assim."
    ],
    paraQuem: ["Vai jogar com criança ou com alguém que nunca jogou", "Veio do Pokémon GO", "Quer rever Kanto sem compromisso"],
    naoSe: ["Você quer batalhar contra Pokémon selvagens", "Procura profundidade ou desafio"],
    notas: {
      nostalgia: "Kanto e as 151 espécies originais, com cara de desenho animado.",
      dificuldade: "Feito para ninguém travar."
    },
    mascotes: [25, 133]
  },
  {
    slug: "sword-shield", pokedex: [["galar", "Galar"], ["isle-of-armor", "Isle of Armor"], ["crown-tundra", "Crown Tundra"]], pokedexNota: "Isle of Armor e Crown Tundra são as duas expansões pagas.", titulo: "Pokémon Sword e Shield", curto: "Sword e Shield",
    ano: 2019, plataformas: ["switch"], regiao: "galar", geracao: 8, tipo: "principal", estilo: "rpg-classico",
    atributos: a(3, 2, 5, 2, 2, 1),
    chamada: "Ginásios em estádios lotados e a porta de entrada mais prática para o competitivo.",
    texto: [
      "Em Galar, batalha de ginásio é esporte de arena, com torcida e Pokémon gigantes por três turnos. A Área Selvagem é o primeiro espaço aberto da série, com câmera livre e um clima que muda as espécies do dia.",
      "O que mais envelheceu bem foi o bastidor: mentas, cápsulas e itens que encurtaram de semanas para horas o trabalho de preparar um time competitivo. As expansões Isle of Armor e Crown Tundra acrescentam duas áreas abertas inteiras."
    ],
    paraQuem: ["Quer começar a jogar competitivo", "Gosta de reides cooperativos online", "Quer uma campanha ágil"],
    naoSe: ["Você espera exploração profunda fora da Área Selvagem", "Faz questão de todas as espécies: nem todas estão no jogo"],
    notas: { competitivo: "Mentas e cápsulas tornaram a montagem de times acessível como nunca." },
    mascotes: [888, 889]
  },
  {
    slug: "brilliant-diamond-shining-pearl", pokedex: [["original-sinnoh", "Sinnoh"]], titulo: "Pokémon Brilliant Diamond e Shining Pearl", curto: "Brilliant Diamond e Shining Pearl",
    ano: 2021, plataformas: ["switch"], regiao: "sinnoh", geracao: 8, tipo: "remake", estilo: "rpg-classico",
    atributos: a(3, 2, 3, 3, 3, 4),
    chamada: "A Sinnoh de 2006 reconstruída no Switch, fiel até nos detalhes.",
    texto: [
      "Um remake que escolheu preservar: o mapa, os encontros e o ritmo são os de Diamond e Pearl, com personagens em estilo miniatura e batalhas em 3D. O Grande Subterrâneo amplia a antiga rede de túneis com esconderijos onde os Pokémon circulam à vista.",
      "A fidelidade tem preço: as melhorias de Platinum ficaram de fora. Em troca, a Liga foi reforçada, e as revanches contra a Elite dos Quatro usam times de nível competitivo."
    ],
    paraQuem: ["Quer conhecer Sinnoh num console atual", "Prefere o clássico sem reinvenção", "Gosta de um fim de jogo exigente"],
    naoSe: ["Você esperava um remake ousado", "Queria os extras de Platinum"],
    notas: { nostalgia: "A mesma Sinnoh de 2006, tela por tela." },
    mascotes: [483, 484]
  },
  {
    slug: "legends-arceus", pokedex: [["hisui", "Hisui"]], titulo: "Pokémon Legends: Arceus", curto: "Legends: Arceus",
    ano: 2022, plataformas: ["switch"], regiao: "hisui", geracao: 8, tipo: "legends", estilo: "acao",
    atributos: a(5, 4, 1, 3, 3, 2),
    chamada: "Sinnoh séculos atrás: você, um punhado de Poké Bolas e a primeira Pokédex por escrever.",
    texto: [
      "Aqui, capturar é o centro de tudo. Você se esgueira pelo mato alto, mira e arremessa a Poké Bola em tempo real, sem transição para a batalha. A Pokédex não se preenche ao pegar um exemplar: pede observação, repetição e pesquisa de campo.",
      "Hisui se divide em grandes áreas abertas, percorridas a pé, a nado e pelo ar, em montarias. Há chefes que exigem esquiva e reflexo. Não existem ginásios nem batalhas online: é um jogo de exploração do começo ao fim."
    ],
    paraQuem: ["Sempre quis só explorar e capturar", "Cansou da fórmula de ginásios", "Gosta de completar listas de pesquisa"],
    naoSe: ["Batalha entre treinadores é o que te move", "Você quer cidades e rotas tradicionais"],
    notas: {
      exploracao: "Áreas abertas onde observar e capturar vale mais do que lutar.",
      liberdade: "Você decide o que pesquisar e como se aproximar de cada espécie."
    },
    mascotes: [493]
  },
  {
    slug: "scarlet-violet", pokedex: [["paldea", "Paldea"], ["kitakami", "Kitakami"], ["blueberry", "Blueberry"]], pokedexNota: "Kitakami e Blueberry são as duas partes da expansão paga.", titulo: "Pokémon Scarlet e Violet", curto: "Scarlet e Violet",
    ano: 2022, plataformas: ["switch"], regiao: "paldea", geracao: 9, tipo: "principal", estilo: "mundo-aberto",
    atributos: a(5, 5, 5, 2, 4, 1),
    chamada: "O primeiro mundo aberto de verdade: três histórias, na ordem que você quiser.",
    texto: [
      "Paldea é um mapa único e contínuo, sem rotas fechadas. Três caminhos correm em paralelo, os ginásios, os Pokémon Titãs e a Equipe Star, e você decide a ordem. Quando eles se encontram, o ato final surpreende quem achava que a série não ligava mais para enredo.",
      "Há um cenário competitivo completo, com reides, o fenômeno Terastal e até quatro pessoas explorando juntas. O lançamento teve problemas técnicos sérios no Switch; a atualização gratuita para o Switch 2 melhorou muito o desempenho."
    ],
    paraQuem: ["Quer liberdade total de rota", "Quer explorar com amigos", "Quer uma aventura que também sirva de base para o competitivo"],
    naoSe: ["Engasgos técnicos te tiram do jogo, sobretudo no Switch original", "Você prefere uma aventura guiada"],
    notas: {
      exploracao: "Um mapa contínuo, sem portões entre as áreas.",
      liberdade: "Três trilhas de história para seguir em qualquer ordem.",
      competitivo: "Reides, Terastal e ferramentas completas para montar times.",
      historia: "As três trilhas convergem num ato final marcante."
    },
    mascotes: [1007, 1008]
  },
  {
    slug: "legends-z-a", pokedex: [["lumiose-city", "Lumiose"], ["hyperspace", "Mega Dimension"]], pokedexNota: "Mega Dimension é a expansão paga.", titulo: "Pokémon Legends: Z-A", curto: "Legends: Z-A",
    ano: 2025, plataformas: ["switch", "switch2"], regiao: "kalos", geracao: 9, tipo: "legends", estilo: "acao",
    atributos: a(3, 3, 3, 3, 4, 3),
    chamada: "Uma cidade inteira como mapa e, pela primeira vez, batalhas em tempo real.",
    texto: [
      "O segundo Legends se passa todo em Lumiose, a capital de Kalos, durante um plano de reurbanização que divide a cidade entre pessoas e Pokémon. De dia, você explora as Zonas Selvagens; à noite, sobe de Z até A num torneio de rua.",
      "As batalhas abandonam os turnos: você se movimenta, desvia e dispara golpes com tempo de recarga. A Megaevolução volta com formas inéditas."
    ],
    paraQuem: ["Quer ver o combate de Pokémon virar ação", "Jogou X e Y e sente falta de Kalos", "Gosta de cenário urbano denso"],
    naoSe: ["Você faz questão de batalha por turnos", "Um mapa que é só uma cidade parece pouco para você"],
    notas: { historia: "Lumiose e seus moradores carregam a trama do começo ao fim." },
    mascotes: [718]
  },

  /* ---------- derivados ---------- */
  {
    slug: "colosseum-xd", semPokedex: "Orre não tem Pokédex regional: o elenco são os Shadow Pokémon tomados dos adversários, e essa lista não está na base pública que o atlas usa.", titulo: "Pokémon Colosseum e XD: Gale of Darkness", curto: "Colosseum e XD",
    ano: 2003, plataformas: ["gc"], regiao: "outras", lugar: "Orre", geracao: null, tipo: "derivado", estilo: "rpg-classico",
    atributos: a(2, 1, 3, 4, 4, 4),
    chamada: "Um deserto sem Pokémon selvagens, onde você toma de volta os que foram corrompidos.",
    texto: [
      "Orre é uma região árida, quase sem Pokémon na natureza. Em vez de capturar no mato, você usa uma máquina para tomar os Shadow Pokémon das mãos de outros treinadores, no meio da luta, e depois purificá-los.",
      "Quase todas as batalhas são em dupla, o tom é mais sombrio que o habitual e os adversários jogam sério. Colosseum abre a história; XD, de 2005, continua anos depois, com mais espécies e um Lugia corrompido na capa."
    ],
    paraQuem: ["Quer um RPG de Pokémon com outro clima", "Gosta de batalhas em dupla", "Teve um GameCube"],
    naoSe: ["Você quer explorar: aqui o mundo é pequeno", "Sente falta de capturar livremente"],
    notas: {
      dificuldade: "Batalhas em dupla contra adversários que punem time desbalanceado.",
      historia: "Um enredo de crime organizado, raro na franquia.",
      nostalgia: "O RPG de console que uma geração inteira esperava."
    },
    mascotes: [197, 196]
  },
  {
    slug: "mystery-dungeon-explorers-of-sky", semPokedex: "Aqui não se preenche Pokédex: os Pokémon são recrutados para a equipe, e a lista de recrutáveis não está na base pública que o atlas usa.", titulo: "Pokémon Mystery Dungeon: Explorers of Sky", curto: "Mystery Dungeon: Explorers of Sky",
    ano: 2009, plataformas: ["ds"], regiao: "outras", lugar: "um mundo só de Pokémon", geracao: null, tipo: "derivado", estilo: "roguelike",
    atributos: a(3, 2, 1, 4, 5, 4),
    chamada: "Você acorda transformado em Pokémon, e a história que vem depois faz muita gente chorar.",
    texto: [
      "Nada de treinadores: você é um humano que virou Pokémon, entra para uma guilda de exploradores e desce masmorras geradas ao acaso, andar por andar, em turnos. Fome, itens contados e salas cheias de inimigos castigam quem se descuida.",
      "O que fica, porém, é o enredo: uma trama sobre tempo e sacrifício que cresce até um final lembrado com reverência pelos fãs. Sky é a edição ampliada de Explorers of Time e Explorers of Darkness, com episódios extras."
    ],
    paraQuem: ["Coloca história acima de tudo", "Gosta de roguelikes por turnos", "Quer jogar no papel do Pokémon"],
    naoSe: ["Masmorras repetitivas te cansam", "Você quer capturar e montar time do jeito clássico"],
    notas: {
      historia: "Uma das tramas mais queridas de tudo o que leva o nome Pokémon.",
      dificuldade: "As masmorras de pós-jogo não têm piedade.",
      nostalgia: "Um clássico do DS que muita gente guarda com carinho."
    },
    mascotes: [492, 253]
  },
  {
    slug: "conquest", pokedex: [["conquest-gallery", "Ransei"]], titulo: "Pokémon Conquest", curto: "Conquest",
    ano: 2012, plataformas: ["ds"], regiao: "outras", lugar: "Ransei", geracao: null, tipo: "derivado", estilo: "estrategia",
    atributos: a(3, 3, 2, 3, 3, 2),
    chamada: "Pokémon num tabuleiro de guerra do Japão feudal.",
    texto: [
      "Um cruzamento com Nobunaga's Ambition, a série de estratégia da Koei. Você comanda guerreiros, cada um ligado a um Pokémon, em batalhas táticas por turnos sobre um tabuleiro, tomando os dezessete reinos de Ransei.",
      "Cada Pokémon tem um só golpe, o que deixa as partidas enxutas e o posicionamento decisivo. Depois da campanha principal, dezenas de episódios extras põem você no lugar de outros líderes."
    ],
    paraQuem: ["Gosta de tática em grade, no estilo Fire Emblem", "Quer algo fora do padrão da franquia", "Curte campanhas longas, com muitos cenários"],
    naoSe: ["Você quer aventura e exploração livre", "Estratégia por turnos não te prende"],
    notas: {},
    mascotes: [133]
  },
  {
    slug: "pokemon-go", semPokedex: "O elenco cresce a cada evento. Qualquer lista publicada aqui estaria desatualizada em semanas.", titulo: "Pokémon GO", curto: "Pokémon GO",
    ano: 2016, plataformas: ["celular"], regiao: "outras", lugar: "o mundo real", geracao: null, tipo: "derivado", estilo: "mundo-real",
    atributos: a(5, 4, 3, 1, 1, 4),
    chamada: "O mapa é a sua cidade: para capturar, é preciso sair de casa.",
    texto: [
      "O jogo usa o GPS do celular para espalhar Pokémon por ruas, praças e parques de verdade. Você caminha para encontrá-los, gira PokéStops em pontos de interesse e disputa ginásios instalados em lugares reais.",
      "Reides em grupo, dias comunitários e eventos em cidades mantêm o jogo ativo desde 2016. É gratuito, com compras opcionais, e rende mais em áreas urbanas, onde há mais pontos por perto."
    ],
    paraQuem: ["Quer um motivo para caminhar", "Gosta de jogar em grupo, na rua", "Lembra das primeiras gerações e quer algo casual"],
    naoSe: ["Você mora longe de áreas movimentadas", "Quer uma aventura com começo, meio e fim"],
    notas: {
      exploracao: "A exploração é literal: o que você encontra depende de por onde anda.",
      liberdade: "Sem campanha: você joga quando, onde e quanto quiser.",
      nostalgia: "Devolveu as 151 originais ao dia a dia de muita gente."
    },
    mascotes: [808]
  },
  {
    slug: "pokken-tournament-dx", semPokedex: "São lutadores e Pokémon de apoio, não uma Pokédex, e a lista não está na base pública que o atlas usa.", titulo: "Pokkén Tournament DX", curto: "Pokkén Tournament DX",
    ano: 2017, plataformas: ["switch"], regiao: "outras", lugar: "Ferrum", geracao: null, tipo: "derivado", estilo: "luta",
    atributos: a(1, 2, 5, 4, 1, 2),
    chamada: "Um jogo de luta de verdade, feito pelo estúdio de Tekken.",
    texto: [
      "Em vez de escolher comandos num menu, você controla o Pokémon diretamente: golpe, agarrão e contra-ataque num sistema de pedra, papel e tesoura. A luta alterna entre uma fase de arena aberta e outra de duelo lateral.",
      "A edição DX reúne o elenco do arcade e do Wii U e soma lutadores. É fácil de aprender e tem profundidade para quem quiser se dedicar ao online."
    ],
    paraQuem: ["Gosta de jogos de luta", "Quer partidas rápidas contra amigos", "Quer ver Pokémon lutando sem turnos"],
    naoSe: ["Você busca aventura, captura ou história", "Não tem paciência para treinar execução"],
    notas: {
      competitivo: "Um jogo de luta completo, com partidas ranqueadas online.",
      dificuldade: "Exige leitura do adversário e treino de reação."
    },
    mascotes: [448]
  },
  {
    slug: "mystery-dungeon-rescue-team-dx", semPokedex: "Aqui não se preenche Pokédex: os Pokémon são recrutados para a equipe, e a lista de recrutáveis não está na base pública que o atlas usa.", titulo: "Pokémon Mystery Dungeon: Rescue Team DX", curto: "Mystery Dungeon: Rescue Team DX",
    ano: 2020, plataformas: ["switch"], regiao: "outras", lugar: "um mundo só de Pokémon", geracao: null, tipo: "derivado", estilo: "roguelike",
    atributos: a(2, 2, 1, 3, 4, 4),
    chamada: "O primeiro Mystery Dungeon, refeito como um livro ilustrado em aquarela.",
    texto: [
      "Um remake de Red Rescue Team e Blue Rescue Team, de 2005. Um teste de personalidade sugere qual Pokémon você será; a partir daí, você monta uma equipe de resgate e atende pedidos de socorro em masmorras aleatórias.",
      "O visual imita traço a lápis e aquarela, e a versão nova acrescenta conforto: modo automático de exploração, Megaevolução e equipes maiores. É a porta de entrada mais amigável para a série de masmorras."
    ],
    paraQuem: ["Quer experimentar um roguelike sem sofrer", "Gosta de histórias de amizade simples e sinceras", "Jogou o original no GBA ou no DS"],
    naoSe: ["Você procura um enredo tão forte quanto o de Explorers of Sky", "Repetição de masmorras te incomoda"],
    notas: {
      historia: "Uma fábula curta sobre amizade, contada sem pressa.",
      nostalgia: "O mesmo jogo de 2005, redesenhado à mão."
    },
    mascotes: [94, 359]
  },
  {
    slug: "new-pokemon-snap", semPokedex: "O jogo tem uma Fotodex própria, que não está na base pública que o atlas usa.", titulo: "New Pokémon Snap", curto: "New Pokémon Snap",
    ano: 2021, plataformas: ["switch"], regiao: "outras", lugar: "Lental", geracao: null, tipo: "derivado", estilo: "fotografia",
    atributos: a(4, 1, 1, 1, 2, 3),
    chamada: "Um safári fotográfico: nenhuma batalha, só paciência e bom enquadramento.",
    texto: [
      "Você percorre trilhas num veículo que anda sozinho e fotografa Pokémon no ambiente deles. Cada foto recebe nota pela pose, pelo tamanho e pela raridade do comportamento, e a graça está em descobrir o que provoca cada cena.",
      "Jogar uma fruta, tocar uma melodia ou voltar à noite muda tudo. As rotas sobem de nível, revelam desvios e escondem comportamentos que ninguém te conta. É a continuação do Pokémon Snap de Nintendo 64, de 1999."
    ],
    paraQuem: ["Quer só observar Pokémon vivendo", "Gosta de jogos calmos, para sessões curtas", "Curte caçar segredos e reações raras"],
    naoSe: ["Você quer controlar para onde vai", "Sente falta de batalha e de evoluir um time"],
    notas: { exploracao: "Cada rota esconde desvios e comportamentos que só aparecem com insistência." },
    mascotes: [154]
  },
  {
    slug: "pokemon-unite", semPokedex: "O elenco de jogáveis muda a cada temporada. Qualquer lista publicada aqui estaria desatualizada em semanas.", titulo: "Pokémon UNITE", curto: "Pokémon UNITE",
    ano: 2021, plataformas: ["switch", "celular"], regiao: "outras", lugar: "Ilha Aeos", geracao: null, tipo: "derivado", estilo: "moba",
    atributos: a(1, 2, 5, 3, 1, 1),
    chamada: "Cinco contra cinco, dez minutos por partida, e quem pontua mais leva.",
    texto: [
      "Um jogo de arena em equipes. Cada pessoa controla um Pokémon em tempo real, derrota criaturas selvagens para juntar energia e a deposita nas metas do time adversário. O seu Pokémon evolui e aprende golpes ao longo da partida.",
      "Há papéis definidos, como atacante, defensor e suporte, e coordenação conta mais que reflexo. É gratuito, com compras dentro do jogo, e funciona entre Switch e celular."
    ],
    paraQuem: ["Gosta de competir em equipe", "Quer partidas curtas", "Já joga outros jogos de arena"],
    naoSe: ["Você quer jogar sozinho, no seu ritmo", "Compras dentro do jogo te incomodam"],
    notas: { competitivo: "Partidas ranqueadas em equipe, com papéis definidos." },
    mascotes: [807]
  },
  {
    slug: "detective-pikachu-returns", semPokedex: "Não há Pokédex: os Pokémon aparecem como personagens da história.", titulo: "Detective Pikachu Returns", curto: "Detective Pikachu Returns",
    ano: 2023, plataformas: ["switch"], regiao: "outras", lugar: "Ryme City", geracao: null, tipo: "derivado", estilo: "aventura",
    atributos: a(2, 1, 1, 1, 5, 2),
    chamada: "Um Pikachu de boné, viciado em café, resolvendo crimes com você.",
    texto: [
      "Uma aventura de investigação: você conversa com as pessoas, Pikachu interroga os Pokémon, e juntos vocês cruzam pistas até fechar cada caso. Não há batalhas nem capturas.",
      "Continua a história do Detective Pikachu de 3DS e finalmente responde o que aconteceu com Harry, o pai do protagonista. Os enigmas são simples e o ritmo é de desenho animado: funciona bem para jogar em família."
    ],
    paraQuem: ["Quer uma história leve para acompanhar", "Vai jogar com crianças", "Gostou do filme ou do primeiro jogo"],
    naoSe: ["Você quer ser desafiado pelos enigmas", "Sente falta de qualquer sistema de batalha"],
    notas: { historia: "É só história: um mistério contado caso a caso." },
    mascotes: [25, 58]
  },
  {
    slug: "tcg-pocket", semPokedex: "Aqui se colecionam cartas, não espécies, e saem coleções novas com frequência.", titulo: "Pokémon TCG Pocket", curto: "TCG Pocket",
    ano: 2024, plataformas: ["celular"], regiao: "outras", lugar: null, geracao: null, tipo: "derivado", estilo: "cartas",
    atributos: a(1, 3, 3, 1, 1, 4),
    chamada: "Abrir pacotinhos de cartas todo dia, na tela do celular.",
    texto: [
      "Uma versão de bolso do jogo de cartas colecionáveis. Você abre pacotes gratuitos todos os dias, monta uma coleção digital e admira ilustrações que ganham profundidade quando o celular se inclina.",
      "As partidas usam regras enxutas: baralhos de vinte cartas e duelos que acabam em poucos minutos. É gratuito, com compras opcionais para abrir mais pacotes."
    ],
    paraQuem: ["Colecionava cartas na infância", "Quer algo para dois minutos por dia", "Gosta mais de colecionar do que de competir"],
    naoSe: ["Você quer a profundidade do jogo de cartas completo", "Sorteio com compras opcionais te incomoda"],
    notas: { nostalgia: "A sensação de rasgar um pacotinho, intacta." },
    mascotes: [150, 151]
  },
  {
    slug: "pokopia", semPokedex: "A lista de Pokémon do jogo ainda não está na base pública que o atlas usa.", titulo: "Pokémon Pokopia", curto: "Pokopia",
    ano: 2026, plataformas: ["switch2"], regiao: "outras", lugar: "as ruínas de Kanto", geracao: null, tipo: "derivado", estilo: "simulacao",
    atributos: a(4, 5, 1, 1, 2, 2),
    chamada: "Você é um Ditto disfarçado de gente, reconstruindo um mundo para os Pokémon voltarem.",
    texto: [
      "Um jogo de vida e construção. No papel de um Ditto com aparência humana, você planta, constrói e mobília um território abandonado para atrair os Pokémon de volta. Cada novo morador ensina um golpe que funciona como ferramenta: regar, cortar, fazer crescer.",
      "Não há batalhas nem pressa. O jogo foi desenvolvido pela Game Freak com a Omega Force, da Koei Tecmo, e é exclusivo do Switch 2."
    ],
    paraQuem: ["Gosta de Animal Crossing e de jogos de fazenda", "Quer criar no próprio ritmo", "Prefere conviver com os Pokémon a lutar com eles"],
    naoSe: ["Você quer objetivos claros e desafio", "Ainda não tem um Switch 2"],
    notas: {
      liberdade: "O território é seu: você decide o que plantar, o que construir e quem atrair.",
      exploracao: "Áreas e moradores novos aparecem conforme o mundo se recupera."
    },
    mascotes: [132]
  },
  {
    slug: "champions", pokedex: [["champions", "Elenco"]], pokedexNota: "Elenco registrado na base pública em outubro de 2026, com o número nacional de cada espécie. O jogo recebe espécies novas por atualização.", titulo: "Pokémon Champions", curto: "Champions",
    ano: 2026, plataformas: ["switch", "celular"], regiao: "outras", lugar: null, geracao: null, tipo: "derivado", estilo: "batalha",
    atributos: a(1, 2, 5, 4, 1, 2),
    chamada: "Só batalhas: o novo endereço do Pokémon competitivo.",
    texto: [
      "Champions isola a parte de batalha da série e a transforma num jogo próprio, na linha do antigo Pokémon Stadium. Não há aventura: você monta times, entra em partidas casuais, ranqueadas ou privadas e sobe na classificação.",
      "Ele se conecta ao Pokémon HOME, o que permite trazer Pokémon de outros jogos, e põe Switch e celular na mesma partida. A Megaevolução está de volta ao formato competitivo."
    ],
    paraQuem: ["Quer competir sem passar por uma campanha", "Já tem Pokémon guardados no HOME", "Acompanha torneios"],
    naoSe: ["Você quer explorar ou seguir uma história", "Ainda está aprendendo o básico das batalhas"],
    notas: {
      competitivo: "Foi feito só para isso: ranqueadas, partidas privadas e jogo entre plataformas.",
      dificuldade: "Do outro lado há sempre uma pessoa tentando ganhar."
    },
    mascotes: [6]
  }
];
