/* Desafios do PokéAtlas: maneiras alternativas de jogar.
 *
 * Cada desafio escrito tem uma pequena história e regras. "dificuldade" e
 * "caos" vão de 1 a 5 e são opinião do atlas. Os fatos citados nas regras
 * (onde se consegue tal Pokémon, o que existe em tal jogo) são verificáveis.
 *
 *   edicao    "pokemon" ou "cobblemon"
 *   regiao    id de dados/atlas.mjs, quando o desafio é de uma região
 *   jogos     slugs de dados/jogos.mjs em que o desafio funciona
 *   especies  números da Pokédex, para a arte
 *   blocos    seções de regras: { titulo, texto } ou { titulo, itens }
 */

export const APRESENTACAO = {
  pokemon: [
    "Pokémon não precisa terminar quando você derrota a Elite dos Quatro pela primeira vez.",
    "Os desafios do PokéAtlas são maneiras alternativas de jogar cada região da franquia, que transformam uma campanha conhecida numa aventura nova. Há desde os estratégicos e difíceis até os completamente caóticos, engraçados e absurdos. Alguns têm regras simples. Outros têm pequenas histórias, personagens, restrições e condições especiais de vitória ou derrota.",
    "A ideia não é encontrar a maneira mais eficiente de jogar. É criar uma história que você vai lembrar."
  ],
  cobblemon: [
    "No Cobblemon não existe Liga para vencer nem créditos para assistir. O mundo é aberto, e o que fazer com ele é escolha sua.",
    "Estes desafios dão essa escolha pronta: um jeito de começar um mundo novo com uma regra que muda tudo, do primeiro bloco quebrado ao último Pokémon do time.",
    "Servem para um jogador só ou para um servidor inteiro. Quanto mais gente seguindo a mesma regra, melhor a história."
  ]
};

export const DESAFIOS = [
  {
    slug: "os-super-woopers", edicao: "pokemon", nome: "Os Super Woopers", regiao: "johto",
    jogos: ["gold-silver-crystal", "heartgold-soulsilver"], dificuldade: 3, caos: 5,
    tema: "Família, azar, lealdade e muitos Woopers.", especies: [194, 195],
    sinopse: [
      "Você nunca foi exatamente o aluno favorito do Professor.",
      "Quando chegou o grande dia, seus amigos receberam seus Pokémon iniciais e partiram para suas jornadas. Você ficou sem nenhum. Sem Chikorita. Sem Cyndaquil. Sem Totodile. Nada.",
      "Alguns dias depois, enquanto nadava sozinho em um lago perto de sua cidade, você encontrou uma pequena família de Woopers. Eles não eram fortes. Não eram raros. Não eram exatamente o tipo de Pokémon que alguém imaginaria enfrentando a Elite dos Quatro.",
      "Mas eles ficaram com você. E quando ninguém mais acreditava que você poderia se tornar um grande treinador, seis pequenos Woopers acreditaram.",
      "Agora existe apenas uma coisa a fazer: mostrar para toda Johto que escolher você por último foi o maior erro daquele professor."
    ],
    objetivo: "Conquistar Johto usando apenas a sua família de Woopers.",
    blocos: [
      { titulo: "Formação da família", itens: [
        "O time final tem cinco Quagsires e um Wooper.",
        "Comece a aventura com um Wooper assim que for possível obtê-lo. O inicial que o jogo obriga a receber vai para o PC nesse dia e não sai mais.",
        "Depois, capture os outros cinco.",
        "Um dos seis precisa ser Shiny. Se a sua versão permitir conseguir um Wooper Shiny cedo de maneira razoável, pode usá-lo desde o começo. Caso contrário, encontre-o durante a aventura."
      ] },
      { titulo: "A regra mais importante", texto: "Todos os Woopers recebem nome. Eles não são seis Pokémon aleatórios: são uma família. Vale criar personalidade para cada um, decidir quem é o mais velho, quem é o teimoso e quem nunca vai evoluir." }
    ],
    vitoria: "Entrar no Hall da Fama com os seis em campo: cinco Quagsires e o Wooper que ficou pequeno.",
    derrota: "Não há. Família não se abandona: perdeu, levanta e tenta de novo.",
    variacao: "Sem o Shiny, o desafio continua valendo e fica bem mais curto. Com ele, é para quem tem paciência de santo."
  },
  {
    slug: "a-heranca-do-magikarp", edicao: "pokemon", nome: "O Peixe de Quinhentos", regiao: "kanto",
    jogos: ["red-blue-yellow", "firered-leafgreen"], dificuldade: 3, caos: 3,
    tema: "Teimosia, um mau negócio e a vontade de provar que foi um bom.", especies: [129, 130],
    sinopse: [
      "No Centro Pokémon ao pé do Mt. Moon, um homem de sorriso largo oferece um Pokémon raríssimo por apenas 500. Todo mundo avisa que é golpe.",
      "Você compra mesmo assim.",
      "Dentro da Poké Bola há um Magikarp que só sabe se debater. O vendedor some. Seus amigos riem. E você decide, ali mesmo, que aquele peixe vai derrotar o campeão de Kanto."
    ],
    objetivo: "Fazer do Magikarp comprado na Rota 4 o herói de todas as batalhas importantes de Kanto.",
    blocos: [
      { titulo: "Regras", itens: [
        "Compre o Magikarp no Centro Pokémon da Rota 4, antes do Mt. Moon. A partir daí, ele nunca mais sai do time.",
        "É ele quem precisa derrubar o último Pokémon de cada líder de ginásio, de cada membro da Elite dos Quatro e do campeão.",
        "Nada de Rare Candy nele. Cada nível é conquistado em batalha.",
        "Ele recebe um apelido à altura de quem custou 500.",
        "O resto do time é livre, mas está ali para servir de escada."
      ] },
      { titulo: "O que esperar", texto: "Até o nível 15 ele só conhece Splash, que não faz nada. Do 15 ao 20 tem Tackle. No 20 vira Gyarados, e a piada passa a ser sua." }
    ],
    vitoria: "O golpe final no campeão sai do peixe de quinhentos.",
    derrota: "Se outro Pokémon derrubar o último adversário de um líder, a insígnia não conta: perca a batalha de propósito e refaça.",
    variacao: "Modo difícil: ele não pode evoluir antes da quarta insígnia."
  },
  {
    slug: "mare-alta", edicao: "pokemon", nome: "Maré Alta", regiao: "hoenn",
    jogos: ["ruby-sapphire-emerald", "omega-ruby-alpha-sapphire"], dificuldade: 2, caos: 2,
    tema: "Sal, paciência e uma região que é metade mar.", especies: [258, 318, 320],
    sinopse: [
      "Dizem que Hoenn tem água demais. Você resolveu concordar.",
      "Filho de pescador, criado em cais, você nunca entendeu por que alguém procuraria Pokémon no mato alto quando o mar inteiro está ali. Sua vara de pescar é velha, sua paciência é longa, e o seu time vai cheirar a maresia."
    ],
    objetivo: "Vencer a Liga de Hoenn só com Pokémon tirados da água.",
    blocos: [
      { titulo: "Regras", itens: [
        "Só entram no time Pokémon pescados, encontrados surfando ou encontrados mergulhando.",
        "O inicial vale até você ganhar a Old Rod do pescador de Dewford Town. Pescou o primeiro, o inicial vai para o PC.",
        "Mato alto serve para passar, não para capturar.",
        "Pokémon recebidos de presente ou por troca dentro do jogo não contam."
      ] }
    ],
    vitoria: "Hall da Fama com um time em que todos vieram da água.",
    derrota: "Capturou em terra firme por reflexo? Solte e siga. Usou em batalha, a insígnia seguinte não conta.",
    variacao: "Modo difícil: só vale o que saiu da vara de pescar, nada de Surf."
  },
  {
    slug: "o-aprendiz-de-flint", edicao: "pokemon", nome: "O Aprendiz de Flint", regiao: "sinnoh",
    jogos: ["diamond-pearl-platinum", "brilliant-diamond-shining-pearl"], dificuldade: 4, caos: 2,
    tema: "Fogo em terra fria, e a arte de se virar com pouco.", especies: [392, 78],
    sinopse: [
      "Flint é o especialista em Fogo da Elite dos Quatro de Sinnoh. Em Diamond e Pearl, nem ele consegue montar um time só de Fogo: usa Steelix, Drifblim e Lopunny para completar.",
      "O motivo é simples. Na Pokédex daquela Sinnoh só existem duas linhas do tipo Fogo: a de Chimchar e a de Ponyta.",
      "Você decidiu ser o aprendiz que faz o que o mestre não fez."
    ],
    objetivo: "Vencer a Liga de Sinnoh com um time só de Fogo, numa região que quase não tem Fogo.",
    blocos: [
      { titulo: "Regras", itens: [
        "Só Pokémon do tipo Fogo entram no time.",
        "Em Diamond e Pearl, isso significa duas linhas: Chimchar e Ponyta. Escolha Chimchar no começo ou o desafio acaba ali.",
        "Pode repetir a espécie: seis Rapidashes é um time válido, e um pesadelo.",
        "Pokémon de outros tipos só para usar HMs, nunca em batalha."
      ] },
      { titulo: "Qual jogo usar", texto: "Diamond e Pearl são o desafio puro. Platinum soma algumas opções de Fogo à Pokédex regional, e Brilliant Diamond e Shining Pearl abrem mais ainda no Grande Subterrâneo: use-as se quiser respirar." }
    ],
    vitoria: "Derrotar Flint, o resto da Elite e a campeã com um time em que todos são de Fogo.",
    derrota: "Usou em batalha um Pokémon que não é de Fogo: volte ao último ginásio vencido.",
    variacao: "Modo difícil: Diamond ou Pearl, time de no máximo quatro."
  },
  {
    slug: "como-n", edicao: "pokemon", nome: "Como N", regiao: "unova",
    jogos: ["black-white"], dificuldade: 5, caos: 3,
    tema: "Desapego, convicção e despedidas a cada cidade.", especies: [571, 570],
    sinopse: [
      "N acredita que Pokémon não deveriam viver presos a treinadores. Por isso, em cada cidade onde vocês se enfrentam, ele luta com Pokémon que encontrou ali por perto, e depois os deixa ir.",
      "Você o conheceu em Accumula Town e não conseguiu mais esquecer o que ouviu.",
      "Então fez um trato consigo mesmo: vai até o fim da Liga, mas do jeito dele."
    ],
    objetivo: "Chegar ao fim de Unova sem nunca ficar com um time por mais de uma insígnia.",
    blocos: [
      { titulo: "Regras", itens: [
        "Para cada ginásio, o time só pode ter Pokémon capturados nas rotas e áreas entre a cidade do ginásio anterior e a deste.",
        "Venceu a insígnia? Despeça-se: o time inteiro é solto antes de você sair da cidade.",
        "O inicial segue a mesma regra e fica para trás depois do primeiro ginásio.",
        "Para a Elite dos Quatro, vale o que você capturar na Rota 10 e na Victory Road."
      ] },
      { titulo: "O que isso muda", texto: "Você nunca tem um time de nível alto. Cada ginásio vira um quebra-cabeça de montar, em poucas horas, seis Pokémon locais que deem conta do líder." }
    ],
    vitoria: "Derrotar N e Ghetsis com um time capturado na reta final.",
    derrota: "Levou um Pokémon de um trecho para o seguinte: solte-o e refaça o último ginásio.",
    variacao: "Versão leve: em vez de soltar, guarde no PC e nunca mais use."
  },
  {
    slug: "passarela-de-lumiose", edicao: "pokemon", nome: "Passarela de Lumiose", regiao: "kalos",
    jogos: ["x-y"], dificuldade: 2, caos: 3,
    tema: "Moda, vaidade e um time que combina com a roupa.", especies: [700, 39, 36],
    sinopse: [
      "Em Kalos, estilo é assunto sério. Há butiques em quase toda cidade, e a mais famosa de Lumiose nem deixa você entrar enquanto não for alguém.",
      "Você não veio colecionar insígnias. Veio lançar uma coleção.",
      "E coleção que se preza tem uma cor só."
    ],
    objetivo: "Vencer a Liga de Kalos com um time de uma cor só, vestido para combinar.",
    blocos: [
      { titulo: "Regras", itens: [
        "Escolha uma cor. Todo Pokémon do time precisa ser dessa cor na Pokédex (a página de cada espécie no atlas mostra qual é).",
        "A roupa do seu personagem acompanha: da cabeça aos pés, na cor da coleção.",
        "A cada insígnia, compre uma peça nova antes de seguir viagem. Se faltar dinheiro, a viagem espera.",
        "Megaevolução só vale se a forma mega continuar combinando."
      ] }
    ],
    vitoria: "Hall da Fama com seis Pokémon da mesma cor e a foto de treinador combinando.",
    derrota: "Entrou em batalha de ginásio com alguém fora da paleta: a crítica não perdoa, refaça o ginásio.",
    variacao: "Não sabe que cor escolher? A roleta abaixo sorteia uma para você."
  },
  {
    slug: "para-sempre-pequenos", edicao: "pokemon", nome: "Para Sempre Pequenos", regiao: "alola",
    jogos: ["sun-moon", "ultra-sun-ultra-moon"], dificuldade: 4, caos: 2,
    tema: "Infância, teimosia e ninguém com pressa de crescer.", especies: [722, 725, 728],
    sinopse: [
      "Em Alola ninguém tem pressa. As provas das ilhas não são corrida, o sol demora a se pôr e todo mundo chama você de primo.",
      "Seu inicial olhou para você no primeiro dia, pequeno daquele jeito, e você fez uma promessa boba: ele não precisava mudar para ser campeão.",
      "Promessa é promessa."
    ],
    objetivo: "Completar o desafio das ilhas e vencer a Liga sem que nenhum Pokémon evolua.",
    blocos: [
      { titulo: "Regras", itens: [
        "Nenhum Pokémon do time pode evoluir. Cancele toda evolução, sempre.",
        "Só entram no time Pokémon que ainda poderiam evoluir. Os que nunca evoluem ficam de fora.",
        "Capturou um já evoluído? Ele vai para o PC.",
        "Itens são livres. Se encontrar algo que favoreça quem não evoluiu, use sem culpa."
      ] },
      { titulo: "Onde dói", texto: "Os Pokémon Dominantes chamam reforços e têm atributos aumentados. Contra um time de pequenos, cada prova pede plano, não força." }
    ],
    vitoria: "Tornar-se campeão de Alola com seis Pokémon no primeiro estágio.",
    derrota: "Uma evolução passou sem querer: aquele Pokémon se aposenta no PC.",
    variacao: "Modo difícil: time de bebês e primeiros estágios, sem nenhum item em batalha."
  },
  {
    slug: "cartao-vermelho", edicao: "pokemon", nome: "Cartão Vermelho", regiao: "galar",
    jogos: ["sword-shield"], dificuldade: 3, caos: 2,
    tema: "Futebol, elenco curto e medo de suspensão.", especies: [813, 815],
    sinopse: [
      "Em Galar, batalha de ginásio é jogo de estádio lotado. Tem torcida, tem uniforme, e você escolhe até o número da camisa.",
      "Então leve a sério. Time tem elenco, elenco tem limite, e quem apronta em campo leva cartão.",
      "A temporada é longa. Poupe seus titulares."
    ],
    objetivo: "Vencer a Copa dos Campeões de Galar com um elenco fechado, sob regras de futebol.",
    blocos: [
      { titulo: "Regras", itens: [
        "Seu elenco tem onze: seis titulares e cinco reservas. Fechou os onze, não entra mais ninguém até o fim.",
        "Pokémon que desmaia leva cartão amarelo.",
        "Segundo amarelo é vermelho: expulso do elenco, vai para o PC e não volta.",
        "Antes de cada ginásio, anuncie a escalação. Durante a partida, só entram os seis escalados.",
        "Todo jogador tem número. Ponha no apelido."
      ] }
    ],
    vitoria: "Derrotar o campeão com pelo menos seis jogadores ainda no elenco.",
    derrota: "Ficou com menos de seis: o clube faliu, a temporada acabou.",
    variacao: "Modo difícil: cartão vermelho direto para quem desmaiar em batalha de ginásio."
  },
  {
    slug: "o-pesquisador-pacifista", edicao: "pokemon", nome: "O Pesquisador Pacifista", regiao: "hisui",
    jogos: ["legends-arceus"], dificuldade: 3, caos: 1,
    tema: "Silêncio, mato alto e nenhuma briga.", especies: [399, 722],
    sinopse: [
      "Você caiu do céu numa terra que tem medo de Pokémon. O professor Laventon pede uma coisa só: observe.",
      "Todo mundo na vila entende isso como 'lute até eles obedecerem'. Você entendeu ao pé da letra.",
      "Sua Pokédex vai ser escrita com paciência, frutas e boa pontaria."
    ],
    objetivo: "Chegar aos créditos de Legends: Arceus sem nunca provocar uma batalha contra Pokémon selvagem.",
    blocos: [
      { titulo: "Regras", itens: [
        "Você nunca arremessa um Pokémon seu contra um selvagem para começar uma batalha.",
        "Captura só com Poké Bola arremessada sem ser visto, ou depois de distrair com comida.",
        "Se um selvagem atacar primeiro, corra. Batalhar para se defender é o último recurso.",
        "Batalhas que a história obriga são permitidas.",
        "Tarefas de pesquisa que exigem derrotar Pokémon ficam em branco, e tudo bem."
      ] }
    ],
    vitoria: "Ver os créditos com a consciência limpa.",
    derrota: "Começou uma batalha por impulso: devolva à natureza um Pokémon do seu time.",
    variacao: "Modo difícil: nunca ser visto por um alfa."
  },
  {
    slug: "rota-do-avesso", edicao: "pokemon", nome: "Rota do Avesso", regiao: "paldea",
    jogos: ["scarlet-violet"], dificuldade: 5, caos: 4,
    tema: "Ordem errada, de propósito.", especies: [906, 978],
    sinopse: [
      "No primeiro dia de aula, o diretor diz que Paldea é sua e que você pode ir aonde quiser, na ordem que quiser.",
      "Ele não esperava que alguém levasse isso tão a sério.",
      "Os níveis dos adversários em Paldea não se ajustam aos seus. Existe uma ordem sensata para tudo. Você vai fazer a outra."
    ],
    objetivo: "Completar as três histórias de Paldea começando pelo que é mais difícil.",
    blocos: [
      { titulo: "Regras", itens: [
        "Em cada uma das três trilhas (ginásios, Titãs e Equipe Star), enfrente os adversários do nível mais alto para o mais baixo.",
        "O primeiro ginásio é o de Glaseado, no alto da montanha gelada.",
        "Não vale treinar até ficar acima do adversário: o nível do seu time tem como teto o do Pokémon mais forte que você já derrotou em batalha importante.",
        "Pokémon de reides com amigos ficam de fora."
      ] },
      { titulo: "O que acontece", texto: "O começo é brutal e o fim vira passeio. A graça está nas primeiras dez horas, quando cada vitória parece impossível." }
    ],
    vitoria: "Terminar as três trilhas na ordem do avesso e ver o ato final.",
    derrota: "Venceu um adversário fora de ordem: perca de propósito para o seguinte da fila antes de continuar.",
    variacao: "Modo difícil: sem trocar de Pokémon durante as batalhas importantes."
  },

  /* ---------- Cobblemon ---------- */
  {
    slug: "um-bioma-so", edicao: "cobblemon", nome: "Um Bioma Só", dificuldade: 3, caos: 2,
    tema: "Raízes: o mundo é enorme e você é daqui.", especies: [16, 163, 399],
    sinopse: [
      "O mundo se gerou, você abriu os olhos, e o lugar onde seus pés tocaram o chão passou a ser a sua terra.",
      "Pode viajar o quanto quiser. Pode ver oceanos, desertos e o Nether. Mas o seu time é do lugar onde você nasceu, e de nenhum outro."
    ],
    objetivo: "Montar um time completo só com Pokémon que nascem no bioma onde você apareceu.",
    blocos: [
      { titulo: "Regras", itens: [
        "Anote o bioma do ponto onde o mundo começou. Esse é o seu bioma.",
        "Só entram no time Pokémon capturados nele. A página de cada espécie no atlas mostra onde ela nasce.",
        "Outros Pokémon podem ser capturados para a Pokédex, mas vão direto para o PC.",
        "Evoluções valem, mesmo que a forma evoluída não nasça ali."
      ] }
    ],
    vitoria: "Seis Pokémon do seu bioma no time, todos acima do nível 50.",
    derrota: "Usou em batalha alguém de fora: solte-o onde o encontrou.",
    variacao: "Começou no meio do oceano? Azar o seu. É o desafio de verdade."
  },
  {
    slug: "vida-de-minerador", edicao: "cobblemon", nome: "Vida de Minerador", dificuldade: 4, caos: 3,
    tema: "Escuro, picareta e saudade do sol.", especies: [74, 41, 50],
    sinopse: [
      "Você cavou para baixo no primeiro minuto, como todo mundo. A diferença é que o túnel desabou atrás de você.",
      "Lá embaixo há minério, há lava, e há Pokémon que nunca viram o céu. Eles vão ser o seu time.",
      "A superfície fica para depois. Bem depois."
    ],
    objetivo: "Montar um time de seis sem voltar à superfície.",
    blocos: [
      { titulo: "Regras", itens: [
        "Depois da primeira noite, desça e não suba mais.",
        "Só vale capturar onde não há céu à vista: cavernas, minas, cavernas exuberantes, escuridão profunda.",
        "Madeira, comida e bolotas precisam vir de baixo. Plante o que conseguiu levar.",
        "Você só pode voltar a ver o sol com seis Pokémon no time."
      ] }
    ],
    vitoria: "Sair da caverna, à luz do dia, com um time completo de moradores do subsolo.",
    derrota: "Subiu antes da hora: o time é solto na boca da caverna e você desce de novo.",
    variacao: "Modo difícil: mundo em modo Hardcore."
  },
  {
    slug: "linha-na-agua", edicao: "cobblemon", nome: "Linha na Água", dificuldade: 2, caos: 2,
    tema: "Paciência, um banquinho e uma Pokévara.", especies: [129, 118, 60],
    sinopse: [
      "Tem gente que corre atrás de Pokémon. Você prefere esperar que eles venham.",
      "Uma Pokévara, um lago, o dia inteiro pela frente. O que morder a isca entra para o time. O que não morder, não era para ser."
    ],
    objetivo: "Montar o time inteiro com a Pokévara.",
    blocos: [
      { titulo: "Regras", itens: [
        "Seu primeiro objetivo no mundo é fabricar uma Pokévara.",
        "Só entram no time Pokémon fisgados com ela. O inicial vai para o PC na primeira fisgada.",
        "Encantar a vara com Isca é permitido, e recomendado: algumas espécies só mordem assim.",
        "Mude de água: rio, pântano, oceano frio e oceano quente dão peixes diferentes."
      ] }
    ],
    vitoria: "Seis Pokémon pescados, de pelo menos quatro águas diferentes.",
    derrota: "Capturou em terra e usou em batalha: uma semana do jogo sem pescar, de castigo.",
    variacao: "Modo difícil: só vale pescar de dentro de um barco."
  },
  {
    slug: "bolota-por-bolota", edicao: "cobblemon", nome: "Bolota por Bolota", dificuldade: 3, caos: 1,
    tema: "Roça, artesanato e nenhuma Poké Bola de graça.", especies: [204, 273, 191],
    sinopse: [
      "No Cobblemon, Poké Bola não se compra: se fabrica, com bolotas colhidas do pé.",
      "Você decidiu fazer isso direito. Um pomar, sete cores, e cada bola do seu time com história: de qual árvore veio, em que dia foi colhida."
    ],
    objetivo: "Capturar um time completo usando só Poké Bolas feitas com bolotas do seu próprio pomar.",
    blocos: [
      { titulo: "Regras", itens: [
        "Toda Poké Bola que você arremessar precisa ter sido fabricada por você.",
        "As bolotas vêm de árvores que você plantou. As que achar pelo mundo servem só de muda.",
        "Bolas encontradas em baús, pescadas ou recebidas de outros jogadores não podem ser usadas.",
        "Cada Pokémon do time precisa estar numa bola de tipo diferente."
      ] }
    ],
    vitoria: "Seis Pokémon, seis tipos de Poké Bola, todas saídas do seu pomar.",
    derrota: "Arremessou uma bola que não fez: o Pokémon capturado com ela é solto.",
    variacao: "Modo difícil: plante as sete cores de bolota antes da primeira captura."
  },
  {
    slug: "a-cavalaria", edicao: "cobblemon", nome: "A Cavalaria", dificuldade: 3, caos: 4,
    tema: "Rédea solta, vento na cara e nenhum passo a pé.", especies: [59, 18, 131],
    sinopse: [
      "Desde que os Pokémon passaram a aceitar montaria, andar virou coisa do passado.",
      "Você fez um juramento meio ridículo: de hoje em diante, seus pés só tocam o chão para montar, minerar e dormir. Viagem, só montado. Por terra, por água e pelo ar."
    ],
    objetivo: "Cruzar o mundo, do ponto inicial até O Fim, sem viajar a pé.",
    blocos: [
      { titulo: "Regras", itens: [
        "Depois de conseguir a primeira montaria, você não se desloca mais a pé por mais de cem blocos.",
        "O time precisa ter ao menos uma montaria de terra, uma de água e uma de ar.",
        "Cavalos, barcos, trilhos e élitros estão proibidos. Montaria é Pokémon.",
        "Dentro de cavernas e construções, ande à vontade."
      ] }
    ],
    vitoria: "Chegar ao Fim tendo usado as três montarias pelo caminho.",
    derrota: "Viajou a pé: volte montado até onde desmontou e refaça o trecho.",
    variacao: "Modo difícil: uma só espécie de montaria para o desafio inteiro."
  }
];

/* ---------- peças da roleta ----------
 * Cada peça tem um texto e quanto pesa em dificuldade (d) e em caos (c).
 * As chaves entre chaves são preenchidas na hora do sorteio, com dados do atlas. */
export const ROLETA = {
  pokemon: {
    regras: [
      { id: "tipo", texto: "Só entram no time Pokémon do tipo {tipo}.", titulo: "Tudo {tipo} em {regiao}", d: 2, c: 1 },
      { id: "cor", texto: "Só entram no time Pokémon de cor {cor} na Pokédex.", titulo: "{regiao} em {cor}", d: 2, c: 3 },
      { id: "capitao", texto: "{especie} é o capitão: nunca sai do time e precisa estar em campo no fim de toda batalha de ginásio.", titulo: "{especie}, capitão de {regiao}", d: 2, c: 2 },
      { id: "seis", texto: "O seu time é este, e só este: {seis}.", titulo: "Os seis de {regiao}", d: 3, c: 3 },
      { id: "pequenos", texto: "Ninguém evolui. Cancele toda evolução.", titulo: "Os pequenos de {regiao}", d: 3, c: 1 },
      { id: "nuzlocke", texto: "Só vale o primeiro Pokémon que aparecer em cada rota, e quem desmaia fica para trás.", titulo: "Nuzlocke de {regiao}", d: 3, c: 1 },
      { id: "letra", texto: "Só entram no time Pokémon cujo nome começa com a letra {letra}.", titulo: "{regiao} com a letra {letra}", d: 3, c: 4 }
    ],
    complicacoes: [
      { texto: "Nenhum item de cura durante as batalhas.", d: 1, c: 0 },
      { texto: "Centro Pokémon só uma vez por cidade.", d: 2, c: 1 },
      { texto: "Todo mundo recebe apelido, e todos do mesmo tema: {tema}.", d: 0, c: 2 },
      { texto: "Modo de batalha em Set: sem trocar de Pokémon depois de um nocaute.", d: 1, c: 0 },
      { texto: "Ninguém do time pode passar do nível do Pokémon mais forte do próximo líder.", d: 2, c: 0 },
      { texto: "O inicial vai para o PC depois da primeira insígnia.", d: 1, c: 1 },
      { texto: "Cada Pokémon só pode ter um golpe que causa dano.", d: 2, c: 3 },
      { texto: "Proibido fugir de batalha contra Pokémon selvagem.", d: 1, c: 2 },
      { texto: "Depois da segunda insígnia, nenhuma Poké Bola comprada: só as que você achar.", d: 1, c: 1 },
      { texto: "Time de no máximo quatro.", d: 2, c: 0 },
      { texto: "Toda batalha de ginásio começa com o Pokémon de nível mais baixo do time.", d: 1, c: 2 },
      { texto: "Dois Pokémon do time nunca podem ter um tipo em comum.", d: 1, c: 1 }
    ],
    temas: ["comidas de festa junina", "parentes distantes", "planetas e luas", "vilões de novela", "times de futebol", "nomes de remédio", "personagens de desenho antigo", "sobremesas"],
    vitorias: [
      { texto: "Entrar no Hall da Fama.", d: 0 },
      { texto: "Entrar no Hall da Fama com no máximo dez nocautes sofridos no jogo inteiro.", d: 2 },
      { texto: "Entrar no Hall da Fama sem perder nenhuma batalha de ginásio.", d: 1 },
      { texto: "Derrotar o campeão sem usar nenhum item na batalha final.", d: 1 },
      { texto: "Entrar no Hall da Fama com os seis Pokémon no mesmo nível.", d: 1 },
      { texto: "Entrar no Hall da Fama antes de o relógio do jogo marcar vinte horas.", d: 2 }
    ],
    derrotas: [
      "Perdeu uma batalha de ginásio: volte e refaça o ginásio anterior.",
      "Todos desmaiaram: o Pokémon de nível mais alto vai para o PC para sempre.",
      "Todos desmaiaram: fim de jogo, comece outro sorteio.",
      "Quebrou uma regra: escolha um Pokémon do time para soltar.",
      "Perdeu: troque o apelido de todo o time pelo nome de quem derrotou você."
    ]
  },
  cobblemon: {
    regras: [
      { id: "ambiente", texto: "Só entram no time Pokémon capturados {emAmbiente}. São {quantos} espécies possíveis, como {exemplos}.", titulo: "Filhos {doAmbiente}", d: 2, c: 1 },
      { id: "capitao-cobblemon", texto: "{especie} é o capitão do time. Encontre um {emAmbiente} antes de capturar qualquer outro.", titulo: "À procura de {especie}", d: 2, c: 2 },
      { id: "pesca", texto: "Só entram no time Pokémon fisgados com a Pokévara.", titulo: "Só o que morder a isca", d: 2, c: 2 },
      { id: "tipo-cobblemon", texto: "Só entram no time Pokémon do tipo {tipo}.", titulo: "Mundo {tipo}", d: 2, c: 1 },
      { id: "alfas", texto: "Só entram no time Pokémon que você capturou como alfa.", titulo: "Só alfas", d: 4, c: 2 },
      { id: "montados", texto: "Só entram no time Pokémon que podem ser montados.", titulo: "Time de montarias", d: 2, c: 3 }
    ],
    complicacoes: [
      { texto: "Sem Máquina de Cura: o time se recupera com bagas e remédios.", d: 2, c: 1 },
      { texto: "Só Poké Bolas fabricadas por você, com bolotas do seu pomar.", d: 1, c: 0 },
      { texto: "Mundo em modo Hardcore.", d: 3, c: 1 },
      { texto: "Nenhum comércio com aldeões.", d: 1, c: 0 },
      { texto: "Sem dormir: toda noite é passada acordado, explorando.", d: 1, c: 2 },
      { texto: "Você só come o que os seus Pokémon deixam cair ou o que você plantou.", d: 1, c: 2 },
      { texto: "Sua base precisa ficar no bioma mais difícil que você encontrar na primeira hora.", d: 1, c: 2 },
      { texto: "Cada Pokémon do time mora numa casa própria, construída por você.", d: 0, c: 3 },
      { texto: "Proibido usar armadura. Quem protege você é o time.", d: 2, c: 2 }
    ],
    temas: [],
    vitorias: [
      { texto: "Time de seis, todos acima do nível 50.", d: 1 },
      { texto: "Chegar ao Fim levando o time inteiro.", d: 2 },
      { texto: "Registrar cem espécies na Pokédex.", d: 2 },
      { texto: "Reviver os quinze Pokémon de fóssil do mod.", d: 3 },
      { texto: "Capturar um Pokémon ultrarraro do ambiente sorteado.", d: 2 },
      { texto: "Ter no time uma montaria de terra, uma de água e uma de ar.", d: 1 }
    ],
    derrotas: [
      "Morreu: o Pokémon de nível mais alto é solto onde você caiu.",
      "Quebrou uma regra: derrube sua base e recomece em outro bioma.",
      "Morreu: o time inteiro vai para o PC e você recomeça com o inicial.",
      "Quebrou uma regra: passe um dia inteiro do jogo sem capturar nada."
    ]
  }
};
