// NAME: Black Cosmic Motion
// AUTHOR: nlovx
// DESCRIPTION: Small animations, and the stars react to the music.

(() => {
    if (window.__cosmicMotion) return;
    window.__cosmicMotion = true;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const EASE = "cubic-bezier(.2, .8, .2, 1)";

    const css = `
/* Cards wait invisible until the script has seen them (so they can ease in); the 1.2 s animation is a safety net
   that shows them anyway if the script ever stops. */
${reduce ? "" : `#main-view [data-encore-id="card"]:not([data-cm]) { opacity: 0; animation: cm-unhide 0s 1.2s forwards; }
@keyframes cm-unhide { to { opacity: 1; } }`}

/* Hover: cards lift, rail covers grow, buttons press, search glows. */
#main-view [data-encore-id="card"] { transition: transform .38s ${EASE}, box-shadow .38s ease; }
#main-view [data-encore-id="card"]:hover { transform: translateY(-5px) scale(1.012); box-shadow: 0 18px 44px rgba(0, 0, 0, .55), 0 0 0 1px rgba(255, 255, 255, .07); }
#Desktop_LeftSidebar_Id img { transition: transform .32s ${EASE}, filter .32s ease; }
#Desktop_LeftSidebar_Id :is(a, button, [role="button"]):hover img { transform: scale(1.1); filter: brightness(1.12); }
[data-testid="control-button-playpause"], [data-testid="control-button-skip-forward"], [data-testid="control-button-skip-back"] { transition: transform .16s ${EASE}; }
[data-testid="control-button-playpause"]:hover { transform: scale(1.08); }
[data-testid="control-button-playpause"]:active, [data-testid="control-button-skip-forward"]:active, [data-testid="control-button-skip-back"]:active { transform: scale(.9); }
#global-nav-bar form { transition: box-shadow .3s ease; }
#global-nav-bar form:focus-within { box-shadow: 0 0 0 1px rgba(255, 255, 255, .22), 0 0 36px rgba(255, 255, 255, .07) !important; }

/* Paused: covers lose a little colour, so the pause is visible at a glance. */
aside[data-testid="now-playing-bar"] img, #cosmic-np .np-cover img { transition: filter .6s ease; }
html.cm-paused aside[data-testid="now-playing-bar"] img, html.cm-paused #cosmic-np .np-cover img { filter: saturate(.7) brightness(.86); }
`;

    function init() {
        const style = document.createElement("style");
        style.id = "cosmic-motion-style";
        style.textContent = css;
        document.head.appendChild(style);
        const P = Spicetify.Player;
        const get = (fn, d) => { try { return fn(); } catch { return d; } };
        const sky = () => window.__cosmicSkyApi;
        const html = document.documentElement;

        // ---- pages ease in when you navigate ----
        if (!reduce) {
            // Spotify renders a page a moment after the route changes, so wait for the new page element to show up.
            let lastPage = null, poll = 0;
            const pageIn = () => {
                clearInterval(poll);
                let tries = 0;
                poll = setInterval(() => {
                    const el = document.querySelector("#main-view main > section") || document.querySelector("#main-view main")
                        || document.querySelector("#main-view .main-view-container__scroll-node-child > *");
                    const ready = el && el !== lastPage && el.getBoundingClientRect().height > 40;
                    if (!ready && ++tries < 40) return;          // up to ~1.6 s
                    clearInterval(poll);
                    if (!ready) return;
                    lastPage = el;
                    el.animate(
                        [{ opacity: 0, transform: "translateY(16px)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
                        { duration: 560, easing: EASE },
                    );
                }, 40);
            };
            get(() => Spicetify.Platform.History.listen(pageIn));
        }

        // ---- cards ease in as they scroll into view ----
        if (!reduce && window.IntersectionObserver) {
            const io = new IntersectionObserver(entries => {
                let n = 0;
                for (const e of entries) {
                    if (!e.isIntersecting) continue;
                    io.unobserve(e.target);
                    e.target.animate(
                        [{ opacity: 0, transform: "translateY(18px) scale(.97)" }, { opacity: 1, transform: "none" }],
                        { duration: 560, delay: Math.min(n++, 10) * 45, easing: EASE, fill: "backwards" },
                    );
                }
            }, { threshold: 0.05 });
            let queued = false;
            const scan = () => {
                queued = false;
                for (const el of document.querySelectorAll('#main-view [data-encore-id="card"]:not([data-cm])')) {
                    el.setAttribute("data-cm", "1");
                    io.observe(el);
                }
            };
            const root = document.getElementById("main-view") || document.body;
            new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(scan); } }).observe(root, { childList: true, subtree: true });
            scan();
        }

        // ---- a like pops ----
        if (!reduce) {
            new MutationObserver(list => {
                for (const m of list) {
                    if (m.attributeName !== "aria-label" || !(m.target instanceof HTMLElement)) continue;
                    const was = m.oldValue || "", now = m.target.getAttribute("aria-label") || "";
                    // "Add to Liked Songs" turning into "Remove from Liked Songs" (any language Spotify uses has those two verbs first)
                    if (!/^(Добавить|Add)/i.test(was) || !/^(Удалить|Remove)/i.test(now)) continue;
                    const b = m.target;
                    b.animate([{ transform: "scale(1)" }, { transform: "scale(1.5)" }, { transform: "scale(.9)" }, { transform: "scale(1)" }], { duration: 560, easing: "cubic-bezier(.2, .9, .3, 1.3)" });
                    b.animate([{ boxShadow: "0 0 0 0 rgba(255,255,255,.55)" }, { boxShadow: "0 0 0 16px rgba(255,255,255,0)" }], { duration: 620, easing: "ease-out" });
                }
            }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["aria-label"], attributeOldValue: true });
        }

        // ---- the sky follows the music ----
        let beats = [], beatIdx = 0, beatUri = null, lastP = 0, playing = false, trackUri = null;

        function seekBeats() {
            const p = get(() => P.getProgress(), 0);
            let lo = 0, hi = beats.length;
            while (lo < hi) { const mid = (lo + hi) >> 1; if (beats[mid].t < p - 30) lo = mid + 1; else hi = mid; }
            beatIdx = lo; lastP = p;
        }
        async function loadBeats(uri) {
            beats = []; beatIdx = 0; beatUri = uri;
            try {
                const a = await Spicetify.getAudioData(uri);
                if (beatUri !== uri) return;
                const bars = (a.bars || []).map(b => b.start);
                let bi = 0;
                beats = (a.beats || []).filter(b => b.confidence > 0.25).map(b => {
                    while (bi < bars.length - 1 && bars[bi] < b.start - 0.06) bi++;
                    return { t: b.start * 1000, strong: Math.abs(bars[bi] - b.start) < 0.06 }; // the first beat of a bar hits harder
                });
            } catch { beats = []; } // not every track has an analysis
            seekBeats();
        }

        function onTrack(uri) {
            trackUri = uri;
            if (!uri || reduce) return;
            sky()?.pulse && window.__cosmicSky?.comet();                 // a comet for every new track
            loadBeats(uri);
            setTimeout(() => {                                          // covers fade in once Spotify has swapped them
                for (const img of document.querySelectorAll('aside[data-testid="now-playing-bar"] img, #Desktop_PanelContainer_Id [data-testid="cover-art-slot"] img')) {
                    img.animate([{ opacity: 0, transform: "scale(1.08)", filter: "blur(10px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: 620, easing: EASE });
                }
            }, 220);
        }

        function onPlayPause() {
            playing = get(() => P.isPlaying(), false);
            html.classList.toggle("cm-paused", !playing);
            if (!reduce) sky()?.setSpeed(playing ? 1 : 0.12);
        }

        (function loop() {
            requestAnimationFrame(loop);
            if (reduce || document.hidden) return;
            const uri = get(() => P.data?.item?.uri, null);
            if (uri !== trackUri) onTrack(uri);
            if (!playing || !beats.length) return;
            const p = get(() => P.getProgress(), 0) + 40; // a little ahead, so the flash lands with the sound
            if (p < lastP - 300 || p > lastP + 1500) seekBeats(); // a seek
            lastP = p;
            while (beatIdx < beats.length && beats[beatIdx].t <= p) {
                const b = beats[beatIdx++];
                if (p - b.t < 140) sky()?.pulse(b.strong ? 1.1 : 0.5);
            }
        })();

        P.addEventListener("onplaypause", onPlayPause);
        P.addEventListener("songchange", () => setTimeout(() => { onPlayPause(); }, 50));
        onPlayPause();

        window.__cosmicMotionApi = { beats: () => beats.length, onTrack, onPlayPause };
    }

    const boot = () => {
        if (!document.body || !window.Spicetify?.Player || !Spicetify.getAudioData) { setTimeout(boot, 300); return; }
        init();
    };
    boot();
})();
