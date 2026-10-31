import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Eye,
  Globe,
  Lock,
  RefreshCw,
  FileSpreadsheet,
  Database,
  Search,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

export default function FileVerifyPage() {
  const [file, setFile] = useState(null);
  const [datasetName, setDatasetName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'datasets'
  const fileInputRef = useRef(null);

  const fetchDatasets = async () => {
    setLoadingDatasets(true);
    try {
      const res = await axiosClient.get('/verify/datasets');
      if (res.data && res.data.datasets) {
        setDatasets(res.data.datasets);
      }
    } catch (err) {
      console.warn('Failed to fetch datasets:', err.message);
    } finally {
      setLoadingDatasets(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setFile(f);
      if (!datasetName) setDatasetName(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      if (!datasetName) setDatasetName(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('datasetName', datasetName.trim() || file.name);

    try {
      const res = await axiosClient.post('/verify/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data && res.data.dataset) {
        setResult(res.data.dataset);
        fetchDatasets();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'File ingestion failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await axiosClient.post(`/verify/datasets/${id}/publish`);
      fetchDatasets();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update publication status');
    }
  };

  const handleDeleteDataset = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dataset? This action is irreversible.')) {
      return;
    }
    try {
      await axiosClient.delete(`/verify/datasets/${id}`);
      fetchDatasets();
      if (result && result.id === id) setResult(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete dataset');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl font-mono">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
              <span>Dataset & File Security Pipeline</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              PII & DATA QUALITY ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ingest structured files (CSV, JSON, TXT), detect PII exfiltration risks, duplicate entries, and audit data hygiene.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 bg-black/40 p-1 rounded-xl border border-violet-500/20 text-xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-violet-600/30 text-white border border-violet-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload & Audit
          </button>
          <button
            onClick={() => {
              setActiveTab('datasets');
              fetchDatasets();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'datasets'
                ? 'bg-violet-600/30 text-white border border-violet-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>My Datasets ({datasets.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-violet-500/30 hover:border-cyan-400/50 rounded-2xl p-8 text-center matte-glass transition-colors relative cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv,.json,.txt"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/25 flex items-center justify-center text-cyan-300">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {file ? file.name : 'Drag & drop your CSV or JSON dataset here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports .csv, .json, .txt up to 25 MB. Zero untrusted server execution.
                </p>
              </div>
              {file && (
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs border border-cyan-400/30">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>Ready for parsing</span>
                </div>
              )}
            </div>
          </div>

          {/* Dataset Name & Action */}
          <div className="matte-glass rounded-xl p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Dataset Display Label:
              </label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="e.g. Q3 Customer Transaction Log"
                className="w-full bg-[#080612]/70 border border-violet-500/25 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUploadAndAnalyze}
                disabled={uploading || !file}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Processing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-cyan-300" />
                    <span>Run Ingestion & PII Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results View */}
          {result && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Quality Banner */}
              <div
                className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  result.riskLevel === 'CRITICAL'
                    ? 'bg-rose-950/25 border-rose-500/40 text-rose-200'
                    : result.riskLevel === 'HIGH'
                    ? 'bg-amber-950/25 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  {result.riskLevel === 'CRITICAL' ? (
                    <ShieldAlert className="w-7 h-7 text-rose-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-7 h-7 text-emerald-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-current">
                        {result.riskLevel} RISK (Quality: {result.dataQualityScore}/100)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Total Rows: {result.totalRecords}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white mt-1 break-all">
                      {result.filename}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Detected Columns:{' '}
                      <span className="text-cyan-300">
                        {result.columns ? result.columns.join(', ') : 'None'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end justify-center font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">PII Vulnerability</span>
                  <span
                    className={`text-sm font-bold ${
                      result.piiViolationsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.piiViolationsCount > 0
                      ? `${result.piiViolationsCount} LEAK(S) DETECTED`
                      : 'CLEAN DATASET'}
                  </span>
                </div>
              </div>

              {/* Ingestion KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
                  <span className="text-[10px] text-slate-400 uppercase block">Total Records</span>
                  <p className="text-lg font-bold text-white mt-1">{result.totalRecords || 0}</p>
                </div>
                <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
                  <span className="text-[10px] text-slate-400 uppercase block">Valid Records</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{result.validRecords || 0}</p>
                </div>
                <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
                  <span className="text-[10px] text-slate-400 uppercase block">Duplicate Rows</span>
                  <p className="text-lg font-bold text-amber-400 mt-1">{result.duplicateRecords || 0}</p>
                </div>
                <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
                  <span className="text-[10px] text-slate-400 uppercase block">Quality Score</span>
                  <p className="text-lg font-bold text-cyan-400 mt-1">{result.dataQualityScore || 0}%</p>
                </div>
              </div>

              {/* Data Preview Table */}
              {result.sampleRows && result.sampleRows.length > 0 && (
                <div className="matte-glass rounded-xl p-5 border border-violet-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                      Sample Processed Records (First {result.sampleRows.length})
                    </h4>
                    <span className="text-[10px] text-slate-400">Preview Mode</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-violet-500/20 text-slate-400 text-[11px]">
                          {result.columns &&
                            result.columns.map((col, idx) => (
                              <th key={idx} className="pb-2 pr-4 font-semibold">
                                {col}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04] text-slate-200">
                        {result.sampleRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-white/[0.02]">
                            {result.columns.map((col, cIdx) => (
                              <td key={cIdx} className="py-2 pr-4 font-mono truncate max-w-[200px]">
                                {row[col] !== undefined && row[col] !== null
                                  ? String(row[col])
                                  : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Detected PII Leaks */}
              {result.validationErrors && result.validationErrors.length > 0 && (
                <div className="matte-glass rounded-xl p-5 border border-rose-500/30 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    Audit Violations & Exfiltration Flags ({result.validationErrors.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.validationErrors.map((errItem, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-xs flex items-start space-x-2.5"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-rose-200">
                            Row #{errItem.rowIndex || idx + 1}: {errItem.type || 'Integrity Flaw'}
                          </p>
                          <p className="text-[11px] text-slate-300 mt-0.5">{errItem.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Datasets Management Tab */}
      {activeTab === 'datasets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Ingested Dataset Archive</h3>
            <button
              onClick={fetchDatasets}
              disabled={loadingDatasets}
              className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDatasets ? 'animate-spin' : ''}`} />
              <span>Refresh Catalog</span>
            </button>
          </div>

          {datasets.length === 0 ? (
            <div className="matte-glass rounded-xl p-8 text-center text-slate-400 text-xs">
              No datasets have been ingested yet. Switch to the "Upload & Audit" tab to process your first file.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {datasets.map((ds) => (
                <div
                  key={ds.id}
                  className="matte-glass rounded-xl p-4 border border-violet-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{ds.filename || ds.name}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                          ds.isPublished
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                            : 'bg-violet-500/15 text-violet-300 border border-violet-400/30'
                        }`}
                      >
                        {ds.isPublished ? 'PUBLIC' : 'PRIVATE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {ds.totalRecords || 0} rows • Quality: {ds.dataQualityScore || 100}% • Uploaded{' '}
                      {new Date(ds.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePublish(ds.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-950/40 hover:bg-violet-900/60 border border-violet-500/30 text-cyan-300 flex items-center space-x-1.5"
                    >
                      {ds.isPublished ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Make Private</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5" />
                          <span>Publish</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteDataset(ds.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30"
                      title="Delete Dataset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
