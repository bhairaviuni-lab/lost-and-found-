import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Server,
  CloudLightning,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

interface SupabaseSyncModalProps {
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{
    projectId: string;
    url: string;
    connected: boolean;
    tableExists: boolean;
    message: string;
    error?: string;
    sqlSetupScript: string;
    dashboardSqlUrl: string;
  } | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getSupabaseStatus();
      setStatus(res);
    } catch (err: any) {
      console.error('Failed to get Supabase status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySql = () => {
    if (status?.sqlSetupScript) {
      navigator.clipboard.writeText(status.sqlSetupScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      const res = await api.syncAllToSupabase();
      setSyncResult(res.message);
      await fetchStatus();
    } catch (err: any) {
      setSyncResult(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <CloudLightning className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">
                  Supabase Backend Integration
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5 font-mono">
                Project ID: {status?.projectId || 'nldzgkhjrhztwipecdnb'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1 text-sm text-slate-700">
          
          {/* Status Banner */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Connection Status
              </span>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Re-check Status
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block font-medium">Supabase Project URL</span>
                <span className="font-mono font-bold text-slate-800 text-[11px] truncate block mt-0.5">
                  https://nldzgkhjrhztwipecdnb.supabase.co
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block font-medium">API Key Configured</span>
                <span className="font-mono font-bold text-emerald-700 text-[11px] flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  sb_publishable_AbFAQ...
                </span>
              </div>
            </div>

            {/* Table status note */}
            {status?.tableExists ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Table 'items' is LIVE in Supabase!</strong> Every reported lost and found item is being inserted into your Supabase database table.
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>1-Step Setup Required: Create the table in Supabase</span>
                </div>
                <p className="text-amber-700 text-[11px] leading-relaxed">
                  Your project credentials are successfully connected, but the <code>public.items</code> table has not been created in your Supabase database yet. Run the SQL script below in your Supabase SQL Editor to create it!
                </p>
              </div>
            )}
          </div>

          {/* SQL Setup Script Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Supabase SQL Setup Script
                </h3>
                <p className="text-xs text-slate-500">
                  Execute this in your Supabase dashboard once to initialize the tables.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://supabase.com/dashboard/project/nldzgkhjrhztwipecdnb/sql"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 border border-emerald-200 transition-colors"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-48 border border-slate-800">
              <pre>{status?.sqlSetupScript}</pre>
            </div>
          </div>

          {/* Sync actions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-slate-800">
                Sync Current Reports to Supabase
              </h4>
              <p className="text-[11px] text-slate-500">
                Push all existing lost and found reports into your Supabase database now.
              </p>
            </div>

            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <CloudLightning className="w-3.5 h-3.5" />
              <span>{syncing ? 'Syncing...' : 'Sync All Items to Supabase'}</span>
            </button>
          </div>

          {syncResult && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium">
              {syncResult}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Direct REST & Realtime Ready
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
