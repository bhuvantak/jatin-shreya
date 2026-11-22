# Engineering brief for Claude Code: Jatin weds Shreya (groom's side) site

## Goal

Publish this finished, tested static website to the GitHub repo **https://github.com/bhuvantak/jatin-shreya**. Add three new ChatGPT illustrations to their function cards, verify everything, then commit and push. Vercel will deploy from that repo.

The site is already complete and tested on phones (320–430px), tablets and desktop. **Do not redesign or refactor anything.** Make only the changes listed below.

## Ground rules

- Plain HTML, CSS and JavaScript only. Do **not** add npm, package.json, a framework, a bundler or a build step.
- Do not change any names, dates, days, times or locations except where a step says so. Exact data is listed in section 6 for checking.
- Ask the user before:
  - deleting anything that was already in the repo
  - force-pushing
  - doing anything not listed here
- Show the user a short summary at the end of each numbered step.

---

## Step 1: Put the site into the repo

The user has extracted the provided ZIP. Its folder contains `index.html`, `css/`, `js/`, `assets/`, `tools/`, `README.md` and this `ENGINEERING.md`.

1. Check whether the current folder is already a clone of `bhuvantak/jatin-shreya` (`git remote -v`).
   - If it is, check what's in it. If it's empty or only has a README/LICENSE, copy the site files in. **`index.html` must sit at the repo root**, not in a subfolder.
   - If it isn't a git repo yet, run:
     ```
     git init
     git branch -M main
     git remote add origin https://github.com/bhuvantak/jatin-shreya.git
     git pull origin main --allow-unrelated-histories   # only if the GitHub repo already has a commit
     ```
2. If the repo already contains different website files, **stop and ask the user** before overwriting anything.
3. Confirm the root now has `index.html`, `css/style.css`, `js/config.js`, `js/script.js`, and the `assets/` and `tools/` folders.

## Step 2: Prepare the three new illustrations

The user has three pictures from ChatGPT, normally named:

| Function | Expected source file | Output file |
|---|---|---|
| Lagna Patrika | `fn-lagna-patrika.png` | `fn-lagna-patrika.webp` |
| Ladies Sangeet | `fn-ladies-sangeet.png` | `fn-ladies-sangeet.webp` |
| Chak | `fn-chak.png` | `fn-chak.webp` |

1. **Find the files.** Ask the user where they saved them if they aren't in the project folder or Downloads. Watch for names that Windows hid extensions on, such as `fn-chak.png.png` or `fn-chak.webp.png`, and match by the function name. Open each one (or check its size) to confirm it's a picture and which function it shows.
   **If you're unsure which picture belongs to which function, ask the user. Don't guess.**
2. **Check Pillow:** `python -c "import PIL; print(PIL.__version__)"`. If it's missing: `python -m pip install pillow`. On Windows, `py` may be the command instead of `python`.
3. **Run the prepared script.** Don't write your own image code; this script was tested on both transparent and white-background ChatGPT images:
   ```
   python tools/prepare_images.py "<path>/fn-lagna-patrika.png" fn-lagna-patrika.webp "<path>/fn-ladies-sangeet.png" fn-ladies-sangeet.webp "<path>/fn-chak.png" fn-chak.webp
   ```
   It removes a plain white background if there is one, makes each picture 640 × 640, and writes WebP files into `assets/images/`. It takes about 5–15 seconds per picture.
4. Confirm the three `.webp` files exist in `assets/images/` and are roughly 80–300 KB each.
5. **Do not** copy the original PNGs into the repo. They're 2–3 MB each and would slow the site.

## Step 3: Wire the pictures into `js/config.js`

In the `functions` list, change **only** the `image` value of these three lines:

```js
{ name: "Lagna Patrika",  ..., motif: "patrika", image: "assets/images/fn-lagna-patrika.webp" },
{ name: "Ladies Sangeet", ..., motif: "sangeet", image: "assets/images/fn-ladies-sangeet.webp" },
{ name: "Chak",           ..., motif: "chak",    image: "assets/images/fn-chak.webp" },
```

Keep every other field and line exactly as it is. If any of the three pictures is missing, leave that function's `image` as `""` and tell the user. The card then shows its gold line drawing, which is intended.

## Step 4: Verify

1. **Syntax:** `node -e "new Function(require('fs').readFileSync('js/script.js','utf8'))"`, plus the same for `js/config.js`, if Node is installed. If Node isn't available, skip this and say so.
2. **Asset references:** every path in `js/config.js` and `index.html` that starts with `assets/` must point to a file that exists. List any missing ones.
3. **Data check:** confirm `js/config.js` still matches section 6 exactly.
4. **Optional local preview:** run `python -m http.server 8000` in the repo root, ask the user to open http://localhost:8000, tap the red seal, and scroll to Wedding Functions. Stop the server afterwards.
   Don't open `index.html` by double-clicking it: browsers block some features on `file://` pages.

## Step 5: Commit and push

```
git add .
git status            # show the user the list of files being committed
git commit -m "Groom's side wedding invitation with function illustrations"
git push -u origin main
```

- If the push is rejected because GitHub has commits you don't have, run `git pull origin main --allow-unrelated-histories`, resolve conflicts by **keeping this site's files**, and push again. Ask the user if any conflict touches `index.html`, `css/`, `js/` or `assets/`.
- **Never force-push** without the user's explicit permission.

Then tell the user how to deploy on Vercel, as below. Don't try to do it yourself.

> Vercel → **Add New… → Project** → import **bhuvantak/jatin-shreya** → Project Name: `jatin-weds-shreya` → Framework Preset: **Other** → leave Root Directory `./`, Build Command empty, Output Directory empty → **Deploy**.
> The site will be at `https://jatin-weds-shreya.vercel.app` (if that name is free).

## Step 6: Reference data (must stay exactly like this)

**Couple:** Jatin & Shreya · hashtag `#JatinWedsShreya` · main date text `Friday, 4th December 2026`
**Hosts:** `Smt. Manju & Shri Sanjeev Lakhmera` · invite line `invite you to the wedding of their beloved son` · sign-off `The Lakhmera Family`

| # | Function | Date | Day | Time | Location |
|---|---|---|---|---|---|
| 1 | Ganesh Pujan | 2026-11-30 | Monday | 7:15 AM | Residence |
| 2 | Lagna Patrika | 2026-11-30 | Monday | 9:15 AM | Residence |
| 3 | Mahila Sangeet | 2026-12-01 | Tuesday | 2:00 PM | Residence |
| 4 | Mehendi | 2026-12-02 | Wednesday | 11:00 AM | Residence |
| 5 | Haldi & Baan | 2026-12-03 | Thursday | 9:15 AM | Treehouse Rajbagh, Jodhpur |
| 6 | Chhaak | 2026-12-03 | Thursday | 2:15 PM | Treehouse Rajbagh, Jodhpur |
| 7 | Bhat | 2026-12-03 | Thursday | 4:00 PM | Treehouse Rajbagh, Jodhpur |
| 8 | Sangeet | 2026-12-03 | Thursday | Evening, 7:00 PM | Treehouse Rajbagh, Jodhpur |
| 9 | Baraat Prasthan | 2026-12-04 | Friday | 10:00 AM | Treehouse Rajbagh, Jodhpur |
| 10 | Reception | 2026-12-04 | Friday | 7:00 PM onwards | Treehouse Rajbagh, Jodhpur |

**Wedding venue:** `Tree House Rajbagh Heritage Hotel`, `Near Dali Bai Circle, Jhanwar Road,\nJodhpur, Rajasthan`

## Later (not now): after the Vercel address is final

When the user confirms the final address, update the link-preview tags in `index.html`:
- set `og:image` and `twitter:image` to `https://<final-address>/assets/images/og-image.jpg`
- add `<meta property="og:url" content="https://<final-address>/">` above `og:image`

Then commit and push.

## How the site works (for reference only; no changes needed)

- `js/config.js` drives all content. `js/script.js` reads `window.WEDDING_CONFIG`.
- **Opening:** a sealed "Lagna Patrika" letter. Tapping the seal opens it in 3D and starts music, if the guest left "Play music" ticked. Browsers only allow sound after a tap.
- **Functions:** a carousel. On tall enough screens the section pins and page scrolling slides the cards; otherwise it's a normal swipe carousel. The script measures whether it fits.
- **Countdown:** one diya per celebration day. Each lights automatically once its day begins in India time.
- **Missing pictures** fall back to line drawings. The music button hides itself if the audio file is missing.
- All motion is disabled for visitors with "reduce motion" turned on.
