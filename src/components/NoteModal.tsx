import React, { useState, useEffect } from 'react';
import { Note } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, noteId?: number) => void;
  note?: Note | null;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSave, note }) => {
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setContent(note.content);
        setTopic(note.topic || '');
        setTags(note.tags.join(', '));
      } else {
        setContent('');
        setTopic('');
        setTags('');
      }
    }
  }, [isOpen, note]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      content,
      topic: topic.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      active: true
    }, note?.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note content"
              rows={6}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic (optional)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
