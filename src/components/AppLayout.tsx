import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AuthScreen } from './AuthScreen';
import { Task, Note } from '../types';
import { db } from '../utils/database';
import { exportToJSON, exportToCSV, importFromJSON } from '../utils/exportImport';
import { generateNextOccurrence, shouldGenerateNextInstance } from '../utils/recurringTasks';
import TaskCard from './TaskCard';
import NoteCard from './NoteCard';
import SearchBar from './SearchBar';
import TaskModal from './TaskModal';
import NoteModal from './NoteModal';
import StatsCard from './StatsCard';
import TaskFilters from './TaskFilters';
import NotificationPanel from './NotificationPanel';
import CalendarView from './CalendarView';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';




const AppLayout: React.FC = () => {
  const { isAuthenticated, setIsAuthenticated, logout } = useAppContext();


  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'notes' | 'search' | 'calendar'>('dashboard');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [selectedStatView, setSelectedStatView] = useState<'due' | 'urgent' | 'pending' | 'completedToday'>('due');


  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatchAll, setSearchMatchAll] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [taskFilters, setTaskFilters] = useState<{
    priority: string[];
    status: string[];
  }>({ priority: [], status: [] });

  // New filters for recurring tasks and date range
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);
  const getDefaultDateFrom = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // 30 days back
    return date.toISOString().split('T')[0];
  };
  const [dateFrom, setDateFrom] = useState<string | null>(getDefaultDateFrom());
  const [dateTo, setDateTo] = useState<string | null>(new Date().toISOString().split('T')[0]);
  
  
  // Keywords filter for tasks
  const [keywords, setKeywords] = useState('');
  const [keywordMatchType, setKeywordMatchType] = useState<'any' | 'all'>('any');

  // Notes filters
  const [dateFromNotes, setDateFromNotes] = useState<string | null>(getDefaultDateFrom());
  const [dateToNotes, setDateToNotes] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [keywordsNotes, setKeywordsNotes] = useState('');
  const [keywordMatchTypeNotes, setKeywordMatchTypeNotes] = useState<'any' | 'all'>('any');

  // Pagination state
  const [duePage, setDuePage] = useState(1);
  const [urgentPage, setUrgentPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [completedTodayPage, setCompletedTodayPage] = useState(1);
  const [tasksPage, setTasksPage] = useState(1);
  const [notesPage, setNotesPage] = useState(1);
  const [searchTasksPage, setSearchTasksPage] = useState(1);
  const [searchNotesPage, setSearchNotesPage] = useState(1);
  const itemsPerPage = 10;






  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dueReminders, setDueReminders] = useState<Task[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isGeneratingRef = useRef(false);




  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      // Split search query by commas and trim each term
      const searchTerms = searchQuery.toLowerCase().split(',').map(t => t.trim()).filter(t => t.length > 0);
      
      // Filter tasks
      const tasksFiltered = tasks.filter(task => {
        const taskTitle = task.title.toLowerCase();
        const taskTags = (task.tags || []).map(tag => tag.toLowerCase()).join(' ');
        const taskContent = `${taskTitle} ${taskTags}`;
        
        if (searchMatchAll) {
          // All terms must match
          return searchTerms.every(term => taskContent.includes(term));
        } else {
          // Any term must match
          return searchTerms.some(term => taskContent.includes(term));
        }
      });
      
      // Filter notes
      const notesFiltered = notes.filter(note => {
        const noteTopic = (note.topic || '').toLowerCase();
        const noteContent = note.content.toLowerCase();
        const noteTags = (note.tags || []).map(tag => tag.toLowerCase()).join(' ');
        const noteText = `${noteTopic} ${noteContent} ${noteTags}`;
        
        if (searchMatchAll) {
          // All terms must match
          return searchTerms.every(term => noteText.includes(term));
        } else {
          // Any term must match
          return searchTerms.some(term => noteText.includes(term));
        }
      });
      
      setFilteredTasks(tasksFiltered);
      setFilteredNotes(notesFiltered);
    } else {
      setFilteredTasks(tasks);
      setFilteredNotes(notes);
    }
  }, [searchQuery, searchMatchAll, tasks, notes]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as Element).closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  // Check for due reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Check regular task reminders
      const regularReminders = tasks.filter(task => {
        if (task.completed || !task.reminderTime) return false;
        const reminderTime = new Date(task.reminderTime);
        const snoozedUntil = task.snoozedUntil ? new Date(task.snoozedUntil) : null;
        
        // Only show if currently snoozed and snooze time has passed
        if (snoozedUntil && snoozedUntil > now) return false;
        
        // Check if reminder time is within the current minute window
        // This prevents showing reminders from the past and ensures they fire at the right time
        const reminderMinute = reminderTime.getMinutes();
        const reminderHour = reminderTime.getHours();
        const reminderDate = reminderTime.toDateString();
        const currentDate = now.toDateString();
        
        // Only show if:
        // 1. Reminder date is today or earlier
        // 2. If reminder date is today, check if we're at or past the reminder hour/minute
        if (reminderDate > currentDate) return false; // Future date
        
        if (reminderDate === currentDate) {
          // Same day - check hour and minute
          if (reminderHour > currentHour) return false; // Future hour today
          if (reminderHour === currentHour && reminderMinute > currentMinute) return false; // Future minute this hour
        }
        
        // Check if this reminder was already shown (dismissed without snooze)
        // For regular reminders, once dismissed, they're cleared, so this is handled by reminderTime being undefined
        
        return true;
      });
      
      // Check hourly recurring tasks
      const hourlyReminders = tasks.filter(task => {
        if (task.completed || !task.isRecurring || task.recurrencePattern !== 'hourly') return false;
        
        // Determine the scheduled minute for this task
        let scheduledMinute = task.recurrenceMinute;
        
        // If no recurrenceMinute is set, derive it from dueTime or createdAt
        if (scheduledMinute === undefined || scheduledMinute === null) {
          if (task.dueTime) {
            // Use the minute from dueTime
            const [hours, minutes] = task.dueTime.split(':').map(Number);
            scheduledMinute = minutes;
          } else {
            // Use the minute from createdAt timestamp
            // This ensures the reminder fires at the same minute it was created
            const createdDate = new Date(task.createdAt);
            scheduledMinute = createdDate.getMinutes();
          }
        }
        
        // Only fire if current minute matches scheduled minute (within a 1-minute window)
        if (currentMinute !== scheduledMinute) return false;
        
        // Check if task has a dueDate/dueTime - don't fire before it
        if (task.dueDate) {
          const dueDateTime = new Date(task.dueDate);
          if (task.dueTime) {
            const [hours, minutes] = task.dueTime.split(':').map(Number);
            dueDateTime.setHours(hours, minutes, 0, 0);
          } else {
            dueDateTime.setHours(0, 0, 0, 0);
          }
          
          // Don't fire if we haven't reached the due date/time yet
          if (now < dueDateTime) return false;
        }
        
        // Check if this reminder was already dismissed in the current hour
        if (task.lastDismissedHour) {
          const lastDismissed = new Date(task.lastDismissedHour);
          const lastDismissedHour = lastDismissed.getHours();
          const lastDismissedDate = lastDismissed.toDateString();
          const currentDate = now.toDateString();
          
          // Skip if dismissed in the current hour of the current day
          if (lastDismissedDate === currentDate && lastDismissedHour === currentHour) {
            return false;
          }
        }
        
        // Check if within recurrence end date
        if (task.recurrenceEndDate) {
          const endDate = new Date(task.recurrenceEndDate);
          if (now > endDate) return false;
        }
        
        return true;
      });
      
      // Combine both types of reminders
      const allReminders = [...regularReminders, ...hourlyReminders];
      setDueReminders(allReminders);
    };

    // Initial check after a short delay to avoid showing reminders immediately on task creation
    const initialTimeout = setTimeout(checkReminders, 2000); // 2 second delay on mount
    
    // Then check every minute
    const interval = setInterval(checkReminders, 60000); // Check every minute
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [tasks]);





  // Generate instances in background when dashboard loads
  useEffect(() => {
    const generateRecurringInstances = async () => {
      // Prevent concurrent generation
      if (isGeneratingRef.current) return;
      isGeneratingRef.current = true;

      try {
        // Get fresh tasks from database
        const allTasks = await db.getTasks();
        
        // Only generate instances for active (not completed) recurring tasks
        const recurringTasks = allTasks.filter(t => t.isRecurring && !t.completed);
        
        let hasGenerated = false;
        for (const task of recurringTasks) {
          // Check if it's time to generate the next instance
          if (shouldGenerateNextInstance(task, allTasks)) {
            const nextInstance = generateNextOccurrence(task);
            
            if (nextInstance) {
              await db.addTask(nextInstance);
              await db.updateTask(task.id, { 
                lastGeneratedDate: nextInstance.dueDate 
              });
              hasGenerated = true;
            }
          }
        }
        
        // Only reload if we actually generated something
        if (hasGenerated) {
          await loadData();
        }
      } finally {
        isGeneratingRef.current = false;
      }
    };

    // Run once on mount (when dashboard loads)
    generateRecurringInstances();
    
    // Also check every hour if new instances need to be generated
    const interval = setInterval(generateRecurringInstances, 3600000); // Every hour

    return () => {
      clearInterval(interval);
    };
  }, []); // Empty dependency array - runs only on mount





  // Refresh data when returning to dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadData();
    }
  }, [activeTab]);

  // Reset pagination when switching between stat views
  useEffect(() => {
    setDuePage(1);
    setUrgentPage(1);
    setPendingPage(1);
    setCompletedTodayPage(1);
  }, [selectedStatView]);

  // Reset tasks page when filters change
  useEffect(() => {
    setTasksPage(1);
  }, [taskFilters, showRecurringOnly, dateFrom, dateTo, keywords, keywordMatchType]);

  // Reset notes page when filters change
  useEffect(() => {
    setNotesPage(1);
  }, [dateFromNotes, dateToNotes, keywordsNotes, keywordMatchTypeNotes]);









  const loadData = async () => {
    await db.connect();
    const loadedTasks = await db.getTasks();
    const loadedNotes = await db.getNotes();
    setTasks(loadedTasks);
    setNotes(loadedNotes);
  };


  const handleToggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      // Prevent toggling recurring task templates - only instances can be completed
      const isRecurringTemplate = task.isRecurring && !task.parentTaskId;
      if (isRecurringTemplate) {
        return; // Do nothing for recurring templates
      }
      
      const newCompletedState = !task.completed;
      const now = new Date();
      const updateData: Partial<Task> = { 
        completed: newCompletedState,
        completionDate: newCompletedState ? now.toISOString().split('T')[0] : undefined,
        completionTime: newCompletedState ? now.toISOString() : undefined
      };

      
      await db.updateTask(id, updateData);
      await loadData();
    }
  };




  const handleDeleteTask = async (id: number) => {
    await db.deleteTask(id);
    await loadData();
  };

  const handleDeleteNote = async (id: number) => {
    await db.deleteNote(id);
    await loadData();
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt'>, taskId?: number) => {
    if (taskId) {
      // Update existing task
      await db.updateTask(taskId, taskData);
    } else {
      // Create new task
      await db.addTask({ ...taskData, createdAt: new Date().toISOString().split('T')[0] });
    }
    setSelectedTask(null);
    await loadData();
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsNoteModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleCloseNoteModal = () => {
    setIsNoteModalOpen(false);
    setSelectedNote(null);
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, noteId?: number) => {
    const now = new Date().toISOString().split('T')[0];
    if (noteId) {
      // Update existing note
      await db.updateNote(noteId, noteData);
    } else {
      // Create new note
      await db.addNote({ ...noteData, createdAt: now, updatedAt: now });
    }
    setSelectedNote(null);
    await loadData();
  };


  const handleFilterChange = (filterType: string, value: string) => {
    setTaskFilters(prev => {
      const current = prev[filterType as keyof typeof prev];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterType]: updated };
    });
  };

  const getFilteredTasks = () => {
    const filtered = tasks.filter(task => {
      // Apply priority filter
      if (taskFilters.priority.length > 0) {
        const taskPriorityStr = task.priority ? 'high' : 'normal';
        if (!taskFilters.priority.includes(taskPriorityStr)) return false;
      }
      
      // Apply status filter
      if (taskFilters.status.length > 0) {
        const isCompleted = task.completed;
        if (!taskFilters.status.includes(isCompleted ? 'completed' : 'pending')) return false;
      }
      
      // Apply recurring tasks filter
      if (showRecurringOnly) {
        // Show both recurring templates AND their instances
        const isRecurringTemplate = task.isRecurring && !task.parentTaskId;
        const isRecurringInstance = !task.isRecurring && task.parentTaskId;
        if (!isRecurringTemplate && !isRecurringInstance) return false;
      }
      // When NOT showing recurring only, show ALL tasks (templates, instances, and non-recurring)



      
      // Apply date range filter based on createdAt
      if (dateFrom && task.createdAt < dateFrom) {
        return false;
      }
      if (dateTo && task.createdAt > dateTo) {
        return false;
      }
      
      // Apply keywords filter - search in both tags and title
      if (keywords.trim()) {
        const keywordList = keywords.toLowerCase().split(',').map(k => k.trim()).filter(k => k.length > 0);
        const taskTags = (task.tags || []).map(tag => tag.toLowerCase());
        const taskTitle = task.title.toLowerCase();
        
        if (keywordMatchType === 'all') {
          // All keywords must match at least one tag OR the title
          if (!keywordList.every(keyword => 
            taskTags.some(tag => tag.includes(keyword)) || taskTitle.includes(keyword)
          )) {
            return false;
          }
        } else {
          // Any keyword must match at least one tag OR the title
          if (!keywordList.some(keyword => 
            taskTags.some(tag => tag.includes(keyword)) || taskTitle.includes(keyword)
          )) {
            return false;
          }
        }
      }


      
      return true;
    });

    // Sort: tasks with due date by due date ascending, tasks without due date by creation date ascending
    return filtered.sort((a, b) => {
      // Both have due dates - sort by due date ascending
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      // Only a has due date - a comes first
      if (a.dueDate && !b.dueDate) return -1;
      // Only b has due date - b comes first
      if (!a.dueDate && b.dueDate) return 1;
      // Neither has due date - sort by creation date ascending
      return a.createdAt.localeCompare(b.createdAt);
    });
  };


  // Filter notes based on date range and keywords
  const getFilteredNotes = () => {
    const filtered = notes.filter(note => {
      // Apply date range filter based on createdAt
      if (dateFromNotes && note.createdAt < dateFromNotes) {
        return false;
      }
      if (dateToNotes && note.createdAt > dateToNotes) {
        return false;
      }
      
      // Apply keywords filter - search in tags, topic, and content
      if (keywordsNotes.trim()) {
        const keywordList = keywordsNotes.toLowerCase().split(',').map(k => k.trim()).filter(k => k.length > 0);
        const noteTags = (note.tags || []).map(tag => tag.toLowerCase());
        const noteTopic = (note.topic || '').toLowerCase();
        const noteContent = note.content.toLowerCase();
        
        if (keywordMatchTypeNotes === 'all') {
          // All keywords must match at least one of: tag, topic, or content
          if (!keywordList.every(keyword => 
            noteTags.some(tag => tag.includes(keyword)) || 
            noteTopic.includes(keyword) || 
            noteContent.includes(keyword)
          )) {
            return false;
          }
        } else {
          // Any keyword must match at least one of: tag, topic, or content
          if (!keywordList.some(keyword => 
            noteTags.some(tag => tag.includes(keyword)) || 
            noteTopic.includes(keyword) || 
            noteContent.includes(keyword)
          )) {
            return false;
          }
        }
      }
      
      return true;
    });

    // Sort by creation date descending (newest first)
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  };




  const handleExportJSON = () => {
    exportToJSON(tasks, notes);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    exportToCSV(tasks, notes);
    setShowExportMenu(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setShowExportMenu(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { tasks: importedTasks, notes: importedNotes } = await importFromJSON(file);
      
      // Add imported data to database
      for (const task of importedTasks) {
        await db.addTask(task);
      }
      for (const note of importedNotes) {
        await db.addNote(note);
      }
      
      await loadData();
      alert(`Successfully imported ${importedTasks.length} tasks and ${importedNotes.length} notes!`);
    } catch (error) {
      alert('Failed to import data. Please check the file format.');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSnoozeReminder = async (taskId: number, minutes: number) => {
    const snoozeUntil = new Date(Date.now() + minutes * 60000).toISOString();
    await db.updateTask(taskId, { snoozedUntil: snoozeUntil });
    await loadData();
  };

  const handleDismissReminder = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    
    // For hourly recurring tasks, just mark the current hour as dismissed
    if (task?.isRecurring && task.recurrencePattern === 'hourly') {
      await db.updateTask(taskId, { lastDismissedHour: new Date().toISOString() });
    } else {
      // For regular reminders, clear the reminder fields
      await db.updateTask(taskId, { reminderTime: undefined, reminderOffset: undefined });
    }
    
    await loadData();
  };


  const handleTaskReschedule = async (taskId: number, newDate: string) => {
    await db.updateTask(taskId, { dueDate: newDate });
    await loadData();
  };


  const handleCalendarDateClick = (date: Date) => {
    setSelectedCalendarDate(date);
    setIsTaskModalOpen(true);
  };

  // When modal closes, reset selected calendar date
  useEffect(() => {
    if (!isTaskModalOpen) {
      setSelectedCalendarDate(null);
    }
  }, [isTaskModalOpen]);

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  
  // Tasks Due: only count incomplete tasks with due date <= today, exclude recurring templates
  const tasksDue = tasks.filter(t => {
    // Exclude recurring templates (show only instances)
    const isRecurringTemplate = t.isRecurring && !t.parentTaskId;
    if (isRecurringTemplate) return false;
    
    if (!t.dueDate || t.dueDate > today) return false;
    return !t.completed; // Exclude all completed tasks
  }).length;
  
  // Urgent Tasks: exclude recurring templates
  const urgentTasks = tasks.filter(t => {
    const isRecurringTemplate = t.isRecurring && !t.parentTaskId;
    if (isRecurringTemplate) return false;
    return t.priority === true && !t.completed;
  }).length;
  
  // Pending Work: exclude recurring templates
  const pendingWork = tasks.filter(t => {
    const isRecurringTemplate = t.isRecurring && !t.parentTaskId;
    if (isRecurringTemplate) return false;
    return !t.dueDate && !t.completed;
  }).length;

  // Completed Today: exclude recurring templates
  const completedToday = tasks.filter(t => {
    const isRecurringTemplate = t.isRecurring && !t.parentTaskId;
    if (isRecurringTemplate) return false;
    return t.completed && t.completionDate === today;
  }).length;






  // Get tasks to display based on selected stat view
  // Get tasks to display based on selected stat view
  const getDisplayTasks = () => {
    let filteredTasks: Task[] = [];
    
    if (selectedStatView === 'due') {
      // Show only incomplete tasks with due date <= today, exclude recurring templates
      filteredTasks = tasks.filter(t => {
        // Exclude recurring templates (show only instances)
        const isRecurringTemplate = t.isRecurring && !t.parentTaskId;
        if (isRecurringTemplate) return false;
        
        if (!t.dueDate || t.dueDate > today) return false;
        return !t.completed; // Exclude all completed tasks
      });
    } else if (selectedStatView === 'urgent') {
      // Exclude recurring templates from urgent tasks
      filteredTasks = tasks.filter(t => {
        const isRecurringTemplate = t.isRecurring && !t.parentTaskId;
        if (isRecurringTemplate) return false;
        return t.priority === true && !t.completed;
      });
    } else if (selectedStatView === 'pending') {
      // Exclude recurring templates from pending work
      filteredTasks = tasks.filter(t => {
        const isRecurringTemplate = t.isRecurring && !t.parentTaskId;
        if (isRecurringTemplate) return false;
        return !t.dueDate && !t.completed;
      });
    } else if (selectedStatView === 'completedToday') {
      // Exclude recurring templates from completed today
      filteredTasks = tasks.filter(t => {
        const isRecurringTemplate = t.isRecurring && !t.parentTaskId;
        if (isRecurringTemplate) return false;
        return t.completed && t.completionDate === today;
      });
    }

    
    // Sort: tasks with due date by due date ascending, tasks without due date by creation date ascending
    return filteredTasks.sort((a, b) => {
      // Both have due dates - sort by due date ascending
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      // Only a has due date - a comes first
      if (a.dueDate && !b.dueDate) return -1;
      // Only b has due date - b comes first
      if (!a.dueDate && b.dueDate) return 1;
      // Neither has due date - sort by creation date ascending
      return a.createdAt.localeCompare(b.createdAt);
    });
  };





  const displayTasks = getDisplayTasks();

  // Pagination helper function
  const paginateArray = <T,>(array: T[], page: number): T[] => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return array.slice(startIndex, endIndex);
  };

  // Render pagination controls
  const renderPagination = (totalItems: number, currentPage: number, onPageChange: (page: number) => void) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {pages.map((page, idx) => (
            <PaginationItem key={idx}>
              {page === '...' ? (
                <span className="px-4 py-2">...</span>
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };


  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-teal-700 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tada</h1>
              <p className="text-blue-100">Manage tasks and notes efficiently</p>

            </div>
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <span className="text-2xl">🔔</span>
                {dueReminders.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {dueReminders.length}
                  </span>
                )}
              </button>

              <div className="relative export-menu-container">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors h-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span className="text-sm font-semibold">Backup</span>
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                    <button
                      onClick={handleExportJSON}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>📄</span>
                      <span>Export JSON</span>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>📊</span>
                      <span>Export CSV</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleImportClick}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>📤</span>
                      <span>Import Data</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors h-10"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span className="text-sm font-semibold">Logout</span>
              </button>

            </div>
          </div>
        </div>
      </header>


      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />



      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 pb-24">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              <button
                onClick={() => setSelectedStatView('due')}
                className={`text-left ${selectedStatView === 'due' ? 'ring-2 ring-teal-500' : ''}`}
              >
                <StatsCard title="Tasks Due" value={tasksDue} icon="📅" color="bg-orange-600" />
              </button>
              <button
                onClick={() => setSelectedStatView('urgent')}
                className={`text-left ${selectedStatView === 'urgent' ? 'ring-2 ring-teal-500' : ''}`}
              >
                <StatsCard title="Urgent Tasks" value={urgentTasks} icon="🔥" color="bg-red-600" />

              </button>
              <button
                onClick={() => setSelectedStatView('pending')}
                className={`text-left ${selectedStatView === 'pending' ? 'ring-2 ring-teal-500' : ''}`}
              >
                <StatsCard title="Pending Work" value={pendingWork} icon="📋" color="bg-blue-600" />
              </button>
              <button
                onClick={() => setSelectedStatView('completedToday')}
                className={`text-left ${selectedStatView === 'completedToday' ? 'ring-2 ring-teal-500' : ''}`}
              >
                <StatsCard title="Completed Today" value={completedToday} icon="✅" color="bg-green-600" />
              </button>
            </div>


            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-teal-600 text-white py-4 rounded-lg shadow-md hover:bg-teal-700 font-semibold"
              >
                + New Task
              </button>
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="bg-blue-600 text-white py-4 rounded-lg shadow-md hover:bg-blue-700 font-semibold"
              >
                + New Note
              </button>
            </div>

            {/* Task List Based on Selected Stat */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {selectedStatView === 'due' && 'Tasks Due'}
                {selectedStatView === 'urgent' && 'Urgent Tasks'}
                {selectedStatView === 'pending' && 'Pending Work'}
                {selectedStatView === 'completedToday' && 'Tasks Completed Today'}
              </h3>

              {displayTasks.length > 0 ? (
                <>
                  {selectedStatView === 'due' && (
                    <>
                      {paginateArray(displayTasks, duePage).map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={handleToggleTask}
                          onDelete={handleDeleteTask}
                          onClick={handleTaskClick}
                        />
                      ))}
                      {renderPagination(displayTasks.length, duePage, setDuePage)}
                    </>
                  )}
                  {selectedStatView === 'urgent' && (
                    <>
                      {paginateArray(displayTasks, urgentPage).map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={handleToggleTask}
                          onDelete={handleDeleteTask}
                          onClick={handleTaskClick}
                        />
                      ))}
                      {renderPagination(displayTasks.length, urgentPage, setUrgentPage)}
                    </>
                  )}
                  {selectedStatView === 'pending' && (
                    <>
                      {paginateArray(displayTasks, pendingPage).map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={handleToggleTask}
                          onDelete={handleDeleteTask}
                          onClick={handleTaskClick}
                        />
                      ))}
                      {renderPagination(displayTasks.length, pendingPage, setPendingPage)}
                    </>
                  )}
                  {selectedStatView === 'completedToday' && (
                    <>
                      {paginateArray(displayTasks, completedTodayPage).map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={handleToggleTask}
                          onDelete={handleDeleteTask}
                          onClick={handleTaskClick}
                        />
                      ))}
                      {renderPagination(displayTasks.length, completedTodayPage, setCompletedTodayPage)}
                    </>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">No tasks to display</p>
              )}
            </div>

          </div>
        )}


        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">All Tasks</h2>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
              >
                + Add
              </button>
            </div>
            
            <TaskFilters
              activeFilters={taskFilters}
              showRecurringOnly={showRecurringOnly}
              dateFrom={dateFrom}
              dateTo={dateTo}
              keywords={keywords}
              keywordMatchType={keywordMatchType}
              onFilterChange={handleFilterChange}
              onRecurringToggle={() => setShowRecurringOnly(!showRecurringOnly)}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onKeywordsChange={setKeywords}
              onKeywordMatchTypeToggle={() => setKeywordMatchType(prev => prev === 'any' ? 'all' : 'any')}
            />




            {paginateArray(getFilteredTasks(), tasksPage).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onClick={handleTaskClick}
              />
            ))}
            {renderPagination(getFilteredTasks().length, tasksPage, setTasksPage)}

          </div>
        )}



        {activeTab === 'notes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">All Notes</h2>
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Add
              </button>
            </div>
            
            {/* Notes Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Date Range (Creation Date)</p>
                  <div className="flex gap-3 items-center flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">From:</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={dateFromNotes || ''}
                          onChange={(e) => setDateFromNotes(e.target.value || null)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        />
                        {dateFromNotes && (
                          <button
                            onClick={() => setDateFromNotes(null)}
                            className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">To:</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={dateToNotes || ''}
                          onChange={(e) => setDateToNotes(e.target.value || null)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        />
                        {dateToNotes && (
                          <button
                            onClick={() => setDateToNotes(null)}
                            className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Keywords (comma-separated, press Enter)</p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={keywordsNotes}
                      onChange={(e) => setKeywordsNotes(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                      placeholder="e.g., meeting, planning"
                      className="text-sm border border-gray-300 rounded px-3 py-1 w-96"
                    />
                    <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={keywordMatchTypeNotes === 'all'}
                        onChange={() => setKeywordMatchTypeNotes(prev => prev === 'any' ? 'all' : 'any')}
                        className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-600">Match All</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>


            {paginateArray(getFilteredNotes(), notesPage).map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
                onClick={handleNoteClick}
              />
            ))}
            {renderPagination(getFilteredNotes().length, notesPage, setNotesPage)}
          </div>
        )}



        {activeTab === 'search' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Search</h2>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks and notes (comma-separated)..."
              matchAll={searchMatchAll}
              onMatchAllChange={setSearchMatchAll}
            />
            {searchQuery && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Tasks ({filteredTasks.length})
                  </h3>
                  {paginateArray(filteredTasks, searchTasksPage).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      onClick={handleTaskClick}
                    />
                  ))}
                  {renderPagination(filteredTasks.length, searchTasksPage, setSearchTasksPage)}

                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Notes ({filteredNotes.length})
                  </h3>
                  {paginateArray(filteredNotes, searchNotesPage).map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onDelete={handleDeleteNote}
                      onClick={handleNoteClick}
                    />
                  ))}
                  {renderPagination(filteredNotes.length, searchNotesPage, setSearchNotesPage)}
                </div>

              </>
            )}

          </div>
        )}



        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            onTaskReschedule={handleTaskReschedule}
            onDateClick={handleCalendarDateClick}
            onTaskClick={handleTaskClick}
          />
        )}


      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-around py-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-teal-600' : 'text-gray-500'}`}
          >
            <span className="text-2xl mb-1">🏠</span>
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center ${activeTab === 'tasks' ? 'text-teal-600' : 'text-gray-500'}`}
          >
            <span className="text-2xl mb-1">✓</span>
            <span className="text-xs">Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex flex-col items-center ${activeTab === 'notes' ? 'text-teal-600' : 'text-gray-500'}`}
          >
            <span className="text-2xl mb-1">📝</span>
            <span className="text-xs">Notes</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center ${activeTab === 'calendar' ? 'text-teal-600' : 'text-gray-500'}`}
          >
            <span className="text-2xl mb-1">📅</span>
            <span className="text-xs">Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center ${activeTab === 'search' ? 'text-teal-600' : 'text-gray-500'}`}
          >
            <span className="text-2xl mb-1">🔍</span>
            <span className="text-xs">Search</span>
          </button>
        </div>

      </nav>

      {/* Modals */}
      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        task={selectedTask}
        selectedDate={selectedCalendarDate}
      />


      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={handleCloseNoteModal}
        onSave={handleSaveNote}
        note={selectedNote}
      />


      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel
          tasks={dueReminders}
          onSnooze={handleSnoozeReminder}
          onDismiss={handleDismissReminder}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>


  );
};

export default AppLayout;
