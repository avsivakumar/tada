import { Task } from '../types';

export const generateNextOccurrence = (task: Task, fromDate?: Date): Task | null => {
  if (!task.isRecurring || !task.recurrencePattern) return null;

  // Determine base date for recurring task
  let baseDate: Date;
  if (fromDate) {
    baseDate = fromDate;
  } else if (task.lastGeneratedDate) {
    baseDate = new Date(task.lastGeneratedDate);
  } else if (task.dueDate) {
    baseDate = new Date(task.dueDate);
  } else {
    // For new recurring tasks without due date, start from today
    baseDate = new Date();
  }

  const nextDate = new Date(baseDate);

  // If this is the first instance and no lastGeneratedDate, use the base date as-is
  // Otherwise, increment based on pattern
  if (task.lastGeneratedDate || fromDate) {
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
  }

  // Check if we've passed the end date
  if (task.recurrenceEndDate && nextDate > new Date(task.recurrenceEndDate)) {
    return null;
  }

  // Format date for title
  const dateStr = nextDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  // For daily tasks, also add time
  let titleSuffix = dateStr;
  if (task.recurrencePattern === 'daily') {
    const timeStr = nextDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    titleSuffix = `${dateStr} ${timeStr}`;
  }

  // Create new task instance
  const newTask: Task = {
    ...task,
    id: Date.now() + Math.random(), // Temporary ID
    title: `${task.title} - ${titleSuffix}`,
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


export const shouldGenerateNextInstance = (task: Task, existingTasks: Task[]): boolean => {
  if (!task.isRecurring || !task.recurrencePattern) return false;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Determine when the next instance should be scheduled
  let nextScheduledDate: Date;
  
  if (task.lastGeneratedDate) {
    // Calculate next occurrence from last generated date
    nextScheduledDate = new Date(task.lastGeneratedDate);
    
    switch (task.recurrencePattern) {
      case 'daily':
        nextScheduledDate.setDate(nextScheduledDate.getDate() + 1);
        break;
      case 'weekly':
        nextScheduledDate.setDate(nextScheduledDate.getDate() + 7);
        break;
      case 'monthly':
        nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1);
        break;
      case 'yearly':
        nextScheduledDate.setFullYear(nextScheduledDate.getFullYear() + 1);
        break;
    }
  } else {
    // First instance - use due date or today
    if (task.dueDate) {
      nextScheduledDate = new Date(task.dueDate);
    } else {
      // No due date set, use today
      nextScheduledDate = new Date();
    }
  }
  
  nextScheduledDate.setHours(0, 0, 0, 0);
  
  // Only generate if the scheduled date has arrived or passed
  if (nextScheduledDate > now) return false;
  
  // Check if an instance already exists for this date
  const nextDateStr = nextScheduledDate.toISOString().split('T')[0];
  const instanceExists = existingTasks.some(t => 
    t.parentTaskId === task.id && t.dueDate === nextDateStr
  );
  
  // Only generate if no instance exists for this date
  return !instanceExists;
};





