# Product Checkout and Recurrence URLs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed Recorrência URL beside the existing Checkout URL for every Upsell Manager product.

**Architecture:** Keep both values on the existing product object as `url` and `recurrenceUrl`. Extract small pure helpers for product-link persistence and environment-aware URL construction so the behavior can be tested without a browser, then wire two independent copies of the existing controls to those helpers.

**Tech Stack:** Static HTML, native ES modules, browser `localStorage`, Node.js built-in test runner.

## Global Constraints

- The site must run directly in the browser with no build step, bundler, or new dependency.
- Checkout remains stored as `group.url`; Recorrência is stored as `group.recurrenceUrl`.
- Existing products without `recurrenceUrl` must behave as if the value were an empty string.
- Checkout and Recorrência must remove stale `isHML` and `isRelease` flags before applying the selected environment.
- Homologação adds exactly `isHML=true`; Release adds exactly `isRelease=true`; Produção and Local add neither flag.
- The new UI must reuse existing components from `css/main.css`; do not create a new stylesheet.
- Upsell Manager state remains isolated under its existing `vp_*` storage.

---

### Task 1: Testable product-link behavior

**Files:**
- Create: `tests/upsell-product-links.test.js`
- Modify: `js/upsell-manager.js`

**Interfaces:**
- Consumes: product objects shaped as `{ id, name, environment, url?, recurrenceUrl? }`.
- Produces: `getProductLink(group, field) -> string`, `setProductLink(groups, groupId, field, value) -> boolean`, and `buildEnvironmentUrl(rawUrl, environment) -> string`, exported from `js/upsell-manager.js`.

- [ ] **Step 1: Write failing tests for independent Checkout and Recorrência storage**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEnvironmentUrl,
  getProductLink,
  setProductLink,
} from '../js/upsell-manager.js';

test('lê Recorrência vazia em produtos antigos', () => {
  assert.equal(getProductLink({ id: 'p1', url: 'https://checkout.test' }, 'recurrenceUrl'), '');
});

test('salva Checkout e Recorrência independentemente', () => {
  const groups = [{ id: 'p1', url: 'https://checkout.test', recurrenceUrl: '' }];

  assert.equal(setProductLink(groups, 'p1', 'recurrenceUrl', 'https://recurrence.test'), true);
  assert.equal(groups[0].url, 'https://checkout.test');
  assert.equal(groups[0].recurrenceUrl, 'https://recurrence.test');
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/upsell-product-links.test.js`

Expected: FAIL because the three named exports do not exist.

- [ ] **Step 3: Add minimal pure helpers**

```js
const PRODUCT_LINK_FIELDS = new Set(['url', 'recurrenceUrl']);

export function getProductLink(group, field) {
  if (!PRODUCT_LINK_FIELDS.has(field)) return '';
  return group?.[field] || '';
}

export function setProductLink(groups, groupId, field, value) {
  if (!PRODUCT_LINK_FIELDS.has(field)) return false;
  const group = groups.find(item => item.id === groupId);
  if (!group) return false;
  group[field] = value.trim();
  return true;
}
```

- [ ] **Step 4: Add failing tests for environment-aware opening**

```js
test('aplica o ambiente igualmente aos links de Checkout e Recorrência', () => {
  assert.equal(
    buildEnvironmentUrl('https://example.test/pay?isHML=true&keep=1', 'release'),
    'https://example.test/pay?keep=1&isRelease=true',
  );
  assert.equal(
    buildEnvironmentUrl('https://example.test/pay?isRelease=true&keep=1', 'hml'),
    'https://example.test/pay?keep=1&isHML=true',
  );
  assert.equal(
    buildEnvironmentUrl('https://example.test/pay?isHML=true&keep=1', 'production'),
    'https://example.test/pay?keep=1',
  );
});

test('preserva texto inválido para manter o fallback atual', () => {
  assert.equal(buildEnvironmentUrl('não é uma url', 'release'), 'não é uma url');
});
```

- [ ] **Step 5: Run the focused test and verify RED**

Run: `node --test tests/upsell-product-links.test.js`

Expected: the storage tests PASS and the URL tests FAIL because `buildEnvironmentUrl` is missing.

- [ ] **Step 6: Implement the environment-aware URL helper**

```js
export function buildEnvironmentUrl(rawUrl, environment) {
  try {
    const targetUrl = new URL(rawUrl);
    applyEnvironmentParams(targetUrl.searchParams, environment);
    return targetUrl.toString();
  } catch {
    return rawUrl;
  }
}
```

- [ ] **Step 7: Run focused and full tests**

Run: `node --test tests/upsell-product-links.test.js`

Expected: PASS.

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 8: Commit the behavior**

```bash
git add js/upsell-manager.js tests/upsell-product-links.test.js
git commit -m "feat: add product recurrence link behavior"
```

### Task 2: Recorrência controls in the Upsell Manager

**Files:**
- Modify: `index.html`
- Modify: `js/upsell-manager.js`
- Modify: `tests/upsell-product-links.test.js`

**Interfaces:**
- Consumes: `getProductLink`, `setProductLink`, and `buildEnvironmentUrl` from Task 1.
- Produces: browser handlers `editProductUrl(field)` and `openProductUrl(field)` where `field` is exactly `'url'` or `'recurrenceUrl'`.

- [ ] **Step 1: Add a failing HTML contract test**

```js
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('exibe controles independentes para Checkout e Recorrência', () => {
  assert.match(html, /<span class="card-title">Checkout<\/span>/);
  assert.match(html, /id="um-product-url"/);
  assert.match(html, /editProductUrl\('url'\)/);
  assert.match(html, /openProductUrl\('url'\)/);
  assert.match(html, /<span class="card-title">Recorrência<\/span>/);
  assert.match(html, /id="um-product-recurrence-url"/);
  assert.match(html, /editProductUrl\('recurrenceUrl'\)/);
  assert.match(html, /openProductUrl\('recurrenceUrl'\)/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/upsell-product-links.test.js`

Expected: FAIL because the Recorrência card and field-specific handlers are absent.

- [ ] **Step 3: Duplicate the card with field-specific handlers**

Update the existing Checkout controls to call:

```html
onclick="editProductUrl('url')"
onclick="openProductUrl('url')"
```

Add the Recorrência card immediately after Checkout:

```html
<div class="card">
  <div class="card-header">
    <span class="card-title">Recorrência</span>
  </div>
  <div style="padding:14px 20px;">
    <div class="row">
      <input class="input" type="url" id="um-product-recurrence-url" placeholder="—" readonly />
      <button class="btn btn-ghost btn-sm" onclick="editProductUrl('recurrenceUrl')" title="Editar URL">✎</button>
      <button class="btn btn-ghost btn-sm" id="um-btn-open-recurrence-url" onclick="openProductUrl('recurrenceUrl')" disabled>↗ Abrir</button>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Generalize the browser handlers and field refresh**

Use a fixed DOM mapping:

```js
const PRODUCT_LINK_CONTROLS = {
  url: {
    inputId: 'um-product-url',
    openButtonId: 'um-btn-open-url',
  },
  recurrenceUrl: {
    inputId: 'um-product-recurrence-url',
    openButtonId: 'um-btn-open-recurrence-url',
  },
};
```

Change `saveProductUrl(field)`, `editProductUrl(field)`, and `openProductUrl(field)` to resolve controls only through this mapping. `saveProductUrl` must call `setProductLink`, persist with `saveGroups`, restore `readOnly`, and update the corresponding open button. `openProductUrl` must call:

```js
window.open(buildEnvironmentUrl(url, getEnvironment()), '_blank', 'noopener');
```

Replace `updateProductUrlField()` with `updateProductUrlFields()`, iterating exactly `['url', 'recurrenceUrl']`, reading values through `getProductLink`, and updating each input/button independently. Update every environment/group/render call site to invoke the plural function.

Create new products with both empty fields:

```js
const group = {
  id: uid(),
  name: name.trim(),
  url: '',
  recurrenceUrl: '',
  environment: getEnvironment(),
};
```

- [ ] **Step 5: Preserve links when importing new products**

Replace the reduced object inserted by `importGroups` with:

```js
existing.push({
  id: g.id,
  name: g.name,
  environment: g.environment || 'production',
  url: g.url || '',
  recurrenceUrl: g.recurrenceUrl || '',
});
```

Do not overwrite product fields when the imported ID already exists.

- [ ] **Step 6: Run focused and full tests**

Run: `node --test tests/upsell-product-links.test.js`

Expected: PASS.

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 7: Validate native module syntax and whitespace**

Run: `node --check js/upsell-manager.js`

Expected: no output and exit code 0.

Run: `node --check js/main.js`

Expected: no output and exit code 0.

Run: `git diff --check`

Expected: no output and exit code 0.

- [ ] **Step 8: Commit the interface**

```bash
git add index.html js/upsell-manager.js tests/upsell-product-links.test.js
git commit -m "feat: add recurrence URL controls"
```
