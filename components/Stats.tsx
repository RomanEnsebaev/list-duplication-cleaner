
import React from 'react';

interface StatsProps {
  original: number;
  cleaned: number;
  deleted: number;
}

export const Stats: React.FC<StatsProps> = ({ original, cleaned, deleted }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Words</p>
        <p className="text-2xl font-bold text-slate-900">{original.toLocaleString()}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-green-600 uppercase tracking-wider">Unique Words</p>
        <p className="text-2xl font-bold text-green-700">{cleaned.toLocaleString()}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-red-600 uppercase tracking-wider">Duplicates Removed</p>
        <p className="text-2xl font-bold text-red-700">{deleted.toLocaleString()}</p>
      </div>
    </div>
  );
};
