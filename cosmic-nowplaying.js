// NAME: Cosmic Now Playing
// AUTHOR: nlovx
// DESCRIPTION: A now-playing page with a big cover and synced lyrics, in Cosmic style, with its own player bar at the bottom. Opens in the main area from a player-bar button; fullscreen with the expand button or Shift+F11. Esc closes.

(() => {
    if (window.__cosmicNP) return;
    const ROOT_ID = "cosmic-np";
    const STYLE_ID = "cosmic-np-style";

    const RU = /^ru/i.test(navigator.language);
    const T = RU
        ? { none: "Ничего не играет", noLyrics: "Для этого трека нет текста", loading: "Ищу текст…", bg: "Фон: звёзды / обложка (B)", close: "Закрыть (Esc)", expand: "На весь экран (Shift+F11)", shrink: "Свернуть в окно", open: "Текст и обложка", mute: "Звук", like: "В любимые" }
        : { none: "Nothing playing", noLyrics: "No lyrics for this track", loading: "Looking for lyrics…", bg: "Background: stars / cover (B)", close: "Close (Esc)", expand: "Fullscreen (Shift+F11)", shrink: "Back to window", open: "Lyrics and cover", mute: "Volume", like: "Like" };

    const store = {
        get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage can be unavailable */ } },
    };

    // Sizes use container units (cqw/cqh) so the same layout works in the main area and fullscreen.
    const css = `
#${ROOT_ID} { display: none; position: fixed; background: #050505; color: #fff; overflow: hidden; container-type: size;
  -webkit-font-smoothing: antialiased; user-select: none; }
#${ROOT_ID}.open { display: block; animation: np-in .45s ease both; }
@keyframes np-in { from { opacity: 0; transform: scale(1.01); } to { opacity: 1; transform: none; } }
#${ROOT_ID}.embed { z-index: 8; border-radius: 14px; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08); }
#${ROOT_ID}.full { inset: 0; z-index: 2147482000; }
#${ROOT_ID}.idle { cursor: none; }

#${ROOT_ID} .np-bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
#${ROOT_ID} .np-blur { position: absolute; inset: -18%; background: var(--cover-url) center / cover no-repeat;
  filter: blur(70px) saturate(1.5) brightness(.5); opacity: 0; transition: opacity .9s ease; }
#${ROOT_ID}.bg-blur .np-blur { opacity: 1; animation: np-drift 46s ease-in-out infinite alternate; }
@keyframes np-drift { from { transform: translate3d(-2%, -1%, 0) rotate(-2deg) scale(1.05); } to { transform: translate3d(2%, 2%, 0) rotate(3deg) scale(1.18); } }
#${ROOT_ID} .np-shade { position: absolute; inset: 0; background: rgba(0, 0, 0, .28); opacity: 0; transition: opacity .9s ease; }
#${ROOT_ID}.bg-blur .np-shade { opacity: 1; }
#${ROOT_ID} .np-sky { position: absolute; inset: 0; z-index: 1; pointer-events: none; }

#${ROOT_ID} .np-top { position: absolute; z-index: 4; top: 16px; right: 18px; display: flex; gap: 8px; transition: opacity .4s ease; }
#${ROOT_ID}.full .np-top { top: 22px; right: 26px; }
#${ROOT_ID}.full.chrome .np-top { right: 150px; } /* leave room for the window's own min/max/close */
#${ROOT_ID} button { all: unset; box-sizing: border-box; cursor: pointer; display: grid; place-items: center; flex: none; }
#${ROOT_ID} .np-round { width: 36px; height: 36px; border-radius: 50%; color: #e8e8e8; background: rgba(20, 20, 20, .5);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .1); backdrop-filter: blur(16px); transition: transform .15s ease, background .15s ease; }
#${ROOT_ID} .np-round:hover { transform: scale(1.08); background: rgba(40, 40, 40, .7); }
#${ROOT_ID}.full .np-round { width: 40px; height: 40px; }
#${ROOT_ID}.embed .np-round.to-embed, #${ROOT_ID}.full .np-round.to-full { display: none; }

#${ROOT_ID} .np-stage { position: absolute; z-index: 2; inset: 0 0 118px 0; display: flex; align-items: center; padding: 0 5cqw; gap: 4cqw; --np-fs: clamp(22px, 2.7cqw, 58px); --cover: min(34cqw, 52cqh); }
#${ROOT_ID} .np-left { flex: 0 0 var(--cover); display: flex; flex-direction: column; align-items: center; gap: 4px; margin-left: 2cqw; }
#${ROOT_ID} .np-cover { position: relative; width: var(--cover); aspect-ratio: 1; border-radius: 14px; overflow: hidden; background: #101010;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, .1), 0 30px 80px rgba(0, 0, 0, .65); margin-bottom: 18px; }
#${ROOT_ID} .np-cover img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0; transition: opacity .5s ease; }
#${ROOT_ID} .np-cover img.on { opacity: 1; }
#${ROOT_ID} .np-title { max-width: 100%; font-size: clamp(17px, 1.6cqw, 30px); font-weight: 800; letter-spacing: -.01em; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${ROOT_ID} .np-album { max-width: 100%; font-size: clamp(13px, 1.1cqw, 20px); font-weight: 700; color: #cfcfcf; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${ROOT_ID} .np-artist { max-width: 100%; font-size: clamp(12px, 1cqw, 18px); color: #9a9a9a; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

#${ROOT_ID} .np-right { position: relative; flex: 1; min-width: 0; height: 100%; }
#${ROOT_ID} .np-lyrics { position: absolute; inset: 0; overflow: hidden;
  -webkit-mask-image: linear-gradient(transparent 0, #000 14%, #000 78%, transparent 100%); mask-image: linear-gradient(transparent 0, #000 14%, #000 78%, transparent 100%); }
/* The block glides with a slight overshoot; neighbours fade in a wave (delay grows with distance). */
#${ROOT_ID} .np-lines { position: relative; padding-right: 3cqw; transition: transform .9s cubic-bezier(.22, 1.1, .36, 1); will-change: transform; }
#${ROOT_ID} .np-line { margin: 0 0 .5em; font-size: var(--np-fs); font-weight: 800; line-height: 1.16; letter-spacing: -.02em; cursor: pointer; transform-origin: left center;
  opacity: max(.16, calc(1 - var(--d, 0) * .24)); filter: blur(calc(min(var(--d, 0), 5) * .55px)); transform: scale(calc(1 - min(var(--d, 0), 4) * .015));
  transition: opacity .55s ease, filter .55s ease, transform .55s ease; transition-delay: calc(min(var(--d, 0), 6) * 16ms); }
#${ROOT_ID} .np-line:hover { opacity: max(.55, calc(1 - var(--d, 0) * .24)); filter: none; }
#${ROOT_ID} .np-line.active { opacity: 1; filter: none; transform: none; transition-delay: 0s; animation: np-line-in .75s cubic-bezier(.34, 1.45, .64, 1) both; }
@keyframes np-line-in { from { transform: translateY(20px) scale(.94); } to { transform: none; } }
/* Words fill in as they are sung (--w goes 0 to 1 per word) and rise a little while they do. */
#${ROOT_ID} .np-w { display: inline-block; margin-right: .26em; }
#${ROOT_ID} .np-line.active .np-w { color: transparent; -webkit-background-clip: text; background-clip: text;
  background-image: linear-gradient(90deg, #fff calc(var(--w, 0) * 100%), rgba(255, 255, 255, .34) calc(var(--w, 0) * 100% + .1%));
  transform: translateY(calc(var(--lift, 0) * -.07em)); filter: drop-shadow(0 0 calc(.5em * var(--w, 0)) rgba(255, 255, 255, .28)); }
/* Instrumental breaks and intros: three breathing dots. */
#${ROOT_ID} .np-dots { display: inline-flex; gap: .3em; align-items: center; height: 1.1em; }
#${ROOT_ID} .np-dots i { width: .38em; height: .38em; border-radius: 50%; background: #fff; opacity: .5; animation: np-breathe 1.6s ease-in-out infinite; }
#${ROOT_ID} .np-dots i:nth-child(2) { animation-delay: .22s; }
#${ROOT_ID} .np-dots i:nth-child(3) { animation-delay: .44s; }
@keyframes np-breathe { 0%, 100% { transform: scale(.7); opacity: .3; } 50% { transform: scale(1.15); opacity: 1; } }
#${ROOT_ID}.unsynced .np-lyrics { overflow-y: auto; scrollbar-width: none; }
#${ROOT_ID}.unsynced .np-line { opacity: .88; filter: none; transform: none; cursor: default; font-size: calc(var(--np-fs) * .72); }
#${ROOT_ID} .np-note { display: none; margin-top: 10px; font-size: clamp(12px, 1cqw, 16px); font-weight: 700; color: #6f6f6f; text-align: center; }
/* No lyrics: the cover takes the middle of the page and the note sits under it. */
#${ROOT_ID}.nolyrics .np-stage { justify-content: center; }
#${ROOT_ID}.nolyrics .np-left { margin-left: 0; }
#${ROOT_ID}.nolyrics .np-right { display: none; }
#${ROOT_ID}.nolyrics .np-note { display: block; }

/* The player bar: track on the left, controls and seek in the middle, volume on the right. */
#${ROOT_ID} .np-bar { position: absolute; z-index: 4; left: 50%; bottom: 24px; transform: translateX(-50%); width: min(1180px, 92cqw); padding: 12px 22px 10px;
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 560px) minmax(0, 1fr); column-gap: 18px; align-items: center;
  border-radius: 24px; background: rgba(16, 16, 16, .55); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .1), 0 20px 60px rgba(0, 0, 0, .5);
  backdrop-filter: blur(26px) saturate(1.3); transition: opacity .4s ease, transform .4s ease; }
#${ROOT_ID}.full.idle .np-bar { opacity: 0; transform: translateX(-50%) translateY(14px); pointer-events: none; }
#${ROOT_ID}.full.idle .np-top { opacity: 0; pointer-events: none; }
#${ROOT_ID} .np-barL { display: flex; align-items: center; gap: 12px; min-width: 0; }
#${ROOT_ID} .np-mini { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; background: #101010; flex: none; box-shadow: 0 0 0 1px rgba(255, 255, 255, .1); }
#${ROOT_ID} .np-mtext { min-width: 0; flex: 1; }
#${ROOT_ID} .np-mtitle { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${ROOT_ID} .np-martist { font-size: 12px; color: #9a9a9a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${ROOT_ID} .np-like { width: 30px; height: 30px; color: #fff; transition: transform .15s ease; }
#${ROOT_ID} .np-like:hover { transform: scale(1.1); }
#${ROOT_ID} .np-like:not(.on) { color: #9a9a9a; }
#${ROOT_ID} .np-barR { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
#${ROOT_ID} .np-volbtn { width: 32px; height: 32px; color: #cfcfcf; border-radius: 50%; }
#${ROOT_ID} .np-volbtn:hover { color: #fff; }
#${ROOT_ID} .np-vol { position: relative; width: 110px; height: 18px; cursor: pointer; touch-action: none; }
#${ROOT_ID} .np-vtrack { position: absolute; left: 0; right: 0; top: 7px; height: 4px; border-radius: 2px; background: rgba(255, 255, 255, .2); overflow: hidden; transition: height .12s ease, top .12s ease; }
#${ROOT_ID} .np-vfill { height: 100%; width: 100%; background: #fff; }
#${ROOT_ID} .np-vol:hover .np-vtrack { top: 6px; height: 6px; }
#${ROOT_ID} .np-controls { display: flex; align-items: center; justify-content: center; gap: 12px; }
#${ROOT_ID} .np-btn { width: 40px; height: 40px; border-radius: 50%; position: relative; color: #fff; transition: transform .12s ease, color .15s ease; }
#${ROOT_ID} .np-btn:hover { transform: scale(1.1); }
#${ROOT_ID} .np-btn:active { transform: scale(.94); }
#${ROOT_ID} .np-btn.toggle { color: #7d7d7d; }
#${ROOT_ID} .np-btn.toggle:hover { color: #cfcfcf; }
#${ROOT_ID} .np-btn.toggle.on { color: #fff; }
#${ROOT_ID} .np-btn.toggle.on::after { content: ""; position: absolute; bottom: 3px; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
#${ROOT_ID} .np-btn.one::before { content: "1"; position: absolute; font-size: 9px; font-weight: 800; top: 14px; }
#${ROOT_ID} .np-next svg { transform: scaleX(-1); }
#${ROOT_ID} .np-play { width: 50px; height: 50px; background: #fff; color: #050505; box-shadow: 0 6px 22px rgba(255, 255, 255, .12); }
#${ROOT_ID} .np-seek { display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; column-gap: 12px; margin-top: 2px; }
#${ROOT_ID} .np-time { font-size: 12px; color: #a7a7a7; font-variant-numeric: tabular-nums; }
#${ROOT_ID} .np-time.r { text-align: right; }
#${ROOT_ID} .np-barwrap { position: relative; height: 20px; cursor: pointer; touch-action: none; }
#${ROOT_ID} .np-track { position: absolute; left: 0; right: 0; top: 8px; height: 4px; border-radius: 2px; background: rgba(255, 255, 255, .2); overflow: hidden; transition: height .12s ease, top .12s ease; }
#${ROOT_ID} .np-fill { height: 100%; width: 0; background: #fff; }
#${ROOT_ID} .np-barwrap:hover .np-track, #${ROOT_ID} .np-barwrap.drag .np-track { top: 7px; height: 6px; }
#${ROOT_ID} .np-knob { position: absolute; top: 4px; left: 0; width: 12px; height: 12px; margin-left: -6px; border-radius: 50%; background: #fff; opacity: 0; transform: scale(.6); transition: opacity .12s ease, transform .12s ease; }
#${ROOT_ID} .np-barwrap:hover .np-knob, #${ROOT_ID} .np-barwrap.drag .np-knob { opacity: 1; transform: none; }
#${ROOT_ID} .np-tip { position: absolute; bottom: 22px; left: 0; transform: translateX(-50%); padding: 2px 8px; border-radius: 8px; font-size: 12px; font-variant-numeric: tabular-nums;
  background: rgba(30, 30, 30, .94); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .1); opacity: 0; pointer-events: none; transition: opacity .12s ease; }
#${ROOT_ID} .np-barwrap:hover .np-tip, #${ROOT_ID} .np-barwrap.drag .np-tip { opacity: 1; }

/* Narrow or tall area: cover on top, lyrics below, and the bar keeps only the middle part. */
@container (max-width: 760px), (max-aspect-ratio: 1 / 1) {
  #${ROOT_ID} .np-stage { flex-direction: column; justify-content: flex-start; padding: 56px 6cqw 0; gap: 12px; --np-fs: clamp(20px, 5cqw, 36px); --cover: min(46cqw, 26cqh); }
  #${ROOT_ID} .np-left { flex: none; margin: 0; }
  #${ROOT_ID} .np-cover { margin-bottom: 6px; }
  #${ROOT_ID} .np-right { width: 100%; flex: 1; min-height: 0; }
}
@container (max-width: 1250px) {
  #${ROOT_ID} .np-bar { grid-template-columns: auto minmax(280px, 1fr) auto; width: calc(100cqw - 40px); }
  #${ROOT_ID} .np-mtext { display: none; } /* cover and like stay; the title is already on the page */
  #${ROOT_ID} .np-vol { width: 84px; }
}
@container (max-width: 900px) {
  #${ROOT_ID} .np-bar { grid-template-columns: 1fr; width: calc(100cqw - 24px); }
  #${ROOT_ID} .np-barL, #${ROOT_ID} .np-barR { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  #${ROOT_ID} .np-blur, #${ROOT_ID} .np-line.active, #${ROOT_ID} .np-dots i { animation: none !important; }
  #${ROOT_ID} .np-line.active .np-w { transform: none !important; }
}

/* While the page is open the side panel stops repeating it: the player (the page has its own bar), the cover,
   the title row, the lyrics preview and the panel's header all go. Rules are separate so an engine that lacks
   :has() skips only those. */
html.cosmic-np-on aside[data-testid="now-playing-bar"] { display: none !important; }
html.cosmic-np-on div:has(> aside[data-testid="now-playing-bar"]) { display: none !important; }
html.cosmic-np-on #Desktop_PanelContainer_Id [data-testid="lyrics-npv-section"] { display: none !important; }
html.cosmic-np-on #Desktop_PanelContainer_Id div:has(> [data-testid="cover-art-slot"]) { display: none !important; }
html.cosmic-np-on #Desktop_PanelContainer_Id .np-dup { display: none !important; }
html.cosmic-np-on #Desktop_PanelContainer_Id > div > :first-child { display: none !important; }
`;

    const ICON = {
        play: '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5.1v13.8a1 1 0 0 0 1.5.86l11.1-6.9a1 1 0 0 0 0-1.72L9.5 4.24A1 1 0 0 0 8 5.1z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
        prev: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><rect x="4.5" y="5" width="2.6" height="14" rx="1.1"/><path d="M19.5 5.6v12.8a.9.9 0 0 1-1.4.74L9 12.74a.9.9 0 0 1 0-1.48l9.1-6.4a.9.9 0 0 1 1.4.74z"/></svg>',
        shuffle: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>',
        repeat: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
        liked: '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7.5 12.6 3 3 6-6.6" fill="none" stroke="#050505" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        like: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9.2"/><path d="M12 7.6v8.8M7.6 12h8.8"/></svg>',
        vol: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
        mute: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor"/><path d="m22 9-6 6M16 9l6 6"/></svg>',
        close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
        bg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16v4M17 18h4"/></svg>',
        expand: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
        shrink: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
    };

    const P = () => window.Spicetify?.Player;
    const get = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
    const imgUrl = u => (u && u.startsWith("spotify:image:") ? "https://i.scdn.co/image/" + u.slice(14) : u);
    const fmt = ms => {
        const s = Math.max(0, Math.round(ms / 1000));
        return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    };
    const mainView = () => document.getElementById("main-view") || document.querySelector("main");

    function init() {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = css;
        document.head.appendChild(style);

        const root = document.createElement("div");
        root.id = ROOT_ID;
        root.innerHTML = `
          <div class="np-bg"><div class="np-blur"></div><div class="np-shade"></div></div>
          <div class="np-sky"></div>
          <div class="np-top">
            <button class="np-round np-bgbtn" title="${T.bg}">${ICON.bg}</button>
            <button class="np-round to-full np-expand" title="${T.expand}">${ICON.expand}</button>
            <button class="np-round to-embed np-shrink" title="${T.shrink}">${ICON.shrink}</button>
            <button class="np-round np-close" title="${T.close}">${ICON.close}</button>
          </div>
          <div class="np-stage">
            <section class="np-left">
              <div class="np-cover"><img alt=""></div>
              <div class="np-title"></div><div class="np-album"></div><div class="np-artist"></div><div class="np-note"></div>
            </section>
            <section class="np-right">
              <div class="np-lyrics"><div class="np-lines"></div></div>
            </section>
          </div>
          <div class="np-bar">
            <div class="np-barL">
              <img class="np-mini" alt="">
              <div class="np-mtext"><div class="np-mtitle"></div><div class="np-martist"></div></div>
              <button class="np-like" title="${T.like}"></button>
            </div>
            <div class="np-barM">
              <div class="np-controls">
                <button class="np-btn toggle np-shuffle">${ICON.shuffle}</button>
                <button class="np-btn np-prev">${ICON.prev}</button>
                <button class="np-btn np-play"></button>
                <button class="np-btn np-next">${ICON.prev}</button>
                <button class="np-btn toggle np-repeat">${ICON.repeat}</button>
              </div>
              <div class="np-seek">
                <span class="np-time np-cur">0:00</span>
                <div class="np-barwrap"><div class="np-track"><div class="np-fill"></div></div><div class="np-knob"></div><div class="np-tip">0:00</div></div>
                <span class="np-time r np-dur">0:00</span>
              </div>
            </div>
            <div class="np-barR">
              <button class="np-volbtn" title="${T.mute}"></button>
              <div class="np-vol"><div class="np-vtrack"><div class="np-vfill"></div></div></div>
            </div>
          </div>`;
        document.body.appendChild(root);

        const $ = sel => root.querySelector(sel);
        const el = {
            img: $(".np-cover img"), title: $(".np-title"), album: $(".np-album"), artist: $(".np-artist"),
            lyrics: $(".np-lyrics"), lines: $(".np-lines"), note: $(".np-note"),
            mini: $(".np-mini"), mtitle: $(".np-mtitle"), martist: $(".np-martist"), like: $(".np-like"),
            shuffle: $(".np-shuffle"), prev: $(".np-prev"), play: $(".np-play"), next: $(".np-next"), repeat: $(".np-repeat"),
            cur: $(".np-cur"), dur: $(".np-dur"), bar: $(".np-barwrap"), fill: $(".np-fill"), knob: $(".np-knob"), tip: $(".np-tip"),
            volbtn: $(".np-volbtn"), vol: $(".np-vol"), vfill: $(".np-vfill"),
        };

        const S = { open: false, loading: false, raf: 0, mode: "embed", bg: store.get("cosmic-np-bg", "cosmic"), uri: null, lines: [], sync: "NONE", active: -2, sky: null, timer: 0, idle: 0, enteredFs: false, dragging: false, dragPct: 0, volDrag: false, ro: null };
        const cache = new Map();
        root.classList.add(S.bg === "blur" ? "bg-blur" : "bg-cosmic");

        // ---- lyrics ----
        async function loadLyrics(uri) {
            const id = uri.split(":")[2];
            if (cache.has(id)) return cache.get(id);
            let res = { sync: "NONE", lines: [] };
            try {
                const r = await Spicetify.CosmosAsync.get(`https://spclient.wg.spotify.com/color-lyrics/v2/track/${id}?format=json&vocalRemoval=false&market=from_token`);
                const l = r?.lyrics;
                if (l?.lines?.length) {
                    res = { sync: l.syncType, lines: l.lines.map(x => ({ t: Number(x.startTimeMs) || 0, text: (x.words || "").trim() || "♪" })) };
                }
            } catch { /* 404 means no lyrics for this track */ }
            cache.set(id, res);
            return res;
        }

        function renderLyrics(res) {
            S.lines = res.lines; S.sync = res.sync; S.active = -2;
            el.lines.textContent = "";
            el.lines.style.transform = "";
            root.classList.toggle("nolyrics", !res.lines.length);
            root.classList.toggle("unsynced", res.sync === "UNSYNCED");
            el.note.textContent = S.loading ? T.loading : T.noLyrics;
            res.lines.forEach(ln => {
                const d = document.createElement("div");
                d.className = "np-line";
                if (ln.text === "♪") {
                    d.innerHTML = '<span class="np-dots"><i></i><i></i><i></i></span>';
                } else {
                    for (const word of ln.text.split(/\s+/)) {
                        const w = document.createElement("span");
                        w.className = "np-w";
                        w.textContent = word;
                        d.appendChild(w);
                    }
                }
                d.addEventListener("click", () => { if (S.sync !== "UNSYNCED") get(() => P().seek(Math.max(1, ln.t + 1))); });
                el.lines.appendChild(d);
            });
            el.lyrics.scrollTop = 0;
            tick();
        }

        function activeIndex(prog) {
            let lo = 0, hi = S.lines.length - 1, ans = -1;
            while (lo <= hi) {
                const mid = (lo + hi) >> 1;
                if (S.lines[mid].t <= prog + 200) { ans = mid; lo = mid + 1; } else hi = mid - 1;
            }
            return ans;
        }

        function placeLines() {
            if (S.sync === "UNSYNCED" || !S.lines.length) return;
            const node = el.lines.children[Math.max(S.active, 0)];
            if (!node) return;
            const target = el.lyrics.clientHeight * 0.4 - (node.offsetTop + node.offsetHeight / 2);
            el.lines.style.transform = `translateY(${Math.round(target)}px)`;
        }

        // Karaoke fill: the active line's words light up one after another across the time until the next line.
        let fillKey = "";
        function updateFill(prog) {
            const idx = S.active;
            if (idx < 0 || S.sync === "UNSYNCED") return;
            const node = el.lines.children[idx], line = S.lines[idx];
            if (!node || !line) return;
            const words = node.querySelectorAll(".np-w");
            if (!words.length) return;
            const next = S.lines[idx + 1];
            const gap = next ? next.t - line.t : 4000;
            const span = Math.min(Math.max(gap - 150, 600), words.length * 420 + 700); // finish near reading pace, not after a long gap
            const p = Math.min(1, Math.max(0, (prog - line.t) / span));
            const key = idx + ":" + Math.round(p * 200);
            if (key === fillKey) return;
            fillKey = key;
            words.forEach((w, i) => {
                const f = Math.min(1, Math.max(0, p * words.length - i));
                w.style.setProperty("--w", f.toFixed(3));
                w.style.setProperty("--lift", Math.sin(Math.PI * f).toFixed(3));
            });
        }

        function setActive(idx) {
            S.active = idx; fillKey = "";
            if (S.sync !== "UNSYNCED") {
                const kids = el.lines.children;
                for (let i = 0; i < kids.length; i++) {
                    kids[i].style.setProperty("--d", idx < 0 ? i + 1 : Math.abs(i - idx));
                    kids[i].classList.toggle("active", i === idx);
                }
            }
            placeLines();
        }

        // ---- meta / state ----
        function trackInfo() {
            const it = get(() => P().data?.item, null);
            if (!it) return null;
            return {
                uri: it.uri, title: it.name || "", album: it.album?.name || "",
                artist: (it.artists || []).map(a => a.name).join(", ") || it.metadata?.artist_name || "",
                cover: imgUrl(it.metadata?.image_xlarge_url || it.metadata?.image_large_url || it.images?.[it.images.length - 1]?.url),
            };
        }

        async function onTrack(info) {
            S.uri = info?.uri ?? null;
            el.title.textContent = el.mtitle.textContent = info?.title ?? T.none;
            el.album.textContent = info?.album ?? "";
            el.artist.textContent = el.martist.textContent = info?.artist ?? "";
            el.img.classList.remove("on");
            if (info?.cover) {
                el.img.onload = () => el.img.classList.add("on");
                el.img.src = info.cover; el.mini.src = info.cover;
                root.style.setProperty("--cover-url", `url("${info.cover}")`);
            } else { el.img.removeAttribute("src"); el.mini.removeAttribute("src"); }
            if (!info) { S.loading = false; renderLyrics({ sync: "NONE", lines: [] }); el.note.textContent = T.none; return; }
            S.loading = true; renderLyrics({ sync: "NONE", lines: [] }); // until the fetch lands
            const res = await loadLyrics(info.uri);
            if (S.uri === info.uri) { S.loading = false; renderLyrics(res); }
        }

        // The side panel's title row has no stable hook (its position among siblings changes), so it is found by its
        // text: the tallest ancestor of the title link that is still a thin row. Re-checked now and then because the
        // panel re-renders.
        let dupAt = 0;
        function markDuplicates(title) {
            const aside = document.getElementById("Desktop_PanelContainer_Id");
            if (!aside || !title) return;
            for (const a of aside.querySelectorAll("a")) {
                if (a.textContent.trim() !== title || a.closest(".np-dup")) continue;
                let row = a;
                while (row.parentElement && row.parentElement !== aside && row.parentElement.getBoundingClientRect().height <= 80) row = row.parentElement;
                if (row.getBoundingClientRect().height <= 80) row.classList.add("np-dup");
            }
        }
        function clearDuplicates() { document.querySelectorAll(".np-dup").forEach(n => n.classList.remove("np-dup")); }

        function tick() {
            if (!S.open) return;
            const p = P();
            if (!p) return;
            const info = trackInfo();
            const now = performance.now();
            if (now - dupAt > 700) { dupAt = now; markDuplicates(info?.title); }
            if ((info?.uri ?? null) !== S.uri) onTrack(info);
            el.play.innerHTML = get(() => p.isPlaying(), false) ? ICON.pause : ICON.play;
            el.shuffle.classList.toggle("on", Boolean(get(() => p.getShuffle(), false)));
            const rep = get(() => p.getRepeat(), 0);
            el.repeat.classList.toggle("on", rep > 0);
            el.repeat.classList.toggle("one", rep === 2);
            const liked = Boolean(info) && get(() => p.getHeart(), false);
            el.like.classList.toggle("on", liked);
            el.like.innerHTML = liked ? ICON.liked : ICON.like;
            el.like.style.visibility = info ? "visible" : "hidden";
            if (!S.volDrag) {
                const muted = get(() => p.getMute(), false), vol = muted ? 0 : get(() => p.getVolume(), 1);
                el.vfill.style.width = Math.round(vol * 100) + "%";
                el.volbtn.innerHTML = vol === 0 ? ICON.mute : ICON.vol;
            }
            const dur = get(() => p.getDuration(), 0) || 0, prog = get(() => p.getProgress(), 0) || 0;
            el.dur.textContent = fmt(dur);
            if (!S.dragging) {
                el.cur.textContent = fmt(prog);
                const pct = dur ? Math.min(1, prog / dur) : 0;
                el.fill.style.width = pct * 100 + "%";
                el.knob.style.left = pct * 100 + "%";
            }
            if (S.sync === "LINE_SYNCED" || S.sync === "SYLLABLE_SYNCED") {
                const idx = activeIndex(prog);
                if (idx !== S.active) setActive(idx);
                updateFill(prog);
            }
        }

        // The fill reads the clock every frame so it moves smoothly between the 120 ms ticks.
        function frame() {
            S.raf = requestAnimationFrame(frame);
            if (S.sync === "UNSYNCED" || S.active < 0 || S.dragging) return;
            updateFill(get(() => P().getProgress(), 0) || 0);
        }

        // ---- seek and volume bars ----
        const pctAt = (node, e) => { const r = node.getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); };
        const durNow = () => get(() => P().getDuration(), 0) || 0;
        const showSeek = pct => {
            el.fill.style.width = pct * 100 + "%"; el.knob.style.left = pct * 100 + "%";
            el.tip.style.left = pct * 100 + "%"; el.tip.textContent = fmt(pct * durNow());
            el.cur.textContent = fmt(pct * durNow());
        };
        el.bar.addEventListener("pointerdown", e => { S.dragging = true; el.bar.classList.add("drag"); el.bar.setPointerCapture(e.pointerId); S.dragPct = pctAt(el.bar, e); showSeek(S.dragPct); });
        el.bar.addEventListener("pointermove", e => {
            const pct = pctAt(el.bar, e);
            if (S.dragging) { S.dragPct = pct; showSeek(pct); }
            else { el.tip.style.left = pct * 100 + "%"; el.tip.textContent = fmt(pct * durNow()); }
        });
        el.bar.addEventListener("pointerup", () => {
            if (!S.dragging) return;
            S.dragging = false; el.bar.classList.remove("drag");
            get(() => P().seek(Math.max(1, Math.round(S.dragPct * durNow()))));
        });
        el.bar.addEventListener("pointercancel", () => { S.dragging = false; el.bar.classList.remove("drag"); });

        const setVol = v => {
            el.vfill.style.width = Math.round(v * 100) + "%";
            get(() => { if (P().getMute()) P().setMute(false); P().setVolume(v); });
        };
        el.vol.addEventListener("pointerdown", e => { S.volDrag = true; el.vol.setPointerCapture(e.pointerId); setVol(pctAt(el.vol, e)); });
        el.vol.addEventListener("pointermove", e => { if (S.volDrag) setVol(pctAt(el.vol, e)); });
        el.vol.addEventListener("pointerup", () => { S.volDrag = false; });
        el.vol.addEventListener("pointercancel", () => { S.volDrag = false; });
        el.volbtn.addEventListener("click", () => get(() => P().setMute(!P().getMute())));

        el.play.addEventListener("click", () => get(() => P().togglePlay()));
        el.prev.addEventListener("click", () => get(() => P().back()));
        el.next.addEventListener("click", () => get(() => P().next()));
        el.shuffle.addEventListener("click", () => get(() => P().toggleShuffle()));
        el.repeat.addEventListener("click", () => get(() => P().toggleRepeat()));
        el.like.addEventListener("click", () => { get(() => P().toggleHeart()); setTimeout(tick, 150); });
        $(".np-close").addEventListener("click", () => close());
        $(".np-bgbtn").addEventListener("click", () => setBg(S.bg === "blur" ? "cosmic" : "blur"));
        $(".np-expand").addEventListener("click", () => setMode("full"));
        $(".np-shrink").addEventListener("click", () => setMode("embed"));

        function setBg(mode) {
            S.bg = mode; store.set("cosmic-np-bg", mode);
            root.classList.toggle("bg-blur", mode === "blur");
            root.classList.toggle("bg-cosmic", mode !== "blur");
        }

        // ---- placement ----
        // In the window the page sits exactly over Spotify's main area; the rest of the UI stays usable.
        // Spotify rearranges its layout in narrow windows (the main area can shrink to nothing or sit under
        // the side panel), so the area is only used when it is really there; otherwise the page fills
        // everything below the top bar.
        function embedRect() {
            const mv = mainView();
            if (mv) {
                const r = mv.getBoundingClientRect(), cs = getComputedStyle(mv);
                root.style.pointerEvents = "none"; // let elementFromPoint see what is under the page
                const hit = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 240));
                root.style.pointerEvents = "";
                const usable = cs.display !== "none" && cs.visibility !== "hidden" && r.width >= 460 && r.height >= 320 && (!hit || mv.contains(hit));
                if (usable) return { left: r.left, top: r.top, width: r.width, height: r.height, radius: "14px" };
            }
            const nav = document.getElementById("global-nav-bar");
            const top = nav ? Math.round(nav.getBoundingClientRect().bottom) : 56;
            return { left: 0, top, width: window.innerWidth, height: window.innerHeight - top, radius: "0" };
        }
        function placeEmbed() {
            if (!S.open || S.mode !== "embed") return;
            const r = embedRect();
            Object.assign(root.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", borderRadius: r.radius });
        }
        function clearPlacement() { for (const k of ["left", "top", "width", "height", "borderRadius"]) root.style[k] = ""; }
        const syncChrome = () => root.classList.toggle("chrome", !document.fullscreenElement);

        function setMode(mode) {
            S.mode = mode;
            root.classList.toggle("embed", mode === "embed");
            root.classList.toggle("full", mode === "full");
            if (mode === "full") {
                clearPlacement();
                if (!document.fullscreenElement) {
                    S.enteredFs = true;
                    document.documentElement.requestFullscreen().catch(() => { S.enteredFs = false; }).finally(syncChrome);
                }
                wake();
            } else {
                clearTimeout(S.idle); root.classList.remove("idle");
                const leave = S.enteredFs && document.fullscreenElement;
                S.enteredFs = false; // so the fullscreenchange handler does not close the page
                if (leave) document.exitFullscreen().catch(() => {});
                placeEmbed();
            }
            syncChrome();
            // The lyrics layout depends on the size.
            requestAnimationFrame(() => { placeLines(); });
            setTimeout(placeLines, 150);
            syncButton();
        }

        // ---- open / close ----
        const wake = () => {
            if (S.mode !== "full") return;
            root.classList.remove("idle");
            clearTimeout(S.idle);
            S.idle = setTimeout(() => root.classList.add("idle"), 3500);
        };
        root.addEventListener("mousemove", wake);
        root.addEventListener("mousedown", wake);

        function onKey(e) {
            if (!S.open) return;
            const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName) || e.target?.isContentEditable;
            if (e.key === "Escape" && !typing) { e.preventDefault(); e.stopPropagation(); close(); return; }
            if (S.mode !== "full" || typing) return; // in the window only Esc is ours; Spotify keeps its own shortcuts
            const stop = () => { e.preventDefault(); e.stopPropagation(); };
            if (e.code === "Space") { stop(); get(() => P().togglePlay()); }
            else if (e.code === "ArrowRight") { stop(); get(() => P().seek(Math.min(durNow(), P().getProgress() + 5000))); }
            else if (e.code === "ArrowLeft") { stop(); get(() => P().seek(Math.max(1, P().getProgress() - 5000))); }
            else if (e.code === "KeyB") { stop(); setBg(S.bg === "blur" ? "cosmic" : "blur"); }
            else return;
            wake();
        }
        window.addEventListener("keydown", onKey, true);

        function open(mode = "embed") {
            if (S.open) { if (mode !== S.mode) setMode(mode); return; }
            S.open = true;
            S.sky = window.__cosmicSkyApi?.startIn($(".np-sky"), window) ?? null;
            root.classList.add("open");
            document.documentElement.classList.add("cosmic-np-on"); // side panel stops repeating the page
            S.uri = undefined; S.active = -2; // force a fresh read of the current track
            setMode(mode);
            tick();
            S.timer = setInterval(tick, 120);
            S.raf = requestAnimationFrame(frame);
            window.addEventListener("resize", onResize);
            const mv = mainView();
            if (mv && window.ResizeObserver) { S.ro = new ResizeObserver(onResize); S.ro.observe(mv); }
            syncButton();
        }
        function onResize() { placeEmbed(); placeLines(); }

        function close() {
            if (!S.open) return;
            S.open = false;
            clearInterval(S.timer); clearTimeout(S.idle); cancelAnimationFrame(S.raf);
            document.documentElement.classList.remove("cosmic-np-on");
            clearDuplicates();
            window.removeEventListener("resize", onResize);
            S.ro?.disconnect(); S.ro = null;
            S.sky?.stop(); S.sky = null;
            root.classList.remove("open", "idle");
            clearPlacement();
            if (S.enteredFs && document.fullscreenElement) document.exitFullscreen().catch(() => {});
            S.enteredFs = false;
            syncButton();
        }
        const toggle = () => (S.open ? close() : open("embed"));

        // If the user leaves fullscreen themselves (F11, Esc) while we own it, drop back to the window view.
        document.addEventListener("fullscreenchange", () => {
            syncChrome();
            if (S.open && S.mode === "full" && S.enteredFs && !document.fullscreenElement) { S.enteredFs = false; setMode("embed"); }
        });

        // Navigating inside Spotify (opening a playlist, searching...) leaves the page.
        try { Spicetify.Platform.History.listen(() => { if (S.open && S.mode === "embed") close(); }); } catch { /* no history API */ }

        window.addEventListener("keydown", e => {
            if (e.key === "F11" && e.shiftKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); e.stopPropagation(); S.open && S.mode === "full" ? close() : open("full"); }
        }, true);

        // Opt-in: nothing changes in the normal window until this button (or Shift+F11) is used.
        // The button sits in the player bar next to the mini-player / fullscreen icons.
        // A frame with a sparkle in it, so it does not look like one of Spotify's own icons.
        const iconPath = '<path fill-rule="evenodd" d="M3.5 1h9A2.5 2.5 0 0 1 15 3.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5v-9A2.5 2.5 0 0 1 3.5 1zm0 1.4a1.1 1.1 0 0 0-1.1 1.1v9a1.1 1.1 0 0 0 1.1 1.1h9a1.1 1.1 0 0 0 1.1-1.1v-9a1.1 1.1 0 0 0-1.1-1.1h-9z"/><path d="M8 4.1l.9 2.2 2.2.9-2.2.9L8 10.3l-.9-2.2-2.2-.9 2.2-.9z"/>';
        // Spotify drops the icon string into the button as-is, so it must be a complete <svg>.
        const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">${iconPath}</svg>`;
        const button = Spicetify.Playbar?.Button
            ? new Spicetify.Playbar.Button(T.open, icon, toggle)
            : new Spicetify.Topbar.Button(T.open, icon, toggle);
        function syncButton() { try { button.active = S.open; } catch { /* older Spicetify has no active state */ } }

        window.__cosmicNP = { open, close, toggle, setMode, tick, state: S };
    }

    const boot = () => {
        if (!document.body || !window.Spicetify?.Player || !Spicetify.Topbar?.Button || !Spicetify.CosmosAsync) { setTimeout(boot, 300); return; }
        init();
    };
    boot();
})();
