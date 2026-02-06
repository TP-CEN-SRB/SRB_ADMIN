// lib/guidance-store.ts

export interface GuidanceSession {
  binId: string;
  bins: string[];                    // ordered list of materials
  images: Record<string, string>;    // material -> image URL
  currentIndex: number;              // which step user is on
  updatedAt: number;                 // last activity timestamp
}

// In-memory store (safe for demo / MP scope)
const sessions = new Map<string, GuidanceSession>();

/**
 * Create or overwrite a guidance session.
 * Called once when multi-detect starts.
 */
export function upsertGuidanceSession(session: GuidanceSession): void {
  sessions.set(session.binId, session);
}

/**
 * Get an active guidance session for a bin.
 */
export function getGuidanceSession(
  binId: string
): GuidanceSession | undefined {
  return sessions.get(binId);
}

/**
 * Advance to the next material in the session.
 * Returns the updated session or undefined if finished.
 */
export function advanceGuidanceStep(
  binId: string
): GuidanceSession | undefined {
  const session = sessions.get(binId);
  if (!session) return undefined;

  const nextIndex = session.currentIndex + 1;

  if (nextIndex >= session.bins.length) {
    // Session complete
    sessions.delete(binId);
    return undefined;
  }

  const updated: GuidanceSession = {
    ...session,
    currentIndex: nextIndex,
    updatedAt: Date.now(),
  };

  sessions.set(binId, updated);
  return updated;
}

/**
 * Explicitly end a session (e.g. timeout / cancel).
 */
export function clearGuidanceSession(binId: string): void {
  sessions.delete(binId);
}

/**
 * Optional cleanup helper (not required, but safe)
 * Removes sessions inactive for X ms.
 */
export function cleanupExpiredSessions(
  maxAgeMs: number = 5 * 60 * 1000 // 5 minutes
): void {
  const now = Date.now();

    sessions.forEach((session, binId) => {
    if (now - session.updatedAt > maxAgeMs) {
        sessions.delete(binId);
    }
    });
}
