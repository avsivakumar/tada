import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onClick }) => {
  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-green-100 text-green-700 border-green-300'
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 mb-3 border-l-4 ${task.completed ? 'opacity-60' : ''} ${task.priority === 'high' ? 'border-red-500' : task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
        />
        <div 
          className="flex-1 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => onClick(task)}
        >
          <h3 className={`font-semibold text-gray-900 mb-1 ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <span className="text-xs text-gray-500">📅 {task.dueDate}</span>
            {task.isRecurring && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full border border-purple-300">
                🔄 {task.recurrencePattern}
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
