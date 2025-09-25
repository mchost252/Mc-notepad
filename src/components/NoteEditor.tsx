import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import type { ContentBlock } from './RichTextEditor';
import type { Note } from '../types';

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags.join(', ') || '');
  const [attachments, setAttachments] = useState(note?.attachments || []);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [reminderDate, setReminderDate] = useState(note?.reminderDate ? note.reminderDate.toISOString().split('T')[0] : '');
  const [reminderTime, setReminderTime] = useState(note?.reminderTime || '');

  // Convert existing note content and attachments to blocks for RichTextEditor
  const getInitialBlocks = (): ContentBlock[] => {
    if (!note) return [{ id: crypto.randomUUID(), type: 'text' as const, content: '' }];

    const blocks: ContentBlock[] = [];

    // Add text content as first block if it exists
    if (note.content.trim()) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'text' as const,
        content: note.content,
      });
    }

    // Add attachments as blocks
    note.attachments.forEach(attachment => {
      blocks.push({
        id: crypto.randomUUID(),
        type: attachment.type as 'image' | 'audio',
        content: '',
        data: attachment.data,
        filename: attachment.filename,
      });
    });

    // Always add an empty text block at the end for adding new content
    blocks.push({ id: crypto.randomUUID(), type: 'text' as const, content: '' });

    return blocks;
  };

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString());
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const handleSave = () => {
    if (!title.trim() && !content.trim() && attachments.length === 0) return;

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      attachments,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      reminderDate: reminderDate ? new Date(reminderDate) : undefined,
      reminderTime: reminderTime || undefined,
    };

    console.log('Saving note with reminder:', {
      title: noteData.title,
      reminderDate: noteData.reminderDate,
      reminderTime: noteData.reminderTime,
      hasReminder: !!(noteData.reminderDate && noteData.reminderTime)
    });

    onSave(noteData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{currentTime}</span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-white border-none outline-none placeholder-gray-500"
              placeholder="Note title..."
              autoFocus
            />

            {/* Rich Content Editor */}
            <RichTextEditor
              initialContent={getInitialBlocks()}
              onChange={(blocks: any) => {
                // Convert blocks back to content and attachments for saving
                const textBlocks = blocks.filter((b: any) => b.type === 'text');
                const mediaBlocks = blocks.filter((b: any) => b.type !== 'text');

                setContent(textBlocks.map((b: any) => b.content).join('\n\n'));
                setAttachments(mediaBlocks.map((b: any) => ({
                  type: b.type as 'image' | 'audio',
                  data: b.data!,
                  filename: b.filename!,
                })));
              }}
            />

            {/* Tags */}
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-transparent text-gray-400 border-none outline-none placeholder-gray-600"
              placeholder="Tags: daily, work, ideas..."
            />

            {/* Optional Reminder */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Optional Reminder</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              {reminderDate && reminderTime && (
                <p className="text-xs text-gray-500 mt-2">
                  Reminder set for {new Date(reminderDate).toLocaleDateString()} at {reminderTime}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-gray-700">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-medium transition-colors"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;