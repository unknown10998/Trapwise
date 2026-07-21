import { removeFromStorage, scopedDataKey } from "@/lib/storage";

const guestKeys = [
  "progress-history-v1",
  "daily-session-v1",
  "pending-cloud-sessions-v1",
  "demo-profile-v1",
  "pre-demo-progress-history-v1",
  "adaptive-diagnostic",
  "follow-up-v1",
  "trap-forge-v1",
  "mistake-twin-impact-v1",
] as const;

/** Remove only local guest-account data. Signed-in account namespaces and device preferences remain untouched. */
export function resetGuestAccount() {
  if (typeof window === "undefined") return;
  for (const key of guestKeys) {
    removeFromStorage(scopedDataKey("guest", key));
    removeFromStorage(key); // Remove pre-namespace guest data after it has been isolated.
  }
  removeFromStorage("profile-details-v1:guest");
  removeFromStorage("profile-details-v1:guest:draft");
  window.localStorage.removeItem("guest-session-v1");
}
