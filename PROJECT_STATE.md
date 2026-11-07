# Sphere Tap — estado do projeto

Fonte de verdade: `valdo4-20/sphere-tap`, branch `main`.
Site oficial: https://valdo4-20.github.io/sphere-tap/
Versão de código: **1.5.0**. A versão realmente servida pode ser conferida em `update-info.js` do site e no workflow Deploy to GitHub Pages. O app instalado só adota uma atualização quando a pessoa aceita.

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
