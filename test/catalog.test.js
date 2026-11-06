import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildInstallCommand, buildSearchURL, filterProjects, isWebURL, validateCatalog } from '../src/catalog.js';
const catalog = JSON.parse(await readFile(new URL('../projects.json', import.meta.url), 'utf8'));

test('catalog describes all six real project routes and four versioned packages without claiming npm publication', () => {
  assert.deepEqual(validateCatalog(catalog), { valid: true, errors: [] });
  assert.deepEqual(catalog.projects.map((project) => project.id), ['doppa', 'doppa-kit', 'uyghur-keyboard', 'lughet-api', 'uyghur-rtl-lab', 'uyghur-ai-eval']);
  assert.equal(catalog.projects.filter((project) => project.package).length, 4);
  assert.equal(catalog.registryStatus, 'pending');
  for (const project of catalog.projects) {
    assert.equal(new URL(project.source).pathname, `/UyghurCommunity/${project.id}`);
    assert.equal(new URL(project.demo).pathname, `/${project.id}/`);
    assert.equal(new URL(project.releases).pathname, `/UyghurCommunity/${project.id}/releases`);
  }
});

test('search works across Uyghur, English, package names and tags', () => {
  assert.equal(filterProjects(catalog.projects, { query: 'كۇنۇپكا' })[0].id, 'uyghur-keyboard');
  assert.equal(filterProjects(catalog.projects, { query: 'KEYBOARD' })[0].id, 'uyghur-keyboard');
  assert.equal(filterProjects(catalog.projects, { query: '@uyghurcommunity/lughet' })[0].id, 'lughet-api');
  assert.equal(filterProjects(catalog.projects, { query: 'JSONL' })[0].id, 'uyghur-ai-eval');
  assert.equal(filterProjects(catalog.projects, { query: 'no-such-project' }).length, 0);
});

test('search terms and category are combined without changing the source catalog', () => {
  const result = filterProjects(catalog.projects, { category: 'culture', query: 'doppa' });
  assert.equal(result.length, 2);
  assert.equal(filterProjects(catalog.projects, { category: 'input', query: 'doppa' }).length, 0);
  assert.equal(filterProjects(catalog.projects, { query: 'AI CLI' })[0].id, 'uyghur-ai-eval');
  assert.equal(catalog.projects.length, 6);
});

test('installation commands use pinned community release archives, never unpublished registry names', () => {
  for (const project of catalog.projects.filter((project) => project.package)) {
    const command = buildInstallCommand(project);
    assert.ok(command.startsWith(`npm install https://github.com/UyghurCommunity/${project.id}/archive/refs/tags/v0.1.0.tar.gz`));
    assert.ok(!command.includes('npm install @'));
  }
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
