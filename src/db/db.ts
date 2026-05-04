import Dexie, { type Table } from 'dexie';
import type { Event, User, Moneybox, MoneyTransaction } from '../types';

interface MetaRecord {
  key: string;
  last_updated: string;
}

export class AppDatabase extends Dexie {
  events!: Table<Event, number>;
  users!: Table<User, number>;
  moneyboxes!: Table<Moneybox, number>;
  moneyTransactions!: Table<MoneyTransaction, number>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super('AppDB');
    this.version(2).stores({
      events:            'id, event_date, type',
      users:             'id, name, email',
      moneyboxes:        'id, section_id',
      moneyTransactions: 'id, moneybox_id, type',
      meta:              'key',
    });
  }
}

export const db = new AppDatabase();