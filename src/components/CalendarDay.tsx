import React from 'react';
import { Task } from '../types';

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onDayClick: (date: Date) => void;
  onTaskDrop: (taskId: number, newDate: Date) => void;
  onTaskClick?: (task: Task) => void;
  viewMode?: 'month' | 'week' | 'day';
}

const CalendarDay: React.FC<CalendarDayProps> = ({ 
  date, 
  tasks, 
  isCurrentMonth, 
  isToday,
  onDayClick,
  onTaskDrop,
  onTaskClick,
  viewMode = 'month'
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    onTaskDrop(taskId, date);
  };

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const minHeight = viewMode === 'day' ? 'min-h-96' : viewMode === 'week' ? 'min-h-32' : 'min-h-24';

  return (
    <div
      className={`${minHeight} border border-gray-200 p-2 cursor-pointer transition-colors ${
        !isCurrentMonth ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onDayClick(date)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`text-sm font-semibold mb-2 ${!isCurrentMonth ? 'text-gray-400' : isToday ? 'text-blue-600' : 'text-gray-700'}`}>
        {viewMode === 'day' ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : date.getDate()}
      </div>
      <div className="space-y-1">
        {tasks.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id.toString())}
            onClick={(e) => handleTaskClick(e, task)}
            className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 ${getPriorityColor(task.priority)} text-white ${
              viewMode === 'day' ? '' : 'truncate'
            }`}
          >
            <div className={`font-semibold ${task.completed ? 'line-through' : ''}`}>{task.title}</div>
            {viewMode === 'day' && task.description && (
              <div className="text-xs mt-1 opacity-90">{task.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarDay;
