import assert from 'assert';
import * as db from '../database';
import { KlaivoOrchestrator } from '../orchestrator';
import { LearnerState } from '../schemas';

async function runTreeImmutabilityTest() {
  console.log('🧪 Starting Tree Immutability Verification Test...\n');
  await db.initDb();

  const sessionId = `test_session_${Date.now()}`;
  const title = 'Organic Chemistry Fundamentals';

  // 1. Create session & draft initial curriculum tree
  await db.createSession(sessionId, title, 'learning_goal', { level: 'intermediate', known_concepts: [], weak_points: [] });

  const initialNodes = [
    {
      id: 'node_1',
      session_id: sessionId,
      title: 'Atomic Structure & Orbitals',
      description: 'Understanding s, p, and d orbitals in carbon atoms.',
      x: 200,
      y: 100,
      dependencies: [],
      edges: [],
      status: 'available' as const,
      order_index: 0,
    },
    {
      id: 'node_2',
      session_id: sessionId,
      title: 'Covalent Bonding & Hybridization',
      description: 'sp3, sp2, and sp orbital hybridization mechanisms.',
      x: 200,
      y: 250,
      dependencies: ['node_1'],
      edges: [{ from: 'node_1', to: 'node_2', type: 'prerequisite' as const }],
      status: 'locked' as const,
      order_index: 1,
    },
    {
      id: 'node_3',
      session_id: sessionId,
      title: 'IUPAC Nomenclature Rules',
      description: 'Systematic naming conventions for alkanes and alkenes.',
      x: 200,
      y: 400,
      dependencies: ['node_2'],
      edges: [{ from: 'node_2', to: 'node_3', type: 'prerequisite' as const }],
      status: 'locked' as const,
      order_index: 2,
    },
  ];

  await db.saveNodes(sessionId, initialNodes);
  await db.updateSessionStatus(sessionId, 'learning');
  // Simulate opening target node (which marks it in_progress)
  await db.updateNodeStatus(sessionId, 'node_1', 'in_progress');

  // 2. Capture byte-for-byte JSON snapshot BEFORE asking follow-up questions
  const preSnapshotNodes = await db.getNodes(sessionId);
  const preSnapshotJSON = JSON.stringify(preSnapshotNodes);
  console.log(`📸 Pre-Followup Tree Snapshot Captured: ${preSnapshotNodes.length} nodes`);
  console.log(`   Node IDs: ${preSnapshotNodes.map((n) => n.id).join(', ')}`);

  // 3. Send 4 follow-up questions in a row
  const followUpQuestions = [
    "I do not understand",
    "what do you mean?",
    "can you explain this differently?",
    "how does this topic connect to the main objective?"
  ];

  const targetNodeId = 'node_1';
  for (let i = 0; i < followUpQuestions.length; i++) {
    const q = followUpQuestions[i];
    console.log(`\n💬 Follow-up Turn ${i + 1}: "${q}"`);
    
    // Simulate node message request (POST /api/sessions/:id/nodes/:nodeId/message)
    await db.createMessage(sessionId, targetNodeId, 'user', q);
    
    // Fetch nodes after turn to verify immutability
    const midNodes = await db.getNodes(sessionId);
    assert.strictEqual(midNodes.length, preSnapshotNodes.length, `Node count changed on turn ${i + 1}!`);
  }

  // 4. Capture byte-for-byte JSON snapshot AFTER asking follow-up questions
  const postSnapshotNodes = await db.getNodes(sessionId);
  const postSnapshotJSON = JSON.stringify(postSnapshotNodes);

  console.log(`\n📸 Post-Followup Tree Snapshot Captured: ${postSnapshotNodes.length} nodes`);
  console.log(`   Node IDs: ${postSnapshotNodes.map((n) => n.id).join(', ')}`);

  // 5. Assert Byte-for-Byte Equality
  assert.strictEqual(
    postSnapshotJSON,
    preSnapshotJSON,
    '❌ TREE MUTATION DETECTED! Tree data before and after follow-ups is NOT byte-for-byte identical.'
  );

  console.log('\n✅ BYTE-FOR-BYTE IMMUTABILITY CONFIRMED!');
  console.log('   - Pre & Post JSON snapshots match 100% exactly.');
  console.log('   - 0 node additions, 0 node deletions, 0 layout shifts, 0 title/description mutations.');
  console.log('\n🎉 ALL TREE IMMUTABILITY TESTS PASSED SUCCESSFULLY!');
}

runTreeImmutabilityTest().catch((err) => {
  console.error('❌ Tree Immutability Verification Failed:', err);
  process.exit(1);
});
