import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

type Serializer<T> = (value: T) => string;
type Deserializer<T> = (raw: string) => T;

type Options<T> = {
  serializer?: Serializer<T>;
  deserializer?: Deserializer<T>;
};

/**
 * React state synced with localStorage.
 * - Safe JSON parsing (falls back to defaultValue)
 * - Writes on change
 * - Syncs across tabs via the `storage` event
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  options: Options<T> = {}
): [T, Dispatch<SetStateAction<T>>] {
  const serializer: Serializer<T> =
    options.serializer ?? ((v: T) => JSON.stringify(v));
  const deserializer: Deserializer<T> =
    options.deserializer ?? ((raw: string) => JSON.parse(raw) as T);

  const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

  const readValue = (): T => {
    if (!isBrowser) return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return deserializer(raw);
    } catch {
      return defaultValue;
    }
  };

  const [value, setValue] = useState<T>(readValue);

  // Keep a ref so storage-event updates don't trigger unnecessary writes
  const lastWrittenRef = useRef<string | null>(null);

  // Write to localStorage when value changes
  useEffect(() => {
    if (!isBrowser) return;
    try {
      const raw = serializer(value);
      if (lastWrittenRef.current === raw) return;
      window.localStorage.setItem(key, raw);
      lastWrittenRef.current = raw;
    } catch {
      // ignore write errors (quota, private mode, etc.)
    }
  }, [key, value, isBrowser]);

  // Sync across tabs/windows
  useEffect(() => {
    if (!isBrowser) return;
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return;
      if (e.key !== key) return;
      try {
        if (e.newValue === null) {
          setValue(defaultValue);
          lastWrittenRef.current = null;
          return;
        }
        // Avoid loops: if we already wrote exactly this value, ignore
        if (lastWrittenRef.current === e.newValue) return;
        const next = deserializer(e.newValue);
        setValue(next);
        lastWrittenRef.current = e.newValue;
      } catch {
        // ignore parse errors
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, defaultValue, deserializer, isBrowser]);

  return [value, setValue];
}

/** Helper to clear multiple keys (e.g., on logout) */
export function clearLocalStorageKeys(keys: string[]) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return;
  try {
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
