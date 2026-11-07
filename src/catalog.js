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
    if (project.docsEnglish !== undefined && !isWebURL(project.docsEnglish)) errors.push(`${project.id}: invalid English documentation URL.`);
    if (project.package) {
      if (!project.package.startsWith('@uyghurcommunity/')) errors.push(`${project.id}: package must use the community scope.`);
      if (!isWebURL(project.archive)) errors.push(`${project.id}: GitHub release archive is required.`);
    }
    if (!Array.isArray(project.tags) || project.tags.some((tag) => typeof tag !== 'string')) errors.push(`${project.id}: tags must be strings.`);
  }
  if (catalog.additionalPackages !== undefined && !Array.isArray(catalog.additionalPackages)) errors.push('additionalPackages must be an array.');
  const packages = new Set(catalog.projects.filter((project) => project.package).map((project) => project.package));
  for (const extra of Array.isArray(catalog.additionalPackages) ? catalog.additionalPackages : []) {
    if (!extra || typeof extra !== 'object' || Array.isArray(extra)) { errors.push('Additional package must be an object.'); continue; }
    if (typeof extra.id !== 'string' || !/^[a-z0-9][a-z0-9.-]*$/.test(extra.id)) errors.push('Additional package id is invalid.');
    if (seen.has(extra.id)) errors.push(`Duplicate package id ${extra.id}.`);
    seen.add(extra.id);
    if (typeof extra.repository !== 'string' || !/^[a-z0-9][a-z0-9.-]*$/.test(extra.repository)) errors.push(`${extra.id}: repository must be a slug.`);
    if (!extra.title || ['ug', 'en'].some((language) => typeof extra.title[language] !== 'string' || !extra.title[language].trim())) errors.push(`${extra.id}: title needs Uyghur and English text.`);
    if (typeof extra.package !== 'string' || !/^@uyghurcommunity\/[a-z0-9][a-z0-9.-]*$/.test(extra.package)) errors.push(`${extra.id}: package must use the community scope.`);
    if (packages.has(extra.package)) errors.push(`Duplicate package name ${extra.package}.`);
    packages.add(extra.package);
    try { buildInstallCommand(extra); } catch { errors.push(`${extra.id}: invalid matching release archive.`); }
  }
  return { valid: errors.length === 0, errors };
}
/** Installation artifacts can share a project repository without duplicating project cards. */
export function installablePackages(catalog) {
  if (!catalog || !Array.isArray(catalog.projects) || catalog.additionalPackages !== undefined && !Array.isArray(catalog.additionalPackages)) throw new TypeError('Use a catalog with projects and an optional additionalPackages array.');
  return [...catalog.projects.filter((project) => project.package), ...(catalog.additionalPackages ?? [])];
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
  const repository = project.repository ?? project.id;
  if (typeof repository !== 'string' || !/^[a-z0-9][a-z0-9.-]*$/.test(repository)) throw new Error('Install repository must be a project slug.');
  const url = new URL(project.archive);
  const source = url.pathname.match(/^\/UyghurCommunity\/([a-z0-9][a-z0-9.-]*)\/archive\/refs\/tags\/v(\d+\.\d+\.\d+)\.tar\.gz$/);
  const asset = url.pathname.match(/^\/UyghurCommunity\/([a-z0-9][a-z0-9.-]*)\/releases\/download\/v(\d+\.\d+\.\d+)\/uyghurcommunity-([a-z0-9][a-z0-9.-]*)-(\d+\.\d+\.\d+)\.tgz$/);
  const match = source || asset;
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || !match || url.search || url.hash || match[1] !== repository || (asset && (asset[2] !== asset[4] || project.package !== `@uyghurcommunity/${asset[3]}`))) throw new Error('Install archives must be matching versioned UyghurCommunity GitHub releases.');
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
