import React, { useState } from 'react';
import { StockLog, LogType } from '../types';

interface StockHistoryViewProps {
  logs: StockLog[];
}

export const StockHistoryView: React.FC<StockHistoryViewProps> = ({ logs }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSearch = 
      log.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.note && log.note.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div>
          <h2 className="font-title-md font-semibold text-on-surface">Stock Activity History</h2>
          <p className="text-xs text-on-surface-variant">
            Automatic tracking whenever stock is added, sold, or adjusted.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-[1.125rem]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="pl-9 pr-3 py-1.5 rounded-xl bg-surface-container-low text-xs text-on-surface border border-outline-variant/20 focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface border border-outline-variant/20 focus:outline-none cursor-pointer"
          >
            <option value="all">All Events ({logs.length})</option>
            <option value="restock">Restocks (+)</option>
            <option value="sale">Sales (-)</option>
            <option value="damaged">Damaged / Write-offs</option>
            <option value="adjustment">Manual Counts</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-[3rem] text-on-surface-variant/40">history</span>
            <p className="font-semibold text-on-surface">No stock changes match your filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/20">
                <tr>
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Change Type</th>
                  <th className="py-3.5 px-4 text-center">Change (Qty)</th>
                  <th className="py-3.5 px-4 text-center">New Balance</th>
                  <th className="py-3.5 px-4">Reason / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                {filteredLogs.map((log) => {
                  const isPositive = log.quantityChange > 0;
                  return (
                    <tr key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-4 text-xs text-on-surface-variant font-medium whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-on-surface">
                        {log.productName}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          log.type === 'restock' ? 'bg-emerald-100 text-emerald-800' :
                          log.type === 'sale' ? 'bg-primary/15 text-primary' :
                          log.type === 'damaged' ? 'bg-amber-100 text-amber-900' :
                          'bg-surface-container text-on-surface'
                        }`}>
                          <span className="material-symbols-outlined text-[0.875rem]">
                            {log.type === 'restock' ? 'add_box' :
                             log.type === 'sale' ? 'shopping_bag' :
                             log.type === 'damaged' ? 'report_problem' : 'tune'}
                          </span>
                          {log.type === 'restock' ? 'Restocked' :
                           log.type === 'sale' ? 'Sale' :
                           log.type === 'damaged' ? 'Damaged' : 'Adjusted'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-center font-mono font-bold text-sm ${
                        isPositive ? 'text-emerald-800' : 'text-primary'
                      }`}>
                        {isPositive ? `+${log.quantityChange}` : log.quantityChange} units
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-xs text-on-surface">
                        <span className="px-2 py-0.5 rounded bg-surface-container">
                          {log.resultingStock} in stock
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-on-surface-variant">
                        {log.note || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
