# Cosmic for Spicetify

A pure black Spotify with a living night sky, a lyrics page, a better mini-player and a bit of motion. Five small extensions that work together or on their own.

| Extension | What it does |
| --- | --- |
| **Cosmic Sky** (`cosmic-sky.js`) | Black palette and a starfield behind the whole app: stars drift in three depth layers and twinkle, and now and then one flares and a tiny comet leaves it. Also removes cover-coloured bands on playlist pages, makes the sticky bars dark glass, and hides the "Ctrl L" hint in search. |
| **Cosmic Motion** (`cosmic-motion.js`) | Pages and cards ease in as you navigate and scroll, cards and rail covers lift on hover, a like pops, covers fade in on a new track. The sky follows the music: a comet for every new track, stars slow down when you pause, and flash on the beat (uses Spotify's audio analysis). Needs Cosmic Sky for the sky effects. |
| **Cosmic Now Playing** (`cosmic-nowplaying.js`) | A page with a big cover and karaoke-style synced lyrics (words fill in as they are sung), plus its own player bar with track, controls, seek and volume. A button with a sparkle in the player bar opens it in the main area; the expand button or **Shift+F11** goes fullscreen; **B** switches the background between stars and a blurred cover; **Esc** closes. While it is open the side panel stops repeating what the page shows. |
| **Cosmic Miniplayer** (`cosmic-miniplayer.js`) | Replaces the look of the built-in mini-player window: small cover, always-visible controls, a seek bar you can drag, space and arrow keys. Works at any window size. |
| **Cosmic Fullscreen F11** (`cosmic-fullscreen.js`) | **F11** toggles window fullscreen, with a top bar button too. **Esc** exits. |

Nothing changes in the normal window until you use the buttons.

## Install

With the Spicetify Marketplace: open it, search for "Cosmic" and install what you want.

By hand: copy the files you want into your Spicetify `Extensions` folder, then

```bash
spicetify config extensions cosmic-sky.js cosmic-motion.js cosmic-nowplaying.js cosmic-miniplayer.js cosmic-fullscreen.js
spicetify apply
```

Do not run Spicetify as administrator.

## Notes

- Built and tested on Windows with Spotify 1.3.6 and Spicetify 2.46. Spotify changes its page structure from time to time; the extensions avoid its generated class names where they can, but a new Spotify version may need an update.
- Lyrics come from Spotify's own lyrics service, so they show only for tracks that have them.
- The mini-player is a separate Picture-in-Picture window, so Windows keeps it opaque.
- `prefers-reduced-motion` is respected: the animations and the sky's motion are switched off.
- The extensions only talk to Spotify itself (lyrics, audio analysis, cover images). Nothing is sent anywhere else.

## По-русски

Чёрный Spotify с живым звёздным небом: страница с большой обложкой и текстом песни (слова подсвечиваются по ходу пения), свой мини-плеер, анимации и небо, которое мигает в такт музыке. Ставится из Spicetify Marketplace (поиск «Cosmic») или вручную, как выше. В обычном окне ничего не меняется, пока не нажмёшь кнопки: кнопка со звездой в нижней панели плеера открывает страницу с текстом, Shift+F11 открывает её на весь экран.

## License

MIT, see `LICENSE`.
