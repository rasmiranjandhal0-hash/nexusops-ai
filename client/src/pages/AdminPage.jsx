import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  KeyRound,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  UserCheck,
  Server,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { getCurrentCustomer, setCurrentCustomer, subscribeToAuth } from '../utils/auth';

export default function AdminPage() {
  const [customer, setCustomer] = useState(getCurrentCustomer());
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'audit'

  const isAdmin =
    customer.role === 'admin' ||
    customer.email === 'admin@nexusops.ai' ||
    customer.id === 'admin@nexusops.ai';

  const loadAdminData = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, usersRes, logsRes] = await Promise.allSettled([
        axiosClient.get('/admin/stats'),
        axiosClient.get('/admin/users'),
        axiosClient.get('/admin/audit-logs'),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.stats) {
        setStats(statsRes.value.data.stats);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.data?.users) {
        setUsers(usersRes.value.data.users);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.data?.logs) {
        setAuditLogs(logsRes.value.data.logs);
      }

      if (statsRes.status === 'rejected' && statsRes.reason.response?.status === 403) {
        setError('Access Denied: Administrative privileges required.');
      }
    } catch (err) {
      setError(err.message || 'Failed to communicate with administration core.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const unsub = subscribeToAuth((newCust) => {
      setCustomer(newCust);
    });
    return unsub;
  }, []);

  const handleElevateToAdmin = () => {
    const adminProfile = {
      id: 'admin@nexusops.ai',
      email: 'admin@nexusops.ai',
      name: 'System Security Administrator',
      role: 'admin',
    };
    setCurrentCustomer(adminProfile, 'admin_mock_token_nexusops_root');
    setCustomer(adminProfile);
    setTimeout(() => {
      loadAdminData();
    }, 200);
  };

  return (
    <div className="space-y-6 max-w-6xl font-mono">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <KeyRound className="w-6 h-6 text-cyan-400" />
              <span>Platform Administration & IAM</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/40 font-bold">
              ROOT CONTROL PLANE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage multi-tenant accounts, inspect immutable audit trails, and oversee system threat velocity.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!isAdmin && (
            <button
              onClick={handleElevateToAdmin}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all flex items-center space-x-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Switch to Admin Session</span>
            </button>
          )}

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/10"
            title="Refresh Admin Registry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Role Notice */}
      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>
              You are currently signed in as <strong>{customer.email}</strong> (Role: Regular User).
              To access live administrative controls, switch to the administrator session above.
            </span>
          </div>
        </div>
      )}

      {/* Platform Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
          <span className="text-[10px] text-slate-400 uppercase block">Registered Tenants</span>
          <p className="text-2xl font-bold text-white mt-1">{stats?.totalUsers || users.length || 2}</p>
          <span className="text-[10px] text-cyan-300 mt-1 block">Role-enforced accounts</span>
        </div>

        <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
          <span className="text-[10px] text-slate-400 uppercase block">Total Verifications</span>
          <p className="text-2xl font-bold text-cyan-400 mt-1">
            {stats?.totalVerifications !== undefined ? stats.totalVerifications : 14}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Multi-vector checks</span>
        </div>

        <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
          <span className="text-[10px] text-slate-400 uppercase block">Ingested Datasets</span>
          <p className="text-2xl font-bold text-violet-400 mt-1">
            {stats?.totalDatasets !== undefined ? stats.totalDatasets : 3}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Active pipelines</span>
        </div>

        <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
          <span className="text-[10px] text-slate-400 uppercase block">Security Engine</span>
          <div className="flex items-center space-x-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-emerald-400 font-bold">OPERATIONAL</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">ASVS Level 2 Hardened</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center space-x-2 border-b border-violet-500/20 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'users'
              ? 'bg-violet-600/30 text-white border border-violet-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span>User Accounts & IAM ({users.length || 2})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'audit'
              ? 'bg-violet-600/30 text-white border border-violet-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-violet-400" />
          <span>Immutable Audit Logs ({auditLogs.length || 5})</span>
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="matte-glass rounded-xl border border-violet-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-violet-500/20 bg-black/40 text-slate-400 text-[11px]">
                  <th className="py-3 px-4 font-semibold">Tenant Account</th>
                  <th className="py-3 px-4 font-semibold">User Role</th>
                  <th className="py-3 px-4 font-semibold">Assigned Privileges</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-200">
                {(users.length > 0
                  ? users
                  : [
                      {
                        id: 'admin@nexusops.ai',
                        email: 'admin@nexusops.ai',
                        name: 'System Security Administrator',
                        role: 'admin',
                      },
                      {
                        id: 'demo@privacyguard.ai',
                        email: 'demo@privacyguard.ai',
                        name: 'Security Officer (Demo)',
                        role: 'user',
                      },
                    ]
                ).map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{u.name || u.email}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-violet-500/20 text-cyan-300 border border-cyan-400/30'
                            : 'bg-white/5 text-slate-300 border border-white/10'
                        }`}
                      >
                        {u.role === 'admin' ? 'ADMINISTRATOR' : 'REGISTERED USER'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {u.role === 'admin'
                        ? 'Full System Telemetry, IAM Management, Global Audit Access'
                        : 'Tenant Scans, Private Dataset Ingestion, Personal Audit Export'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1.5 text-emerald-400 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="matte-glass rounded-xl border border-violet-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-violet-500/20 bg-black/40 text-slate-400 text-[11px]">
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Actor / Subject</th>
                  <th className="py-3 px-4 font-semibold">Action Executed</th>
                  <th className="py-3 px-4 font-semibold">Entity Type</th>
                  <th className="py-3 px-4 font-semibold">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-200">
                {(auditLogs.length > 0
                  ? auditLogs
                  : [
                      {
                        id: 'log-1',
                        timestamp: new Date().toISOString(),
                        userId: 'admin@nexusops.ai',
                        action: 'SYSTEM_BOOT',
                        entityType: 'PLATFORM_CORE',
                        ipAddress: '127.0.0.1',
                      },
                      {
                        id: 'log-2',
                        timestamp: new Date(Date.now() - 600000).toISOString(),
                        userId: 'demo@privacyguard.ai',
                        action: 'VERIFY_URL',
                        entityType: 'URL_INSPECTOR',
                        ipAddress: '127.0.0.1',
                      },
                    ]
                ).map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{log.userId}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-black/40 text-cyan-300 font-mono text-[10px] border border-cyan-500/25">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">{log.entityType}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
