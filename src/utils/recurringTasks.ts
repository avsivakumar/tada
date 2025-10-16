import { Task } from '../types';

export const generateNextOccurrence = (task: Task, fromDate?: Date): Task | null => {
  if (!task.isRecurring || !task.recurrencePattern) return null;

  // Determine base date for recurring task
  let baseDate: Date;
  if (fromDate) {
    baseDate = fromDate;
  } else if (task.dueDate) {
    baseDate = new Date(task.dueDate);
  } else if (task.lastGeneratedDate) {
    baseDate = new Date(task.lastGeneratedDate);
  } else {
    // For recurring tasks without due date, start from creation date
    baseDate = new Date(task.createdAt);
  }

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
  if (task.reminderNumber && task.reminderUnit && newTask.dueDate) {
    const due = new Date(newTask.dueDate);
    let offsetMs = 0;
    switch (task.reminderUnit) {
      case 'minutes': offsetMs = task.reminderNumber * 60 * 1000; break;
      case 'hours': offsetMs = task.reminderNumber * 60 * 60 * 1000; break;
      case 'days': offsetMs = task.reminderNumber * 24 * 60 * 60 * 1000; break;
      case 'weeks': offsetMs = task.reminderNumber * 7 * 24 * 60 * 60 * 1000; break;
      case 'months': offsetMs = task.reminderNumber * 30 * 24 * 60 * 60 * 1000; break;
    }
    const reminder = new Date(due.getTime() - offsetMs);
    newTask.reminderTime = reminder.toISOString();
  }

  return newTask;
};


export const shouldGenerateNextInstance = (task: Task): boolean => {
  if (!task.isRecurring || !task.recurrencePattern) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Determine the last generated date
  let lastGenerated: Date;
  if (task.lastGeneratedDate) {
    lastGenerated = new Date(task.lastGeneratedDate);
  } else if (task.dueDate) {
    lastGenerated = new Date(task.dueDate);
  } else {
    lastGenerated = new Date(task.createdAt);
  }
  lastGenerated.setHours(0, 0, 0, 0);
  
  // Only generate if the last generated date is today or in the past
  return lastGenerated <= today;
};
