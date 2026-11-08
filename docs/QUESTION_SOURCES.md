# Acervo factual — 1.3.0

Snapshot de 7/11/2026: **10.000 perguntas factuais adicionais**, com modelos originais em português e quatro alternativas montadas a partir do mesmo tipo de dado. Não são 10.000 textos de quiz copiados nem perguntas revisadas individualmente por humanos. Títulos e nomes próprios podem permanecer no idioma do catálogo. Os fatos podem conter erros nas fontes; o link de cada ficha permite conferência. A contagem exclui o banco editorial e os desafios procedurais já existentes.

| Fonte | Perguntas | Conteúdo | Licença / atribuição |
| --- | ---: | --- | --- |
| Wikidata | 1.550 | Direção de filmes com referências | CC0 1.0 |
| Project Gutenberg | 2.900 | Autoria de obras do catálogo | Fatos bibliográficos; modelos de pergunta originais |
| GeoNames | 3.500 | País de cidades | CC BY 4.0 — GeoNames |
| PokéAPI | 2.050 | Tipos na forma padrão e geração de estreia | BSD 3-Clause; aviso integral em POKEAPI_LICENSE.md |

Wikidata: https://www.wikidata.org/wiki/Wikidata:Licensing e https://www.wikidata.org/wiki/Wikidata:Data_access . Cada filme mantém identificador, propriedade e referência da afirmação. `scripts/import-quiz.py` documenta a consulta; `--cache-only` usa os resultados já baixados. Só o grupo cinema-director foi aproveitado: outras consultas não forneceram um conjunto utilizável.

Gutenberg: https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv . Usamos somente autoria/título/identificador bibliográficos, sem textos, capas ou trechos de livros. Excluímos autoria múltipla, anônima, títulos duplicados com autores diferentes e nomes de autor no título. A data Issued do catálogo NÃO é tratada como data de publicação da obra. Metadados não implicam que o conteúdo de qualquer livro esteja livre de direitos em todos os países.

GeoNames: https://download.geonames.org/export/dump/cities15000.zip e https://download.geonames.org/export/dump/readme.txt . Atribuição: GeoNames, https://www.geonames.org/ — https://creativecommons.org/licenses/by/4.0/ . Seleção de 3.500 cidades por população, sem nomes repetidos no arquivo e sem país secundário indicado; países traduzidos com Intl.DisplayNames pt-BR. Não modificamos o fato cidade-país. A fonte é colaborativa, fornecida sem garantia.

PokéAPI: https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv ; arquivos pokemon.csv, pokemon_types.csv e pokemon_species.csv. Só espécies padrão, sem formas alternativas. Tradução dos tipos e modelos de pergunta adicionados pelo Sphere Tap. Combinações de dois tipos têm ordem canônica, evitando alternativas equivalentes. Pokémon é marca de seus respectivos titulares; não copiamos imagens nem recursos dos jogos.

`assemble-corpus.py` combina os snapshots intermediários em `.qa/catalogs`, aplica o limite e verifica a contagem. O JSON versionado contém as linhas efetivamente usadas e links individuais, permitindo auditar e reconstruir perguntas sem nenhuma chamada de rede durante o jogo. Cada grupo guarda a própria licença; CC0 não se aplica ao conjunto inteiro. O acervo é carregado em um chunk separado e incluído no cache offline da PWA.

## Distribuição e limites

O tamanho do catálogo não determina a frequência de um tema. O Pessoal alterna nove temas e reserva no máximo dois desafios de matemática por rodada. O Rolê usa 18 fatos e dois desafios práticos, alternando categorias. O banco menor de música, história, corpo humano e esportes ainda pode repetir antes dos catálogos maiores; 10.000 entradas não significam 10.000 rodadas sem repetição. Datas/temas do progresso existente são preservados.

## Animações pesquisadas

- Motion mini: https://motion.dev/docs/animate — implementação escolhida para o breve fade do seletor de opiniões, com APIs nativas e sem loop. Respeita reduzir movimento.
- Rive: https://rive.app/game-ui — avaliado para estados e celebrações; não integrado por exigir assets adicionais e custo de renderização que não se justifica aqui.
- Howler: https://howlerjs.com/ — avaliado; o app já possui sinais de áudio e não precisa de outro motor.

Mantemos a AURA existente e evitamos adicionar shaders contínuos à leitura. Feedback curto, cores por tema e opiniões por nome/cor reduzem a dependência de uma pessoa lendo tudo em voz alta. Não há narração automática.

## Curadoria 1.6.4

Os 2.900 registros de autoria do Gutenberg foram retirados das rodadas: títulos obscuros em inglês não eram uma boa experiência de cultura geral. O JSON original continua arquivado para rastreabilidade, sem significar 10.000 perguntas ativas. Arte/literatura passa a usar enunciados originais em português sobre obras conhecidas, com fontes por questão em src/quizArt.js (MoMA, MUNCH, Funarte e Academia Brasileira de Letras). Geradores de posição e repetição de símbolos foram removidos. Volume do catálogo não é critério de qualidade ou familiaridade.
