import { describe, it, expect } from 'vitest';
import { TreeSkeletonSchema, AssessmentResultSchema } from '../schemas';
import { dispatchAgentTool } from '../utils/agentTools';

describe('Agentic Evaluation & Quality Benchmark Suite', () => {
  // 1. DAG Topological Validity Benchmark
  it('Benchmark 1: Curriculum Tree DAG Validity — Acyclic Graph Guarantee', () => {
    const mockSkeleton = TreeSkeletonSchema.parse({
      treeId: 'tree_eval_101',
      learnerId: 'learner_eval',
      goalSummary: 'Learn Distributed Systems Architecture',
      nodes: [
        { id: 'node_1', title: 'Network Protocols', oneLineSummary: 'TCP/IP and sockets', goalRelevance: 'Foundation', prerequisiteIds: [] },
        { id: 'node_2', title: 'RPC & gRPC', oneLineSummary: 'Remote procedure calls', goalRelevance: 'Networking', prerequisiteIds: ['node_1'] },
        { id: 'node_3', title: 'Consensus Algorithms', oneLineSummary: 'Raft & Paxos', goalRelevance: 'Distributed Agreement', prerequisiteIds: ['node_2'] },
      ],
      edges: [
        { from: 'node_1', to: 'node_2', type: 'prerequisite' },
        { from: 'node_2', to: 'node_3', type: 'prerequisite' },
      ],
    });

    // Verify Acyclic Graph (No cycles)
    const visited = new Set<string>();
    const recStack = new Set<string>();

    function hasCycle(nodeId: string): boolean {
      if (recStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recStack.add(nodeId);

      const children = mockSkeleton.edges.filter(e => e.from === nodeId).map(e => e.to);
      for (const child of children) {
        if (hasCycle(child)) return true;
      }

      recStack.delete(nodeId);
      return false;
    }

    let isAcyclic = true;
    for (const node of mockSkeleton.nodes) {
      if (hasCycle(node.id)) {
        isAcyclic = false;
        break;
      }
    }

    expect(isAcyclic).toBe(true);
    expect(mockSkeleton.nodes.length).toBe(3);
  });

  // 2. Misconception Detection & Assessment Evaluation Benchmark
  it('Benchmark 2: Misconception Detection & Reasoning Audit Schema', () => {
    const assessmentData = AssessmentResultSchema.parse({
      nodeId: 'node_2',
      masteryDelta: 0.25,
      detectedMisconceptions: ['Confused blocking vs non-blocking I/O event loop execution'],
      readyToAdvance: false,
      reasoning: 'Learner correctly identified async syntax but misunderstood thread pool execution',
    });

    expect(assessmentData.masteryDelta).toBeGreaterThanOrEqual(-1.0);
    expect(assessmentData.masteryDelta).toBeLessThanOrEqual(1.0);
    expect(assessmentData.detectedMisconceptions).toContain('Confused blocking vs non-blocking I/O event loop execution');
    expect(assessmentData.reasoning).toBeTruthy();
  });

  // 3. Agent Tool Dispatch Execution Benchmark
  it('Benchmark 3: Native Agent Tool Dispatch & Code Execution', async () => {
    const jsToolResult = await dispatchAgentTool('executeCodeSandbox', {
      language: 'javascript',
      code: 'console.log("Klaivo Tool Harness Active");',
    });

    expect(jsToolResult.success).toBe(true);
    expect(jsToolResult.result.stdout).toContain('Klaivo Tool Harness Active');

    const diagramToolResult = await dispatchAgentTool('renderDiagram', {
      diagramType: 'architecture',
      title: 'Microservices Mesh',
      mermaidSpec: 'graph TD; A[Gateway] --> B[Auth]; A --> C[Sessions];',
    });

    expect(diagramToolResult.success).toBe(true);
    expect(diagramToolResult.result.title).toBe('Microservices Mesh');
  });
});
