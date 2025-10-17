import { Task, Note } from '../types';

export const initialTasks: Task[] = [
  { id: 1, title: 'Complete project proposal', priority: true, dueDate: '2025-10-20', completed: false, tags: ['urgent', 'project'], createdAt: '2025-10-10', reminderNumber: 1, reminderUnit: 'days', active: true },
  { id: 2, title: 'Review code pull requests', priority: false, dueDate: '2025-10-16', completed: false, tags: ['code', 'review'], createdAt: '2025-10-12', reminderNumber: 2, reminderUnit: 'hours', active: true },
  { id: 3, title: 'Grocery shopping', priority: false, dueDate: '2025-10-15', completed: true, tags: ['shopping', 'home'], createdAt: '2025-10-13', active: true },
  { id: 4, title: 'Update documentation', priority: false, dueDate: '2025-10-18', completed: false, tags: ['docs', 'api'], createdAt: '2025-10-11', active: true },
  { id: 5, title: 'Team meeting prep', priority: true, dueDate: '2025-10-17', completed: false, tags: ['meeting', 'presentation'], createdAt: '2025-10-14', reminderNumber: 3, reminderUnit: 'hours', active: true },
  { id: 6, title: 'Gym workout', priority: false, dueDate: '2025-10-15', completed: false, tags: ['fitness', 'exercise'], createdAt: '2025-10-13', active: true },
  { id: 7, title: 'Pay utility bills', priority: true, dueDate: '2025-10-16', completed: false, tags: ['bills', 'payment'], createdAt: '2025-10-12', reminderNumber: 1, reminderUnit: 'days', active: true },
  { id: 8, title: 'Book dentist appointment', priority: false, dueDate: '2025-10-22', completed: false, tags: ['appointment', 'medical'], createdAt: '2025-10-14', active: true },
  { id: 9, title: 'Fix bug in login module', priority: true, dueDate: '2025-10-16', completed: true, tags: ['bug', 'urgent'], createdAt: '2025-10-10', active: true },
  { id: 10, title: 'Plan weekend trip', priority: false, dueDate: '2025-10-19', completed: false, tags: ['travel', 'planning'], createdAt: '2025-10-13', active: true },
  { id: 11, title: 'Call mom', priority: false, dueDate: null, completed: false, tags: ['family', 'call'], createdAt: '2025-10-14', active: true },
  { id: 12, title: 'Database backup', priority: true, dueDate: '2025-10-17', completed: false, tags: ['maintenance', 'backup'], createdAt: '2025-10-11', reminderNumber: 2, reminderUnit: 'weeks', active: true },
  { id: 13, title: 'Read book chapter', priority: false, dueDate: null, completed: false, tags: ['reading', 'learning'], createdAt: '2025-10-12', active: true },
  { id: 14, title: 'Client presentation', priority: true, dueDate: '2025-10-18', completed: false, tags: ['client', 'demo'], createdAt: '2025-10-13', reminderNumber: 30, reminderUnit: 'minutes', active: true },
  { id: 15, title: 'Car maintenance', priority: false, dueDate: '2025-10-21', completed: false, tags: ['car', 'maintenance'], createdAt: '2025-10-14', active: true },
  { id: 16, title: 'Write blog post', priority: false, dueDate: null, completed: false, tags: ['writing', 'blog'], createdAt: '2025-10-13', active: true },
  { id: 17, title: 'Security audit', priority: true, dueDate: '2025-10-19', completed: false, tags: ['security', 'audit'], createdAt: '2025-10-12', reminderNumber: 1, reminderUnit: 'months', active: true },
  { id: 18, title: 'Organize closet', priority: false, dueDate: null, completed: false, tags: ['home', 'organizing'], createdAt: '2025-10-14', active: true },
  { id: 19, title: 'Submit expense report', priority: false, dueDate: '2025-10-17', completed: false, tags: ['finance', 'admin'], createdAt: '2025-10-11', active: true },
  { id: 20, title: 'Learn TypeScript', priority: false, dueDate: '2025-10-22', completed: false, tags: ['learning', 'coding'], createdAt: '2025-10-13', active: true }
];


export const initialNotes: Note[] = [
  { id: 1, content: 'Discussed quarterly goals, budget allocation, and team expansion plans. Action items: finalize hiring timeline, review budget with finance.', topic: 'Q4 Planning Meeting', tags: ['meeting', 'planning'], createdAt: '2025-10-12', updatedAt: '2025-10-12', active: true },
  { id: 2, content: 'Ingredients: pasta, eggs, parmesan, pancetta. Cook pasta, mix eggs with cheese, combine with hot pasta and pancetta.', topic: 'Pasta Carbonara Recipe', tags: ['recipe', 'cooking'], createdAt: '2025-10-10', updatedAt: '2025-10-11', active: true },
  { id: 3, content: 'Mobile task manager with offline support, Real-time collaboration tool, AI-powered note organizer, Habit tracking app with analytics', topic: 'Project Ideas', tags: ['ideas', 'projects'], createdAt: '2025-10-09', updatedAt: '2025-10-13', active: true },
  { id: 4, content: 'Key takeaways: Small changes compound over time, Focus on systems not goals, Make habits obvious and attractive, Track progress consistently', topic: 'Atomic Habits Summary', tags: ['books', 'learning'], createdAt: '2025-10-08', updatedAt: '2025-10-08', active: true },
  { id: 5, content: 'RESTful principles: Use proper HTTP methods, Consistent naming conventions, Version your API, Implement proper error handling, Add rate limiting', topic: 'API Design', tags: ['api', 'development'], createdAt: '2025-10-11', updatedAt: '2025-10-11', active: true },
  { id: 6, content: 'Passport, tickets, hotel confirmation, travel insurance, medications, chargers, camera, comfortable shoes, weather-appropriate clothing', tags: ['travel', 'checklist'], createdAt: '2025-10-13', updatedAt: '2025-10-14', active: true },
  { id: 7, content: 'Client requested: Faster load times, Dark mode option, Export to PDF feature, Mobile app version, Better search functionality', topic: 'Client Feedback', tags: ['feedback', 'client'], createdAt: '2025-10-12', updatedAt: '2025-10-12', active: true },
  { id: 8, content: 'Monday: Chest & Triceps, Tuesday: Back & Biceps, Wednesday: Legs, Thursday: Shoulders, Friday: Full body, Weekend: Cardio & Rest', topic: 'Workout Routine', tags: ['fitness', 'exercise'], createdAt: '2025-10-10', updatedAt: '2025-10-10', active: true },
  { id: 9, content: 'Mom: Gardening tools, Dad: Book collection, Sister: Art supplies, Best friend: Concert tickets, Colleague: Coffee gift set', tags: ['shopping', 'gifts'], createdAt: '2025-10-09', updatedAt: '2025-10-13', active: true },
  { id: 10, content: 'Users table: id, email, password_hash, created_at. Tasks table: id, user_id, title, description, due_date, priority. Notes table: id, user_id, content, topic, tags', topic: 'Database Schema', tags: ['database', 'schema'], createdAt: '2025-10-11', updatedAt: '2025-10-11', active: true },
  { id: 11, content: 'React docs, TypeScript handbook, Node.js best practices, MySQL optimization guide, Tailwind CSS components, Design patterns book', tags: ['learning', 'resources'], createdAt: '2025-10-08', updatedAt: '2025-10-12', active: true },
  { id: 12, content: 'Monthly expenses: Rent $1200, Utilities $150, Groceries $400, Transportation $100, Entertainment $200, Savings goal $500', topic: 'Budget Planning', tags: ['budget', 'planning'], createdAt: '2025-10-13', updatedAt: '2025-10-13', active: true }
];


