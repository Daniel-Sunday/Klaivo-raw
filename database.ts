import { createClient, SupabaseClient } from '@supabase/supabase-js';
import DatabaseConstructor from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';
import { Session, CurriculumNode, Message, Calibration } from './types';
import { AgentLog } from './schemas';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseServiceRoleKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseServiceRoleKey.includes('your-supabase-service-role-key');

let supabase: SupabaseClient | null = null;
let sqliteDb: any = null;

const projectRoot = fs.existsSync(path.join(__dirname, 'public'))
  ? __dirname
  : path.join(__dirname, '..');
const dbPath = path.join(projectRoot, 'klaivo.db');
sqliteDb = new DatabaseConstructor(dbPath, { verbose: console.log });
sqliteDb.pragma('foreign_keys = ON');

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);
  console.log('[Database] Using Supabase Postgres backend with SQLite backup.');
} else {
  console.log('[Database] Using SQLite database backend.');
}

export function getSupabase(): SupabaseClient | null {
  return supabase;
}

export async function initDb(): Promise<void> {
  // Always initialize SQLite tables to guarantee zero-fail local fallbacks
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      intent TEXT,
      status TEXT NOT NULL DEFAULT 'diagnosing',
      calibration TEXT NOT NULL,
      slot_state TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  try {
    sqliteDb.exec(`ALTER TABLE sessions ADD COLUMN slot_state TEXT`);
  } catch (_) {}
  try {
    sqliteDb.exec(`ALTER TABLE sessions ADD COLUMN user_id TEXT`);
  } catch (_) {}
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      x REAL,
      y REAL,
      dependencies TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'locked',
      order_index INTEGER NOT NULL,
      is_starred INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id, session_id),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);
  try {
    sqliteDb.exec(`ALTER TABLE nodes ADD COLUMN is_starred INTEGER NOT NULL DEFAULT 0`);
  } catch (_) {}
  try {
    sqliteDb.exec(`ALTER TABLE nodes ADD COLUMN edges TEXT NOT NULL DEFAULT '[]'`);
  } catch (_) {}
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      node_id TEXT,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS agent_logs (
      log_id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      learner_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      input TEXT NOT NULL,
      output TEXT NOT NULL,
      reasoning TEXT,
      validation_passed INTEGER NOT NULL,
      retry_count INTEGER NOT NULL
    )
  `);
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS session_artifacts (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      content TEXT NOT NULL,
      structured_metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS vector_embeddings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      artifact_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      chunk_text TEXT NOT NULL,
      embedding TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS task_simulations (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      node_id TEXT NOT NULL,
      task_type TEXT NOT NULL,
      prompt_spec TEXT NOT NULL,
      starter_code TEXT,
      solution_rubric TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS evidence_scores (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      node_id TEXT NOT NULL,
      mastery_probability REAL NOT NULL DEFAULT 0.0,
      signals TEXT NOT NULL,
      advisory_badge TEXT NOT NULL DEFAULT 'available',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  if (supabase) {
    const { error } = await supabase.from('sessions').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('[Database] Note on Supabase connection query:', error.message);
    } else {
      console.log('[Database] Supabase connection active.');
    }
  }
}

export async function createSession(
  idOrSession: any,
  title?: string,
  intent?: string,
  calibrationOrStatus?: any,
  calibrationParam?: any,
  userId?: string
): Promise<Session> {
  let sessionObj: Omit<Session, 'created_at' | 'updated_at'>;

  if (typeof idOrSession === 'object' && idOrSession !== null) {
    sessionObj = idOrSession;
  } else {
    sessionObj = {
      id: idOrSession,
      user_id: userId,
      title: title || 'Learning Session',
      intent: intent || 'learning',
      status: (typeof calibrationOrStatus === 'string' ? calibrationOrStatus : 'diagnosing') as 'diagnosing' | 'learning',
      calibration: typeof calibrationOrStatus === 'object' ? calibrationOrStatus : calibrationParam || { level: 'beginner', known_concepts: [], weak_points: [] },
    };
  }

  const calJson = JSON.stringify(sessionObj.calibration);
  const slotJson = sessionObj.slot_state ? JSON.stringify(sessionObj.slot_state) : null;
  if (supabase) {
    try {
      await supabase.from('sessions').insert({
        id: sessionObj.id,
        user_id: sessionObj.user_id || null,
        title: sessionObj.title,
        intent: sessionObj.intent,
        status: sessionObj.status,
        calibration: calJson,
        slot_state: slotJson,
      });
    } catch (_) {}
  }
  sqliteDb
    .prepare('INSERT OR REPLACE INTO sessions (id, user_id, title, intent, status, calibration, slot_state) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(sessionObj.id, sessionObj.user_id || null, sessionObj.title, sessionObj.intent, sessionObj.status, calJson, slotJson);

  return getSession(sessionObj.id) as Promise<Session>;
}

export async function getSession(id: string): Promise<Session | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('sessions').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          ...data,
          calibration: typeof data.calibration === 'string' ? JSON.parse(data.calibration) : data.calibration,
          slot_state: data.slot_state ? (typeof data.slot_state === 'string' ? JSON.parse(data.slot_state) : data.slot_state) : undefined,
        };
      }
    } catch (_) {}
  }
  const row = sqliteDb.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    calibration: JSON.parse(row.calibration),
    slot_state: row.slot_state ? JSON.parse(row.slot_state) : undefined,
  };
}

export async function updateSession(id: string, updates: Partial<Omit<Session, 'id'>>): Promise<void> {
  const dbUpdates: any = { ...updates, updated_at: new Date().toISOString() };
  if (updates.calibration) {
    dbUpdates.calibration = JSON.stringify(updates.calibration);
  }
  if (updates.slot_state) {
    dbUpdates.slot_state = JSON.stringify(updates.slot_state);
  }
  if (supabase) {
    try {
      await supabase.from('sessions').update(dbUpdates).eq('id', id);
    } catch (_) {}
  }
  const fields = Object.keys(dbUpdates)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(dbUpdates);
  sqliteDb.prepare(`UPDATE sessions SET ${fields} WHERE id = ?`).run(...values, id);
}

export async function updateSessionTitle(id: string, title: string): Promise<void> {
  await updateSession(id, { title });
}

export async function updateSessionStatus(id: string, status: 'diagnosing' | 'learning'): Promise<void> {
  await updateSession(id, { status });
}

export async function updateSessionCalibration(id: string, calibration: Calibration): Promise<void> {
  await updateSession(id, { calibration });
}

export async function updateSessionSlotState(id: string, slotState: any): Promise<void> {
  await updateSession(id, { slot_state: slotState });
}

export async function claimSessionForUser(sessionId: string, userId: string): Promise<void> {
  await updateSession(sessionId, { user_id: userId });
}

export async function getSessions(userId?: string): Promise<Session[]> {
  let sqliteRows: any[];
  if (userId) {
    sqliteRows = sqliteDb.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  } else {
    sqliteRows = sqliteDb.prepare('SELECT * FROM sessions ORDER BY created_at DESC').all();
  }
  const sqliteSessions = sqliteRows.map((row: any) => ({
    ...row,
    calibration: typeof row.calibration === 'string' ? JSON.parse(row.calibration) : row.calibration,
    slot_state: row.slot_state ? (typeof row.slot_state === 'string' ? JSON.parse(row.slot_state) : row.slot_state) : undefined,
  }));

  if (supabase) {
    try {
      let query = supabase.from('sessions').select('*');
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const supabaseSessions = data.map((row: any) => ({
          ...row,
          calibration: typeof row.calibration === 'string' ? JSON.parse(row.calibration) : row.calibration,
          slot_state: row.slot_state ? (typeof row.slot_state === 'string' ? JSON.parse(row.slot_state) : row.slot_state) : undefined,
        }));

        const sessionMap = new Map<string, Session>();
        for (const s of sqliteSessions) {
          sessionMap.set(s.id, s);
        }
        for (const s of supabaseSessions) {
          sessionMap.set(s.id, s);
        }
        return Array.from(sessionMap.values()).sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      }
    } catch (_) {}
  }

  return sqliteSessions;
}

export async function getAllSessionsWithNodes(): Promise<{ session: Session; nodes: CurriculumNode[] }[]> {
  const sessions = await getSessions();
  const results: { session: Session; nodes: CurriculumNode[] }[] = [];
  for (const session of sessions) {
    const nodes = await getNodes(session.id);
    results.push({ session, nodes });
  }
  return results;
}

export async function saveNodes(sessionId: string, nodes: Omit<CurriculumNode, 'created_at'>[]): Promise<void> {
  if (supabase) {
    try {
      const rows = nodes.map((node) => ({
        id: node.id,
        session_id: sessionId,
        title: node.title,
        description: node.description,
        x: node.x,
        y: node.y,
        dependencies: JSON.stringify(node.dependencies),
        status: node.status,
        order_index: node.order_index,
      }));
      await supabase.from('nodes').upsert(rows);
    } catch (_) {}
  }

  const stmt = sqliteDb.prepare(`
    INSERT INTO nodes (id, session_id, title, description, x, y, dependencies, edges, status, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id, session_id) DO UPDATE SET
      title=excluded.title,
      description=excluded.description,
      x=excluded.x,
      y=excluded.y,
      dependencies=excluded.dependencies,
      edges=excluded.edges,
      status=excluded.status,
      order_index=excluded.order_index
  `);
  const transaction = sqliteDb.transaction((nodesToSave: any[]) => {
    for (const node of nodesToSave) {
      stmt.run(
        node.id,
        sessionId,
        node.title,
        node.description,
        node.x,
        node.y,
        JSON.stringify(node.dependencies || []),
        JSON.stringify(node.edges || []),
        node.status,
        node.order_index
      );
    }
  });
  transaction(nodes);
}

export async function createNodes(sessionIdOrNodes: any, nodesParam?: any): Promise<void> {
  const sessionId = typeof sessionIdOrNodes === 'string' ? sessionIdOrNodes : (Array.isArray(sessionIdOrNodes) && sessionIdOrNodes[0]?.session_id) || 'session_legacy';
  const nodes = Array.isArray(sessionIdOrNodes) ? sessionIdOrNodes : nodesParam || [];
  await saveNodes(sessionId, nodes);
}

export async function getNodes(sessionId: string): Promise<CurriculumNode[]> {
  const sqliteRows = sqliteDb
    .prepare('SELECT * FROM nodes WHERE session_id = ? ORDER BY order_index ASC')
    .all(sessionId);
  const sqliteNodes = sqliteRows.map((row: any) => ({
    ...row,
    dependencies: typeof row.dependencies === 'string' ? JSON.parse(row.dependencies) : row.dependencies,
    edges: typeof row.edges === 'string' ? JSON.parse(row.edges) : row.edges || [],
  }));

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_index', { ascending: true });
      if (!error && data && data.length > 0) {
        const supabaseNodes = data.map((row: any) => ({
          ...row,
          dependencies: typeof row.dependencies === 'string' ? JSON.parse(row.dependencies) : row.dependencies,
        }));
        const nodeMap = new Map<string, CurriculumNode>();
        for (const n of sqliteNodes) {
          nodeMap.set(n.id, n);
        }
        for (const n of supabaseNodes) {
          nodeMap.set(n.id, n);
        }
        return Array.from(nodeMap.values()).sort((a, b) => a.order_index - b.order_index);
      }
    } catch (_) {}
  }
  return sqliteNodes;
}

export async function updateNodeStatus(sessionId: string, nodeId: string, status: string): Promise<void> {
  if (supabase) {
    try {
      await supabase
        .from('nodes')
        .update({ status })
        .eq('session_id', sessionId)
        .eq('id', nodeId);
    } catch (_) {}
  }
  sqliteDb
    .prepare('UPDATE nodes SET status = ? WHERE session_id = ? AND id = ?')
    .run(status, sessionId, nodeId);
}

export async function createMessage(
  sessionId: string,
  nodeId: string | null,
  sender: 'user' | 'assistant' | 'system',
  content: string
): Promise<Message> {
  if (nodeId) {
    try {
      await updateNodeStatus(sessionId, nodeId, 'in_progress');
    } catch (_) {}
  }
  if (supabase) {
    try {
      await supabase.from('messages').insert({
        session_id: sessionId,
        node_id: nodeId,
        sender,
        content,
      });
    } catch (_) {}
  }
  const info = sqliteDb
    .prepare('INSERT INTO messages (session_id, node_id, sender, content) VALUES (?, ?, ?, ?)')
    .run(sessionId, nodeId, sender, content);
  return {
    id: info.lastInsertRowid,
    session_id: sessionId,
    node_id: nodeId,
    sender,
    content,
    created_at: new Date().toISOString(),
  };
}

export async function getMessages(sessionId: string, nodeId?: string | null): Promise<Message[]> {
  let sql = 'SELECT * FROM messages WHERE session_id = ?';
  const params: any[] = [sessionId];
  if (nodeId !== undefined) {
    if (nodeId === null) {
      sql += ' AND node_id IS NULL';
    } else {
      sql += ' AND node_id = ?';
      params.push(nodeId);
    }
  }
  sql += ' ORDER BY created_at ASC';
  const sqliteMsgs = sqliteDb.prepare(sql).all(...params);

  if (supabase) {
    try {
      let query = supabase.from('messages').select('*').eq('session_id', sessionId);
      if (nodeId !== undefined) {
        if (nodeId === null) {
          query = query.is('node_id', null);
        } else {
          query = query.eq('node_id', nodeId);
        }
      }
      const { data, error } = await query.order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        const msgMap = new Map<string, Message>();
        for (const m of sqliteMsgs) {
          msgMap.set(`${m.sender}_${m.content}_${m.created_at}`, m);
        }
        for (const m of data) {
          msgMap.set(`${m.sender}_${m.content}_${m.created_at}`, m);
        }
        return Array.from(msgMap.values()).sort(
          (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
      }
    } catch (_) {}
  }
  return sqliteMsgs;
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (supabase) {
    try {
      await supabase.from('sessions').delete().eq('id', sessionId);
    } catch (_) {}
  }
  sqliteDb.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId);
  sqliteDb.prepare('DELETE FROM nodes WHERE session_id = ?').run(sessionId);
  sqliteDb.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

export async function renameSession(sessionId: string, newTitle: string): Promise<void> {
  if (supabase) {
    try {
      await supabase.from('sessions').update({ title: newTitle }).eq('id', sessionId);
    } catch (_) {}
  }
  sqliteDb.prepare('UPDATE sessions SET title = ? WHERE id = ?').run(newTitle, sessionId);
}

export async function toggleStarNode(sessionId: string, nodeId: string, isStarred: boolean): Promise<void> {
  const val = isStarred ? 1 : 0;
  if (supabase) {
    try {
      await supabase.from('nodes').update({ is_starred: val }).eq('id', nodeId);
    } catch (_) {}
  }
  try {
    const sessExist = sqliteDb.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId);
    if (!sessExist) {
      const cal = JSON.stringify({ level: 'beginner', known_concepts: [], weak_points: [] });
      sqliteDb.prepare('INSERT OR IGNORE INTO sessions (id, title, intent, status, calibration) VALUES (?, ?, ?, ?, ?)').run(sessionId, 'Learning Session', 'learning', 'learning', cal);
    }

    const existing = sqliteDb.prepare('SELECT id FROM nodes WHERE id = ? AND session_id = ?').get(nodeId, sessionId);
    if (existing) {
      sqliteDb.prepare('UPDATE nodes SET is_starred = ? WHERE id = ? AND session_id = ?').run(val, nodeId, sessionId);
    } else {
      sqliteDb.prepare('INSERT OR REPLACE INTO nodes (id, session_id, title, is_starred, order_index) VALUES (?, ?, ?, ?, ?)').run(nodeId, sessionId, 'History Node', val, 0);
    }
  } catch (e: any) {
    console.warn('[Database] Error starring in SQLite:', e.message);
  }
}

export async function resetNodeChat(sessionId: string, nodeId: string): Promise<void> {
  if (supabase) {
    try {
      await supabase.from('messages').delete().eq('session_id', sessionId).eq('node_id', nodeId);
      await supabase.from('nodes').update({ status: 'available' }).eq('session_id', sessionId).eq('id', nodeId);
    } catch (_) {}
  }
  sqliteDb.prepare('DELETE FROM messages WHERE session_id = ? AND node_id = ?').run(sessionId, nodeId);
  sqliteDb.prepare('UPDATE nodes SET status = ? WHERE session_id = ? AND id = ?').run('available', sessionId, nodeId);
}

export async function saveAgentLog(log: AgentLog): Promise<void> {
  if (supabase) {
    try {
      await supabase.from('agent_logs').insert({
        log_id: log.logId,
        agent_name: log.agentName,
        learner_id: log.learnerId,
        timestamp: log.timestamp,
        input: JSON.stringify(log.input),
        output: JSON.stringify(log.output),
        reasoning: log.reasoning,
        validation_passed: log.validationPassed ? 1 : 0,
        retry_count: log.retryCount,
      });
    } catch (_) {}
  }
  try {
    sqliteDb
      .prepare(`
        INSERT OR REPLACE INTO agent_logs (log_id, agent_name, learner_id, timestamp, input, output, reasoning, validation_passed, retry_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        log.logId,
        log.agentName,
        log.learnerId,
        log.timestamp,
        JSON.stringify(log.input),
        JSON.stringify(log.output),
        log.reasoning || null,
        log.validationPassed ? 1 : 0,
        log.retryCount
      );
  } catch (err: any) {
    console.warn('[Database] Failed writing AgentLog to SQLite:', err.message);
  }
}

export async function getAgentLogs(learnerId?: string): Promise<AgentLog[]> {
  if (supabase) {
    try {
      let query = supabase.from('agent_logs').select('*');
      if (learnerId) query = query.eq('learner_id', learnerId);
      const { data, error } = await query.order('timestamp', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          logId: row.log_id,
          agentName: row.agent_name,
          learnerId: row.learner_id,
          timestamp: row.timestamp,
          input: typeof row.input === 'string' ? JSON.parse(row.input) : row.input,
          output: typeof row.output === 'string' ? JSON.parse(row.output) : row.output,
          reasoning: row.reasoning,
          validationPassed: row.validation_passed === 1,
          retryCount: row.retry_count,
        }));
      }
    } catch (_) {}
  }

  let sql = 'SELECT * FROM agent_logs';
  const params: any[] = [];
  if (learnerId) {
    sql += ' WHERE learner_id = ?';
    params.push(learnerId);
  }
  sql += ' ORDER BY timestamp ASC';
  const rows = sqliteDb.prepare(sql).all(...params);
  return rows.map((row: any) => ({
    logId: row.log_id,
    agentName: row.agent_name,
    learnerId: row.learner_id,
    timestamp: row.timestamp,
    input: JSON.parse(row.input),
    output: JSON.parse(row.output),
    reasoning: row.reasoning,
    validationPassed: row.validation_passed === 1,
    retryCount: row.retry_count,
  }));
}

// --- Session Artifacts & Vector Embeddings Helpers ---
export async function saveSessionArtifact(
  sessionId: string,
  id: string,
  filename: string,
  content: string,
  structuredMetadata: any
): Promise<void> {
  const metaJson = JSON.stringify(structuredMetadata || {});
  if (supabase) {
    try {
      await supabase.from('session_artifacts').upsert({
        id,
        session_id: sessionId,
        filename,
        content,
        structured_metadata: metaJson,
      });
    } catch (_) {}
  }
  sqliteDb
    .prepare(
      'INSERT OR REPLACE INTO session_artifacts (id, session_id, filename, content, structured_metadata) VALUES (?, ?, ?, ?, ?)'
    )
    .run(id, sessionId, filename, content, metaJson);
}

export async function getSessionArtifacts(sessionId: string): Promise<any[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('session_artifacts')
        .select('*')
        .eq('session_id', sessionId);
      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          ...r,
          structured_metadata: typeof r.structured_metadata === 'string' ? JSON.parse(r.structured_metadata) : r.structured_metadata || {},
        }));
      }
    } catch (_) {}
  }
  const rows = sqliteDb.prepare('SELECT * FROM session_artifacts WHERE session_id = ?').all(sessionId);
  return rows.map((r: any) => ({
    ...r,
    structured_metadata: r.structured_metadata ? JSON.parse(r.structured_metadata) : {},
  }));
}

export async function saveVectorEmbedding(
  sessionId: string,
  artifactId: string,
  chunkIndex: number,
  chunkText: string,
  embedding: number[] = []
): Promise<void> {
  const embedJson = JSON.stringify(embedding || []);
  if (supabase) {
    try {
      await supabase.from('vector_embeddings').insert({
        session_id: sessionId,
        artifact_id: artifactId,
        chunk_index: chunkIndex,
        chunk_text: chunkText,
        embedding: embedJson,
      });
    } catch (_) {}
  }
  sqliteDb
    .prepare(
      'INSERT INTO vector_embeddings (session_id, artifact_id, chunk_index, chunk_text, embedding) VALUES (?, ?, ?, ?, ?)'
    )
    .run(sessionId, artifactId, chunkIndex, chunkText, embedJson);
}

export async function getVectorEmbeddings(sessionId: string): Promise<any[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('vector_embeddings')
        .select('*')
        .eq('session_id', sessionId);
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (_) {}
  }
  return sqliteDb.prepare('SELECT * FROM vector_embeddings WHERE session_id = ?').all(sessionId);
}

// --- Task Simulations & Evidence Helpers ---
export async function saveTaskSimulation(
  id: string,
  sessionId: string,
  nodeId: string,
  taskType: string,
  promptSpec: any,
  starterCode?: string,
  solutionRubric?: string
): Promise<void> {
  const specJson = JSON.stringify(promptSpec || {});
  if (supabase) {
    try {
      await supabase.from('task_simulations').upsert({
        id,
        session_id: sessionId,
        node_id: nodeId,
        task_type: taskType,
        prompt_spec: specJson,
        starter_code: starterCode || '',
        solution_rubric: solutionRubric || '',
      });
    } catch (_) {}
  }
  sqliteDb
    .prepare(
      'INSERT OR REPLACE INTO task_simulations (id, session_id, node_id, task_type, prompt_spec, starter_code, solution_rubric) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(id, sessionId, nodeId, taskType, specJson, starterCode || '', solutionRubric || '');
}

export async function getTaskSimulation(sessionId: string, nodeId: string): Promise<any | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('task_simulations')
        .select('*')
        .eq('session_id', sessionId)
        .eq('node_id', nodeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        return {
          ...data,
          prompt_spec: typeof data.prompt_spec === 'string' ? JSON.parse(data.prompt_spec) : data.prompt_spec,
        };
      }
    } catch (_) {}
  }
  const row = sqliteDb
    .prepare('SELECT * FROM task_simulations WHERE session_id = ? AND node_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(sessionId, nodeId);
  if (!row) return null;
  return {
    ...row,
    prompt_spec: JSON.parse(row.prompt_spec),
  };
}

export async function saveEvidenceScore(
  sessionId: string,
  nodeId: string,
  masteryProbability: number,
  signals: any,
  advisoryBadge: string
): Promise<void> {
  const id = `ev_${sessionId}_${nodeId}`;
  const signalsJson = JSON.stringify(signals || {});
  if (supabase) {
    try {
      await supabase.from('evidence_scores').upsert({
        id,
        session_id: sessionId,
        node_id: nodeId,
        mastery_probability: masteryProbability,
        signals: signalsJson,
        advisory_badge: advisoryBadge,
      });
    } catch (_) {}
  }
  sqliteDb
    .prepare(
      'INSERT OR REPLACE INTO evidence_scores (id, session_id, node_id, mastery_probability, signals, advisory_badge) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(id, sessionId, nodeId, masteryProbability, signalsJson, advisoryBadge);
}

export async function getEvidenceScores(sessionId: string): Promise<Record<string, any>> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('evidence_scores')
        .select('*')
        .eq('session_id', sessionId);
      if (!error && data && data.length > 0) {
        const res: Record<string, any> = {};
        for (const r of data) {
          res[r.node_id] = {
            masteryProbability: r.mastery_probability,
            signals: typeof r.signals === 'string' ? JSON.parse(r.signals) : r.signals,
            advisoryBadge: r.advisory_badge,
          };
        }
        return res;
      }
    } catch (_) {}
  }
  const rows = sqliteDb.prepare('SELECT * FROM evidence_scores WHERE session_id = ?').all(sessionId);
  const result: Record<string, any> = {};
  for (const r of rows) {
    result[r.node_id] = {
      masteryProbability: r.mastery_probability,
      signals: JSON.parse(r.signals),
      advisoryBadge: r.advisory_badge,
    };
  }
  return result;
}
