import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildVersionedWidgetUrl,
  getManifestUrl,
  resolveLatestWidgetSrc,
} from '../js/upsell-widget-source.js';

const savedSrc =
  'https://storage.googleapis.com/vendepay-widgets-cdn-hml-public/upsell-widget/v1/vendepay-upsell-widget-hml-old1234.js';

test('deriva o manifest do diretório do bundle salvo', () => {
  assert.equal(
    getManifestUrl(savedSrc),
    'https://storage.googleapis.com/vendepay-widgets-cdn-hml-public/upsell-widget/v1/manifest.json',
  );
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
