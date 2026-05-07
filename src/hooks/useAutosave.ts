"use client";

import * as React from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<void>,
  delay = 800,
) {
  const [status, setStatus] = React.useState<SaveStatus>("idle");
  const firstRun = React.useRef(true);
  const lastSerialized = React.useRef<string>("");
  const saveRef = React.useRef(save);
  React.useEffect(() => {
    saveRef.current = save;
  }, [save]);

  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      lastSerialized.current = JSON.stringify(value);
      return;
    }
    const serialized = JSON.stringify(value);
    if (serialized === lastSerialized.current) return;

    setStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await saveRef.current(value);
        lastSerialized.current = serialized;
        setStatus("saved");
        setTimeout(() => {
          setStatus((s) => (s === "saved" ? "idle" : s));
        }, 1500);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return status;
}
