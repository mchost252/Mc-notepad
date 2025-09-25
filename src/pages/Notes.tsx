import React, { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import type { Note } from '../types';

type TabType = 'daily' | 'weekly' | 'projects';

const Notes: React.FC = () => {
  const { allNotes, loading, addNote, updateNote, deleteNote } = useNotes();
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();

  const handleAddNote = () => {
    setEditingNote(undefined);
    setShowEditor(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, noteData);
      } else {
        await addNote(noteData);
      }


      setShowEditor(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const getFilteredNotes = () => {
    const now = new Date();

    switch (activeTab) {
      case 'daily':
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return allNotes.filter(note => {
          const noteDate = new Date(note.createdAt);
          return noteDate >= today && noteDate < tomorrow;
        });

      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        return allNotes.filter(note => {
          const noteDate = new Date(note.createdAt);
          return noteDate >= weekStart && noteDate < weekEnd;
        });

      case 'projects':
        // Group by tags that start with "project-"
        const projectNotes: { [key: string]: Note[] } = {};

        allNotes.forEach(note => {
          note.tags.forEach(tag => {
            if (tag.startsWith('project-')) {
              if (!projectNotes[tag]) {
                projectNotes[tag] = [];
              }
              projectNotes[tag].push(note);
            }
          });
        });

        // Return all notes that belong to projects
        return Object.values(projectNotes).flat();

      default:
        return allNotes;
    }
  };

  const filteredNotes = getFilteredNotes();

  if (loading) {
    return (
      <div className="text-gray-400 text-center py-12">Loading notes...</div>
    );
  }

  const tabs = [
    { id: 'daily' as TabType, label: 'Daily' },
    { id: 'weekly' as TabType, label: 'Weekly' },
    { id: 'projects' as TabType, label: 'Projects' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notes</h1>
        <button
          onClick={handleAddNote}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
        >
          Add Note
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-gray-400 text-center py-12">
          {activeTab === 'daily' && 'No notes for today. Add your first daily note!'}
          {activeTab === 'weekly' && 'No notes this week. Your weekly notes will appear here.'}
          {activeTab === 'projects' && 'No project notes yet. Tag notes with "project-*" to organize them here.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}

      {showEditor && (
        <NoteEditor
          note={editingNote}
          onSave={handleSaveNote}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default Notes;