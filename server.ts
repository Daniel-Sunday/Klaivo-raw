import express, { Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

import * as db from './database';
import { extractTextFromPdf } from './utils/pdfReader';
import { KlaivoOrchestrator } from './orchestrator';
import { LearnerState, TreeSkeleton, TreeNode } from './schemas';
import { Calibration, CurriculumNode } from './types';
import { processUploadedArtifact } from './utils/ragIngestion';
import { generateTaskSimulation, evaluateTaskSubmission } from './agents/taskSimulationAgent';
import { addEvidenceSignal, computeAdvisoryNodeBadges } from './utils/evidenceEngine';
import { generateSessionTitle } from './utils/sessionTitler';
import { classifyMessageIntent } from './agents/routingAgent';
import { getModelProvider } from './providers/modelProvider';

const projectRoot = fs.existsSync(path.join(__dirname, 'public'))
  ? __dirname
  : path.join(__dirname, '..');

const uploadsDir = path.join(projectRoot, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

(async () => {
  await db.initDb();
})();

const app = express();
const port = process.env.PORT || 3005;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.static(path.join(projectRoot, 'public')));

// Singleton Orchestrator Instance for Phase 3 Pipeline
const orchestrator = new KlaivoOrchestrator();

/**
 * Convert TreeSkeleton nodes into legacy CurriculumNode array with spatial layout (x, y)
 * so the SVG concept canvas in public/js/canvas.ts renders the tree correctly.
 */
export function mapTreeSkeletonToCurriculumNodes(sessionId: string, skeleton: TreeSkeleton): CurriculumNode[] {
  const levelMap: Record<string, number> = {};

  skeleton.nodes.forEach((node) => {
    if (node.depth !== undefined && node.depth >= 0) {
      levelMap[node.id] = node.depth;
    } else {
      let maxPrereqDepth = 0;
      node.prerequisiteIds.forEach((pId) => {
        if (levelMap[pId] !== undefined) {
          maxPrereqDepth = Math.max(maxPrereqDepth, levelMap[pId] + 1);
        }
      });
      levelMap[node.id] = maxPrereqDepth;
    }
  });

  const levelGroups: Record<number, TreeNode[]> = {};
  skeleton.nodes.forEach((node) => {
    const lvl = levelMap[node.id] || 0;
    if (!levelGroups[lvl]) levelGroups[lvl] = [];
    levelGroups[lvl].push(node);
  });

  const startX = 60;
  const startY = 80;
  const colSpacing = 280;
  const rowSpacing = 130;

  const allEdges: Array<{ from: string; to: string; type: 'prerequisite' | 'related' }> = (skeleton.edges || []).map(e => ({
    from: e.from,
    to: e.to,
    type: (e as any).type === 'related' ? 'related' : 'prerequisite'
  }));

  if (allEdges.length === 0) {
    skeleton.nodes.forEach(node => {
      (node.prerequisiteIds || []).forEach(pId => {
        allEdges.push({ from: pId, to: node.id, type: 'prerequisite' });
      });
    });
  }

  return skeleton.nodes.map((node, index) => {
    const lvl = levelMap[node.id] || 0;
    const group = levelGroups[lvl] || [node];
    const itemIndex = group.indexOf(node);

    const x = startX + lvl * colSpacing;
    const y = startY + itemIndex * rowSpacing;

    let uiStatus: 'locked' | 'available' | 'completed' | 'active' = 'locked';
    if (node.status === 'mastered') uiStatus = 'completed';
    else if (node.status === 'in_progress') uiStatus = 'active';
    else if (node.status === 'available') uiStatus = 'available';
    else uiStatus = 'locked';

    return {
      id: node.id,
      session_id: sessionId,
      title: node.title,
      description: node.oneLineSummary,
      x,
      y,
      dependencies: node.prerequisiteIds || [],
      edges: allEdges,
      status: uiStatus,
      order_index: index,
    };
  });
}

// Helper to construct LearnerState from Session
async function buildLearnerState(sessionId: string, session: any): Promise<LearnerState> {
  let cal: Calibration = { level: 'intermediate', known_concepts: [], weak_points: [] };
  if (session?.calibration) {
    try {
      cal = typeof session.calibration === 'string' ? JSON.parse(session.calibration) : session.calibration;
    } catch (_) {}
  }

  const messages = await db.getMessages(sessionId);
  const chatHistory = (messages || []).map((m: any) => ({
    role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
    content: m.content,
  }));

  return {
    learnerId: sessionId,
    currentGoal: {
      rawStatement: session?.title || 'Learning Session',
      domain: session?.intent || 'General',
      specificObjective: session?.title || 'Master goal',
      contextArtifacts: [],
    },
    vocabularyLevel: cal.level === 'beginner' ? 'beginner' : cal.level === 'advanced' ? 'advanced' : 'intermediate',
    masteryMap: {},
    sessionHistory: [],
    chatHistory,
  };
}

// --- API ROUTES ---

/**
 * GET /api/sessions: Fetch all sessions & nodes for left nav bar history
 */
app.get('/api/sessions', async (req: Request, res: Response): Promise<any> => {
  try {
    const rawSessions = await db.getAllSessionsWithNodes();
    const sessions = rawSessions.map((item) => ({
      ...item.session,
      nodes: item.nodes,
    }));
    return res.json({ sessions });
  } catch (err: any) {
    console.error('Error fetching sessions list:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/agent-logs: Fetch persisted agent logs for audit verification
 */
app.get('/api/agent-logs', async (req: Request, res: Response): Promise<any> => {
  try {
    const learnerId = req.query.learnerId as string | undefined;
    const logs = await db.getAgentLogs(learnerId);
    return res.json({ logs, count: logs.length });
  } catch (err: any) {
    console.error('Error fetching agent logs:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/sessions/start: Primary Session Intake Route
 * Serves Phase 3 Orchestrator intake pipeline (Intent -> Diagnosis -> Drafter -> Verifier)
 */
app.post('/api/sessions/start', upload.array('documents'), async (req: Request, res: Response): Promise<any> => {
  try {
    const { initial_prompt } = req.body;
    if (!initial_prompt) {
      return res.status(400).json({ error: 'initial_prompt is required' });
    }

    const sessionId = crypto.randomUUID();

    // Extract text from attached document files
    const contextArtifacts: string[] = [];
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.mimetype === 'application/pdf') {
          const text = await extractTextFromPdf(file.path);
          contextArtifacts.push(`--- Document: ${file.originalname} ---\n${text}`);
        } else {
          const text = fs.readFileSync(file.path, 'utf8');
          contextArtifacts.push(`--- Document: ${file.originalname} ---\n${text}`);
        }
        try {
          fs.unlinkSync(file.path);
        } catch (_) {}
      }
    }

    const initialLearnerState: LearnerState = {
      learnerId: sessionId,
      currentGoal: {
        rawStatement: initial_prompt,
        domain: 'General',
        specificObjective: initial_prompt,
        contextArtifacts,
      },
      vocabularyLevel: 'intermediate',
      masteryMap: {},
      sessionHistory: [],
      chatHistory: [],
    };

    // ─── PIPELINE START ──────────────────────────────────────────
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🚀 KLAIVO INTAKE PIPELINE — NEW GOAL SUBMITTED`);
    console.log(`   Goal: "${initial_prompt.slice(0, 100)}"`);
    console.log(`   Session: ${sessionId}`);
    console.log(`${'═'.repeat(60)}`);

    // Execute Phase 3 Orchestrator Intake Pipeline with optional SSE streaming
    const isStream = req.headers.accept?.includes('text/event-stream') || req.query.stream === 'true';

    if (isStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const sendSSE = (event: string, data: any) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      const intakeResult = await orchestrator.handleIntakeWorkflow(
        initial_prompt,
        initialLearnerState,
        contextArtifacts,
        undefined,
        undefined,
        (progress) => {
          if (progress.payload?.skeleton) {
            const formatted = mapTreeSkeletonToCurriculumNodes(sessionId, progress.payload.skeleton);
            sendSSE('agent_progress', { ...progress, payload: { ...progress.payload, nodes: formatted } });
          } else {
            sendSSE('agent_progress', progress);
          }
        }
      );

      const targetSubj = intakeResult.slotState?.slotsResolved?.targetSubject;
      const goalSum = intakeResult.status === 'tree_created' ? intakeResult.tree.goalSummary : undefined;
      const sessionTitle = generateSessionTitle(initial_prompt, targetSubj, goalSum);
      const calibration: Calibration = { level: 'intermediate', known_concepts: [], weak_points: [] };

      if (intakeResult.status === 'tree_created') {
        const skeleton = intakeResult.tree;
        const formattedNodes = mapTreeSkeletonToCurriculumNodes(sessionId, skeleton);
        await db.createSession(sessionId, sessionTitle, skeleton.goalSummary, 'learning', calibration);
        if (intakeResult.slotState) await db.updateSessionSlotState(sessionId, intakeResult.slotState);
        await db.saveNodes(sessionId, formattedNodes);
        await db.createMessage(sessionId, null, 'user', initial_prompt);

        const introMsg = `Curriculum verified for objective: "${skeleton.goalSummary}". Select any available node on the canvas to begin learning.`;
        await db.createMessage(sessionId, null, 'assistant', introMsg);

        sendSSE('pipeline_complete', {
          sessionId,
          title: sessionTitle,
          intent: skeleton.goalSummary,
          calibration,
          diagnosticQuestion: introMsg,
          status: 'learning',
          nodes: formattedNodes,
        });
      } else {
        const q = (intakeResult as any).question || (intakeResult as any).response || 'Please provide more details on your learning objective.';
        await db.createSession(sessionId, sessionTitle, 'learning', 'diagnosing', calibration);
        if (intakeResult.slotState) await db.updateSessionSlotState(sessionId, intakeResult.slotState);
        await db.createMessage(sessionId, null, 'user', initial_prompt);
        await db.createMessage(sessionId, null, 'assistant', q);

        sendSSE('pipeline_complete', {
          sessionId,
          title: sessionTitle,
          intent: 'learning',
          calibration,
          diagnosticQuestion: q,
          status: 'diagnosing',
        });
      }
      return res.end();
    }

    // Standard JSON Fallback Request Path
    const intakeResult = await orchestrator.handleIntakeWorkflow(
      initial_prompt,
      initialLearnerState,
      contextArtifacts
    );

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`✅ PIPELINE COMPLETE — status: ${intakeResult.status}`);
    console.log(`${'═'.repeat(60)}\n`);

    const targetSubj = intakeResult.slotState?.slotsResolved?.targetSubject;
    const goalSum = intakeResult.status === 'tree_created' ? intakeResult.tree.goalSummary : undefined;
    const sessionTitle = generateSessionTitle(initial_prompt, targetSubj, goalSum);

    if (intakeResult.status === 'needs_clarification') {
      const calibration: Calibration = { level: 'intermediate', known_concepts: [], weak_points: [] };
      await db.createSession(sessionId, sessionTitle, 'learning', 'diagnosing', calibration);
      if (intakeResult.slotState) await db.updateSessionSlotState(sessionId, intakeResult.slotState);
      await db.createMessage(sessionId, null, 'user', initial_prompt);
      await db.createMessage(sessionId, null, 'assistant', intakeResult.question);

      return res.json({
        sessionId,
        title: sessionTitle,
        intent: 'learning',
        calibration,
        diagnosticQuestion: intakeResult.question,
        status: 'diagnosing',
      });
    }

    if (intakeResult.status === 'needs_more_context') {
      const calibration: Calibration = { level: 'intermediate', known_concepts: [], weak_points: [] };
      await db.createSession(sessionId, sessionTitle, 'learning', 'diagnosing', calibration);
      if (intakeResult.slotState) await db.updateSessionSlotState(sessionId, intakeResult.slotState);
      await db.createMessage(sessionId, null, 'user', initial_prompt);
      await db.createMessage(sessionId, null, 'assistant', intakeResult.question);

      return res.json({
        sessionId,
        title: sessionTitle,
        intent: 'learning',
        calibration,
        diagnosticQuestion: intakeResult.question,
        status: 'diagnosing',
      });
    }

    if (intakeResult.status === 'light_response') {
      const calibration: Calibration = { level: 'intermediate', known_concepts: [], weak_points: [] };
      await db.createSession(sessionId, sessionTitle, intakeResult.intent, 'learning', calibration);
      if (intakeResult.slotState) await db.updateSessionSlotState(sessionId, intakeResult.slotState);
      await db.createMessage(sessionId, null, 'user', initial_prompt);
      await db.createMessage(sessionId, null, 'assistant', intakeResult.response);

      return res.json({
        sessionId,
        title: sessionTitle,
        intent: intakeResult.intent,
        calibration,
        response: intakeResult.response,
        status: 'light_response',
      });
    }

    // Status: tree_created -> Convert tree skeleton to UI nodes and save to DB
    const skeleton = intakeResult.tree;
    const formattedNodes = mapTreeSkeletonToCurriculumNodes(sessionId, skeleton);

    const calibration: Calibration = { level: 'intermediate', known_concepts: [], weak_points: [] };
    await db.createSession(sessionId, sessionTitle, skeleton.goalSummary, 'learning', calibration);
    if (intakeResult.slotState) await db.updateSessionSlotState(sessionId, intakeResult.slotState);
    await db.saveNodes(sessionId, formattedNodes);
    await db.createMessage(sessionId, null, 'user', initial_prompt);

    const introMsg = `Curriculum verified for objective: "${skeleton.goalSummary}". Select any available node on the canvas to begin learning.`;
    await db.createMessage(sessionId, null, 'assistant', introMsg);

    return res.json({
      sessionId,
      title: sessionTitle,
      intent: skeleton.goalSummary,
      calibration,
      diagnosticQuestion: introMsg,
      status: 'learning',
      nodes: formattedNodes,
    });
  } catch (error: any) {
    console.error('[server] Error in /api/sessions/start:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * POST /api/sessions/:id/diagnose: Diagnose turn handler with optional SSE streaming
 */
app.post('/api/sessions/:id/diagnose', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionId = req.params.id as string;
    const text = req.body.text as string;

    const session = await db.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await db.createMessage(sessionId, null, 'user', text);

    // HARD GATE: If curriculum tree already exists for this session (status === 'learning'),
    // DO NOT invoke DiagnosisAgent, CurriculumDrafter, CurriculumVerifier, or db.saveNodes.
    if (session.status === 'learning') {
      console.log(`[server] Hard Gate: Session ${sessionId} is in 'learning' mode. Bypassing tree-building pipeline.`);
      const existingNodes = await db.getNodes(sessionId);
      const sessionMessages = await db.getMessages(sessionId);
      const historyText = sessionMessages
        .slice(-6)
        .map((m) => `${m.sender.toUpperCase()}: ${m.content}`)
        .join('\n');

      let explanationText: string;
      try {
        const provider = getModelProvider();
        const systemInstruction = `You are Klaivo's AI tutor for the learning objective: "${session.title}".
The learner has an active curriculum tree and is asking a question in the main session chat.
Provide a helpful, direct, and concise explanation answering their question. Do NOT output debug text or alter curriculum nodes.`;

        const userPrompt = `Learning Objective: "${session.title}"
User Question: "${text}"
${historyText ? `Recent Conversation:\n${historyText}` : ''}`;

        explanationText = await provider.generateText(userPrompt, systemInstruction);
      } catch (genErr: any) {
        console.error('[server] Error generating post-curriculum Q&A explanation:', genErr);
        explanationText = "Sorry, I couldn't generate a response — try asking again.";
      }

      await db.createMessage(sessionId, null, 'assistant', explanationText);

      const isStream = req.headers.accept?.includes('text/event-stream') || req.query.stream === 'true';
      if (isStream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`event: pipeline_complete\ndata: ${JSON.stringify({
          status: 'learning',
          title: session.title,
          response: explanationText,
          nodes: existingNodes,
        })}\n\n`);
        return res.end();
      }

      return res.json({
        status: 'learning',
        title: session.title,
        response: explanationText,
        nodes: existingNodes,
      });
    }

    const learnerState = await buildLearnerState(sessionId, session);

    const isStream = req.headers.accept?.includes('text/event-stream') || req.query.stream === 'true';

    if (isStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const sendSSE = (event: string, data: any) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      const intakeResult = await orchestrator.handleIntakeWorkflow(
        text,
        learnerState,
        [],
        session.slot_state,
        undefined,
        (progress) => {
          if (progress.payload?.skeleton) {
            const formatted = mapTreeSkeletonToCurriculumNodes(sessionId, progress.payload.skeleton);
            sendSSE('agent_progress', { ...progress, payload: { ...progress.payload, nodes: formatted } });
          } else {
            sendSSE('agent_progress', progress);
          }
        }
      );

      if (intakeResult.slotState) {
        await db.updateSessionSlotState(sessionId, intakeResult.slotState);
      }

      const diagSubj = intakeResult.slotState?.slotsResolved?.targetSubject;
      const diagGoal = intakeResult.status === 'tree_created' ? intakeResult.tree.goalSummary : undefined;
      const updatedTitle = generateSessionTitle(session.title || text, diagSubj, diagGoal);
      await db.updateSessionTitle(sessionId, updatedTitle);

      if (intakeResult.status === 'tree_created') {
        const formattedNodes = mapTreeSkeletonToCurriculumNodes(sessionId, intakeResult.tree);
        await db.saveNodes(sessionId, formattedNodes);
        await db.updateSessionStatus(sessionId, 'learning');

        const finalMsg = `Curriculum tree drafted and verified for: "${intakeResult.tree.goalSummary}". Select any available concept node to start learning!`;
        await db.createMessage(sessionId, null, 'assistant', finalMsg);

        sendSSE('pipeline_complete', {
          status: 'learning',
          title: updatedTitle,
          response: finalMsg,
          nodes: formattedNodes,
        });
      } else {
        const q = (intakeResult as any).question || (intakeResult as any).response || 'Could you provide a bit more detail on your specific learning objective?';
        await db.createMessage(sessionId, null, 'assistant', q);
        sendSSE('pipeline_complete', {
          status: 'diagnosing',
          title: updatedTitle,
          response: q,
        });
      }
      return res.end();
    }

    const intakeResult = await orchestrator.handleIntakeWorkflow(text, learnerState, [], session.slot_state);

    if (intakeResult.slotState) {
      await db.updateSessionSlotState(sessionId, intakeResult.slotState);
    }

    const diagSubj = intakeResult.slotState?.slotsResolved?.targetSubject;
    const diagGoal = intakeResult.status === 'tree_created' ? intakeResult.tree.goalSummary : undefined;
    const updatedTitle = generateSessionTitle(session.title || text, diagSubj, diagGoal);
    await db.updateSessionTitle(sessionId, updatedTitle);

    if (intakeResult.status === 'tree_created') {
      const formattedNodes = mapTreeSkeletonToCurriculumNodes(sessionId, intakeResult.tree);
      await db.saveNodes(sessionId, formattedNodes);
      await db.updateSessionStatus(sessionId, 'learning');

      const finalMsg = `Curriculum tree drafted and verified for: "${intakeResult.tree.goalSummary}". Select any available concept node to start learning!`;
      await db.createMessage(sessionId, null, 'assistant', finalMsg);

      return res.json({
        status: 'learning',
        title: updatedTitle,
        response: finalMsg,
        nodes: formattedNodes,
      });
    } else {
      const q = (intakeResult as any).question || (intakeResult as any).response || 'Could you provide a bit more detail on your specific learning objective?';
      await db.createMessage(sessionId, null, 'assistant', q);
      return res.json({
        status: 'diagnosing',
        title: updatedTitle,
        response: q,
      });
    }
  } catch (error: any) {
    console.error('[server] Error processing diagnosis turn:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * GET /api/sessions/:id: Fetch full session details (nodes, messages)
 * STRICTLY READ-ONLY per REST & Phase 6 architectural specification. Zero side effects or generation triggers.
 */
app.get('/api/sessions/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionId = req.params.id as string;
    const session = await db.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messages = await db.getMessages(sessionId);
    const nodes = await db.getNodes(sessionId);

    return res.json({
      session,
      messages,
      nodes,
    });
  } catch (error: any) {
    console.error('[server] Error fetching session:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * DELETE /api/sessions/:id: Delete session
 */
app.delete('/api/sessions/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionId = req.params.id as string;
    await db.deleteSession(sessionId);
    return res.json({ success: true });
  } catch (error: any) {
    console.error('[server] Error deleting session:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * PATCH /api/sessions/:id: Rename session title
 */
app.patch('/api/sessions/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionId = req.params.id as string;
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    await db.renameSession(sessionId, title);
    return res.json({ success: true });
  } catch (error: any) {
    console.error('[server] Error renaming session:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * POST /api/sessions/:id/nodes/:nodeId/star: Toggle node star status
 */
app.post('/api/sessions/:id/nodes/:nodeId/star', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionId = req.params.id as string;
    const nodeId = req.params.nodeId as string;
    const { isStarred } = req.body;
    await db.toggleStarNode(sessionId, nodeId, !!isStarred);
    return res.json({ success: true });
  } catch (error: any) {
    console.error('[server] Error starring node:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * POST /api/sessions/:id/nodes/:nodeId/open: Mark node as opened / in_progress
 */
app.post('/api/sessions/:id/nodes/:nodeId/open', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionId = req.params.id as string;
    const nodeId = req.params.nodeId as string;
    await db.updateNodeStatus(sessionId, nodeId, 'in_progress');
    return res.json({ success: true });
  } catch (error: any) {
    console.error('[server] Error opening node:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * POST /api/sessions/:id/nodes/:nodeId/reset: Reset concept thread
 */
app.post('/api/sessions/:id/nodes/:nodeId/reset', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionId = req.params.id as string;
    const nodeId = req.params.nodeId as string;
    await db.resetNodeChat(sessionId, nodeId);
    return res.json({ success: true });
  } catch (error: any) {
    console.error('[server] Error resetting node chat:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * GET /api/sessions/:id/nodes/:nodeId/chat: Get node-specific chat history
 */
app.get('/api/sessions/:id/nodes/:nodeId/chat', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const nodeId = req.params.nodeId as string;
    const messages = await db.getMessages(id, nodeId);
    return res.json(messages);
  } catch (error: any) {
    console.error('[server] Error fetching node chat:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * GET /api/sessions/:id/nodes/:nodeId/teach: Lazy node content streaming
 * Invokes Phase 3 Orchestrator handleOpenNodeWorkflow (TeachingAgent)
 */
app.get('/api/sessions/:id/nodes/:nodeId/teach', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const nodeId = req.params.nodeId as string;
    const session = await db.getSession(id);
    const dbNodes = await db.getNodes(id);
    const targetDbNode = dbNodes.find((n) => n.id === nodeId);

    if (!session || !targetDbNode) {
      return res.status(404).send('Session or Node not found');
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const learnerState = await buildLearnerState(id, session);
    const mockTree: TreeSkeleton = {
      treeId: `tree_${id}`,
      learnerId: id,
      goalSummary: session.title,
      nodes: dbNodes.map((n) => ({
        id: n.id,
        title: n.title,
        oneLineSummary: n.description || '',
        goalRelevance: n.description || '',
        prerequisiteIds: n.dependencies || [],
        status: n.status === 'completed' ? 'mastered' : n.status === 'active' ? 'in_progress' : n.status,
        content: null,
        masteryScore: n.status === 'completed' ? 1.0 : 0.0,
        depth: 0,
      })),
      edges: [],
      verificationStatus: 'verified',
      verificationNotes: [],
      version: 1,
    };

    const nodeContent = await orchestrator.handleOpenNodeWorkflow(mockTree, nodeId, learnerState);
    const responseText = `${nodeContent.explanation}\n\n**Key Practice Applications:**\n${nodeContent.examples.map((ex) => `- ${ex}`).join('\n')}`;

    res.write(responseText);
    await db.createMessage(id, nodeId, 'assistant', responseText);
    return res.end();
  } catch (error: any) {
    console.error('[server] Error streaming teaching content:', error);
    return res.status(500).send('Streaming Failed');
  }
});

/**
 * POST /api/sessions/:id/nodes/:nodeId/message: Node Assessment & Message Route
 * Invokes Phase 3 Orchestrator handleNodeAssessmentWorkflow (AssessmentAgent + MemoryUpdateAgent)
 */
app.post('/api/sessions/:id/nodes/:nodeId/message', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const nodeId = req.params.nodeId as string;
    const answer = (req.body.answer || req.body.text || req.body.message || req.body.content) as string;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const session = await db.getSession(id);
    const dbNodes = await db.getNodes(id);
    let targetDbNode: CurriculumNode | undefined = dbNodes.find((n) => String(n.id) === String(nodeId));

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!targetDbNode) {
      targetDbNode = {
        id: nodeId,
        session_id: id,
        title: 'Learning Concept',
        description: '',
        status: 'in_progress',
        order_index: 0,
        dependencies: [],
        x: 0,
        y: 0,
      };
    }

    await db.createMessage(id, nodeId, 'user', answer);

    // 1. Classify message intent: follow-up question vs assessment answer
    const nodeTemplate = {
      id: targetDbNode.id,
      title: targetDbNode.title,
      description: targetDbNode.description || '',
      status: targetDbNode.status,
      dependencies: targetDbNode.dependencies || [],
      x: targetDbNode.x || 0,
      y: targetDbNode.y || 0,
      order_index: targetDbNode.order_index || 0,
    };
    const intent = await classifyMessageIntent(nodeTemplate, answer);
    console.log(`[server] Node message intent classified as: "${intent}" for user message: "${answer.slice(0, 50)}"`);

    if (intent === 'question') {
      // 2. User asked a follow-up question on the node concept — generate contextual LLM explanation
      const nodeMessages = await db.getMessages(id, nodeId);
      const historyText = nodeMessages
        .slice(-6)
        .map((m) => `${m.sender.toUpperCase()}: ${m.content}`)
        .join('\n');

      let explanationText: string;
      try {
        const provider = getModelProvider();
        const systemInstruction = `You are Klaivo's AI tutor assisting a learner studying the concept: "${targetDbNode.title}".
Description/Summary: "${targetDbNode.description || ''}"

The learner is asking a follow-up question, seeking clarification, or expressing confusion about this concept.
Provide a direct, clear, encouraging, and thorough explanation that directly answers their question, addresses their confusion, and builds genuine understanding.
Do NOT output any placeholder/debug text. Use Markdown for clarity.`;

        const userPrompt = `Concept Node: "${targetDbNode.title}"
Learner Question / Comment: "${answer}"
${historyText ? `Recent Chat History:\n${historyText}` : ''}`;

        explanationText = await provider.generateText(userPrompt, systemInstruction);
      } catch (genError: any) {
        console.error('[server] Error generating LLM follow-up explanation:', genError);
        explanationText = "Sorry, I couldn't generate a response — try asking again.";
      }

      await db.createMessage(id, nodeId, 'assistant', explanationText);
      return res.json({
        passed: false,
        feedback: explanationText,
        nodesUpdated: false,
        nodes: dbNodes,
        calibration: session.calibration,
        isAssessment: false,
      });
    }

    // 3. User is answering an assessment prompt — run assessment workflow
    const learnerState = await buildLearnerState(id, session);
    const mockTree: TreeSkeleton = {
      treeId: `tree_${id}`,
      learnerId: id,
      goalSummary: session.title,
      nodes: dbNodes.map((n) => ({
        id: n.id,
        title: n.title,
        oneLineSummary: n.description || '',
        goalRelevance: n.description || '',
        prerequisiteIds: n.dependencies || [],
        status: n.status === 'completed' ? 'mastered' : n.status === 'active' ? 'in_progress' : n.status,
        content: null,
        masteryScore: n.status === 'completed' ? 1.0 : 0.0,
        depth: 0,
      })),
      edges: [],
      verificationStatus: 'verified',
      verificationNotes: [],
      version: 1,
    };

    const workflowResult = await orchestrator.handleNodeAssessmentWorkflow(
      mockTree,
      nodeId,
      answer,
      learnerState
    );

    if (workflowResult.status === 'assessment_success') {
      const { assessmentResult } = workflowResult;

      let feedbackText = assessmentResult.reasoning;
      if (assessmentResult.detectedMisconceptions && assessmentResult.detectedMisconceptions.length > 0) {
        feedbackText += `\n\n**Areas to refine:**\n${assessmentResult.detectedMisconceptions.map((m) => `- ${m}`).join('\n')}`;
      }

      await db.createMessage(id, nodeId, 'assistant', feedbackText);

      if (targetDbNode.status !== 'completed' && assessmentResult.readyToAdvance) {
        await db.updateNodeStatus(id, nodeId, 'completed');
      }

      const updatedList = await db.getNodes(id);
      const completedIds = updatedList.filter((n) => n.status === 'completed').map((n) => n.id);

      for (const node of updatedList) {
        if (node.status === 'locked') {
          const allDepsMet = node.dependencies.every((depId) => completedIds.includes(depId));
          if (allDepsMet) {
            await db.updateNodeStatus(id, node.id, 'available');
          }
        }
      }

      const finalNodes = await db.getNodes(id);
      return res.json({
        passed: assessmentResult.readyToAdvance,
        feedback: feedbackText,
        nodesUpdated: true,
        nodes: finalNodes,
        calibration: session.calibration,
        isAssessment: true,
      });
    } else {
      await db.createMessage(id, nodeId, 'assistant', workflowResult.message);
      return res.json({
        passed: false,
        feedback: workflowResult.message,
        nodesUpdated: false,
        nodes: dbNodes,
        calibration: session.calibration,
        isAssessment: true,
      });
    }
  } catch (error: any) {
    console.error('[server] Error processing node message:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * POST /api/sessions/:id/nodes/:nodeId/task-simulation: Generate / fetch interactive task simulation
 */
app.post('/api/sessions/:id/nodes/:nodeId/task-simulation', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const nodeId = req.params.nodeId as string;

    const existing = await db.getTaskSimulation(id, nodeId);
    if (existing) {
      return res.json({ task: existing.prompt_spec });
    }

    const session = await db.getSession(id);
    const dbNodes = await db.getNodes(id);
    const targetNode = dbNodes.find((n) => n.id === nodeId);

    if (!session || !targetNode) {
      return res.status(404).json({ error: 'Session or Node not found' });
    }

    const mockTreeNode: TreeNode = {
      id: targetNode.id,
      title: targetNode.title,
      oneLineSummary: targetNode.description || '',
      goalRelevance: targetNode.description || '',
      prerequisiteIds: targetNode.dependencies || [],
      status: 'available',
      content: null,
      masteryScore: 0.0,
      depth: 0,
    };

    const taskSpec = await generateTaskSimulation({
      sessionId: id,
      node: mockTreeNode,
      goalSummary: session.title,
      vocabularyLevel: 'intermediate',
    });

    await db.saveTaskSimulation(
      taskSpec.id,
      id,
      nodeId,
      taskSpec.taskType,
      taskSpec,
      taskSpec.starterTemplate,
      taskSpec.solutionRubric
    );

    return res.json({ task: taskSpec });
  } catch (error: any) {
    console.error('[server] Error generating task simulation:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * POST /api/sessions/:id/nodes/:nodeId/evaluate-task: Evaluate task submission & update evidence score
 */
app.post('/api/sessions/:id/nodes/:nodeId/evaluate-task', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const nodeId = req.params.nodeId as string;
    const { submission, taskSpec } = req.body;

    if (!submission || !taskSpec) {
      return res.status(400).json({ error: 'Submission and taskSpec are required' });
    }

    const evalResult = await evaluateTaskSubmission(taskSpec, submission, id);

    // Record multi-signal evidence score
    const evidenceSummary = await addEvidenceSignal(id, nodeId, {
      type: 'task_simulation',
      score: evalResult.score,
      timestamp: new Date().toISOString(),
    });

    if (evalResult.passed) {
      await db.updateNodeStatus(id, nodeId, 'completed');
    }

    const updatedNodes = await db.getNodes(id);

    return res.json({
      evaluation: evalResult,
      evidenceSummary,
      nodes: updatedNodes,
    });
  } catch (error: any) {
    console.error('[server] Error evaluating task submission:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[server] Global Unhandled Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(port, () => {
  console.log(`Klaivo Express backend running on http://localhost:${port}`);
});
