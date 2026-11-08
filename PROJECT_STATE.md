# Sphere Tap — estado do projeto

Fonte de verdade: `valdo4-20/sphere-tap`, branch `main`.
Site oficial: https://valdo4-20.github.io/sphere-tap/
Versão de código: **1.7.0**. A versão realmente servida pode ser conferida em `update-info.js` do site e no workflow Deploy to GitHub Pages. O app instalado só adota uma atualização quando a pessoa aceita.

## Decisões atuais — 7 de novembro de 2026

- Pessoal é para jogar sozinho. Um capítulo por data, 30 desafios em cinco etapas; cada semana tem uma cor. A conclusão de hoje não libera amanhã antecipadamente.
- Rolê é para jogar com amigos. Ao entrar no nível, escolher pelo menos um amigo além do perfil principal. Não oferecer Rolê sozinho.
- Participantes podem ser trocados a cada nível. É possível adicionar, editar e remover amigos dentro dessa seleção, sem sair para o Perfil. A lista de amigos permanece salva até edição/remoção explícita e acompanha o backup.
- Todos analisam a mesma pergunta. Tocar uma alternativa abre os nomes/cores dos participantes para registrar opiniões diferentes; cada pessoa pode mudar ou retirar sua marca. Confirmar resposta registra a única resposta oficial compartilhada. Não existem turnos individuais nem repetição da rodada para cada participante. O resultado compartilhado concede os mesmos XP/estrelas aos participantes escolhidos. Amigos em fases diferentes preservam seus contadores; a recompensa considera o desafio compartilhado. Uma identificação de partida impede crédito repetido do mesmo resultado.
- Ao concluir a rodada compartilhada do Rolê, mostrar o ranking geral pelo XP acumulado de todos os amigos. Só participantes selecionados ganham o XP daquela rodada; ausentes permanecem com os pontos anteriores até voltarem a participar. Empates em XP compartilham posição. O mapa não mostra placar. No Perfil > Amigos, o ranking geral fica atrás de Ver ranking.
- Conquistas têm área própria no Perfil e celebrações em fila, depois do quiz.
- A AURA geral segue cor e preset definidos nas preferências, inclusive na Jornada (18 fps para reduzir custo) e no aviso de atualização. Não congelar a AURA por estar na Jornada.
- O logo do aviso fica parado. Sem anéis orbitando ou esfera girando. Apenas a AURA ao fundo se anima.
- Entrada e saída de rodada usam fade da tela real. Não usar uma tela intermediária com logo/estrela. Estrelas não giram ao passar o mouse ou tocar.
- Controles são neutros. Removidos os acentos azul-claro/ciano fixos, preservando cores que a própria pessoa escolher para sua AURA.
- Não mostrar contagem textual de perguntas restantes, microtextos ou jargão de implementação como “ranking local”, “perfil local” e “conta local”. Fontes ficam em uma expansão após a resposta.
- Modal de atualização acompanha o tema e precisa ter cabeçalho legível em Neve e Cristal.

## Trabalho e validação

O projeto é React/Vite e estático, sem backend obrigatório. Dados ficam no aparelho e em backup JSON. Hospedagem gratuita no GitHub Pages.

Antes de alterar uma cópia no computador, atualizá-la a partir de `main`; arquivos do computador não recebem mudanças do GitHub automaticamente. Não voltar a usar código antigo de outro projeto Sphere: este é **Sphere Tap**.

- `npm test`: lógica, calendário, recompensas, migração, amigos e ranking.
- `npm run build`: bundle e PWA.
- `npm run test:browser`: Chromium com quatro larguras, tema claro/escuro, seleção de amigos, rodada compartilhada, ranking, fade, AURA e aviso de atualização. Executado no workflow Validate Journey em cada PR; capturas em journey-browser-checks.

As preferências acima vêm das instruções do usuário nesta conversa. Este arquivo permite continuar em outro chat sem depender de memória automática entre conversas.

## Atualização 1.3.0

- Acervo adicional de 10.000 fatos rastreáveis; detalhes, licenças e limites em docs/QUESTION_SOURCES.md. Não confundir quantidade com revisão humana de cada pergunta.
- Matemática limitada a dois desafios por rodada; temas alternados independentemente do tamanho de cada catálogo.
- Modal fixa/restaura o scroll do documento e devolve o foco sem deslocar a jornada.
- Motion mini anima brevemente o seletor; sem novos shaders ou loops durante a leitura.
- Testes cobrem opiniões independentes, fontes/opções distintas, distribuição e restauração do scroll; smoke Chromium também cobre votos diferentes e posição após conclusão.

## Jornada de planetas — 1.4.0

Visual adaptado da prévia https://sphere-tap-jornada-planetas.bikyrt.chatgpt.site , com planetas reduzidos a 96px no celular e 112px nas telas maiores. SVG isométrico com seis biomas, blocos, relevo, rios/cachoeiras, árvores, cristais e lava; identidade e distribuição de minerais determinísticas por nível. Não importa dados de demonstração, amigos ou XP da prévia.

Os mundos visíveis derivam somente dos níveis concluídos e do próximo nível realmente jogável. Datas futuras mostram apenas cadeados, nunca planetas/biomas. Rolê só revela o próximo após concluir o atual; Pessoal aguarda a data real. Calendário, XP, acertos, modos, amigos e formato de armazenamento permanecem intactos. As referências a bônus/desafios representam mundos distintos, sem inventar novas recompensas.

Desbloqueio tem revelação com brilho e partículas; animações CSS pausam fora da tela, durante o quiz e com aba oculta. Reduzir movimento elimina as animações. Não há novo canvas, WebGL, dependência ou loop JavaScript. O smoke verifica dimensões, ocultação dos futuros, revelação pelo progresso e pela data, além de toda a rodada e ranking.

## Recompensas, banners e emblemas — 1.5.0

Conquistas continuam exclusivamente no Perfil, com constelação navegável em páginas de 12 medalhas, filtros, progresso real e detalhe. As conexões são visuais, não novos pré-requisitos. Não há compra, moeda ou recompensa de XP inventada. Pop-up mantém a fila e prevenção de duplicatas, adicionando partículas e aviso do banner desbloqueado.

Banners originais em SVG inspirados nas referências geométricas/orbitais do usuário. Órbita livre; Alvorada por nome do perfil; Jardim por personalização da AURA; Explorador por uma rodada Rolê; Lunar por cinco dias Pessoal; Coroa solar por dez rodadas Rolê. Só conquistas registradas liberam o uso. A seleção profileDetails.banner acompanha backup; visualização de banner bloqueado abre a condição real, sem equipá-lo.

Amigos têm emblemas com símbolo e paleta ampliada; essa é a exceção autorizada para cores azuis em identidade dos participantes. Cores anteriores, nomes e pontos preservados. Campo emblem opcional para compatibilidade; exibir em gerenciamento, seleção, opiniões e rankings. Sem turnos individuais e sem mudar XP compartilhado.

Cachoeiras de floresta e água têm filetes SVG com stroke-dashoffset descendente, recortados na face dos blocos, e respingos. Pausam fora da tela/aba/durante quiz; reduzir movimento mantém tudo estático. Banners e constelações também respeitam reduzir movimento e aba oculta.

## Revisão 1.6.0 — 7 de novembro de 2026

- As quatro cenas fornecidas pelo usuário alternam entre aberturas. A silhueta fica estática no centro, diretamente sobre a imagem, sem placa, fundo ou borda. JPGs entram no cache offline. A abertura não acrescenta etapas ao cadastro.
- Cadastro reduzido a cinco telas, sem a preparação artificial de 14 segundos. Nascimento e consentimento continuam sendo solicitados. A demonstração permanece isolada do consumo real.
- Seleção do calendário de cuidado corrigida e identificada para leitores de tela. Botões, ícones, foco, campos e modais receberam ajustes comuns em `polish.css`.
- Modais bloqueiam a rolagem do corpo e restauram posição/foco. Seletores recebem foco na primeira abertura por teclado; Escape fecha primeiro a lista e depois o modal.
- AURA continua sendo o motor existente em canvas 2D. Ondas param quando estáticas ou com a página oculta. Cor e redimensionamento redesenham a AURA estática sem iniciar animação contínua.
- Amigos continuam apenas no aparelho. Não foram adicionados conta, backend ou amigos online.
- Perguntas importadas receberam explicações com contexto da fonte e auditoria estrutural dos 10 mil registros. Isso não equivale a conferir editorialmente cada fato externo.
- Verificação: `docs/QA-1.6.0.md`. Chromium e WebKit no computador não equivalem a validação em um iPhone físico.

## Revisão 1.6.1

Abertura com fade-in e fade-out no fundo e na silhueta inteira. Apenas a opacidade muda; não há placa, recortes, giro ou deformação. Transições verificadas em Chromium e WebKit, com tempos reduzidos para movimento reduzido.

## Revisão 1.6.2

A abertura usa apenas a imagem de sinuca cósmica sem o mascote em primeiro plano, fornecida pelo usuário. Silhueta branca centralizada, sem placa ou borda, preservando os fades. As quatro cenas anteriores deixam de alternar.

## Revisão 1.6.3

Status bar da PWA configurada como black-translucent com viewport-fit=cover. Fundo ocupa a área disponível atrás dos indicadores; conteúdo e cadastro respeitam safe-area-inset-top. Cor de chrome do navegador acompanha a paleta. Temas claros solicitam status bar padrão para preservar legibilidade; temas escuros solicitam transparência. Não é uma promessa de ocultar hora/bateria; o resultado depende do iOS e da instalação existente. Verificação física permanece pendente.

## Revisão 1.6.4 — qualidade das perguntas e resultados individuais

- Retirados os geradores de contagem/repetição de símbolos, além dos exercícios de mera ordenação de nomes. Pessoal mantém 30 questões, cinco etapas e no máximo duas contas práticas, com o mesmo calendário/XP.
- Grupo books-author (2.900 metadados do Gutenberg) permanece apenas no arquivo de origem para auditoria, fora das rodadas de ambos os modos. Não anunciar que os 10.000 registros são todos conteúdo adequado ou disponível para jogar. Arte/literatura usa curadoria com enunciados e títulos em português, fontes primárias (MoMA, MUNCH, Funarte e ABL); removida a pergunta sobre o ano exato do roubo da Mona Lisa.
- Usuário confirmou que quer resultado por amigo: cada opinião mostra acerto/erro, ausência fica Sem escolha. Acertos são computados pelo índice correto já embaralhado, sem depender da resposta oficial do grupo. Resumo no fim inclui acertos e escolhas feitas por participante. Esses contadores são apenas da rodada e não mudam o formato do backup.
- Regras de XP continuam compartilhadas entre participantes, com uma resposta oficial por pergunta; opiniões diferentes não viram turnos e ausentes não ganham XP. Confirmar repetidamente não duplica acertos.

- Restaurado o indicador do próprio perfil na Jornada: XP total, nível do jogador, barra até o próximo nível e estrela com as oito classes existentes. Ele usa o progresso salvo e não é ranking dos amigos; não gira.
- Banners têm viewBox com respiro para contornos/animações e miniaturas sem recorte. O smoke verifica todos os 14 desenhos e as oito classes da estrela, sem redefinir os dados de usuários reais.

## Revisão 1.6.6 — indicador compacto, configurações e guia

- XP/nível/estrela são um indicador pequeno (108px) no canto direito do cabeçalho da Jornada. Sem cartão largo; preserva oito classes/cores e a barra de nível, sem ranking dos amigos.
- Configurações têm rótulos alinhados à esquerda e cinco interruptores com o mesmo controle, inclusive sons. Horário respeita a largura no Safari e rejeita valor vazio inválido, preservando a preferência anterior. Ações finais ficam acima da barra de navegação.
- Guia interativo usa o PNG original do gnomo na lateral, espiando sobre a quina do balão. Não ocupa mais uma linha central no cartão nem cobre fechar/avançar. A entrada é curta, sem balanço contínuo; movimento reduzido mantém a ilustração estática. A abertura de sinuca e a introdução de três telas não foram substituídas.

- Seu cuidado usa uma coluna centralizada, seletor de intenção com margem automática, formulários/pausa/ações contidos na largura e respiro sobre a navegação. Lógica de pausa e check-in preservada; testes cobrem iniciar/encerrar pausa, salvar nota e confirmação sem criar consumo.

Guia interativo: transição de fade entre etapas (140 ms para sair, 220 ms para entrar), bloqueio de toques repetidos e troca imediata com reduzir movimento.

Guia ampliado para dez etapas: Jornada, recompensas no Perfil e edição da AURA. Confirma cada etapa avançada e avisa quando o guia é concluído; fechar não dispara conclusão.

Botão de entrada com brilho finito e resposta ao toque. Ao voltar de um nível concluído, XP conta até o total real e a estrela salta uma vez; reduzir movimento mantém atualização imediata.

1.6.6 adiciona 19 conquistas: sequência 3/5/10/20/30, acertos em até 10s (5/25/100), rodadas perfeitas (1/5/20), ágeis com >=80% e média <=10s (1/5/20), Rolê com opiniões (1/5/20), banner equipado e amigo salvo. Métricas opcionais journey.performance preservadas no backup e validadas; não se inferem tempos de rodadas antigas. Tempo ativo só durante resposta, pausa com aba oculta e confirmação de saída; mínimo 500ms por resposta para conquista de agilidade. Só conclusão aceita credita métricas, não muda XP nem pontos dos amigos.
Correções: rejeição AbortError esperada em View Transition é tratada e navegação fica acima do mapa; pop-up de conquista fica acima da barra.

Causa do bloqueio na navegação após modal: shell.css deixava pointer-events:none em links do estado nav-collapsed; revision.css mantinha os links visíveis sem restaurar o toque. Botões da barra agora têm pointer-events:auto explícito.

## Prévia experimental — pacote de planetas 1.1 (1.7.0-test.1)

Integração aprovada para publicação no GitHub Pages pelo usuário em 8 de novembro de 2026. Base 1.6.6; lançamento 1.7.0. Original do ZIP documentado em docs/planet-pack; geradores 1.1 sem dependências em src/planetPack. Integração renderiza só planetas liberados pela regra existente; IDs por instância, formas compactas, cachoeiras recortadas com respingos, brilhos de minérios e lanternas. Animações pausam fora da tela, aba oculta e durante quiz; reduzir movimento desliga efeitos. Rolê não tem calendário por fase, portanto usa comuns; dourados no Pessoal pela data dailyLevelDate, nunca por número nem data de consulta.

Não existia meta mensal: para a prévia definiu-se 5600 XP = 14 rodadas pessoais iniciais perfeitas de 400 XP. A meta é fixada ao criar cada mês. Os 12 troféus são de novembro/2026 a outubro/2027; liberam imediatamente ao alcançar a meta, sem exigência de presença. Não atribuir XP anterior à instalação a meses não registrados.

Registro opcional journey.monthlyTrophies após crédito real, deduplicado por fase/partida e data local da conclusão, validação e backup preservados. Presentes do Rolê recebem XP mensal igual ao compartilhado, mesmo com níveis distintos; ausentes intactos. Troféus/conquistas ficam no Perfil, não no mapa. Arte do troféu aparece apenas quando conquistado. Prévia em endereço próprio; para trazer progresso do oficial, importar backup em Preferências.

Prévia privada (conta ChatGPT do proprietário): https://sphere-tap-planetas-v11-teste.bikyrt.chatgpt.site . Revisão da integração: https://github.com/valdo4-20/sphere-tap/pull/9 (aprovado pelo usuário para publicação no oficial).

## Publicação 1.7.0

Usuário solicitou git/push no GitHub Pages após a prévia. Validação funcional completa aprovada no run 42445666006 (119 testes, Chromium, WebKit, pacote, fluxos e auditoria). Promoção de versão altera somente metadados de lançamento e documentação. Mantém XP, datas, bloqueios e backup.

## Correção de CI após 1.7.0

Run 42446544442 falhou com ERR_CONNECTION_REFUSED: qa-planet-pack navegava antes de o Vite estar pronto. Agora aguarda HTTP 2xx, com prazo de 15 segundos, falha explícita para processo encerrado/erro de inicialização e porta estrita. Três testes cobrem servidor lento, falha de partida e prazo. Não altera UI, XP, calendário ou dados do app.
