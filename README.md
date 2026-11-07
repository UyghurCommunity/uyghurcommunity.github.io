# UyghurCommunity · ئۇيغۇرچە ئىجاد ئۈچۈن ئوچۇق قوراللار

The bilingual developer home for [UyghurCommunity](https://github.com/UyghurCommunity).

**Website:** <https://uyghurcommunity.github.io/>

A buildless, dependency-free catalog connecting ten public projects: Doppa, Doppa Kit, Uyghur Keyboard, Lughet API, Uyghur RTL Lab, Uyghur AI Eval, Uyghur UI, Doppa Studio, Uyghur Text, and Uyghur Starters. Seven projects offer eight versioned package artifacts, including the optional Uyghur UI React adapter; the studio is a local visual editor rather than an installable library.

## ئۇيغۇرچە

بۇ بەت ئۇيغۇرچە ئوچۇق مەنبەلىك تۈرلەرنىڭ ئورتاق باش بېتى. تۈرلەرنى ئىزدەش، تۈر بويىچە سۈزۈش، ئۇيغۇرچە/ئىنگلىزچە ئالماشتۇرۇش، يورۇق/قاراڭغۇ كۆرۈنۈش ۋە قاچىلاش بۇيرۇقىنى كۆچۈرۈشنى قوللايدۇ.

لۇغەت كۆزنىكى ھەقىقىي HTTP API غا ئۇلىنىدۇ. ئۇلىنىش بولمىسا ئوچۇق خاتالىق ئۇچۇرى چىقىدۇ؛ ياسالما جاۋاب كۆرسەتمەيدۇ. لۇغەت ۋە AI باھالاش سانلىق مەلۇماتلىرىنىڭ لايىھە ھالىتى بەتتە ئېنىق بەلگىلەنگەن.

[ئۇيغۇرچە UI تەجرىبىخانىسى](https://uyghurcommunity.github.io/uyghur-ui/lab.html)دا يېزىش رامكىسى، 4 مەدەنىيەت رەڭ قۇرغۇچى، 6 قاچىلىغىلى بولىدىغان بۆلەك ۋە 2 قوللىنىش قۇرۇلمىسى بار. [ئۇيغۇرچە](https://uyghurcommunity.github.io/uyghur-ui/guide/introduction.html) ۋە [English](https://uyghurcommunity.github.io/uyghur-ui/guide/en/introduction.html) جەمئىي 22 قوللانمىنى كۆرۈڭ.

[ئۇيغۇرچە UI نىڭ 6 ئەسلى جانلىق مىسالى](https://uyghurcommunity.github.io/uyghur-ui/interactions.html)نى كۇنۇپكا تاختىسى ۋە چەكمە ئېكران بىلەن سىناڭ. ھەر بىر مىسالنى CSS ۋە JavaScript قوشۇلغان مۇستەقىل HTML ھۆججىتى سۈپىتىدە چۈشۈرەلەيسىز. [قاچىلاش ۋە ئىشلىتىش قوللانمىسى](https://uyghurcommunity.github.io/uyghur-ui/guide/introduction.html)مۇ بار.

## Run locally

No package installation or build is required. From this directory:

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173/>. Serve over HTTP, since the page loads ES modules and `projects.json`.

## Content and configuration

[`projects.json`](projects.json) is the catalog and deployment configuration.

- `projects`: bilingual descriptions, categories, package names, source/demo/docs/release URLs, and pinned GitHub archive URLs. Optional `docsEnglish` switches the Docs link to English documentation when the interface is English.
- `additionalPackages`: extra installation artifacts belonging to existing project repositories, currently `@uyghurcommunity/ui-react` in `uyghur-ui`. Each needs a unique ID, repository slug, bilingual title, scoped package name, and matching pinned archive. `installablePackages(catalog)` combines these with project packages without adding project cards.
- `categories`: Uyghur and English filter labels.
- `dictionaryApiBase`: the live Lughet API origin. The widget appends `/v1/search?q=...&limit=5`.
- `registryStatus`: currently `pending`. The site clearly says npm registry publication is pending and offers **versioned GitHub source archives and release packages** in installation commands. Do not change this to `published` until registry availability is verified.

The default API origin is `https://uyghurcommunity-lughet-api.vercel.app`. Change it only after verifying a replacement deployment, including CORS access from this website. A failed or unavailable API produces an honest error with a link to the offline dictionary demo. The widget never substitutes fixture data for live results.

Package installation links use per-artifact versions: Uyghur UI and its React adapter use v0.4.0, the starter/installer CLI uses v0.2.0, the keyboard uses v0.1.1, and other packages use v0.1.0. The original four packages use GitHub source archives. UI, React, Uyghur Text, and the CLI use pinned .tgz release assets. Keep those tags and assets available, or update the matching archive URL when changing versions. No command depends on npm registry publication.

[Uyghur UI Lab](https://uyghurcommunity.github.io/uyghur-ui/lab.html) combines a Uyghur writing field, keyboard and explicit reversible Unicode cleanup, a builder with **4 cultural themes**, **6 installable components**, and **2 composed application blocks** for a dashboard and article editor. The UI 0.4.0 core offers **110 SVG icons (63 cultural)**, the East Turkistan flag and sourced map assets. **22 guides** are available: [ئۇيغۇرچە](https://uyghurcommunity.github.io/uyghur-ui/guide/introduction.html) and [English](https://uyghurcommunity.github.io/uyghur-ui/guide/en/introduction.html). The optional `@uyghurcommunity/ui-react` 0.4.0 adapter is an eighth installation choice from the same UI repository, with its own release archive.

Its [Interactions gallery](https://uyghurcommunity.github.io/uyghur-ui/interactions.html) presents **6 original website demos**: embroidery spotlight, Doppa depth card, Atlas selection, envelope send, map comparison, and ornament ripple. Native buttons and ranges support keyboard and touch, respect reduced motion, and provide static feedback. Each demo offers a complete standalone HTML download with its CSS and JavaScript. Search for interactions, interactivity, motion, ئۆزئارا تەسىر, or جانلاندۇرۇش to find Uyghur UI; its hub Demo link opens the Lab, with the Interactions gallery available from the UI navigation. Core and React package archives are pinned to v0.4.0.

## Features

- Original animated digital loom with flowing threadwork, a moving shuttle, and project glyphs. A bilingual motion button pauses the decoration; reduced-motion settings, page visibility, and viewport visibility are respected. Project cards have scroll entrances and pointer highlights. All content remains available when motion or JavaScript is disabled; no animation library or external component code is bundled.

- Uyghur-first layout with a complete English interface toggle.
- Responsive design, original embroidery-inspired vector artwork, and dark/light appearance.
- Project search across both languages, tags, and package names, combined with category filters for culture, input, language, frontend, evaluation, creative tools, and starters. Project and package facts are derived from the catalog after loading.
- Source, demonstration, documentation, and release links for every project.
- Eight pinned GitHub archive or release-package installation commands and clipboard copy with a fallback.
- A real dictionary API playground with timeout, loading, empty, error, provenance, and draft-data states.
- Contribution links to real project issue trackers and the [Lughet entry proposal tool](https://uyghurcommunity.github.io/lughet-api/docs/contribute.html).
- Keyboard focus indicators, semantic controls, skip link, reduced-motion support, and polite status messages.

Uyghur text uses **ALKATIP Basma**, loaded through external WOFF2/WOFF/TTF font URLs from `db.onlinewebfonts.com`, with Tahoma/Arial fallbacks. English text keeps system typography and code remains monospace. The `.alkatip-basma` helper applies RTL direction, embedded bidi handling, and a 2.2 line height. No font binaries are redistributed. Language and appearance preferences are the only data written to local storage. Project search is local. Dictionary queries are sent to the configured public API only when the visitor presses Search. There are no analytics or third-party scripts.

## Verify

Node.js 18 or newer is required only for development checks:

```bash
npm test
npm run check
```

The checks validate all ten project routes, eight package commands (including the same-repository React release asset), catalog structure, package archive safety, search/filter behavior, API query encoding, local assets, fragment links, DOM references, and CSS block balance. They do not replace a visual browser review.

## Publish

Use GitHub Pages from the `main` branch and repository root. This organization repository must be named `uyghurcommunity.github.io` to serve the root organization Pages address. `.nojekyll` is included; there is no build command.

## Contribute

Open an [issue](https://github.com/UyghurCommunity/uyghurcommunity.github.io/issues) for corrections, new ideas, or accessibility problems. A new project listing needs bilingual text, a working source URL, a working demonstration, and accurate status labels. Preserve draft-data and pending-registry notices until those statuses actually change.

## License

[MIT](LICENSE). The artwork in `assets/mark.svg` and the inline hero illustration are original project assets.
