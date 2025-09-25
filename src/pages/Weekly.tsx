import React, { useState } from 'react';
import { useNotes } from '../hooks/useNotes';

const Weekly: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { allNotes, loading } = useNotes();

  // Get notes for the selected week
  const getWeekNotes = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return allNotes.filter(note => {
      const noteDate = new Date(note.createdAt);
      return noteDate >= startOfWeek && noteDate <= endOfWeek;
    });
  };

  const weekNotes = getWeekNotes(selectedDate);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-400 text-center py-12">Loading weekly calendar...</div>
      </div>
    );
  }


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Weekly Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-gray-800 text-white border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Calendar</h3>
            <p className="text-gray-400">Calendar component temporarily disabled</p>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Reset to Today
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Week of {selectedDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h2>

          {weekNotes.length === 0 ? (
            <p className="text-gray-400">No notes for this week</p>
          ) : (
            <div className="space-y-3">
              {weekNotes.map(note => (
                <div key={note.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h3 className="font-semibold text-white">{note.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    {note.content.slice(0, 100) + (note.content.length > 100 ? '...' : '')}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tag => (
                        <span key={tag} className="bg-gray-700 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Weekly;