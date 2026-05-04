import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import api from '../api/api';
import type { Moneybox, MoneyTransaction } from '../types';

interface UseMoneyboxesReturn {
  moneyboxes: Moneybox[];
  transactions: MoneyTransaction[];
  loading: boolean;
  syncing: boolean;
  error: string;
  refetch: () => void;
}

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

export function useMoneyboxes(): UseMoneyboxesReturn {
  const [moneyboxes, setMoneyboxes] = useState<Moneybox[]>([]);
  const [transactions, setTransactions] = useState<MoneyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const sync = useCallback(async () => {
    try {
      // ─── Step 1: Load from IndexedDB instantly ────────────────────────
      const cachedBoxes = await db.moneyboxes.toArray();
      const cachedTxns  = await db.moneyTransactions.toArray();

      if (cachedBoxes.length > 0) {
        setMoneyboxes(cachedBoxes);
        setTransactions(cachedTxns);
        setLoading(false);
      }

      // ─── Step 2: Always fetch fresh from server ───────────────────────
      setSyncing(true);
      const [boxRes, txnRes] = await Promise.all([
        api.get('/moneyboxes',   { headers: getAuthHeader() }),
        api.get('/transactions', { headers: getAuthHeader() }),
      ]);

      const freshBoxes: Moneybox[]        = boxRes.data;
      const freshTxns: MoneyTransaction[] = txnRes.data;

      // ─── Step 3: Update IndexedDB ──────────────────────────────────────
      await db.transaction('rw', db.moneyboxes, db.moneyTransactions, async () => {
        await db.moneyboxes.clear();
        await db.moneyboxes.bulkAdd(freshBoxes);
        await db.moneyTransactions.clear();
        await db.moneyTransactions.bulkAdd(freshTxns);
      });

      setMoneyboxes(freshBoxes);
      setTransactions(freshTxns);

    } catch (err: unknown) {
      console.error('Moneybox sync error:', err);
      const cached = await db.moneyboxes.toArray().catch(() => []);
      if (cached.length === 0) {
        setError('Failed to load moneyboxes');
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  const refetch = useCallback(async () => {
    try {
      setSyncing(true);
      const [boxRes, txnRes] = await Promise.all([
        api.get('/moneyboxes',   { headers: getAuthHeader() }),
        api.get('/transactions', { headers: getAuthHeader() }),
      ]);

      const freshBoxes: Moneybox[]        = boxRes.data;
      const freshTxns: MoneyTransaction[] = txnRes.data;

      await db.transaction('rw', db.moneyboxes, db.moneyTransactions, async () => {
        await db.moneyboxes.clear();
        await db.moneyboxes.bulkAdd(freshBoxes);
        await db.moneyTransactions.clear();
        await db.moneyTransactions.bulkAdd(freshTxns);
      });

      setMoneyboxes(freshBoxes);
      setTransactions(freshTxns);
    } catch {
      setError('Failed to refresh moneyboxes');
    } finally {
      setSyncing(false);
    }
  }, []);

  return { moneyboxes, transactions, loading, syncing, error, refetch };
}