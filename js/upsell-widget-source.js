const PROD_WIDGET_HOSTS = new Set([
  'widget.vendepay.com',
  'cdn.vendepay.com',
]);

function buildGcsManifestUrl(bucket, sourcePathname) {
  const objectParts = sourcePathname.split('/').filter(Boolean);
  const objectDirectory = objectParts.slice(0, -1);
  const manifestObject = [...objectDirectory, 'manifest.json'].join('/');
  const manifestUrl = new URL(
    `/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(manifestObject)}`,
    'https://storage.googleapis.com',
  );
  manifestUrl.searchParams.set('alt', 'media');
  return manifestUrl.toString();
}

export function getManifestUrl(savedSrc) {
  const source = new URL(savedSrc);

  if (source.hostname === 'storage.googleapis.com') {
    const [bucket, ...objectParts] = source.pathname
      .split('/')
      .filter(Boolean);
    return buildGcsManifestUrl(bucket, `/${objectParts.join('/')}`);
  }

  if (PROD_WIDGET_HOSTS.has(source.hostname)) {
    return buildGcsManifestUrl(
      'vendepay-widgets-cdn-prod-public',
      source.pathname,
    );
  }

  return new URL('manifest.json', savedSrc).toString();
}

export function buildWidgetScriptUrl(widgetSrc, upsellId) {
  const scriptUrl = new URL(widgetSrc);
  scriptUrl.searchParams.set('upsellId', upsellId);
  return scriptUrl.toString();
}

export function buildVersionedWidgetUrl(savedSrc, latestVersion) {
  if (typeof latestVersion !== 'string' || !latestVersion.trim()) {
    throw new Error('latestVersion inválida');
  }

  const source = new URL(savedSrc);
  const filename = source.pathname.split('/').pop();
  const match = filename?.match(/^(vendepay-upsell-widget-).+(\.js)$/);

  if (!match) throw new Error('src do widget inválido');

  source.pathname = source.pathname.replace(
    /[^/]+$/,
    `${match[1]}${latestVersion}${match[2]}`,
  );
  source.search = '';
  source.hash = '';

  return source.toString();
}

export async function resolveLatestWidgetSrc({
  savedSrc,
  fetchManifest,
}) {
  try {
    const manifest = await fetchManifest(getManifestUrl(savedSrc));
    return buildVersionedWidgetUrl(savedSrc, manifest.latestVersion);
  } catch (error) {
    console.warn(
      '[UpsellManager] Não foi possível atualizar o bundle; usando src salvo.',
      error,
    );
    return savedSrc;
  }
}
