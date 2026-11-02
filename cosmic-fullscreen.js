// NAME: Black Cosmic Fullscreen F11
// AUTHOR: nlovx
// DESCRIPTION: F11 toggles fullscreen (there is a top bar button too). Esc leaves it.

(function FullscreenF11() {
    if (!Spicetify?.Topbar?.Button || !Spicetify?.SVGIcons) {
        setTimeout(FullscreenF11, 300);
        return;
    }

    const ICON_ENTER =
        '<path d="M1 1h5v1.5H2.5V6H1V1zm9 0h5v5h-1.5V2.5H10V1zM1 10h1.5v3.5H6V15H1v-5zm12.5 0H15v5h-5v-1.5h3.5V10z"/>';
    const ICON_EXIT =
        '<path d="M5.5 1H7v5.5H1V5h4.5V1zM9 1h1.5v4H15v1.5H9V1zM1 9.5h6V15H5.5v-4H1V9.5zM9 9.5h6V11h-4.5v4H9V9.5z"/>';

    // Spotify drops the icon string into the button as-is, so it must be a complete <svg>.
    const svg = inner => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">${inner}</svg>`;

    const isFullscreen = () => Boolean(document.fullscreenElement);

    async function toggle() {
        try {
            if (isFullscreen()) {
                await document.exitFullscreen();
            } else {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.error("[fullscreen-f11] toggle failed:", err);
            Spicetify.showNotification("Fullscreen failed: " + (err?.message ?? err), true);
        }
    }

    const button = new Spicetify.Topbar.Button("Fullscreen (F11)", svg(ICON_ENTER), toggle);

    function syncButton() {
        const fs = isFullscreen();
        button.label = fs ? "Exit fullscreen (F11)" : "Fullscreen (F11)";
        button.icon = svg(fs ? ICON_EXIT : ICON_ENTER);
    }

    document.addEventListener("fullscreenchange", syncButton);

    // Capture phase so Spotify's own handlers can't swallow F11.
    window.addEventListener(
        "keydown",
        e => {
            if (e.key !== "F11" || e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
            e.preventDefault();
            e.stopPropagation();
            if (!e.repeat) toggle();
        },
        true
    );
})();
