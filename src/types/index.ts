export interface Task {
  id: number;
  title: string;
  priority: boolean; // true = high, false = normal
  dueDate: string | null; // null means pending task without deadline
  dueTime?: string; // Optional time for due date (HH:MM format)
  completed: boolean;
  completionDate?: string; // ISO date string when task was marked complete
  active: boolean; // true = active, false = soft deleted (default: true)

  tags: string[];
  createdAt: string;
  reminderNumber?: number; // Number for reminder (e.g., 2 for "2 hours before")
  reminderUnit?: 'minutes' | 'hours' | 'days' | 'weeks' | 'months'; // Unit for reminder
  reminderTime?: string; // Calculated reminder time (ISO date string)
  snoozedUntil?: string; // ISO date string for when snoozed reminder should reappear
  isRecurring?: boolean; // Whether this is a recurring task
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'hourly'; // How often it repeats
  recurrenceEndDate?: string; // When to stop generating instances
  // Recurrence-specific fields
  recurrenceTime?: string; // Time of day for daily tasks (HH:MM format)
  recurrenceDayOfWeek?: number; // Day of week for weekly tasks (0-6, Sunday-Saturday)
  recurrenceDayOfMonth?: number; // Day of month for monthly tasks (1-31)
  recurrenceMonth?: number; // Month for yearly tasks (1-12)
  recurrenceDayOfYear?: number; // Day for yearly tasks (1-31)
  recurrenceMinute?: number; // Minute of the hour for hourly tasks (0-59)
  parentTaskId?: number; // ID of the original recurring task (for generated instances)
  lastDismissedHour?: string; // ISO timestamp of when hourly reminder was last dismissed
  lastGeneratedDate?: string; // Last date an instance was generated for this recurring task
}





export interface Note {
  id: number;
  content: string;
  topic?: string; // Optional topic field
  tags: string[];
  createdAt: string;
  updatedAt: string;
  active: boolean; // true = active, false = soft deleted (default: true)
}



export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
}
