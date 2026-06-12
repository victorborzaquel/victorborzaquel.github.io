import { state } from './state.js';

const ICON_COPY = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const ICON_CHECK = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

export function renderFields(containerId, fields) {
  const el = document.getElementById(containerId);
  el.innerHTML = fields.map((f, i) => `
    <div class="field">
      <div class="field-left">
        <div class="field-label">${f.label}</div>
        <div class="field-value" id="val-${containerId}-${i}" title="${f.value}">${f.value}</div>
      </div>
      <button class="copy-btn" onclick="copyField('val-${containerId}-${i}', this)" title="Copiar">
        ${ICON_COPY}
      </button>
    </div>
  `).join('');
}

export function copyField(valId, btn) {
  const text = document.getElementById(valId)?.textContent ?? '';
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = ICON_CHECK;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = ICON_COPY;
    }, 1500);
  });
}

export function copyAll() {
  if (!state.currentData.personal) return;
  const all = [...(state.currentData.personal ?? []), ...(state.currentData.bank ?? [])];
  const text = all.map(f => `${f.label}: ${f.value}`).join('\n');
  navigator.clipboard.writeText(text).then(() => showToast('Todos os dados copiados!'));
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

export function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${id}`)?.classList.add('active');
  btn.classList.add('active');
}
