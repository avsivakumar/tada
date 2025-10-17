import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`${color} rounded-lg shadow-md p-4 text-white`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl opacity-80 flex-shrink-0">{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
