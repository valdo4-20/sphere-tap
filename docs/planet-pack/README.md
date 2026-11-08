# Sphere Tap — catálogo experimental

Versão 1.1: todas as 152 ilhas receberam cristais facetados, pequenos elementos de cenário, minérios nas encostas e fragmentos flutuantes. Plantas e objetos variam conforme o bioma. Os 12 troféus foram mantidos.

164 SVGs transparentes: 100 planetas comuns, 52 planetas dourados de domingo e 12 troféus mensais (novembro/2026 a outubro/2027). Abra `catalogo.html` para pesquisar, ampliar e baixar cada peça. Os painéis PNG mostram a coleção inteira.

Os SVGs incluem animações leves de água, brilho, lava ou partículas conforme o tema, com suporte a reduzir movimento. Os PNGs são prévias estáticas. Este pacote ainda não foi integrado nem publicado no jogo.

## Integração no repositório

Copie `src/planetAssets.mjs` e `src/monthlyTrophies.mjs` para a pasta equivalente do projeto. É possível usar os arquivos de `assets/` diretamente ou gerar os SVGs com os módulos. Sem dependências externas.

- Preserve o calendário, XP, salvamento e desbloqueio existentes. Use a data programada da fase (`dailyLevelDate`) em `assetForScheduledDate(level, date)`, nunca o dia em que a tela é consultada. Domingo é evento de calendário, não nível divisível por sete.
- Renderize apenas fases desbloqueadas. `planetIsVisible` é um auxiliar; a regra real do jogo continua sendo a autoridade.
- O gerador aceita índices além de 100 para novas variações determinísticas. O pacote contém 100 planetas comuns desenhados por combinação de dez biomas, dez estruturas e detalhes; não contém mil artes individuais.
- Use um `instanceId` diferente quando inserir o mesmo SVG várias vezes no DOM.
- Registre o XP mensal apenas depois que o sistema atual conceder XP ao jogador, com um `eventId` estável por recompensa. Não conte ausentes nem repita recompensas.
- A meta de XP mensal é obrigatória no argumento `targetXp`. O valor exato ainda precisa ser definido no jogo. `suggestedTarget(400,14)` retorna 5600 apenas como referência de planejamento; não deve sobrescrever a meta vigente automaticamente.
- O troféu é liberado imediatamente quando a meta mensal é atingida. Os 13–15 dias são uma estimativa de XP, não uma exigência de presença. Cada mês acumula seu próprio XP, conserva a meta inicial e preserva o desbloqueio.

## Verificação e regeneração

Execute `node --test tests/*.test.mjs` e `node build.mjs`. O build recria SVGs, manifesto, catálogo e painéis SVG. As prévias PNG foram renderizadas separadamente com Inkscape.
