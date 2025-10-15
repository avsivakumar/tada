import Dexie, { Table } from 'dexie';
import { Task, Note } from '../types';
import { initialTasks, initialNotes } from './mockData';

// IndexedDB database using Dexie
class TadaDatabase extends Dexie {
  tasks!: Table<Task, number>;
  notes!: Table<Note, number>;

  constructor() {
    super('TadaDB');
    this.version(1).stores({
      tasks: '++id, title, status, priority, dueDate, category, createdAt',
      notes: '++id, title, category, createdAt, updatedAt'
    });
  }
}

const dexieDb = new TadaDatabase();

class DatabaseService {
  private connected: boolean = false;

  async connect(): Promise<boolean> {
    try {
      // Check if database is empty and seed with initial data
      const taskCount = await dexieDb.tasks.count();
      const noteCount = await dexieDb.notes.count();
      
      if (taskCount === 0) {
        await dexieDb.tasks.bulkAdd(initialTasks);
      }
      if (noteCount === 0) {
        await dexieDb.notes.bulkAdd(initialNotes);
      }
      
      this.connected = true;
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }

  async getTasks(): Promise<Task[]> {
    return await dexieDb.tasks.toArray();
  }

  async getNotes(): Promise<Note[]> {
    return await dexieDb.notes.toArray();
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
    await dexieDb.tasks.delete(id);
    return true;
  }

  async deleteNote(id: number): Promise<boolean> {
    await dexieDb.notes.delete(id);
    return true;
  }

  async searchTasks(query: string): Promise<Task[]> {
    const q = query.toLowerCase();
    return await dexieDb.tasks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    ).toArray();
  }

  async searchNotes(query: string): Promise<Note[]> {
    const q = query.toLowerCase();
    return await dexieDb.notes.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q) ||
      n.tags.some(tag => tag.toLowerCase().includes(q))
    ).toArray();
  }
}

export const db = new DatabaseService();
