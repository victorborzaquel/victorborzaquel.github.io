# Links de Checkout e Recorrência por Produto

## Objetivo

Permitir que cada produto do Upsell Manager armazene dois links fixos e independentes: **Checkout** e **Recorrência**. A Recorrência deve repetir a mesma experiência já oferecida pelo Checkout, sem permitir a criação dinâmica de outros tipos de link.

## Interface

O painel lateral mantém o card **Checkout** existente e recebe logo depois um card **Recorrência** com a mesma estrutura:

- campo de URL somente leitura;
- botão para habilitar a edição;
- salvamento ao pressionar Enter ou sair do campo;
- botão para abrir o link em uma nova aba;
- botão de abrir desabilitado quando o campo estiver vazio.

Ao trocar de produto ou ambiente, os dois campos devem refletir o produto selecionado.

## Modelo de dados

Cada produto continua usando `url` para o Checkout e passa a aceitar `recurrenceUrl` para a Recorrência:

```js
{
  id,
  name,
  environment,
  url,
  recurrenceUrl
}
```

Produtos existentes sem `recurrenceUrl` são tratados como se tivessem uma string vazia, sem migração obrigatória no `localStorage`.

## Comportamento dos links

Checkout e Recorrência usam o mesmo fluxo de edição, persistência e abertura. Ao abrir qualquer um deles, o ambiente global selecionado deve:

- remover `isHML` e `isRelease` preexistentes;
- adicionar `isHML=true` em Homologação;
- adicionar `isRelease=true` em Release;
- não adicionar essas flags em Produção ou Local.

Uma URL inválida ainda deve ser aberta como informada, preservando o comportamento atual do Checkout.

## Exportação e importação

Como os links pertencem ao objeto do produto, `url` e `recurrenceUrl` seguem juntos nas exportações. A importação deve preservar os dois campos ao adicionar um produto novo. Ao mesclar um produto já existente, os dados locais do produto continuam prevalecendo, preservando o comportamento atual; apenas upsells ausentes são incorporados.

## Estrutura do código

A implementação permanece isolada em `js/upsell-manager.js`, com as funções expostas em `js/main.js` para os handlers inline do HTML. O novo card reutiliza os componentes existentes de `css/main.css`; nenhum arquivo CSS ou estilo específico é necessário.

## Testes e validação

Testes automatizados devem demonstrar que:

- Checkout e Recorrência são persistidos independentemente;
- ambos recebem os parâmetros corretos ao abrir conforme o ambiente;
- produtos antigos sem `recurrenceUrl` continuam válidos;
- a interface contém os dois campos e seus controles.

A validação final inclui a suíte Node existente, verificação de sintaxe dos módulos JavaScript e `git diff --check`.
