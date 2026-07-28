import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../css/main.css', import.meta.url), 'utf8');

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

test('inclui o contrato visual e responsivo da referência', () => {
  assert.match(css, /\.upsell-preview-stage\s*\{/);
  assert.match(css, /max-width:\s*520px/);
  assert.match(css, /background:\s*#0f172a/);
  assert.match(css, /main:has\(#page-upsell-manager\.active\)[^{]*\{[^}]*max-width:\s*1200px/s);
  assert.match(css, /@media \(max-width:\s*480px\)/);
});
