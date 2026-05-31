# Quality Plants & Flowers — Website

## What this is
Static HTML website for Quality Plants & Flowers, a family-run florist in Denby Dale, West Yorkshire.
Single-page site (`index.html`) with anchor-based navigation to sections: weddings, occasions, funerals, corporate, gifts, gallery, about, contact.

**Live URL:** https://www.qualityplantsandflowers.com
**Canonical:** www prefix (all internal links and meta tags use `www.`)

## Tech stack
- Pure HTML/CSS/JS — no framework, no build step
- Fonts: Cormorant Garamond + Jost via Google Fonts
- Analytics: Google Analytics 4 (`G-SS256YG8JS`)
- Images: `.webp` format (with `.jpg` originals kept alongside some)

## File structure
```
index.html              — main (and only) page
css/styles.css          — all styles
js/script.js            — all JavaScript
images/                 — all site images (.webp)
sitemap.xml             — submitted to Google Search Console
robots.txt              — allows all, points to sitemap
cookie-policy.html      — standalone cookie policy page
privacy-policy.html     — standalone privacy policy page
```

## SEO setup
- `robots` meta: `index, follow, max-image-preview:large`
- Schema.org: `Florist` structured data with full address, geo, opening hours, phone
- Open Graph + Twitter Card meta tags in place
- Sitemap covers root + all anchor sections (`#weddings`, `#occasions`, etc.)

## Important: www vs non-www
The canonical tag and sitemap both use `www.qualityplantsandflowers.com`.
Google Search Console should be verified for the **www** property (or a Domain property covering both).
If only the non-www property is set up in Search Console, the sitemap URLs will show as outside the verified property.

## Deployment
Files are deployed directly to the web host (no CI/CD pipeline). Changes are made locally and uploaded manually.
