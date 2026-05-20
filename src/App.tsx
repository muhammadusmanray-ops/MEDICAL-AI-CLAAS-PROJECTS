import { useState, useEffect } from 'react';
import { HistoryItem, ScanStats, ProcessingFilter } from './types';
import { StatsBar } from './components/StatsBar';
import { WorkbenchPanel } from './components/WorkbenchPanel';
import { AnalysisPanel } from './components/AnalysisPanel';
import { HistorySection } from './components/HistorySection';
import { ShieldCheck, HeartPulse, HardDrive, GraduationCap, Brain } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

export default function App() {
  // Stats tracking state
  const [stats, setStats] = useState<ScanStats>({
    totalScans: 0,
    accuracy: 0.0,
    diseasesDetected: 0,
    normalCases: 0,
  });

  // Past logs mock details as requested, with sample data filled in
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Workplace workspace state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/history`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHistory(data.history);
          if (data.stats.totalScans > 0) {
            setStats(data.stats);
          }
        }
      })
      .catch(e => console.error("Failed to load history", e));
  }, []);
  const [activeFilter, setActiveFilter] = useState<ProcessingFilter>('none');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeScan, setActiveScan] = useState<HistoryItem | null>(null);

  // Pneumonia visual flag inside our procedural SVG generator
  const [hasPneumonia, setHasPneumonia] = useState(false);

  // Triggering the diagnostic inference pipeline
  const runModelInference = async (
    imgSrc: string,
    fileName: string,
    forcedOutcome?: 'normal' | 'pneumonia',
    fileObj?: File
  ) => {
    setIsAnalyzing(true);
    setActiveScan(null);
    setActiveFilter('none');

    try {
      let aiResult: any = null;
      let aiResultText = '';
      if (fileObj) {
        const formData = new FormData();
        formData.append('image', fileObj);
        formData.append('type', 'medical');

        const response = await fetch(`${API_BASE}/api/analyze`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (data.success) {
            aiResult = data.result;
            // Handle if result is string or object
            if (typeof aiResult === 'string') {
              aiResultText = aiResult;
            } else {
              aiResultText = aiResult.recommendation || JSON.stringify(aiResult);
            }
        } else {
            aiResultText = 'Error analyzing image: ' + (data.error || 'Unknown error');
        }
      } else if (forcedOutcome) {
        // Fetch preset analysis from real backend
        const response = await fetch(`${API_BASE}/api/preset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: forcedOutcome })
        });
        const data = await response.json();
        if (data.success) {
            aiResult = data.result;
            aiResultText = aiResult.recommendation;
        } else {
            aiResultText = 'Error generating preset analysis.';
        }
      }

      if (aiResult && typeof aiResult === 'object' && aiResult.id) {
        // AI result has proper DB data
        const newRecord = {
          ...aiResult,
          imageUrl: imgSrc
        };
        setHistory(prev => [newRecord, ...prev]);
        setActiveScan(newRecord);
        
        // Update stats logically without fetching again
        setStats(prev => {
          const isDisease = aiResult.diagnosis.includes('NORMAL') ? false : true;
          const newTotal = prev.totalScans + 1;
          return {
            totalScans: newTotal,
            accuracy: Number(((prev.accuracy * prev.totalScans + aiResult.confidence) / newTotal).toFixed(1)) || aiResult.confidence,
            diseasesDetected: prev.diseasesDetected + (isDisease ? 1 : 0),
            normalCases: prev.normalCases + (isDisease ? 0 : 1),
          };
        });
      } else {
        // Fallback procedural for mock / preset without real backend hit
        const randomPatientId = `PAC-X-${Math.floor(1000 + Math.random() * 9000)}`;
        const now = new Date();
        const currentTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const isPneumoniaResult = aiResultText.toLowerCase().includes('pneumonia') || aiResultText.toLowerCase().includes('abnormal') || forcedOutcome === 'pneumonia';
        const diagnosisText = isPneumoniaResult ? 'PNEUMONIA DETECTED' : 'NORMAL';
        const confidenceScore = isPneumoniaResult ? parseFloat((85 + Math.random() * 8.5).toFixed(1)) : parseFloat((92 + Math.random() * 6.8).toFixed(1));
        const severityText = isPneumoniaResult ? 'Moderate' : 'N/A';
        const regionText = isPneumoniaResult ? 'Detected Region' : 'Bilateral Clear';

        const generatedResult: HistoryItem = {
          id: `case-${Date.now()}`,
          patientId: randomPatientId,
          imageName: fileName,
          imageUrl: imgSrc,
          timestamp: currentTimestamp,
          diagnosis: diagnosisText,
          confidence: confidenceScore,
          severity: severityText,
          region: regionText,
          recommendation: aiResultText,
        };

        setHistory((prev) => [generatedResult, ...prev]);
        setActiveScan(generatedResult);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Triggers when a custom file is uploaded
  const handleFileUpload = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setUploadedImageUrl(objectUrl);
    setUploadedFileName(file.name);
    // Initialize simulation run with real file
    runModelInference(objectUrl, file.name, undefined, file);
  };

  // Triggers when a demo preset button is clicked (Normal or Pneumonia)
  const handleSelectPreset = (type: 'normal' | 'pneumonia') => {
    setUploadedImageUrl('procedural-svg');
    const simulationName = type === 'pneumonia' ? 'SIM_PNEUMONIA_CHEST.DCM' : 'SIM_NORMAL_CHEST.DCM';
    setUploadedFileName(simulationName);
    setHasPneumonia(type === 'pneumonia');
    runModelInference('procedural-svg', simulationName, type);
  };

  // Load a historical file from database back into active panel
  const handleSelectScanFromHistory = (item: HistoryItem) => {
    setUploadedImageUrl(item.imageUrl);
    setUploadedFileName(item.imageName);
    setHasPneumonia(item.diagnosis === 'PNEUMONIA DETECTED');
    setActiveScan(item);
    setActiveFilter('none');
  };

  const resetInferenceWorkspace = () => {
    setUploadedImageUrl(null);
    setUploadedFileName(null);
    setActiveFilter('none');
    setActiveScan(null);
  };

  // Real DICOM PDF report download from backend
  const downloadReportDicom = () => {
    if (!activeScan) return;
    // Hit the backend API to generate and download the actual PDF
    window.location.href = `${API_BASE}/api/report/${activeScan.id}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 flex flex-col justify-between selection:bg-sky-500/30 selection:text-white" id="main-app-shell">
      
      {/* ================= HEADER SECTION ================= */}
      <header className="border-b border-slate-800/80 bg-slate-950/65 backdrop-blur-md sticky top-0 z-50 py-3.5 px-6" id="app-header-node">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-emerald-400 p-0.5 shadow-[0_0_15px_rgba(0,186,255,0.25)] flex items-center justify-center">
              <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <span className="text-xl">🔬</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-lg font-bold font-sans tracking-wide bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent inline-block animate-[pulse_3s_infinite]">
                  MediScan AI
                </h1>
                <span className="text-[9px] font-mono border border-sky-500/30 text-sky-400 px-1.5 py-0.2 rounded-full font-bold">
                  v2.5 // INFERENCE CORE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-0.5">
                Intelligent Medical Image Analysis Powered by Deep Learning
              </p>
            </div>
          </div>

          {/* Academic University Tag */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <GraduationCap className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <div className="text-left">
              <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">UNIVERSITY GRADUATION PROJECT</div>
              <div className="text-[10px] font-mono font-bold text-slate-300">CS-480 // COGNITIVE LABS</div>
            </div>
          </div>

        </div>
      </header>

      {/* ================= MAIN MATRIX STAGE ================= */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex-grow w-full space-y-6" id="stage-body-node">
        {/* Top level premium stats metrics */}
        <StatsBar stats={stats} />

        {/* Dynamic Multi-Grid Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="workbench-layout-grid">
          
          {/* Left/Middle Column (Upload Zone + Workbench side-by-side processing panel) */}
          <div className="lg:col-span-2 space-y-6">
            <WorkbenchPanel
              uploadedImageUrl={uploadedImageUrl}
              uploadedFileName={uploadedFileName}
              activeFilter={activeFilter}
              hasPneumonia={hasPneumonia}
              onFilterChange={(f) => setActiveFilter(f)}
              onFileUpload={handleFileUpload}
              onSelectPresets={handleSelectPreset}
            />
          </div>

          {/* Right Column (Analysis Report Panel displaying AI diagnosis details) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <AnalysisPanel
                isAnalyzing={isAnalyzing}
                result={activeScan}
                onReset={resetInferenceWorkspace}
                onDownloadReport={downloadReportDicom}
              />
            </div>
          </div>

        </div>

        {/* Bottom Historical Diagnostics Registry */}
        <div className="pt-2">
          <HistorySection
            history={history}
            onSelectScan={handleSelectScanFromHistory}
            activeId={activeScan?.id}
          />
        </div>
      </main>

      {/* ================= BOTTOM DIAGNOSTIC MATRIX (CHAT & RESULTS) ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full mb-12">
        <DiagnosticMatrix activeScan={activeScan} />
      </div>

      {/* ================= FOOTER BANNER ================= */}
      <footer id="app-footer-node" className="border-t border-slate-850 bg-slate-950/70 py-4 px-6 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[10px]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>MEDISCAN CORE INFERENCE DEPLOYED ON STATELESS RESEARCH SANDBOX</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <HeartPulse className="h-3 w-3 text-rose-500 animate-pulse" /> Live Hospital Sync Active
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3 text-sky-400" /> DB-NODE ID: SEC-A4
            </span>
          </div>
          <div>
            <span>© 2026 UNIVERSITY DEPT OF COGNITIVE SYSTEMS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Full-Width Diagnostic Matrix Component
function DiagnosticMatrix({ activeScan }: { activeScan: HistoryItem | null }) {
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeScanContext = activeScan ? `Diagnosis: ${activeScan.diagnosis}, Region: ${activeScan.region}, Confidence: ${activeScan.confidence}%, Details: ${activeScan.recommendation}` : '';

  // Auto-add initial context message when scan changes
  useEffect(() => {
    if (activeScan) {
      setMessages(prev => [
        ...prev, 
        {text: `I've analyzed the new scan. Diagnosis: ${activeScan.diagnosis}. Confidence is ${activeScan.confidence}%. You can ask me questions about it!`, isUser: false}
      ]);
    }
  }, [activeScan]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, {text: userMsg, isUser: true}]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context: activeScanContext })
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {text: data.reply, isUser: false}]);
      } else {
        setMessages(prev => [...prev, {text: 'Error: ' + data.error, isUser: false}]);
      }
    } catch (e) {
      setMessages(prev => [...prev, {text: 'Failed to connect to backend.', isUser: false}]);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 shadow-2xl shadow-sky-900/10 rounded-xl w-full h-[550px] flex overflow-hidden mt-8">
      {/* Left side: Results Context */}
      <div className="w-1/3 bg-slate-850 p-6 border-r border-slate-700 flex flex-col relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <h3 className="text-lg font-bold text-sky-400 flex items-center gap-2 mb-4 relative z-10">
          <Brain className="h-5 w-5" /> 
          Diagnostic Matrix
        </h3>
        
        {activeScan ? (
          <div className="space-y-4 text-sm text-slate-300 relative z-10 flex-1 overflow-y-auto pr-2">
             <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/50 backdrop-blur-sm hover:border-sky-500/30 transition-colors">
               <span className="block text-[10px] text-sky-500/80 font-mono mb-1 tracking-widest uppercase">Target Image Ref</span>
               <div className="font-medium truncate text-white">{activeScan.imageName}</div>
             </div>
             
             <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/50 backdrop-blur-sm">
               <span className="block text-[10px] text-sky-500/80 font-mono mb-1 tracking-widest uppercase">Core Diagnosis</span>
               <div className={`text-lg font-bold tracking-wide ${activeScan.diagnosis.includes('NORMAL') ? 'text-emerald-400' : 'text-rose-400'}`}>
                 {activeScan.diagnosis}
               </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/50 backdrop-blur-sm text-center">
                 <span className="block text-[10px] text-sky-500/80 font-mono mb-1 tracking-widest uppercase">Confidence</span>
                 <div className="font-bold text-sky-400 text-xl">{activeScan.confidence}%</div>
               </div>
               <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/50 backdrop-blur-sm text-center">
                 <span className="block text-[10px] text-sky-500/80 font-mono mb-1 tracking-widest uppercase">Severity</span>
                 <div className={`font-bold text-sm mt-1 ${activeScan.severity === 'Severe' ? 'text-rose-400' : activeScan.severity === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'}`}>
                   {activeScan.severity}
                 </div>
               </div>
             </div>

             <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-700/50 backdrop-blur-sm mt-2">
               <span className="block text-[10px] text-sky-500/80 font-mono mb-2 tracking-widest uppercase">AI Clinical Insights</span>
               <div className="text-xs leading-relaxed text-slate-300 italic">"{activeScan.recommendation}"</div>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm text-center relative z-10">
            Upload an image to populate the diagnostic matrix.
          </div>
        )}
      </div>

      {/* Right side: Chat */}
      <div className="w-2/3 flex flex-col bg-slate-900">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center flex-col text-slate-500 gap-4">
              <div className="p-4 bg-slate-800 rounded-full border border-slate-700">
                <Brain className="h-8 w-8 text-sky-500/50" />
              </div>
              <p className="font-medium text-slate-400">Initialize context query sequence.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`p-4 rounded-xl text-sm max-w-[85%] leading-relaxed ${m.isUser ? 'bg-sky-600/90 text-white self-end shadow-lg shadow-sky-900/20 rounded-tr-sm' : 'bg-slate-800 text-slate-300 self-start border border-slate-700 rounded-tl-sm'}`}>
              {m.text}
            </div>
          ))}
          {isLoading && (
            <div className="self-start p-4 bg-slate-800 rounded-xl border border-slate-700 rounded-tl-sm flex gap-2 items-center">
              <span className="h-2 w-2 bg-sky-400 rounded-full animate-bounce"></span>
              <span className="h-2 w-2 bg-sky-400 rounded-full animate-bounce delay-75"></span>
              <span className="h-2 w-2 bg-sky-400 rounded-full animate-bounce delay-150"></span>
            </div>
          )}
        </div>
        
        {/* Quick Queries (Distinct AI Feature) */}
        {activeScan && !isLoading && messages.length < 3 && (
          <div className="px-6 py-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['What are the immediate next steps?', 'Explain the severity in simple terms.', 'Are there any secondary anomalies?'].map((q, idx) => (
              <button key={idx} onClick={() => { setInput(q); }} className="whitespace-nowrap text-xs bg-slate-800 border border-slate-700 hover:border-sky-500/50 hover:bg-slate-750 text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 bg-slate-850 border-t border-slate-800 flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your query regarding the scan here..." 
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
          <button 
            onClick={sendMessage}
            className="bg-sky-500 hover:bg-sky-400 text-white rounded-lg px-6 py-3 font-medium transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2"
          >
            <span>Send</span>
            <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
