# DevTools — CLAUDE.md

Site estático hospedado no GitHub Pages. Sem build step, sem bundler, sem dependências externas. Puro HTML + CSS + JS com ES Modules nativos.

## Estrutura

```
dev-victorborzaquel/
├── index.html          # HTML puro — sem lógica inline
├── css/
│   └── main.css        # Todos os estilos; usa CSS custom properties
└── js/
    ├── state.js        # Estado mutável global: { locale, currentData }
    ├── data.js         # Dados estáticos: nomes, domínios, contas Stripe
    ├── generators.js   # Funções puras: CPF, CEP, SSN, ZIP, telefone, email
    ├── faker.js        # Orquestração da feature Person Faker
    ├── ui.js           # Funções de DOM: renderFields, copyField, toast, showPage
    └── main.js         # Entry point: expõe funções ao window, inicializa app
```

## Dependências entre módulos

```
state.js   ← sem imports
data.js    ← sem imports
generators.js ← data.js
ui.js      ← state.js
faker.js   ← state.js, data.js, generators.js, ui.js
main.js    ← faker.js, ui.js
```

Não crie dependências fora desse grafo — em especial, nunca importe faker.js dentro de ui.js (cria ciclo).

## Convenções de código

- **Sem build:** o código precisa rodar direto no browser. Use apenas sintaxe suportada nativamente (ES2020+).
- **ES Modules:** todos os arquivos JS usam `import`/`export`. O `index.html` carrega apenas `js/main.js` com `type="module"`.
- **Funções globais:** `onclick` no HTML chama funções do `window`. Toda função chamada inline no HTML deve ser exposta em `main.js` via `window.fn = fn`.
- **Estado:** leia e escreva sempre via `state` importado de `state.js`. Nunca crie variáveis de estado locais em módulos.
- **CSS:** use as custom properties definidas em `:root` (ex: `var(--accent)`). Não adicione cores ou tamanhos hardcoded.
- **Sem comentários óbvios:** comente apenas o porquê não-óbvio (ex: por que o SSN usa faixa 900-999).

## Como adicionar uma nova ferramenta (página)

1. Adicione um botão no `<nav>` do `index.html`:
   ```html
   <button class="nav-link" onclick="showPage('minha-tool', this)">Minha Tool</button>
   ```

2. Adicione o bloco da página no `<main>`:
   ```html
   <div class="page" id="page-minha-tool">
     <!-- conteúdo -->
   </div>
   ```

3. Crie `js/minha-tool.js` com a lógica da feature.

4. Importe e exponha as funções necessárias em `js/main.js`.

## Como adicionar um novo locale no Person Faker

1. Em `js/data.js`, adicione a chave em `localeData`:
   ```js
   mx: {
     firstNamesMale: [...],
     firstNamesFemale: [...],
     lastNames: [...],
     emailDomains: [...],
   }
   ```

2. Em `js/data.js`, adicione os dados de banco em `stripeAccounts`:
   ```js
   mx: [
     { agency: '...', account: '...', note: 'Success' },
     // ...
   ]
   ```

3. Em `js/generators.js`, adicione os geradores específicos do locale (se necessário).

4. Em `js/faker.js`, adicione o case do locale em `generate()` e em `renderBankFromSelect()`.

5. Em `index.html`, adicione o botão de tab:
   ```html
   <button class="tab-btn" onclick="switchLocale('mx', this)">
     <span class="tab-flag">🇲🇽</span> México
   </button>
   ```

## Como adicionar cenários de banco (Stripe)

Edite o array correspondente em `js/data.js` dentro de `stripeAccounts`. O select é populado automaticamente a partir desse array — não há nada mais a alterar.

```js
stripeAccounts.br.push({ agency: '0001', account: '5555550', note: 'New scenario' });
```

Referência: https://docs.stripe.com/connect/testing

## Publicação no GitHub Pages

O site é servido diretamente da branch `main`. Qualquer push para `main` atualiza o site. Não existe etapa de build.

> Atenção: `type="module"` requer que os arquivos sejam servidos via HTTP (não `file://`). Para desenvolvimento local, use um servidor simples:
> ```
> npx serve .
> # ou
> python3 -m http.server
> ```
