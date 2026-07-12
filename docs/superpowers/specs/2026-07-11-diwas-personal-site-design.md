# Diwas Pandit — Personal Site Design ("Dual Exposure")

Date: 2026-07-11
Status: Approved for build (user pre-approved: "Let's build this", autonomous session)

## Subject & job

Diwas Pandit: software engineer / web developer (Texas State, San Marcos TX; from Nepal)
and photographer (Nepal + USA). Runs the Tech DD Twins YouTube channel with his twin.
The page's single job: make a visitor understand in 10 seconds that code and camera are
the same person — and give recruiters and collaborators one place to reach him.

Hosted on GitHub Pages. Static: vanilla HTML/CSS/JS, no build step.

## Content sources (verified)

- diwaspandit.com.np — skills (HTML/CSS/JS 90%, React 80%, Python 60%, MongoDB 60%,
  Express 40%, Microsoft 365 90%), certifications (Meta Front-End, Tech Support
  Specialist), Tech DD Twins channel, San Marcos TX, freelance available.
- diwaspandit-photography.lovable.app — 17 photos across 6 chapters with titles,
  locations, captions; voice ("Software engineer by day. Photographer the rest of the
  time."); off-set community work (2018 tornado relief campaign, St. Xavier's rural
  immersion camp, Incubate Nepal 2023); contact panditdiwas12us@gmail.com,
  linkedin.com/in/diwaspandit12, Instagram @diwas512; stack "react · node · postgres ·
  a 50mm prime".
- dipeshpandit12.github.io — structural reference only (twin brother's site). No facts
  borrowed from it; Diwas's site uses only Diwas's own published facts.
- LinkedIn: authwalled; not used.

Photos are self-hosted in `assets/photos/` (downloaded from his own Lovable site,
resized ≤1600px, recompressed).

## Concept: Dual Exposure

Two exposures of one frame. Every design decision expresses the code/camera duality
without splitting the site in two.

**Signature element (the one bold thing):** the hero is a split-screen dual exposure —
left: a dark editor pane where his intro types itself out as syntax-highlighted
JavaScript; right: the Kalinchowk Himalaya photograph with EXIF chrome. A draggable
divider (with keyboard support) lets the visitor blend between the two worlds. On
mobile it degrades to a stacked hero with a tap toggle.

Everything else stays quiet and disciplined.

## Tokens

Palette (darkroom, not generic near-black + acid green — two semantic accents):
- `--ink`        #131110  warm black (darkroom, not pure black)
- `--surface`    #1D1917  raised panels
- `--paper`      #EFE7DB  warm paper text
- `--muted`      #8D8378  secondary text
- `--safelight`  #F25C2A  photography accent (darkroom safelight)
- `--glacier`    #9FC0CF  code accent (Himalayan dawn)

Rule: orange marks photography content, blue marks code content. The two only meet in
the hero and the footer sign-off.

Type:
- Display: **Fraunces** (optical serif, a touch wonky) — photography/editorial voice.
- Body: **IBM Plex Sans** — neutral engineering body.
- Utility/code: **IBM Plex Mono** — EXIF labels, code, terminal, eyebrows.

Motion:
- Page load: aperture iris (SVG blades) opens once to reveal the page. Also the logo.
- Scroll: IntersectionObserver reveals (translate+fade, 500ms, once).
- Hero: typing animation in editor pane; draggable exposure divider.
- Marquee ticker between sections (continuity with his photo site's ticker).
- Small scroll-linked f-stop readout in nav (f/1.8 at top → f/16 at bottom).
- `prefers-reduced-motion`: all of the above collapse to static.

## Structure

1. **Nav** — aperture mark + name, links, f-stop scroll readout.
2. **Hero (signature)** — dual-exposure split with drag divider. Headline pair:
   "I write code." / "I chase light."
3. **Ticker** — mono marquee: `while(light){ shoot() }` · `git commit -m 'sunset'` etc.
   (lines reused from his own photo site — brand continuity.)
4. **README (About)** — Times Square self-portrait + README.md-styled bio; `> whoami`
   terminal block; community work as three short "off-set" lines.
5. **git log (Experience/credentials)** — timeline as commit history: Tech DD Twins
   (2019–), Meta Front-End cert, Tech Support Specialist cert, Incubate Nepal 2023,
   Texas State (current), freelance available. Chronology is real, so the git-log
   structural device encodes truth.
6. **stack.json (Skills)** — skills as a syntax-highlighted JSON object, honest values
   from his resume site. No fake percentage bars.
7. **Contact sheet (Photography)** — 12 selected photos as a film contact sheet grid;
   hover reveals title + location as EXIF plate; lightbox on click; chapter filter
   chips (Nature / City / People / Life / Art). Link out to the full photography site.
8. **Contact** — "Open a channel": email, LinkedIn, GitHub, Instagram @diwas512,
   YouTube (Tech DD Twins), plus diwaspandit.com.np. Terminal-prompt styling.
9. **Footer** — "shot & shipped by Diwas Pandit · Nepal ⇄ Texas".

Excluded deliberately: phone number (published on his old site, but a public GitHub
repo is broader distribution — he can add it); projects section (no verified Diwas
projects; won't fabricate); skill percentage bars (unverifiable precision).

## Quality floor

Responsive to 360px, visible keyboard focus, reduced-motion respected, semantic
landmarks, alt text from his own photo titles, lazy-loaded images, no external JS
dependencies, fonts via Google Fonts with `display=swap`.

## Files

```
index.html
css/style.css
js/main.js
assets/photos/*.jpg   (17, self-hosted)
assets/favicon.svg    (aperture mark)
docs/superpowers/specs/  (this doc)
```
