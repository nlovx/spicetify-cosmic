// NAME: Black Cosmic Sky
// AUTHOR: nlovx
// DESCRIPTION: Black Spotify with a slow starfield behind it, and the occasional small comet.
(() => {
  const styleId = "cosmic-sky-extension";
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
/* A single fixed sky, behind the main grid; no per-star DOM nodes. */
/* A neutral palette replaces all StarryNight blue chrome; cover art is untouched. */
:root, .Root__top-container {
  --spice-main: #080808 !important; --spice-main-elevated: #1a1a1a !important;
  --spice-sidebar: #080808 !important; --spice-sidebar-alt: #050505 !important;
  --spice-player: #101010 !important; --spice-card: #191919 !important;
  --spice-highlight: #242424 !important; --spice-highlight-elevated: #292929 !important;
  --spice-misc: #b0b0b0 !important; --spice-tab-active: #303030 !important;
  --spice-button: #eeeeee !important; --spice-button-active: #ffffff !important;
  --spice-button-disabled: #555555 !important; --spice-notification: #303030 !important;
  --spice-rgb-main: 8,8,8 !important; --spice-rgb-sidebar: 8,8,8 !important;
  --spice-rgb-main-elevated: 26,26,26 !important; --spice-rgb-card: 25,25,25 !important;
  --spice-rgb-highlight: 36,36,36 !important; --spice-rgb-highlight-elevated: 41,41,41 !important;
  --spice-rgb-player: 16,16,16 !important; --spice-rgb-button: 238,238,238 !important;
  --spice-rgb-button-active: 255,255,255 !important; --spice-rgb-notification: 48,48,48 !important;
}
.Root__top-container { background: #050505 !important; isolation: isolate; }
.starrynight-bg-container { display: none !important; }
/* Current Spotify 1.3 desktop grid, with legacy hooks for other versions. */
.yQCyOSVcMCen_NJKPHB6, .qB0QkhexXi3Wx0P1k0Rf, .Root__nav-bar, .main-yourLibraryX-libraryContainer,
.R1kU6b2KxZc8FWfbYf3m, .Root__main-view,
.XvuTwlgQRqJ5NnVLN9ZH, .Root__now-playing-bar, .Root__right-sidebar,
[data-testid="now-playing-bar"], .main-nowPlayingBar-nowPlayingBar,
.main-view-container, .main-view-container__scroll-node-child,
[data-testid="playlist-page"], .fmJtSKRbaIwuGI4eOWBt,
.main-home-homeHeader, .kMaYBahSBLOnErF7DLR2,
.main-entityHeader-backgroundColor, .main-actionBarBackground-background,
.main-topBar-background, .main-topBar-background::after, .main-topBar-overlay, .main-topBar-container::before, .rrn0EjHTu7eCxn9G0Rrc,
.hbNOZbHD3bPL3OcHQWNn, .uP1rcUSIWCFaOZaoH0ZG, .r8bczAWCEgb9_L0iyIcc,
[data-testid="overscroll-background"] {
  background: transparent !important; box-shadow: none !important;
}
/* Layout grid items sit above the sky. */
.R1kU6b2KxZc8FWfbYf3m { z-index: 1; }
.yQCyOSVcMCen_NJKPHB6 { z-index: 4; }
.Root__globalNav { background: transparent !important; }
#global-nav-bar :is(button, form, [role="search"]), .Root__globalNav button,
.main-globalNav-navLink, .mtcoPsHo3H4N4_8m1la5 {
  background-color: rgba(20,20,24,.78) !important; background-image: none !important;
  box-shadow: none !important;
}
#global-nav-bar :is(form, [role="search"]) { border-radius: 24px !important; }
#global-nav-bar input { background: transparent !important; }
:where(#global-nav-bar, .yQCyOSVcMCen_NJKPHB6) :is(button, a):focus-visible {
  outline: 2px solid #e5e5e8 !important; outline-offset: 2px;
}
/* Lightweight black-glass controls: translucent fills, no per-row blur. */
#global-nav-bar :is(button, form, [role="search"]),
.Root__globalNav button, .main-globalNav-navLink, .mtcoPsHo3H4N4_8m1la5,
.Dropdown-control, .marketplace-header-icon-button {
  background: linear-gradient(180deg, rgba(45,45,45,.72), rgba(12,12,12,.78)) !important;
  box-shadow: inset 0 1px rgba(255,255,255,.12), inset 0 0 0 1px rgba(255,255,255,.05) !important;
}
#global-nav-bar input { background: transparent !important; }
.yQCyOSVcMCen_NJKPHB6 [aria-selected="true"] {
  background: rgba(48,48,48,.56) !important;
  border-radius: 7px !important;
}
.marketplace-header, #marketplace-readme { --background-body: #101010; --background: #171717; --background-alt: #1c1c1c; --button-base: #202020; }
/* Quiet chrome: no badge behind Marketplace and no duplicate search ring. */
#global-nav-bar input:focus, #global-nav-bar input:focus-visible {
  outline: none !important; box-shadow: none !important;
}
#global-nav-bar [role="search"]:focus-within,
#global-nav-bar form:focus-within { outline: none !important; box-shadow: none !important; }
#global-nav-bar :is(button[aria-label="Маркетплейс"], button[aria-label="Marketplace"], a[aria-label="Marketplace"]) {
  background: transparent !important; box-shadow: none !important; border: 0 !important;
}
#global-nav-bar :is(button[aria-label="Маркетплейс"], button[aria-label="Marketplace"], a[aria-label="Marketplace"]):hover {
  background: rgba(255,255,255,.06) !important;
}
/* Neutral selection and hover states; do not animate scrolling rows. */
.yQCyOSVcMCen_NJKPHB6 {
  --background-base: transparent; --background-highlight: rgba(255,255,255,.075);
  --background-press: rgba(255,255,255,.12); --background-elevated-base: #1a1a1e;
  --background-tinted-base: rgba(255,255,255,.08);
  --background-tinted-highlight: rgba(255,255,255,.13);
}
[data-testid="lyrics-npv-section"] {
  background: rgba(17,17,20,.78) !important; border-radius: 10px !important;
}
/* Transparent chrome and right-hand panels; content remains readable. */
#global-nav-bar :is(button, form, [role="search"], input), .Root__globalNav button,
.main-globalNav-navLink, .mtcoPsHo3H4N4_8m1la5,
#global-nav-bar div:has(> input[type="search"]),
#global-nav-bar div:has(> div > input[type="search"]) {
  background: transparent !important; border: 0 !important; box-shadow: none !important;
}
.s8fIIxwITjOk1aFOxhPv, .s8fIIxwITjOk1aFOxhPv :is(div, section, article),
[data-testid="lyrics-npv-section"] {
  background-color: transparent !important; box-shadow: none !important;
}
[data-testid="lyrics-npv-section"] { background: transparent !important; }
/* Playlist and album pages colour their header with the cover (an inline background on the block under the header
   and an inline --background-base on the sticky bar). Keep them black. */
#main-view section[data-testid$="-page"] > div[style*="background-color"] { background: none !important; }
#main-view section[data-testid$="-page"] div[style*="background-color"]:empty { background: none !important; }
#main-view [style*="--background-base"] { --background-base: transparent !important; }
/* The sticky title bar and the sticky table header are dark glass: transparent ones let scrolled rows run into them,
   and the default is a milky grey. */
#main-view .main-topBar-background {
  background: rgba(8,8,8,.72) !important; box-shadow: inset 0 -1px rgba(255,255,255,.06) !important;
  -webkit-backdrop-filter: blur(18px) saturate(1.2); backdrop-filter: blur(18px) saturate(1.2);
}
#main-view .rrn0EjHTu7eCxn9G0Rrc {
  background: rgba(5,5,5,.86) !important;
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
}
/* The "Ctrl L" shortcut hint inside the search box. */
#global-nav-bar kbd, #global-nav-bar span:has(> kbd) { display: none !important; }
/* Right-hand player in the StarryNight layout. */
[data-testid="now-playing-bar"] { container-type: inline-size; }
@container (max-width: 450px) {
  [data-testid="now-playing-widget"], [data-testid="now-playing-widget-v2"] {
    box-sizing: border-box !important; display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important; gap: 2px 8px !important;
    align-items: center !important; width: min(100%, 168px) !important;
    min-width: 0 !important; margin: 0 auto !important; padding: 0 !important;
    border: 0 !important; border-radius: 0 !important;
    background: transparent !important; box-shadow: none !important;
    transform: translateY(14px) !important;
  }
  [data-testid="now-playing-widget"] [data-testid="CoverSlot"],
  [data-testid="now-playing-widget-v2"] [data-testid="cover-art-container"] {
    grid-column: 1 / -1 !important; grid-row: 1 !important;
    width: 128px !important; height: 128px !important; margin: 0 auto 8px !important;
    border-radius: 10px !important; overflow: hidden !important;
  }
  [data-testid="now-playing-bar"] [data-testid="cover-art-button"],
  [data-testid="now-playing-bar"] [data-testid="cover-art-button"] > *,
  [data-testid="now-playing-bar"] [data-testid="cover-art-button"] img {
    display: block !important; width: 128px !important; height: 128px !important;
    object-fit: cover !important; border-radius: 10px !important;
  }
  [data-testid="now-playing-widget-v2"] > :nth-child(2) { grid-column: 1; grid-row: 2; min-width: 0; }
  [data-testid="now-playing-widget-v2"] > :nth-child(3) { grid-column: 1; grid-row: 3; min-width: 0; }
  [data-testid="now-playing-widget-v2"] > :last-child { grid-column: 2; grid-row: 2 / 4; }
}
@media (prefers-reduced-motion: no-preference) {
  #global-nav-bar button { transition: background-color 180ms ease, transform 180ms ease; }
  #global-nav-bar button:hover { transform: translateY(-2px); }
}
`;
  (document.head || document.documentElement).appendChild(style);

  // Living sky: stars drift in three depth layers and twinkle; now and then one flares
  // and a small, faint comet leaves it. One canvas, ~30fps, paused while the window is hidden.
  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const makeGlow = rgb => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${rgb},1)`);
    grad.addColorStop(0.16, `rgba(${rgb},.5)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return c;
  };
  const glows = [makeGlow("255,255,255"), makeGlow("190,214,255"), makeGlow("255,230,200")];
  const fills = ["#fff", "#c4d8ff", "#ffe8cc"];

  // Shared by every sky (main window, now-playing page, mini-player): how fast the stars drift, and a beat pulse
  // that Cosmic Motion fires in time with the music.
  let targetSpeed = 1, beatAt = -1e9, beatStrength = 0;
  const beatNow = () => beatStrength * Math.exp(-(performance.now() - beatAt) / 170);

  // `win` lets the same sky run in another window (the mini-player's Picture-in-Picture window).
  function startSky(host, win = window) {
    const doc = win.document;
    const canvas = doc.createElement("canvas");
    canvas.id = "cosmic-sky-canvas";
    canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;";
    host.prepend(canvas);
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, stars = [], comet = null, pending = null, nextComet = 0, last = 0, raf = 0, speed = 1;

    const resize = () => {
      const dpr = Math.min(win.devicePixelRatio || 1, 2);
      W = win.innerWidth; H = win.innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(220, Math.max(18, (W * H) / 11000)));
      stars = Array.from({ length: n }, () => {
        const depth = Math.random() ** 1.6; // many far stars, few near ones
        return {
          x: rand(0, W), y: rand(0, H), depth,
          r: 0.7 + depth * 1.1, base: 0.5 + depth * 0.45,
          tw: rand(0.4, 1.4), ph: rand(0, TAU),
          vx: -(3 + depth * 13), vy: 1.2 + depth * 5, // px/s, slow drift down-left
          tint: Math.random() < 0.12 ? 1 : Math.random() < 0.08 ? 2 : 0, flare: 0,
        };
      });
      if (reduceMotion) draw(0);
    };

    function spawnComet() {
      const pool = stars.filter(s => s.depth > 0.3 && s.x > 80 && s.x < W - 80 && s.y > 40 && s.y < H - 160);
      if (!pool.length) return;
      const s = pool[Math.floor(Math.random() * pool.length)];
      s.flare = 1; // the star brightens first, the comet leaves a moment later
      const a = rand(24, 40) * Math.PI / 180;
      pending = { at: 0.28, x: s.x, y: s.y, dx: -Math.cos(a), dy: Math.sin(a), speed: rand(250, 340), len: rand(70, 110), life: rand(1.1, 1.5) };
    }

    function update(dt, t) {
      speed += (targetSpeed - speed) * Math.min(1, dt * 2.5); // eases toward the shared target
      for (const s of stars) {
        s.x += s.vx * dt * speed; s.y += s.vy * dt * speed;
        if (s.x < -4) { s.x = W + 4; s.y = rand(0, H); }
        if (s.y > H + 4) { s.y = -4; s.x = rand(0, W); }
        if (s.flare > 0) s.flare = Math.max(0, s.flare - dt * 1.1);
      }
      if (!comet && !pending && t > nextComet) { spawnComet(); nextComet = t + rand(8, 18); }
      if (pending) {
        pending.at -= dt;
        if (pending.at <= 0) { comet = { ...pending, age: 0 }; pending = null; }
      }
      if (comet) {
        comet.age += dt;
        comet.x += comet.dx * comet.speed * dt; comet.y += comet.dy * comet.speed * dt;
        comet.speed *= 1 - 0.25 * dt;
        if (comet.age >= comet.life) comet = null;
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      const beat = beatNow();
      for (const s of stars) {
        const tw = 0.78 + 0.22 * Math.sin(t * s.tw + s.ph);
        const a = Math.min(1, s.base * tw + s.flare * 0.6 + beat * (0.1 + s.depth * 0.45));
        ctx.fillStyle = fills[s.tint];
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (1 + s.flare * 0.6 + beat * 0.25 * s.depth), 0, TAU); ctx.fill();
        if (s.depth > 0.78 || s.flare > 0 || (beat > 0.25 && s.depth > 0.5)) {
          const size = s.r * 11 * (1 + s.flare * 1.2 + beat * 0.6);
          ctx.globalAlpha = a * 0.45;
          ctx.drawImage(glows[s.tint], s.x - size / 2, s.y - size / 2, size, size);
          if (tw > 0.97 || s.flare > 0.3 || (beat > 0.5 && s.depth > 0.78)) { // little four-point sparkle at the peak
            ctx.globalAlpha = a * 0.5; ctx.strokeStyle = fills[s.tint]; ctx.lineWidth = 0.6;
            const k = s.r * 4.5 * (1 + s.flare);
            ctx.beginPath(); ctx.moveTo(s.x - k, s.y); ctx.lineTo(s.x + k, s.y); ctx.moveTo(s.x, s.y - k); ctx.lineTo(s.x, s.y + k); ctx.stroke();
          }
        }
      }
      if (comet) {
        const p = comet.age / comet.life;
        const alpha = 0.55 * (p < 0.12 ? p / 0.12 : Math.pow(1 - p, 1.4));
        const len = comet.len * Math.min(1, comet.age / 0.25);
        const tx = comet.x - comet.dx * len, ty = comet.y - comet.dy * len;
        const grad = ctx.createLinearGradient(comet.x, comet.y, tx, ty);
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(0.3, `rgba(196,216,255,${alpha * 0.35})`);
        grad.addColorStop(1, "rgba(196,216,255,0)");
        ctx.globalAlpha = 1; ctx.strokeStyle = grad; ctx.lineWidth = 1.1; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(comet.x, comet.y); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.globalAlpha = alpha; ctx.drawImage(glows[1], comet.x - 8, comet.y - 8, 16, 16);
      }
      ctx.globalAlpha = 1;
    }

    const frame = now => {
      raf = win.requestAnimationFrame(frame);
      if (now - last < 33) return; // ~30fps is plenty for a slow sky
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      update(dt, now / 1000);
      draw(now / 1000);
    };
    let dead = false;
    const run = () => { win.cancelAnimationFrame(raf); if (!dead && !reduceMotion && !doc.hidden) raf = win.requestAnimationFrame(frame); };

    let resizeTimer = 0;
    win.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); });
    doc.addEventListener("visibilitychange", run);
    nextComet = performance.now() / 1000 + 4; // first comet soon after start
    resize();
    draw(performance.now() / 1000); // first frame right away, before rAF kicks in
    run();
    return {
      canvas,
      stop: () => { dead = true; win.cancelAnimationFrame(raf); doc.removeEventListener("visibilitychange", run); canvas.remove(); },
      comet: spawnComet,
      step: dt => { const t = performance.now() / 1000; update(dt, t); draw(t); }, // manual testing
    };
  }
  // Other extensions (the mini-player) reuse the sky through this.
  window.__cosmicSkyApi = {
    startIn: startSky,
    setSpeed: v => { targetSpeed = v; },                                                        // 1 = normal drift, 0 = still
    pulse: (strength = 1) => { beatAt = performance.now(); beatStrength = Math.min(1.5, strength); }, // a brief brightening
  };

  // The app root appears after the extension loads.
  const hostSel = ".Root__top-container";
  const tryStart = () => {
    const host = document.querySelector(hostSel);
    if (!host || document.getElementById("cosmic-sky-canvas")) return !!host;
    window.__cosmicSky = startSky(host); // __cosmicSky.comet() / .step(seconds) for manual testing
    return true;
  };
  if (!tryStart()) {
    const mo = new MutationObserver(() => { if (tryStart()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

