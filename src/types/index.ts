export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  completed: boolean;
  category: string;
  tags: string[];
  createdAt: string;
  reminderTime?: string; // When to show reminder (ISO date string)
  reminderOffset?: number; // Minutes before due date (e.g., 60 for 1 hour, 1440 for 1 day)
  snoozedUntil?: string; // ISO date string for when snoozed reminder should reappear
  isRecurring?: boolean; // Whether this is a recurring task
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'; // How often it repeats
  recurrenceEndDate?: string; // When to stop generating instances
  parentTaskId?: number; // ID of the original recurring task (for generated instances)
  lastGeneratedDate?: string; // Last date an instance was generated (for parent tasks)
}



export interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
}
