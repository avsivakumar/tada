import React from 'react';

interface TaskFiltersProps {
  activeFilters: {
    priority: string[];
    status: string[];
    category: string[];
  };
  onFilterChange: (filterType: string, value: string) => void;
  categories: string[];
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ activeFilters, onFilterChange, categories }) => {
  const toggleFilter = (type: string, value: string) => {
    onFilterChange(type, value);
  };

  return (
    <div className="mb-4 space-y-3">
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Priority</p>
        <div className="flex gap-2 flex-wrap">
          {['high', 'medium', 'low'].map(priority => (
            <button
              key={priority}
              onClick={() => toggleFilter('priority', priority)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                activeFilters.priority.includes(priority)
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Status</p>
        <div className="flex gap-2 flex-wrap">
          {['pending', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => toggleFilter('status', status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                activeFilters.status.includes(status)
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Category</p>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => toggleFilter('category', category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  activeFilters.category.includes(category)
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
