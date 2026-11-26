# 🎈 Pop & Play

A colorful React alphabet game made for little hands. One smiling letter balloon at a time, gentle sounds, and endless play.

## [▶ Click here to play the alphabet game](https://atifaziz1.github.io/balloon-pop/?v=random-letters-3)

Open the link above in a browser. It opens the alphabet version with a fresh page URL, bypassing a cached copy of the original game. No download or account is needed. Bookmark this link on your child's device for easy access.

- **Match the letter:** each balloon shows a large uppercase letter. Press only that letter on a physical keyboard to pop it. Uppercase and lowercase both work. Other keys, clicking, and tapping do not pop balloons.
- **Learn A–Z:** every balloon has a random letter, including the first balloon. The same letter never appears twice in a row.
- **One balloon at a time:** the next balloon arrives after a short celebration.
- **60 seconds per balloon:** if a balloon is not popped, a fresh balloon appears automatically. The game never ends.
- **Pause:** take a break and resume with the remaining time. Changing tabs also pauses play.
- **Sound:** toggle the speaker button. Sound starts after your first interaction.

## Run locally

Use Node.js 20.19+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal.

```sh
npm test            # timer, keyboard, pause and continuous-play checks
npm run build      # production files in dist/
npm run preview    # preview the production build
npm run test:browser  # browser checks; Google Chrome required
```

Built with React and Vite. Game logic runs entirely in the browser. No ads, accounts, analytics, or score uploads. Fonts load from Google Fonts with system font fallbacks.

## Publish updates to GitHub Pages

The live game is served from the `gh-pages` branch. After changing the source on `main`:

```sh
npm ci
npm test
npm run build
npm exec --yes --package=gh-pages -- gh-pages -d dist
```

Commit and push source changes separately. In the repository's **Settings → Pages**, keep **Deploy from a branch → gh-pages → / (root)** selected.
