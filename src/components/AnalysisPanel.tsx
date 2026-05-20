import React, { useEffect, useState } from 'react';
import { HistoryItem } from '../types';
import { AlertCircle, CheckCircle, Brain, RefreshCw, CornerDownRight, FileSpreadsheet } from 'lucide-react';

interface AnalysisPanelProps {
  isAnalyzing: boolean;
  result: HistoryItem | null;
  onReset: () => void;
  onDownloadReport?: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  isAnalyzing,
  result,
  onReset,
  onDownloadReport,
}) => {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const scanSteps = [
    'Parsing DICOM tag headers & metadata...',
    'Calibrating histogram & density levels...',
    'Isolating right & left pleural spaces...',
    'Running Deep Convolutional Neural Network...',
    'Synthesizing feature anomaly metrics...',
    'Formulating diagnostic prediction stats...',
  ];

  useEffect(() => {
    if (isAnalyzing) {
      setProgress(0);
      setActiveStep(0);
      
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const increment = Math.floor(Math.random() * 8) + 4;
          return Math.min(prev + increment, 100);
        });
      }, 150);

      const stepInterval = setInterval(() => {
        setActiveStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
      }, 500);

      return () => {
        clearInterval(interval);
        clearInterval(stepInterval);
      };
    }
  }, [isAnalyzing]);

  if (!isAnalyzing && !result) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[350px] border border-dashed border-slate-800 rounded-xl bg-slate-950/25 p-8 text-center" id="analysis-empty-state">
        <div className="rounded-full bg-slate-900/80 p-4 border border-slate-800 text-slate-500 mb-4">
          <Brain className="h-8 w-8 animate-pulse text-sky-500/80" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300 font-sans">Diagnostic Inference Offline</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-xs font-mono">
          Upload or select a medical chest scan to run the deep neural model pipeline.
        </p>
      </div>
    );
  }

  // Circular progress specs
  const strokeWidth = 10;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div id="analysis-panel-container" className="h-full">
      {isAnalyzing ? (
        /* ================= LOADING SCANNING STATE ================= */
        <div className="flex flex-col justify-between h-full min-h-[350px] border border-sky-500/20 rounded-xl bg-slate-900/30 p-6 backdrop-blur-md relative overflow-hidden" id="analysis-loading-state">
          {/* Neon scan sweep background */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-[bounce_2.5s_infinite]" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-mono text-sky-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping inline-block" />
                Active Model Inference
              </span>
              <span className="text-xs font-mono text-slate-400">{progress}%</span>
            </div>

            {/* Simulated Radar Circular Sweep */}
            <div className="flex justify-center py-6">
              <div className="relative w-32 h-32 rounded-full border border-sky-500/20 flex items-center justify-center">
                <div className="absolute inset-2 rounded-full border border-sky-500/10" />
                <div className="absolute inset-8 rounded-full border border-sky-500/10" />
                {/* Spinning Sweep Shader */}
                <div className="absolute inset-0 rounded-full border-t border-r border-sky-400/80 animate-spin" style={{ animationDuration: '1.2s' }} />
                <Brain className="h-10 w-10 text-sky-400" />
              </div>
            </div>

            {/* Neural Telemetry List */}
            <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-900/80 font-mono text-[10px] space-y-1.5 min-h-[85px] text-slate-400">
              <div className="text-sky-400 font-semibold mb-1 flex items-center gap-1">
                <span>&gt;&gt;</span> LOGS OVERVIEW:
              </div>
              <div className="line-clamp-3">
                {scanSteps.slice(Math.max(0, activeStep - 2), activeStep + 1).map((step, idx) => (
                  <div key={idx} className={`${idx === (activeStep <= 2 ? activeStep : 2) ? 'text-white font-medium' : 'text-slate-500'}`}>
                    {idx === (activeStep <= 2 ? activeStep : 2) ? '●' : '✓'} {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-150 shadow-[0_0_6px_#38bdf8]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>MODEL_INFERENCE_X_2026</span>
              <span>EST_REMAINING: {Math.max(0, Math.ceil((100 - progress) * 0.03))}s</span>
            </div>
          </div>
        </div>
      ) : (
        /* ================= DIAGNOSIS READY STATE ================= */
        result && (
          <div className="border border-slate-800 rounded-xl bg-slate-900/40 p-6 backdrop-blur-md space-y-6 flex flex-col justify-between h-full" id="analysis-result-state">
            <div className="space-y-4">
              {/* Header Status Badge */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                  Diagnostics Matrix
                </span>
                <span className="text-[10px] font-mono text-slate-500">{result.timestamp}</span>
              </div>

              {/* Color Coded Status Card and Diagnosis Title */}
              <div 
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  result.diagnosis === 'PNEUMONIA DETECTED' 
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' 
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                }`}
              >
                {result.diagnosis === 'PNEUMONIA DETECTED' ? (
                  <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Primary Diagnosis</h4>
                  <h3 className={`text-lg font-bold font-sans tracking-wide mt-0.5 ${
                    result.diagnosis === 'PNEUMONIA DETECTED' ? 'text-rose-400 shadow-rose-950' : 'text-emerald-400 shadow-emerald-950'
                  }`}>
                    {result.diagnosis}
                  </h3>
                  <p className="text-[10px] mt-1 text-slate-400 font-mono">
                    Model has registered visual consolidate infiltrations representing high-confidence density anomalies.
                  </p>
                </div>
              </div>

              {/* Circle Confidence Ring Metric */}
              <div className="flex items-center justify-around bg-slate-950/50 rounded-xl p-4 border border-slate-900/80">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r={radius}
                      className="text-slate-800"
                      strokeWidth={strokeWidth}
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r={radius}
                      strokeWidth={strokeWidth}
                      // Smooth anim stroke dash
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - (result.confidence / 100) * circumference}
                      strokeLinecap="round"
                      stroke={result.diagnosis === 'PNEUMONIA DETECTED' ? '#f43f5e' : '#10b981'}
                      fill="transparent"
                      className="transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-bold font-sans text-white">{result.confidence}%</span>
                    <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest">Confidence</span>
                  </div>
                </div>

                <div className="space-y-2 text-left shrink-0">
                  <div className="text-[10px] font-mono text-slate-400">
                    <div>ACCURACY MODEL RUN</div>
                    <div className="text-white font-semibold">ResNet-50 Pipeline</div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    <div>PATIENT REF IDENT</div>
                    <div className="text-white font-semibold">{result.patientId}</div>
                  </div>
                </div>
              </div>

              {/* 3 Detail Metrics Column */}
              <div className="grid grid-cols-1 gap-2.5">
                {/* Severity Metric */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/30 border border-slate-850/80 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px]">
                    <CornerDownRight className="h-3.5 w-3.5 text-sky-400" />
                    SEVERITY INDEX
                  </div>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    result.severity === 'Severe' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : result.severity === 'Moderate' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : result.severity === 'Mild' 
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                          : 'bg-slate-800 text-slate-400'
                  }`}>
                    {result.severity}
                  </span>
                </div>

                {/* Region Affected Metric */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/30 border border-slate-850/80 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px]">
                    <CornerDownRight className="h-3.5 w-3.5 text-sky-400" />
                    REGION AFFECTED
                  </div>
                  <span className="font-mono font-medium text-[11px] text-slate-200">
                    {result.region}
                  </span>
                </div>

                {/* Recommendation Metric */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-slate-950/30 border border-slate-850/80 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px]">
                    <CornerDownRight className="h-3.5 w-3.5 text-sky-400" />
                    RECOMMENDED CLINICAL PATHWAY
                  </div>
                  <p className="text-[10px] font-sans text-slate-400 italic pl-5 line-clamp-2">
                    "{result.recommendation}"
                  </p>
                </div>
              </div>
            </div>

            {/* Print or Reset Controls */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60 font-mono">
              <button
                id="analyse-btn-reset"
                onClick={onReset}
                className="flex-[1] flex items-center justify-center gap-1.5 py-2 px-3 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                New Scan
              </button>
              {onDownloadReport && (
                <button
                  id="analyse-btn-download"
                  onClick={onDownloadReport}
                  className="flex-[1.5] shadow-[0_0_12px_rgba(56,189,248,0.15)] flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-lg text-xs font-bold font-sans cursor-pointer transition-all duration-200 hover:shadow-[0_0_15px_rgba(56,189,248,0.30)] active:scale-95"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Generate DICOM Lab Report
                </button>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
