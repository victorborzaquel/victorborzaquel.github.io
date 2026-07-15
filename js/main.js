import { generate, switchLocale, renderBankFromSelect, updateBankSelect } from './faker.js';
import { copyField, copyAll, showPage } from './ui.js';
import {
  initUpsellManager, exportGroup, exportAll, importGroups,
  newGroup, renameGroup, deleteGroup, onGroupChange,
  onEnvironmentChange, editProductUrl, openProductUrl,
  extractFromTemplate, clearTemplate,
  selectUpsellId, renameUpsellEntry, removeUpsellEntry, copyUpsellUrl,
} from './upsell-manager.js';

// Expose to global scope for HTML onclick attributes
window.generate           = generate;
window.switchLocale       = switchLocale;
window.renderBankFromSelect = renderBankFromSelect;
window.copyField          = copyField;
window.copyAll            = copyAll;
window.showPage           = showPage;

// Upsell Manager (namespace vp_* isolado — não compartilha estado com o Person Faker)
window.exportGroup        = exportGroup;
window.exportAll          = exportAll;
window.importGroups       = importGroups;
window.newGroup           = newGroup;
window.renameGroup        = renameGroup;
window.deleteGroup        = deleteGroup;
window.onGroupChange      = onGroupChange;
window.onEnvironmentChange = onEnvironmentChange;
window.editProductUrl     = editProductUrl;
window.openProductUrl     = openProductUrl;
window.extractFromTemplate = extractFromTemplate;
window.clearTemplate      = clearTemplate;
window.selectUpsellId     = selectUpsellId;
window.renameUpsellEntry  = renameUpsellEntry;
window.removeUpsellEntry  = removeUpsellEntry;
window.copyUpsellUrl      = copyUpsellUrl;

updateBankSelect();
generate();
initUpsellManager();

// Abre a página indicada pelo hash da URL (ex: recarregar em #upsell-manager)
const initialPage = location.hash.replace('#', '');
if (initialPage) showPage(initialPage);
