import React, { useState } from 'react';
import { Task } from '../types';
import CalendarDay from './CalendarDay';

interface CalendarViewProps {
  tasks: Task[];
  onTaskReschedule: (taskId: number, newDate: string) => void;
  onDateClick: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskReschedule, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Date[] = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleTaskDrop = (taskId: number, newDate: Date) => {
    const newDateStr = newDate.toISOString().split('T')[0];
    onTaskReschedule(taskId, newDateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{monthYear}</h2>
        <div className="flex gap-2">
          <button onClick={handleToday} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">
            Today
          </button>
          <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
            ←
          </button>
          <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
            →
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setViewMode('month')} className={`px-4 py-2 rounded ${viewMode === 'month' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
          Month
        </button>
        <button onClick={() => setViewMode('week')} className={`px-4 py-2 rounded ${viewMode === 'week' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
          Week
        </button>
        <button onClick={() => setViewMode('day')} className={`px-4 py-2 rounded ${viewMode === 'day' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>
          Day
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-semibold text-gray-700 text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((date, index) => (
            <CalendarDay
              key={index}
              date={date}
              tasks={getTasksForDate(date)}
              isCurrentMonth={isCurrentMonth(date)}
              isToday={isToday(date)}
              onDayClick={onDateClick}
              onTaskDrop={handleTaskDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
