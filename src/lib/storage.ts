const storagePrefix = "trapwise";

export function getStorageKey(key: string) {
  return `${storagePrefix}:${key}`;
}

export function notifyStorageChange(key: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("trapwise:storage-updated", { detail: { key: getStorageKey(key) } }));
}

export function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const storedValue = window.localStorage.getItem(getStorageKey(key));

  if (!storedValue) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

export function writeToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getStorageKey(key), JSON.stringify(value));
  notifyStorageChange(key);
}

export function removeFromStorage(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getStorageKey(key));
  notifyStorageChange(key);
}

export function subscribeToStorage(key: string, listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const storageKey = getStorageKey(key);
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) listener();
  };
  const onSameTabChange = (event: Event) => {
    const changedKey = (event as CustomEvent<{ key?: string }>).detail?.key;
    if (changedKey === storageKey) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("trapwise:storage-updated", onSameTabChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("trapwise:storage-updated", onSameTabChange);
  };
}
