/* Cross-site preference protocol. Canonical source: landing/public/revol-preferences.js.
 * Keep the Wallet public/ and Mintlify root copies identical. See landing/README.md.
 */
(function () {
  "use strict";

  const hosts = new Set(["revol-ai.io", "www.revol-ai.io", "revol-wallet.app", "www.revol-wallet.app", "revolai.mintlify.app"]);
  const locales = new Set(["en", "uk", "pl", "de", "es"]);
  const themes = new Set(["light", "dark"]);
  const docsHost = "revolai.mintlify.app";

  function parsePreferences(search) {
    const params = new URLSearchParams(search);
    return {
      theme: themes.has(params.get("rv_theme")) ? params.get("rv_theme") : null,
      locale: locales.has(params.get("rv_lang")) ? params.get("rv_lang") : null,
    };
  }

  function decorateUrl(href, base, preferences) {
    let url;
    try { url = new URL(href, base); } catch { return href; }
    if (url.protocol !== "https:" || !hosts.has(url.hostname) || url.port || url.username || url.password || url.origin === new URL(base).origin) return href;
    if (themes.has(preferences.theme)) url.searchParams.set("rv_theme", preferences.theme);
    if (locales.has(preferences.locale)) {
      url.searchParams.set("rv_lang", preferences.locale);
      if (url.hostname === docsHost) {
        if (url.pathname === "/") url.pathname = "/introduction";
        const parts = url.pathname.split("/");
        if (locales.has(parts[1])) parts[1] = preferences.locale;
        else parts.splice(1, 0, preferences.locale);
        url.pathname = parts.join("/");
      }
    }
    return url.href;
  }

  // Pure URL behavior is also exercised by the Node test runner.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { parsePreferences, decorateUrl };
    return;
  }
  if (window.__revolPreferencesLoaded) return;
  window.__revolPreferencesLoaded = true;

  const root = document.documentElement;
  const isDocs = location.hostname === docsHost;
  const incoming = parsePreferences(location.search);
  function read(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function save(key, value) { try { localStorage.setItem(key, value); } catch { /* Preferences still work for this visit. */ } }
  function pathLocale() { const locale = location.pathname.split("/")[1]; return locales.has(locale) ? locale : null; }

  if (incoming.locale) save("revol-locale", incoming.locale);
  const locale = (isDocs && pathLocale()) || incoming.locale || read("revol-locale");
  if (locales.has(locale)) root.lang = locale;
  if (incoming.theme) {
    save(isDocs ? "isDarkMode" : "theme", incoming.theme);
    root.classList.remove("light", "dark");
    root.classList.add(incoming.theme);
    if (!isDocs) root.style.colorScheme = incoming.theme;
    if (isDocs) {
      root.setAttribute("data-theme-preference", incoming.theme);
      window.dispatchEvent(new StorageEvent("storage", { key: "isDarkMode", newValue: incoming.theme }));
    }
  }

  // Consume the handoff once, preserving application parameters, hashes and router state.
  const clean = new URL(location.href);
  if (clean.searchParams.has("rv_theme") || clean.searchParams.has("rv_lang")) {
    clean.searchParams.delete("rv_theme");
    clean.searchParams.delete("rv_lang");
    history.replaceState(history.state, "", clean.pathname + clean.search + clean.hash);
  }

  function currentPreferences() {
    const locale = (isDocs && pathLocale()) || root.lang || read("revol-locale");
    return { theme: root.classList.contains("dark") ? "dark" : "light", locale };
  }

  function updateLink(link) {
    if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("download")) return;
    const href = link.getAttribute("href");
    if (!href) return;
    const next = decorateUrl(href, location.href, currentPreferences());
    if (next !== href) link.setAttribute("href", next);
  }

  function updateLinks() {
    if (isDocs && pathLocale()) {
      if (root.lang !== pathLocale()) root.lang = pathLocale();
      if (read("revol-locale") !== pathLocale()) save("revol-locale", pathLocale());
    }
    document.querySelectorAll("a[href]").forEach(updateLink);
  }

  // Capture covers clicks, keyboard activation, middle-click and copying a link.
  function prepareLink(event) {
    const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (target) updateLink(target);
  }
  let started = false;
  function ready() {
    if (started) return;
    started = true;
    ["pointerdown", "click", "auxclick", "contextmenu", "focusin"].forEach(type => document.addEventListener(type, prepareLink, true));
    window.addEventListener("mintlify:navigate", updateLinks);
    window.addEventListener("popstate", updateLinks);
    window.addEventListener("pageshow", updateLinks);
    new MutationObserver(updateLinks).observe(root, { attributes: true, attributeFilter: ["class", "lang"] });
    updateLinks();
    // Only process newly inserted / changed links, not all page content on each mutation.
    new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "attributes") updateLink(record.target);
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          updateLink(node);
          node.querySelectorAll("a[href]").forEach(updateLink);
        }
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
  }
  // Next emits this after hydration; Mintlify runs custom scripts after becoming interactive.
  if (!isDocs) window.addEventListener("revol:preferences-ready", ready, { once: true });
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
})();
