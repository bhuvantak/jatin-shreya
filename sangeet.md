# Engineering brief for Claude Code: add the "Sangeet" card

**Repo:** `bhuvantak/jatin-shreya`
**Goal:** add a 10th ceremony, **Sangeet**, on Thursday 3 December 2026 at 7:00 PM at Treehouse Rajbagh, right after Bhat. Then add its picture if it's ready, and commit and push.

## Rules
- Make only the edits below. If a FIND text isn't found exactly once, stop and show the user.
- Don't delete or rename any files. Never force-push.

## Step 1: `js/config.js`: add the card

FIND (the Bhat line, exactly once):
```js
    { name: "Bhat",             date: "2026-12-03", day: "Thursday",  time: "4:00 PM",         location: "Treehouse Rajbagh, Jodhpur", motif: "potli",   image: "assets/images/fn-mayra.webp" },
```
Keep that line, and add this line **directly below it**:
```js
    { name: "Sangeet",          date: "2026-12-03", day: "Thursday",  time: "Evening, 7:00 PM", location: "Treehouse Rajbagh, Jodhpur", motif: "sangeet", image: "assets/images/fn-sangeet-stage.webp" },
```

Nothing else changes. The site renumbers itself ("Ceremony 8 of 10", "Ten ceremonies across five days"). Until `fn-sangeet-stage.webp` exists, the card shows a gold dholak line drawing.

## Step 2: Add the picture (only if it's ready)

Look for the ChatGPT picture in `C:\Users\bktak\Downloads`. It's normally `fn-sangeet-stage.png`, but check for hidden-extension names like `fn-sangeet-stage.png.png`. Open it and confirm it shows young people dancing on a stage with coloured lights.

- **If it's there**, run:
  ```
  python tools/prepare_images.py "C:\Users\bktak\Downloads\fn-sangeet-stage.png" fn-sangeet-stage.webp
  ```
  Confirm `assets/images/fn-sangeet-stage.webp` now exists, at roughly 80–300 KB. Don't copy the original PNG into the repo.
- **If it isn't there yet**, skip this step and tell the user. The card works with the line drawing until then.

Don't use the bride's-site file `fn-sangeet.webp` for this card. The user wants a different picture.

## Step 3: Update `ENGINEERING.md`

In the function table under "Step 6: Reference data", insert this row after Bhat, and renumber the rows after it so the table runs from 1 to 10:
```
| 8 | Sangeet | 2026-12-03 | Thursday | Evening, 7:00 PM | Treehouse Rajbagh, Jodhpur |
```

## Step 4: Check, commit, push

1. If Node is available, run the syntax check: `node -e "new Function(require('fs').readFileSync('js/config.js','utf8'))"`
2. Confirm `js/config.js` has 10 functions, with Sangeet 8th (Thursday, 3 December, after Bhat).
3. Run:
   ```
   git add .
   git commit -m "Add Sangeet on 3 December"
   git push
   ```

## Adding the picture later

When the picture is ready, the user will ask you to run Step 2 and then commit and push. No other change is needed.
