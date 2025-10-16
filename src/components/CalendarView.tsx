import React, { useState } from 'react';
import { Task } from '../types';
import CalendarDay from './CalendarDay';

interface CalendarViewProps {
  tasks: Task[];
  onTaskReschedule: (taskId: number, newDate: string) => void;
  onDateClick: (date: Date) => void;
  onTaskClick?: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskReschedule, onDateClick, onTaskClick }) => {
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
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };

  const getWeekDays = (date: Date) => {
    const days: Date[] = [];
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate === dateStr);
  };

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      setCurrentDate(newDate);
    }
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

  const getTitle = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const renderCalendar = () => {
    let days: Date[] = [];
    if (viewMode === 'month') {
      days = getDaysInMonth(currentDate);
    } else if (viewMode === 'week') {
      days = getWeekDays(currentDate);
    } else {
      days = [currentDate];
    }

    return (
      <div className={`grid gap-1 ${viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}>
        {days.map((date, index) => (
          <CalendarDay
            key={`${date.toISOString()}-${index}`}
            date={date}
            tasks={getTasksForDate(date)}
            isCurrentMonth={viewMode === 'month' ? isCurrentMonth(date) : true}
            isToday={isToday(date)}
            onDayClick={onDateClick}
            onTaskDrop={handleTaskDrop}
            onTaskClick={onTaskClick}
            viewMode={viewMode}
          />
        ))}
      </div>
    );
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
        <div className="flex gap-2">
          <button onClick={handleToday} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">
            Today
          </button>
          <button onClick={handlePrev} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
            ←
          </button>
          <button onClick={handleNext} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
            →
          </button>
        </div>
      </div>

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

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {viewMode !== 'day' && (
          <div className="grid grid-cols-7 bg-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-semibold text-gray-700 text-sm">
                {day}
              </div>
            ))}
          </div>
        )}
        {renderCalendar()}
      </div>
    </div>
  );
};

export default CalendarView;
