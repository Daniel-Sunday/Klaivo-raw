import { Router, Request, Response } from 'express';
import { generateTaskSimulation, evaluateTaskSubmission } from '../agents/taskSimulationAgent';
import { runTeachingAgent } from '../agents/teachingAgent';
import { runAssessmentAgent } from '../agents/assessmentAgent';
import * as db from '../database';

export const nodeRouter = Router();

/**
 * POST /api/nodes/:id/task: Generate dynamic domain task simulation for concept node
 */
nodeRouter.post('/:id/task', async (req: Request, res: Response): Promise<any> => {
  try {
    const nodeId = req.params.id;
    const { sessionId, goalSummary = 'Master target domain', vocabularyLevel = 'intermediate' } = req.body;

    const node = await db.getNode(nodeId, sessionId);
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const taskSpec = await generateTaskSimulation({
      sessionId,
      node: {
        id: node.id,
        title: node.title,
        oneLineSummary: node.description || node.title,
        goalRelevance: node.description || node.title,
        prerequisiteIds: JSON.parse(node.dependencies || '[]'),
        status: node.status as any,
      },
      goalSummary,
      vocabularyLevel,
    });

    return res.json({ task: taskSpec });
  } catch (err: any) {
    console.error('[NodeRouter] Task generation failed:', err);
    return res.status(500).json({ error: err.message || 'Task generation failed' });
  }
});

/**
 * POST /api/nodes/:id/evaluate: Evaluate task submission via TaskSimulationAgent
 */
nodeRouter.post('/:id/evaluate', async (req: Request, res: Response): Promise<any> => {
  try {
    const nodeId = req.params.id;
    const { sessionId, taskSpec, submission } = req.body;

    if (!submission) {
      return res.status(400).json({ error: 'Submission content is required' });
    }

    const evaluation = await evaluateTaskSubmission(taskSpec, submission);
    return res.json({ evaluation });
  } catch (err: any) {
    console.error('[NodeRouter] Evaluation failed:', err);
    return res.status(500).json({ error: err.message || 'Evaluation failed' });
  }
});
