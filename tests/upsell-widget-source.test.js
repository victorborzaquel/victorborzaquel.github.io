import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWidgetScriptUrl,
  buildVersionedWidgetUrl,
  getManifestUrl,
  resolveLatestWidgetSrc,
} from '../js/upsell-widget-source.js';

const savedSrc =
  'https://storage.googleapis.com/vendepay-widgets-cdn-hml-public/upsell-widget/v1/vendepay-upsell-widget-hml-old1234.js';

test('deriva o manifest do diretório do bundle salvo', () => {
  assert.equal(
    getManifestUrl(savedSrc),
    'https://storage.googleapis.com/storage/v1/b/vendepay-widgets-cdn-hml-public/o/upsell-widget%2Fv1%2Fmanifest.json?alt=media',
  );
});

test('usa o endpoint CORS do bucket para o domínio de produção', () => {
  for (const hostname of ['widget.vendepay.com', 'cdn.vendepay.com']) {
    assert.equal(
      getManifestUrl(
        `https://${hostname}/upsell-widget/v1/vendepay-upsell-widget-1.0.16.js`,
      ),
      'https://storage.googleapis.com/storage/v1/b/vendepay-widgets-cdn-prod-public/o/upsell-widget%2Fv1%2Fmanifest.json?alt=media',
    );
  }
});

test('substitui somente a versão do bundle', () => {
  assert.equal(
    buildVersionedWidgetUrl(savedSrc, 'hml-e4da47f'),
    'https://storage.googleapis.com/vendepay-widgets-cdn-hml-public/upsell-widget/v1/vendepay-upsell-widget-hml-e4da47f.js',
  );
});

test('resolve latestVersion pelo manifest', async () => {
  const resolved = await resolveLatestWidgetSrc({
    savedSrc,
    fetchManifest: async () => ({ latestVersion: 'hml-e4da47f' }),
  });

  assert.equal(
    resolved,
    'https://storage.googleapis.com/vendepay-widgets-cdn-hml-public/upsell-widget/v1/vendepay-upsell-widget-hml-e4da47f.js',
  );
});

test('usa o src salvo quando o manifest falha', async () => {
  const resolved = await resolveLatestWidgetSrc({
    savedSrc,
    fetchManifest: async () => {
      throw new Error('offline');
    },
  });

  assert.equal(resolved, savedSrc);
});

test('usa o src salvo quando latestVersion está ausente', async () => {
  const resolved = await resolveLatestWidgetSrc({
    savedSrc,
    fetchManifest: async () => ({}),
  });

  assert.equal(resolved, savedSrc);
});

test('adiciona upsellId sem descartar parâmetros existentes', () => {
  assert.equal(
    buildWidgetScriptUrl(`${savedSrc}?channel=preview`, 'upsell-123'),
    `${savedSrc}?channel=preview&upsellId=upsell-123`,
  );
});
