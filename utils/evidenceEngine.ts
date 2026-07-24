import * as db from '../database';
import { TreeNode } from '../schemas';

export interface EvidenceSignal {
  type: 'chat_dialogue' | 'quiz_question' | 'task_simulation' | 'concept_transfer' | 'prior_knowledge';
  score: number; // 0.0 to 1.0
  timestamp: string;
  weight?: number;
}

export interface NodeEvidenceSummary {
  nodeId: string;
  masteryProbability: number;
  advisoryBadge: 'recommended' | 'gap_warning' | 'available' | 'mastered' | 'locked';
  signals: EvidenceSignal[];
}

/**
 * Multi-Factor Evidence Accumulator
 * Calculates probability score (0.0 to 1.0) for a node based on diverse signals.
 */
export function calculateMasteryProbability(signals: EvidenceSignal[]): number {
  if (!signals || signals.length === 0) return 0.0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  const weights: Record<EvidenceSignal['type'], number> = {
    task_simulation: 0.40, // Practical task execution carries highest weight
    concept_transfer: 0.25,
    quiz_question: 0.20,
    chat_dialogue: 0.10,
    prior_knowledge: 0.05,
  };

  for (const sig of signals) {
    const w = sig.weight || weights[sig.type] || 0.1;
    totalWeightedScore += sig.score * w;
    totalWeight += w;
  }

  if (totalWeight === 0) return 0.0;
  return Math.min(1.0, Math.max(0.0, totalWeightedScore / totalWeight));
}

/**
 * Computes advisory status badges for all nodes in a tree skeleton.
 * Learner remains autonomous: advisory status guides recommendations without locking nodes out.
 */
export async function computeAdvisoryNodeBadges(
  sessionId: string,
  nodes: TreeNode[]
): Promise<Record<string, NodeEvidenceSummary>> {
  const existingScores = await db.getEvidenceScores(sessionId);
  const result: Record<string, NodeEvidenceSummary> = {};

  const masteredSet = new Set<string>();

  // 1. Calculate probability for each node
  for (const node of nodes) {
    const existing = existingScores[node.id];
    const signals: EvidenceSignal[] = existing?.signals || [];
    const prob = calculateMasteryProbability(signals);

    if (prob >= 0.75 || node.status === 'mastered') {
      masteredSet.add(node.id);
    }

    result[node.id] = {
      nodeId: node.id,
      masteryProbability: prob,
      advisoryBadge: 'available',
      signals,
    };
  }

  // 2. Assign advisory badges (recommended, gap_warning, mastered, available)
  for (const node of nodes) {
    const current = result[node.id];

    if (masteredSet.has(node.id)) {
      current.advisoryBadge = 'mastered';
      continue;
    }

    const prereqs = node.prerequisiteIds || [];
    const missingPrereqs = prereqs.filter((pId) => !masteredSet.has(pId));

    if (missingPrereqs.length === 0) {
      current.advisoryBadge = 'recommended';
    } else {
      current.advisoryBadge = 'gap_warning';
    }

    await db.saveEvidenceScore(
      sessionId,
      node.id,
      current.masteryProbability,
      current.signals,
      current.advisoryBadge
    );
  }

  return result;
}

export async function addEvidenceSignal(
  sessionId: string,
  nodeId: string,
  signal: EvidenceSignal
): Promise<NodeEvidenceSummary> {
  const existingScores = await db.getEvidenceScores(sessionId);
  const currentEntry = existingScores[nodeId] || { signals: [] };

  const updatedSignals = [...(currentEntry.signals || []), signal];
  const prob = calculateMasteryProbability(updatedSignals);

  let advisoryBadge: 'recommended' | 'gap_warning' | 'available' | 'mastered' | 'locked' = 'available';
  if (prob >= 0.75) {
    advisoryBadge = 'mastered';
  }

  await db.saveEvidenceScore(sessionId, nodeId, prob, updatedSignals, advisoryBadge);

  return {
    nodeId,
    masteryProbability: prob,
    advisoryBadge,
    signals: updatedSignals,
  };
}
