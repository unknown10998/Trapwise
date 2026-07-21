import type { ProgressHistory, ProgressRecord } from "@/types/progress";
import { readFromStorage, scopedDataKey, writeToStorage, type DataScope } from "@/lib/storage";

const queueKey = "pending-cloud-sessions-v1";
export function queueProgressForSync(record: ProgressRecord, scope: DataScope = "guest") { const scopedKey = scopedDataKey(scope, queueKey); const queue = readFromStorage<ProgressRecord[]>(scopedKey, []); if (!queue.some((item) => item.sessionId === record.sessionId)) writeToStorage(scopedKey, [...queue, record]); }
export function localImportSummary(history: ProgressHistory) { return { sessions: history.sessions.length, questions: history.sessions.reduce((sum, session) => sum + session.questionsAnswered, 0), highestMastery: Math.max(50, ...history.sessions.map((session) => session.masteryAfter)) }; }
/**
 * Cloud writes are deliberately disabled until a server-side RPC validates the
 * answer history and calculates XP/mastery. Keeping the queue local preserves
 * offline study data without trusting browser-controlled scoring fields.
 */
export async function syncPendingProgress() {
  const queue = readFromStorage<ProgressRecord[]>(scopedDataKey("guest", queueKey), []);
  return { synced: 0, pending: queue.length, secureSyncRequired: true };
}
