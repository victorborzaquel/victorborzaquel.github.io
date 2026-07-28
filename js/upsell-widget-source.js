export function getManifestUrl(savedSrc) {
  return new URL('manifest.json', savedSrc).toString();
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
