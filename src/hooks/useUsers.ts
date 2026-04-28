// src/hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import api from '../api/api';
import type { User } from '../types';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  syncing: boolean;
  error: string;
  refetch: () => void;
  addUserOptimistic: (newUser: User) => Promise<void>;
  deleteUserOptimistic: (userId: number) => Promise<void>;
}

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const sync = useCallback(async () => {
    try {
      // ─── Step 1: Load from IndexedDB instantly ────────────────────────
      const cached = await db.users.toArray();

      if (cached.length > 0) {
        setUsers(cached);
        setLoading(false);
      }

      // ─── Step 2: Check /api/meta for latest timestamp ─────────────────
      setSyncing(true);
      const metaRes = await api.get('/meta', { headers: getAuthHeader() });
      const serverTimestamp: string = metaRes.data.users;

      // ─── Step 3: Compare with locally stored timestamp ────────────────
      const localMeta = await db.meta.get('users');
      const localTimestamp = localMeta?.last_updated;

      if (localTimestamp === serverTimestamp && cached.length > 0) {
        // ✅ Data is fresh — do nothing
        return;
      }

      // ─── Step 4: Timestamps differ — fetch full data ──────────────────
      const res = await api.get('/users', { headers: getAuthHeader() });
      const freshUsers: User[] = res.data;

      // ─── Step 5: Update IndexedDB ──────────────────────────────────────
      await db.transaction('rw', db.users, db.meta, async () => {
        await db.users.clear();
        await db.users.bulkAdd(freshUsers);
        await db.meta.put({ key: 'users', last_updated: serverTimestamp });
      });

      // ─── Step 6: Update UI ─────────────────────────────────────────────
      setUsers(freshUsers);

    } catch (err: unknown) {
      const cached = await db.users.toArray();
      if (cached.length === 0) {
        setError('Failed to load users');
      }
      console.error('Sync error:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  // Full refetch — used after updates where we need the server's version
  const refetch = useCallback(async () => {
    try {
      setSyncing(true);
      const [res, metaRes] = await Promise.all([
        api.get('/users', { headers: getAuthHeader() }),
        api.get('/meta', { headers: getAuthHeader() }),
      ]);

      const freshUsers: User[] = res.data;

      await db.transaction('rw', db.users, db.meta, async () => {
        await db.users.clear();
        await db.users.bulkAdd(freshUsers);
        await db.meta.put({ key: 'users', last_updated: metaRes.data.users });
      });

      setUsers(freshUsers);
    } catch {
      setError('Failed to refresh users');
    } finally {
      setSyncing(false);
    }
  }, []);

  // ─── Optimistic add ────────────────────────────────────────────────────
  const addUserOptimistic = useCallback(async (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
    await db.users.put(newUser);
    refetch();
  }, [refetch]);

  // ─── Optimistic delete ─────────────────────────────────────────────────
  const deleteUserOptimistic = useCallback(async (userId: number) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    await db.users.delete(userId);
    refetch();
  }, [refetch]);

  return {
    users,
    loading,
    syncing,
    error,
    refetch,
    addUserOptimistic,
    deleteUserOptimistic,
  };
}