# Preview completo do checkout no Upsell Manager

## Objetivo

Substituir o preview simples do Upsell Manager por uma reprodução visual fiel da página pública de checkout fornecida como referência. O widget continuará sendo carregado pelo fluxo atual, mas aparecerá dentro do bloco de oferta especial da página completa.

## Referência visual

O preview deve reproduzir:

- fundo externo azul-marinho escuro;
- cartão central de até 520 px, com fundo quase preto, bordas arredondadas e sombra;
- selo circular verde com ícone de confirmação;
- título e texto de confirmação da compra;
- cartão de resumo do pedido com os textos e valores estáticos da referência;
- bloco de oferta especial com borda verde tracejada e chip `Up-sell`;
- rodapé da página de teste;
- espaçamentos, cores, tamanhos e comportamento responsivo da referência.

Os textos exibidos serão os mesmos da página de referência. Esta alteração não adicionará integração com os parâmetros `country`, `vendaId`, `customerName`, `email`, `phone` ou `productId`, pois a própria referência não os utiliza no conteúdo renderizado.

## Estrutura

O HTML do checkout ficará dentro de `#um-widget-wrap`. O elemento `#vendepay-upsell-container` existente será movido para dentro do bloco de oferta e continuará sendo o único alvo do widget.

O preview não copiará os erros estruturais da referência: haverá somente um elemento com o ID `vendepay-upsell-container` e nenhum fechamento de `script` inválido.

## Estilos

Os estilos serão adicionados a `css/main.css` com nomes de classe específicos do preview, evitando colisões com classes genéricas já usadas pelo site. O cartão do checkout será centralizado na área principal, e o contêiner externo permitirá rolagem quando a altura disponível for menor que a página.

Em telas estreitas, o padding do cartão e os tamanhos de título e subtítulo seguirão o breakpoint de 480 px da referência. A regra responsiva existente do Upsell Manager continuará empilhando controles e preview abaixo de 700 px.

## Comportamento do widget

`loadWidget(id)` continuará:

1. limpando o contêiner;
2. resolvendo a versão mais recente do bundle;
3. adicionando `upsellId` à URL;
4. chamando `showIframe('vendepay-upsell-container')`;
5. mostrando mensagens de erro dentro do bloco de oferta.

Quando nenhum upsell estiver selecionado, permanece o estado vazio atual. Quando houver seleção, todo o checkout de referência será mostrado, mesmo enquanto o script carrega.

## Validação

- Confirmar que existe apenas um `#vendepay-upsell-container`.
- Executar `npm test`.
- Executar `node --check js/upsell-manager.js`.
- Executar `git diff --check`.
- Inspecionar o preview local em largura desktop e mobile, confirmando estrutura, responsividade e carregamento do widget.
