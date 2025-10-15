import React from 'react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onDelete: (id: number) => void;
  onClick: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3 border-l-4 border-teal-500 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1 cursor-pointer" onClick={() => onClick(note)}>
          <h3 className="font-semibold text-gray-900 mb-2">{note.title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{note.content}</p>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
              {note.category}
            </span>
            {note.tags.map((tag, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
            <span className="text-xs text-gray-400 ml-auto">
              {new Date(note.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(note.id)}
          className="text-red-500 hover:text-red-700 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
