import React from 'react';
import { ProcessingFilter } from '../types';

interface MedicalXRayProps {
  filter: ProcessingFilter;
  hasPneumonia: boolean;
  className?: string;
  isProcessed?: boolean;
}

export const MedicalXRaySVG: React.FC<MedicalXRayProps> = ({
  filter,
  hasPneumonia,
  className = '',
  isProcessed = false,
}) => {
  // Determine CSS and SVG filters based on the selected ProcessingFilter
  const getFilterStyle = (): React.CSSProperties => {
    if (!isProcessed) return {};

    switch (filter) {
      case 'edge':
        // Edge detection formula specified in prompt plus custom enhancements for nice canvas representation
        return { filter: 'contrast(200%) brightness(150%) grayscale(100%)' };
      case 'heatmap':
        // Heat Map formula specified in prompt
        return { filter: 'sepia(100%) hue-rotate(280deg) saturate(300%)' };
      case 'contrast':
        // Contrast enhancement specified in prompt
        return { filter: 'contrast(250%) saturate(150%)' };
      case 'denoise':
        // Noise reduction filter utilizing Gaussian smoothing to enhance signal transparency
        return { filter: 'url(#denoise-filter) brightness(105%) contrast(110%)' };
      case 'sharpen':
        // High-frequency detail enhancement using edge sharpening convolution matrix
        return { filter: 'url(#sharpen-filter) contrast(115%)' };
      default:
        return {};
    }
  };

  return (
    <div className={`relative aspect-square w-full bg-slate-950 overflow-hidden rounded-xl border border-slate-800/80 ${className}`}>
      {/* Dynamic Scanline Grid Overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      
      {/* Vector Graphics for Procedural X-ray */}
      <svg
        id={isProcessed ? "processed-svg-canvas" : "original-svg-canvas"}
        viewBox="0 0 400 400"
        className="w-full h-full transition-all duration-300 select-none"
        style={getFilterStyle()}
      >
        <defs>
          {/* Lungs Radial Gradients */}
          <radialGradient id="lung-grad-left" cx="40%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="lung-grad-right" cx="60%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>

          {/* Pneumonia Consolidation Lesion (Infiltration) */}
          <radialGradient id="pneumonia-lesion" cx="50%" cy="50%" r="40%">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.65" />
            <stop offset="40%" stopColor="#cbd5e1" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#94a3b8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Glow effect for diagnostic marker */}
          <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Sharpen Convolution Filter */}
          <filter id="sharpen-filter">
            <feConvolveMatrix order="3" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0" preserveAlpha="true" />
          </filter>

          {/* Denoise Gaussian Filter */}
          <filter id="denoise-filter">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        {/* Background Chamber */}
        <rect width="400" height="400" fill="#020617" />

        {/* Outer Torso Silhouette Constraint */}
        <path
          d="M 60,390 C 60,260 90,80 200,80 C 310,80 340,260 340,390"
          fill="none"
          stroke="#1e293b"
          strokeWidth="3"
          strokeDasharray="4 4"
        />

        {/* Bilateral Lung Cavities (Left and Right) */}
        {/* Left Lung */}
        <path
          d="M 190,120 C 130,105 100,120 90,180 C 80,240 85,320 120,340 C 150,350 175,320 190,300 Z"
          fill="url(#lung-grad-left)"
          stroke="#334155"
          strokeWidth="1.5"
        />
        {/* Right Lung */}
        <path
          d="M 210,120 C 270,105 300,120 310,180 C 320,240 315,320 280,340 C 250,350 225,320 210,300 Z"
          fill="url(#lung-grad-right)"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Bronchial Tree branches (Visual detailing inside lungs) */}
        {/* Left main bronchus */}
        <path d="M 190,160 Q 150,180 130,220" fill="none" stroke="#475569" strokeWidth="2.5" opacity="0.6" />
        <path d="M 155,185 Q 130,195 115,220" fill="none" stroke="#475569" strokeWidth="1.5" opacity="0.5" />
        <path d="M 145,210 Q 120,225 112,250" fill="none" stroke="#475569" strokeWidth="1" opacity="0.4" />
        <path d="M 172,170 Q 178,210 160,250" fill="none" stroke="#475569" strokeWidth="1.5" opacity="0.5" />

        {/* Right main bronchus */}
        <path d="M 210,160 Q 250,180 270,220" fill="none" stroke="#475569" strokeWidth="2.5" opacity="0.6" />
        <path d="M 245,185 Q 270,195 285,220" fill="none" stroke="#475569" strokeWidth="1.5" opacity="0.5" />
        <path d="M 255,210 Q 280,225 288,250" fill="none" stroke="#475569" strokeWidth="1" opacity="0.4" />
        <path d="M 228,170 Q 222,210 240,250" fill="none" stroke="#475569" strokeWidth="1.5" opacity="0.5" />

        {/* Cardiac Silhouette (Heart shadow offset slightly to the left) */}
        <path
          d="M 175,160 C 175,160 145,220 160,280 C 170,310 200,315 220,310 C 235,305 240,250 230,190 C 225,160 215,155 195,155 Z"
          fill="#0f172a"
          opacity="0.9"
          stroke="#1e293b"
          strokeWidth="1"
        />

        {/* Spine/Vertebrae Pillar down center */}
        <g opacity="0.35">
          {Array.from({ length: 15 }).map((_, i) => {
            const centerY = 90 + i * 20;
            return (
              <rect
                key={i}
                x="193"
                y={centerY}
                width="14"
                height="15"
                rx="3"
                fill="#cbd5e1"
                stroke="#64748b"
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Rib Cage arches drawing on top of lungs */}
        <g stroke="#475569" strokeWidth="2.5" fill="none" opacity="0.25">
          {/* Left ribs */}
          <path d="M 190,140 Q 120,135 105,170" />
          <path d="M 190,170 Q 110,165 95,205" />
          <path d="M 190,200 Q 100,195 85,245" />
          <path d="M 190,230 Q 95,225 83,280" />
          <path d="M 190,260 Q 95,255 85,310" />
          <path d="M 190,290 Q 105,285 95,335" />
          
          {/* Right ribs */}
          <path d="M 210,140 Q 280,135 295,170" />
          <path d="M 210,170 Q 290,165 305,205" />
          <path d="M 210,200 Q 300,195 315,245" />
          <path d="M 210,230 Q 305,225 317,280" />
          <path d="M 210,260 Q 305,255 315,310" />
          <path d="M 210,290 Q 295,285 305,335" />
        </g>

        {/* Clavicles (Collar bones) */}
        <g stroke="#94a3b8" strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round">
          <path d="M 195,110 Q 140,115 80,95" />
          <path d="M 205,110 Q 260,115 320,95" />
        </g>

        {/* Diaphragm base curve */}
        <path
          d="M 60,370 Q 130,320 195,335 Q 270,320 340,370"
          fill="none"
          stroke="#334155"
          strokeWidth="3.5"
          opacity="0.8"
        />

        {/* Pneumonia Lesion Consolidated Patch (Shows only if pneumonia is present) */}
        {hasPneumonia && (
          <g>
            {/* Draw Simulated Infiltration Shadow */}
            <circle cx="135" cy="245" r="45" fill="url(#pneumonia-lesion)" />
            <circle cx="155" cy="275" r="30" fill="url(#pneumonia-lesion)" />
            
            {/* Heat Map Overlay Highlight (rendered directly into SVG if filter is active) */}
            {filter === 'heatmap' && (
              <g filter="url(#glow-effect)">
                <circle cx="135" cy="245" r="35" fill="#f43f5e" opacity="0.3" />
                <circle cx="155" cy="275" r="22" fill="#ef4444" opacity="0.25" />
                <path
                  d="M 120,230 Q 135,220 150,235 T 160,265"
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="2.5"
                  strokeDasharray="2 2"
                  opacity="0.5"
                />
              </g>
            )}
            
            {/* Edge detection highlighting */}
            {filter === 'edge' && (
              <g>
                <circle cx="135" cy="245" r="40" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <circle cx="155" cy="275" r="28" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
              </g>
            )}

            {/* Simulated crosshair framing anomaly zone to make it look medical-grade */}
            <g opacity="0.65" stroke={filter === 'heatmap' ? '#f43f5e' : filter === 'edge' ? '#00ff88' : '#38bdf8'} strokeWidth="1">
              {/* Box frame corners around consolidation spot */}
              <path d="M 85,210 L 100,210 M 85,210 L 85,225" />
              <path d="M 185,210 L 170,210 M 185,210 L 185,225" />
              <path d="M 85,295 L 100,295 M 85,295 L 85,280" />
              <path d="M 185,295 L 170,295 M 185,295 L 185,280" />
              
              {/* Small anomaly flag tag */}
              <text x="90" y="202" fill={filter === 'heatmap' ? '#f87171' : filter === 'edge' ? '#00ff88' : '#38bdf8'} fontSize="9" fontFamily="monospace" letterSpacing="0.5">
                INFILTRATION ANOMALY (LOWER LOBE)
              </text>
            </g>
          </g>
        )}

        {/* Grid Coordinates (DICOM Simulation Labels) */}
        <g fill="#475569" fontSize="8" fontFamily="monospace" opacity="0.5">
          <text x="15" y="55">A-1</text>
          <text x="15" y="150">B-2</text>
          <text x="15" y="250">C-3</text>
          <text x="15" y="350">D-4</text>

          <text x="100" y="25">R1</text>
          <text x="200" y="25"> spine_ctr </text>
          <text x="300" y="25">L1</text>
          
          {/* External diagnostic target frames */}
          <line x1="10" y1="200" x2="30" y2="200" stroke="#475569" strokeWidth="1" />
          <line x1="370" y1="200" x2="390" y2="200" stroke="#475569" strokeWidth="1" />
          <line x1="200" y1="10" x2="200" y2="25" stroke="#475569" strokeWidth="1" />
          <line x1="200" y1="375" x2="200" y2="390" stroke="#475569" strokeWidth="1" />
        </g>
      </svg>

      {/* Processed banner indicator tag */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/90 border border-slate-700/50 backdrop-blur-md">
        <span className={`w-1.5 h-1.5 rounded-full ${isProcessed ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`} />
        <span className="text-[10px] font-mono font-medium text-slate-300 uppercase letter-spacing-wide">
          {isProcessed ? `Processed (${filter})` : 'Original Frame'}
        </span>
      </div>

      <div className="absolute bottom-3 right-3 text-[9px] font-mono text-slate-500 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800/40">
        DICOM COMPRESSED // SCAN_2026
      </div>
    </div>
  );
};
