import React from 'react';
import { FileText, Image, Mic, Trash2, Edit } from 'lucide-react';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  const getIcon = () => {
    if (note.attachments.length > 0) {
      const firstAttachment = note.attachments[0];
      return firstAttachment.type === 'image' ? <Image className="w-4 h-4" /> : <Mic className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const getPreview = () => {
    return note.content.slice(0, 100) + (note.content.length > 100 ? '...' : '');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <h3 className="font-semibold text-white">{note.title}</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(note)}
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-2">{getPreview()}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex flex-wrap gap-1">
          {note.tags.map(tag => (
            <span key={tag} className="bg-gray-700 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        <span>{note.createdAt.toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default NoteCard;