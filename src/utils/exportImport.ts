import { Task, Note } from '../types';

export const exportToJSON = (tasks: Task[], notes: Note[]) => {
  const data = {
    tasks,
    notes,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadFile(blob, `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`);
};

export const exportToCSV = (tasks: Task[], notes: Note[]) => {
  // Export tasks
  const taskHeaders = ['ID', 'Title', 'Description', 'Priority', 'Category', 'Due Date', 'Completed', 'Created At'];
  const taskRows = tasks.map(t => [
    t.id,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.description.replace(/"/g, '""')}"`,
    t.priority,
    t.category,
    t.dueDate,
    t.completed,
    t.createdAt
  ]);
  const taskCSV = [taskHeaders, ...taskRows].map(row => row.join(',')).join('\n');
  
  // Export notes
  const noteHeaders = ['ID', 'Title', 'Content', 'Category', 'Tags', 'Created At', 'Updated At'];
  const noteRows = notes.map(n => [
    n.id,
    `"${n.title.replace(/"/g, '""')}"`,
    `"${n.content.replace(/"/g, '""')}"`,
    n.category,
    `"${n.tags.join(', ')}"`,
    n.createdAt,
    n.updatedAt
  ]);
  const noteCSV = [noteHeaders, ...noteRows].map(row => row.join(',')).join('\n');
  
  const combined = `TASKS\n${taskCSV}\n\nNOTES\n${noteCSV}`;
  const blob = new Blob([combined], { type: 'text/csv' });
  downloadFile(blob, `taskflow-backup-${new Date().toISOString().split('T')[0]}.csv`);
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<{ tasks: Task[], notes: Note[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve({ tasks: data.tasks || [], notes: data.notes || [] });
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
