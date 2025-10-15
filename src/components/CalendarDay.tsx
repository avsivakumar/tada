import React from 'react';
import { Task } from '../types';

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onDayClick: (date: Date) => void;
  onTaskDrop: (taskId: number, newDate: Date) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ 
  date, 
  tasks, 
  isCurrentMonth, 
  isToday,
  onDayClick,
  onTaskDrop
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`min-h-24 border border-gray-200 p-2 cursor-pointer transition-colors ${
        !isCurrentMonth ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onDayClick(date)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`text-sm font-semibold mb-1 ${!isCurrentMonth ? 'text-gray-400' : isToday ? 'text-blue-600' : 'text-gray-700'}`}>
        {date.getDate()}
      </div>
      <div className="space-y-1">
        {tasks.slice(0, 3).map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id.toString())}
            className={`text-xs p-1 rounded truncate cursor-move ${getPriorityColor(task.priority)} text-white`}
            onClick={(e) => e.stopPropagation()}
          >
            {task.title}
          </div>
        ))}
        {tasks.length > 3 && (
          <div className="text-xs text-gray-500">+{tasks.length - 3} more</div>
        )}
      </div>
    </div>
  );
};

export default CalendarDay;
