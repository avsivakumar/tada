import React, { useState, useEffect } from 'react';

interface TaskFiltersProps {
  activeFilters: {
    priority: string[];
    status: string[];
  };
  showRecurringOnly: boolean;
  dateFrom: string | null;
  dateTo: string | null;
  keywords: string;
  keywordMatchType: 'any' | 'all';
  onFilterChange: (filterType: string, value: string) => void;
  onRecurringToggle: () => void;
  onDateFromChange: (date: string | null) => void;
  onDateToChange: (date: string | null) => void;
  onKeywordsChange: (keywords: string) => void;
  onKeywordMatchTypeToggle: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ 
  activeFilters, 
  showRecurringOnly,
  dateFrom,
  dateTo,
  keywords,
  keywordMatchType,
  onFilterChange,
  onRecurringToggle,
  onDateFromChange,
  onDateToChange,
  onKeywordsChange,
  onKeywordMatchTypeToggle
}) => {
  const [keywordInput, setKeywordInput] = useState(keywords);

  // Sync local input state with prop changes
  useEffect(() => {
    setKeywordInput(keywords);
  }, [keywords]);

  const toggleFilter = (type: string, value: string) => {
    onFilterChange(type, value);
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onKeywordsChange(keywordInput);
    }
  };

  return (
    <div className="mb-4 space-y-4">
      {/* First Row: Priority and Status */}
      <div className="flex flex-wrap gap-6 items-start">
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Priority</p>
          <div className="flex gap-2 flex-wrap">
            {['high', 'normal'].map(priority => (
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

        {/* Keywords moved to the right */}
        <div className="ml-auto">
          <p className="text-xs font-semibold text-gray-600 mb-2">Keywords (comma-separated, press Enter)</p>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={handleKeywordKeyPress}
              placeholder="e.g., work, urgent, meeting"
              className="text-sm border border-gray-300 rounded px-3 py-1 w-96"

            />
            <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={keywordMatchType === 'all'}
                onChange={onKeywordMatchTypeToggle}
                className="w-3 h-3 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-xs text-gray-600">Match All</span>
            </label>
          </div>
        </div>
      </div>


      {/* Second Row: Date Range Filter and Show Recurring Tasks Only */}
      <div className="flex gap-6 items-start flex-wrap">
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Date Range (Creation Date)</p>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">From:</label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFrom || ''}
                  onChange={(e) => onDateFromChange(e.target.value || null)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                />
                {dateFrom && (
                  <button
                    onClick={() => onDateFromChange(null)}
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
                  value={dateTo || ''}
                  onChange={(e) => onDateToChange(e.target.value || null)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                />
                {dateTo && (
                  <button
                    onClick={() => onDateToChange(null)}
                    className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showRecurringOnly}
              onChange={onRecurringToggle}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Recurring Tasks Only</span>
          </label>
        </div>
      </div>
    </div>

  );
};

export default TaskFilters;
