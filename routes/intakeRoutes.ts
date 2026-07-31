import { Router, Request, Response } from 'express';
import { KlaivoOrchestrator, AgentProgressEvent } from '../orchestrator';
import { LearnerState } from '../schemas';
import * as db from '../database';

export const intakeRouter = Router();
const orchestrator = new KlaivoOrchestrator();

/**
 * POST /api/intake/stream: Real-time Server-Sent Events (SSE) Multi-Agent Pipeline Streaming
 */
intakeRouter.post('/stream', async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const { message, sessionId, calibration, contextArtifacts = [] } = req.body;

  if (!message) {
    res.write(`data: ${JSON.stringify({ error: 'Message is required' })}\n\n`);
    res.end();
    return;
  }

  const sendSSE = (event: string, payload: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    const session = sessionId ? await db.getSession(sessionId) : null;
    const messages = sessionId ? await db.getMessages(sessionId) : [];

    let slotState: any = undefined;
    if (session?.slot_state) {
      try {
        slotState = typeof session.slot_state === 'string' ? JSON.parse(session.slot_state) : session.slot_state;
      } catch (_) {}
    }

    const chatHistory = (messages || []).map((m: any) => ({
      role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }));

    const learnerState: LearnerState = {
      learnerId: sessionId || `learner_${Date.now()}`,
      currentGoal: {
        rawStatement: message,
        domain: session?.intent || 'General',
        specificObjective: session?.title || message,
        contextArtifacts,
      },
      vocabularyLevel: calibration === 'beginner' ? 'beginner' : calibration === 'advanced' ? 'advanced' : 'intermediate',
      masteryMap: {},
      sessionHistory: [],
      chatHistory,
    };

    sendSSE('pipeline_start', { timestamp: new Date().toISOString(), sessionId });

    const result = await orchestrator.handleIntakeWorkflow(
      message,
      learnerState,
      contextArtifacts,
      slotState,
      undefined,
      (progressEvent: AgentProgressEvent) => {
        sendSSE('agent_progress', progressEvent);
      }
    );

    sendSSE('pipeline_complete', { status: 'success', result });
    res.end();
  } catch (err: any) {
    sendSSE('pipeline_error', { error: err.message || 'Pipeline execution error' });
    res.end();
  }
});
