import Dexie, { Table } from 'dexie';
import { Task, Note } from '../types';

// IndexedDB database using Dexie
class TadaDatabase extends Dexie {
  tasks!: Table<Task, number>;
  notes!: Table<Note, number>;

  constructor() {
    super('TadaDB');
    // Version 4: Added active field for soft delete
    this.version(4).stores({
      tasks: '++id, title, priority, dueDate, completed, completionDate, createdAt, reminderNumber, reminderUnit, reminderTime, isRecurring, active',
      notes: '++id, title, category, createdAt, updatedAt, active'
    }).upgrade(tx => {
      // Set active=true for all existing records
      return tx.table('tasks').toCollection().modify(task => {
        if (task.active === undefined) task.active = true;
      }).then(() => {
        return tx.table('notes').toCollection().modify(note => {
          if (note.active === undefined) note.active = true;
        });
      });
    });
  }



}

const dexieDb = new TadaDatabase();

class DatabaseService {
  private connected: boolean = false;

  async connect(): Promise<boolean> {
    try {
      // Database starts empty - no mock data
      this.connected = true;
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }


  async getTasks(): Promise<Task[]> {
    const tasks = await dexieDb.tasks.toArray();
    return tasks.filter(t => t.active !== false); // Only return active tasks
  }

  async getNotes(): Promise<Note[]> {
    const notes = await dexieDb.notes.toArray();
    return notes.filter(n => n.active !== false); // Only return active notes
  }


  async addTask(task: Omit<Task, 'id'>): Promise<Task> {
    const id = await dexieDb.tasks.add(task as Task);
    return { ...task, id } as Task;
  }

  async addNote(note: Omit<Note, 'id'>): Promise<Note> {
    const id = await dexieDb.notes.add(note as Note);
    return { ...note, id } as Note;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | null> {
    await dexieDb.tasks.update(id, updates);
    return await dexieDb.tasks.get(id) || null;
  }

  async updateNote(id: number, updates: Partial<Note>): Promise<Note | null> {
    const updatedData = { ...updates, updatedAt: new Date().toISOString().split('T')[0] };
    await dexieDb.notes.update(id, updatedData);
    return await dexieDb.notes.get(id) || null;
  }

  async deleteTask(id: number): Promise<boolean> {
    // Soft delete: set active to false instead of removing from DB
    await dexieDb.tasks.update(id, { active: false });
    return true;
  }

  async deleteNote(id: number): Promise<boolean> {
    // Soft delete: set active to false instead of removing from DB
    await dexieDb.notes.update(id, { active: false });
    return true;
  }


  async searchTasks(query: string): Promise<Task[]> {
    const q = query.toLowerCase();
    return await dexieDb.tasks.filter(t => 
      t.active !== false && (
        t.title.toLowerCase().includes(q) || 
        t.tags.some(tag => tag.toLowerCase().includes(q))
      )
    ).toArray();
  }

  async searchNotes(query: string): Promise<Note[]> {
    const q = query.toLowerCase();
    return await dexieDb.notes.filter(n => 
      n.active !== false && (
        n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q) ||
        n.tags.some(tag => tag.toLowerCase().includes(q))
      )
    ).toArray();
  }

}

export const db = new DatabaseService();
