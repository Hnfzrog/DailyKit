# DailyKit

A collection of 10 free, browser-based digital tools built to generate ad revenue. No frameworks, no build step, no server — everything runs in plain HTML, CSS, and JavaScript with data stored in `localStorage`.

Live demo: _deploy to Vercel or Netlify and paste URL here_

---

## Table of Contents

- [Project Structure](#project-structure)
- [Products](#products)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Monetization (Google AdSense)](#monetization-google-adsense)
- [Analytics](#analytics)
- [Progress Tracker](#progress-tracker)

---

## Project Structure

```
nyoba-yt/
├── index.html          # Hub portal — lists all 10 tools + progress tracker
├── style.css           # Shared stylesheet for the hub portal
└── products/
    ├── wedding-invitation.html
    ├── rental-contract.html
    ├── budget-tracker.html
    ├── birthday-card.html
    ├── event-rsvp.html
    ├── invoice-generator.html
    ├── qr-generator.html
    ├── habit-tracker.html
    ├── business-name.html
    └── game.html
```

Each product page is fully self-contained (its own `<style>` and `<script>`). No shared JS files.

---

## Products

| # | Tool | Category | File | localStorage Key |
|---|------|----------|------|-----------------|
| 1 | 💍 E-Wedding Invitation | Event | `products/wedding-invitation.html` | — |
| 2 | 🏠 Rental Contract Generator | Legal | `products/rental-contract.html` | — |
| 3 | 💰 Daily Budget Tracker | Finance | `products/budget-tracker.html` | `dk_budget_entries` |
| 4 | 🎂 Birthday Card Maker | Event | `products/birthday-card.html` | — |
| 5 | 📋 Event RSVP Manager | Event | `products/event-rsvp.html` | `dk_event`, `dk_guests` |
| 6 | 🧾 Invoice Generator | Business | `products/invoice-generator.html` | — |
| 7 | 📱 QR Code Generator | Utility | `products/qr-generator.html` | `dk_qr_history` |
| 8 | ✅ Habit Tracker | Productivity | `products/habit-tracker.html` | `dk_habits` |
| 9 | 💡 Business Name Generator | Business | `products/business-name.html` | `dk_saved_names` |
| 10 | 🎮 CoinRush (Game) | Game | `products/game.html` | `cr_best` |

### Highlights

**CoinRush** is the highest ad-revenue potential product. It shows a Google AdSense ad unit on every game-over screen (`#betweenAd`), maximizing impressions per session. It uses the Canvas API with touch + mouse support.

**QR Code Generator** uses the [qrcodejs](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js) library (loaded from CDN) and supports PNG download.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, Grid, Flexbox) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (headings) + [Inter](https://fonts.google.com/specimen/Inter) (body) via Google Fonts |
| Data | `localStorage` (no backend) |
| QR Library | qrcodejs via CDN |
| Animations | Canvas API (game + birthday card confetti), IntersectionObserver (scroll reveal) |

---

## Local Development

No install required. Open any HTML file directly in a browser:

```bash
# Option 1 — open hub directly
open index.html

# Option 2 — use a local dev server (avoids some localStorage CORS quirks)
npx serve .
# or
python3 -m http.server 8080
# then visit http://localhost:8080
```

---

## Deployment

### Vercel (recommended)

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Framework preset: **Other**. No build command needed.
4. Click **Deploy**. Vercel auto-detects static files.

### Netlify

1. Drag and drop the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
2. Or connect your GitHub repo for auto-deploy on push.

### Custom Domain

After deployment, add your domain in the hosting dashboard and update your DNS records. Recommended: point `www` to the Vercel/Netlify-provided URL.

---

## Monetization (Google AdSense)

AdSense ad slots are already wired up on every page. To activate them:

1. Apply at [adsense.google.com](https://adsense.google.com). You need a deployed site with real traffic.
2. Once approved, get your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXXXX`).
3. Replace every `ca-pub-XXXXXXXXXX` placeholder in all HTML files with your real Publisher ID.
4. Replace the placeholder `data-ad-slot` values with your actual ad unit IDs from the AdSense dashboard.
5. Add the AdSense `<script>` tag inside each `<head>`:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```

**Ad placement strategy:**
- Hub (`index.html`): top banner + bottom banner
- Product pages: top banner + mid-page banner
- CoinRush (`game.html`): interstitial shown on every game-over (`#betweenAd`) — highest impression rate

---

## Analytics

To track traffic and user behavior:

1. Create a property at [analytics.google.com](https://analytics.google.com).
2. Get your **Measurement ID** (format: `G-XXXXXXXXXX`).
3. Add this snippet before `</head>` on every page:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Progress Tracker

The hub portal has a built-in **Progress Tracker** (slide-in panel, bottom-right button). Tasks are saved to `localStorage` under the key `dk_todos_v3`. Default tasks cover:

- Applying for Google AdSense
- Deploying to a hosting platform
- Registering a custom domain
- Setting up Google Analytics
- Testing all products on mobile
- Community sharing and social media setup
- Revenue milestones ($1, $10 from AdSense)

Custom tasks can be added directly in the panel. Tasks are tagged as **Launch** or **Biz** and can be filtered by tab.

---

## License

This project is free to use, but **please ask for my confirmation first** before using this code in your own project.

Reach out via GitHub or email to get permission — I'm generally happy to say yes!

Alternatively, if this project helped you, you can skip the formalities by **buying me a coffee** ☕

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Arhama%20Rahadan%20Esa-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/)

> © 2026 Wiznysht_. All rights reserved.
