import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { validateCatalog } from '../src/catalog.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(await readFile(resolve(root, 'projects.json'), 'utf8'));
const result = validateCatalog(catalog);
if (!result.valid) throw new Error(result.errors.join('\n'));
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML IDs.');
for (const [, ref] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  if (ref.startsWith('#')) { if (!ids.includes(ref.slice(1))) throw new Error(`Broken fragment ${ref}.`); }
  else if (!/^(?:https?:|data:)/.test(ref)) await access(resolve(root, ref));
}
const app = await readFile(resolve(root, 'src/app.js'), 'utf8');
for (const [, id] of app.matchAll(/\$\('([^']+)'\)/g)) if (!ids.includes(id)) throw new Error(`Missing DOM element ${id}.`);
const css = await readFile(resolve(root, 'assets/style.css'), 'utf8');
if ((css.match(/\{/g) || []).length !== (css.match(/\}/g) || []).length) throw new Error('Unbalanced CSS blocks.');
console.log(`Catalog valid: ${catalog.projects.length} projects; HTML assets, fragments, controls and CSS checked.`);
