import Dexie, { type Table } from 'dexie';
import type { Note, Tag, TimerPreset, TimerSession, Settings, Task } from '../types';

export class AppDatabase extends Dexie {
  notes!: Table<Note>;
  tags!: Table<Tag>;
  timerPresets!: Table<TimerPreset>;
  timerSessions!: Table<TimerSession>;
  settings!: Table<Settings>;
  tasks!: Table<Task>;

  constructor() {
    super('ProductivityAppDB');

    this.version(5).stores({
      notes: 'id, title, content, *tags, createdAt, updatedAt, reminderDate, reminderTime',
      tags: 'id, name',
      timerPresets: 'id, name',
      timerSessions: 'id, presetId, startTime, endTime, type',
      settings: 'key',
      tasks: 'id, title, description, completed, createdAt, completedAt, scheduledDate, scheduledTime, priority'
    });
  }
}

export const db = new AppDatabase();