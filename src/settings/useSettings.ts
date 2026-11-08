import { useEffect, useState } from "react";
import { defaultSettings, loadSettings, saveSettings, type Settings } from "./settings";

const store = typeof localStorage === "undefined" ? undefined : localStorage;
const browserLanguage = typeof navigator === "undefined" ? undefined : navigator.language;

/** Settings kept in the browser. Isolated here so it can later sync with an account. */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings(store, browserLanguage));

  useEffect(() => {
    saveSettings(store, settings);
    document.documentElement.lang = settings.language;
  }, [settings]);

  const reset = () => setSettings(defaultSettings(browserLanguage));
  return { settings, setSettings, reset };
}
