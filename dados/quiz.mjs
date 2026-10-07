/* Perguntas da bússola. Cada opção soma pontos em um ou mais eixos; as duas
 * últimas perguntas não mexem no relevo, só filtram o catálogo. */

export const PERGUNTAS = [
  {
    id: "motivo", pergunta: "O que te traz até aqui?",
    opcoes: [
      { texto: "Voltar a um lugar que eu já conheço", pesos: { nostalgia: 3 } },
      { texto: "Viver uma aventura que eu ainda não vivi", pesos: { exploracao: 2, historia: 1 } },
      { texto: "Ficar bom de verdade nas batalhas", pesos: { competitivo: 3 } },
      { texto: "Relaxar, sem obrigação nenhuma", pesos: { liberdade: 2 } }
    ]
  },
  {
    id: "mapa", pergunta: "Diante de um mapa novo, você…",
    opcoes: [
      { texto: "Vai a todos os cantos antes de seguir em frente", pesos: { exploracao: 3 } },
      { texto: "Escolhe um rumo qualquer e vê no que dá", pesos: { liberdade: 3 } },
      { texto: "Segue a trilha principal para saber o que acontece", pesos: { historia: 2 } },
      { texto: "Procura logo o próximo adversário", pesos: { competitivo: 2, dificuldade: 1 } }
    ]
  },
  {
    id: "enredo", pergunta: "Como você prefere que a história chegue?",
    opcoes: [
      { texto: "Com enredo e personagens que eu vou lembrar", pesos: { historia: 3 } },
      { texto: "Como pano de fundo, sem atrapalhar o passeio", pesos: { exploracao: 1, nostalgia: 1 } },
      { texto: "Prefiro inventar a minha própria", pesos: { liberdade: 3 } },
      { texto: "Tanto faz: eu vim pelas batalhas", pesos: { competitivo: 2 } }
    ]
  },
  {
    id: "desafio", pergunta: "E a dificuldade?",
    opcoes: [
      { texto: "Quero perder algumas vezes antes de vencer", pesos: { dificuldade: 3 } },
      { texto: "Um desafio justo, que me faça pensar", pesos: { dificuldade: 2 } },
      { texto: "Tranquila: não quero ficar travado", pesos: {} }
    ]
  },
  {
    id: "depois", pergunta: "Passaram os créditos. O que te faz continuar?",
    opcoes: [
      { texto: "Montar o time perfeito e enfrentar outras pessoas", pesos: { competitivo: 3 } },
      { texto: "Completar a Pokédex e achar o que ficou escondido", pesos: { exploracao: 3 } },
      { texto: "Começar de novo, de um jeito diferente", pesos: { liberdade: 2, dificuldade: 1 } },
      { texto: "Nada: terminei a história, fechei o jogo", pesos: { historia: 1 } }
    ]
  },
  {
    id: "epoca", pergunta: "Qual destas frases é mais você?",
    opcoes: [
      { texto: "“Na minha época era melhor.”", pesos: { nostalgia: 3 } },
      { texto: "“Quero ver o que existe de mais novo.”", pesos: { liberdade: 1, exploracao: 1 } },
      { texto: "“Tanto faz a época: quero o melhor.”", pesos: { historia: 1, dificuldade: 1 } }
    ]
  },
  {
    id: "console", pergunta: "Onde você pretende jogar?", filtro: "plataforma",
    opcoes: [
      { texto: "Num Nintendo Switch", plataformas: ["switch"] },
      { texto: "Num Nintendo Switch 2", plataformas: ["switch", "switch2"] },
      { texto: "No celular", plataformas: ["celular"] },
      { texto: "Tenho os consoles antigos, ou isso não me limita", plataformas: null }
    ]
  },
  {
    id: "formato", pergunta: "Precisa ser a aventura clássica de capturar e batalhar?", filtro: "tipo",
    opcoes: [
      { texto: "Sim, quero a série principal", tipos: ["principal", "remake", "legends"] },
      { texto: "Não: topo qualquer formato", tipos: null }
    ]
  }
];
