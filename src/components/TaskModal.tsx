import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>, taskId?: number) => void;
  task?: Task | null;
  selectedDate?: Date | null;
}


const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, selectedDate }) => {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Work');
  const [tags, setTags] = useState('');
  const [reminderOffset, setReminderOffset] = useState<number | ''>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');


  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setCategory(task.category);
      setTags(task.tags.join(', '));
      setReminderOffset(task.reminderOffset || '');
      setIsRecurring(task.isRecurring || false);
      setRecurrencePattern(task.recurrencePattern || 'weekly');
      setRecurrenceEndDate(task.recurrenceEndDate || '');
    } else if (isOpen && !task) {
      // New task - check if date was selected from calendar
      setTitle('');
      setDescription('');
      setPriority('medium');
      if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        setDueDate(`${year}-${month}-${day}`);
      } else {
        setDueDate('');
      }
      setCategory('Work');
      setTags('');
      setReminderOffset('');
      setIsRecurring(false);
      setRecurrencePattern('weekly');
      setRecurrenceEndDate('');
    }
  }, [isOpen, task, selectedDate]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let reminderTime: string | undefined;
    if (dueDate && reminderOffset) {
      const due = new Date(dueDate);
      const reminder = new Date(due.getTime() - (reminderOffset as number) * 60000);
      reminderTime = reminder.toISOString();
    }

    onSave({
      title,
      description,
      priority,
      dueDate,
      completed: task?.completed || false,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      reminderOffset: reminderOffset || undefined,
      reminderTime,
      snoozedUntil: task?.snoozedUntil,
      isRecurring: isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate : undefined,
      lastGeneratedDate: task?.lastGeneratedDate,
      parentTaskId: task?.parentTaskId,
    }, task?.id);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Description" rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
            <select value={priority} onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
            <select value={reminderOffset} onChange={(e) => setReminderOffset(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
              <option value="">No Reminder</option>
              <option value="15">15 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
              <option value="10080">1 week before</option>
            </select>
            
            {/* Recurring Task Section */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-teal-600"
                />
                <span className="font-semibold text-gray-700">Recurring Task</span>
              </label>
              
              {isRecurring && (
                <div className="space-y-3 pl-6">
                  <select
                    value={recurrencePattern}
                    onChange={(e) => setRecurrencePattern(e.target.value as any)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    placeholder="End date (optional)"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500">Leave end date empty for indefinite recurrence</p>
                </div>
              )}
            </div>
            
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
              placeholder="Category" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">Save</button>
              <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
