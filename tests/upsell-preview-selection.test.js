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
