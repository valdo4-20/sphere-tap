# Curadoria e distribuição — versão de revisão

A seleção agora compartilha a mesma política entre Pessoal e Rolê. A dificuldade é um teto efetivo, inclusive para registros com fonte. Os primeiros dez níveis ficam na faixa 1; níveis 11–35 na faixa 2; os seguintes têm teto 3 para evitar uma escalada permanente de trivia especializada. O desafio efetivo do Pessoal continua sendo o do Rolê. As fases, tamanhos das rodadas, XP e regras de troféus permanecem preservados.

## O que pode entrar

O banco editorial mantém suas fontes. Foram melhoradas alternativas de Yoda, capilares e autoria do símbolo olímpico. O catálogo integral de 10.000 registros permanece arquivado e auditável, mas apenas uma lista explícita de assuntos familiares é elegível nas partidas gerais. No snapshot desta revisão, 22 registros importados passam pela lista e pela exigência de quatro respostas distintas dentro do próprio grupo selecionado. Livros de catálogo, gerações de Pokémon e filmes/cidades sem seleção explícita não entram. Familiaridade é uma decisão editorial, não uma certificação factual: a revisão individual de todas as fontes continua pendente.

## Repetição e variedade

O histórico local pertence ao perfil e é conservado na migração e no backup. Guarda até 600 fatos distintos, em ordem de exposição; os dois modos compartilham esse histórico. Só perguntas exibidas são registradas, incluindo as de uma rodada abandonada. Sem histórico anterior, não é possível reconstruir o que a pessoa viu em versões antigas.

Perguntas inversas sobre a mesma capital compartilham identidade. Variações sobre algumas obras conhecidas e filmes compartilham assunto e não entram juntas na rodada. Esse agrupamento é explícito e não representa detecção semântica completa de qualquer paráfrase.

O seletor prioriza afastar os últimos 60 fatos/assuntos vistos, equilibra os temas normalizados e prefere fatos novos ou mais antigos. O espaçamento é uma preferência: se a faixa tiver poucas perguntas, repete antes de subir a dificuldade. As categorias datadas não recebem cotas separadas. O banco menor inevitavelmente repete ao longo de muitas partidas; é necessário ampliar conteúdo editorial aprovado para reduzir a repetição acumulada.

## Edições douradas

O lançamento identifica a ilha dourada pela data programada já usada pelo mapa. A seleção usa uma semente própria, busca distribuição mais ampla entre os temas e usa capítulos especiais no Pessoal. Mantém o mesmo teto de dificuldade, número de perguntas, XP e calendário de troféus. Esta mudança não modifica planetas, quantidade de níveis por planeta, mapas ou animações.

## Verificação reproduzível

`npm run audit:curation` simula 100 rodadas sequenciais por modo, registrando cada pergunta como exibida. Mede repetições exatas em relação à rodada imediatamente anterior, valida tamanho, alternativas, assuntos e dificuldade. Não mede satisfação de jogadores nem certifica fatos.

| Modo | Perguntas | Repetições imediatas anteriores | Nesta revisão |
| --- | ---: | ---: | ---: |
| Pessoal | 3.000 | 993 | 92 |
| Rolê | 1.993 | 712 | 18 |

Os valores anteriores vieram da auditoria inicial sem memória de exposição. A comparação mede o efeito combinado da curadoria e da seleção com histórico. Não significa diminuição da repetição acumulada: o conjunto elegível ficou menor.

Validação local: 25 testes de seleção/Jornada, incluindo 10.000 níveis, mais 38 testes de calendário, persistência e troféus passaram. A compilação de sintaxe/importações JSX/CSS passou com dependências externas. O build Vite/PWA completo e o teste interativo no iPhone ainda precisam da execução da versão de teste.
