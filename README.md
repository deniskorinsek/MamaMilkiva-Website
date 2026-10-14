# MamaMilkiva website

Promotional website for the MamaMilkiva Android app, built for GitHub Pages.
Plain HTML, CSS and JavaScript: no build step and no dependencies.

| Page | Slovenian | English |
|---|---|---|
| Landing page | `index.html` | `en/index.html` |
| Privacy policy | `zasebnost/index.html` | `en/privacy/index.html` |
| Not found | `404.html` (both languages) | |

The look follows `../designs/` (direction "Objem"): Young Serif + Figtree, rose / sage / peach / plum palette, the app's own illustrations and screens.

## Preview locally

Open `index.html` in a browser, or serve the folder (closer to GitHub Pages):

```sh
cd MamaMilkiva-Website
python3 -m http.server 8000
# http://localhost:8000
```

## Publish on GitHub Pages

This folder is its own repository, `deniskorinsek/MamaMilkiva-Website`, served by GitHub Pages from the root of `main`.

First time (on the Mac):

```sh
cd ~/Documents/Workspace/MamaMilkiva/MamaMilkiva-Website
git init -b main
git add -A
git commit -m "MamaMilkiva website"
~/bin/gh repo create deniskorinsek/MamaMilkiva-Website --public --source=. --push --description "Website for the MamaMilkiva Android app" --homepage https://deniskorinsek.github.io/MamaMilkiva-Website/
~/bin/gh api -X POST repos/deniskorinsek/MamaMilkiva-Website/pages -f "source[branch]=main" -f "source[path]=/"
```

Later changes: commit and push to `main`; Pages redeploys in a minute or two. `.nojekyll` makes Pages serve the files as they are.

## Site settings

| Setting | Value | Where it appears |
|---|---|---|
| Website repository | `deniskorinsek/MamaMilkiva-Website` | this folder |
| App repository | `deniskorinsek/MamaMilkiva` (private) | not linked from the site; downloads go through Google Play, questions to the contact email |
| Site URL | `https://deniskorinsek.github.io/MamaMilkiva-Website/` | canonical, hreflang, Open Graph, `sitemap.xml`, `robots.txt` |
| Publisher and contact | Denis Korinsek, korinsekdenis+mamamilkiva@gmail.com | privacy pages |
| Privacy policy effective date | 14 October 2026 | privacy pages (update it whenever the policy changes) |
| Base path of the 404 page | `<base href="/MamaMilkiva-Website/">` | `404.html` |

Moving to a custom domain or renaming the repository: replace `deniskorinsek.github.io/MamaMilkiva-Website` in all files, and set the 404 base to `/` (custom domain) or `/<new name>/`.

## Google Play

- Every store link points to `https://play.google.com/store/apps/details?id=si.mamamilkiva.app` (the `applicationId` from `app/build.gradle.kts`), with `&hl=sl` or `&hl=en`. The links work as soon as the store listing is live.
- The QR code in the download section (shown on wide screens) encodes the same URL without `hl`. Regenerate it if the package name changes, e.g. with `segno` and `error="q"`, and keep the small logo in the middle.
- The store button is text only. To use Google's official badge instead (a Slovenian version exists), download it from <https://play.google.com/intl/en_us/badges/>, follow its guidelines, and put the image inside the `.store-btn` links.
- In the Play Console, use the privacy page as the privacy policy URL: `https://deniskorinsek.github.io/MamaMilkiva-Website/zasebnost/` (English: `/en/privacy/`).

## Also needed

- **Review the privacy policy.** It is a draft based on the app's manifest, `MamaMilkiva-Android/docs/PRIVACY_POLICY.md` and GitHub Pages hosting. Update it whenever permissions, storage or distribution change. It is not legal advice.
- **Screenshots** in `assets/img/screens/` come from `../designs/screens/png/` (WebP, 420 and 786 px wide). Replace them when the app UI changes; keep the file names.

## Motion

All motion is progressive enhancement in `assets/js/main.js`:

| Attribute / class | Effect |
|---|---|
| `data-reveal` (`fade`, `scale`, `rise`) | fades and lifts an element in when it scrolls into view; `--delay` staggers it |
| `data-speed` | scroll parallax relative to the closest `[data-parallax]` section (positive = slower, further back) |
| `data-depth` | pointer parallax inside `[data-pointer]` (desktop only) |
| `.hero__sun` | the sun rises along the dotted arc, like the app's home screen |
| `.stage` + `.step` | sticky phone in "How it works" (desktop) that follows the active step |
| `[data-quotes]` | rotating phrases from the app (with a pause button) |
| `img[data-still]` | animated SVG illustration; switches to the still version when motion is off |

Motion stops completely when the system asks for reduced motion, or when a visitor presses **Ustavi animacije / Pause animations** in the footer (saved in that browser only). Without JavaScript every element is visible and static.

## Structure

```
MamaMilkiva-Website/
├── index.html, 404.html, site.webmanifest, sitemap.xml, robots.txt, .nojekyll
├── zasebnost/index.html
├── en/index.html, en/privacy/index.html
└── assets/
    ├── css/styles.css         tokens, components, pages
    ├── js/main.js             motion and small enhancements
    ├── fonts/                 Figtree + Young Serif (WOFF2 subsets, SIL OFL 1.1)
    └── img/
        ├── screens/           app screens (WebP)
        ├── illustrations/     animated/ and static/ SVGs from ../designs
        ├── icons/             app icon, favicons, manifest icons
        └── og-sl.png, og-en.png   link previews (1200×630)
```

Both languages mirror each other; when you change one page, change its counterpart too.
