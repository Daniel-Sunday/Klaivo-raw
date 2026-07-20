import express, { Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

import * as db from './database';
import { extractTextFromPdf } from './utils/pdfReader';

// Import Agent Modules
import { classifyIntent } from './agents/intentAgent';
import { getDiagnosticQuestion, processDiagnosticTurn } from './agents/diagnosisAgent';
import { generateCurriculum } from './agents/curriculumAgent';
import { streamExplanation, streamFollowUpAnswer } from './agents/teachingAgent';
import { assessAnswer } from './agents/assessmentAgent';
import { classifyMessageIntent } from './agents/routingAgent';
import { Calibration, CurriculumNode } from './types';

// Resolve project root (handles running directly from source or compiled dist/ directory)
const projectRoot = fs.existsSync(path.join(__dirname, 'public'))
  ? __dirname
  : path.join(__dirname, '..');

// Initialize directories
const uploadsDir = path.join(projectRoot, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database init
(async () => {
  await db.initDb();
})();

const app = express();
const port = process.env.PORT || 3005;

// Configure Multer for PDF file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.static(path.join(projectRoot, 'public')));

// --- API ROUTES ---

/**
 * Start a new learning session
 */
app.post('/api/sessions/start', upload.array('documents'), async (req: Request, res: Response): Promise<any> => {
  try {
    const { initial_prompt } = req.body;
    if (!initial_prompt) {
      return res.status(400).json({ error: 'initial_prompt is required' });
    }

    const sessionId = crypto.randomUUID();
    
    // Phase 1: Intent Agent classification
    const intent = await classifyIntent(initial_prompt);
    
    // Initial Calibration (default)
    const calibration: Calibration = {
      level: 'beginner',
      known_concepts: [],
      weak_points: []
    };

    // Create session in Database
    const session = await db.createSession(sessionId, initial_prompt, intent, calibration);
    
    // Save user's initial prompt in messages
    await db.createMessage(sessionId, null, 'user', initial_prompt);

    // Parse any attached documents
    let extractedText = '';
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.mimetype === 'application/pdf') {
          const text = await extractTextFromPdf(file.path);
          extractedText += `\n--- Document: ${file.originalname} ---\n${text}\n`;
        } else {
          // Text file
          const text = fs.readFileSync(file.path, 'utf8');
          extractedText += `\n--- Document: ${file.originalname} ---\n${text}\n`;
        }
        // Cleanup temp file
        fs.unlinkSync(file.path);
      }
    }

    // Phase 1: Diagnosis Agent generates first diagnostic question
    const question = await getDiagnosticQuestion(intent, initial_prompt);
    
    // Save diagnostic question in messages
    await db.createMessage(sessionId, null, 'assistant', question);

    res.json({
      sessionId,
      intent,
      calibration,
      diagnosticQuestion: question
    });

  } catch (error) {
    console.error('[server] Error starting session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Diagnose context-gathering turn
 */
app.post('/api/sessions/:id/diagnose', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionId = req.params.id as string;
    const text = req.body.text as string;
    
    const session = await db.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Save user message
    await db.createMessage(sessionId, null, 'user', text);

    // Process turn with Diagnosis Agent
    const diagnosisResult = await processDiagnosticTurn(session, text, '');

    if (diagnosisResult.readyForPath) {
      // Trigger Curriculum & Knowledge Graph Agent
      const nodes = await generateCurriculum(diagnosisResult.summary!);
      
      // Associate session ID and write to DB
      const formattedNodes: CurriculumNode[] = nodes.map(node => ({
        ...node,
        session_id: sessionId
      })) as CurriculumNode[];
      
      await db.createNodes(formattedNodes);
      await db.updateSessionStatus(sessionId, 'learning');
      
      // Save path generation message
      const finalMsg = diagnosisResult.feedback;
      await db.createMessage(sessionId, null, 'assistant', finalMsg);

      res.json({
        status: 'learning',
        response: finalMsg,
        nodes: await db.getNodes(sessionId)
      });
    } else {
      // Diagnostic continue
      await db.createMessage(sessionId, null, 'assistant', diagnosisResult.feedback);
      res.json({
        status: 'diagnosing',
        response: diagnosisResult.feedback
      });
    }

  } catch (error) {
    console.error('[server] Error processing diagnosis turn:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Fetch full session details (including nodes and chat history)
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

    res.json({
      session,
      messages,
      nodes
    });
  } catch (error) {
    console.error('[server] Error fetching session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get node-specific chat history
 */
app.get('/api/sessions/:id/nodes/:nodeId/chat', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const nodeId = req.params.nodeId as string;
    const messages = await db.getMessages(id, nodeId);
    res.json(messages);
  } catch (error) {
    console.error('[server] Error fetching node chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Stream node teaching content
 */
app.get('/api/sessions/:id/nodes/:nodeId/teach', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const nodeId = req.params.nodeId as string;
    const session = await db.getSession(id);
    const nodes = await db.getNodes(id);
    const node = nodes.find(n => n.id === nodeId);
    
    if (!session || !node) {
      return res.status(404).send('Session or Node not found');
    }

    // Set streaming headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    let fullText = '';
    
    // Call teaching agent stream
    await streamExplanation(node, session.calibration, (chunk) => {
      fullText += chunk;
      res.write(chunk);
    });

    // Save full explanation message to the database
    await db.createMessage(id, nodeId, 'assistant', fullText);
    res.end();

  } catch (error) {
    console.error('[server] Error streaming teaching content:', error);
    res.status(500).send('Streaming Failed');
  }
});

/**
 * Assess user answer for a concept node
 */
app.post('/api/sessions/:id/nodes/:nodeId/message', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const nodeId = req.params.nodeId as string;
    const answer = req.body.answer as string;

    if (!answer) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const session = await db.getSession(id);
    const nodes = await db.getNodes(id);
    const node = nodes.find(n => n.id === nodeId);

    if (!session || !node) {
      return res.status(404).json({ error: 'Session or Node not found' });
    }

    // 1. Classify intent of user node message: follow-up question or assessment answer
    const messageIntent = await classifyMessageIntent(node, answer);
    console.log(`[server] Node message intent classified as: ${messageIntent}`);

    // Save user message to database
    await db.createMessage(id, nodeId, 'user', answer);

    if (messageIntent === 'question') {
      // Stream follow-up answer (chunked text)
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      let fullText = '';
      const chatHistory = await db.getMessages(id, nodeId);
      
      await streamFollowUpAnswer(node, session.calibration, chatHistory, (chunk) => {
        fullText += chunk;
        res.write(chunk);
      });

      // Save assistant answer to database
      await db.createMessage(id, nodeId, 'assistant', fullText);
      return res.end();
    }

    // Otherwise, treat as an assessment answer
    // Call assessment agent
    const result = await assessAnswer(node, session.calibration, answer);

    // Save assessment feedback
    await db.createMessage(id, nodeId, 'assistant', result.feedback);

    let nodesUpdated = false;
    let updatedNodes = nodes;

    if (result.passed) {
      // Mark current node as completed
      await db.updateNodeStatus(id, nodeId, 'completed');
      
      // Update session calibration state
      const currentCal = session.calibration;
      if (result.calibration_update) {
        // Simple level float update
        const levels: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
        let lvlIdx = levels.indexOf(currentCal.level);
        if (result.calibration_update.level_delta > 0 && lvlIdx < 2) {
          lvlIdx++;
          currentCal.level = levels[lvlIdx];
        }
        
        // Add newly learned concepts
        currentCal.known_concepts = [
          ...new Set([...currentCal.known_concepts, ...result.calibration_update.add_known])
        ];
        
        await db.updateSessionCalibration(id, currentCal);
      }

      // Run deterministic unlocking rules for dependent nodes
      await checkAndUnlockNodes(id);
      
      nodesUpdated = true;
      updatedNodes = await db.getNodes(id);
    }

    const updatedSession = await db.getSession(id);

    res.json({
      passed: result.passed,
      feedback: result.feedback,
      nodesUpdated,
      nodes: updatedNodes,
      calibration: updatedSession!.calibration,
      isAssessment: true
    });

  } catch (error) {
    console.error('[server] Error processing node message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/sessions/:id/nodes/:nodeId/assess', (req: Request, res: Response) => {
  res.redirect(307, `/api/sessions/${req.params.id}/nodes/${req.params.nodeId}/message`);
});

/**
 * Deterministic Graph Traversal for Node Unlocking
 * If all dependencies of a locked node are 'completed', mark it as 'available'.
 */
async function checkAndUnlockNodes(sessionId: string): Promise<void> {
  const list = await db.getNodes(sessionId);
  const completedIds = list.filter(n => n.status === 'completed').map(n => n.id);
  
  for (const node of list) {
    if (node.status === 'locked') {
      const allDepsMet = node.dependencies.every(depId => completedIds.includes(depId));
      if (allDepsMet) {
        await db.updateNodeStatus(sessionId, node.id, 'available');
      }
    }
  }
}

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[server] Global Unhandled Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Klaivo Express backend running on http://localhost:${port}`);
});
