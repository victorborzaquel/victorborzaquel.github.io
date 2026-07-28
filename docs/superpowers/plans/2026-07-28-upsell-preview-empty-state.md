# Upsell Preview Empty State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar a mensagem de seleção, em vez do checkout de preview, quando o upsell selecionado não possuir `src`.

**Architecture:** Manter a decisão dentro de `loadWidget()`, que já controla o painel. A função continuará limpando o widget anterior, localizará a entrada e seu `src`, exibirá o estado vazio quando faltar o ID ou o `src`, e somente depois mostrará o wrapper e carregará o script.

**Tech Stack:** HTML estático, JavaScript ES Modules, Node.js `node:test`.

## Global Constraints

- Reutilizar `#um-preview-empty`, `#um-widget-wrap` e a mensagem existente em `index.html`.
- Não criar componentes, estilos, arquivos CSS ou estados novos.
- Limpar o conteúdo e o script do widget anterior antes de decidir o estado visível.
- O preview só pode aparecer quando a entrada selecionada possuir `src`.

---

### Task 1: Condicionar o preview à presença do `src`

**Files:**
- Modify: `js/upsell-manager.js:244-272`
- Create: `tests/upsell-preview-selection.test.js`

**Interfaces:**
- Consumes: `loadList(): Array<{ id: string, title: string, src: string | null }>` e os elementos `#vendepay-upsell-container`, `#um-widget-wrap` e `#um-preview-empty`.
- Produces: `shouldShowUpsellPreview(id, entries): boolean`, usada por `loadWidget(id)` para decidir se o wrapper pode ser exibido.

- [ ] **Step 1: Escrever o teste de regressão que falha**

Criar `tests/upsell-preview-selection.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import * as upsellManager from '../js/upsell-manager.js';

test('mantém o estado vazio quando o upsell selecionado não tem src', () => {
  assert.equal(typeof upsellManager.shouldShowUpsellPreview, 'function');
  assert.equal(
    upsellManager.shouldShowUpsellPreview('upsell-1', [
      { id: 'upsell-1', title: 'Sem script', src: null },
    ]),
    false,
  );
});

test('permite o preview quando o upsell selecionado tem src', () => {
  assert.equal(
    upsellManager.shouldShowUpsellPreview('upsell-1', [
      { id: 'upsell-1', title: 'Com script', src: 'https://cdn.example/widget.js' },
    ]),
    true,
  );
});
```

- [ ] **Step 2: Executar o teste e confirmar a falha esperada**

Run: `node --test tests/upsell-preview-selection.test.js`

Expected: `FAIL`, porque `shouldShowUpsellPreview` ainda não existe.

- [ ] **Step 3: Implementar a correção mínima**

Adicionar a decisão pura:

```js
export function shouldShowUpsellPreview(id, entries) {
  return Boolean(id && entries.find(entry => entry.id === id)?.src);
}
```

Em `loadWidget()`, carregar a lista uma vez, localizar a entrada e usar a decisão antes da exibição do wrapper:

```js
  const requestedId = id;
  const list = loadList();
  const entry = list.find(e => e.id === id);
  const savedSrc = entry?.src || '';

  if (!shouldShowUpsellPreview(id, list)) {
    wrap.style.display  = 'none';
    empty.style.display = 'block';
    return;
  }

  wrap.style.display  = 'block';
  empty.style.display = 'none';
```

Remover o bloco que escreve “Este upsell foi salvo sem o src do widget” dentro de `container`.

- [ ] **Step 4: Executar o teste específico e confirmar que passa**

Run: `node --test tests/upsell-preview-selection.test.js`

Expected: `PASS`.

- [ ] **Step 5: Executar todas as validações**

Run: `npm test`

Expected: todos os testes passam.

Run: `node --check js/upsell-manager.js`

Expected: nenhum erro de sintaxe.

Run: `git diff --check`

Expected: nenhuma saída.

- [ ] **Step 6: Revisar e commitar**

Confirmar que o diff contém apenas o teste e a alteração em `loadWidget()`.

```bash
git add js/upsell-manager.js tests/upsell-preview-selection.test.js
git commit -m "fix: hide upsell preview without widget src"
```
