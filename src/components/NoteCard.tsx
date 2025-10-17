import React, { useState } from 'react';
import { Note } from '../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NoteCardProps {
  note: Note;
  onDelete: (id: number) => void;
  onClick: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onClick }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(note.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
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
            onClick={handleDeleteClick}
            className="text-red-500 hover:text-red-700 text-xl"
          >
            ×
          </button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{note.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NoteCard;
