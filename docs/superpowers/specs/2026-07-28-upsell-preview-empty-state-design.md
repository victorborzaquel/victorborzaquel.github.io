# Upsell Preview Empty State

## Objetivo

Impedir que o checkout de preview seja exibido quando nenhum upsell válido estiver selecionado.

## Comportamento

- Sem um upsell selecionado, o painel exibe o estado vazio já existente com a mensagem: “Selecione um upsell na lista para visualizar o widget”.
- Se o upsell selecionado não possuir `src`, o painel exibe o mesmo estado vazio e não renderiza o checkout de preview.
- Quando o upsell selecionado possuir `src`, o painel exibe o checkout de preview e carrega o widget normalmente.
- A troca de seleção deve limpar qualquer script ou conteúdo de widget carregado anteriormente antes de decidir qual estado exibir.

## Implementação

A decisão pertence a `loadWidget()` em `js/upsell-manager.js`, que já controla a visibilidade de `#um-preview-empty` e `#um-widget-wrap`. A função deve localizar a entrada selecionada e validar seu `src` antes de mostrar o wrapper do preview.

Não serão criados novos componentes, estilos ou estados. O estado vazio e a mensagem existentes em `index.html` serão reutilizados.

## Validação

Um teste de regressão deve verificar que a validação do `src` ocorre antes da exibição do preview. Também serão executados os testes existentes, a verificação de sintaxe do módulo alterado e `git diff --check`.
