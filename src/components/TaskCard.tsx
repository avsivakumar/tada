import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onClick }) => {
  // Recurring tasks (templates) cannot be marked as completed, only instances can
  const isRecurringTemplate = task.isRecurring && !task.parentTaskId;
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 mb-3 border-l-4 ${task.completed ? 'opacity-60' : ''} ${task.priority ? 'border-red-500' : 'border-gray-300'}`}>
      <div className="flex items-start gap-3">
        {!isRecurringTemplate && (
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
          />
        )}
        {isRecurringTemplate && (
          <div className="mt-1 w-5 h-5 flex items-center justify-center text-purple-600">
            🔄
          </div>
        )}
        <div 

          className="flex-1 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => onClick(task)}
        >
          <h3 className={`font-bold text-lg text-gray-900 mb-2 ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
            {task.priority && (
              <span className="text-xs px-2 py-1 rounded-full border bg-red-100 text-red-700 border-red-300">
                High Priority
              </span>
            )}
            {task.dueDate ? (
              <span className="text-xs text-gray-500">📅 {task.dueDate}</span>
            ) : (
              <span className="text-xs text-gray-400 italic">Pending</span>
            )}
            {task.isRecurring && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full border border-purple-300">
                🔄 {task.recurrencePattern}
              </span>
            )}
            {task.reminderNumber && task.reminderNumber > 0 && task.reminderUnit && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-300">
                🔔 Reminder {task.reminderNumber} {task.reminderUnit.charAt(0).toUpperCase() + task.reminderUnit.slice(1)} Before
              </span>
            )}

            {task.tags.map((tag, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="text-red-500 hover:text-red-700 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
