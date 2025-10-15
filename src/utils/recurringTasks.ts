import { Task } from '../types';

export const generateNextOccurrence = (task: Task, fromDate?: Date): Task | null => {
  if (!task.isRecurring || !task.recurrencePattern) return null;

  const baseDate = fromDate || new Date(task.dueDate);
  const nextDate = new Date(baseDate);

  switch (task.recurrencePattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }

  // Check if we've passed the end date
  if (task.recurrenceEndDate && nextDate > new Date(task.recurrenceEndDate)) {
    return null;
  }

  // Create new task instance
  const newTask: Task = {
    ...task,
    id: Date.now() + Math.random(), // Temporary ID
    dueDate: nextDate.toISOString().split('T')[0],
    completed: false,
    parentTaskId: task.id,
    isRecurring: false, // Instances are not recurring themselves
    createdAt: new Date().toISOString().split('T')[0],
  };

  // Update reminder time if it exists
  if (task.reminderOffset && newTask.dueDate) {
    const due = new Date(newTask.dueDate);
    const reminder = new Date(due.getTime() - task.reminderOffset * 60000);
    newTask.reminderTime = reminder.toISOString();
  }

  return newTask;
};

export const shouldGenerateInstances = (task: Task): boolean => {
  if (!task.isRecurring || !task.recurrencePattern) return false;
  
  const now = new Date();
  const lastGenerated = task.lastGeneratedDate ? new Date(task.lastGeneratedDate) : new Date(task.dueDate);
  const daysAhead = 30; // Generate instances up to 30 days ahead
  const generateUntil = new Date(now);
  generateUntil.setDate(generateUntil.getDate() + daysAhead);

  return lastGenerated < generateUntil;
};
