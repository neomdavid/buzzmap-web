import React, { useState, useMemo } from 'react';
import { InterventionAnalysisChart } from '../../components';
import { useGetAllInterventionsQuery } from '../../api/dengueApi';
import { MagnifyingGlass, Users, TrendUp, TrendDown, MinusCircle } from 'phosphor-react';
import { IconUserCheck, IconClipboardList } from '@tabler/icons-react';

function getDaysSince(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

const InterventionEffectivity = () => {
  const { data: interventions, isLoading } = useGetAllInterventionsQuery();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [stats, setStats] = useState({ totalBefore: '-', totalAfter: '-', percentChange: '-' });
  const [typeFilter, setTypeFilter] = useState('');
  const [barangayFilter, setBarangayFilter] = useState('');

  const selected = interventions?.find(i => i._id === selectedId);

  const validInterventions = useMemo(() =>
    interventions
      ? interventions.filter(i => {
          const status = i.status?.toLowerCase();
          if (status !== 'completed' && status !== 'complete') return false;
          return getDaysSince(i.date) >= 120;
        })
      : [],
    [interventions]
  );

  const typeOptions = useMemo(() =>
    interventions ? Array.from(new Set(interventions.map(i => i.interventionType))).sort() : [],
    [interventions]
  );

  const barangayOptions = useMemo(() =>
    interventions ? Array.from(new Set(interventions.map(i => i.barangay))).sort() : [],
    [interventions]
  );

  // Debug: log interventions and filtered results
  if (interventions) {
    console.log('Loaded interventions:', interventions);
    console.log('Type filter:', typeFilter);
    interventions.forEach(i => console.log('Intervention:', i._id, 'status:', i.status));
  }

  // Filter interventions by search and filters, only completed/complete (case-insensitive), and sort by date desc
  const filtered = interventions
    ? interventions
        .filter((i) => {
          const status = i.status?.toLowerCase();
          if (status !== 'completed' && status !== 'complete') return false;
          // Only include interventions at least 4 months (about 120 days) old
          const daysSince = getDaysSince(i.date);
          if (daysSince < 120) return false;
          const s = search.toLowerCase();
          const matchesSearch =
            i.barangay?.toLowerCase().includes(s) ||
            i.interventionType?.toLowerCase().includes(s) ||
            (i.personnel && i.personnel.toLowerCase().includes(s)) ||
            (i.date && new Date(i.date).toLocaleDateString().includes(s));
          const matchesType = !typeFilter || i.interventionType === typeFilter;
          const matchesBarangay = !barangayFilter || i.barangay === barangayFilter;
          return matchesSearch && matchesType && matchesBarangay;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

  if (interventions) {
    console.log('Filtered interventions:', filtered);
  }

  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12 text-center md:justify-start md:text-left md:w-[48%]">
        Intervention Effectivity Dashboard</p>
      <div className="mb-4 flex flex-col md:flex-row gap-2 md:items-end w-full">
        <div className="flex flex-row gap-2 w-full">
          <div className="flex-1">
            <select
              className="w-full px-2 py-2 border-2 rounded-full hover:cursor-pointer"
              value={barangayFilter}
              onChange={e => setBarangayFilter(e.target.value)}
            >
              <option value="">All Barangays</option>
              {barangayOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <select
              className="w-full px-2 py-2 border-2 rounded-full hover:cursor-pointer"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto border rounded bg-white mb-4">
        {isLoading && <div className="p-2 text-gray-500">Loading interventions...</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="p-2 text-gray-500">No valid interventions. An intervention must be at least 4 months old to analyze effectivity.</div>
        )}
        {!isLoading && filtered.map(i => (
          <div
            key={i._id}
            className={`p-2 cursor-pointer hover:bg-blue-100 ${selectedId === i._id ? 'bg-blue-200' : ''}`}
            onClick={() => { setSelectedId(i._id); setStats({ totalBefore: '-', totalAfter: '-', percentChange: '-' }); }}
          >
            <div className="font-semibold text-primary">{i.interventionType} - {i.barangay}</div>
            <div className="text-xs text-gray-500">{new Date(i.date).toLocaleDateString()} | {i.personnel}</div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="flex flex-col md:flex-row gap-6 w-full mb-8">
       
          
          {/* Summary Statistics Card */}
          <div className="flex-1 min-w-0 w-full bg-neutral-content rounded-lg shadow-sm p-8 flex flex-col items-center gap-6 border border-neutral-200">
            <p className="text-base-content text-3xl font-bold text-left w-full mb-2 tracking-tight">Summary Statistics</p>
            <div className="flex flex-col md:flex-row gap-6 w-full">
              {/* Total Before */}
              <div className="flex-1 min-w-0 w-full flex flex-col items-center bg-white shadow-sm p-8 rounded-2xl transition-transform hover:scale-[1.025]">
                <div className="mb-2 flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                  <Users size={32} className="text-primary" />
                </div>
                <div className="text-4xl font-extrabold text-primary mb-1">{stats.totalBefore}</div>
                <div className="text-base font-medium text-gray-500 tracking-wide">Total Before</div>
              </div>
              {/* Total After */}
              <div className="flex-1 min-w-0 w-full flex flex-col items-center bg-white shadow-sm p-8 rounded-2xl transition-transform hover:scale-[1.025]">
                <div className="mb-2 flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
                  <IconUserCheck size={32} className="text-green-600" />
                </div>
                <div className={stats.percentChange < 0 ? 'text-green-600 text-4xl font-extrabold mb-1' : stats.percentChange > 0 ? 'text-red-600 text-4xl font-extrabold mb-1' : 'text-gray-600 text-4xl font-extrabold mb-1'}>{stats.totalAfter}</div>
                <div className="text-base font-medium text-gray-500 tracking-wide">Total After</div>
              </div>
              {/* Percentage Change */}
              <div className="flex-1 min-w-0 w-full flex flex-col items-center bg-white shadow-sm p-8 rounded-2xl transition-transform hover:scale-[1.025]">
                <div className={`mb-2 flex items-center justify-center w-14 h-14 rounded-full ${typeof stats.percentChange === 'number' && stats.percentChange < 0 ? 'bg-green-100' : stats.percentChange > 0 ? 'bg-red-100' : 'bg-gray-200'}`}>
                  {typeof stats.percentChange === 'number' && stats.percentChange < 0 ? (
                    <TrendDown size={32} className="text-green-600" />
                  ) : stats.percentChange > 0 ? (
                    <TrendUp size={32} className="text-red-600" />
                  ) : (
                    <MinusCircle size={32} className="text-gray-400" />
                  )}
                </div>
                <div className={typeof stats.percentChange === 'number' && stats.percentChange < 0 ? 'text-green-600 text-4xl font-extrabold mb-1' : stats.percentChange > 0 ? 'text-red-600 text-4xl font-extrabold mb-1' : 'text-gray-600 text-4xl font-extrabold mb-1'}>{stats.percentChange}%</div>
                <div className="text-base font-medium text-gray-500 tracking-wide">Percentage Change</div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="">
        {selectedId ? (
          <InterventionAnalysisChart interventionId={selectedId} onStats={setStats} percentChange={stats.percentChange} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px] bg-white rounded shadow text-gray-400 border">
            <span className="text-4xl mb-2">📈</span>
            <span className="text-lg">Please select an intervention to view effectivity analysis.</span>
          </div>
        )}
      </div>
    </main>
  );
};

export default InterventionEffectivity; 