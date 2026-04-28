import Dexie, { type Table } from 'dexie';
import type { Event } from '../types';
import type { User } from '../types';

interface MetaRecord {
  key: string;
  last_updated: string;
}

export class AppDatabase extends Dexie {
  events!: Table<Event, number>;
  users!: Table<User, number>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super('AppDB');
    this.version(1).stores({
      events: 'id, event_date, type',
      users:  'id, name, email',
      meta:   'key',
    });
  }
}

export const db = new AppDatabase();