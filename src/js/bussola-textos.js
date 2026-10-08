/* O que a bússola diz enquanto funciona, em português e em inglês. (As perguntas e os textos dos jogos vêm
 * com os dados; aqui ficam as frases que a página monta na hora.) */
export const TEXTOS = {
  "pt-BR": {
    dados: "./dados.js", fichas: "/jogos/", e: "e",
    ordem: ["Primeiro da lista", "Segundo", "Terceiro"],
    passo: (n, total) => `Pergunta ${n} de ${total}`,
    filtro: "Essa resposta não mexe no perfil: ela escolhe entre quais jogos procurar.",
    esticou: (eixos) => `O perfil esticou em ${eixos}.`,
    nada: "Nada mudou desta vez. O seu perfil segue como estava.",
    emBranco: "O seu perfil ainda está em branco. Cada resposta puxa um vértice.",
    completo: "Perfil completo", legendaFinal: "Este é o seu perfil.",
    pronto: "O seu perfil está pronto.",
    puxa: (eixos) => `Ele puxa mais para ${eixos}.`,
    curto: "Ele ficou curto em todas as direções: você não puxou forte para lado nenhum.",
    abaixo: "Logo abaixo estão os jogos do atlas com o perfil mais parecido.",
    resumo: (n) => `Entre os jogos que cabem nas suas duas últimas respostas, ${n === 1 ? "este é o que mais se parece" : `estes ${n === 2 ? "dois" : "três"} são os que mais se parecem`} com o perfil que você desenhou. A linha vermelha sobre cada hexágono é o seu.`,
    sobre: (jogo) => `O seu perfil, em linha vermelha, sobre o de ${jogo}`,
    chave: "o seu perfil", porque: "Por que combina com você", atencao: "Fique de olho.",
    esteJogo: (alto) => `Este jogo ${alto}.`,
    pesa: (eixo, frase) => `${eixo} pesa mais aqui do que você pediu. ${frase}`,
    puxou: (eixo, baixo) => `Você puxou para ${eixo}, e aqui ${baixo}.`,
    ficha: (jogo) => `Abrir a ficha de ${jogo}`, comparar: (jogo) => `Comparar com ${jogo}`,
    copiado: "Link copiado.", copiadoBotao: "Link copiado", naoCopiou: "Não foi possível copiar. O link está na barra de endereço."
  },
  en: {
    dados: "./dados-en.js", fichas: "/en/games/", e: "and",
    ordem: ["First on the list", "Second", "Third"],
    passo: (n, total) => `Question ${n} of ${total}`,
    filtro: "This answer does not change the profile: it chooses which games to search among.",
    esticou: (eixos) => `The profile stretched toward ${eixos}.`,
    nada: "Nothing changed this time. Your profile stays as it was.",
    emBranco: "Your profile is still blank. Each answer pulls a vertex.",
    completo: "Profile complete", legendaFinal: "This is your profile.",
    pronto: "Your profile is ready.",
    puxa: (eixos) => `It leans most toward ${eixos}.`,
    curto: "It came out short in every direction: you did not pull hard toward any side.",
    abaixo: "Right below are the games in the atlas with the closest profile.",
    resumo: (n) => `Among the games that fit your last two answers, ${n === 1 ? "this is the one that looks most" : `these ${n === 2 ? "two" : "three"} are the ones that look most`} like the profile you drew. The red line over each hexagon is yours.`,
    sobre: (jogo) => `Your profile, as a red line, over that of ${jogo}`,
    chave: "your profile", porque: "Why it suits you", atencao: "Keep an eye out.",
    esteJogo: (alto) => `This game ${alto}.`,
    pesa: (eixo, frase) => `${eixo} weighs more here than you asked for. ${frase}`,
    puxou: (eixo, baixo) => `You pulled toward ${eixo}, and here ${baixo}.`,
    ficha: (jogo) => `Open the page of ${jogo}`, comparar: (jogo) => `Compare with ${jogo}`,
    copiado: "Link copied.", copiadoBotao: "Link copied", naoCopiou: "Could not copy. The link is in the address bar."
  }
};
/* Os textos da língua desta página. */
export const textosDaPagina = () => TEXTOS[document.documentElement.lang] ?? TEXTOS["pt-BR"];
