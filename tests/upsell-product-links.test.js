import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  buildEnvironmentUrl,
  getProductLink,
  setProductLink,
} from '../js/upsell-manager.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('lê Recorrência vazia em produtos antigos', () => {
  assert.equal(
    getProductLink({ id: 'p1', url: 'https://checkout.test' }, 'recurrenceUrl'),
    '',
  );
});

test('salva Checkout e Recorrência independentemente', () => {
  const groups = [{
    id: 'p1',
    url: 'https://checkout.test',
    recurrenceUrl: '',
  }];

  assert.equal(
    setProductLink(groups, 'p1', 'recurrenceUrl', 'https://recurrence.test'),
    true,
  );
  assert.equal(groups[0].url, 'https://checkout.test');
  assert.equal(groups[0].recurrenceUrl, 'https://recurrence.test');
});

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
