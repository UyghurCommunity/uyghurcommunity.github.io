import { buildInstallCommand, buildSearchURL, filterProjects, isWebURL, validateCatalog } from './catalog.js';
const $ = (id) => document.getElementById(id);
const messages = {
  ug: {
    skip: 'مەزمۇنغا ئاتلاش', brandTag: 'مىراستىن ئىلھام. ھەممە ئادەمگە ئوچۇق.', navigation: 'ئاساسىي تىزىملىك', projectsNav: 'تۈرلەر', apiNav: 'API نى سىناش', contributeNav: 'تۆھپە قوشۇش',
    eyebrow: 'ئورتاق تىل. ئوچۇق كەلگۈسى.', heroLine1: 'ئۇيغۇرچە ئىجاد،', heroLine2: 'ھەممە ئادەم ئۈچۈن.', heroDescription: 'نەقىشتىن كودقا، بىر ھەرپتىن يېڭى بىر قورالغىچە. ئۇيغۇرچە تور تەجرىبىلىرىنى بىرلىكتە ياساش، ئۆگىنىش ۋە ئورتاقلىشىش ئۈچۈن ئوچۇق مەيدان.', browseProjects: 'تۈرلەرنى كۆرۈڭ', joinBuilding: 'بىرلىكتە ياسايلى', heroCaption: 'مەدەنىيەت، تىل ۋە ئىجاد بىر يەردە.',
    artLabel: 'كەشتە نەقىشىدىن ئىلھاملانغان رەقەملىك سەنئەت', loomLabel: 'كەشتە × كود', loomSide: 'بىرلىكتە توقۇيمىز.', loomBottom: 'ھەر بىر يىپ، بىر يېڭى باشلىنىش.', factProjects: 'ئوچۇق تۈر', factPackages: 'نەشر بوغچىسى', factLanguages: 'ئىككى تىللىق قوللانما',
    projectsEyebrow: '01 / قۇرۇشقا تەييار', projectsHeading: 'بىر ئىدىيە. كۆپ يول.', projectsIntro: 'ئۆز تۈرىڭىزگە قوشۇڭ، ئۆزگەرتىڭ ياكى بىر يېڭى ئىدىيە بىلەن تۆھپە قوشۇڭ.', filterLabel: 'تۈر بويىچە سۈزۈش', searchPlaceholder: 'تۈر، قورال ياكى تېما ئىزدەڭ…', searchLabel: 'تۈر ئىزدەش', catalogLoading: 'تۈرلەر يۈكلىنىۋاتىدۇ…', noResults: 'ماس كېلىدىغان تۈر تېپىلمىدى.', clearFilters: 'سۈزگۈچلەرنى تازىلاش ↺',
    installEyebrow: '02 / ئۆز تۈرىڭىزگە', installHeading: 'بىر بۇيرۇق بىلەن باشلاڭ.', installDescription: 'نەشرى بەلگىلەنگەن GitHub ئارخىپلىرىدىن بىۋاسىتە قاچىلاڭ. ھەر بىر بوغچىنىڭ ئۆزىگە خاس قوللانمىسى ۋە مىساللىرى بار.', choosePackage: 'بوغچىنى تاللاڭ', copyLabel: 'قاچىلاش بۇيرۇقىنى كۆچۈرۈش', registryPending: 'npm registry دا ئېلان قىلىش تېخى تاماملانمىدى؛ بۇ بۇيرۇق GitHub نەشر ئارخىپىنى ئىشلىتىدۇ.',
    apiEyebrow: '03 / جاۋابنى شۇ يەردە كۆرۈڭ', apiHeading: 'لۇغەت API نى سىناڭ.', apiIntro: 'كىچىك، ئەسلىدىن يېزىلغان لايىھە سۆزلۈك. تولۇق ياكى مۇتەخەسسىس تەكشۈرگەن لۇغەت ئەمەس.', draftBadge: 'لايىھە سانلىق مەلۇمات', dictionaryLabel: 'ئۇيغۇرچە ياكى لاتىنچە سۆز كىرگۈزۈڭ', dictionarySearch: 'ئىزدەش ←', apiPrivacy: 'سوئالىڭىز مۇشۇ ئىزدەشنى بېسىشتا ئاممىۋى Lughet API غا ئەۋەتىلىدۇ.', dictionaryReady: 'تەييار. بىر سۆزنى سىناپ بېقىڭ.', offlineDictionary: 'تورسىز لۇغەت مىسالىنى ئېچىش ↗',
    apiExplainEyebrow: 'مەنبە ئوچۇق', apiExplainHeading: 'سۆزدىن باشلىنىدۇ.', apiExplainDescription: 'ھەر بىر جاۋابتا سانلىق مەلۇمات نەشرى ۋە مەنبەسى بار. SDK ئارقىلىق API غا ئۇلىنىڭ ياكى يەرلىك JSON بىلەن تورسىز ئىشلەڭ.', apiFeature1: 'ئىزدەش ۋە سۆز تەكلىپى', apiFeature2: 'بۈگۈنكى سۆز', apiFeature3: 'مەنبە ۋە نەشر ئۇچۇرى', apiDocs: 'API قوللانمىسى ↗', dictionaryContribute: 'يېڭى سۆز تەكلىپ قىلىش ↗',
    contributeEyebrow: '04 / سىزنىڭ ئورنىڭىزمۇ بار', contributeLine1: 'بىر كود قۇرى.', contributeLine2: 'بىر ئورتاق كەلگۈسى.', contributeDescription: 'سوئال يېزىڭ، بىر خاتالىقنى تۈزىتىڭ، ئۇيغۇرچە ئىپادىنى ياخشىلاڭ ياكى نەقىش تەكلىپ قىلىڭ. كىچىك تۆھپىلەرمۇ يېڭى يول ئاچىدۇ.', shareIdea: 'ئىدىيەڭىزنى ئورتاقلىشىڭ ↗', browseSource: 'مەنبە كودلارنى كۆرۈش ↗', contribution1: 'بىر سوئالنى تەكشۈرۈڭ', contribution1Detail: 'تىل ۋە جاۋاب ئۆلچىمىگە ياردەم بېرىڭ.', contribution2: 'بىر مىسال قوشۇڭ', contribution2Detail: 'ئارىلاش يېزىقتىكى مەسىلىنى ئورتاقلىشىڭ.', contribution3: 'بىر نەقىش تەكلىپ قىلىڭ', contribution3Detail: 'مەدەنىيەت بىلەن ئىجادنى ئۇلاڭ.', footerNote: 'ئۇيغۇرچە ئىجاد ئۈچۈن ئوچۇق قوراللار.', feedback: 'پىكىر',
    source: 'مەنبە', demo: 'سىناش', docs: 'قوللانما', releases: 'نەشرلەر ↗', pendingPackage: 'npm ئېلانى كۈتۈلۈۋاتىدۇ', copied: 'بۇيرۇق كۆچۈرۈلدى ✓', copyFailed: 'ئاپتوماتىك كۆچۈرگىلى بولمىدى؛ بۇيرۇقنى تاللاپ كۆچۈرۈڭ.', catalogFailed: 'تۈرلەرنى يۈكلىگىلى بولمىدى. GitHub تەشكىلاتىنى بىۋاسىتە ئاچسىڭىز بولىدۇ.', dictionaryLoading: 'API دىن ئىزدەلىۋاتىدۇ…', dictionaryEmpty: 'ماس سۆز تېپىلمىدى. بۇ لايىھە لۇغەتنىڭ دائىرىسى كىچىك.', dictionaryFailed: 'API غا ئۇلىنالمىدى. تۆۋەندىكى تورسىز لۇغەت مىسالىنى سىناپ بېقىڭ.', queryInvalid: '1 دىن 80 گىچە ھەرپ كىرگۈزۈڭ.', sourceLabel: 'مەنبە', versionLabel: 'نەشر', lightTheme: 'يورۇق كۆرۈنۈشكە ئالماشتۇرۇش', darkTheme: 'قاراڭغۇ كۆرۈنۈشكە ئالماشتۇرۇش',
  },
  en: {
    skip: 'Skip to projects', brandTag: 'Inspired by heritage. Open to everyone.', navigation: 'Main navigation', projectsNav: 'Projects', apiNav: 'Try the API', contributeNav: 'Contribute',
    eyebrow: 'A shared language. An open future.', heroLine1: 'Build in Uyghur.', heroLine2: 'Share with everyone.', heroDescription: 'From embroidery to code, from a single letter to a useful new tool. An open place to build, learn, and share better Uyghur experiences on the web.', browseProjects: 'Explore the projects', joinBuilding: 'Build with us', heroCaption: 'Culture, language, and creative work in one place.',
    artLabel: 'Original digital artwork inspired by embroidery', loomLabel: 'THREAD × CODE', loomSide: 'Woven together.', loomBottom: 'Every thread, a new beginning.', factProjects: 'open projects', factPackages: 'release packages', factLanguages: 'bilingual documentation',
    projectsEyebrow: '01 / READY TO BUILD', projectsHeading: 'One idea. Many possibilities.', projectsIntro: 'Use a tool in your own project, improve it, or bring a new idea to the community.', filterLabel: 'Filter projects by category', searchPlaceholder: 'Search a project, tool, or topic…', searchLabel: 'Search projects', catalogLoading: 'Loading projects…', noResults: 'No projects match your search.', clearFilters: 'Clear the filters ↺',
    installEyebrow: '02 / INTO YOUR PROJECT', installHeading: 'Start with one command.', installDescription: 'Install directly from versioned GitHub release archives. Each package comes with its own documentation and working examples.', choosePackage: 'Choose a package', copyLabel: 'Copy the installation command', registryPending: 'npm registry publication is pending. This command installs a versioned GitHub archive or release package.',
    apiEyebrow: '03 / SEE THE RESPONSE', apiHeading: 'Try the dictionary API.', apiIntro: 'A small, originally authored draft vocabulary. It is not a comprehensive or expert-reviewed dictionary.', draftBadge: 'DRAFT VOCABULARY', dictionaryLabel: 'Enter a word in Uyghur or Latin script', dictionarySearch: 'Search →', apiPrivacy: 'Pressing Search sends your query to the public Lughet API.', dictionaryReady: 'Ready when you are. Try a word.', offlineDictionary: 'Open the offline dictionary demo ↗',
    apiExplainEyebrow: 'OPEN PROVENANCE', apiExplainHeading: 'It begins with a word.', apiExplainDescription: 'Responses include dataset version and source information. Connect through the SDK, or work offline with the local JSON adapter.', apiFeature1: 'Search and suggestions', apiFeature2: 'Word of the day', apiFeature3: 'Source and version information', apiDocs: 'Read the API documentation ↗', dictionaryContribute: 'Propose a dictionary entry ↗',
    contributeEyebrow: '04 / THERE IS A PLACE FOR YOU', contributeLine1: 'One line of code.', contributeLine2: 'A shared future.', contributeDescription: 'Ask a question, fix a bug, improve Uyghur wording, or suggest a pattern. Small contributions open new paths.', shareIdea: 'Share your idea ↗', browseSource: 'Browse the source ↗', contribution1: 'Review one task', contribution1Detail: 'Help improve language and answer criteria.', contribution2: 'Add an example', contribution2Detail: 'Share a mixed-script layout problem.', contribution3: 'Suggest a pattern', contribution3Detail: 'Connect culture with creative work.', footerNote: 'Open tools for creating in Uyghur.', feedback: 'Feedback',
    source: 'Source', demo: 'Demo', docs: 'Docs', releases: 'Releases ↗', pendingPackage: 'npm release pending', copied: 'Command copied ✓', copyFailed: 'Could not copy automatically. Select and copy the command.', catalogFailed: 'Could not load the project catalog. You can open the GitHub organization directly.', dictionaryLoading: 'Searching the live API…', dictionaryEmpty: 'No matching words. This draft vocabulary is intentionally small.', dictionaryFailed: 'Could not reach the API. Try the offline dictionary demo below.', queryInvalid: 'Enter between 1 and 80 characters.', sourceLabel: 'Source', versionLabel: 'Version', lightTheme: 'Switch to light appearance', darkTheme: 'Switch to dark appearance',
  },
};
let language = 'ug', theme = 'dark', catalog, activeCategory = 'all', chosenPackage = '', lastDictionaryData;
let dictionaryState = 'dictionaryReady', dictionaryRequest = 0, controller, catalogFailed = false;
try { if (localStorage.getItem('ug-community-language') === 'en') language = 'en'; if (localStorage.getItem('ug-community-theme') === 'light') theme = 'light'; } catch (_) {}
const t = (key) => messages[language][key] || key;
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function applyTheme() {
  document.documentElement.dataset.theme = theme;
  $('theme-toggle').setAttribute('aria-label', t(theme === 'dark' ? 'lightTheme' : 'darkTheme'));
  $('theme-toggle').setAttribute('aria-pressed', String(theme === 'light'));
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#101e1c' : '#f6f2e8';
}
function applyLanguage() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ug' ? 'rtl' : 'ltr';
  $('project-search').lang = /[\u0600-\u06ff]/u.test($('project-search').value) ? 'ug' : language;
  document.title = language === 'ug' ? 'UyghurCommunity — ئۇيغۇرچە ئىجاد ئۈچۈن ئوچۇق قوراللار' : 'UyghurCommunity — Open tools for creating in Uyghur';
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); node.lang = language; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  $('language-toggle').textContent = language === 'ug' ? 'English' : 'ئۇيغۇرچە';
  $('language-toggle').setAttribute('aria-label', language === 'ug' ? 'Switch to English' : 'ئۇيغۇرچىگە ئالماشتۇرۇش');
  $('language-toggle').lang = language === 'ug' ? 'en' : 'ug';
  if (catalog) { renderCategories(); renderProjects(); renderPackages(); }
  else if (catalogFailed) $('catalog-status').textContent = t('catalogFailed');
  $('dictionary-status').textContent = t(dictionaryState);
  if (lastDictionaryData) renderDictionary(lastDictionaryData);
  applyTheme();
}
function renderCategories() {
  const fragment = document.createDocumentFragment();
  for (const [id, names] of Object.entries(catalog.categories)) {
    const button = element('button', names[language]);
    button.type = 'button';
    button.lang = language;
    button.setAttribute('aria-pressed', String(activeCategory === id));
    button.addEventListener('click', () => { activeCategory = id; renderCategories(); renderProjects(); });
    fragment.append(button);
  }
  $('category-filters').replaceChildren(fragment);
}
function projectLink(url, text, className) {
  const a = element('a', text, className);
  a.href = url;
  return a;
}
function renderProjects() {
  const projects = filterProjects(catalog.projects, { query: $('project-search').value, category: activeCategory });
  const symbols = { doppa: '✧', 'doppa-kit': '✳', 'uyghur-keyboard': '⌨', 'lughet-api': '⌕', 'uyghur-rtl-lab': '↔', 'uyghur-ai-eval': '✓', 'uyghur-ui': '▦', 'doppa-studio': '◈', 'uyghur-text': 'Aa', 'uyghur-starters': '▱' };
  const fragment = document.createDocumentFragment();
  projects.forEach((project) => {
    const card = element('article', undefined, `project-card project-${project.category}`);
    const top = element('div', undefined, 'project-top');
    const symbol = element('span', symbols[project.id] || '✧', 'project-symbol'); symbol.setAttribute('aria-hidden', 'true');
    top.append(symbol, element('span', project.status[language], 'project-status'));
    const title = element('h3'); title.append(projectLink(project.demo, project.title[language]));
    card.append(top, element('p', project.type[language], 'project-type'), title, element('p', project.description[language], 'project-description'));
    const tags = element('div', undefined, 'project-tags');
    project.tags.slice(0, 3).forEach((tag) => tags.append(element('span', tag)));
    card.append(tags);
    if (project.package) {
      const packageRow = element('div', undefined, 'package-row');
      const code = element('code', project.package); code.dir = 'ltr';
      packageRow.append(code);
      if (catalog.registryStatus === 'pending') packageRow.append(element('small', t('pendingPackage')));
      card.append(packageRow);
    }
    const links = element('div', undefined, 'project-links');
    links.append(projectLink(project.source, t('source')), projectLink(project.demo, t('demo')), projectLink(project.docs, t('docs')), projectLink(project.releases, t('releases'), 'release-link'));
    card.append(links);
    fragment.append(card);
  });
  $('project-grid').replaceChildren(fragment);
  $('empty-results').hidden = projects.length > 0;
  $('catalog-status').textContent = language === 'ug' ? `${catalog.projects.length} تۈردىن ${projects.length} سى كۆرسىتىلدى` : `Showing ${projects.length} of ${catalog.projects.length} projects`;
}
function renderPackages() {
  const packages = catalog.projects.filter((project) => project.package);
  if (!packages.some((project) => project.id === chosenPackage)) chosenPackage = packages[0]?.id || '';
  $('package-select').replaceChildren(...packages.map((project) => {
    const option = element('option', `${project.title[language]} — ${project.package}`);
    option.value = project.id; option.selected = project.id === chosenPackage;
    return option;
  }));
  const project = packages.find((project) => project.id === chosenPackage);
  $('install-command').textContent = project ? buildInstallCommand(project) : '';
  $('registry-note').hidden = catalog.registryStatus !== 'pending';
  $('copy-command').disabled = !project;
}
function dictionaryStatus(key) {
  dictionaryState = key;
  $('dictionary-status').textContent = t(key);
  $('dictionary-status').classList.toggle('is-error', ['dictionaryFailed', 'queryInvalid'].includes(key));
}
function renderDictionary(payload) {
  const fragment = document.createDocumentFragment();
  payload.data.slice(0, 5).forEach((word) => {
    const card = element('article', undefined, 'word-card');
    const top = element('div', undefined, 'word-heading');
    const title = element('h3', word.word); title.lang = 'ug'; title.dir = 'rtl';
    const latin = element('bdi', word.latin || ''); latin.lang = 'ug-Latn';
    top.append(title, latin);
    // Lughet's starter definitions are English, independent of the interface language.
    const definition = element('p', word.definition); definition.lang = 'en'; definition.dir = 'ltr';
    card.append(top, definition);
    fragment.append(card);
  });
  if (payload.data.length) {
    const provenance = element('p', `${t('versionLabel')}: ${payload.meta?.datasetVersion || '—'} · ${t('draftBadge')}`, 'word-provenance');
    const source = payload.meta?.sources?.find((item) => isWebURL(item.url));
    if (source) provenance.append(document.createTextNode(' · '), projectLink(source.url, `${t('sourceLabel')} ↗`));
    fragment.append(provenance);
  }
  $('dictionary-results').replaceChildren(fragment);
}
$('project-search').addEventListener('input', (event) => { event.target.lang = /[\u0600-\u06ff]/u.test(event.target.value) ? 'ug' : language; if (catalog) renderProjects(); });
$('dictionary-query').addEventListener('input', (event) => { event.target.lang = /[\u0600-\u06ff]/u.test(event.target.value) ? 'ug' : 'en'; });
$('clear-filters').addEventListener('click', () => { activeCategory = 'all'; $('project-search').value = ''; renderCategories(); renderProjects(); $('project-search').focus(); });
$('package-select').addEventListener('change', (event) => { chosenPackage = event.target.value; renderPackages(); $('copy-status').textContent = ''; });
$('language-toggle').addEventListener('click', () => { language = language === 'ug' ? 'en' : 'ug'; applyLanguage(); try { localStorage.setItem('ug-community-language', language); } catch (_) {} });
$('theme-toggle').addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; applyTheme(); try { localStorage.setItem('ug-community-theme', theme); } catch (_) {} });
$('copy-command').addEventListener('click', async () => {
  const text = $('install-command').textContent;
  if (!text) return;
  let copied = false;
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); copied = true; } } catch (_) {}
  if (!copied) {
    const textarea = element('textarea'); textarea.value = text; textarea.style.cssText = 'position:fixed;inset:0;opacity:0;pointer-events:none';
    document.body.appendChild(textarea); textarea.select();
    try { copied = document.execCommand('copy'); } catch (_) {}
    textarea.remove(); $('copy-command').focus({ preventScroll: true });
  }
  $('copy-status').textContent = t(copied ? 'copied' : 'copyFailed');
});
$('dictionary-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!catalog) return;
  let url;
  try { url = buildSearchURL(catalog.dictionaryApiBase, $('dictionary-query').value); }
  catch (_) { dictionaryStatus('queryInvalid'); return; }
  const request = ++dictionaryRequest;
  controller?.abort(); controller = new AbortController();
  const activeController = controller;
  const timeout = setTimeout(() => activeController.abort(), 10000);
  lastDictionaryData = undefined;
  $('dictionary-results').replaceChildren();
  $('dictionary-button').disabled = true;
  dictionaryStatus('dictionaryLoading');
  try {
    const response = await fetch(url, { signal: activeController.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.data) || payload.data.some((word) => typeof word.word !== 'string' || typeof word.definition !== 'string')) throw new Error('Invalid dictionary response.');
    if (request !== dictionaryRequest) return;
    lastDictionaryData = payload;
    renderDictionary(payload);
    dictionaryStatus(payload.data.length ? 'dictionaryReady' : 'dictionaryEmpty');
    if (payload.data.length) $('dictionary-status').textContent = language === 'ug' ? `${payload.data.length} نەتىجە كۆرسىتىلدى. لايىھە سۆزلۈك.` : `${payload.data.length} results shown. Draft vocabulary.`;
  } catch (_) { if (request === dictionaryRequest) dictionaryStatus('dictionaryFailed'); }
  finally { clearTimeout(timeout); if (request === dictionaryRequest) $('dictionary-button').disabled = false; }
});
applyLanguage();
async function start() {
  try {
    const response = await fetch(new URL('../projects.json', import.meta.url));
    if (!response.ok) throw new Error('Catalog request failed.');
    const data = await response.json();
    const check = validateCatalog(data);
    if (!check.valid) throw new Error(check.errors.join(' '));
    catalog = data;
    $('project-count').textContent = catalog.projects.length;
    $('package-count').textContent = catalog.projects.filter((project) => project.package).length;
    renderCategories(); renderProjects(); renderPackages();
  } catch (_) {
    catalogFailed = true;
    $('catalog-status').textContent = t('catalogFailed');
    $('copy-command').disabled = true;
    $('dictionary-button').disabled = true;
  }
}
start();
