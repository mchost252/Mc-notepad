import { useState, useEffect } from 'react';
import { db } from '../utils/db';
import type { Task } from '../types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const allTasks = await db.tasks.toArray();
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (title: string) => {
    try {
      const id = crypto.randomUUID();
      const newTask: Task = {
        id,
        title,
        completed: false,
        createdAt: new Date(),
      };
      await db.tasks.add(newTask);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const completed = !task.completed;
      const completedAt = completed ? new Date() : undefined;

      await db.tasks.update(id, { completed, completedAt });
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, completed, completedAt } : t
      ));
    } catch (error) {
      console.error('Failed to toggle task:', error);
      throw error;
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      await db.tasks.update(updatedTask.id, updatedTask);
      setTasks(prev => prev.map(t =>
        t.id === updatedTask.id ? updatedTask : t
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await db.tasks.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const clearCompletedTasks = async () => {
    try {
      const completedTasks = tasks.filter(task => task.completed);
      if (completedTasks.length === 0) return;

      // Delete all completed tasks from database
      const completedIds = completedTasks.map(task => task.id);
      await db.tasks.where('id').anyOf(completedIds).delete();

      // Update local state
      setTasks(prev => prev.filter(task => !task.completed));
    } catch (error) {
      console.error('Failed to clear completed tasks:', error);
      throw error;
    }
  };

  const getTodayTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(task => {
      // Use scheduledDate if available, otherwise use createdAt
      const taskDate = task.scheduledDate ? new Date(task.scheduledDate) : new Date(task.createdAt);
      taskDate.setHours(0, 0, 0, 0); // Normalize to start of day
      return taskDate >= today && taskDate < tomorrow;
    });
  };

  const getCompletedTodayCount = () => {
    return getTodayTasks().filter(task => task.completed).length;
  };

  const getTotalTodayCount = () => {
    return getTodayTasks().length;
  };

  return {
    tasks,
    loading,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    clearCompletedTasks,
    getTodayTasks,
    getCompletedTodayCount,
    getTotalTodayCount,
    refreshTasks: loadTasks,
  };
};