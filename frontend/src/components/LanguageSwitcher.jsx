import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "eassurance_lang";

const LANGUAGES = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "rw", flag: "🇷🇼", label: "Kinyarwanda" },
];

function findTranslateSelect() {
  return document.querySelector("select.goog-te-combo");
}

// The Google Translate <script> in index.html loads asynchronously and only builds the
// `select.goog-te-combo` element once it finishes initializing, so callers can't assume it's
// present the instant this component mounts. Poll briefly instead of failing outright.
function waitForTranslateSelect({ intervalMs = 200, timeoutMs = 5000 } = {}) {
  return new Promise((resolve) => {
    const existing = findTranslateSelect();
    if (existing) {
      resolve(existing);
      return;
    }
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += intervalMs;
      const select = findTranslateSelect();
      if (select) {
        clearInterval(timer);
        resolve(select);
      } else if (elapsed >= timeoutMs) {
        clearInterval(timer);
        resolve(null);
      }
    }, intervalMs);
  });
}

function clearTranslateCookies() {
  // Google Translate remembers the active target language in a `googtrans` cookie. Clearing it
  // (bare path, hostname-scoped, and parent-domain-scoped, since Google is inconsistent about
  // which one it wrote) is the documented way to make the widget boot untranslated on reload.
  const hostname = window.location.hostname;
  const expire = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
  document.cookie = `googtrans=; ${expire}; path=/`;
  document.cookie = `googtrans=; ${expire}; path=/; domain=${hostname}`;
  const domainParts = hostname.split(".");
  if (domainParts.length > 1) {
    const parentDomain = "." + domainParts.slice(-2).join(".");
    document.cookie = `googtrans=; ${expire}; path=/; domain=${parentDomain}`;
  }
}

// Selects `code` in the widget's own <select>, which is what actually drives translation.
// For English, we first try the widget's own "restore" behavior (selecting the source
// language back), and only fall back to a full reload — clearing the tracking cookie first —
// if that didn't actually clear the translated-page markers. This keeps the common case
// reload-free while still guaranteeing English always gets you back to the real, original page.
async function applyLanguage(code) {
  const select = await waitForTranslateSelect();
  if (!select) {
    console.warn("[LanguageSwitcher] Google Translate widget did not initialize in time.");
    return;
  }

  if (code === "en") {
    if (select.value !== "en") {
      select.value = "en";
      select.dispatchEvent(new Event("change"));
    }
    setTimeout(() => {
      const html = document.documentElement;
      const stillTranslated =
        html.classList.contains("translated-ltr") || html.classList.contains("translated-rtl");
      if (stillTranslated) {
        clearTranslateCookies();
        window.location.reload();
      }
    }, 300);
    return;
  }

  if (select.value === code) return;
  select.value = code;
  select.dispatchEvent(new Event("change"));
}

export default function LanguageSwitcher() {
  const location = useLocation();
  const [activeLang, setActiveLang] = useState(() => localStorage.getItem(STORAGE_KEY) || "en");
  const hasAppliedOnMount = useRef(false);

  // On mount: if a non-English language was chosen in a previous session, re-apply it once the
  // widget is ready.
  useEffect(() => {
    if (hasAppliedOnMount.current) return;
    hasAppliedOnMount.current = true;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== "en") {
      applyLanguage(stored);
    }
  }, []);

  // On every client-side route change: re-trigger translation of the stored language. This is
  // an SPA, so the widget only ever translates DOM that exists at the moment it runs — a route
  // change swaps in fresh, untranslated content that needs to be re-translated. The short delay
  // gives the newly-rendered route time to land in the DOM before we poll for the widget.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored || stored === "en") return;
    const timer = setTimeout(() => {
      applyLanguage(stored);
    }, 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleSelect = useCallback((code) => {
    localStorage.setItem(STORAGE_KEY, code);
    setActiveLang(code);
    applyLanguage(code);
  }, []);

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-1 rounded-md bg-navy-800 p-1" role="group" aria-label="Choose language">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleSelect(lang.code)}
            aria-pressed={activeLang === lang.code}
            title={lang.label}
            className={`flex flex-1 items-center justify-center gap-1 rounded px-1.5 py-1 text-xs font-medium transition ${
              activeLang === lang.code
                ? "bg-navy-600 text-white"
                : "text-navy-200 hover:bg-navy-700 hover:text-white"
            }`}
          >
            <span aria-hidden="true">{lang.flag}</span>
            <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Required by the Google Translate widget script; our own controls above replace its
          default chrome, so this container stays hidden. */}
      <div id="google_translate_element" className="hidden" />
    </div>
  );
}
