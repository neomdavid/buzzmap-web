import React, { useState, useMemo } from 'react';
import { InterventionAnalysisChart } from '../../components';
import { useGetAllInterventionsQuery } from '../../api/dengueApi';

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
  const [barangayFilter, setBarangayFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

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

  const barangayOptions = useMemo(() =>
    Array.from(new Set(validInterventions.map(i => i.barangay))).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    [validInterventions]
  );
  const typeOptions = useMemo(() =>
    interventions ? Array.from(new Set(interventions.map(i => i.interventionType))).sort() : [],
    [interventions]
  );

  // Debug: log interventions and filtered results
  if (interventions) {
    console.log('Loaded interventions:', interventions);
    console.log('Barangay filter:', barangayFilter, 'Type filter:', typeFilter);
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
          const matchesBarangay = !barangayFilter || i.barangay === barangayFilter;
          const matchesType = !typeFilter || i.interventionType === typeFilter;
          return matchesSearch && matchesBarangay && matchesType;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

  if (interventions) {
    console.log('Filtered interventions:', filtered);
  }

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <p className="text-center sm:text-left text-5xl font-extrabold mb-10 text-primary">Intervention Effectivity Dashboard</p>
      <div className="mb-4 flex flex-col md:flex-row gap-2 md:items-end">
        <div className="flex gap-2 flex-wrap">
          <select
            className="px-2 py-2 border rounded"
            value={barangayFilter}
            onChange={e => setBarangayFilter(e.target.value)}
          >
            <option value="">All Barangays</option>
            {barangayOptions.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            className="px-2 py-2 border rounded"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <input
          className="w-full md:w-auto px-4 py-2 border rounded mb-2 md:mb-0 md:ml-2"
          placeholder="Search by barangay, type, personnel, or date..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Intervention Details Card */}
          {/* <div className="bg-white rounded shadow p-4 flex flex-col gap-2 border">
            <p className="font-bold text-lg text-primary mb-2">Intervention Details</p>
            <div><span className="font-semibold">Type:</span> {selected.interventionType}</div>
            <div><span className="font-semibold">Barangay:</span> {selected.barangay}</div>
            <div><span className="font-semibold">Date:</span> {new Date(selected.date).toLocaleDateString()}</div>
            <div><span className="font-semibold">Personnel:</span> {selected.personnel}</div>
            {selected.status && <div><span className="font-semibold">Status:</span> {selected.status}</div>}
            {selected.description && <div><span className="font-semibold">Description:</span> {selected.description}</div>}
            {selected.notes && <div><span className="font-semibold">Notes:</span> {selected.notes}</div>}
          </div> */}
          {/* Summary Statistics Card */}
          <div className="bg-white rounded shadow p-4 flex flex-col gap-2 border">
            <p className="font-bold text-lg text-primary mb-2">Summary Statistics</p>
            <div><span className="font-semibold">Total Before:</span> <span className="text-blue-600">{stats.totalBefore}</span></div>
            <div><span className="font-semibold">Total After:</span> <span className={stats.percentChange < 0 ? 'text-green-600' : stats.percentChange > 0 ? 'text-red-600' : 'text-gray-600'}>{stats.totalAfter}</span></div>
            <div><span className="font-semibold">% Change:</span> <span className={typeof stats.percentChange === 'number' && stats.percentChange < 0 ? 'text-green-600' : stats.percentChange > 0 ? 'text-red-600' : 'text-gray-600'}>{stats.percentChange}%</span></div>
          </div>
        </div>
      )}
      <div className="mt-8">
        {selectedId ? (
          <InterventionAnalysisChart interventionId={selectedId} onStats={setStats} percentChange={stats.percentChange} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px] bg-white rounded shadow text-gray-400 border">
            <span className="text-4xl mb-2">📈</span>
            <span className="text-lg">Please select an intervention to view effectivity analysis.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterventionEffectivity; 