export const initialSiteData = {
  banners: [
    {
      id: 1,
      title: "A Arte da Dublagem",
      subtitle: "DOMINE",
      description: "Aprenda com os maiores nomes do mercado e transforme sua voz em uma ferramenta poderosa de interpretação.",
      imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Estúdio Profissional",
      subtitle: "VIVENCIE O",
      description: "Pratique em equipamentos de ponta e sinta a realidade de um estúdio de gravação desde o primeiro dia.",
      imageUrl: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Sua Carreira",
      subtitle: "CONSTRUA",
      description: "Networking, portfólio e direcionamento de carreira para você dar os primeiros passos no mercado de trabalho.",
      imageUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2070&auto=format&fit=crop"
    }
  ],
  modules: [
    {
      num: "01",
      slug: "iniciante",
      title: "MÓDULO INICIANTE",
      teacher: "Prof. Vitor Paranhos",
      duration: "4 meses",
      desc: "Fundamentos da voz, técnicas de respiração, leitura de roteiro e primeiros passos na dublagem profissional.",
      icon: "Mic",
      details: {
        methodology: [
          "Aulas 100% práticas",
          "Foco no destravamento vocal",
          "Controle da respiração",
          "Leitura de roteiros desde a 1ª semana"
        ],
        lessons: [
          "Anatomia da Voz e Cuidados Vocais",
          "Respiração Diafragmática na Prática",
          "Dicção, Articulação e Projeção",
          "Leitura Dinâmica de Roteiros",
          "Primeiros Passos no Lip-Sync"
        ]
      }
    },
    {
      num: "02",
      slug: "intermediario",
      title: "MÓDULO INTERMEDIÁRIO",
      teacher: "Prof. Daniel Ávila",
      duration: "4 meses",
      desc: "Sincronização labial, criação de personagens, emoção na voz e técnicas avançadas de interpretação.",
      icon: "Headphones",
      details: {
        methodology: [
          "Foco total na interpretação",
          "Foco no sincronismo",
          "Exercícios intensivos com cenas reais",
          "Filmes, séries e animações"
        ],
        lessons: [
          "Sincronismo Labial Avançado (Lip-Sync)",
          "Construção Psicológica de Personagens",
          "Dublagem de Animações e Cartoons",
          "Acesso Rápido a Emoções (Choro, Riso, Raiva)",
          "Adaptação de Sotaques e Trejeitos"
        ]
      }
    },
    {
      num: "03",
      slug: "avancado",
      title: "MÓDULO AVANÇADO",
      teacher: "Prof. Ettore Zuim",
      duration: "6 meses",
      desc: "Produção profissional, gravação em estúdio, mercado de trabalho e construção de portfólio.",
      icon: "Star",
      details: {
        methodology: [
          "Simulação de ambiente profissional",
          "Direção como dublador contratado",
          "Preparação de material de apresentação",
          "Voice Reel (Portfólio)"
        ],
        lessons: [
          "Etiqueta e Dinâmica de Estúdio",
          "Dublagem de Blockbusters e Games",
          "Direção de Dublagem na Prática",
          "Gravação do Voice Reel (Portfólio)",
          "Marketing Pessoal e Mercado de Trabalho"
        ]
      }
    }
  ],
  teachers: [
    {
      name: "Vitor Paranhos",
      role: "Módulo Iniciante",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
      specialties: ["Técnica Vocal", "Respiração", "Roteiro"],
      bio: "Com mais de 15 anos de experiência, Vitor é especialista em preparar atores para os desafios iniciais da dublagem. Já emprestou sua voz para dezenas de protagonistas em animes e séries teens."
    },
    {
      name: "Daniel Ávila",
      role: "Módulo Intermediário",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
      specialties: ["Sincronização", "Personagens", "Emoção"],
      bio: "Ator e dublador renomado, Daniel é mestre em sincronização labial e construção de personagens complexos. Diretor de dublagem em grandes estúdios de São Paulo."
    },
    {
      name: "Ettore Zuim",
      role: "Módulo Avançado",
      photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
      specialties: ["Estúdio", "Mercado", "Portfólio"],
      bio: "Uma das vozes mais icônicas do Brasil. Ettore traz sua vasta experiência em blockbusters para ensinar os segredos da atuação em alto nível e como se destacar no mercado profissional."
    }
  ],
  learnings: [
    { id: 1, title: "Leitura e interpretação de roteiros", description: "Aprenda a decodificar roteiros rapidamente, identificando intenções, pausas e emoções necessárias para cada cena antes mesmo de entrar no estúdio." },
    { id: 2, title: "Construção de portfólio profissional", description: "Saiba como gravar, editar e apresentar seu Voice Reel de forma profissional para diretores de dublagem e estúdios." },
    { id: 3, title: "Mercado de trabalho em dublagem", description: "Entenda como funciona o mercado atual, cachês, direitos conexos, como abordar estúdios e se manter relevante na profissão." },
    { id: 4, title: "Técnicas de emoção e expressividade", description: "Desenvolva a capacidade de acessar emoções genuínas rapidamente, transmitindo choro, riso, medo e raiva apenas com a voz." },
    { id: 5, title: "Técnicas profissionais de voz e respiração", description: "Domine o apoio diafragmático, projeção vocal e cuidados essenciais para manter sua voz saudável mesmo após horas de gravação." },
    { id: 6, title: "Sincronização labial precisa", description: "O famoso Lip-Sync. Treinamento intensivo para encaixar as palavras perfeitamente no movimento labial do personagem original." },
    { id: 7, title: "Criação e interpretação de personagens", description: "Técnicas de atuação para criar vozes originais para caricaturas, monstros, crianças e idosos sem forçar ou machucar as pregas vocais." },
    { id: 8, title: "Gravação em estúdio profissional", description: "Vivência prática com microfones condensadores, fones de retorno, software de gravação e a dinâmica real com o diretor de dublagem." }
  ],
  students: [
    { id: 1, name: "Lucas Silva", email: "lucas.silva@email.com", plan: "Formação Completa", status: "Ativo", date: "2026-03-20", progress: 45, avatar: "https://i.pravatar.cc/150?u=1" },
    { id: 2, name: "Mariana Costa", email: "mariana.costa@email.com", plan: "Módulo Iniciante", status: "Ativo", date: "2026-03-22", progress: 12, avatar: "https://i.pravatar.cc/150?u=2" },
    { id: 3, name: "João Pedro", email: "joao.pedro@email.com", plan: "Formação Completa", status: "Inadimplente", date: "2026-02-15", progress: 89, avatar: "https://i.pravatar.cc/150?u=3" },
    { id: 4, name: "Ana Clara", email: "ana.clara@email.com", plan: "Módulo Intermediário", status: "Ativo", date: "2026-03-24", progress: 5, avatar: "https://i.pravatar.cc/150?u=4" }
  ],
  testimonials: [
    { id: 1, name: "Carlos Eduardo", role: "Dublador Iniciante", text: "A melhor decisão da minha carreira. Os professores são incríveis e a estrutura é de outro mundo. Já consegui meus primeiros testes!", avatar: "https://i.pravatar.cc/150?u=11" },
    { id: 2, name: "Fernanda Lima", role: "Atriz e Dubladora", text: "Consegui meu primeiro papel em uma série de streaming graças ao portfólio que montei no curso. O módulo avançado é um divisor de águas.", avatar: "https://i.pravatar.cc/150?u=12" },
    { id: 3, name: "Roberto Alves", role: "Locutor", text: "A transição da locução para a dublagem foi muito mais suave com as técnicas de lip-sync ensinadas pelo Daniel Ávila. Recomendo a todos.", avatar: "https://i.pravatar.cc/150?u=13" }
  ],
  faqs: [
    { id: 1, question: "Preciso ser ator formado para começar o curso?", answer: "Não é obrigatório ter DRT (registro de ator) para iniciar os estudos e aprender as técnicas. No entanto, para atuar profissionalmente no mercado de dublagem brasileiro, o registro de ator é exigido por lei." },
    { id: 2, question: "As aulas são presenciais ou online?", answer: "Oferecemos um formato híbrido exclusivo. A base teórica e os exercícios iniciais podem ser feitos online, mas a prática em estúdio (Módulo Avançado) é essencial e realizada presencialmente em nossos estúdios parceiros." },
    { id: 3, question: "Qual equipamento preciso ter em casa?", answer: "Para o módulo iniciante, um bom fone de ouvido e o microfone do seu celular ou computador são suficientes. Ao avançar, recomendaremos equipamentos de home studio (microfone condensador, interface de áudio) caso queira praticar com qualidade profissional." },
    { id: 4, question: "O curso garante testes em estúdios de dublagem?", answer: "Nenhum curso pode garantir testes ou aprovações, pois isso depende do seu talento e dedicação. Porém, nosso Módulo Avançado foca na criação de um Voice Reel profissional e promovemos bancas com diretores de dublagem convidados para avaliação dos alunos." }
  ],
  recentActivity: [
    { id: 1, user: "Lucas Silva", action: "concluiu a aula", target: "Respiração Diafragmática", time: "Há 5 min", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: 2, user: "Mariana Costa", action: "enviou um ticket", target: "Dúvida Financeira", time: "Há 12 min", avatar: "https://i.pravatar.cc/150?u=2" },
    { id: 3, user: "Sistema", action: "pagamento aprovado", target: "João Pedro", time: "Há 1 hora", avatar: "https://ui-avatars.com/api/?name=S&background=0D8ABC&color=fff" },
    { id: 4, user: "Ana Clara", action: "ganhou a conquista", target: "Primeira Gravação", time: "Há 2 horas", avatar: "https://i.pravatar.cc/150?u=4" }
  ],
  settings: {
    supabaseUrl: "",
    supabaseAnonKey: "",
    siteName: "StudioVoice Pro",
    contactEmail: "contato@studiovoice.com"
  },
  enrollments: []
};
