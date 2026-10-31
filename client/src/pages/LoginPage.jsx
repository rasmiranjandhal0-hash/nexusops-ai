import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await loginDemo();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center space-x-2.5 mb-8 group">
        <div className="w-10 h-10 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-tight text-slate-100 text-lg">NexusOps AI</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
              Command Center
            </span>
          </div>
          <p className="text-xs text-slate-400">Autonomous Multi-Agent Enterprise Orchestrator</p>
        </div>
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-100">Sign in to Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your workspaces, connected systems, and agent orchestration pipelines.
          </p>
        </div>

        {/* 1-Click Demo Fill Button */}
        <div className="mb-6 p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-cyan-200 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Evaluator Demo Account</span>
            </div>
            <div className="text-[11px] text-cyan-400/80 font-mono mt-0.5">
              demo@nexusops.ai
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-50"
          >
            1-Click Login
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Enterprise Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@enterprise.com"
                className="w-full rounded bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded text-xs font-semibold text-slate-950 bg-slate-100 hover:bg-white transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In with JWT'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>Don't have an enterprise account? </span>
          <Link to="/register" className="text-cyan-400 hover:underline font-medium">
            Register Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
