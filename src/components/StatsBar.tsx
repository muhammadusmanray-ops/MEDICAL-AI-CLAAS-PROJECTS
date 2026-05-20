import React from 'react';
import { ScanStats } from '../types';
import { Activity, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StatsBarProps {
  stats: ScanStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" id="stats-container">
      {/* Total Scans Card */}
      <div 
        id="stat-total-scans"
        className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-sky-500/40 hover:translate-y-[-2px] group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 font-mono tracking-wider uppercase">Total Scans</p>
            <h3 className="mt-1 text-2xl font-bold font-sans text-white tracking-tight">
              {stats.totalScans.toLocaleString()}
            </h3>
          </div>
          <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400 border border-sky-500/10">
            <Activity className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-2 text-[10px] font-mono text-sky-400/80 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          SYSTEM LIVE & RECORDING
        </div>
      </div>

      {/* Accuracy Card */}
      <div 
        id="stat-accuracy"
        className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:translate-y-[-2px] group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 font-mono tracking-wider uppercase">System Accuracy</p>
            <h3 className="mt-1 text-2xl font-bold font-sans text-emerald-400 tracking-tight">
              {stats.accuracy}%
            </h3>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/10">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-2 text-[10px] font-mono text-emerald-400/80 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          VALIDATED AT UNIV LABS
        </div>
      </div>

      {/* Diseases Detected Card */}
      <div 
        id="stat-diseases"
        className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-rose-500/40 hover:translate-y-[-2px] group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 font-mono tracking-wider uppercase">Anomalies Found</p>
            <h3 className="mt-1 text-2xl font-bold font-sans text-rose-400 tracking-tight">
              {stats.diseasesDetected}
            </h3>
          </div>
          <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400 border border-rose-500/10">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-2 text-[10px] font-mono text-rose-400/80 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          ACTIONABLE HIGHLIGHTS
        </div>
      </div>

      {/* Normal Cases Card */}
      <div 
        id="stat-normals"
        className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/40 hover:translate-y-[-2px] group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 font-mono tracking-wider uppercase">Clear Scans</p>
            <h3 className="mt-1 text-2xl font-bold font-sans text-slate-100 tracking-tight">
              {stats.normalCases.toLocaleString()}
            </h3>
          </div>
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/10">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-2 text-[10px] font-mono text-slate-400/80 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          HEALTH CONGRUENT RATIO
        </div>
      </div>
    </div>
  );
};
