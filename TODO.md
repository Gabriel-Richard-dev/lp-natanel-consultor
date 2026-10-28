# TODO — Alves Costa

Foco do site: deixar de ser a página pessoal do Natanael e virar a marca **Alves Costa** ("A chave da felicidade é sonhar.").

## 1. Rebranding Alves Costa
- [x] Logo nova (`web/src/assets/logo/logo-alves-costa.png`, fundo transparente) no hero, catálogo e painel
- [x] Paleta: verde/esmeralda → dourado do logo sobre preto-azulado
- [x] Textos em nome da empresa (hero, sobre, contato, catálogo, simulação, mensagens do WhatsApp)
- [x] Tirar fotos e CRECI pessoais do Natanael das páginas públicas
- [x] `index.html` (título, descrição), favicon, README
- [x] Painel admin: logo, saudação sem o nome do Natanael, tela de login sem a foto
- [ ] Link de e-mail removido do contato (era do domínio do Natanael); recolocar quando houver e-mail da Alves Costa
- [ ] Instagram do rodapé ainda aponta para instagram.com genérico

## 2. Referência de estrutura: https://ergueimoveis.com.br
- [x] Cabeçalho fixo com menu (Imóveis, Receba ofertas, Financiamento, Quem somos, Contato) e botão de WhatsApp
- [x] Faixa com as construtoras, formulário de captação (comprar / investir / vender), botão flutuante de WhatsApp e rodapé
- [x] Cidades em destaque: já existe "Onde atuamos" (mapa); falta trocar por cards com foto
- [x] "Anunciar imóvel": opção "Vender meu imóvel" no formulário de captação
- [x] Busca rápida no hero (cidade, fase, quartos) que abre o catálogo já filtrado
- [ ] Filtro por tipo de imóvel (apartamento/casa) e por código, como no exemplo
- [x] Filtro por fase (lançamentos, em obras, prontos) no catálogo
- [ ] Seção de locação (o portal não traz aluguel; precisa de outra fonte ou cadastro manual)
- [ ] Endereço e telefones fixos no rodapé (dependem do item 6)

## 3. Trocar o scraper do Chaves na Mão pelo portal Habitnet
Fonte: https://imoveis.habitnet.com.br/pedro-pimenta (HTML pronto, sem API).
- [x] `api/app/habitnet.py`: lê a vitrine de cada construtora, guarda a foto no MinIO, não rebaixa o que já tem (1º sync ~45 s, seguintes ~2 s)
- [x] Testes do parser (`api/test_app.py`) e teste real com Postgres/MinIO descartáveis: 90 empreendimentos, todos com fase e foto
- [x] Migração: `preco` opcional, colunas `construtora`, `fase`, `entrega`; `chaves_na_mao` removido (rota, módulo, variável de ambiente, rótulos no painel)
- [x] Cards sem preço mostram "Consulte valores"
- [ ] **Confirmar autorização** da Habitnet/Pedro Pimenta para republicar o conteúdo e **para quem os botões devem levar** (hoje levam ao WhatsApp da Alves Costa)
- [ ] Rodar o sync em produção (botão "Atualizar agora" no painel) e checar se o IP da VPS não é bloqueado como foi no Chaves na Mão
- [ ] Agendar o sync (cron) depois de confirmar que o IP da VPS passa

## 4. Construtoras
Todas as 10 existem no portal e estão sendo lidas: Victa, MRV, Direcional, Pra Morar Brasil, M.Lar, Engeplan, Casas Manager, CMM, Tenda e CR Duarte.
- [x] Filtro por construtora no catálogo
- [ ] Logos das construtoras na faixa (hoje só os nomes; precisa de autorização de uso das marcas)

## 5. Melhorar o site como um todo
- [x] Responsivo mobile do cabeçalho, hero e formulário conferido
- [x] Painel: tela de Contatos (leads) com "Chamar", "Atendido" e excluir
- [x] Catálogo: paginação ("Mostrar mais"), filtros na URL (link compartilhável, funciona com o botão voltar), barra de filtros compacta no celular (39.851 px → 11.375 px de altura)
- [x] Detalhe do imóvel em diálogo (foto, ficha, WhatsApp e "Quero que me liguem" que grava o contato com o imóvel)
- [x] Home: carregando/erro/lista vazia nos imóveis; respeita "reduzir movimento"; foco de teclado visível
- [ ] Revisar o mapa "Onde atuamos" no celular (rótulo de Maracanaú some) e o simulador
- [ ] Peso da logo (hoje ~310 kB) e carregamento das imagens
- [ ] Acessibilidade (contraste do dourado sobre claro, foco de teclado)
- [ ] SEO: Open Graph com a logo, descrição por página
- [ ] Prova social: depoimentos reais, números, selo CRECI da empresa (depende do item 6)
- [ ] Avisar o corretor quando chega contato novo (e-mail ou WhatsApp); hoje só aparece no painel

## 6. Dados que só o cliente sabe
- [ ] WhatsApp da Alves Costa (hoje é o número do Natanael)
- [ ] CRECI da empresa
- [ ] E-mail, endereço e Instagram oficiais
- [ ] Natanael continua como corretor da equipe? (define se aparece em "Sobre")

## 6. Landing nova (branch `landing-nova`)
Fonte do estado anterior: branch `wip-habitnet`. Referência de estrutura: https://ergueimoveis.com.br
- [x] Visual: preto e dourado da marca (tokens `fundo-marca`, `marca`, `preto`, `gold`), Bricolage Grotesque + Figtree; hero com foto de empreendimento e busca compacta
- [x] Campos e selects com um só estilo (`.campo` em `index.css`); `cursor: pointer` global nos botões
- [x] Hero: foto em janela de arco que alterna entre 4 empreendimentos reais, com etiqueta de chaveiro (detalhes e bolinhas), lema da marca com a chave e busca com controles segmentados (fase, quartos) e contagem ao vivo
- [x] Faixa de números logo após o hero; "Onde atendemos" com foto de empreendimento de cada cidade; "Como funciona" em linha do tempo
- [x] Transições: seções como "folhas" sobrepostas com cantos arredondados e sombra (`.folha`), fundo prata no lugar do branco puro
- [x] Elementos de marca: arcos (hero e "Quem somos"), silhueta de prédios (eco das barras da logo), planta baixa sutil no hero, etiquetas de construtora com contagem
- [x] Removido o lema "A chave da felicidade é sonhar" do texto do site (continua dentro da imagem da logo)
- [x] Navbar em pílula flutuante: seção ativa em destaque, linha de progresso da rolagem e "Aberto agora"
- [x] Hero: busca única (bairro, cidade ou construtora, com sugestões) e atalhos por fase; "lar" com gradiente animado e brilhos; carrossel com zoom suave, barra de progresso, setas e arrastar
- [x] Efeitos de rolagem: números que contam, arcos que abrem, prédios que crescem, paralaxe do arco, itens que entram escalonados (todos respeitam "reduzir movimento")
- [x] Catálogo e card de imóvel no tema claro; régua do simulador redesenhada
- [x] Textos revisados com o humanizer (sem promessas sem base, sem repetição)
- [x] Filtros: componente `Segmentado` no hero e no catálogo, barra do catálogo em duas linhas
- [x] Ritmo de fundos: Empreendimentos, Onde atendemos e Contato em branco; o resto escuro
- [x] Quatro cidades atendidas (Fortaleza, Eusébio, Maracanaú e Caucaia) em `lib/cidades.ts`; cidade sem empreendimento leva ao formulário
- [x] Seções: imóveis (1 destaque + lista), construtoras, onde atendemos, simulador, como funciona, quem somos, contato com formulário
- [x] Horário de atendimento (seg a sex 8h às 18h, sáb 8h às 14h) em `lib/atendimento.ts`, com "Aberto agora" no fuso de Fortaleza
- [x] Removidos: mapa "Onde atuamos", partículas, parallax/tilt na home, scroll reveal (ainda no `wip-habitnet`)
- [x] Catálogo, diálogo do imóvel e `OfertaCard` na identidade nova (o preview do admin usa o mesmo card)
- [ ] Revisar com fotos reais: os testes visuais foram feitos com dados de exemplo e sem imagens
- [x] Logo em WebP (310 kB para 48 kB)
- [ ] Seção de locação e busca por código (como no Ergue) dependem de dados que a Habitnet não traz
