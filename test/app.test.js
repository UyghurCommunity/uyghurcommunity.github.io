import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { buildInstallCommand, buildSearchURL, filterProjects, isWebURL, validateCatalog } from '../src/catalog.js';
const catalog = JSON.parse(await readFile(new URL('../projects.json', import.meta.url), 'utf8'));
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
// Captured from the original Lughet 0.1.0 dataset via its real local adapter.
const lughetPayload = JSON.parse(await readFile(new URL('./fixtures/lughet-mektep.json', import.meta.url), 'utf8'));
const source = (await readFile(new URL('../src/app.js', import.meta.url), 'utf8'))
  .replace(/^import[^\n]+\n/, '')
  .replace("new URL('../projects.json', import.meta.url)", "new URL('https://example.test/projects.json')");

class Node {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase(); this.children = []; this.events = {}; this.attributes = {}; this.dataset = {}; this.hidden = false; this.disabled = false; this._text = ''; this._value = ''; this.selected = false;
    this.classList = { values: new Set(), toggle: (name, force) => { const active = force ?? !this.classList.values.has(name); active ? this.classList.values.add(name) : this.classList.values.delete(name); return active; } };
  }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map((child) => child.textContent ?? '').join(''); }
  set value(value) { this._value = String(value); }
  get value() { return this.tagName === 'SELECT' ? (this.children.find((child) => child.selected)?.value ?? this.children[0]?.value ?? this._value) : this._value; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  append(...children) { for (const child of children) this.children.push(...(child.fragment ? child.children : [child])); }
  replaceChildren(...children) { this.children = []; this._text = ''; this.append(...children); }
  addEventListener(name, handler) { (this.events[name] ||= []).push(handler); }
  async emit(name, extra = {}) { await Promise.all((this.events[name] || []).map((handler) => handler({ target: this, preventDefault() {}, ...extra }))); }
  focus() { this.focused = true; }
  select() { this.selectedText = true; }
  click() { return this.emit('click'); }
  remove() { this.removed = true; }
}
const tick = () => new Promise((resolve) => setImmediate(resolve));
async function harness({ failCatalog = false, api, preferences = {} } = {}) {
  const nodes = new Map(), translated = [];
  for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)) {
    const attrs = Object.fromEntries([...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map((item) => [item[1], item[2]]));
    const node = new Node(match[1]);
    for (const [name, value] of Object.entries(attrs)) {
      if (name.startsWith('data-')) node.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    }
    if (attrs.value) node.value = attrs.value;
    if (attrs.id) nodes.set(attrs.id, node);
    if (Object.keys(node.dataset).length) translated.push(node);
  }
  const meta = new Node('meta'), root = new Node('html'), body = new Node('body');
  const document = {
    documentElement: root, body,
    getElementById: (id) => { if (!nodes.has(id)) throw new Error(`Missing test node ${id}`); return nodes.get(id); },
    createElement: (tag) => new Node(tag), createTextNode: (text) => { const node = new Node(); node.textContent = text; return node; },
    createDocumentFragment: () => Object.assign(new Node(), { fragment: true }),
    querySelector: () => meta,
    querySelectorAll: (selector) => translated.filter((node) => {
      const attr = selector.slice(1, -1).slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      return Object.hasOwn(node.dataset, attr);
    }),
    execCommand: () => true,
  };
  const storage = new Map(Object.entries(preferences)), copied = [];
  const calls = [];
  const context = vm.createContext({
    document, buildInstallCommand, buildSearchURL, filterProjects, isWebURL, validateCatalog, URL, AbortController, setTimeout, clearTimeout,
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    navigator: { clipboard: { writeText: async (text) => copied.push(text) } },
    fetch: async (url, options) => {
      calls.push(String(url));
      if (String(url).endsWith('projects.json')) {
        if (failCatalog) throw new Error('offline');
        return { ok: true, json: async () => structuredClone(catalog) };
      }
      if (api) return api(url, options);
      throw new Error('API unavailable');
    },
  });
  vm.runInContext(source, context);
  await tick();
  return { nodes, root, storage, copied, calls, context };
}

test('application loads ten cards, seven release packages, and honest registry status', async () => {
  const app = await harness();
  assert.equal(app.nodes.get('project-grid').children.length, 10);
  assert.equal(app.nodes.get('package-select').children.length, 7);
  assert.match(app.nodes.get('install-command').textContent, /doppa-kit\/archive\/refs\/tags\/v0.1.0/);
  assert.equal(app.nodes.get('registry-note').hidden, false);
  assert.equal(app.nodes.get('project-count').textContent, '10');
  assert.equal(app.nodes.get('package-count').textContent, '7');
});

test('category and text search combine, then clear restores all cards', async () => {
  const app = await harness();
  const categories = app.nodes.get('category-filters');
  await categories.children[2].emit('click');
  assert.equal(app.nodes.get('project-grid').children.length, 1);
  app.nodes.get('project-search').value = 'no match';
  await app.nodes.get('project-search').emit('input');
  assert.equal(app.nodes.get('project-grid').children.length, 0);
  assert.equal(app.nodes.get('empty-results').hidden, false);
  await app.nodes.get('clear-filters').emit('click');
  assert.equal(app.nodes.get('project-grid').children.length, 10);
  assert.equal(app.nodes.get('project-search').focused, true);
});

test('language and appearance toggles persist without losing package choice', async () => {
  const app = await harness();
  const select = app.nodes.get('package-select');
  select.children.forEach((option) => { option.selected = option.value === 'lughet-api'; });
  await select.emit('change');
  await app.nodes.get('language-toggle').emit('click');
  assert.equal(app.root.lang, 'en');
  assert.equal(app.root.dir, 'ltr');
  assert.equal(app.storage.get('ug-community-language'), 'en');
  assert.match(app.nodes.get('install-command').textContent, /lughet-api\/archive/);
  await app.nodes.get('theme-toggle').emit('click');
  assert.equal(app.root.dataset.theme, 'light');
  assert.equal(app.storage.get('ug-community-theme'), 'light');
  await app.nodes.get('copy-command').emit('click');
  assert.equal(app.copied[0], app.nodes.get('install-command').textContent);
});

test('saved English and light preferences restore on startup', async () => {
  const app = await harness({ preferences: { 'ug-community-language': 'en', 'ug-community-theme': 'light' } });
  assert.equal(app.root.lang, 'en');
  assert.equal(app.root.dir, 'ltr');
  assert.equal(app.root.dataset.theme, 'light');
});

test('live dictionary response is rendered from actual payload with provenance', async () => {
  const app = await harness({ api: async () => ({ ok: true, json: async () => structuredClone(lughetPayload) }) });
  await app.nodes.get('dictionary-form').emit('submit');
  const content = app.nodes.get('dictionary-results').textContent;
  assert.match(content, /مەكتەپ/);
  assert.match(content, /mektep/);
  assert.match(content, /0.1.0/);
  assert.ok(app.calls.at(-1).includes('/v1/search?'));
  assert.equal(app.nodes.get('dictionary-button').disabled, false);
});

test('real English Lughet definitions retain English direction in both interface languages', async () => {
  const app = await harness({ api: async () => ({ ok: true, json: async () => structuredClone(lughetPayload) }) });
  await app.nodes.get('dictionary-form').emit('submit');
  const assertEntryLanguages = () => {
    const card = app.nodes.get('dictionary-results').children[0];
    const heading = card.children[0].children[0];
    const definition = card.children.find((node) => node.tagName === 'P');
    assert.equal(heading.lang, 'ug');
    assert.equal(heading.dir, 'rtl');
    assert.equal(definition.textContent, 'A school, a place where students learn.');
    assert.equal(definition.lang, 'en');
    assert.equal(definition.dir, 'ltr');
  };
  assert.equal(app.root.lang, 'ug');
  assertEntryLanguages();
  await app.nodes.get('language-toggle').emit('click');
  assert.equal(app.root.lang, 'en');
  assertEntryLanguages();
});

test('unavailable API produces an error with no fabricated result and permits retry', async () => {
  const app = await harness();
  await app.nodes.get('dictionary-form').emit('submit');
  assert.equal(app.nodes.get('dictionary-results').children.length, 0);
  assert.ok(app.nodes.get('dictionary-status').classList.values.has('is-error'));
  assert.equal(app.nodes.get('dictionary-button').disabled, false);
  await app.nodes.get('language-toggle').emit('click');
  assert.match(app.nodes.get('dictionary-status').textContent, /Could not reach the API/);
});

test('catalog failure stays an error across language toggles', async () => {
  const app = await harness({ failCatalog: true });
  assert.equal(app.nodes.get('dictionary-button').disabled, true);
  await app.nodes.get('language-toggle').emit('click');
  assert.match(app.nodes.get('catalog-status').textContent, /Could not load the project catalog/);
});

test('invalid API payload fails safely and unsafe source links are omitted', async () => {
  const app = await harness({ api: async () => ({ ok: true, json: async () => ({ data: [{ word: 1 }] }) }) });
  await app.nodes.get('dictionary-form').emit('submit');
  assert.equal(app.nodes.get('dictionary-results').children.length, 0);
  assert.ok(app.nodes.get('dictionary-status').classList.values.has('is-error'));
  const valid = await harness({ api: async () => ({ ok: true, json: async () => ({ data: [{ word: '<script>', definition: '<img src=x>' }], meta: { sources: [{ url: 'javascript:alert(1)' }] } }) }) });
  await valid.nodes.get('dictionary-form').emit('submit');
  assert.ok(valid.nodes.get('dictionary-results').textContent.includes('<script>'));
  const provenance = valid.nodes.get('dictionary-results').children.at(-1);
  assert.equal(provenance.children.length, 0);
});

test('new projects are searchable and new release package choices survive language changes', async () => {
  const app = await harness();
  app.nodes.get('project-search').value = '@uyghurcommunity/create';
  await app.nodes.get('project-search').emit('input');
  assert.equal(app.nodes.get('project-grid').children.length, 1);
  assert.match(app.nodes.get('project-grid').textContent, /@uyghurcommunity\/create/);
  const select = app.nodes.get('package-select');
  select.children.forEach((option) => { option.selected = option.value === 'uyghur-starters'; });
  await select.emit('change');
  const archive = catalog.projects.find((project) => project.id === 'uyghur-starters').archive;
  assert.equal(app.nodes.get('install-command').textContent, 'npm install ' + archive);
  await app.nodes.get('language-toggle').emit('click');
  assert.equal(app.nodes.get('install-command').textContent, 'npm install ' + archive);
  await app.nodes.get('copy-command').emit('click');
  assert.equal(app.copied[0], 'npm install ' + archive);
  await app.nodes.get('clear-filters').emit('click');
  assert.equal(app.nodes.get('project-grid').children.length, 10);
  assert.equal(app.nodes.get('package-count').textContent, '7');
});

test('cultural and map searches expose UI 0.3.0 and its current release in both languages', async () => {
  const app = await harness();
  app.nodes.get('project-search').value = 'خەرىتە';
  await app.nodes.get('project-search').emit('input');
  assert.equal(app.nodes.get('project-grid').children.length, 1);
  assert.match(app.nodes.get('project-grid').textContent, /110 SVG/);
  assert.match(app.nodes.get('project-grid').textContent, /63/);
  assert.match(app.nodes.get('project-grid').textContent, /v0\.3\.0/);
  const select = app.nodes.get('package-select');
  select.children.forEach((option) => { option.selected = option.value === 'uyghur-ui'; });
  await select.emit('change');
  const command = 'npm install https://github.com/UyghurCommunity/uyghur-ui/releases/download/v0.3.0/uyghurcommunity-ui-0.3.0.tgz';
  assert.equal(app.nodes.get('install-command').textContent, command);
  await app.nodes.get('language-toggle').emit('click');
  assert.equal(app.nodes.get('project-grid').children.length, 1);
  assert.match(app.nodes.get('project-grid').textContent, /63 cultural/);
  assert.match(app.nodes.get('project-grid').textContent, /outline and heritage-color/);
  assert.match(app.nodes.get('project-grid').textContent, /East Turkistan flag and map/);
  app.nodes.get('project-search').value = 'clothing motifs';
  await app.nodes.get('project-search').emit('input');
  assert.equal(app.nodes.get('project-grid').children.length, 1);
  assert.match(app.nodes.get('project-grid').textContent, /Uyghur UI/);
  assert.equal(app.nodes.get('install-command').textContent, command);
  assert.equal(app.nodes.get('project-count').textContent, '10');
  assert.equal(app.nodes.get('package-count').textContent, '7');
});

test('interaction searches expose six website demos, their live gallery, and docs in both interface languages', async () => {
  const app = await harness();
  for (const query of ['interactions', 'uyghur-ui motion', 'uyghur-ui ئۆزئارا تەسىر', 'uyghur-ui جانلاندۇرۇش']) {
    app.nodes.get('project-search').value = query;
    await app.nodes.get('project-search').emit('input');
    assert.equal(app.nodes.get('project-grid').children.length, 1, query);
  }
  const assertLinks = () => {
    const card = app.nodes.get('project-grid').children[0], links = [];
    const collect = (node) => { if (node.tagName === 'A') links.push(node); node.children.forEach(collect); };
    collect(card);
    assert.equal(links.filter((link) => link.href === 'https://uyghurcommunity.github.io/uyghur-ui/interactions.html').length, 2);
    assert.ok(links.some((link) => link.href === 'https://uyghurcommunity.github.io/uyghur-ui/guide/introduction.html'));
    assert.match(card.textContent, /v0\.3\.0/);
  };
  assert.match(app.nodes.get('project-grid').textContent, /6 ئەسلى جانلىق مىسال/); assertLinks();
  await app.nodes.get('language-toggle').emit('click');
  assert.match(app.nodes.get('project-grid').textContent, /6 original interaction demos with native controls/);
  assert.match(app.nodes.get('project-grid').textContent, /6 standalone HTML downloads/); assertLinks();
  assert.equal(app.nodes.get('project-count').textContent, '10');
  assert.equal(app.nodes.get('package-count').textContent, '7');
});
