# Jatin weds Shreya: Groom's Side Wedding Invitation

A static wedding invitation website built with plain HTML, CSS and JavaScript. You don't need a build step, npm or a framework. Deploy it on Vercel as an "Other" project, which needs no build command.

## Files

```
index.html              Page structure and the line-drawn ornaments (SVG)
css/style.css           All styling (mobile-first)
js/config.js            ← THE FILE YOU EDIT: names, hosts, functions, venue, pictures, music
js/script.js            Behaviour: letter opening, sky lanterns, flip card, diyas, carousel
assets/images/          Illustrations (WebP), favicons, og-image.jpg (link preview)
assets/audio/           wedding-music.mp3 (original calm piece made for this site)
assets/fonts/           Cormorant Garamond, Jost, Tiro Devanagari Sanskrit (Open Font License)
tools/prepare_images.py Turns a ChatGPT picture into a ready-to-use WebP
```

## Editing details

Everything guests read is in `js/config.js`:

| Change | Where |
|---|---|
| Couple names, initials, hashtag | `couple` |
| Hosts' names, invitation line, family sign-off | `hosts` |
| Main date text, countdown target | `weddingDateText`, `countdownTarget` |
| A ceremony's name, date, day, time, location, picture | the matching line in `functions` |
| Wedding venue name, address, map link | `venue` |
| Closing lines | `closing` |
| Music file | `media.music` |

Functions that share a date are grouped as one day automatically. The countdown diyas, day buttons and "Ceremony X of Y" numbers all update by themselves.

## Adding a function picture

1. Save the picture from ChatGPT, for example `fn-chak.png`.
2. Run:
   `python tools/prepare_images.py path/to/fn-chak.png fn-chak.webp`
   This removes a white background if there is one, makes the picture 640 × 640, and saves it in `assets/images/`.
3. In `js/config.js`, set that function's `image` to `"assets/images/fn-chak.webp"`.

If a picture is missing, the card shows its gold line drawing instead, so nothing breaks.

## Publishing changes

```
git add .
git commit -m "Describe the change"
git push
```

Vercel redeploys automatically within about a minute.

## After the final web address is chosen

WhatsApp needs a full address for the preview picture. In `index.html`, change `og:image` and `twitter:image` to the full address, for example `https://jatin-weds-shreya.vercel.app/assets/images/og-image.jpg`, and add `<meta property="og:url" content="https://jatin-weds-shreya.vercel.app/">`.
