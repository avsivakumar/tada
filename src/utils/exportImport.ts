import { Task, Note } from '../types';

export const exportToJSON = (tasks: Task[], notes: Note[]) => {
  const data = {
    tasks,
    notes,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadFile(blob, `tada-backup-${new Date().toISOString().split('T')[0]}.json`);
};

const csvEscape = (value: unknown): string => {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

export const exportToCSV = (tasks: Task[], notes: Note[]) => {
  const taskHeaders = [
    'ID',
    'Title',
    'Priority',
    'Due Date',
    'Due Time',
    'Completed',
    'Completion Date',
    'Created At',
    'Tags',
    'Active',
    'Is Recurring',
    'Recurrence Pattern'
  ];

  const taskRows = tasks.map(t => [
    t.id,
    csvEscape(t.title),
    t.priority ? 'High' : 'Normal',
    csvEscape(t.dueDate ?? ''),
    csvEscape(t.dueTime ?? ''),
    t.completed ? 'Yes' : 'No',
    csvEscape(t.completionDate ?? ''),
    csvEscape(t.createdAt),
    csvEscape((t.tags || []).join(', ')),
    t.active === false ? 'No' : 'Yes',
    t.isRecurring ? 'Yes' : 'No',
    csvEscape(t.recurrencePattern ?? '')
  ]);

  const taskCSV = [taskHeaders, ...taskRows].map(row => row.join(',')).join('\n');

  const noteHeaders = [
    'ID',
    'Content',
    'Topic',
    'Tags',
    'Created At',
    'Updated At',
    'Active'
  ];

  const noteRows = notes.map(n => [
    n.id,
    csvEscape(n.content),
    csvEscape(n.topic ?? ''),
    csvEscape((n.tags || []).join(', ')),
    csvEscape(n.createdAt),
    csvEscape(n.updatedAt),
    n.active === false ? 'No' : 'Yes'
  ]);

  const noteCSV = [noteHeaders, ...noteRows].map(row => row.join(',')).join('\n');

  const combined = `TASKS\n${taskCSV}\n\nNOTES\n${noteCSV}`;
  const blob = new Blob([combined], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `tada-backup-${new Date().toISOString().split('T')[0]}.csv`);
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const importFromJSON = (file: File): Promise<{ tasks: Task[]; notes: Note[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (!data || typeof data !== 'object') {
          reject(new Error('Invalid backup structure'));
          return;
        }

        const tasks = Array.isArray(data.tasks) ? data.tasks : [];
        const notes = Array.isArray(data.notes) ? data.notes : [];

        resolve({ tasks, notes });
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
