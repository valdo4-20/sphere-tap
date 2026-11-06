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

Fotos são recortadas localmente em 256 × 256 e salvas como JPEG no perfil. Câmera usa apenas vídeo, é encerrada ao sair/capturar e exige HTTPS ou localhost. Localização é opcional, consultada uma vez, sem guardar coordenadas. O acesso a fotos usa o seletor de arquivos, sem permissão ampla ao armazenamento. A opção de persistência solicita navigator.storage.persist quando disponível; sua concessão depende do navegador e não substitui backup.

AURA usa agora AuraSurface e dependências do Sphere UI Kit em src/sphere-engine, com adaptador em src/Aura.jsx. O adaptador remove a dependência de playback/tema do Sphere, aceita a cor escolhida e permite congelar a superfície. Não há player ou captura de áudio. O renderer mantém seu movimento ambiente com limite de 30 FPS. Registrar +1 causa uma breve contração e redução de opacidade; não aumenta brilho ou intensidade. O aviso informa o custo acrescentado ou a ausência de preço.

Análises inclui um gráfico radial orgânico por dia da semana, com consumo em ocasiões e custos conhecidos. A escala é relativa ao maior valor registrado no período; não é uma pontuação de saúde. Custos ausentes aparecem como informação incompleta.

Validação: 24 testes de dados e build estático. Cadastro até termos e incremento com custo conferidos no navegador em origem isolada. Aceite de termos e permissões reais ficam para a escolha da pessoa; câmera física, localização e instalação em iOS/Android não foram validadas em dispositivo nesta revisão.

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


## Caminhada, Carteira e perfil

- Caminhada usa Leaflet 1.9.4 e OpenStreetMap, sem chave ou cobrança. O mapa só carrega ao abrir a aba. Não faz download antecipado de mapas; mantém atribuição e cache HTTP do navegador. Disponibilidade dos mapas é de melhor esforço.
- Ao iniciar uma caminhada, a aba muda para uma tela ao vivo com tempo ativo, distância, passos estimados, ritmo e estado do GPS. Os controles permitem pausar/retomar, finalizar ou abrir o percurso; a navegação fica recolhida durante essa tela.
- GPS é solicitado somente em **Iniciar caminhada**, exige HTTPS (ou localhost). O endereço HTTP de rede local não permite GPS em navegadores móveis. A publicação no GitHub Pages fornece HTTPS.
- Tela oculta pausa a caminhada. Retome manualmente ao voltar. Uma sessão interrompida é recuperada pausada neste navegador. O PWA não promete GPS com tela bloqueada.
- Distância usa Haversine e segmentos separados por pausas/lacunas. Descarta precisão acima de 40 m, deslocamentos abaixo do limiar de ruído e velocidade bruta acima de 3 m/s. Isso reduz ruído, mas não garante precisão de equipamento esportivo.
- Passos são **estimados por distância / comprimento do passo** (ajustável de 0,30 a 1,50 m), não lidos de um pedômetro. Sem calorias, batimentos ou recuperação corporal inventados.
- Durante uma caminhada ativa, +1 salva uma posição GPS aceita há menos de 15 segundos. Eventos antigos não recebem localização retroativa. Os pontos indicam consumo, nunca recompensas. Calor representa densidade de registros, não saúde ou temperatura.
- Percursos e locais ficam no armazenamento local e no backup JSON. Carregar mapas informa ao servidor de tiles a área visualizada. Ao apagar um percurso, seus locais associados são retirados dos registros, mantendo o consumo. A ação pode ser desfeita pela notificação do app.
- 122 medalhas: 116 marcos de cuidado e seis de caminhada em dias distintos. Nenhuma medalha por volume de consumo. Catálogo paginado e filtros por grupo/raridade.
- Carteira reúne compras, preços e orçamento. Economia é uma estimativa contra gasto diário de referência informado; só inclui dias confirmados com custos completos. Compras não são somadas ao consumo. Não é saldo bancário, não recebe dinheiro e não faz transações.
- Perfil: foto local em fundo inteiro, calendário de cuidado, gráfico de registros, cenário financeiro opcional e leitura científica recolhida. Ausência de dados nunca é uma pausa automática.

### Referências

- Filtros de Fitness e identidade de medalhas: `C:/Users/almei/Documents/projeto M/Sphere-UI-Kit/` (adaptação local).
- [Leaflet 1.9.4](https://leafletjs.com/reference-1.9.4.html), [política de tiles OSM](https://operations.osmfoundation.org/policies/tiles/), [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API).
- [Hancox et al., 2015](https://pubmed.ncbi.nlm.nih.gov/25837035/): coorte observacional sobre sintomas respiratórios e cessação/redução de cannabis. Sem prazo individual de recuperação.
- [CDC — benefícios de parar de fumar](https://www.cdc.gov/tobacco/about/benefits-of-quitting.html): referências populacionais para tabaco fumado; não aplicáveis automaticamente a todos os itens.

Testes locais: `npm test`; produção estática: `npm run build`. Precisão em caminhada real e comportamento em iPhone/Android continuam dependendo de validação em aparelho físico.

Moeda aberta: Three.js com cilindro, borda serrilhada instanciada, aros e núcleo em relevo, iluminação de ambiente e texturas adaptadas do kit. Carrega sob demanda; limita resolução e quadros e libera o contexto ao fechar. Se WebGL não estiver disponível, usa a alternativa em CSS. A animação de virada de dezena é breve e sem som, pontos ou conquista.


## Organização atual da interface

Navegação principal: Hoje, Caminhada, Progresso, Carteira e Perfil. Histórico fica em Progresso; Carteira tem uma aba própria. Intenção de pausa e limites opcionais ficam em Meu cuidado. Conquistas permanecem no perfil, recolhidas até a pessoa abrir; ao selecionar uma medalha, ela aparece sobre a tela com fundo transparente e AURA colorida atrás. A tela inicial concentra o contador do item escolhido; os registros do dia são expansíveis.

A AURA original continua ativa. A camada `AuraWaves.jsx` acrescenta gradientes de borda com respiração e pulsos que partem do ponto tocado; o retorno visual é breve e não acumula intensidade com consumo. No tema claro, a AURA permanece visível sem o véu que a encobria. A composição móvel usa tipografia, esfera e controles mais compactos, preservando alvos de toque acessíveis. Mudanças de rota têm transições de entrada/saída e títulos/textos recebem uma entrada sutil, respeitando reduzir movimento. A silhueta da caminhada tem movimento lento de aproximação e rotação, suspenso com reduzir movimento.

Silhuetas originais geradas com a ferramenta integrada `image_gen`, preservando alfa: `public/artwork/walking-silhouette.png`, `walking-feminine.png`, `walking-neutral.png`. Prompts completos: `public/artwork/prompts.json`. São escolhas visuais independentes da identidade ou orientação da pessoa; também há a opção Sem figura. Inter foi obtida da fonte oficial rsms.me e incluída localmente com a licença SIL OFL.

Carteira: Editar valor permite uma economia informada manualmente, identificada como tal, com opção de retornar ao cálculo automático. Nenhum saldo ou transação bancária. Caminhada: Minha localização solicita uma posição para prévia, sem criar percurso. Iniciar caminhada ativa o registro e o ponto azul de posição; arrastar o mapa suspende a centralização automática até pedir Minha localização novamente.

Revisão de foco: categorias novas exibem apenas nome e unidade; preço e visual estão em detalhes opcionais. A tela Hoje não exibe painéis repetidos de gastos, calendário ou conquistas. Progresso mantém período e gráfico, com filtros avançados recolhidos e seleção diretamente nos dias do gráfico. O restante é acessado sob demanda, sem apagar dados ou recursos existentes.
