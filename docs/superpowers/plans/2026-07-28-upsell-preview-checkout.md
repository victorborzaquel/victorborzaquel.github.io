# Upsell Checkout Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renderizar o widget de upsell dentro de uma réplica fiel da página de checkout fornecida.

**Architecture:** O markup estático do checkout ficará no painel de preview existente em `index.html`, preservando um único alvo `#vendepay-upsell-container`. Estilos isolados em `css/main.css` reproduzirão a página de referência sem interferir no restante do site; o carregamento JavaScript atual permanecerá inalterado.

**Tech Stack:** HTML5, CSS, JavaScript ES modules, Node.js test runner.

## Global Constraints

- Preservar o fluxo atual de resolução e carregamento do bundle do widget.
- Manter exatamente um elemento `#vendepay-upsell-container`.
- Usar os textos, cores, dimensões e breakpoint de 480 px da referência.
- Não integrar os parâmetros da URL porque a referência não os renderiza.
- Manter o estado vazio atual quando nenhum upsell estiver selecionado.

---

### Task 1: Estrutura do checkout no preview

**Files:**
- Modify: `index.html:171-181`
- Create: `tests/upsell-preview-layout.test.js`

**Interfaces:**
- Consumes: `loadWidget(id)` e o seletor `#vendepay-upsell-container`.
- Produces: markup `.upsell-preview-checkout` com um único alvo do widget.

- [ ] **Step 1: Escrever o teste estrutural que falha**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('renderiza o checkout completo em volta do widget', () => {
  assert.match(html, /class="upsell-preview-checkout"/);
  assert.match(html, /Obrigado pela sua compra!/);
  assert.match(html, /Resumo do pedido/);
  assert.match(html, /Oferta especial/);
});

test('mantém um único alvo para o widget', () => {
  assert.equal(
    [...html.matchAll(/id="vendepay-upsell-container"/g)].length,
    1,
  );
});
```

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `node --test tests/upsell-preview-layout.test.js`
Expected: FAIL porque `.upsell-preview-checkout` ainda não existe.

- [ ] **Step 3: Adicionar o markup do checkout**

Substituir o conteúdo visível de `#um-widget-wrap` por um wrapper com selo de sucesso, título, subtítulo, resumo estático, bloco de oferta contendo `#vendepay-upsell-container` e rodapé. Manter `#um-preview-label` acima do checkout.

- [ ] **Step 4: Executar o teste e confirmar sucesso**

Run: `node --test tests/upsell-preview-layout.test.js`
Expected: 2 testes aprovados.

### Task 2: Aparência fiel e responsiva

**Files:**
- Modify: `css/main.css:352-382`
- Modify: `tests/upsell-preview-layout.test.js`

**Interfaces:**
- Consumes: classes `.upsell-preview-*` criadas na Task 1.
- Produces: layout visual isolado e responsivo.

- [ ] **Step 1: Escrever o teste de contrato visual que falha**

Adicionar leitura de `css/main.css` e verificar as propriedades-chave:

```js
test('inclui o contrato visual e responsivo da referência', () => {
  assert.match(css, /\.upsell-preview-stage\s*\{/);
  assert.match(css, /max-width:\s*520px/);
  assert.match(css, /background:\s*#0f172a/);
  assert.match(css, /@media \(max-width:\s*480px\)/);
});
```

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `node --test tests/upsell-preview-layout.test.js`
Expected: FAIL porque os estilos do checkout ainda não existem.

- [ ] **Step 3: Implementar os estilos isolados**

Adicionar regras `.upsell-preview-*` equivalentes à referência: stage `#0f172a`, cartão `#020617`, largura máxima de 520 px, selo verde, resumo, oferta tracejada, rodapé e breakpoint de 480 px. Ajustar `.split-main` para alinhar o checkout no topo e permitir rolagem visual.

- [ ] **Step 4: Executar todos os testes**

Run: `npm test`
Expected: todos os testes aprovados.

### Task 3: Verificação final

**Files:**
- Verify: `index.html`
- Verify: `css/main.css`
- Verify: `js/upsell-manager.js`

**Interfaces:**
- Consumes: preview completo das Tasks 1 e 2.
- Produces: evidência de que a alteração está pronta.

- [ ] **Step 1: Verificar sintaxe e whitespace**

Run: `node --check js/upsell-manager.js && git diff --check`
Expected: exit code 0 sem saída de erro.

- [ ] **Step 2: Inspecionar o diff**

Run: `git diff -- index.html css/main.css tests/upsell-preview-layout.test.js`
Expected: somente estrutura, estilos e testes do novo preview.

- [ ] **Step 3: Executar novamente a suíte completa**

Run: `npm test`
Expected: todos os testes aprovados, sem falhas.
