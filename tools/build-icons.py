#!/usr/bin/env python3
"""
Génère le sous-ensemble Font Awesome utilisé par le site.

Le site n'utilise qu'une cinquantaine d'icônes sur ~2 000 : au lieu de charger
la feuille complète depuis un CDN (~100 Ko + polices ~250 Ko), on produit :
  - assets/css/icons.css            (règles des seules icônes utilisées)
  - assets/fonts/fa-solid-900.woff2 (police réduite aux glyphes utilisés)
  - assets/fonts/fa-brands-400.woff2

À relancer après l'ajout d'une nouvelle icône (classe « fa-... ») dans les pages
ou dans assets/js/site.js. Prérequis (une seule fois, hors du dépôt) :
  npm pack @fortawesome/fontawesome-free@6.4.0
  tar xzf fortawesome-fontawesome-free-6.4.0.tgz        -> dossier « package »
  pip install fonttools brotli
Puis, depuis la racine du dépôt :
  python tools/build-icons.py <chemin vers le dossier package>
"""
import os, re, subprocess, sys

SOURCES = ['index.html', 'ar/index.html', '404.html', 'assets/js/site.js']
STYLES = {'fa', 'fas', 'fab'}

pkg = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/fa640/package')
css = open(os.path.join(pkg, 'css', 'all.css'), encoding='utf-8').read()

# 1. Classes utilisées par le site
text = ''.join(open(p, encoding='utf-8').read() for p in SOURCES)
# (le lookahead écarte les noms de fichiers comme « fa-solid-900.woff2 »)
used = set(re.findall(r'\bfa-[a-z0-9-]+(?![\w.-])', text))

# 2. Règles d'icônes de Font Awesome (les marques sont après leur @font-face)
brands_start = css.index("font-family: 'Font Awesome 6 Brands';\n  font-style")
rule_re = re.compile(r'((?:\.fa-[a-z0-9-]+:{1,2}before,?\s*)+)\{\s*content:\s*"\\([0-9a-f]+)";\s*\}')
rules, cps, found = [], {'solid': set(), 'brands': set()}, set()
for m in rule_re.finditer(css):
    names = re.findall(r'\.(fa-[a-z0-9-]+)', m.group(1))
    keep = [n for n in names if n in used]
    if not keep:
        continue
    found.update(keep)
    cps['brands' if m.start() > brands_start else 'solid'].add(int(m.group(2), 16))
    rules.append(','.join('.%s::before' % n for n in keep) + '{content:"\\%s"}' % m.group(2))

unknown = sorted(used - found)
if unknown:
    sys.exit('Classes fa-* inconnues de Font Awesome 6.4.0 : %s' % ', '.join(unknown))

# 3. Feuille de style
fonts = [('solid', 'fa-solid-900', 'Font Awesome 6 Free', 900),
         ('brands', 'fa-brands-400', 'Font Awesome 6 Brands', 400)]
out = [
    '/*!',
    ' * Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com',
    ' * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)',
    ' * Copyright 2023 Fonticons, Inc.',
    ' * Sous-ensemble limité aux icônes du site : fichier généré par tools/build-icons.py, ne pas modifier à la main.',
    ' */',
    '.fa{font-family:var(--fa-style-family,"Font Awesome 6 Free");font-weight:var(--fa-style,900)}',
    '.fa,.fas,.fab{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:var(--fa-display,inline-block);font-style:normal;font-variant:normal;line-height:1;text-rendering:auto}',
    ".fas{font-family:'Font Awesome 6 Free';font-weight:900}",
    ".fab{font-family:'Font Awesome 6 Brands';font-weight:400}",
]
for key, fname, family, weight in fonts:
    if cps[key]:
        out.append("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:block;"
                   'src:url("../fonts/%s.woff2") format("woff2")}' % (family, weight, fname))
out += rules
os.makedirs('assets/fonts', exist_ok=True)
with open('assets/css/icons.css', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write('\n'.join(out) + '\n')

# 4. Polices réduites aux glyphes utilisés
for key, fname, family, weight in fonts:
    target = os.path.join('assets', 'fonts', fname + '.woff2')
    if not cps[key]:
        if os.path.exists(target):
            os.remove(target)
        continue
    subprocess.run([sys.executable, '-m', 'fontTools.subset',
                    os.path.join(pkg, 'webfonts', fname + '.ttf'),
                    '--unicodes=' + ','.join('U+%04X' % c for c in sorted(cps[key])),
                    '--layout-features=', '--no-hinting', '--name-IDs=*',
                    '--flavor=woff2', '--output-file=' + target], check=True)

print('%d icônes (%d solid, %d brands) -> assets/css/icons.css, assets/fonts/'
      % (len(found), len(cps['solid']), len(cps['brands'])))
