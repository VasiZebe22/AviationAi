import React from 'react';

const StatItem = ({ value, label, trend }) => (
  <div className="flex flex-col p-4 bg-dark bg-opacity-50 rounded-lg">
    <div className="flex items-baseline justify-between">
      <span className="text-2xl font-semibold text-gray-100">{value}</span>
      {trend && (
        <span className={`text-xs font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-xs font-medium text-gray-400 mt-1">{label}</div>
  </div>
);

export default StatItem;
