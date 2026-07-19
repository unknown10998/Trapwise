"use client";

import { useEffect, useState } from "react";
import { readFromStorage } from "@/lib/storage";
import type { ProgressRecord } from "@/types/progress";

export function OfflineStatus() {
  const [offline, setOffline] = useState(false);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const update = () => {
      setOffline(!navigator.onLine);
      setPending(readFromStorage<ProgressRecord[]>("pending-cloud-sessions-v1", []).length);
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="border-b border-amber-300/60 bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950" role="status">
      Working locally — your practice is saved on this device. {pending > 0 ? `${pending} session${pending === 1 ? "" : "s"} queued for cloud sync when available.` : "Cloud sync can resume when available."}
    </div>
  );
}
