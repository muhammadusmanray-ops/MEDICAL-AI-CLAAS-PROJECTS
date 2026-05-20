import React, { useState, useRef } from 'react';
import { ProcessingFilter } from '../types';
import { Upload, FileImage, ShieldCheck, Zap, Maximize2, Sparkles, Copy } from 'lucide-react';
import { MedicalXRaySVG } from './MedicalXRaySVG';

interface WorkbenchPanelProps {
  uploadedImageUrl: string | null;
  uploadedFileName: string | null;
  activeFilter: ProcessingFilter;
  hasPneumonia: boolean;
  onFilterChange: (filter: ProcessingFilter) => void;
  onFileUpload: (file: File) => void;
  onSelectPresets: (type: 'normal' | 'pneumonia') => void;
}

export const WorkbenchPanel: React.FC<WorkbenchPanelProps> = ({
  uploadedImageUrl,
  uploadedFileName,
  activeFilter,
  hasPneumonia,
  onFilterChange,
  onFileUpload,
  onSelectPresets,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'application/dicom', '.dcm'];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (file.type.startsWith('image/') || fileExt === 'dcm') {
        onFileUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Determine standard filter description
  const getFilterExplanation = (): string => {
    switch (activeFilter) {
      case 'edge':
        return 'Edge Detection: Amplifies structural gradients and boundaries to assist radiologic fissure analysis. Formula: c(200%) b(150%).';
      case 'heatmap':
        return 'Infiltration Heat Map: Translates tissue absorption densities into multi-spectral absorption colors. Formula: s(100%) h(280°) sat(300%).';
      case 'contrast':
        return 'Contrast Booster: Maximizes bone/fluid boundary contrast ratios to emphasize micro-calcifications. Formula: c(250%) sat(150%).';
      case 'denoise':
        return 'Noise Reduction (Denoise): Eliminates low-level sensor scatter and grain artifacts through high-clarity Gaussian smoothing. Formula: g_blur(1.2px) b(105%) c(110%).';
      case 'sharpen':
        return 'Highlight Sharpening: Boosts high-frequency local detail boundaries and fine fissures via 3x3 convolution masking matrix.';
      default:
        return 'Raw Spectrum: Standard unaltered digital projection. No computational modifications active.';
    }
  };

  return (
    <div className="border border-slate-800 bg-slate-900/15 rounded-xl p-5 backdrop-blur-md space-y-5" id="workbench-panel-container">
      {/* Upload Zone & Comparative Interactive Views Container */}
      {!uploadedImageUrl ? (
        /* ================= UPLOAD ZONE (Center) ================= */
        <div id="workbench-upload-zone" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-white font-sans">Aquire DICOM or Image Frame</h4>
              <p className="text-[11px] text-slate-400 font-mono">Feed original scan data into the deep neural network.</p>
            </div>
            {/* Quick Presets Toggle for instant CS Demonstration with zero file downloads */}
            <div className="flex items-center gap-1.5 self-end">
              <span className="text-[10px] font-mono text-slate-500 mr-1.5">DEMO PRESETS:</span>
              <button
                id="btn-preset-normal"
                onClick={() => onSelectPresets('normal')}
                className="px-2.5 py-1 text-[10px] font-mono font-medium rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all duration-200 cursor-pointer"
              >
                Normal Chest X-Ray
              </button>
              <button
                id="btn-preset-pneumonia"
                onClick={() => onSelectPresets('pneumonia')}
                className="px-2.5 py-1 text-[10px] font-mono font-medium rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all duration-200 cursor-pointer"
              >
                Pneumonia Infection
              </button>
            </div>
          </div>

          <div
            id="drag-drop-container"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`h-[280px] w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 cursor-pointer select-none group ${
              isDragOver 
                ? 'border-sky-400 bg-sky-500/5 shadow-[0_0_20px_rgba(56,189,248,0.15)] scale-[0.99]' 
                : 'border-slate-800 bg-slate-950/30 hover:border-slate-700 hover:bg-slate-900/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
            />
            
            <div className="relative mb-4">
              <div className="absolute inset-[-12px] bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-colors" />
              <div className="relative w-14 h-14 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-center text-slate-400 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-all duration-300 shadow-inner">
                <Upload className="h-6 w-6 animate-bounce" />
              </div>
            </div>

            <h3 className="text-sm font-semibold text-white font-sans tracking-wide">
              {isDragOver ? "Drop Medical Image Here" : "Drop your X-Ray or Medical Image here"}
            </h3>
            
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm leading-relaxed font-sans">
              Drag-and-drop file here or click to browse files from your laboratory system.
            </p>

            <div className="mt-4 flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase">
              <span>Supports: JPG, PNG, DICOM (.dcm)</span>
              <span>•</span>
              <span>Secure Sanitization Verified</span>
            </div>
          </div>
        </div>
      ) : (
        /* ================= COMPARATIVE SIDE BY SIDE PANEL ================= */
        <div id="workbench-comparative-zone" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.3 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  ACTIVE CASESTUDY
                </span>
                <span className="text-xs font-mono font-medium text-slate-400">
                  {uploadedFileName || 'SIM_CASE_XRAY_PRESET.DCM'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end">
              <span className="text-[10px] font-mono text-slate-500 mr-1">PRESETS:</span>
              <button
                id="preset-normal-sub"
                onClick={() => onSelectPresets('normal')}
                className="px-2 py-0.8 text-[9px] font-mono rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/15 transition-all duration-200 cursor-pointer"
              >
                Clear Normal
              </button>
              <button
                id="preset-pneumonia-sub"
                onClick={() => onSelectPresets('pneumonia')}
                className="px-2 py-0.8 text-[9px] font-mono rounded bg-slate-900 hover:bg-slate-800 text-rose-400 border border-rose-500/15 transition-all duration-200 cursor-pointer"
              >
                Load Infection
              </button>
              <button
                id="btn-remove-simulation"
                onClick={() => {
                  fileInputRef.current && (fileInputRef.current.value = '');
                  onSelectPresets('normal'); // revert
                  onFilterChange('none');
                }}
                className="text-slate-500 hover:text-rose-400 text-[10px] font-mono px-2 py-0.8 hover:bg-rose-500/10 rounded transition-colors cursor-pointer ml-1"
              >
                Reset Applet
              </button>
            </div>
          </div>

          {/* SIDE SPEC SIDE BY SIDE PICTURES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Frame on Left */}
            <div className="space-y-1.5" id="original-frame-panel">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Maximize2 className="h-3 w-3 text-sky-400" />
                  ORIGINAL SPECIMEN
                </span>
                <span>L-SENS: RAW</span>
              </div>
              
              <div className="relative group">
                {/* Fallback to custom SVG diagram if we are using the internal high-fidelity generator, otherwise render uploaded image */}
                {uploadedImageUrl === 'procedural-svg' ? (
                  <MedicalXRaySVG filter="none" hasPneumonia={hasPneumonia} isProcessed={false} />
                ) : (
                  <div className="relative aspect-square w-full bg-slate-950 overflow-hidden rounded-xl border border-slate-800/80">
                    <img 
                      src={uploadedImageUrl || ''} 
                      alt="Original specimen" 
                      className="w-full h-full object-contain"
                      id="img-raw-specimen"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/90 border border-slate-700/50 backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-mono font-medium text-slate-300 uppercase">Original Specimen</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Processed Frame on Right with live filters applied */}
            <div className="space-y-1.5" id="processed-frame-panel">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-teal-400">
                  <Sparkles className="h-3 w-3 text-teal-400" />
                  PROCESSED SPECTRAL MAP
                </span>
                <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 border border-teal-500/10">
                  {activeFilter}
                </span>
              </div>

              <div className="relative">
                {uploadedImageUrl === 'procedural-svg' ? (
                  <MedicalXRaySVG filter={activeFilter} hasPneumonia={hasPneumonia} isProcessed={true} />
                ) : (
                  <div className="relative aspect-square w-full bg-slate-950 overflow-hidden rounded-xl border border-slate-800/80">
                    <img
                      src={uploadedImageUrl || ''}
                      alt="Processed specimen"
                      className="w-full h-full object-contain transition-all duration-300"
                      id="img-processed-specimen"
                      style={{
                        filter: 
                          activeFilter === 'edge' ? 'contrast(200%) brightness(155%) grayscale(100%)' :
                          activeFilter === 'heatmap' ? 'sepia(100%) hue-rotate(280deg) saturate(300%)' :
                          activeFilter === 'contrast' ? 'contrast(250%) saturate(150%)' :
                          activeFilter === 'denoise' ? 'blur(0.8px) contrast(115%) brightness(102%)' :
                          activeFilter === 'sharpen' ? 'url(#sharpen-filter) contrast(115%)' : 'none'
                      }}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/90 border border-slate-700/50 backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                      <span className="text-[10px] font-mono font-medium text-slate-300 uppercase">Processed ({activeFilter})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive filter control list */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3" id="processing-matrix">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-mono font-semibold text-slate-300">COMPUTATIONAL FILTER ENHANCEMENTS:</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">GPU Parallel Filters Live</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                id="btn-filter-none"
                onClick={() => onFilterChange('none')}
                className={`py-2 px-1 text-center rounded-lg text-[11px] font-mono font-medium cursor-pointer transition-all duration-200 border ${
                  activeFilter === 'none'
                    ? 'bg-slate-800 text-white border-slate-600 shadow-md'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/40 hover:text-slate-300'
                }`}
              >
                No Filter
              </button>

              <button
                id="btn-filter-edge"
                onClick={() => onFilterChange('edge')}
                className={`py-2 px-1 text-center rounded-lg text-[11px] font-mono font-medium cursor-pointer transition-all duration-200 border ${
                  activeFilter === 'edge'
                    ? 'bg-sky-500/10 text-sky-400 border-sky-400/40 shadow-md shadow-sky-500/5'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/40 hover:text-sky-400/80'
                }`}
              >
                💀 Edge Detect
              </button>

              <button
                id="btn-filter-heatmap"
                onClick={() => onFilterChange('heatmap')}
                className={`py-2 px-1 text-center rounded-lg text-[11px] font-mono font-medium cursor-pointer transition-all duration-200 border ${
                  activeFilter === 'heatmap'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-400/40 shadow-md shadow-rose-500/5'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/40 hover:text-rose-400/80'
                }`}
              >
                🔥 Heat Map
              </button>

              <button
                id="btn-filter-contrast"
                onClick={() => onFilterChange('contrast')}
                className={`py-2 px-1 text-center rounded-lg text-[11px] font-mono font-medium cursor-pointer transition-all duration-200 border ${
                  activeFilter === 'contrast'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/40 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/40 hover:text-emerald-400/80'
                }`}
              >
                ⚡ Contrast
              </button>

              <button
                id="btn-filter-denoise"
                onClick={() => onFilterChange('denoise')}
                className={`py-2 px-1 text-center rounded-lg text-[11px] font-mono font-medium cursor-pointer transition-all duration-200 border ${
                  activeFilter === 'denoise'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-400/40 shadow-md shadow-amber-500/5'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/40 hover:text-amber-400/80'
                }`}
              >
                🛡️ Denoise
              </button>

              <button
                id="btn-filter-sharpen"
                onClick={() => onFilterChange('sharpen')}
                className={`py-2 px-1 text-center rounded-lg text-[11px] font-mono font-medium cursor-pointer transition-all duration-200 border ${
                  activeFilter === 'sharpen'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-400/40 shadow-md shadow-purple-500/5'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/40 hover:text-purple-400/80'
                }`}
              >
                ✨ Sharpen
              </button>
            </div>

            {/* Explanation card for selected filter representation */}
            <div className="text-[10px] font-mono text-slate-400 bg-slate-950/90 rounded border border-slate-900 p-2 text-start flex items-start gap-1.5 leading-relaxed">
              <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <span>{getFilterExplanation()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
