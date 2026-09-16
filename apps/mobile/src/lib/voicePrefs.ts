/**
 * Voice MVP preferences — locale + speech language hints.
 *
 * Production multilingual systems always send a language hint into ASR
 * (profile → locale default → safe fallback). MMS requires an adapter on
 * every call; English (`en` → `eng`) is Meta's documented default.
 *
 * `locale` drives knowledge-pack scoring (GH → momo/chale).
 * `speechLanguage` drives MMS. They are separate on purpose: Ghanaian
 * English audio uses `en` while locale `GH` still resolves local terms.
 */

export type VoicePrefs = {
  /** ISO 3166-1 alpha-2 country, e.g. GH */
  locale: string;
  /** Adara speech code for ASR: en | tw | pcm | sw | yo | … */
  speechLanguage: string;
};

export const DEFAULT_VOICE_PREFS: VoicePrefs = {
  locale: "GH",
  speechLanguage: "tw",
};

export const VOICE_REGIONS: { code: string; label: string; speechDefault: string }[] = [
  { code: "GH", label: "Ghana", speechDefault: "tw" },
  { code: "NG", label: "Nigeria", speechDefault: "en" },
  { code: "KE", label: "Kenya", speechDefault: "sw" },
  { code: "TZ", label: "Tanzania", speechDefault: "sw" },
];

export const VOICE_SPEECH_LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English (code-switch)" },
  { code: "tw", label: "Twi" },
  { code: "pcm", label: "Nigerian Pidgin" },
  { code: "yo", label: "Yoruba" },
  { code: "sw", label: "Swahili" },
  { code: "ha", label: "Hausa" },
];

const STORAGE_KEY = "adara.voice.prefs";

type Listener = (prefs: VoicePrefs) => void;

let prefs: VoicePrefs = { ...DEFAULT_VOICE_PREFS };
const listeners = new Set<Listener>();

function readStorage(): VoicePrefs | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<VoicePrefs>;
    if (!parsed.locale || !parsed.speechLanguage) return null;
    return {
      locale: String(parsed.locale).toUpperCase(),
      speechLanguage: String(parsed.speechLanguage).toLowerCase(),
    };
  } catch {
    return null;
  }
}

function writeStorage(next: VoicePrefs): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Native without polyfill — in-memory prefs still work for the session.
  }
}

/** Load once at module init (web). Native callers can call hydrateVoicePrefs(). */
const stored = readStorage();
if (stored) prefs = stored;

export function hydrateVoicePrefs(): VoicePrefs {
  const fromDisk = readStorage();
  if (fromDisk) {
    prefs = fromDisk;
    listeners.forEach((l) => l(prefs));
  }
  return prefs;
}

export function getVoicePrefs(): VoicePrefs {
  return prefs;
}

export function setVoicePrefs(patch: Partial<VoicePrefs>): VoicePrefs {
  prefs = {
    locale: (patch.locale ?? prefs.locale).toUpperCase(),
    speechLanguage: (patch.speechLanguage ?? prefs.speechLanguage).toLowerCase(),
  };
  writeStorage(prefs);
  listeners.forEach((l) => l(prefs));
  return prefs;
}

export function subscribeVoicePrefs(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Payload for POST /v1/agent/sessions */
export function sessionOptionsFromPrefs(overrides: Partial<VoicePrefs> = {}) {
  const current = { ...prefs, ...overrides };
  return {
    locale: current.locale,
    // Leave language unset for English so context consults all packs via locale.
    language: current.speechLanguage === "en" ? undefined : current.speechLanguage,
    client: {
      speech_language: current.speechLanguage,
      tts_language:
        current.speechLanguage === "en"
          ? current.locale === "NG"
            ? "yo"
            : current.locale === "KE" || current.locale === "TZ"
              ? "sw"
              : "tw"
          : current.speechLanguage,
    },
  };
}
