# Nativa — correção do catálogo — 2026-10-01
ESCOPO: somente catálogo demonstrativo Nativa; checkout isolado em task-2/nativa.
NÃO FAZER: merge/deploy, DNS, pagamentos, pedidos reais, serviços novos, dados de usuários, outros projetos.
FEITO: branch fix/catalog-state; filtros combinados com busca e URL; contador/vazio/limpar; retorno seguro do produto; favoritos atualizam no render; materiais confirmados por descrições existentes.
TESTADO: sintaxe JS inicial passou; regressão Node e QA navegador em andamento.
PENDENTE: QA desktop/mobile/temas/histórico/carrinho; commit/push/PR draft e checks remotos.
PRÓXIMO PASSO: executar regressão Node e navegador local; documentar resultados.
ARQUIVOS ALTERADOS: nativa-app.js, nativa-data.js, catalogo.html, produto.html, tokens JS nos HTML; tests/catalog.test.cjs; workflow catalog-checks.yml.
SERVIÇOS: nenhum deploy. Workflow deploy-pages.yml existente só dispara main/workflow_dispatch; preservado. CI PR separado, contents: read.
BACKUP/ROLLBACK: ../nativa-before.bundle; base 45bb9f06d086000915ab69c4f379f609f4552cd0.
ITENS QUE NÃO DEVEM SER REPETIDOS: auditoria original, QA publicado antigo, LUME.
MODELO: GPT-6.1 Sol Medium/Fast desligado solicitado; não há controle do seletor nesta ferramenta, troca não alegada.

## Etapa validada
FEITO: implementação pronta e revisada, dados/preços/variantes preservados; só três campos material derivados literalmente das descrições.
TESTADO: node --check nativa-app.js e nativa-data.js, git diff --check PASS. node tests/catalog.test.cjs: 6/6 PASS; node --test tests/catalog.test.cjs também exit 0 (sandbox resume por arquivo). Chromium real local: filtros/search/clear, URL cat inicial, contador/vazio, retorno pós-limpar, reload, Back/Forward, seis favoritos alternados, carrinho/variantes/qty/totais PASS. 1440/768/390/320 px, claro/escuro e preferências sistema, teclado/toggle, / e /portfolio/ PASS, sem overflow. Console/page errors [] e HTTP locais >=400 [].
PENDENTE: PR draft e check remoto; revisão do pai. Nova versão não publicada e não validada em nativa.alureal.com.br, por restrição de deploy.
EVIDÊNCIAS: .tools/QA_NODE.log, .tools/QA_LOCAL.log; script opcional .tools/qa-browser.cjs usa Playwright externo existente via NATIVA_PLAYWRIGHT, não acrescenta dependência ao repo/CI. Serve portas locais 8766 repo e 8767 raiz temporária com portfolio apontando repo. Screenshots /tmp/nativa-{1440,768,390,320}-{light,dark}.png; desktop claro/mobile escuro inspecionados visualmente.
LIMITAÇÃO OBSERVADA: imagem externa existente da Toalha Folha apareceu quebrada nas screenshots; URL/dados preservados por escopo. Não afirmar QA completo de assets externos.
PRÓXIMO PASSO: commit/push apenas branch fix/catalog-state e abrir draft; consultar checks uma vez após janela útil, sem merge/deploy.

## PR draft aberto
PR: https://github.com/allfariaclaro/alureal-portfolio-nativa/pull/1 (OPEN, isDraft=true).
Commit funcional: 580b5527652484d8a0004936c8728cd1ed425da0.
Branch enviada: fix/catalog-state; main/deploy intactos. PR anexado à tarefa.
Check observado: Catalog checks / catalog-regression, IN_PROGRESS, run 36817722354, job 110226332557 (primeira consulta).
Imagem externa confirmada: Toalha Folha, net::ERR_BLOCKED_BY_ORB e naturalWidth=0; observação incluída no PR e log.
PENDENTE: revisão do pai para eventual merge/deploy. Nenhum pedido real, pagamento, DNS ou outro projeto alterado.
PRÓXIMO PASSO: consultar resultado do CI após este commit documental; estado final/exatos no retorno ao pai. Não repetir QA local sem mudança funcional.
MODELO PARA PRÓXIMA ETAPA: manter GPT-6.1 Sol Medium solicitado para revisão; Fast desligado conforme pedido, sem alegar alteração de seletor.
