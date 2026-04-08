import { get, set, del } from 'idb-keyval';
import { useCallback } from 'react';

const SESSION_KEY = 'uteach_active_session';

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  extractedText: string;
  timestamp: number;
}

export interface SessionData {
  transcript: string;
  currentStep: number;
  format: string;
  lastUpdated: number;
  supportingDocs?: UploadedDocument[];
}

export const usePersistence = () => {
  const saveSession = useCallback(async (data: SessionData) => {
    try {
      await set(SESSION_KEY, data);
    } catch (err) {
      console.error('Failed to save session to IndexedDB', err);
    }
  }, []);

  const loadSession = useCallback(async (): Promise<SessionData | null> => {
    try {
      const data = await get(SESSION_KEY);
      return data ?? null;
    } catch (err) {
      console.error('Failed to load session from IndexedDB', err);
      return null;
    }
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await del(SESSION_KEY);
    } catch (err) {
      console.error('Failed to clear session from IndexedDB', err);
    }
  }, []);

  return { saveSession, loadSession, clearSession };
};
