/* ── Upsell Manager: módulo isolado, com estado e storage próprios (vp_*) ── */

import {
  buildWidgetScriptUrl,
  resolveLatestWidgetSrc,
} from './upsell-widget-source.js';

const SK_GROUPS      = 'vp_accounts';
const SK_GROUP_SEL   = 'vp_account_sel';
const SK_UPSELL_SEL  = 'vp_upsell_selected';
const SK_ENV_SEL     = 'vp_environment_sel';
const upsellKey = id => `vp_upsells_${id}`;

function loadGroups()    { return JSON.parse(localStorage.getItem(SK_GROUPS) || '[]'); }
function saveGroups(a)   { localStorage.setItem(SK_GROUPS, JSON.stringify(a)); }
function getGroupId()    { return localStorage.getItem(SK_GROUP_SEL) || ''; }
function setGroupId(id)  { localStorage.setItem(SK_GROUP_SEL, id); }

function loadList() {
  const gid = getGroupId();
  if (!gid) return [];
  return JSON.parse(localStorage.getItem(upsellKey(gid)) || '[]');
}
function saveList(l) {
  const gid = getGroupId();
  if (gid) localStorage.setItem(upsellKey(gid), JSON.stringify(l));
}

function getSelected()   { return localStorage.getItem(SK_UPSELL_SEL) || ''; }
function setSelected(id) { localStorage.setItem(SK_UPSELL_SEL, id); }

function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36); }

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function extractUpsellId(text) {
  const m = text.match(/upsellId=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  return m ? m[1] : null;
}

function extractWidgetSrc(text) {
  const m = text.match(/src=["']([^"']+\.js[^"']*)["']/i);
  if (!m) return null;
  try {
    const url = new URL(m[1], location.href);
    url.searchParams.delete('upsellId');
    return url.toString().replace(/\?$/, '');
  } catch { return m[1].split('?')[0]; }
}

/* ── product url ── */
function saveProductUrl() {
  const gid = getGroupId();
  if (!gid) return;
  const input  = document.getElementById('um-product-url');
  const url    = input.value.trim();
  const groups = loadGroups();
  const group  = groups.find(g => g.id === gid);
  if (!group) return;
  group.url = url;
  saveGroups(groups);
  input.readOnly = true;
  document.getElementById('um-btn-open-url').disabled = !url;
}

function editProductUrl() {
  const input = document.getElementById('um-product-url');
  input.readOnly = false;
  input.focus();
  input.select();
  input.onblur  = () => saveProductUrl();
  input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); saveProductUrl(); } };
}

function openProductUrl() {
  const url = document.getElementById('um-product-url').value.trim();
  if (!url) return;

  try {
    const targetUrl = new URL(url);
    applyEnvironmentParams(targetUrl.searchParams, getEnvironment());
    window.open(targetUrl.toString(), '_blank', 'noopener');
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

function updateProductUrlField() {
  const gid    = getGroupId();
  const groups = loadGroups();
  const group  = groups.find(g => g.id === gid);
  const url    = group?.url || '';
  const input  = document.getElementById('um-product-url');
  input.value    = url;
  input.readOnly = true;
  document.getElementById('um-btn-open-url').disabled = !url;
}

/* ── environment (filtro global, não pertence a um produto específico) ── */
function getEnvironment()    { return localStorage.getItem(SK_ENV_SEL) || 'production'; }
function setEnvironment(env) { localStorage.setItem(SK_ENV_SEL, env); }

function applyEnvironmentParams(params, environment) {
  params.delete('isHML');
  params.delete('isRelease');

  if (environment === 'hml') params.set('isHML', 'true');
  if (environment === 'release') params.set('isRelease', 'true');
}

function updateEnvironmentField() {
  document.getElementById('um-environment-select').value = getEnvironment();
}

function onEnvironmentChange() {
  setEnvironment(document.getElementById('um-environment-select').value);
  setSelected('');
  updateUrlParams();
  renderGroups();
  updateProductUrlField();
  renderList();
  renderTopbar();
  loadWidget('');
}

/* ── group actions ── */
function newGroup() {
  const name = prompt('Nome do produto:');
  if (!name || !name.trim()) return;
  const groups = loadGroups();
  const group  = { id: uid(), name: name.trim(), url: '', environment: getEnvironment() };
  groups.push(group);
  saveGroups(groups);
  setGroupId(group.id);
  updateUrlParams();
  renderGroups();
  renderList();
}

function renameGroup() {
  const id = getGroupId();
  if (!id) return;
  const groups = loadGroups();
  const group  = groups.find(g => g.id === id);
  if (!group) return;
  const name = prompt('Novo nome do produto:', group.name);
  if (!name || !name.trim()) return;
  group.name = name.trim();
  saveGroups(groups);
  renderGroups();
}

function deleteGroup() {
  const id = getGroupId();
  if (!id) return;
  const groups = loadGroups();
  const group  = groups.find(g => g.id === id);
  if (!group) return;
  if (!confirm(`Deletar o produto "${group.name}" e todos os upsells dele?`)) return;
  saveGroups(groups.filter(g => g.id !== id));
  localStorage.removeItem(upsellKey(id));
  setGroupId('');
  setSelected('');
  updateUrlParams();
  renderGroups();
  renderList();
  renderTopbar();
  loadWidget('');
}

function onGroupChange() {
  const sel = document.getElementById('um-group-select');
  setGroupId(sel.value);
  setSelected('');
  updateUrlParams();
  updateProductUrlField();
  renderList();
  renderTopbar();
  loadWidget('');
}

/* ── url state ── */
function updateUrlParams() {
  const p = new URLSearchParams(location.search);
  const aid = getGroupId();
  if (aid) p.set('groupId', aid); else p.delete('groupId');
  const sid = getSelected();
  if (sid) p.set('upsellId', sid); else p.delete('upsellId');
  applyEnvironmentParams(p, getEnvironment());
  const qs = p.toString();
  history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
}

/* ── upsell actions ── */
function addEntry(id, title, src) {
  id = id.trim(); title = title.trim();
  if (!id || !getGroupId()) return false;
  const list = loadList();
  if (list.find(e => e.id === id)) return false;
  list.unshift({ id, title: title || id, src: src || null });
  saveList(list);
  return true;
}

function renameEntry(id) {
  const list  = loadList();
  const entry = list.find(e => e.id === id);
  if (!entry) return;
  const name = prompt('Novo nome do upsell:', entry.title);
  if (!name || !name.trim()) return;
  entry.title = name.trim();
  saveList(list);
  renderList();
  renderTopbar();
}

function removeEntry(id) {
  saveList(loadList().filter(e => e.id !== id));
  if (getSelected() === id) { setSelected(''); loadWidget(''); }
  renderList();
}

function selectId(id) {
  setSelected(id);
  updateUrlParams();
  renderList();
  renderTopbar();
  loadWidget(id);
}

/* ── widget ── */
async function fetchManifest(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Manifest respondeu HTTP ${response.status}`);
  }
  return response.json();
}

async function loadWidget(id) {
  const container = document.getElementById('vendepay-upsell-container');
  const wrap      = document.getElementById('um-widget-wrap');
  const empty     = document.getElementById('um-preview-empty');

  container.innerHTML = '';
  const old = document.getElementById('vp-widget-script');
  if (old) old.remove();

  if (!id) {
    wrap.style.display  = 'none';
    empty.style.display = 'block';
    return;
  }

  const requestedId = id;
  const entry = loadList().find(e => e.id === id);
  const savedSrc = entry?.src || '';

  wrap.style.display  = 'block';
  empty.style.display = 'none';

  if (!savedSrc) {
    container.innerHTML = `<div style="color:#fca5a5;font-size:13px;padding:16px;background:#1e2130;border:1px solid #ef444455;border-radius:8px">
      Este upsell foi salvo sem o src do widget.<br>
      <strong>Remova e re-cadastre colando o snippet HTML novamente.</strong>
    </div>`;
    return;
  }

  const resolvedSrc = await resolveLatestWidgetSrc({
    savedSrc,
    fetchManifest,
  });

  if (getSelected() !== requestedId) return;

  const script  = document.createElement('script');
  script.id     = 'vp-widget-script';
  script.src    = buildWidgetScriptUrl(resolvedSrc, id);
  script.onload = () => {
    window.VendepayUpsellWidget &&
      window.VendepayUpsellWidget.showIframe('vendepay-upsell-container');
  };
  script.onerror = () => {
    container.innerHTML = `
      <div role="alert" style="color:#fca5a5;font-size:13px;padding:16px;background:#1e2130;border:1px solid #ef444455;border-radius:8px">
        Não foi possível carregar o script do widget.
      </div>
    `;
  };
  document.body.appendChild(script);
}

/* ── render ── */
function renderGroups() {
  const environment = getEnvironment();
  const groups = loadGroups()
    .filter(g => (g.environment || 'production') === environment)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt'));
  const sel    = document.getElementById('um-group-select');
  const empty  = document.getElementById('um-group-empty');

  let curId = getGroupId();
  if (!groups.find(g => g.id === curId)) {
    curId = groups[0]?.id || '';
    setGroupId(curId);
  }

  updateEnvironmentField();

  if (groups.length === 0) {
    sel.style.display   = 'none';
    empty.style.display = 'block';
    updateProductUrlField();
    return;
  }

  sel.style.display   = '';
  empty.style.display = 'none';
  sel.innerHTML = groups.map(g =>
    `<option value="${g.id}" ${g.id === curId ? 'selected' : ''}>${escHtml(g.name)}</option>`
  ).join('');
  updateProductUrlField();
}

function renderList() {
  const list     = loadList().slice().sort((a, b) => a.title.localeCompare(b.title, 'pt'));
  const selected = getSelected();
  const listEl   = document.getElementById('um-id-list');

  if (!getGroupId()) {
    listEl.innerHTML = '<div class="list-empty">Selecione ou crie um produto.</div>';
    return;
  }

  if (list.length === 0) {
    listEl.innerHTML = '<div class="list-empty">Nenhum upsell salvo neste produto.</div>';
    return;
  }

  listEl.innerHTML = list.map(({ id, title, src }) => {
    const isActive = id === selected;
    const srcLabel = src ? src.replace(/^https?:\/\//, '') : '—';
    return `
      <div class="list-item ${isActive ? 'active' : ''}">
        <div class="list-item-header" onclick="selectUpsellId('${id}')">
          <div class="list-item-dot"></div>
          <div class="list-item-body">
            <div class="list-item-title">${escHtml(title)}</div>
            <div class="list-item-sub">${id}</div>
            <div class="list-item-sub list-item-sub-2">${escHtml(srcLabel)}</div>
          </div>
          <div class="list-item-actions">
            ${isActive ? '<span class="badge badge-accent">ativo</span>' : '<span></span>'}
            <div class="list-item-actions-btns">
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); renameUpsellEntry('${id}')">✎</button>
              <button class="btn btn-ghost btn-sm" id="um-copy-${id}" onclick="event.stopPropagation(); copyUpsellUrl('${id}')">Copiar URL</button>
              <button class="btn-danger" onclick="event.stopPropagation(); removeUpsellEntry('${id}')">✕</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderTopbar() {
  const list     = loadList();
  const selected = getSelected();
  const entry    = list.find(e => e.id === selected);
  const topTitle = document.getElementById('um-top-title');
  const topId    = document.getElementById('um-top-id');
  const label    = document.getElementById('um-preview-label');

  if (entry) {
    topTitle.textContent   = entry.title;
    topTitle.style.display = 'inline';
    topId.textContent      = entry.id;
    label.textContent      = entry.title;
  } else {
    topTitle.style.display = 'none';
    topId.textContent      = 'Nenhum ID selecionado';
    label.textContent      = '';
  }
}

/* ── inputs ── */
function extractFromTemplate() {
  if (!getGroupId()) { alert('Crie ou selecione um produto primeiro.'); return; }
  const text  = document.getElementById('um-template-input').value;
  const title = document.getElementById('um-template-title').value.trim();
  if (!title) { alert('Preencha o título antes de salvar.'); document.getElementById('um-template-title').focus(); return; }
  const id  = extractUpsellId(text);
  if (!id)  { alert('Nenhum upsellId UUID encontrado no texto.'); return; }
  const src = extractWidgetSrc(text);
  if (!src) { alert('Nenhum src de script encontrado no texto.'); return; }
  document.getElementById('um-extracted-id').textContent = id;
  document.getElementById('um-extracted-badge').style.display = 'block';
  if (!addEntry(id, title, src)) { alert('Este upsellId já está salvo neste produto.'); return; }
  clearTemplate();
  selectId(id);
}

function clearTemplate() {
  document.getElementById('um-template-input').value = '';
  document.getElementById('um-template-title').value = '';
  document.getElementById('um-extracted-badge').style.display = 'none';
}

/* ── export / import ── */
function exportGroup() {
  const gid = getGroupId();
  if (!gid) { alert('Selecione um produto primeiro.'); return; }
  const group = loadGroups().find(g => g.id === gid);
  if (!group) return;
  const upsells = JSON.parse(localStorage.getItem(upsellKey(gid)) || '[]');
  downloadJson({ version: 1, groups: [{ ...group, upsells }] },
    `produto-${group.name.replace(/\s+/g, '-')}.json`);
}

function exportAll() {
  const groups = loadGroups();
  if (!groups.length) { alert('Nenhum produto para exportar.'); return; }
  const data = {
    version: 1,
    groups: groups.map(g => ({
      ...g,
      upsells: JSON.parse(localStorage.getItem(upsellKey(g.id)) || '[]')
    }))
  };
  downloadJson(data, 'upsell-manager-export.json');
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function importGroups(event) {
  const file = event.target.files[0];
  if (!file) return;
  event.target.value = '';
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data.groups)) throw new Error('Formato inválido');
      const existing = loadGroups();
      let added = 0, merged = 0;
      data.groups.forEach(g => {
        if (!g.id || !g.name) return;
        if (!existing.find(eg => eg.id === g.id)) {
          existing.push({ id: g.id, name: g.name });
          added++;
        } else {
          merged++;
        }
        if (Array.isArray(g.upsells)) {
          const cur = JSON.parse(localStorage.getItem(upsellKey(g.id)) || '[]');
          g.upsells.forEach(u => { if (!cur.find(c => c.id === u.id)) cur.push(u); });
          localStorage.setItem(upsellKey(g.id), JSON.stringify(cur));
        }
      });
      saveGroups(existing);
      renderGroups();
      renderList();
      alert(`Importação concluída: ${added} produto(s) adicionado(s), ${merged} produto(s) mesclado(s).`);
    } catch (err) {
      alert('Erro ao importar: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/* ── copy url ── */
function copyUpsellUrl(id) {
  const base = location.href.split(/[?#]/)[0];
  const aid  = getGroupId();
  const params = new URLSearchParams({ groupId: aid, upsellId: id });
  applyEnvironmentParams(params, getEnvironment());
  const url = `${base}?${params.toString()}#upsell-manager`;

  const markCopied = () => {
    const btn = document.getElementById(`um-copy-${id}`);
    if (!btn) return;
    btn.textContent = '✓ Copiado';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copiar URL'; btn.classList.remove('copied'); }, 2000);
  };

  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(markCopied).catch(() => fallbackCopy(url, markCopied));
  } else {
    fallbackCopy(url, markCopied);
  }
}

function fallbackCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand('copy'); callback(); }
  catch { alert('Copie manualmente:\n' + text); }
  document.body.removeChild(ta);
}

/* ── init (chamado ao entrar na página) ── */
export function initUpsellManager() {
  document.getElementById('um-template-input').addEventListener('input', () => {
    const id    = extractUpsellId(document.getElementById('um-template-input').value);
    const badge = document.getElementById('um-extracted-badge');
    if (id) { document.getElementById('um-extracted-id').textContent = id; badge.style.display = 'block'; }
    else    { badge.style.display = 'none'; }
  });

  const _params  = new URLSearchParams(location.search);
  const qGroupId = _params.get('groupId');
  const qId      = _params.get('upsellId');
  const _group   = qGroupId ? loadGroups().find(g => g.id === qGroupId) : null;

  if (_group) {
    setGroupId(qGroupId);
    setEnvironment(_group.environment || 'production');
  } else if (_params.get('isHML') === 'true') {
    setEnvironment('hml');
  } else if (_params.get('isRelease') === 'true') {
    setEnvironment('release');
  }

  renderGroups();
  renderList();
  renderTopbar();
  if (qId) { setSelected(qId); renderList(); renderTopbar(); }
  updateUrlParams();
  loadWidget(qId || '');
}

export {
  exportGroup, exportAll, importGroups,
  newGroup, renameGroup, deleteGroup, onGroupChange,
  onEnvironmentChange, editProductUrl, openProductUrl,
  extractFromTemplate, clearTemplate,
  selectId as selectUpsellId,
  renameEntry as renameUpsellEntry,
  removeEntry as removeUpsellEntry,
  copyUpsellUrl,
};
