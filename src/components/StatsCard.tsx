import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`${color} rounded-lg shadow-md p-3 sm:p-4 text-white`}>
      <div className="flex items-start justify-between gap-1.5 sm:gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm opacity-90 leading-tight">{title}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">{value}</p>
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl opacity-80 flex-shrink-0 leading-none">{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
