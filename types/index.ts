// Export all Phase 1 Agentic Architecture Schemas & Types
export * from '../schemas';

// Legacy UI/API Interfaces (for backward compatibility during migration)
export interface Calibration {
  level: 'beginner' | 'intermediate' | 'advanced';
  known_concepts: string[];
  weak_points: string[];
}

import { DiagnosisSlotState } from '../schemas';

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Session {
  id: string;
  user_id?: string;
  title: string;
  intent: string;
  status: 'diagnosing' | 'learning' | 'generation_failed';
  calibration: Calibration;
  slot_state?: DiagnosisSlotState;
  created_at?: string;
  updated_at?: string;
}

export interface CurriculumNodeEdge {
  from: string;
  to: string;
  type: 'prerequisite' | 'related';
}

export interface CurriculumNode {
  id: string;
  session_id?: string;
  title: string;
  description: string;
  x: number;
  y: number;
  dependencies: string[];
  edges?: CurriculumNodeEdge[];
  status: 'locked' | 'available' | 'completed' | 'active' | 'in_progress';
  order_index: number;
  phaseIndex?: number;
  isCurrentActiveChunk?: boolean;
  chunkId?: string;
  depth?: number;
  goalRelevance?: string;
  oneLineSummary?: string;
  estimatedTimeMinutes?: number;
  masteryScore?: number;
  is_starred?: boolean;
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

// --- Legacy Agent Contracts (to keep existing agents compiling until replaced in Phase 2) ---

export type IntentType = 'quick_answer' | 'learning_goal' | 'problem_solving' | 'project_building' | 'research' | 'exam_prep';

export interface IntentAgentOutput {
  intent: IntentType;
  reason: string;
}

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

export interface CurriculumAgentOutput extends Array<Omit<CurriculumNode, 'session_id'>> {}

export type WriteChunkCallback = (chunk: string) => void;

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

export type RoutingClassification = 'question' | 'answer';

export interface RoutingAgentOutput {
  classification: RoutingClassification;
  reason: string;
}
