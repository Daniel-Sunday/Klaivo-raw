import { processUploadedArtifact, searchSessionArtifacts } from '../utils/ragIngestion';
import { generateTaskSimulation, evaluateTaskSubmission } from '../agents/taskSimulationAgent';
import { calculateMasteryProbability, addEvidenceSignal, computeAdvisoryNodeBadges } from '../utils/evidenceEngine';
import { TreeNode } from '../schemas';

import * as db from '../database';

async function runNextGenFeatureVerification() {
  console.log('🧪 Starting Next-Gen Klaivo Architecture Verification...\n');
  await db.initDb();

  const testSessionId = `sess_test_${Date.now()}`;

  // Test 1: RAG Artifact Ingestion & Semantic Chunk Search
  console.log('Test 1: RAG Ingestion & Chunk Retrieval...');
  const samplePdfText = `
WAEC Chemistry Syllabus & Marking Scheme:
Section A: Organic Chemistry & Reaction Mechanisms
- Hydrocarbons: Alkanes, Alkenes, Alkynes. Functional group testing.
- Esters & Saponification: Hydrolysis of fats and oils using NaOH.
- Polymerization: Addition vs. condensation polymers.

Marking Rubric:
1. Full score required for balanced chemical equations.
2. Deduct 1 mark if state symbols (s, l, g, aq) are missing.
`;

  const ingestRes = await processUploadedArtifact(testSessionId, 'WAEC_Chemistry_Syllabus.pdf', samplePdfText);
  if (ingestRes.chunksCount === 0) {
    throw new Error('FAILED Test 1: RAG ingestion created 0 chunks');
  }

  const searchHits = await searchSessionArtifacts(testSessionId, 'saponification esters');
  if (searchHits.length === 0 || !searchHits[0].toLowerCase().includes('esters')) {
    throw new Error('FAILED Test 1: Semantic search failed to return relevant chunks');
  }
  console.log('✅ Test 1 Passed: RAG Document Ingestion & Chunk Search verified.\n');

  // Test 2: Universal Task Simulation Generation & Evaluation across Diverse Domains
  console.log('Test 2: Universal Domain Task Generation & Grading...');
  const sampleNode: TreeNode = {
    id: 'node_strategy_growth',
    title: 'Unit Economics & Customer Acquisition Cost (CAC)',
    oneLineSummary: 'LTV/CAC ratio analysis and payback period optimization',
    goalRelevance: 'Essential for mastering Fintech & Growth Strategy',
    prerequisiteIds: [],
    status: 'available',
    content: null,
    masteryScore: 0,
    depth: 0,
  };

  const taskSpec = await generateTaskSimulation({
    sessionId: testSessionId,
    node: sampleNode,
    goalSummary: 'Master Product Growth & Fintech Strategy',
    vocabularyLevel: 'advanced',
  });

  if (!taskSpec.title || !taskSpec.instructions || !taskSpec.taskType) {
    throw new Error('FAILED Test 2: TaskSimulationAgent produced empty task spec');
  }

  const evalRes = await evaluateTaskSubmission(
    taskSpec,
    'To optimize LTV/CAC, we increase retention through automated onboarding triggers while focusing ad spend on high-intent search terms with a 3-month payback window.',
    testSessionId
  );

  if (evalRes.score === undefined || typeof evalRes.passed !== 'boolean') {
    throw new Error('FAILED Test 2: Universal Task Evaluation failed');
  }
  console.log(`✅ Test 2 Passed: Universal Task generated (${taskSpec.taskType} in ${taskSpec.domainCategory}) and evaluated (Score: ${Math.round(evalRes.score * 100)}%).\n`);

  // Test 3: Multi-Signal Evidence-Based Mastery Engine
  console.log('Test 3: Multi-Factor Evidence Mastery Engine...');
  const signals = [
    { type: 'task_simulation' as const, score: 0.85, timestamp: new Date().toISOString() },
    { type: 'concept_transfer' as const, score: 0.80, timestamp: new Date().toISOString() },
  ];

  const masteryProb = calculateMasteryProbability(signals);
  if (masteryProb < 0.75) {
    throw new Error(`FAILED Test 3: Expected mastery probability >= 0.75, got ${masteryProb}`);
  }

  const advisoryBadges = await computeAdvisoryNodeBadges(testSessionId, [sampleNode]);
  if (!advisoryBadges[sampleNode.id]) {
    throw new Error('FAILED Test 3: Advisory node badges compute failed');
  }
  console.log(`✅ Test 3 Passed: Multi-Factor Evidence Engine computed mastery probability (${Math.round(masteryProb * 100)}%) and advisory badges.\n`);

  console.log('🎉 ALL NEXT-GEN KLAIVO ARCHITECTURE TESTS PASSED PERFECTLY!');
}

runNextGenFeatureVerification().catch((err) => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
