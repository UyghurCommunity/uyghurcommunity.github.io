export function isWebURL(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; }
  catch (_) { return false; }
}
export function validateCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') return { valid: false, errors: ['Catalog must be an object.'] };
  if (!isWebURL(catalog.dictionaryApiBase)) errors.push('dictionaryApiBase must be an HTTP(S) URL.');
  if (!['pending', 'published'].includes(catalog.registryStatus)) errors.push('registryStatus must be explicit.');
  if (!catalog.categories || typeof catalog.categories !== 'object') errors.push('categories are required.');
  if (!Array.isArray(catalog.projects)) return { valid: false, errors: [...errors, 'projects must be an array.'] };
  const seen = new Set();
  for (const project of catalog.projects) {
    if (typeof project.id !== 'string' || !/^[a-z0-9][a-z0-9.-]*$/.test(project.id)) errors.push('Project id is invalid.');
    if (seen.has(project.id)) errors.push(`Duplicate project id ${project.id}.`);
    seen.add(project.id);
    for (const key of ['title', 'description', 'type', 'status']) {
      if (!project[key] || ['ug', 'en'].some((language) => typeof project[key][language] !== 'string' || !project[key][language].trim())) errors.push(`${project.id}: ${key} needs Uyghur and English text.`);
    }
    if (!catalog.categories?.[project.category]) errors.push(`${project.id}: unknown category.`);
    for (const key of ['source', 'demo', 'docs', 'releases']) if (!isWebURL(project[key])) errors.push(`${project.id}: invalid ${key} URL.`);
    if (project.package) {
      if (!project.package.startsWith('@uyghurcommunity/')) errors.push(`${project.id}: package must use the community scope.`);
      if (!isWebURL(project.archive)) errors.push(`${project.id}: GitHub release archive is required.`);
    }
    if (!Array.isArray(project.tags) || project.tags.some((tag) => typeof tag !== 'string')) errors.push(`${project.id}: tags must be strings.`);
  }
  return { valid: errors.length === 0, errors };
}
const normalize = (value) => String(value).normalize('NFC').toLowerCase().trim();
export function filterProjects(projects, { query = '', category = 'all' } = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return projects.filter((project) => {
    if (category !== 'all' && project.category !== category) return false;
    const text = normalize([project.id, project.package || '', project.title.ug, project.title.en, project.description.ug, project.description.en, ...project.tags].join(' '));
    return terms.every((term) => text.includes(term));
  });
}
export function buildInstallCommand(project) {
  if (!project?.package || !isWebURL(project.archive)) throw new Error('Choose an installable project with a valid release archive.');
  const url = new URL(project.archive);
  if (url.hostname !== 'github.com' || !/^\/UyghurCommunity\/[a-z0-9.-]+\/archive\/refs\/tags\/v[0-9.]+\.tar\.gz$/.test(url.pathname) || url.search || url.hash) throw new Error('Install archives must be versioned UyghurCommunity GitHub releases.');
  return `npm install ${url.href}`;
}
export function buildSearchURL(base, query) {
  if (!isWebURL(base)) throw new Error('Dictionary API URL is invalid.');
  const text = query.trim();
  if (!text || text.length > 80) throw new Error('Enter 1–80 characters.');
  const url = new URL(base);
  url.pathname = url.pathname.replace(/\/$/, '') + '/v1/search';
  url.search = ''; url.hash = '';
  url.searchParams.set('q', text); url.searchParams.set('limit', '5');
  return url.href;
}
