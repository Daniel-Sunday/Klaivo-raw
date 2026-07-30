import { describe, it, expect } from 'vitest';
import { DiagnosisSlotStateSchema, LearnerStateSchema, TreeSkeletonSchema } from '../schemas';

describe('Agent Schema & Prompt Snapshot Tests', () => {
  it('should maintain strict schema stability for DiagnosisSlotState', () => {
    const defaultSlotState = DiagnosisSlotStateSchema.parse({
      slotsResolved: { targetSubject: 'Computer Science' },
      slotsStillNeeded: ['priorKnowledge'],
      roundCount: 1,
      forceProceedTriggered: false,
      blockedOverwrites: [],
    });

    expect(defaultSlotState).toMatchInlineSnapshot(`
      {
        "blockedOverwrites": [],
        "forceProceedTriggered": false,
        "roundCount": 1,
        "slotsResolved": {
          "targetSubject": "Computer Science",
        },
        "slotsStillNeeded": [
          "priorKnowledge",
        ],
      }
    `);
  });

  it('should validate TreeSkeletonSchema structure against snapshot', () => {
    const dummyTree = TreeSkeletonSchema.parse({
      treeId: 'tree_123',
      learnerId: 'learner_123',
      goalSummary: 'Learn TypeScript and System Architecture',
      nodes: [
        {
          id: 'node_1',
          title: 'TypeScript Generics',
          oneLineSummary: 'Master generic constraints and type mapping',
          goalRelevance: 'Essential for strict type safety across agent pipelines',
        },
      ],
      edges: [],
    });

    expect(dummyTree.nodes[0].goalRelevance).toBe('Essential for strict type safety across agent pipelines');
  });
});
