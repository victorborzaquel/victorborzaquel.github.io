import { state } from './state.js';
import { localeData, stripeAccounts } from './data.js';
import { pick, genCPF, genCEP, genPhoneBR, genSSN, genZIP, genPhoneUS, genEmail } from './generators.js';
import { renderFields } from './ui.js';

export function updateBankSelect() {
  const sel = document.getElementById('bank-scenario');
  sel.innerHTML = stripeAccounts[state.locale]
    .map((a, i) => `<option value="${i}">${a.note}</option>`)
    .join('');
}

function getSelectedBank() {
  const idx = parseInt(document.getElementById('bank-scenario').value ?? '0', 10);
  return { ...stripeAccounts[state.locale][idx] };
}

export function renderBankFromSelect() {
  const bank = getSelectedBank();
  const fields = state.locale === 'br'
    ? [
        { label: 'Agência', value: bank.agency },
        { label: 'Conta',   value: bank.account },
        { label: 'Stripe note', value: bank.note },
      ]
    : [
        { label: 'Routing number', value: bank.routing },
        { label: 'Account number', value: bank.account },
        { label: 'Account type',   value: bank.type },
        { label: 'Stripe note',    value: bank.note },
      ];
  state.currentData.bank = fields;
  renderFields('bank-fields', fields);
}

export function generate() {
  const loc = state.locale;
  const d = localeData[loc];
  const isFemale = Math.random() > 0.5;
  const first = pick(isFemale ? d.firstNamesFemale : d.firstNamesMale);
  const last  = pick(d.lastNames);
  const email = genEmail(first, last, loc);
  const usLocation = loc === 'us' ? genZIP() : null;

  state.currentData.personal = loc === 'br'
    ? [
        { label: 'Nome',          value: first },
        { label: 'Sobrenome',     value: last },
        { label: 'Nome completo', value: `${first} ${last}` },
        { label: 'Email',         value: email },
        { label: 'CPF',           value: genCPF() },
        { label: 'CEP',           value: genCEP() },
        { label: 'Telefone',      value: genPhoneBR() },
      ]
    : [
        { label: 'First name', value: first },
        { label: 'Last name',  value: last },
        { label: 'Full name',  value: `${first} ${last}` },
        { label: 'Email',      value: email },
        { label: 'SSN',        value: genSSN() },
        { label: 'ZIP code',   value: usLocation.zipCode },
        { label: 'State',      value: usLocation.state },
        { label: 'Phone',      value: genPhoneUS() },
      ];

  renderFields('personal-fields', state.currentData.personal);
  renderBankFromSelect();
}

export function switchLocale(loc, btn) {
  state.locale = loc;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateBankSelect();
  generate();
}
