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
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState(false);
  const [dueDate, setDueDate] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('');
  const [tags, setTags] = useState('');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderNumber, setReminderNumber] = useState<number>(1);
  const [reminderUnit, setReminderUnit] = useState<'minutes' | 'hours' | 'days' | 'weeks' | 'months'>('hours');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [recurrenceTime, setRecurrenceTime] = useState<string>('09:00');
  const [recurrenceDayOfWeek, setRecurrenceDayOfWeek] = useState<number>(1);
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<number>(1);
  const [recurrenceMonth, setRecurrenceMonth] = useState<number>(1);
  const [recurrenceDayOfYear, setRecurrenceDayOfYear] = useState<number>(1);



  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setCompleted(task.completed);
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setDueTime(task.dueTime || '');
      setTags(task.tags.join(', '));
      setHasReminder(task.reminderNumber ? task.reminderNumber > 0 : false);
      setReminderNumber(task.reminderNumber || 1);
      setReminderUnit(task.reminderUnit || 'hours');
      setIsRecurring(task.isRecurring || false);
      setRecurrencePattern(task.recurrencePattern || 'weekly');
      setRecurrenceEndDate(task.recurrenceEndDate || '');
      setRecurrenceTime(task.recurrenceTime || '09:00');
      setRecurrenceDayOfWeek(task.recurrenceDayOfWeek ?? 1);
      setRecurrenceDayOfMonth(task.recurrenceDayOfMonth ?? 1);
      setRecurrenceMonth(task.recurrenceMonth ?? 1);
      setRecurrenceDayOfYear(task.recurrenceDayOfYear ?? 1);


    } else if (isOpen && !task) {
      setTitle('');
      setCompleted(false);
      setPriority(false);

      if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        setDueDate(`${year}-${month}-${day}`);
      } else {
        setDueDate('');
      }
      setTags('');
      setHasReminder(false);
      setReminderNumber(1);
      setReminderUnit('hours');
      setIsRecurring(false);
      setRecurrencePattern('weekly');
      setRecurrenceEndDate('');
    }
  }, [isOpen, task, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let reminderTime: string | undefined;
    if (dueDate && hasReminder && reminderNumber > 0) {
      const due = new Date(dueDate);
      let offsetMs = 0;
      switch (reminderUnit) {
        case 'minutes': offsetMs = reminderNumber * 60 * 1000; break;
        case 'hours': offsetMs = reminderNumber * 60 * 60 * 1000; break;
        case 'days': offsetMs = reminderNumber * 24 * 60 * 60 * 1000; break;
        case 'weeks': offsetMs = reminderNumber * 7 * 24 * 60 * 60 * 1000; break;
        case 'months': offsetMs = reminderNumber * 30 * 24 * 60 * 60 * 1000; break;
      }
      const reminder = new Date(due.getTime() - offsetMs);
      reminderTime = reminder.toISOString();
    }

    // Set completionDate if task is being marked as completed
    const completionDate = completed && !task?.completed ? new Date().toISOString().split('T')[0] : task?.completionDate;

    onSave({
      title,
      priority,
      dueDate: dueDate || null,
      dueTime: dueTime || undefined,
      completed,
      completionDate,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      reminderNumber: hasReminder && reminderNumber > 0 ? reminderNumber : undefined,
      reminderUnit: hasReminder && reminderNumber > 0 ? reminderUnit : undefined,
      reminderTime,
      snoozedUntil: task?.snoozedUntil,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate : undefined,
      recurrenceTime: isRecurring ? recurrenceTime : undefined,
      recurrenceDayOfWeek: isRecurring && recurrencePattern === 'weekly' ? recurrenceDayOfWeek : undefined,
      recurrenceDayOfMonth: isRecurring && recurrencePattern === 'monthly' ? recurrenceDayOfMonth : undefined,
      recurrenceMonth: isRecurring && recurrencePattern === 'yearly' ? recurrenceMonth : undefined,
      recurrenceDayOfYear: isRecurring && recurrencePattern === 'yearly' ? recurrenceDayOfYear : undefined,
      lastGeneratedDate: task?.lastGeneratedDate,
      parentTaskId: task?.parentTaskId,
      active: true,
    }, task?.id);



    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title" required
                  className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-teal-500" />
              </div>

              {task && (
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-200 whitespace-nowrap">
                  <input type="checkbox" checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="w-5 h-5 text-teal-600 rounded" />
                  <span className="font-semibold text-gray-700">Mark as Completed</span>
                </label>
              )}
            </div>

            {task && completed && task.completionDate && (
              <div className="text-sm text-gray-600 bg-green-50 p-2 rounded border border-green-200">
                Completed on: {new Date(task.completionDate).toLocaleDateString()} at {new Date(task.completionDate).toLocaleTimeString()}
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={priority}
                onChange={(e) => setPriority(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded" />
              <span className="font-semibold text-gray-700">High Priority</span>
            </label>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <div className="flex gap-2">
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  disabled={isRecurring}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500" />
                <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)}
                  disabled={isRecurring}
                  className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isRecurring ? 'Due date is disabled for recurring tasks' : 'Time is optional'}
              </p>
            </div>



            
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 mb-3">
                <input type="checkbox" checked={isRecurring}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsRecurring(checked);
                    if (checked) {
                      setDueDate('');
                      setDueTime('');
                    }
                  }}
                  className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-gray-700">Recurring Task</span>
              </label>

              
              {isRecurring && (
                <div className="space-y-3 pl-6">
                  <select value={recurrencePattern}
                    onChange={(e) => setRecurrencePattern(e.target.value as any)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  
                  {recurrencePattern === 'daily' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time of Day</label>
                      <input type="time" value={recurrenceTime}
                        onChange={(e) => setRecurrenceTime(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
                    </div>
                  )}

                  {recurrencePattern === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                      <select value={recurrenceDayOfWeek}
                        onChange={(e) => setRecurrenceDayOfWeek(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
                        <option value={0}>Sunday</option>
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                      </select>
                    </div>
                  )}

                  {recurrencePattern === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
                      <input type="number" min="1" max="31" value={recurrenceDayOfMonth}
                        onChange={(e) => setRecurrenceDayOfMonth(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
                    </div>
                  )}

                  {recurrencePattern === 'yearly' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                        <select value={recurrenceMonth}
                          onChange={(e) => setRecurrenceMonth(Number(e.target.value))}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
                          <option value={1}>January</option>
                          <option value={2}>February</option>
                          <option value={3}>March</option>
                          <option value={4}>April</option>
                          <option value={5}>May</option>
                          <option value={6}>June</option>
                          <option value={7}>July</option>
                          <option value={8}>August</option>
                          <option value={9}>September</option>
                          <option value={10}>October</option>
                          <option value={11}>November</option>
                          <option value={12}>December</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                        <input type="number" min="1" max="31" value={recurrenceDayOfYear}
                          onChange={(e) => setRecurrenceDayOfYear(Number(e.target.value))}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
                      </div>
                    </div>
                  )}
                  
                  <input type="date" value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    placeholder="End date (optional)"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
                  <p className="text-xs text-gray-500">Leave end date empty for indefinite recurrence</p>
                </div>
              )}

            </div>

            {(dueDate || isRecurring) && (
              <div className="border-t pt-4">
                <label className="flex items-center gap-2 mb-3">
                  <input type="checkbox" checked={hasReminder}
                    onChange={(e) => setHasReminder(e.target.checked)}
                    className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold text-gray-700">Remind Me</span>
                </label>
                
                {hasReminder && (
                  <div className="space-y-2 pl-6">
                    <div className="flex gap-2">
                      <input type="number" min="1" value={reminderNumber}
                        onChange={(e) => setReminderNumber(Number(e.target.value))}
                        className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
                      <select value={reminderUnit}
                        onChange={(e) => setReminderUnit(e.target.value as any)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500">
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">
                      {dueDate ? 'Remind me before due date' : 'Reminder will apply to each occurrence'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />

            <div className="flex gap-3 pt-2">
              <button type="submit" 
                className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">Save</button>
              <button type="button" onClick={onClose} 
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;