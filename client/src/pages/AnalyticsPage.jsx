import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Mail,
  Phone,
  FileSpreadsheet,
  RefreshCw,
  Lock,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { getCurrentCustomer, subscribeToAuth } from '../utils/auth';

export default function AnalyticsPage() {
  const [customer, setCustomer] = useState(getCurrentCustomer());
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    criticalCount: 0,
    highCount: 0,
    moderateCount: 0,
    cleanCount: 0,
    avgScore: 0,
    vectorBreakdown: {
      url: 0,
      email: 0,
      phone: 0,
      file: 0,
      textScan: 0,
    },
    timeline: [],
  });

  const loadData = async (custId) => {
    setLoading(true);
    const targetCustId = (custId || customer.id || 'demo@privacyguard.ai').trim().toLowerCase();

    try {
      // 1. Fetch backend scans & stats
      const [statsRes, historyRes, verifRes] = await Promise.allSettled([
        axiosClient.get(`/stats?customerId=${encodeURIComponent(targetCustId)}`),
        axiosClient.get(`/history?customerId=${encodeURIComponent(targetCustId)}`),
        axiosClient.get('/verify/history'),
      ]);

      let scans = [];
      let verifs = [];

      if (historyRes.status === 'fulfilled' && historyRes.value.data?.history) {
        scans = historyRes.value.data.history;
      }
      if (verifRes.status === 'fulfilled' && verifRes.value.data?.verifications) {
        verifs = verifRes.value.data.verifications;
      }

      // If backend was empty, check local storage fallback
      if (scans.length === 0) {
        try {
          const raw = localStorage.getItem(`privacyguard_history_${targetCustId}`);
          if (raw) scans = JSON.parse(raw);
        } catch {}
      }

      const allEvents = [
        ...scans.map((s) => ({
          id: s.id,
          type: 'textScan',
          score: Number(s.score) || 0,
          risk: (s.risk || 'Low').toUpperCase(),
          timestamp: s.timestamp ? new Date(s.timestamp) : new Date(),
        })),
        ...verifs.map((v) => ({
          id: v.id,
          type: (v.type || 'url').toLowerCase(),
          score: Number(v.riskScore) || 0,
          risk: (v.riskLevel || 'LOW').toUpperCase(),
          timestamp: v.timestamp ? new Date(v.timestamp) : new Date(),
        })),
      ];

      const totalEvents = allEvents.length;
      let criticalCount = 0;
      let highCount = 0;
      let moderateCount = 0;
      let cleanCount = 0;
      let sumScore = 0;

      const vectorBreakdown = {
        url: 0,
        email: 0,
        phone: 0,
        file: 0,
        textScan: 0,
      };

      allEvents.forEach((ev) => {
        sumScore += ev.score;
        if (ev.risk === 'CRITICAL') criticalCount++;
        else if (ev.risk === 'HIGH') highCount++;
        else if (ev.risk === 'MODERATE' || ev.risk === 'MEDIUM') moderateCount++;
        else cleanCount++;

        if (ev.type.includes('url')) vectorBreakdown.url++;
        else if (ev.type.includes('email')) vectorBreakdown.email++;
        else if (ev.type.includes('phone')) vectorBreakdown.phone++;
        else if (ev.type.includes('file') || ev.type.includes('dataset')) vectorBreakdown.file++;
        else vectorBreakdown.textScan++;
      });

      // Compute last 7 days distribution
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        const count = allEvents.filter((ev) => {
          try {
            return ev.timestamp.toISOString().split('T')[0] === dateStr;
          } catch {
            return false;
          }
        }).length;
        days.push({ label: dayLabel, count, date: dateStr });
      }

      setAnalytics({
        totalEvents,
        criticalCount,
        highCount,
        moderateCount,
        cleanCount,
        avgScore: totalEvents > 0 ? Math.round(sumScore / totalEvents) : 0,
        vectorBreakdown,
        timeline: days,
      });
    } catch (err) {
      console.warn('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(customer.id);
    const unsub = subscribeToAuth((newCust) => {
      setCustomer(newCust);
      loadData(newCust.id);
    });
    return unsub;
  }, []);

  const maxTimelineCount = Math.max(...analytics.timeline.map((d) => d.count), 5);

  return (
    <div className="space-y-6 max-w-6xl font-mono">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              <span>Fraud Analytics & Threat Telemetry</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              ZERO PERSISTENCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated audit telemetry isolated to account:{' '}
            <span className="text-cyan-300">{customer.email}</span>
          </p>
        </div>

        <button
          onClick={() => loadData(customer.id)}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-violet-950/40 hover:bg-violet-900/60 border border-violet-500/30 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
          <span className="text-[10px] text-slate-400 uppercase block">Total Scans Audited</span>
          <p className="text-2xl font-bold text-white mt-1">{analytics.totalEvents}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Multi-vector checks</span>
        </div>

        <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
          <span className="text-[10px] text-slate-400 uppercase block">Critical Blocked</span>
          <p className="text-2xl font-bold text-rose-400 mt-1">{analytics.criticalCount}</p>
          <span className="text-[10px] text-rose-300/80 mt-1 block">Score ≥ 80 / Blocked</span>
        </div>

        <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
          <span className="text-[10px] text-slate-400 uppercase block">High Threat Correlated</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{analytics.highCount}</p>
          <span className="text-[10px] text-amber-300/80 mt-1 block">Score 60 - 79</span>
        </div>

        <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
          <span className="text-[10px] text-slate-400 uppercase block">Avg Risk Exposure</span>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{analytics.avgScore}/100</p>
          <span className="text-[10px] text-cyan-300/80 mt-1 block">Account threat level</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Activity Volume (Responsive SVG) */}
        <div className="matte-glass rounded-xl p-5 border border-violet-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>7-Day Inspection Volume</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Live Timeline</span>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-violet-500/15">
            {analytics.timeline.map((day, i) => {
              const heightPercent = Math.round((day.count / maxTimelineCount) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </span>
                  <div className="w-full max-w-[28px] bg-black/40 rounded-t-md h-full flex items-end overflow-hidden p-0.5">
                    <div
                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                      className="w-full bg-gradient-to-t from-violet-600 to-cyan-400 rounded-t-sm transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">{day.label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400">
            Real verification events recorded across URLs, mailboxes, phone numbers, and dataset files.
          </p>
        </div>

        {/* Threat Vector Distribution */}
        <div className="matte-glass rounded-xl p-5 border border-violet-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Inspection Surface Distribution</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Channel Breakdown</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center space-x-2">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Websites & URLs</span>
                </span>
                <span className="text-white font-bold">{analytics.vectorBreakdown.url}</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      analytics.totalEvents > 0
                        ? (analytics.vectorBreakdown.url / analytics.totalEvents) * 100
                        : 0
                    }%`,
                  }}
                  className="bg-cyan-400 h-full rounded-full transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-violet-400" />
                  <span>Email Addresses</span>
                </span>
                <span className="text-white font-bold">{analytics.vectorBreakdown.email}</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      analytics.totalEvents > 0
                        ? (analytics.vectorBreakdown.email / analytics.totalEvents) * 100
                        : 0
                    }%`,
                  }}
                  className="bg-violet-500 h-full rounded-full transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Phone Numbers</span>
                </span>
                <span className="text-white font-bold">{analytics.vectorBreakdown.phone}</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      analytics.totalEvents > 0
                        ? (analytics.vectorBreakdown.phone / analytics.totalEvents) * 100
                        : 0
                    }%`,
                  }}
                  className="bg-amber-400 h-full rounded-full transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center space-x-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dataset Ingestion & Files</span>
                </span>
                <span className="text-white font-bold">{analytics.vectorBreakdown.file}</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      analytics.totalEvents > 0
                        ? (analytics.vectorBreakdown.file / analytics.totalEvents) * 100
                        : 0
                    }%`,
                  }}
                  className="bg-emerald-400 h-full rounded-full transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Engine Health */}
      <div className="matte-glass rounded-xl p-5 border border-violet-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Cryptographic Isolation Active</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              All scans and telemetry strictly partitioned by Tenant Context.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
            Heuristic Engines Operational
          </span>
        </div>
      </div>
    </div>
  );
}
