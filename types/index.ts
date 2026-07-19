export interface Calibration {
  level: 'beginner' | 'intermediate' | 'advanced';
  known_concepts: string[];
  weak_points: string[];
}

export interface Session {
  id: string;
  title: string;
  intent: string;
  status: 'diagnosing' | 'learning';
  calibration: Calibration;
  created_at?: string;
  updated_at?: string;
}

export interface CurriculumNode {
  id: string;
  session_id?: string;
  title: string;
  description: string;
  x: number;
  y: number;
  dependencies: string[];
  status: 'locked' | 'available' | 'completed' | 'active';
  order_index: number;
  created_at?: string;
}

export interface Message {
  id?: number;
  session_id: string;
  node_id: string | null;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

// --- Agent Contracts ---

// 1. Intent Agent Contract
export type IntentType = 'quick_answer' | 'learning_goal' | 'problem_solving' | 'project_building' | 'research' | 'exam_prep';

export interface IntentAgentOutput {
  intent: IntentType;
  reason: string;
}

// 2. Diagnosis Agent Contracts
export interface DiagnosisAgentSummary {
  userGoal: string;
  intent: string;
  extractedContext: string;
  calibration: Calibration;
}

export interface DiagnosisAgentOutput {
  readyForPath: boolean;
  feedback: string;
  summary: DiagnosisAgentSummary;
}

// 3. Curriculum Agent Contracts
export interface CurriculumAgentOutput extends Array<Omit<CurriculumNode, 'session_id'>> {}

// 4. Teaching Agent Contracts
// Functions stream via writeChunk callback, so they return void/Promise<void>
export type WriteChunkCallback = (chunk: string) => void;

// 5. Assessment Agent Contracts
export interface CalibrationUpdate {
  level_delta: number;
  add_known: string[];
  add_weak_points: string[];
}

export interface AssessmentAgentOutput {
  passed: boolean;
  feedback: string;
  calibration_update?: CalibrationUpdate;
}

// 6. Routing Agent Contracts
export type RoutingClassification = 'question' | 'answer';

export interface RoutingAgentOutput {
  classification: RoutingClassification;
  reason: string;
}
