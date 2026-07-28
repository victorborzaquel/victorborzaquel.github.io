# DevTools — AGENTS.md

Site estático hospedado no GitHub Pages. Sem build step, sem bundler, sem dependências externas. Puro HTML + CSS + JS com ES Modules nativos.

## Estrutura

```
dev-victorborzaquel/
├── index.html            # HTML puro — sem lógica inline
├── css/
│   └── main.css          # Único arquivo de CSS do site: design system compartilhado (custom properties) + estilos de shell (header/nav/pages)
└── js/
    ├── state.js          # Estado mutável global do Person Faker: { locale, currentData }
    ├── data.js           # Dados estáticos: nomes, domínios, contas Stripe
    ├── generators.js     # Funções puras: CPF, CEP, SSN, ZIP, telefone, email
    ├── faker.js          # Orquestração da feature Person Faker
    ├── ui.js             # Funções de DOM do Person Faker: renderFields, copyField, toast, showPage
    ├── upsell-manager.js # Feature isolada: estado próprio em localStorage (prefixo vp_*), não importa nem é importada por faker.js/ui.js/state.js
    └── main.js           # Entry point: expõe funções de todas as features ao window, inicializa app
```

> O Upsell Manager é uma feature isolada em JS (estado/storage próprios) — nunca misture suas funções/estado com os do Person Faker. A única integração entre as duas é feita em `main.js`, que expõe as funções de ambas ao `window`. **Visualmente, porém, todas as páginas/tools usam os mesmos componentes de `main.css`** — não crie CSS novo por página nem arquivos CSS extras (veja "Design system" abaixo).

## Design system (`css/main.css`)

Existe **um único** `css/main.css` para o site inteiro. Toda nova ferramenta/página deve reusar os componentes existentes em vez de criar classes/cores próprias, para que todas as abas tenham a mesma cara. Antes de estilizar algo novo, confira se já existe um componente que resolve:

- **Layout de página:** `.page` / `.page-header` / `.page-title` / `.page-desc` (título + descrição no topo de cada tool).
- **Barra de info inline** (ex: item selecionado): `.meta-bar`, `.meta-bar-sep`, `.meta-bar-id`, `.meta-bar-title`.
- **Layout de duas colunas** (painel lateral + área principal, tipo "gerenciador + preview"): `.split-layout`, `.split-side` (coluna fixa 380px), `.split-main` (coluna flexível).
- **Cards:** `.card`, `.card-header`, `.card-title` — container padrão para agrupar conteúdo. Para conteúdo livre dentro de um `.card` sem usar `.fields`, use um `<div>` com padding `14px 20px` (ver Upsell Manager).
- **Botões:** `.btn` + `.btn-primary` / `.btn-ghost` / `.btn-danger`. Modificadores: `.btn-sm` (compacto), `.btn-block` (ocupa a largura disponível, ex. dentro de `.row`).
- **Inputs/forms:** `.input` (text/url), `.textarea`, `.select` (com `.select-sm` para variante compacta). Agrupe com `.form-group` + `.form-label` (+ `.form-required` para o asterisco de obrigatório).
- **Linhas/flex:** `.row` (flex + gap) e `.row-wrap` (permite quebrar linha).
- **Badges:** `.badge` + variante de cor (`.badge-accent`, `.badge-success`, `.badge-stripe`, ou crie uma nova variante `.badge-<nome>` se precisar de outra cor, sempre baseada nas custom properties).
- **Listas selecionáveis** (linhas clicáveis com estado ativo, ex. lista de upsells salvos): `.list-item` (+ `.active`), `.list-item-header`, `.list-item-dot`, `.list-item-body`, `.list-item-title`, `.list-item-sub` (+ `.list-item-sub-2` para uma segunda linha), `.list-item-actions`, `.list-item-actions-btns`. Estado vazio: `.list-empty`.
- **Painel/preview com estado vazio:** `.panel`, `.panel-empty` (+ `.panel-empty-icon`), `.panel-label`.

Sempre use as custom properties de `:root` (`var(--accent)`, `var(--surface)`, `var(--border)`, etc.) — nunca cores hardcoded. Se precisar de um componente que não existe, adicione-o em `main.css` seguindo o padrão acima (nome genérico, baseado nas custom properties) para que a próxima ferramenta também possa reusá-lo — não crie um arquivo CSS separado por página.

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
- **CSS:** use as custom properties definidas em `:root` (ex: `var(--accent)`). Não adicione cores ou tamanhos hardcoded. Reuse os componentes de `main.css` (ver seção "Design system") em vez de criar classes ou arquivos CSS novos por página/ferramenta.
- **Sem comentários óbvios:** comente apenas o porquê não-óbvio (ex: por que o SSN usa faixa 900-999).

## Como adicionar uma nova ferramenta (página)

1. Adicione um botão no `<nav>` do `index.html`, com `data-page` igual ao id da página (necessário para o roteamento por hash funcionar sem precisar de `this`):
   ```html
   <button class="nav-link" data-page="minha-tool" onclick="showPage('minha-tool', this)">Minha Tool</button>
   ```

2. Adicione o bloco da página no `<main>`:
   ```html
   <div class="page" id="page-minha-tool">
     <!-- conteúdo -->
   </div>
   ```

3. Crie `js/minha-tool.js` com a lógica da feature.

4. Importe e exponha as funções necessárias em `js/main.js`.

## Roteamento por hash (`showPage`)

`showPage(id, btn)` (em `js/ui.js`) alterna a página ativa **e** sincroniza a URL: ao trocar de aba ela faz `history.replaceState` para `#<id>`, preservando `pathname` e `search` (importante porque o Upsell Manager guarda seu próprio estado em query params — `groupId`, `upsellId`, `isHML`/`isRelease`). Por isso `updateUrlParams()` em `js/upsell-manager.js` também precisa preservar `location.hash` ao reconstruir a URL — nunca reescreva a URL descartando o hash.

## Upsell Manager — Ambiente como filtro global

O "Ambiente" (Produção/Local/Release/Homologação) é um **filtro global**, guardado isolado em `vp_environment_sel` (via `getEnvironment()`/`setEnvironment()` em `js/upsell-manager.js`) — não é uma propriedade editável do produto selecionado. Cada produto (`group`) grava o ambiente em que foi criado (`group.environment`, fixado em `newGroup()` a partir do ambiente atualmente selecionado) e nunca muda depois.

- O card "Ambiente" fica **acima** do card "Produto" no `index.html`.
- O select de Produto (`renderGroups()`) só lista produtos cujo `group.environment` bate com o ambiente selecionado no momento — produtos de outros ambientes ficam ocultos, não aparece mais o nome do ambiente concatenado na opção.
- Trocar o ambiente (`onEnvironmentChange()`) refaz essa filtragem: se o produto atualmente selecionado não pertence ao novo ambiente, `renderGroups()` seleciona automaticamente o primeiro produto daquele ambiente (ou limpa a seleção se não houver nenhum).
- Ao abrir um link direto (`?groupId=...`), o ambiente global é ajustado para o do produto do link (`initUpsellManager()`), garantindo que ele apareça na lista filtrada mesmo que o ambiente selecionado anteriormente fosse outro.
- Se não houver `groupId` na URL, as flags `isHML`/`isRelease` continuam definindo o ambiente inicial (comportamento herdado do link de checkout).

No boot (`js/main.js`), se `location.hash` já vier preenchido (ex: usuário recarregou a página em `#upsell-manager` ou colou um link), `showPage(id)` é chamado sem `btn` — nesse caso a função localiza o botão de nav correspondente via `[data-page="${id}"]`. Por isso todo botão de nav **precisa** do atributo `data-page`.

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
