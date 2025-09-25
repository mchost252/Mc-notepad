import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { db } from '../utils/db';
import type { Note } from '../types';

export const useNotes = (searchQuery = '') => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fuse = useMemo(() => {
    return new Fuse(allNotes, {
      keys: ['title', 'content', 'tags'],
      threshold: 0.3,
    });
  }, [allNotes]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }
    const results = fuse.search(searchQuery);
    return results.map(result => result.item);
  }, [notes, searchQuery, fuse]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const allNotes = await db.notes.toArray();
      setAllNotes(allNotes);
      setNotes(allNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = crypto.randomUUID();
      const newNote: Note = {
        ...note,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.notes.add(newNote);
      setNotes(prev => [...prev, newNote]);
      return newNote;
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      await db.notes.update(id, { ...updates, updatedAt: new Date() });
      setNotes(prev => prev.map(note =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
      ));
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await db.notes.delete(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  return {
    notes: filteredNotes,
    allNotes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    refreshNotes: loadNotes,
  };
};