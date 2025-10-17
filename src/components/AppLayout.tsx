import React, { useState, useEffect, useRef } from 'react';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'notes' | 'search' | 'calendar'>('dashboard');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [selectedStatView, setSelectedStatView] = useState<'due' | 'urgent' | 'pending' | 'completedToday'>('due');


  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
  
  // Keywords filter
  const [keywords, setKeywords] = useState('');
  const [keywordMatchType, setKeywordMatchType] = useState<'any' | 'all'>('any');

  // Pagination state
  const [dashboardPage, setDashboardPage] = useState(1);
  const [tasksPage, setTasksPage] = useState(1);
  const [notesPage, setNotesPage] = useState(1);
  const [searchTasksPage, setSearchTasksPage] = useState(1);
  const [searchNotesPage, setSearchNotesPage] = useState(1);
  const itemsPerPage = 10;





  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dueReminders, setDueReminders] = useState<Task[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      db.searchTasks(searchQuery).then(setFilteredTasks);
      db.searchNotes(searchQuery).then(setFilteredNotes);
    } else {
      setFilteredTasks(tasks);
      setFilteredNotes(notes);
    }
  }, [searchQuery, tasks, notes]);

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
      const due = tasks.filter(task => {
        if (task.completed || !task.reminderTime) return false;
        const reminderTime = new Date(task.reminderTime);
        const snoozedUntil = task.snoozedUntil ? new Date(task.snoozedUntil) : null;
        
        // Show if reminder time has passed and not currently snoozed
        return reminderTime <= now && (!snoozedUntil || snoozedUntil <= now);
      });
      setDueReminders(due);
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  // Generate instances when it's time based on recurrence pattern
  useEffect(() => {
    const generateRecurringInstances = async () => {
      const recurringTasks = tasks.filter(t => t.isRecurring);
      
      for (const task of recurringTasks) {
        // Check if it's time to generate the next instance
        if (shouldGenerateNextInstance(task, tasks)) {
          const nextInstance = generateNextOccurrence(task);
          
          if (nextInstance) {
            await db.addTask(nextInstance);
            await db.updateTask(task.id, { 
              lastGeneratedDate: nextInstance.dueDate 
            });
          }
        }
      }
      
      if (recurringTasks.length > 0) {
        loadData();
      }
    };

    generateRecurringInstances();
    
    // Check every hour if new instances need to be generated
    const interval = setInterval(generateRecurringInstances, 3600000); // Every hour

    return () => clearInterval(interval);
  }, [tasks]);

  // Refresh data when returning to dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadData();
    }
  }, [activeTab]);





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
      const updateData: Partial<Task> = { 
        completed: newCompletedState,
        completionDate: newCompletedState ? new Date().toISOString().split('T')[0] : undefined
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
    return tasks.filter(task => {
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
      if (showRecurringOnly && !task.isRecurring) {
        return false;
      }
      
      // Apply date range filter based on createdAt
      if (dateFrom && task.createdAt < dateFrom) {
        return false;
      }
      if (dateTo && task.createdAt > dateTo) {
        return false;
      }
      
      // Apply keywords filter
      if (keywords.trim()) {
        const keywordList = keywords.toLowerCase().split(/\s+/).filter(k => k.length > 0);
        const taskText = `${task.title} ${task.description || ''}`.toLowerCase();
        
        if (keywordMatchType === 'all') {
          // All keywords must be present
          if (!keywordList.every(keyword => taskText.includes(keyword))) {
            return false;
          }
        } else {
          // Any keyword must be present
          if (!keywordList.some(keyword => taskText.includes(keyword))) {
            return false;
          }
        }
      }
      
      return true;
    });
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
    await db.updateTask(taskId, { reminderTime: undefined, reminderOffset: undefined });
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
  
  // Tasks Due: only count incomplete tasks with due date <= today
  const tasksDue = tasks.filter(t => {
    if (!t.dueDate || t.dueDate > today) return false;
    return !t.completed; // Exclude all completed tasks
  }).length;
  
  const urgentTasks = tasks.filter(t => t.priority === true && !t.completed).length;
  const pendingWork = tasks.filter(t => !t.dueDate && !t.isRecurring && !t.completed).length;

  const completedToday = tasks.filter(t => t.completed && t.completionDate === today).length;




  // Get tasks to display based on selected stat view
  const getDisplayTasks = () => {
    let filteredTasks: Task[] = [];
    
    if (selectedStatView === 'due') {
      // Show only incomplete tasks with due date <= today
      filteredTasks = tasks.filter(t => {
        if (!t.dueDate || t.dueDate > today) return false;
        return !t.completed; // Exclude all completed tasks
      });
    } else if (selectedStatView === 'urgent') {
      filteredTasks = tasks.filter(t => t.priority === true && !t.completed);
    } else if (selectedStatView === 'pending') {
      filteredTasks = tasks.filter(t => !t.dueDate && !t.isRecurring && !t.completed);

    } else if (selectedStatView === 'completedToday') {
      filteredTasks = tasks.filter(t => t.completed && t.completionDate === today);
    }

    
    // Sort by due date if applicable
    return filteredTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
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
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  <span className="text-xl">📥</span>
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
                  {paginateArray(displayTasks, dashboardPage).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      onClick={handleTaskClick}
                    />
                  ))}
                  {renderPagination(displayTasks.length, dashboardPage, setDashboardPage)}
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
            {paginateArray(notes, notesPage).map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
                onClick={handleNoteClick}
              />
            ))}
            {renderPagination(notes.length, notesPage, setNotesPage)}
          </div>
        )}


        {activeTab === 'search' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Search</h2>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks and notes..."
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
