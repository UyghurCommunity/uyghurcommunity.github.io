import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildInstallCommand, buildSearchURL, filterProjects, installablePackages, isWebURL, validateCatalog } from '../src/catalog.js';
const catalog = JSON.parse(await readFile(new URL('../projects.json', import.meta.url), 'utf8'));

test('catalog describes ten projects and eight package artifacts without claiming npm publication', () => {
  assert.deepEqual(validateCatalog(catalog), { valid: true, errors: [] });
  assert.deepEqual(catalog.projects.map((project) => project.id), ['doppa', 'doppa-kit', 'uyghur-keyboard', 'lughet-api', 'uyghur-rtl-lab', 'uyghur-ai-eval', 'uyghur-ui', 'doppa-studio', 'uyghur-text', 'uyghur-starters']);
  assert.equal(catalog.projects.filter((project) => project.package).length, 7);
  assert.equal(installablePackages(catalog).length, 8);
  assert.equal(catalog.registryStatus, 'pending');
  for (const project of catalog.projects) {
    assert.equal(new URL(project.source).pathname, `/UyghurCommunity/${project.id}`);
    assert.equal(new URL(project.demo).pathname, project.id === 'uyghur-ui' ? '/uyghur-ui/lab.html' : `/${project.id}/`);
    assert.equal(new URL(project.releases).pathname, `/UyghurCommunity/${project.id}/releases`);
  }
});

test('search works across Uyghur, English, package names and tags', () => {
  assert.equal(filterProjects(catalog.projects, { query: 'كۇنۇپكا' })[0].id, 'uyghur-keyboard');
  assert.equal(filterProjects(catalog.projects, { query: 'KEYBOARD' })[0].id, 'uyghur-keyboard');
  assert.equal(filterProjects(catalog.projects, { query: '@uyghurcommunity/lughet' })[0].id, 'lughet-api');
  assert.equal(filterProjects(catalog.projects, { query: 'JSONL' })[0].id, 'uyghur-ai-eval');
  assert.equal(filterProjects(catalog.projects, { query: 'no-such-project' }).length, 0);
  assert.equal(filterProjects(catalog.projects, { query: '@uyghurcommunity/ui' })[0].id, 'uyghur-ui');
  assert.equal(filterProjects(catalog.projects, { query: 'workbench' })[0].id, 'uyghur-text');
  assert.equal(filterProjects(catalog.projects, { category:'starters', query:'blog CLI' })[0].id, 'uyghur-starters');
  assert.equal(filterProjects(catalog.projects, { category:'design' })[0].id, 'doppa-studio');
  for (const query of ['dutar', 'rawap', 'atlas', 'heritage icons', 'cultural icons', 'clothing', 'motifs', 'East Turkistan map', 'outline map', 'filled map', 'color icons', 'دۇتار', 'راۋاپ', 'ئەتلەس', 'مىراس سىنبەلگە', 'مەدەنىيەت', 'كىيىم', 'نەقىش', 'خەرىتە', 'شەرقىي تۈركىستان', 'رەڭلىك']) {
    assert.ok(filterProjects(catalog.projects, { category:'frontend', query }).some((project) => project.id === 'uyghur-ui'), query);
  }
});

test('search terms and category are combined without changing the source catalog', () => {
  const result = filterProjects(catalog.projects, { category: 'culture', query: 'doppa' });
  assert.equal(result.length, 2);
  assert.equal(filterProjects(catalog.projects, { category: 'input', query: 'doppa' }).length, 0);
  assert.equal(filterProjects(catalog.projects, { query: 'AI CLI' })[0].id, 'uyghur-ai-eval');
  assert.equal(catalog.projects.length, 10);
});

test('UI interactions and Lab are discoverable in both languages with docs and the 0.4.0 release', () => {
  const ui = catalog.projects.find((project) => project.id === 'uyghur-ui');
  assert.equal(ui.demo, 'https://uyghurcommunity.github.io/uyghur-ui/lab.html');
  assert.equal(ui.docs, 'https://uyghurcommunity.github.io/uyghur-ui/guide/introduction.html');
  assert.equal(ui.docsEnglish, 'https://uyghurcommunity.github.io/uyghur-ui/guide/en/introduction.html');
  assert.match(ui.description.ug, /6 ئەسلى جانلىق مىسال/);
  assert.match(ui.description.en, /6 original interaction demos with native controls and 6 standalone HTML downloads/);
  for (const query of ['interactions', 'interactivity', 'motion', 'native controls', 'standalone HTML', 'ئۆزئارا تەسىر', 'جانلاندۇرۇش', 'ھەرىكەت', 'جانلىق مىسال']) {
    assert.deepEqual(filterProjects(catalog.projects, { category: 'frontend', query }).map((project) => project.id), ['uyghur-ui'], query);
  }
  assert.deepEqual(ui.status, { ug: 'v0.4.0', en: 'v0.4.0' });
  assert.equal(buildInstallCommand(ui), 'npm install https://github.com/UyghurCommunity/uyghur-ui/releases/download/v0.4.0/uyghurcommunity-ui-0.4.0.tgz');
  assert.equal(catalog.projects.length, 10);
  assert.equal(catalog.projects.filter((project) => project.package).length, 7);
});

test('additional React artifact uses the UI repository and is separate from the ten project cards', () => {
  const before = JSON.stringify(catalog), packages = installablePackages(catalog);
  const react = packages.find((entry) => entry.id === 'uyghur-ui-react');
  assert.equal(react.repository, 'uyghur-ui'); assert.equal(react.package, '@uyghurcommunity/ui-react');
  assert.equal(buildInstallCommand(react), 'npm install https://github.com/UyghurCommunity/uyghur-ui/releases/download/v0.4.0/uyghurcommunity-ui-react-0.4.0.tgz');
  assert.equal(catalog.projects.some((entry) => entry.id === react.id), false);
  packages.pop(); assert.equal(installablePackages(catalog).length, 8); assert.equal(JSON.stringify(catalog), before);
  const legacy = { ...catalog }; delete legacy.additionalPackages; assert.equal(installablePackages(legacy).length, 7); assert.equal(validateCatalog(legacy).valid, true);
  for (const query of ['writing', 'React', '@uyghurcommunity/ui-react', 'theme builder', 'registry', '2 application blocks', '22 guides', 'يېزىش', 'رەڭ قۇرغۇچ']) assert.ok(filterProjects(catalog.projects, { query }).some((entry) => entry.id === 'uyghur-ui'), query);
});

test('additional artifact validation rejects duplicate IDs, missing bilingual labels and unsafe repository/archive mappings', () => {
  const invalid = (change) => { const candidate = structuredClone(catalog); change(candidate.additionalPackages[0], candidate); assert.equal(validateCatalog(candidate).valid, false); };
  invalid((extra) => { extra.id = 'uyghur-ui'; });
  invalid((extra, candidate) => { candidate.additionalPackages.push(structuredClone(extra)); });
  invalid((extra) => { extra.repository = '../uyghur-ui'; });
  invalid((extra) => { extra.repository = 'another-repository'; });
  invalid((extra) => { delete extra.title.ug; });
  invalid((extra) => { extra.package = '@other/ui-react'; });
  invalid((extra) => { extra.archive = extra.archive.replace('uyghurcommunity-ui-react-', 'uyghurcommunity-text-'); });
  invalid((extra) => { extra.archive = extra.archive.replace('ui-react-0.4.0.tgz', 'ui-react-0.5.0.tgz'); });
  invalid((extra) => { extra.archive += '?download=1'; });
  invalid((extra, candidate) => { candidate.additionalPackages = {}; });
});

test('installation commands use pinned community release archives, never unpublished registry names', () => {
  for (const project of installablePackages(catalog)) {
    const command = buildInstallCommand(project);
    assert.equal(command, `npm install ${project.archive}`);
    const pathname = new URL(project.archive).pathname;
    assert.ok(pathname.startsWith('/UyghurCommunity/' + (project.repository ?? project.id) + '/'));
    assert.ok(/\/archive\/refs\/tags\/v\d+\.\d+\.\d+\.tar\.gz$/.test(pathname) || /\/releases\/download\/v\d+\.\d+\.\d+\/uyghurcommunity-[a-z-]+-\d+\.\d+\.\d+\.tgz$/.test(pathname));
    assert.ok(!command.includes('npm install @'));
  }
  assert.ok(catalog.projects.find((project) => project.id === 'uyghur-keyboard').archive.endsWith('/v0.1.1.tar.gz'));
  assert.throws(() => buildInstallCommand(catalog.projects[0]));
  assert.throws(() => buildInstallCommand({ package: '@uyghurcommunity/a', archive: 'https://evil.example/a.tar.gz' }));
  assert.throws(() => buildInstallCommand({ package: '@uyghurcommunity/a', archive: 'https://github.com/UyghurCommunity/a/archive/refs/tags/v0.1.0.tar.gz?x=1' }));
});

test('API query construction preserves words and encodes query syntax safely', () => {
  const url = new URL(buildSearchURL('https://api.example.test/', ' مەكتەپ '));
  assert.equal(url.pathname, '/v1/search');
  assert.equal(url.searchParams.get('q'), 'مەكتەپ');
  assert.equal(url.searchParams.get('limit'), '5');
  assert.equal(new URL(buildSearchURL('https://api.example.test/base/', 'a&limit=99')).searchParams.get('q'), 'a&limit=99');
  assert.equal(new URL(buildSearchURL('https://api.example.test/base/', 'a')).pathname, '/base/v1/search');
  assert.throws(() => buildSearchURL('https://api.example.test', ' '));
  assert.throws(() => buildSearchURL('https://api.example.test', 'x'.repeat(81)));
  assert.throws(() => buildSearchURL('javascript:alert(1)', 'a'));
});

test('unsafe URLs, duplicate IDs, missing bilingual content and invalid packages are caught', () => {
  assert.equal(isWebURL('https://github.com/UyghurCommunity'), true);
  assert.equal(isWebURL('javascript:alert(1)'), false);
  assert.equal(isWebURL('https://user:password@example.test'), false);
  const invalid = structuredClone(catalog);
  invalid.projects[1].id = invalid.projects[0].id;
  invalid.projects[0].source = 'javascript:alert(1)';
  delete invalid.projects[0].title.ug;
  invalid.projects[1].package = '@another-org/doppa';
  assert.equal(validateCatalog(invalid).valid, false);
  assert.equal(validateCatalog(invalid).errors.length, 4);
});

test('draft vocabulary and evaluation status are visible in both languages', () => {
  const dictionary = catalog.projects.find((project) => project.id === 'lughet-api');
  const evaluation = catalog.projects.find((project) => project.id === 'uyghur-ai-eval');
  assert.match(dictionary.status.en, /Draft/);
  assert.match(evaluation.status.en, /Not expert-reviewed/);
  assert.ok(dictionary.status.ug);
  assert.ok(evaluation.status.ug);
});

test('new release assets match repository, package name and pinned version', () => {
  const expected = {
    'uyghur-ui': ['0.4.0', 'uyghurcommunity-ui-0.4.0.tgz'],
    'uyghur-text': ['0.1.0', 'uyghurcommunity-text-0.1.0.tgz'],
    'uyghur-starters': ['0.2.0', 'uyghurcommunity-create-0.2.0.tgz'],
  };
  for (const [id,[version,filename]] of Object.entries(expected)) {
    const project = catalog.projects.find((item) => item.id === id);
    assert.equal(project.archive, 'https://github.com/UyghurCommunity/' + id + '/releases/download/v' + version + '/' + filename);
    assert.equal(buildInstallCommand(project), 'npm install ' + project.archive);
  }
  const ui = catalog.projects.find((project) => project.id === 'uyghur-ui');
  assert.throws(() => buildInstallCommand({...ui,archive:ui.archive.replace('ui-0.4.0.tgz','ui-0.5.0.tgz')}));
  assert.throws(() => buildInstallCommand({...ui,archive:ui.archive.replace('uyghurcommunity-ui-','uyghurcommunity-text-')}));
  assert.throws(() => buildInstallCommand({...ui,archive:ui.archive.replace('/uyghur-ui/','/other-repo/')}));
  assert.throws(() => buildInstallCommand({...ui,archive:ui.archive.replace('https:','http:')}));
  assert.throws(() => buildInstallCommand({...ui,archive:ui.archive + '?download=1'}));
  assert.equal(catalog.projects.find((project) => project.id === 'doppa-studio').package, undefined);
});
