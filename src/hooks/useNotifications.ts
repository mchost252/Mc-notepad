import { useEffect, useRef } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export const useNotifications = () => {
  const intervalRef = useRef<number | null>(null);
  const upcomingTaskCheckRef = useRef<number | null>(null);
  const noteReminderCheckRef = useRef<number | null>(null);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window) {
      console.log('Notification permission status:', Notification.permission);
      if (Notification.permission === 'default') {
        console.log('Requesting notification permission...');
        Notification.requestPermission().then(permission => {
          console.log('Notification permission result:', permission);
        });
      }
    } else {
      console.log('Notifications not supported in this browser');
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (upcomingTaskCheckRef.current) clearInterval(upcomingTaskCheckRef.current);
      if (noteReminderCheckRef.current) clearInterval(noteReminderCheckRef.current);
    };
  }, []);

  const showNotification = (options: NotificationOptions) => {
    console.log('showNotification called with permission:', Notification.permission);
    if ('Notification' in window && Notification.permission === 'granted') {
      console.log('Creating notification:', options.title);
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        tag: options.tag,
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } else {
      console.log('Notification permission not granted or not supported');
    }
  };

  const scheduleUpcomingTaskNotifications = (tasks: any[]) => {
    if (upcomingTaskCheckRef.current) clearInterval(upcomingTaskCheckRef.current);

    // Check every 5 minutes for upcoming tasks
    upcomingTaskCheckRef.current = setInterval(() => {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

      tasks.forEach(task => {
        if (task.scheduledDate && task.scheduledTime && !task.completed) {
          const taskDateTime = new Date(task.scheduledDate);
          const [hours, minutes] = task.scheduledTime.split(':');
          taskDateTime.setHours(parseInt(hours), parseInt(minutes));

          // Notify if task is within next hour and not already notified
          if (taskDateTime > now && taskDateTime <= inOneHour) {
            const timeUntil = Math.round((taskDateTime.getTime() - now.getTime()) / (1000 * 60));
            showNotification({
              title: 'Upcoming Task',
              body: `"${task.title}" is due in ${timeUntil} minutes`,
              tag: `upcoming-${task.id}`,
            });
          }
        }
      });
    }, 5 * 60 * 1000); // Check every 5 minutes
  };

  const scheduleNoteReminders = (notes: any[]) => {
    console.log('scheduleNoteReminders called with', notes.length, 'notes');
    if (noteReminderCheckRef.current) clearInterval(noteReminderCheckRef.current);

    // Check every minute for upcoming note reminders
    noteReminderCheckRef.current = setInterval(() => {
      const now = new Date();

      notes.forEach(note => {
        if (note.reminderDate && note.reminderTime) {
          try {
            // Handle both Date objects and strings
            const reminderDateTime = new Date(note.reminderDate);
            const [hours, minutes] = note.reminderTime.split(':');
            reminderDateTime.setHours(parseInt(hours), parseInt(minutes));

            // Check if reminder is due within the next 10 minutes and hasn't passed
            const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

            if (reminderDateTime > now && reminderDateTime <= tenMinutesFromNow) {
              showNotification({
                title: 'Note Reminder',
                body: `"${note.title}" - ${note.content.slice(0, 50)}${note.content.length > 50 ? '...' : ''}`,
                tag: `note-reminder-${note.id}`,
              });
            }
          } catch (error) {
            console.error('Error parsing reminder time:', error, note);
          }
        }
      });
    }, 60 * 1000); // Check every minute
  };

  const scheduleHourlyReminders = (tasks: any[]) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Check every hour for incomplete tasks due today
    intervalRef.current = setInterval(() => {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const incompleteTodayTasks = tasks.filter(task => {
        if (task.completed) return false;

        const taskDate = task.scheduledDate ? new Date(task.scheduledDate) : new Date(task.createdAt);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate >= today && taskDate < tomorrow;
      });

      if (incompleteTodayTasks.length > 0) {
        const taskList = incompleteTodayTasks.map(t => `• ${t.title}`).join('\n');
        showNotification({
          title: 'Task Reminder',
          body: `You have ${incompleteTodayTasks.length} incomplete task(s) for today:\n${taskList}`,
          tag: 'hourly-reminder',
        });
      }
    }, 60 * 60 * 1000); // Every hour
  };

  const stopAllNotifications = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (upcomingTaskCheckRef.current) {
      clearInterval(upcomingTaskCheckRef.current);
      upcomingTaskCheckRef.current = null;
    }
    if (noteReminderCheckRef.current) {
      clearInterval(noteReminderCheckRef.current);
      noteReminderCheckRef.current = null;
    }
  };

  return {
    showNotification,
    scheduleUpcomingTaskNotifications,
    scheduleNoteReminders,
    scheduleHourlyReminders,
    stopAllNotifications,
  };
};