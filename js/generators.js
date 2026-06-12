import { localeData } from './data.js';

export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = arr => arr[rand(0, arr.length - 1)];

const rpad = (n, len) => String(n).padStart(len, '0');
const randDigits = n => Array.from({ length: n }, () => rand(0, 9));

export function genCPF(formatted = true) {
  const d = randDigits(9);
  const c1 = cpfDigit(d, 10);
  const c2 = cpfDigit([...d, c1], 11);
  const raw = [...d, c1, c2];
  if (!formatted) return raw.join('');
  return `${raw.slice(0,3).join('')}.${raw.slice(3,6).join('')}.${raw.slice(6,9).join('')}-${raw.slice(9).join('')}`;
}

function cpfDigit(digits, weight) {
  const sum = digits.reduce((acc, d, i) => acc + d * (weight - i), 0);
  const rem = sum % 11;
  return rem < 2 ? 0 : 11 - rem;
}

export function genCEP() {
  const n = rpad(rand(1000000, 99999999), 8);
  return `${n.slice(0, 5)}-${n.slice(5)}`;
}

export function genPhoneBR() {
  const ddd = pick(localeData.br.ddds);
  const num = `9${rpad(rand(0, 99999999), 8)}`;
  return `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
}

export function genSSN() {
  // 900-999 area = ITIN range, clearly test data
  const area   = rand(900, 999);
  const group  = rpad(rand(1, 99), 2);
  const serial = rpad(rand(1, 9999), 4);
  return `${area}-${group}-${serial}`;
}

export function genZIP() {
  return rpad(rand(10000, 99999), 5);
}

export function genPhoneUS() {
  const area = rand(200, 999);
  const exch  = rand(200, 999);
  const sub   = rpad(rand(0, 9999), 4);
  return `(${area}) ${exch}-${sub}`;
}

export function genEmail(first, last, loc) {
  const domains = localeData[loc].emailDomains;
  const sep = pick(['.', '_', '']);
  const variants = [
    `${first.toLowerCase()}${sep}${last.toLowerCase()}`,
    `${first.toLowerCase()}${rand(1, 99)}`,
    `${first.toLowerCase().slice(0, 1)}${last.toLowerCase()}`,
    `${last.toLowerCase()}${sep}${first.toLowerCase()}`,
  ];
  const local = pick(variants)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9._]/g, '');
  return `${local}@${pick(domains)}`;
}
