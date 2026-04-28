// src/hooks/useEvents.ts
import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import api from '../api/api';
import type { Event } from '../types';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  syncing: boolean;
  error: string;
  refetch: () => void;
  addEventOptimistic: (newEvent: Event) => Promise<void>;
  deleteEventOptimistic: (eventId: number) => Promise<void>;
  updateEventOptimistic: (updatedEvent: Event) => Promise<void>;
}

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

const sortByDate = (arr: Event[]) =>
  [...arr].sort(
    (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  );

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const sync = useCallback(async () => {
    try {
      // ─── Step 1: Load from IndexedDB instantly ────────────────────────
      const cached = await db.events.toArray();

      if (cached.length > 0) {
        setEvents(sortByDate(cached));
        setLoading(false); // UI is ready — user sees data immediately
      }

      // ─── Step 2: Check /api/meta for latest timestamp ─────────────────
      setSyncing(true);
      const metaRes = await api.get('/meta', { headers: getAuthHeader() });
      const serverTimestamp: string = metaRes.data.events;

      // ─── Step 3: Compare with locally stored timestamp ────────────────
      const localMeta = await db.meta.get('events');
      const localTimestamp = localMeta?.last_updated;

      if (localTimestamp === serverTimestamp && cached.length > 0) {
        // ✅ Data is fresh — do nothing
        return;
      }

      // ─── Step 4: Timestamps differ — fetch full data ──────────────────
      const res = await api.get('/events', { headers: getAuthHeader() });
      const freshEvents: Event[] = res.data;

      // ─── Step 5: Update IndexedDB ──────────────────────────────────────
      await db.transaction('rw', db.events, db.meta, async () => {
        await db.events.clear();
        await db.events.bulkAdd(freshEvents);
        await db.meta.put({ key: 'events', last_updated: serverTimestamp });
      });

      // ─── Step 6: Update UI ─────────────────────────────────────────────
      setEvents(sortByDate(freshEvents));

    } catch (err: unknown) {
      const cached = await db.events.toArray();
      if (cached.length === 0) {
        setError('Failed to load events');
      }
      console.error('Sync error:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    sync();
  }, [sync]);

  // Full refetch — used after updates where we need the server's version
  const refetch = useCallback(async () => {
    try {
      setSyncing(true);
      const [res, metaRes] = await Promise.all([
        api.get('/events', { headers: getAuthHeader() }),
        api.get('/meta', { headers: getAuthHeader() }),
      ]);

      const freshEvents: Event[] = res.data;

      await db.transaction('rw', db.events, db.meta, async () => {
        await db.events.clear();
        await db.events.bulkAdd(freshEvents);
        await db.meta.put({ key: 'events', last_updated: metaRes.data.events });
      });

      setEvents(sortByDate(freshEvents));
    } catch {
      setError('Failed to refresh events');
    } finally {
      setSyncing(false);
    }
  }, []);

  // ─── Optimistic add ────────────────────────────────────────────────────
  // 1. Add to UI instantly
  // 2. Add to IndexedDB instantly
  // 3. Background refetch to get server's version (with updated_at etc.)
  const addEventOptimistic = useCallback(async (newEvent: Event) => {
    // Instant UI update
    setEvents(prev => sortByDate([newEvent, ...prev]));

    // Instant IndexedDB update
    await db.events.put(newEvent);

    // Background sync to get the real server version
    refetch();
  }, [refetch]);

  // ─── Optimistic delete ─────────────────────────────────────────────────
  // 1. Remove from UI instantly
  // 2. Remove from IndexedDB instantly
  // 3. Background refetch to confirm with server
  const deleteEventOptimistic = useCallback(async (eventId: number) => {
    // Instant UI update
    setEvents(prev => prev.filter(e => e.id !== eventId));

    // Instant IndexedDB update
    await db.events.delete(eventId);

    // Background sync
    refetch();
  }, [refetch]);

  // ─── Optimistic update ─────────────────────────────────────────────────
  const updateEventOptimistic = useCallback(async (updatedEvent: Event) => {
    setEvents(prev =>
      sortByDate(prev.map(e => e.id === updatedEvent.id ? updatedEvent : e))
    );
    await db.events.put(updatedEvent);
  }, []);

  return {
    events,
    loading,
    syncing,
    error,
    refetch,
    addEventOptimistic,
    deleteEventOptimistic,
    updateEventOptimistic,
  };
}