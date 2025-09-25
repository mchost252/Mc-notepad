export interface Note {
  id: string;
  title: string;
  content: string; // Main text content
  attachments: {
    type: 'image' | 'audio';
    data: Blob;
    filename: string;
  }[]; // Multiple attachments
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  reminderDate?: Date;
  reminderTime?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  scheduledDate?: Date;
  scheduledTime?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface TimerPreset {
  id: string;
  name: string;
  workTime: number; // minutes
  breakTime: number; // minutes
}

export interface TimerSession {
  id: string;
  presetId?: string;
  startTime: Date;
  endTime?: Date;
  type: 'work' | 'break';
  duration: number; // minutes
}

export interface Settings {
  key: string;
  value: any;
}

export type CategoryType = 'daily' | 'weekly' | 'projects' | 'all';