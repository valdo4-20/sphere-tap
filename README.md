# Sphere Tap

PWA estática para acompanhar consumo, gastos e cuidado pessoal. React + Vite + Tailwind CSS + Lucide React. Interface em português e identidade do Sphere UI Kit fornecido pelo usuário, sem player ou motor musical.

## Executar

Node.js 22.12+ e npm:

```powershell
npm ci
npm run dev
```

Abra o endereço impresso pelo Vite. Para testar a versão de produção:

```powershell
npm test
npm run build
npm run preview
```

`dist/` contém o app pronto para hospedagem estática. Use um servidor HTTP local ou HTTPS na hospedagem, não o arquivo HTML aberto diretamente.

## Publicar gratuitamente no GitHub Pages

1. Crie um repositório público no GitHub e envie o código para a branch `main`. Não envie `node_modules/`, `dist/` nem dados locais de testes.
2. Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**.
3. O workflow `.github/workflows/deploy.yml` executa `npm ci`, os testes e o build, e publica `dist/`.
4. Acompanhe em **Actions → Deploy to GitHub Pages**. A URL final aparece em **Settings → Pages** e no ambiente `github-pages`.
5. O endereço usual é `https://SEU_USUARIO.github.io/sphere-tap/`. A configuração `base: './'` preserva caminhos relativos para assets, manifesto e service worker no subdiretório do repositório.

Se ainda não houver Git neste diretório:

```powershell
git init
git add .
git commit -m "Cria Sphere Tap PWA"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/sphere-tap.git
git push -u origin main
```

Substitua usuário e repositório. Use repositório público para GitHub Pages em conta GitHub Free. Nenhum pagamento, cartão, assinatura, Firebase ou backend é necessário.

Documentação oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Instalação e offline

- **iPhone / Safari:** abra o site HTTPS, Compartilhar → Adicionar à Tela de Início.
- **Android / Chrome:** use Instalar aplicativo no menu do navegador ou o controle correspondente nas configurações do Tap.
- Primeiro acesso exige conexão. O build de produção armazena a interface, os ícones e a fonte local em cache para os próximos acessos offline.
- Service worker e instalação exigem HTTPS ou localhost. O contador funciona também em HTTP na rede local, graças ao identificador com fallback quando `crypto.randomUUID` não está disponível.
- O servidor de desenvolvimento não ativa a PWA; use build + preview para testar offline.

## Experiência

- Abertura líquida original do kit adaptada para `sphere. tap`, uma vez por sessão, com Pular e opção de rever.
- Boas-vindas em quatro etapas, nome/apelido opcional, intenção de acompanhar/reduzir/parar, demonstração isolada dos dados reais e explicação de privacidade.
- Guia contextual de sete passos na interface real, com Voltar, Próximo, Sair e navegação sem compactação durante o guia.
- Saudação `Olá, [nome].`, gradiente animado do Sphere e frase que muda com o horário. Nome editável em Configurações.
- Carcaça visual copiada do kit: tokens, fonte, marca, vidro, navegação, transições e compactação ao rolar. Sem player, áudio ou contexto musical.

## Registros e custos

- Tocar no centro da AURA registra +1 da categoria selecionada. O número central mostra a quantidade dessa categoria hoje.
- Uma ocasião corresponde a um registro. Quantidades de unidades e de sessões são apresentadas separadamente. Gramas são opcionais e não são deduzidas de um item.
- Horário, categoria, quantidade, gramas, custo e nota são editáveis. Registros podem ser excluídos; o aviso permite desfazer a última alteração.
- Preços começam como **não informados**. Zero explicitamente salvo significa custo zero. Alterar preços ou nomes não recalcula custos históricos; categorias usam IDs estáveis.
- Compras representam desembolso real. Custos dos registros representam consumo estimado. Esses dois valores nunca são somados como se fossem despesas diferentes.
- Compra pode atualizar o custo sugerido de novos registros, por opção explícita. Gramas só calculam custo quando o consumo informa gramas; unidades e sessões devem combinar com a categoria. O app não faz controle de estoque ou rateio automático entre lotes.
- O ajuste de total diário vale para uma categoria, reduz registros recentes e seus custos/gramas proporcionalmente, ou adiciona a diferença com o preço atual.

## AURA semanal e retrospectiva

A AURA principal fica livre no topo, sem um painel fechado. A cor da categoria identifica o seletor; a expressão da AURA principal reflete o histórico semanal.

- A janela considera os últimos 7 dias, com frequência medida em ocasiões registradas, não em quantidade de substância.
- Ausência de registro significa **sem informação**, salvo quando a pessoa confirma o dia sem consumo.
- Para comparar semanas, usa apenas pares do mesmo dia da semana com informação em ambas, exigindo pelo menos 3 pares. A cobertura é sempre visível.
- Sem informação suficiente, a expressão é neutra. Pausas confirmadas e menor frequência recebem movimento mais tranquilo. Mais consumo não dá mais brilho, tamanho, pontos ou recompensas.
- O pequeno retorno visual ao toque confirma o registro e não depende do volume acumulado.
- A retrospectiva mensal reproduz um quadro por dia já decorrido. Cada quadro usa apenas os 7 dias anteriores àquela data. Há reprodução/pausa, avanço manual, seletor de mês e linha do tempo com dias desconhecidos distintos de pausas.
- Movimento reduzido usa exploração manual. AURA pode ficar estática por escolha nas configurações. O canvas limita resolução e taxa de quadros e evita desenhar com a aba oculta.
- A AURA é uma interpretação visual do histórico, **não mede saúde, dependência, tolerância, recuperação ou segurança**.

## Cuidado e privacidade

Check-in, humor, notas e diário de vontade são opcionais. Registrar vontade não adiciona consumo. Intenção de pausa pode ser iniciada e encerrada sem apagar histórico; seu relógio não comprova abstinência. Dias sem consumo precisam ser confirmados individualmente.

Metas de frequência e orçamento são opcionais, inicialmente desativadas. O app não propõe uma quantidade segura ou recomendada. Lembretes de check-in são opt-in e aparecem apenas enquanto o app estiver aberto; não há promessa de push em segundo plano.

Os dados ficam em `localStorage`, na chave `sphere-tap-v1`, com esquema interno versão 2. Não há conta, rastreamento, sincronização, anúncios ou pagamento. Outros navegadores, dispositivos e endereços não recebem automaticamente o histórico. Limpar o navegador pode removê-lo.

Exporte backup JSON completo regularmente. Ele contém os dados em texto simples, sem criptografia. Há CSV dos registros (campos livres neutralizados contra fórmulas em planilhas), restauração validada com confirmação e exclusão dos dados mediante digitar APAGAR. Guarde backups em local seguro.

Dados antigos são migrados sem apagar registros. Zeros do esquema inicial, que não distinguia preço ausente de gratuito, são apresentados como desconhecidos e conservados também em `legacyPrice`/`legacyCost` para auditoria e correção manual. Dados corrompidos existentes não são sobrescritos silenciosamente; a interface oferece exportação para recuperação.

## Estrutura

```text
src/
  main.jsx                 Entrada React, sem remontagem em atualizações de UI
  App.jsx                  Estado, persistência, migração, ações e diálogos
  model.js                 Datas, custos, validação, AURA e retrospectiva
  model.test.js            Testes das regras de dados e comparações
  SphereShell.jsx          Carcaça e navegação sem player
  sphere/shell.css         Estilos extraídos do Sphere UI Kit
  sphere/LiquidSignature.* Assinatura líquida original adaptada
  sphere/*.glsl            Shader da abertura
  useSphereNavigation.js   Lógica de rolagem do kit
  Greeting.jsx             Saudação personalizada conforme horário
  Welcome.jsx              Boas-vindas e guia contextual
  Today.jsx                AURA no topo, registro e resumo semanal
  HistoryCare.jsx          Calendário, check-ins, cuidado e metas
  Insights.jsx             Análises, compras e retrospectiva mensal
  Settings.jsx             Nome, categorias, preços e privacidade
  Forms.jsx                Compras e vontades
  ui.jsx                   Modal, seletor, edição e componentes comuns
  Aura.jsx                 Expressão visual semanal em canvas
  DotCounter.jsx           Número em matriz de pontos
  style.css                Tokens e controles base do Sphere
  tap.css                  Layout e conteúdo específico do Tap
  responsive.css          Medalhas transparentes e escala para telas pequenas
public/                    Fonte, marca e ícones locais
vite.config.js             Base relativa e PWA com cache offline
.github/workflows/deploy.yml
```

## Validação

20 testes automatizados cobrem datas locais, identificador em HTTP, custos conhecidos/desconhecidos, migração, dias sem informação, comparações com cobertura suficiente, retrospectiva sem dados futuros, unidades, ajuste por categoria, preservação de preços históricos, CSV e saudação.

Fluxos de boas-vindas, guia, contador no IP local, modal, importação, reprodução mensal, compras e diário de vontade conferidos no navegador. Abertura offline e disponibilidade da fonte confirmadas no build de produção, com rede desativada. Layout conferido também em largura CSS de 388 px sem overflow horizontal. Histórico fictício para QA foi usado em uma origem separada, sem misturar com o histórico do usuário. Instalação física em iPhone/Android e publicação na conta GitHub continuam pendentes.

## Ajustes visuais de 06/11/2026

A AURA é um fundo fixo de tela inteira. Sua cor é escolhida pelo usuário; a evolução semanal continua influenciando o ritmo, sem recompensar volume alto. A saudação usa a cor ativa. O nome `sphere. tap` e a marca ficam em lados opostos no topo; após 7 segundos sem interação, apenas `tap` recua com fade e reaparece ao interagir.

Os nomes do que se consome são texto livre, com unidade editável e paleta de cor própria. O nome padrão Baseado passa a Cannabis, preservando nomes personalizados, IDs, registros e valores. Não há catálogo, fotografias ou lista de variedades.

O contador usa números lisos e animação curta de confirmação, também na demonstração. O calendário é somente de consulta; edições ficam em Gerenciar registros. A retrospectiva usa dias circulares e controle de mês com setas, sem slider nativo. Controles e superfícies receberam acabamento de vidro mais transparente.

As oito propostas (Cristal, Sereno, Ametista, Aurora, Oceano, Âmbar, Pérola e Neve) estão em Configurações e na prancha `public/paletas.html`. Temas claros usam a marca escura; temas escuros usam a branca. As opções são propostas para escolha do usuário, não aprovação presumida da paleta final.

Validação desta revisão: build concluído e 22 testes passando. A prancha e as configurações foram inspecionadas no navegador; instalação física e publicação continuam pendentes.

## Revisão de abertura e AURA

A primeira experiência pede nome, nascimento e perfil (ícone, emoji ou foto), apresenta acessos opcionais e termos, prepara o ambiente local e explica o uso. Não há contador de etapas nem barras de progresso. Pode ser revista nas configurações. Perfil e nascimento entram no backup JSON e podem ser alterados em Configurações.

Fotos são recortadas localmente em 256 × 256 e salvas como JPEG no perfil. Câmera usa apenas vídeo, é encerrada ao sair/capturar e exige HTTPS ou localhost. O acesso a fotos usa o seletor de arquivos, sem permissão ampla ao armazenamento. A opção de persistência solicita navigator.storage.persist quando disponível; sua concessão depende do navegador e não substitui backup.

AURA usa agora AuraSurface e dependências do Sphere UI Kit em src/sphere-engine, com adaptador em src/Aura.jsx. O adaptador remove a dependência de playback/tema do Sphere, aceita a cor escolhida e permite congelar a superfície. Não há player ou captura de áudio. O renderer mantém seu movimento ambiente com limite de 30 FPS. Registrar +1 causa uma breve contração e redução de opacidade; não aumenta brilho ou intensidade. O aviso informa o custo acrescentado ou a ausência de preço.

Análises inclui um gráfico radial orgânico por dia da semana, com consumo em ocasiões e custos conhecidos. A escala é relativa ao maior valor registrado no período; não é uma pontuação de saúde. Custos ausentes aparecem como informação incompleta.

Validação: 24 testes de dados e build estático. Cadastro até termos e incremento com custo conferidos no navegador em origem isolada. Aceite de termos e permissões reais ficam para a escolha da pessoa; câmera física e instalação em iOS/Android não foram validadas em dispositivo nesta revisão.

A preparação inicial dura 14 segundos, com mensagens espaçadas e movimento gradual, sem contador ou linhas de etapas. A animação respeita a preferência de movimento reduzido.


## Revisão de itens, presets e interação

Novos perfis começam sem itens escolhidos. O menu inicial e o seletor permitem adicionar um item com nome, unidade de registro, cor e preço por unidade, pacote/conjunto, peso ou ambos (unidade e grama). No granel, o peso de cada registro é opcional: sem ele, o custo do toque continua desconhecido. Itens podem ser ocultados sem apagar lançamentos. Modelos antigos sem personalização ou uso ficam em Itens ocultos na migração; itens com registros continuam disponíveis.

Unidades de registro aceitas: item, sessão, pacote/conjunto e grama. Os custos ficam salvos em cada lançamento, sem recalcular o passado ao editar preços. A modelagem de compra separa preço pago, quantidade comprada e custo por registro.

Cada +1 aciona uma pulsação breve da AURA, sem brilho acumulado por consumo. Movimento reduzido suprime essa animação. O contador rola verticalmente para cima. A indicação permanente diz “Registrar o que já consumiu”.

Cada item pode escolher uma reação automática, um sinal de atenção ou um tom neutro. A sugestão automática reconhece tabaco, doces e nomes que indiquem uso fumado/inalado; Cannabis sem informação da forma de uso permanece neutra. A configuração é editável por item e não é uma avaliação médica. Cada +1 aciona uma pulsação independente da AURA, sem círculo seguindo o ponteiro; toques rápidos não interrompem as pulsações anteriores. O texto usa humor leve, sem bronca, prêmio ou julgamento.

O formulário de registro usa controles e espaçamentos mais compactos para caber melhor na tela móvel sem ocupar quase toda a área visível.

Os presets Personalizada, Cósmica, Horizonte de Eventos, Eclipse, Frequência e Oblivion usam cartões compactos de escolha. Os cinco presets nomeados vêm do renderer Sphere. As prévias dos cartões usam o próprio motor AURA ao vivo, limitadas a 12 FPS e pausadas fora da área visível.

A navegação móvel usa o vidro e os botões compactos da barra de reprodução Sphere, com cinco destinos substituindo os controles de mídia. A largura se ajusta discretamente ao rolar e todos os destinos continuam visíveis e clicáveis. Logo sem recorte, controles mais curtos, paletas menores e contraste nos temas Pérola/Neve e avisos foram revisados.

Os controles e a função de música foram retirados por decisão do usuário. A marca fica no topo, desaparece ao rolar para baixo e reaparece ao subir ou voltar ao topo. O fade de tap acontece no próprio lugar.

Validação desta revisão: 29 testes de dados e preço. Cadastro sem itens, custo de granel (R$ 20 / 100 g × 0,5 g = R$ 0,10), presets, navegação e contraste foram conferidos no navegador com dados fictícios. Nenhum registro foi acrescentado à origem principal do usuário durante esses testes.


## Perfil e conquistas

O botão Perfil abre a página pessoal com avatar (foto, emoji ou ícone), nome, frase opcional e até três medalhas em destaque. A coleção tem filtros e paginação de 18 em 18. Os dados são privados e locais, incluídos no backup JSON.

Foram adaptadas 116 medalhas do catálogo Sphere-UI-Kit/achievements. O metal, o esmalte e os acabamentos originais foram preservados, com novos motivos Lucide e marcos de pausa/cuidado. Os SVGs e licenças estão em public/achievements; o script scripts/adapt-medals.mjs permite regenerá-los a partir do catálogo.

A apresentação usa camadas com profundidade CSS 3D, reflexo, inclinação ao ponteiro e giro de reconhecimento. O som curto original é opcional e pode ser silenciado em Configurações. A notificação de conquista é compacta e não oferece controle de som. Movimento reduzido desativa os efeitos de giro. Reconhecimentos antigos não são todos celebrados novamente ao abrir o app.

Consumo alto, número de itens consumidos e intensidade de vontade não geram vantagem. Pausas exigem confirmação e não precisam ser consecutivas. As medalhas reconhecidas permanecem se a pessoa voltar a registrar consumo. A comparação de redução usa quantidades de dias comparáveis, não apenas número de lançamentos; não pode haver aumento em outro item ou no peso conhecido. Nenhum marco é uma avaliação de saúde.

A navegação permanece em uma barra compacta de vidro inspirada na barra de reprodução Sphere; todos os destinos continuam visíveis e clicáveis durante a rolagem.

Validação: build estático e 38 testes; fluxos de perfil, edição, coleção, detalhes e reconhecimento conferidos em origem de teste separada. Layout sem overflow horizontal na largura CSS de 358 px. Captura de apresentação salva em preview-perfil-medalhas.png. Instalação física em iOS/Android e publicação no GitHub não foram realizadas nesta revisão.


## Carteira e perfil · revisão de 7 de novembro de 2026

A navegação tem Hoje, Progresso, Carteira e Perfil. Caminhada, mapa e solicitação de GPS foram removidos. Percursos antigos em backups continuam preservados e validados apenas para compatibilidade; não são apresentados nem usados para novas conquistas.

A Carteira calcula em centavos a diferença entre gastos e recebimentos informados no período. A pessoa escolhe compras ou custo do consumo como base; os dois nunca são somados. Exemplo: R$ 90,00 − R$ 10,00 = R$ 80,00 de gasto líquido. Cada recebimento pode ser classificado manualmente como lucro, reembolso ou outro. Pode ser editado e excluído, com a ação de desfazer do app. Custos ausentes deixam o cálculo do consumo incompleto; zero só vale quando informado. Valores recebidos acima dos gastos são apresentados como excedente, não como lucro presumido. A economia estimada por referência e a economia editada manualmente continuam identificadas separadamente. Não existe depósito, saque, saldo bancário ou movimentação de dinheiro.

O perfil mostra uma sequência informativa de dias com tap, sem prêmio ou incentivo ao consumo. Conta dias distintos até hoje ou ontem; uma lacuna encerra a sequência atual. As 116 conquistas de cuidado ficam visíveis, com filtros e paginação. Meu cuidado é centralizado.

A moeda de detalhe usa Three.js, espessura real, relevo, bordas serrilhadas e iluminação metálica. O arraste tem resistência dependente do ângulo, rotação suavizada e inércia com amortecimento; sem oscilação automática. Teclado e alternativa CSS continuam disponíveis.

Validação local: `npm test` e `npm run build`. O teste isolado de Carteira confirmou R$ 90,00 − R$ 10,00 = R$ 80,00, incluindo classificação e gravação do recebimento. Os testes cobrem centavos, datas, custos ausentes, importação/backup e sequência de dias. A avaliação física do gesto e desempenho em dispositivos móveis continua necessária.

Referências de cuidado: [Hancox et al., 2015](https://pubmed.ncbi.nlm.nih.gov/25837035/) e [CDC](https://www.cdc.gov/tobacco/about/benefits-of-quitting.html). Não são usadas para prometer recuperação individual.
## Atualizações pelo app · 1.0.1

Fluxo adaptado do Sphere (`PwaLifecycle`, `appUpdates`, `AppUpdateCard`): aviso animado com órbitas/AURA e logo circular Sphere, opções Depois e Atualizar. Perfil → Preferências do perfil permite Buscar atualização ou Ver atualização. Depois guarda a oferta por build, mas a atualização continua acessível nas configurações.

O service worker é registrado com `updateViaCache: none`; verifica ao abrir, voltar ao app, recuperar conexão e periodicamente quando visível. A versão nova aguarda escolha do usuário. Atualizar salva o estado validado no localStorage, solicita ativação e só recarrega após a troca do controlador. Falha no salvamento impede a ativação. Não limpa localStorage nem dados do usuário. Atualização ativada por outra aba também pode ser oferecida para recarregar esta aba.

Teste local com dois builds de produção e service worker real: detecção, Depois, reabertura nas configurações, ativação e reload para o novo arquivo JavaScript, mantendo nome e R$ 123,45 informados na Carteira. 61 testes automatizados passaram. Safari/iPhone físico ainda precisa de validação pelo usuário.

Na primeira migração de uma versão anterior sem esse fluxo, o modal só existe depois que o novo código carregar. Pode ser necessário fechar todas as abas do Tap e o app instalado e reabri-lo, para o worker anterior deixar de controlar a página. Não apagar os dados do site: eles contêm o histórico local.

A paleta do aviso pertence à atualização, não ao tema pessoal. `src/updateRelease.js` define versão, novidades e `palette` (fundo, neutro, destaque e texto), publicados junto com o build. O modal inteiro usa essa paleta, incluindo a AURA e os botões. Releases sem paleta explícita recebem uma alternativa estável por versão. A atualização de UI atual usa violeta; outros lançamentos podem definir outra identidade. 63 testes automatizados passaram após essa adaptação.
## Jornada · versão 1.1.0

Em Hoje, toque em Jornada. A barra de navegação existente continua com Hoje, Progresso, Carteira e Perfil.

- Modo Rolê começa no nível 1 e continua sem mostrar um nível final. Só nove etapas próximas são renderizadas.
- Modo Pessoal acompanha internamente a dificuldade do Rolê e mantém seu avanço de treino separado.
- Cada rodada tem vinte perguntas. A curva 5/10/5 é interna; a UI não revela suas regras.
- Estrelas acumuladas mudam de identidade: amarelo, laranja, vermelho, roxo, azul, fogo, gelo e prismático. XP e nível de jogador são separados das estrelas.
- Notas musicais, partículas e shader formam o cenário, sem modificar a AURA. Cristais e pedras foram retirados. As animações são restritas à Jornada, respeitam movimento reduzido e não alteram a navegação.
- Progresso, XP e estrelas são incluídos no backup JSON oficial em `journey`. Backups antigos continuam válidos e iniciam a Jornada em zero. Registros de consumo, custos e medalhas de cuidado não rendem pontos no jogo.
- Os dados de teste pertenciam a outra pasta/endereço e não são transferidos automaticamente entre domínios ou aparelhos.

### Conteúdo e fontes

O acervo local tem 84 perguntas, com oito desafios numéricos gerados por rodada. A geração foi testada em 10.000 conjuntos distintos e continua além deles. O acervo editorial pode se repetir; não são 200.000 perguntas editoriais inéditas.

Os dados de países/capitais foram consultados em Wikidata em 2026-11-07 e são CC0: [licença](https://www.wikidata.org/wiki/Wikidata:Licensing). Fonte por entidade e cópia dos dados: `public/quiz/geography.json` e `src/quizGeography.js`.

Enunciados locais de ciência, história, música, lógica e acontecimentos de 2024/2025 incluem referências da NASA, UNESCO, Nobel Prize, Panam Sports e do canal oficial da Academia do Oscar. As referências aparecem após responder. Open Trivia DB e The Trivia API foram pesquisadas, mas não são dependências do jogo nem serviços pagos integrados.

### Progressão para manutenção

Estrelas por rodada: 3 com pelo menos 80% de acertos, 2 com pelo menos 50%, 1 nos demais casos. Classes acumuladas mudam em 0, 15, 40, 80, 140, 220, 340 e 500 estrelas.

XP = arredondar((10 × acertos + 40 pela conclusão + 60 se gabaritar) × (1 + 0,1 × piso((nível do desafio − 1) / 10))). No Pessoal, o desafio usa o próximo nível do Rolê. Subir do nível de jogador N ao N+1 exige 200 + 100 × (N−1) XP; excedentes permanecem. Resultados inválidos ou conclusões já creditadas não repetem a recompensa.

### Validação

76 testes aprovados, build PWA aprovado e verificação de renderização React dos dois modos/acesso em Hoje. Cobertura inclui 10.000 rodadas, continuidade do mapa, XP, transições de cor, independência entre modos, backup e regressões de navegação existentes. Os arquivos da barra de navegação e seus estilos compartilhados não foram modificados. Nesta integração não houve nova revisão visual pelo navegador, pois o controle local estava desativado; a confirmação no iPhone permanece manual.

## Jornada 1.1.1

Tap/Hoje permanece primeiro; Jornada passa a ser o segundo botão da barra, antes de Progresso, Carteira e Perfil. Somente a grade necessária para cinco destinos foi adaptada; o fundo de vidro e a seleção de botão inteiro foram preservados.

Selecionar o nível reproduz um toque discreto, vibração de 8 ms quando suportada e tremida visual. A seleção revela o botão Entrar com o XP máximo possível; não entra diretamente. O valor efetivo depende dos acertos. X/Escape abre confirmação de saída; cancelar conserva a pergunta/rodada. A conclusão já salva não é desfeita ao fechar o resultado.

Botões, chegada de pergunta e conclusão têm sinais sonoros diferentes. Sons da Jornada podem ser desligados nas configurações; Som de conquista segue sua preferência própria. Áudio só é iniciado por gesto; a ausência de Web Audio/vibração não impede jogar. Notas musicais somem totalmente e reaparecem com fade, de forma escalonada. Movimento reduzido é respeitado.

O resultado anima o XP real indo para a barra e os números até o valor final, incluindo passagens de nível; a animação não altera XP salvo nem credita novamente. As 12 medalhas da Jornada contam apenas rodadas concluídas em Pessoal/Rolê. Estão na Jornada e nos filtros do perfil. Assets preservam os materiais do kit com ícones Compass/Sparkles. Regerar apenas essas medalhas: node scripts/build-journey-medals.mjs.

Pessoal usa conhecimentos cotidianos, lógica, música básica e números, sem perguntas sobre atletas, premiados ou capitais específicas. Rolê mantém cultura geral variada. As três fases internas e as 20 perguntas continuam; falta de fatos elegíveis é preenchida por desafios numéricos únicos, sem diminuir a rodada.

Validação: 78 testes de lógica/dados, renderização React da Jornada e ordem da navegação. Controle do navegador estava indisponível; animações, som e vibração ainda precisam de teste visual/auditivo em aparelho.

### 1.1.2 — Jornada diária

- Pessoal libera um capítulo por data local e permite uma conclusão por dia. Concluir não libera o próximo capítulo antes da data. Dias anteriores e recompensas são preservados; no retorno, capítulos pendentes seguem em ordem, um por dia.
- Progresso anterior é preservado: o próximo capítulo recebe a data da primeira abertura após a atualização. Datas e última conclusão acompanham o backup.
- Cada capítulo pessoal tem 30 desafios autorais em cinco etapas, com seis modalidades: observação, conexões visuais, padrões, horários, orçamento e ordenação. A distribuição muda diariamente; conteúdo e alternativas são reproduzíveis por nível. O Rolê continua com 20 perguntas.
- A cor muda por semana de sete capítulos. Cada nó mantém a cor da própria semana.
- O mapa mantém as linhas dentro da largura disponível e centraliza o nível atual. A pressão do botão é encerrada em soltura, cancelamento, perda de captura, teclado e saída da janela.
- O cenário usa um gradiente estático; a AURA de fundo fica congelada na Jornada. Entradas são fades curtos por linha, sem animação por letra ou movimentos decorativos infinitos.
- Referência de progressão: [assistência oficial do Criminal Case](https://www.criminalcase.com/help/pt_BR.html), com capítulos, estrelas e retorno diário. Não há perda de progresso por ausência.

### 1.2.0 — Temas, amigos e momentos de conquista

- Entrada de nível, abertura de cadeado na data e conclusão usam animações curtas de transformação/opacidade, respeitando reduzir movimento. O desbloqueio visto acompanha o backup. Não há seta no botão de entrada nem observação sobre XP no mapa.
- Perguntas têm cores por tema e oito mensagens de acerto alternadas. Cinema, Geek, Música e Países aparecem junto a Matemática, História, Ciências, Corpo Humano, Arte, Esportes e Lógica. Perguntas novas usam fontes exibidas após a resposta (Oscar, Nintendo, Mojang, Lucasfilm, Louvre, STF e OpenStax).
- Perfil tem áreas próprias para Conquistas e Amigos. Novas conquistas aparecem em fila após fechar o quiz, com entrada/medalha/saída animadas; conquistas não ocupam o mapa da Jornada.
- Amigos são perfis locais persistentes (até 50), editados ou removidos explicitamente. No Rolê, selecione o jogador no ranking antes de entrar. Rodadas de amigos atualizam apenas seu próprio progresso, estrelas e XP. A classificação ordena XP, estrelas e ordem de cadastro, com desempate estável. O Pessoal continua no perfil principal.
- Backup JSON inclui os amigos, seus pontos e os dados do calendário. Não há backend, convite remoto ou sincronização automática entre aparelhos.
- Referências de experiência: [Tópicos do Perguntados](https://triviacrack.help.etermax.com/hc/pt/articles/360033522154-T%C3%B3picos) e [Ludo King](https://ludoking.com/features). Conteúdo e interface são próprios.
- `npm test` valida lógica/dados; `npm run build` valida o PWA; `npm run test:browser` executa a navegação em Chromium após o build (`npx playwright install chromium`). A validação da PR também executa os testes de navegador e guarda capturas como artefato do GitHub Actions.

### 1.2.1 — Jornada e Rolê do seu jeito

A AURA configurada acompanha a Jornada e o aviso de atualização. O cabeçalho desse aviso passa a usar o tema da pessoa, com contraste consistente. O logo fica parado, sem órbitas; a AURA é a única animação do fundo.

Pessoal é o modo individual. Rolê exige ao menos um amigo: na entrada do nível, escolher participantes ou gerenciar amigos sem perder a seleção. Todos discutem cada pergunta e registram uma resposta para o grupo; não há turnos individuais. O resultado recompensa os participantes escolhidos de uma vez. Ao concluir, mostrar o ranking geral de todos os amigos por XP acumulado. Somente participantes selecionados recebem o XP da rodada; ausentes preservam os pontos até voltarem. Empates em XP compartilham posição. XP e estrelas são salvos separadamente por perfil e preservados no backup. Não há ranking no mapa; o ranking geral no Perfil é aberto por escolha.

Entrada/saída usam fade, sem tela de estrela. Contadores textuais de perguntas, microtextos e rótulos de implementação foram removidos. Controles usam cores neutras; temas de perguntas e semanas têm tons suaves. A customização da AURA permanece sob controle da pessoa.

Para continuar o trabalho em outro chat ou computador, ler [PROJECT_STATE.md](./PROJECT_STATE.md) e atualizar a cópia do repositório antes de editar.

### 1.3.0 — Cada opinião tem sua cor

10.000 perguntas factuais adicionais, temas alternados e no máximo dois desafios de matemática por rodada. No Rolê, cada amigo marca sua opinião com nome/cor antes da resposta compartilhada. Concluir o nível preserva a posição na Jornada. Motion mini fornece feedback curto, respeitando reduzir movimento. Fontes, atribuições e limites: [QUESTION_SOURCES.md](docs/QUESTION_SOURCES.md).

### 1.4.0 — Um mundo a cada descoberta

Jornada com ilhas cúbicas compactas, seis biomas e mundos determinados pelo nível real. Futuros biomas ficam ocultos; o Pessoal respeita a data e o Rolê preserva a rodada compartilhada. Revelações com brilho, partículas, elementos animados e reduzir movimento. Sem migração ou substituição de progresso.

### 1.5.0 — Seu caminho, seus símbolos

Constelação de conquistas com progresso real, banners geométricos desbloqueáveis no perfil, emblemas e cores editáveis dos amigos e cachoeiras animadas. Desenhos originais inspirados nas referências do usuário; sem copiar imagens de terceiros. Formato anterior de perfil/amigos continua aceito. Todas as animações respeitam reduzir movimento.
