import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ScanEye,
  FileWarning,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  User,
  History,
  ShieldCheck,
} from 'lucide-react';
import KpiCard from '../components/KpiCard';
import axiosClient from '../api/axiosClient';
import { getCurrentCustomer, subscribeToAuth } from '../utils/auth';

export default function DashboardPage() {
  const [customer, setCustomer] = useState(getCurrentCustomer());
  const [stats, setStats] = useState({
    totalScans: 0,
    avgRiskScore: 0,
    criticalCount: 0,
    highCount: 0,
    moderateCount: 0,
    cleanCount: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async (custId) => {
    setLoading(true);
    const targetCustId = (custId || customer.id || 'demo@privacyguard.ai').trim().toLowerCase();

    try {
      const res = await axiosClient.get(`/stats?customerId=${encodeURIComponent(targetCustId)}`);
      if (res.data && res.data.stats) {
        setStats(res.data.stats);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend stats unavailable, computing from local cache:', err.message);
    }

    // Local cache computation
    try {
      const cacheKey = `privacyguard_history_${targetCustId}`;
      const raw = localStorage.getItem(cacheKey);
      const history = raw ? JSON.parse(raw) : [];

      const totalScans = history.length;
      if (totalScans === 0) {
        setStats({
          totalScans: 0,
          avgRiskScore: 0,
          criticalCount: 0,
          highCount: 0,
          moderateCount: 0,
          cleanCount: 0,
          recentActivity: [],
        });
      } else {
        const totalScore = history.reduce((acc, h) => acc + (Number(h.score) || 0), 0);
        const avgRiskScore = Math.round(totalScore / totalScans);
        let criticalCount = 0;
        let highCount = 0;
        let moderateCount = 0;
        let cleanCount = 0;

        history.forEach((h) => {
          const r = (h.risk || '').toUpperCase();
          if (r === 'CRITICAL') criticalCount++;
          else if (r === 'HIGH') highCount++;
          else if (r === 'MODERATE' || r === 'MEDIUM') moderateCount++;
          else cleanCount++;
        });

        setStats({
          totalScans,
          avgRiskScore,
          criticalCount,
          highCount,
          moderateCount,
          cleanCount,
          recentActivity: history.slice(0, 5),
        });
      }
    } catch {
      // Fallback
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats(customer.id);
    const unsub = subscribeToAuth((newCust) => {
      setCustomer(newCust);
      fetchStats(newCust.id);
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Customer Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-mono">
              <span>Spatial Security Command</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 font-mono">
              PERSONAL TELEMETRY
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-400 font-mono">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Customer Session:</span>
            <span className="text-white font-semibold">{customer.name}</span>
            <span className="text-slate-500">({customer.email})</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/history"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono matte-glass-subtle hover:text-white text-slate-300 border border-white/[0.08] transition-all"
          >
            <History className="w-3.5 h-3.5 text-violet-400" />
            <span>Inspection Ledger</span>
          </Link>

          <Link
            to="/scanner"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 shadow-[0_0_20px_-3px_rgba(124,58,237,0.4)] transition-all hover:scale-105"
          >
            <ScanEye className="w-3.5 h-3.5 text-cyan-300" />
            <span>Launch Privacy Scanner</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid - Dynamically Driven by Customer Scans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Average Risk Score"
          value={stats.totalScans > 0 ? `${stats.avgRiskScore} / 100` : '0 / 100'}
          subtext={
            stats.criticalCount > 0
              ? `${stats.criticalCount} critical exposures isolated`
              : 'Zero active critical leaks'
          }
          change={stats.totalScans > 0 ? `${stats.totalScans} assessments` : 'No data yet'}
          icon={ShieldAlert}
          color={stats.avgRiskScore > 70 ? 'rose' : stats.avgRiskScore > 40 ? 'amber' : 'emerald'}
        />
        <KpiCard
          title="Personal Scans Completed"
          value={stats.totalScans.toString()}
          subtext={`Ledger for ${customer.email}`}
          change="Real-time sync"
          icon={ScanEye}
          color="amethyst"
        />
        <KpiCard
          title="Threats Quarantined"
          value={(stats.criticalCount + stats.highCount).toString()}
          subtext={`${stats.criticalCount} Critical, ${stats.highCount} High`}
          change="Defensive mitigation"
          icon={FileWarning}
          color="rose"
        />
        <KpiCard
          title="Clean Verifications"
          value={stats.cleanCount.toString()}
          subtext="No sensitive data leaked"
          change="Zero persistence"
          icon={CheckCircle2}
          color="cyan"
        />
      </div>

      {/* Recent Scans Table */}
      <div className="matte-glass rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="font-semibold text-white text-sm font-mono flex items-center space-x-2">
              <span>Personal Scan Activity</span>
              <span className="text-[10px] text-cyan-400 font-mono">({stats.recentActivity.length} recent)</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Latest inspections recorded for customer {customer.email}
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View Full Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentActivity.length === 0 ? (
          <div className="py-10 text-center text-slate-500 font-mono text-xs">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-30 text-cyan-400" />
            <p className="text-slate-300 font-semibold">No scans logged for this customer account</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto font-sans">
              Run your first scan on the Privacy Scanner to analyze text, identify leaks, and record customer-specific audit history.
            </p>
            <Link
              to="/scanner"
              className="inline-flex items-center space-x-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-violet-600/30 text-violet-300 border border-violet-500/40 hover:bg-violet-600/50"
            >
              <span>Scan Text Now</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] font-semibold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Scan ID & Subject</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Detected Vectors</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {stats.recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{activity.title || activity.source || activity.name}</div>
                      <div className="text-[10px] text-cyan-400">{activity.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          activity.risk === 'Critical'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                            : activity.risk === 'High'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                            : activity.risk === 'Moderate'
                            ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        }`}
                      >
                        {activity.risk}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {activity.score} / 100
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(activity.categories || []).length === 0 ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-slate-400 border border-white/[0.06]">
                            Clean Document
                          </span>
                        ) : (
                          (activity.categories || []).slice(0, 3).map((cat, i) => (
                            <span
                              key={i}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-slate-300 border border-white/[0.06]"
                            >
                              {cat}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {activity.dateFormatted || activity.timestamp || activity.date}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[11px] font-medium text-slate-300 px-2 py-0.5 rounded matte-glass-subtle">
                        {activity.status}
                      </span>
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
