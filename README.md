# 🎈 Pop & Play

A colorful React balloon game made for little hands. One smiling balloon at a time, gentle sounds, and endless play.

## [▶ Click here to play](https://atifaziz1.github.io/balloon-pop/)

Open the link above in a browser. No download or account is needed. Bookmark it on your child's device for easy access.

- **Pop:** press a letter, number, arrow key, or Space. You can also click or tap the balloon.
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
