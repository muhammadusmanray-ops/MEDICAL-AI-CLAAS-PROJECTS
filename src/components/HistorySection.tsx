import React from 'react';
import { HistoryItem } from '../types';
import { Eye, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

interface HistorySectionProps {
  history: HistoryItem[];
  onSelectScan: (item: HistoryItem) => void;
  activeId?: string;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onSelectScan,
  activeId,
}) => {
  return (
    <div className="border border-slate-850 bg-slate-900/40 rounded-xl overflow-hidden backdrop-blur-md" id="history-section-wrapper">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white font-sans tracking-wide">Historical Analytics Lab Case Logs</h2>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Archived DICOM analysis sessions recorded across the research network database node.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase">
          {history.length} Record(s) Mounted
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/45 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
              <th className="px-6 py-3.5">Patient ID</th>
              <th className="px-6 py-3.5">Image Ref</th>
              <th className="px-6 py-3.5">Timestamp</th>
              <th className="px-6 py-3.5 text-center">Inference Result</th>
              <th className="px-6 py-3.5 text-right">Confidence</th>
              <th className="px-6 py-3.5">Severity</th>
              <th className="px-6 py-3.5">Region</th>
              <th className="px-6 py-3.5 text-center">Interactions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {history.map((item) => {
              const isPneumonia = item.diagnosis === 'PNEUMONIA DETECTED';
              const isActive = activeId === item.id;
              
              return (
                <tr 
                  key={item.id} 
                  className={`transition-colors text-slate-300 hover:bg-slate-800/25 ${
                    isActive ? 'bg-sky-500/5 text-white font-medium border-l-2 border-l-sky-400' : ''
                  }`}
                >
                  {/* Patient ID */}
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-200">
                    {item.patientId}
                  </td>
                  
                  {/* Image Name */}
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                    {item.imageName}
                  </td>
                  
                  {/* Timestamp */}
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                    {item.timestamp}
                  </td>
                  
                  {/* Diagnosis */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold font-mono border ${
                      isPneumonia 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {isPneumonia ? (
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                      ) : (
                        <ShieldCheck className="h-3 w-3 shrink-0" />
                      )}
                      {item.diagnosis}
                    </span>
                  </td>
                  
                  {/* Confidence */}
                  <td className="px-6 py-4 text-right font-mono text-slate-200 font-bold">
                    <span className={isPneumonia ? 'text-rose-400' : 'text-emerald-400'}>
                      {item.confidence}%
                    </span>
                  </td>
                  
                  {/* Severity */}
                  <td className="px-6 py-4">
                    <span className={`inline-block text-[10px] font-mono px-1.5 py-0.3 rounded ${
                      item.severity === 'Severe' 
                        ? 'bg-rose-950/30 text-rose-400' 
                        : item.severity === 'Moderate' 
                          ? 'bg-amber-950/30 text-amber-400' 
                          : item.severity === 'Mild' 
                            ? 'bg-sky-950/30 text-sky-400' 
                            : 'bg-slate-900 text-slate-400'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                  
                  {/* Region */}
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                    {item.region}
                  </td>
                  
                  {/* Interaction Buttons */}
                  <td className="px-6 py-3 text-center">
                    <button
                      id={`inspect-btn-${item.id}`}
                      onClick={() => onSelectScan(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${
                        isActive 
                          ? 'bg-sky-500 text-white font-bold pointer-events-none' 
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {isActive ? 'Active Review' : 'Mount Scan'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
