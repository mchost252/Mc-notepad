import React, { useEffect, useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useNotifications } from '../hooks/useNotifications';
import { db } from '../utils/db';
import type { Note } from '../types';

const NotificationManager: React.FC = () => {
  const { tasks } = useTasks();
  const { scheduleUpcomingTaskNotifications, scheduleNoteReminders, scheduleHourlyReminders } = useNotifications();
  const [allNotes, setAllNotes] = useState<Note[]>([]);

  // Load notes directly from database
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const notes = await db.notes.toArray();
        setAllNotes(notes);
      } catch (error) {
        console.error('Failed to load notes in NotificationManager:', error);
      }
    };

    loadNotes();

    // Set up periodic refresh to check for new notes
    const interval = setInterval(loadNotes, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Schedule all notifications when component mounts or data changes
  useEffect(() => {
    if (tasks.length > 0) {
      scheduleUpcomingTaskNotifications(tasks);
      scheduleHourlyReminders(tasks);
    }
  }, [tasks, scheduleUpcomingTaskNotifications, scheduleHourlyReminders]);

  useEffect(() => {
    if (allNotes.length > 0) {
      scheduleNoteReminders(allNotes);
    }
  }, [allNotes, scheduleNoteReminders]);

  // This component doesn't render anything, it just manages notifications
  return null;
};

export default NotificationManager;