# Validação da versão 1.6.0

Ambiente: Windows; Chromium/Edge e WebKit via Playwright. Dados fictícios em contextos de navegador separados dos dados reais do usuário.

## Verificações

- `npm test`: regras de dados, migração, finanças, pausas, jornada, amigos no aparelho e atualizações.
- `npm run test:browser`: Jornada completa nas larguras 320, 390, 768 e 1280; amigos, votos e ranking; abertura/saída de rodada; tema claro/escuro; banners e conquistas.
- `npm run test:flows`: cadastro real em cinco telas; consentimento; demonstração sem consumo; criar/editar/excluir/desfazer registro; cálculo do custo; compra e recebimento na Carteira, sem alterar o custo histórico; calendário; teclado nos seletores/modais; exportar backup, recusar arquivo inválido e restaurar backup; recarregar offline. Rodado em Chromium e WebKit, nos temas Bosque e Neve. Verificação adicional de overflow em 320, 768 e 1280.
- `npm run test:visual`: AURA estática sobrevive ao redimensionamento e troca de cor, ondas sem desenho contínuo quando paradas, quatro cenas de abertura com marca estática centralizada, em Chromium e WebKit.
- `npm run audit:questions`: 10 mil registros; campos, IDs, URLs de referência, títulos e respostas normalizados. Não encontrou assuntos ambíguos com respostas diferentes dentro dos grupos. A revisão é estrutural; não confirma individualmente a correção editorial de cada fato externo.

Resultados e capturas ficam em `browser-checks/`, ignorado no Git.

## Uso offline no WebKit

A simulação `context.setOffline(true)` tem um problema conhecido com navegações atendidas por service workers: [microsoft/playwright#42775](https://github.com/microsoft/playwright/issues/42775). Para verificar o cache no WebKit, o teste desliga o servidor de origem e recarrega a página, que precisa continuar funcionando. No Chromium, usa a emulação offline.

## Limites

Não houve acesso a um iPhone físico. O teclado virtual real, instalação/ícone na tela inicial, temperatura, consumo de bateria e desempenho durante uso prolongado no aparelho ainda exigem observação física. Dados reais do usuário não foram abertos, alterados ou substituídos durante os testes.
