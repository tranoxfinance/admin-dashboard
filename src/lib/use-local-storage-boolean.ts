"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function useLocalStorageBoolean(
  key: string,
  defaultValue: boolean,
): [boolean, (next: boolean) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      const raw = localStorage.getItem(key);
      return raw === null ? defaultValue : raw === "true";
    },
    () => defaultValue,
  );

  function setValue(next: boolean) {
    localStorage.setItem(key, String(next));
    listeners.forEach((callback) => callback());
  }

  return [value, setValue];
}
