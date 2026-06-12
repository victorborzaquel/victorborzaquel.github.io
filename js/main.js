import { generate, switchLocale, renderBankFromSelect, updateBankSelect } from './faker.js';
import { copyField, copyAll, showPage } from './ui.js';

// Expose to global scope for HTML onclick attributes
window.generate           = generate;
window.switchLocale       = switchLocale;
window.renderBankFromSelect = renderBankFromSelect;
window.copyField          = copyField;
window.copyAll            = copyAll;
window.showPage           = showPage;

updateBankSelect();
generate();
