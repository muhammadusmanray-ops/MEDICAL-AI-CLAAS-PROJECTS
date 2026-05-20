export interface HistoryItem {
  id: string;
  patientId: string;
  imageName: string;
  imageUrl: string;
  timestamp: string;
  diagnosis: 'PNEUMONIA DETECTED' | 'NORMAL';
  confidence: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'N/A';
  region: string;
  recommendation: string;
}

export interface ScanStats {
  totalScans: number;
  accuracy: number;
  diseasesDetected: number;
  normalCases: number;
}

export type ProcessingFilter = 'none' | 'edge' | 'heatmap' | 'contrast' | 'denoise' | 'sharpen';
