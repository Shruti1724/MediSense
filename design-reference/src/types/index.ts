export type Screen = 
  | 'home' 
  | 'upload' 
  | 'processing' 
  | 'report' 
  | 'cabinet' 
  | 'ask' 
  | 'styleguide';

export interface MedicineEntry {
  id: string;
  name: string;
  strength: string;
  timing: string;
  confidence: 'High' | 'Check this';
  suggestions?: { name: string; strength: string }[];
}

export interface CabinetRecord {
  id: string;
  medicine: string;
  genericName: string;
  type: 'Prescription' | 'OTC';
  expiry: string;
}

export type OutcomeStateKey = 'emergency' | 'found' | 'ask' | 'mismatch' | 'unverified';

export interface PipelineStep {
  id: number;
  time: string;
  label: string;
  status: 'Done' | 'In progress' | 'Waiting';
}

export interface InteractionWarning {
  severity: 'major' | 'moderate' | 'minor';
  title: string;
  body: string;
}
