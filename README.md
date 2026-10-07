# 🗺️ PokéAtlas

<p align="center">
  <strong>Um guia visual e cartográfico para descobrir qual jogo de Pokémon combina com você.</strong>
</p>

<p align="center">
  <a href="https://pokeatlas-swart.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Acessar%20Pok%C3%A9Atlas-pokeatlas--swart.vercel.app-2ea44f?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy Vercel" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Online-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D20-informational?style=flat-square&logo=node.js" alt="Node version" />
  <img src="https://img.shields.io/badge/Framework-Zero%20Dependencies%20(Vanilla)-f5a623?style=flat-square" alt="Zero Framework" />
  <img src="https://img.shields.io/badge/P%C3%A1ginas%20Geradas-1.072%20est%C3%A1ticas-blue?style=flat-square" alt="Páginas" />
  <img src="https://img.shields.io/badge/Dados-Pok%C3%A9API-red?style=flat-square" alt="PokéAPI" />
  <img src="https://img.shields.io/badge/Tipo-Projeto%20de%20F%C3%A3%20(N%C3%A3o%20Oficial)-lightgrey?style=flat-square" alt="Não Oficial" />
</p>

---

## 📌 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [A Assinatura: O Relevo Vivo](#-a-assinatura-o-relevo-vivo)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Direção de Arte e Design](#-direção-de-arte-e-design)
- [Arquitetura e Engenharia](#-arquitetura-e-engenharia)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Deploy](#-deploy)
- [Avisos Legais e Créditos](#-avisos-legais-e-créditos)
- [Autor](#-autor)

---

## 🧭 Sobre o Projeto

O **PokéAtlas** é uma experiência interativa e editorial criada para acolher três perfis de jogadores:
1. **O nostálgico** que parou em gerações anteriores e quer reencontrar a franquia;
2. **O iniciante** curioso que não sabe por onde começar entre dezenas de títulos;
3. **O fã veterano** em busca de uma perspectiva visual inovadora sobre os jogos.

Em vez de uma wiki enciclopédica tradicional ou uma vitrine de e-commerce, o PokéAtlas adota o conceito de um **caderno de campo naturalista e atlas de expedição náutica**. Cada jogo ganha uma identidade topográfica própria que traduz sua proposta de experiência em relevo, curvas de nível e altitude.

🔗 **Acesse o site em produção:** [https://pokeatlas-swart.vercel.app/](https://pokeatlas-swart.vercel.app/)

---

## 🏔️ A Assinatura: O Relevo Vivo

Cada título é modelado através de seis atributos de gameplay fundamentais:

| Eixo | O que mede |
| :--- | :--- |
| **História** | Profundidade da narrativa, desenvolvimento de personagens e mitologia. |
| **Exploração** | Riqueza de rotas, segredos, biomas e labirintos fora do caminho principal. |
| **Dificuldade** | Curva de desafio dos ginásios, inteligência artificial e batalhas cruciais. |
| **Liberdade** | Autonomia na ordem dos objetivos, exploração aberta e escolha de rotas. |
| **Competitivo** | Complexidade mecânica de pós-jogo, breeding, EVs/IVs e profundidade tática. |
| **Nostalgia** | Memória afetiva, fidelidade estética de época e peso histórico. |

### Como a Ilha é Gerada
Cada atributo ocupa uma direção na rosa dos ventos. As notas (de 1 a 5) elevam montanhas correspondentes:
- Quanto mais alta a nota, maior o cume montanhoso e mais distante a costa se projeta.
- O terreno acima do nível do mar consolida o contorno de uma **ilha única**.
- Renderizado proceduralmente tanto em **SVG durante o build estático** quanto em **Canvas interativo em tempo real** no navegador.

---

## 🗺️ Funcionalidades Principais

### 1. 🧭 Bússola Náutica (Quiz de Recomendação) (`/bussola/`)
Um sistema de recomendação dinâmico com 8 perguntas de perfil. À medida que o visitante responde, o relevo do seu perfil vai sendo esculpido ao vivo em tela. No final, o algoritmo compara a geometria do relevo gerado com todas as ilhas do catálogo e recomenda os títulos de maior afinidade, explicando quais morros coincidiram.

### 2. 📖 Pokédex em Gravura Naturalista (`/pokedex/` e `/pokedex/<especie>/`)
- **1.025 espécies de Pokémon** catalogadas.
- Apresentação visual em **gravura botânica monocromática (tinta sobre papel)** que recupera suas cores oficiais em hover/foco.
- Busca instantânea e filtros por geração e tipo elemental.
- Páginas individuais com atributos base, dimensões, linha evolutiva completa, formas regionais e lista de jogos em que a espécie pode ser encontrada.
- **Curiosidades computadas proceduralmente:** fatos gerados por análise cruzada em tempo de compilação (exclusividade de tipos, outliers estatísticos de peso/tamanho, etc.), sem redação artificial.

### 3. 🗺️ Cartas das Regiões (`/regioes/` e `/regioes/<regiao>/`)
- Cartografia vetorial redesenhada das 10 regiões do universo Pokémon: **Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Hisui e Paldea**.
- Traçado de costa, relevo altimétrico, cidades e marcos numerados.
- Rotas oficiais interligadas com **destaque bidirecional**: passar o cursor na rota da lista ilumina o mapa e vice-versa.
- Cartas que se desenham suavemente via SVG quando entram na janela de visualização.

### 4. ⚖️ Comparador de Terrenos (`/comparar/`)
Permite selecionar até 3 jogos simultâneos e sobrepor suas ilhas em tintas duotone contrastantes, facilitando a análise ponto a ponto das diferenças de ritmo e estilo de cada jogo.

### 5. ⏳ Linha do Tempo da Franquia (`/linha-do-tempo/`)
Uma régua cronológica abrangendo de **1996 a 2027**, separada por plataformas/consoles (do Game Boy original ao Nintendo Switch), servindo também como índice canônico completo dos jogos analisados.

### 6. 🎬 Prólogo Cinematográfico da Home (`/`)
Jornada contínua dividida em 6 cenas orientadas pelo scroll:
1. *O atlas se abre:* introdução tátil e o relevo procedural ao vivo.
2. *A travessia:* carrossel panorâmico das 10 regiões com pranchas dos iniciais.
3. *Trinta anos:* métricas temporais e evolução por consoles.
4. *A bússola (o clímax):* transição do fundo de papel náutico para a noite profunda, simulando a busca na abóbada celeste.
5. *As ferramentas:* vitrine da Pokédex e comparador.
6. *Trace sua rota:* convite para a descoberta do jogo ideal.

---

## 🎨 Direção de Arte e Design

| Elemento | Implementação | Inspiração |
| :--- | :--- | :--- |
| **Fundo Marítimo** | `#D2E1DF` (mar náutico) e `#0C2733` (noite de observação) | Cartas hidrográficas de expedições |
| **Papel do Caderno** | `#F1E8CF` (papel de algodão envelhecido) | Cadernos de anotações de naturalistas |
| **Tinta Principal** | `#0F2A3A` (azul-petróleo escuro) | Gravações em bico de pena e água-forte |
| **Acento de Navegação** | `#C4391F` (carmim de rotas) | Marcações cartográficas de expedições |
| **Tipografia** | **Archivo** (rótulos e dados) + **Alegreya** (narrativa editorial) | Cartografia técnica e literatura clássica |

---

## ⚡ Arquitetura e Engenharia

- **Zero Dependências em Produção:** Sem frameworks pesados (sem React, Vue, Next.js ou Tailwind). Toda a aplicação roda sobre HTML5 semântico, CSS moderno (com variáveis e Grid/Flexbox) e Vanilla JavaScript (ES Modules).
- **Gerador de Sites Estáticos (SSG) sob medida:** O script `scripts/build.mjs` valida todo o modelo de dados e gera **1.072 páginas HTML estáticas prontas em ~1,2 segundos**.
- **Performance Extrema:** Carregamento instantâneo, First Contentful Paint (FCP) quase imediato e consumo mínimo de recursos no cliente.
- **Validação Rigorosa em Build:** O processo de compilação valida previamente cada rota, nota de 1 a 5, compatibilidade de Pokédex e coerência cartográfica antes de emitir a pasta de distribuição.

---

## 📂 Estrutura do Repositório

```bash
Projeto-Vitrine-Jogos/
├── dados/                       # Conteúdo canônico e bases de dados
│   ├── atlas.mjs                # Definição de regiões, cidades, rotas e consoles
│   ├── jogos.mjs                # Títulos, atributos (1 a 5), mascotes e plataformas
│   ├── especies.mjs             # Metadados e mapeamento de Pokémon
│   ├── pokedex.json             # Dados de espécies e dex regionais (via PokéAPI)
│   ├── fichas.json              # Estatísticas, medidas, curiosidades e evoluções
│   └── cartas.json              # Coordenadas vetoriais das costas e altitudes
│
├── scripts/                     # Motor do SSG e automação de dados
│   ├── build.mjs                # Compilador principal (gera dist/ sem dependências)
│   ├── paginas.mjs              # Templates das páginas principais e jogos
│   ├── paginas-pokedex.mjs      # Gerador da Pokédex e cálculo das curiosidades
│   ├── carta.mjs                # Renderizador vetorial dos mapas regionais
│   ├── cenario.mjs              # Desenhos SVG auxiliares e bússola
│   ├── servir.mjs               # Servidor HTTP local para desenvolvimento
│   └── verificar-paginas.mjs    # Suíte de auditoria visual com Playwright
│
├── src/                         # Código-fonte da interface
│   ├── estilo.css               # Design system e folhas de estilo globais
│   ├── fontes/                  # Tipografias Archivo e Alegreya (SIL OFL)
│   ├── js/                      # Lógica client-side modularizada
│   │   ├── relevo.js            # Algoritmo de geração da ilha procedural
│   │   ├── bussola.js           # Lógica interativa do quiz e recomendações
│   │   ├── pokedex.js           # Mecanismo de busca e filtragem instantânea
│   │   └── cartas.js            # Interatividade hover/touch dos mapas
│   └── arte/                    # Sprites oficiais convertidos em gravura
│
├── dist/                        # Saída do build estático (servido pela Vercel)
├── package.json                 # Scripts e ferramentas auxiliares
└── vercel.json                  # Roteamento e configuração de deploy
```

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- **Node.js 20+** instalado em sua máquina.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Avendanho/Projeto-Vitrine-Jogos.git
   cd Projeto-Vitrine-Jogos
   ```

2. **Inicie o ambiente de desenvolvimento:**
   O build nativo **não necessita de `npm install`** para compilar e rodar o site!
   ```bash
   npm run dev
   ```
   O site será compilado em `dist/` e disponibilizado localmente em:
   👉 **`http://localhost:4600`**

3. **Apenas gerar o build de produção:**
   ```bash
   npm run build
   ```

---

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Compila o site em `dist/` e inicia o servidor local em `http://localhost:4600`. |
| `npm run build` | Valida as regras de negócio e compila todas as 1.072 páginas HTML. |
| `npm run pokedex` | *(Opcional)* Reconstrói `pokedex.json` e `fichas.json` a partir da PokéAPI. |
| `npm run arte` | *(Opcional)* Baixa e rasteriza as pranchas em alta resolução dos mascotes. |
| `npm run arte:mini` | *(Opcional)* Gera o acervo de gravuras e miniaturas de todas as espécies. |
| `npm run cartas` | *(Opcional)* Recalcula os nós vetoriais de altitude e caminhos das cartas. |
| `npm run verificar` | *(Opcional)* Executa a auditoria visual automática com Playwright. |

---

## 🚀 Deploy

O projeto é configurado nativamente para publicação contínua na **Vercel** através do arquivo `vercel.json`:

- **Comando de Build:** `node scripts/build.mjs`
- **Diretório de Saída:** `dist`
- Cada `push` no branch `main` dispara automaticamente o build e a publicação das páginas atualizadas.

---

## ⚖️ Avisos Legais e Créditos

- **Pokémon:** Pokémon, nomes dos jogos, criaturas e insígnias são marcas registradas e propriedades intelectuais da **Nintendo**, **Game Freak**, **Creatures Inc.** e **The Pokémon Company**. Este é um projeto de fã, não oficial, de caráter artístico e informativo, sem fins lucrativos e sem qualquer vínculo comercial.
- **Dados e Sprites:** Nomes, estatísticas e ilustrações oficiais foram obtidos por meio da [PokéAPI](https://pokeapi.co/) e tratados artisticamente em formato de gravura.
- **Cartografia:** Todas as cartas das regiões são redesenhos originais e interpretações artísticas desenvolvidas especificamente para o atlas.
- **Tipografia:** Fontes [Archivo](https://fonts.google.com/specimen/Archivo) e [Alegreya](https://fonts.google.com/specimen/Alegreya), licenciadas sob a *SIL Open Font License*.

---

## 👤 Autor

Desenvolvido por **Bernardo Avendanho**  
- **GitHub:** [@Avendanho](https://github.com/Avendanho)  
- **Projeto Online:** [https://pokeatlas-swart.vercel.app/](https://pokeatlas-swart.vercel.app/)

---
<p align="center">
  <sub>PokéAtlas — Traçado com paixão por exploração, cartografia e Pokémon.</sub>
</p>
