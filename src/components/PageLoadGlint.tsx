"use client";

import { useEffect } from "react";

/** Triggers a brief glint on visible content containers after the app loads. */
export function PageLoadGlint() {
  useEffect(() => {
    document.body.classList.add("page-loading");
    const timer = window.setTimeout(() => document.body.classList.remove("page-loading"), 500);
    return () => { window.clearTimeout(timer); document.body.classList.remove("page-loading"); };
  }, []);

  return null;
}
