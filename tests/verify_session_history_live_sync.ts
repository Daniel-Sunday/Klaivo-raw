import * as db from '../database';

async function runSessionHistoryLiveSyncTest() {
  console.log('🧪 Starting Session & History Live Sync Tests...\n');
  await db.initDb();

  const testSessionId = `sess_sync_test_${Date.now()}`;
  const testTitle = 'Building an Autonomous AI Agent';
  const calibration = { level: 'intermediate', known_concepts: [], weak_points: [] };

  // 1. Create session
  await db.createSession(testSessionId, testTitle, 'learning_goal', 'learning', calibration);
  console.log(`✅ Step 1: Session created with id="${testSessionId}", title="${testTitle}"`);

  // Verify getSessions returns created session
  const sessions = await db.getSessions();
  const created = sessions.find((s) => s.id === testSessionId);
  if (!created || created.title !== testTitle) {
    throw new Error(`FAILED Step 1: Session not found in getSessions() list`);
  }
  console.log('✅ Step 1 Verified: getSessions() contains newly created session.\n');

  // 2. Create nodes & mark one node as opened/in_progress
  const testNodeId = 'node_agent_loop';
  const mockNodes = [
    {
      id: testNodeId,
      session_id: testSessionId,
      title: 'Agentic Core Loops & Tool Execution',
      description: 'Master core execution loops',
      x: 100,
      y: 100,
      dependencies: [],
      status: 'locked' as const,
      order_index: 0,
    },
  ];
  await db.saveNodes(testSessionId, mockNodes);

  // User opens the node -> status becomes in_progress
  await db.updateNodeStatus(testSessionId, testNodeId, 'in_progress');
  console.log(`✅ Step 2: Node "${testNodeId}" marked as in_progress`);

  // Verify getAllSessionsWithNodes contains node with in_progress status
  const allSessions = await db.getAllSessionsWithNodes();
  const targetSessionData = allSessions.find((item) => item.session.id === testSessionId);
  if (!targetSessionData) {
    throw new Error(`FAILED Step 2: Session data missing in getAllSessionsWithNodes`);
  }

  const targetNode = targetSessionData.nodes.find((n) => n.id === testNodeId);
  if (!targetNode || targetNode.status !== 'in_progress') {
    throw new Error(`FAILED Step 2: Node status expected "in_progress", got "${targetNode?.status}"`);
  }
  console.log(`✅ Step 2 Verified: Node "${targetNode.title}" status is "${targetNode.status}". History tracking confirmed.\n`);

  console.log('🎉 ALL SESSION & HISTORY LIVE SYNC TESTS PASSED PERFECTLY!');
}

runSessionHistoryLiveSyncTest().catch((err) => {
  console.error('❌ Sync test failed:', err);
  process.exit(1);
});
