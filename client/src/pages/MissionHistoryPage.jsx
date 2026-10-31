import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Trash2,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { DOMAIN_OPTIONS } from '../utils/scenarioPresets';

export default function MissionHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [domainFilter, setDomainFilter] = useState(searchParams.get('domain') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const fetchMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (domainFilter) params.domain = domainFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await axiosClient.get('/missions', { params });
      if (res.data.success) {
        setMissions(res.data.missions || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch mission ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, [domainFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMissions();
  };

  const handleDeleteMission = async (id) => {
    if (!window.confirm('Delete this mission and all associated task DAG records?')) return;
    try {
      await axiosClient.delete(`/missions/${id}`);
      fetchMissions();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete mission');
    }
  };

  const clearFilters = () => {
    setDomainFilter('');
    setStatusFilter('');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
            <span>Mission Ledger & Historical Audit</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Searchable, filterable ledger of all multi-agent missions, decomposed DAGs, and human governance decisions
          </p>
        </div>

        <Link
          to="/missions/new"
          className="px-4 py-2 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Mission</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by mission title, trigger keywords, or bottleneck..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="rounded bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Operational Domains</option>
              {DOMAIN_OPTIONS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Execution Statuses</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="AWAITING_HITL">AWAITING_HITL</option>
              <option value="PLANNING">PLANNING</option>
              <option value="REPLANNING">REPLANNING</option>
            </select>

            <button
              type="submit"
              className="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              Filter
            </button>

            {(domainFilter || statusFilter || searchQuery) && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-2 rounded text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="p-3.5 rounded bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Ledger Table */}
      <div className="rounded-lg bg-slate-900/40 border border-slate-800/80 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-mono">
            Querying mission ledger records...
          </div>
        ) : missions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No Mission Records Found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search criteria or deploy a new agent mission.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                  <th className="py-3 px-4">Mission Title & Workspace</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Tasks (HITL)</th>
                  <th className="py-3 px-4 text-right">Confidence</th>
                  <th className="py-3 px-4 text-right">Time Saved</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {missions.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <Link
                        to={`/missions/${m.id}`}
                        className="font-semibold text-slate-200 hover:text-cyan-300 transition-colors line-clamp-1"
                      >
                        {m.title}
                      </Link>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {m.workspace_name} ({m.workspace_department}) &bull;{' '}
                        {new Date(m.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-cyan-400">
                        {m.domain.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold text-[11px] ${
                          m.urgency === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {m.urgency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          m.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : m.status === 'AWAITING_HITL'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300 tabular-nums">
                      {m.total_tasks || 0}
                      {m.hitl_tasks > 0 && (
                        <span className="text-amber-400 ml-1">({m.hitl_tasks} HITL)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-200 tabular-nums">
                      {m.confidence_score}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-400 tabular-nums">
                      {Math.round(m.estimated_manual_minutes / 60 * 10) / 10}h
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`/missions/${m.id}`}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                        >
                          Inspect
                        </Link>
                        <button
                          onClick={() => handleDeleteMission(m.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Mission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
