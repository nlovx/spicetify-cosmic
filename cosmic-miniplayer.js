// NAME: Cosmic Miniplayer
// AUTHOR: nlovx
// DESCRIPTION: A nicer mini-player window: small cover, buttons always visible, drag the bar to seek.

(() => {
    if (window.__cosmicMiniplayer) return;
    window.__cosmicMiniplayer = true;

    const STYLE_ID = "cosmic-miniplayer-style";
    const ROOT_ID = "cosmic-pip";

    // The mini-player is a Document Picture-in-Picture window with its own copy of Spotify's stylesheets,
    // so main-window CSS never reaches it. We draw our own UI there and hide Spotify's content,
    // keeping its top bar (settings, drag handle, close). Spotify's hashed class names change per release,
    // so the only Spotify hooks used are `body > div.encore-dark-theme` and its first child.
    const css = `
html body > div.encore-dark-theme { background: #050505 !important; isolation: isolate; position: relative; }
html body > div.encore-dark-theme::before {
  content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-image:
    radial-gradient(1px 1px at 23px 31px, #ffffffbd 95%, transparent),
    radial-gradient(1px 1px at 92px 107px, #ffffffa8 95%, transparent),
    radial-gradient(1.5px 1.5px at 153px 53px, #ffffffa0 95%, transparent),
    radial-gradient(1px 1px at 43px 184px, #ffffff91 95%, transparent);
  background-size: 173px 151px, 227px 211px, 283px 263px, 317px 277px;
}
html.cosmic-pip-sky body > div.encore-dark-theme::before { display: none; }
html.cosmic-pip-on body > div.encore-dark-theme > :not(:first-child) { visibility: hidden !important; }

#${ROOT_ID} {
  position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; overflow: hidden;
  color: #fff; font-family: var(--encore-body-font-stack, "Segoe UI", system-ui, sans-serif);
  -webkit-font-smoothing: antialiased; user-select: none;
  --cover: clamp(72px, min(calc(100vw - 96px), calc(100vh - 204px)), 260px);
}
#${ROOT_ID} .cp-ui {
  position: absolute; inset: 34px 0 0 0; padding: 4px 18px 14px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
}
#${ROOT_ID} button { all: unset; box-sizing: border-box; cursor: pointer; display: grid; place-items: center; pointer-events: auto; flex: none; }
#${ROOT_ID} svg { display: block; }

#${ROOT_ID} .cp-cover {
  grid-area: cover; width: var(--cover); height: var(--cover); flex: none; border-radius: 12px; overflow: hidden;
  background: #101010; box-shadow: 0 0 0 1px rgba(255,255,255,.1), 0 14px 34px rgba(0,0,0,.7);
}
#${ROOT_ID} .cp-cover { position: relative; }
#${ROOT_ID} .cp-cover img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0; transition: opacity .35s ease; }
#${ROOT_ID} .cp-cover img.on { opacity: 1; }
#${ROOT_ID} .cp-ph { position: absolute; inset: 0; display: grid; place-items: center; color: #2c2c2c; }
#${ROOT_ID} .cp-cover img.on ~ .cp-ph { display: none; }

#${ROOT_ID} .cp-meta { grid-area: meta; width: var(--cover); min-width: 0; display: flex; align-items: center; gap: 10px; }
#${ROOT_ID} .cp-text { flex: 1; min-width: 0; }
#${ROOT_ID} .cp-title { font-size: 15px; font-weight: 800; letter-spacing: -.01em; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${ROOT_ID} .cp-artist { font-size: 12.5px; color: #9a9a9a; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${ROOT_ID} .cp-like { width: 28px; height: 28px; color: #fff; opacity: .9; transition: transform .15s ease, opacity .15s ease; }
#${ROOT_ID} .cp-like:hover { transform: scale(1.1); opacity: 1; }
#${ROOT_ID} .cp-like:not(.on) { color: #9a9a9a; }

#${ROOT_ID} .cp-controls { grid-area: controls; display: flex; align-items: center; justify-content: center; gap: 8px; }
#${ROOT_ID} .cp-btn { width: 36px; height: 36px; color: #fff; border-radius: 50%; transition: transform .12s ease, color .15s ease; position: relative; }
#${ROOT_ID} .cp-btn:hover { transform: scale(1.1); }
#${ROOT_ID} .cp-btn:active { transform: scale(.94); }
#${ROOT_ID} .cp-btn.toggle { color: #7d7d7d; width: 32px; }
#${ROOT_ID} .cp-btn.toggle:hover { color: #cfcfcf; }
#${ROOT_ID} .cp-btn.toggle.on { color: #fff; }
#${ROOT_ID} .cp-btn.toggle.on::after { content: ""; position: absolute; bottom: 2px; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
#${ROOT_ID} .cp-btn.one::before { content: "1"; position: absolute; font-size: 8px; font-weight: 800; top: 12px; }
#${ROOT_ID} .cp-prev svg, #${ROOT_ID} .cp-next svg { width: 22px; height: 22px; }
#${ROOT_ID} .cp-next svg { transform: scaleX(-1); }
#${ROOT_ID} .cp-play { width: 46px; height: 46px; margin: 0 4px; background: #fff; color: #050505; box-shadow: 0 6px 20px rgba(255,255,255,.12); }
#${ROOT_ID} .cp-play:hover { transform: scale(1.07); }
#${ROOT_ID} .cp-play svg { width: 24px; height: 24px; }

#${ROOT_ID} .cp-seek { grid-area: seek; width: 100%; display: grid; grid-template-columns: 38px 1fr 38px; align-items: center; column-gap: 8px; pointer-events: auto; }
#${ROOT_ID} .cp-time { font-size: 11px; color: #a7a7a7; font-variant-numeric: tabular-nums; }
#${ROOT_ID} .cp-time.r { text-align: right; }
#${ROOT_ID} .cp-bar { position: relative; height: 18px; cursor: pointer; touch-action: none; }
#${ROOT_ID} .cp-track { position: absolute; left: 0; right: 0; top: 7px; height: 4px; border-radius: 2px; background: rgba(255,255,255,.2); overflow: hidden; transition: height .12s ease, top .12s ease; }
#${ROOT_ID} .cp-fill { height: 100%; width: 0; background: #fff; border-radius: 2px; }
#${ROOT_ID} .cp-bar:hover .cp-track, #${ROOT_ID} .cp-bar.drag .cp-track { top: 6px; height: 6px; }
#${ROOT_ID} .cp-knob { position: absolute; top: 3px; left: 0; width: 12px; height: 12px; margin-left: -6px; border-radius: 50%; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.6); opacity: 0; transform: scale(.6); transition: opacity .12s ease, transform .12s ease; }
#${ROOT_ID} .cp-bar:hover .cp-knob, #${ROOT_ID} .cp-bar.drag .cp-knob { opacity: 1; transform: scale(1); }
#${ROOT_ID} .cp-tip { position: absolute; bottom: 20px; left: 0; transform: translateX(-50%); padding: 2px 7px; border-radius: 8px; font-size: 11px; font-variant-numeric: tabular-nums;
  background: rgba(30,30,30,.92); box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); opacity: 0; pointer-events: none; transition: opacity .12s ease; }
#${ROOT_ID} .cp-bar:hover .cp-tip, #${ROOT_ID} .cp-bar.drag .cp-tip { opacity: 1; }

/* Small cover: let the title use more than the cover's width. */
@media (max-height: 340px) { #${ROOT_ID} .cp-meta { width: min(100%, 250px); } }
/* Wide and short window: cover on the left, everything else stacked on the right. */
@media (max-height: 220px) {
  #${ROOT_ID} { --cover: clamp(56px, calc(100vh - 60px), 120px); }
  #${ROOT_ID} .cp-ui {
    display: grid; grid-template-columns: var(--cover) minmax(0, 1fr);
    grid-template-areas: "cover meta" "cover controls" "cover seek";
    align-content: center; align-items: center; column-gap: 14px; row-gap: 4px; padding: 2px 16px 8px;
  }
  #${ROOT_ID} .cp-meta { width: 100%; }
  #${ROOT_ID} .cp-btn { width: 30px; height: 30px; }
  #${ROOT_ID} .cp-play { width: 38px; height: 38px; }
  #${ROOT_ID} .cp-controls { justify-content: flex-start; }
}
@media (max-height: 220px) and (max-width: 330px) { #${ROOT_ID} .cp-artist { display: none; } }
/* Very short strip: no artist or times, seek line pinned to the bottom edge. */
@media (max-height: 135px) {
  #${ROOT_ID} { --cover: clamp(40px, calc(100vh - 56px), 96px); }
  #${ROOT_ID} .cp-ui { inset: 24px 0 0 0; padding: 0 14px 24px; row-gap: 0; overflow: hidden; grid-template-areas: "cover meta" "cover controls"; }
  #${ROOT_ID} .cp-artist, #${ROOT_ID} .cp-time { display: none; }
  #${ROOT_ID} .cp-title { font-size: 14px; }
  #${ROOT_ID} .cp-btn { width: 26px; height: 26px; }
  #${ROOT_ID} .cp-btn svg { max-width: 18px; max-height: 18px; }
  #${ROOT_ID} .cp-play { width: 30px; height: 30px; margin: 0 2px; }
  #${ROOT_ID} .cp-seek { position: absolute; left: 14px; right: 14px; bottom: 4px; width: auto; grid-template-columns: 1fr; }
  #${ROOT_ID} .cp-like { width: 24px; height: 24px; }
}
@media (max-height: 100px) {
  #${ROOT_ID} .cp-ui { inset: 22px 0 0 0; padding: 0 14px 16px; }
  #${ROOT_ID} .cp-btn.toggle, #${ROOT_ID} .cp-like { display: none; }
  #${ROOT_ID} .cp-btn { width: 24px; height: 24px; }
  #${ROOT_ID} .cp-play { width: 28px; height: 28px; }
  #${ROOT_ID} .cp-title { font-size: 13px; line-height: 1.2; }
  #${ROOT_ID} .cp-seek { bottom: 0; }
}
`;

    const ICON = {
        play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.1v13.8a1 1 0 0 0 1.5.86l11.1-6.9a1 1 0 0 0 0-1.72L9.5 4.24A1 1 0 0 0 8 5.1z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
        prev: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4.5" y="5" width="2.6" height="14" rx="1.1"/><path d="M19.5 5.6v12.8a.9.9 0 0 1-1.4.74L9 12.74a.9.9 0 0 1 0-1.48l9.1-6.4a.9.9 0 0 1 1.4.74z"/></svg>',
        shuffle: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>',
        repeat: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
        liked: '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7.5 12.6 3 3 6-6.6" fill="none" stroke="#050505" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        like: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9.2"/><path d="M12 7.6v8.8M7.6 12h8.8"/></svg>',
    };

    const T = /^ru/i.test(navigator.language)
        ? { none: "Ничего не играет", hint: "Включи трек в Spotify" }
        : { none: "Nothing playing", hint: "Start a track in Spotify" };
    const P = () => window.Spicetify?.Player;
    const imgUrl = u => (u && u.startsWith("spotify:image:") ? "https://i.scdn.co/image/" + u.slice(14) : u);
    const fmt = ms => {
        const s = Math.max(0, Math.round(ms / 1000));
        return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    };

    function trackInfo() {
        const it = P()?.data?.item;
        if (!it) return null;
        return {
            uri: it.uri,
            title: it.name || "",
            artist: (it.artists || []).map(a => a.name).join(", ") || it.metadata?.artist_name || "",
            cover: imgUrl(it.metadata?.image_large_url || it.metadata?.image_xlarge_url || it.images?.[it.images.length - 1]?.url),
        };
    }

    function buildUI(doc) {
        const root = doc.createElement("div");
        root.id = ROOT_ID;
        root.innerHTML = `
          <div class="cp-ui">
            <div class="cp-cover"><img alt=""><div class="cp-ph"><svg viewBox="0 0 24 24" width="38%" fill="currentColor"><path d="M9 17.5V6.2a1 1 0 0 1 .76-.97l8-2A1 1 0 0 1 19 4.2V15"/><circle cx="6.8" cy="17.6" r="3"/><circle cx="16.8" cy="15.6" r="3"/><path d="M9 9.2l10-2.5" stroke="#050505" stroke-width="1.6" fill="none"/></svg></div></div>
            <div class="cp-meta">
              <div class="cp-text"><div class="cp-title"></div><div class="cp-artist"></div></div>
              <button class="cp-like" aria-label="Like"></button>
            </div>
            <div class="cp-controls">
              <button class="cp-btn toggle cp-shuffle" aria-label="Shuffle">${ICON.shuffle}</button>
              <button class="cp-btn cp-prev" aria-label="Previous">${ICON.prev}</button>
              <button class="cp-btn cp-play" aria-label="Play / pause"></button>
              <button class="cp-btn cp-next" aria-label="Next">${ICON.prev}</button>
              <button class="cp-btn toggle cp-repeat" aria-label="Repeat">${ICON.repeat}</button>
            </div>
            <div class="cp-seek">
              <span class="cp-time cp-cur">0:00</span>
              <div class="cp-bar"><div class="cp-track"><div class="cp-fill"></div></div><div class="cp-knob"></div><div class="cp-tip">0:00</div></div>
              <span class="cp-time r cp-dur">0:00</span>
            </div>
          </div>`;
        return root;
    }

    function mount(win) {
        const doc = win.document;
        if (!doc.body || doc.getElementById(ROOT_ID)) return Boolean(doc.getElementById(ROOT_ID));
        if (!P()) return true; // no Spicetify player: stay with the plain black skin below

        const root = buildUI(doc);
        const $ = sel => root.querySelector(sel);
        const el = {
            img: $(".cp-cover img"), title: $(".cp-title"), artist: $(".cp-artist"), like: $(".cp-like"),
            shuffle: $(".cp-shuffle"), prev: $(".cp-prev"), play: $(".cp-play"), next: $(".cp-next"), repeat: $(".cp-repeat"),
            cur: $(".cp-cur"), dur: $(".cp-dur"), bar: $(".cp-bar"), fill: $(".cp-fill"), knob: $(".cp-knob"), tip: $(".cp-tip"),
        };
        doc.body.appendChild(root);
        doc.documentElement.classList.add("cosmic-pip-on");

        // Same sky as the main window, if Cosmic Sky is loaded.
        const sky = window.__cosmicSkyApi?.startIn(root, win);
        if (sky) doc.documentElement.classList.add("cosmic-pip-sky");

        // Seek: click or drag the bar; the seek is sent on release.
        let dragging = false, dragPct = 0;
        const pctAt = e => {
            const r = el.bar.getBoundingClientRect();
            return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        };
        const showSeek = pct => {
            const dur = P().getDuration() || 0;
            el.fill.style.width = pct * 100 + "%";
            el.knob.style.left = pct * 100 + "%";
            el.tip.style.left = pct * 100 + "%";
            el.tip.textContent = fmt(pct * dur);
            return dur;
        };
        el.bar.addEventListener("pointerdown", e => {
            dragging = true; el.bar.classList.add("drag");
            el.bar.setPointerCapture(e.pointerId);
            dragPct = pctAt(e); el.cur.textContent = fmt(showSeek(dragPct) * dragPct);
        });
        el.bar.addEventListener("pointermove", e => {
            const pct = pctAt(e);
            if (dragging) { dragPct = pct; el.cur.textContent = fmt(showSeek(pct) * pct); }
            else { // hover preview only moves the tooltip, not the fill
                el.tip.style.left = pct * 100 + "%";
                el.tip.textContent = fmt(pct * (P().getDuration() || 0));
            }
        });
        const endDrag = e => {
            if (!dragging) return;
            dragging = false; el.bar.classList.remove("drag");
            P().seek(Math.max(1, Math.round(dragPct * (P().getDuration() || 0))));
        };
        el.bar.addEventListener("pointerup", endDrag);
        el.bar.addEventListener("pointercancel", () => { dragging = false; el.bar.classList.remove("drag"); });

        el.play.addEventListener("click", () => P().togglePlay());
        el.prev.addEventListener("click", () => P().back());
        el.next.addEventListener("click", () => P().next());
        el.shuffle.addEventListener("click", () => P().toggleShuffle());
        el.repeat.addEventListener("click", () => P().toggleRepeat());
        el.like.addEventListener("click", () => { P().toggleHeart(); setTimeout(render, 120); });

        // Space plays/pauses, arrows seek 5 seconds.
        doc.addEventListener("keydown", e => {
            if (e.code === "Space") { e.preventDefault(); P().togglePlay(); }
            else if (e.code === "ArrowRight") P().seek(Math.min(P().getDuration(), P().getProgress() + 5000));
            else if (e.code === "ArrowLeft") P().seek(Math.max(1, P().getProgress() - 5000));
        });

        let lastUri = null;
        // The player state is not ready for a moment after startup; never let a throw stop the timer.
        function render() {
            try { renderNow(); } catch { /* try again on the next tick */ }
        }
        function renderNow() {
            const p = P();
            if (!p) return;
            const info = trackInfo();
            // With no track loaded some getters throw; read each one on its own.
            const get = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
            if (info?.uri !== lastUri) {
                lastUri = info?.uri ?? null;
                el.title.textContent = info?.title ?? T.none;
                el.artist.textContent = info ? info.artist : T.hint;
                el.title.title = info?.title ?? "";
                el.img.classList.remove("on");
                if (info?.cover) {
                    el.img.onload = () => el.img.classList.add("on");
                    el.img.src = info.cover;
                } else {
                    el.img.removeAttribute("src");
                }
            }
            el.play.innerHTML = get(() => p.isPlaying(), false) ? ICON.pause : ICON.play;
            const liked = Boolean(info) && get(() => p.getHeart(), false);
            el.like.classList.toggle("on", liked);
            el.like.innerHTML = liked ? ICON.liked : ICON.like;
            el.like.style.visibility = info ? "visible" : "hidden";
            el.shuffle.classList.toggle("on", Boolean(get(() => p.getShuffle(), false)));
            const rep = get(() => p.getRepeat(), 0);
            el.repeat.classList.toggle("on", rep > 0);
            el.repeat.classList.toggle("one", rep === 2);
            const dur = get(() => p.getDuration(), 0) || 0;
            el.dur.textContent = fmt(dur);
            if (!dragging) {
                const prog = get(() => p.getProgress(), 0) || 0;
                el.cur.textContent = fmt(prog);
                const pct = dur ? Math.min(1, prog / dur) : 0;
                el.fill.style.width = pct * 100 + "%";
                el.knob.style.left = pct * 100 + "%";
            }
        }
        render();
        // The PiP window's own timer: the main window's can be throttled while it is minimized.
        const timer = win.setInterval(render, 250);
        win.addEventListener("pagehide", () => win.clearInterval(timer));
        return true;
    }

    function inject(win) {
        const doc = win?.document;
        if (!doc?.body) return false;
        const place = () => {
            let style = doc.getElementById(STYLE_ID);
            if (!style) {
                style = doc.createElement("style");
                style.id = STYLE_ID;
                style.textContent = css;
            }
            // Spotify prepends its own <link rel=stylesheet> to body after opening the window;
            // keep ours last so ties go to us.
            const root = doc.getElementById(ROOT_ID);
            if (root) { if (root.previousElementSibling !== style) doc.body.insertBefore(style, root); }
            else if (doc.body.lastElementChild !== style) doc.body.appendChild(style);
        };
        place();
        mount(win);
        place();
        new MutationObserver(place).observe(doc.body, { childList: true });
        return true;
    }

    function attach(win) {
        if (inject(win)) return;
        // Body can still be empty right after "enter".
        let tries = 0;
        const timer = setInterval(() => {
            if (inject(win) || ++tries > 40) clearInterval(timer);
        }, 100);
    }

    const pip = window.documentPictureInPicture;
    if (!pip) return;
    pip.addEventListener("enter", e => attach(e.window));
    if (pip.window) attach(pip.window);
})();
