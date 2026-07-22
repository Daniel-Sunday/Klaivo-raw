import { createClient, SupabaseClient } from '@supabase/supabase-js';
import DatabaseConstructor from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';
import { Session, CurriculumNode, Message, Calibration } from './types';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use Supabase if valid credentials are provided (and not placeholder text)
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseServiceRoleKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseServiceRoleKey.includes('your-supabase-service-role-key');

let supabase: SupabaseClient | null = null;
let sqliteDb: any = null;

if (isSupabaseConfigured) {
  // Service role key bypasses Row Level Security for backend server access
  supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);
  console.log('[Database] Using Supabase Postgres backend.');
} else {
  console.log('[Database] Supabase credentials not configured or placeholder detected. Using SQLite fallback.');
  const projectRoot = fs.existsSync(path.join(__dirname, 'public'))
    ? __dirname
    : path.join(__dirname, '..');
  const dbPath = path.join(projectRoot, 'klaivo.db');
  sqliteDb = new DatabaseConstructor(dbPath, { verbose: console.log });
  sqliteDb.pragma('foreign_keys = ON');
}

export async function initDb(): Promise<void> {
  if (supabase) {
    // Ping Supabase to verify connectivity
    const { error } = await supabase.from('sessions').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('[Database] Note on Supabase sessions table query:', error.message);
    } else {
      console.log('[Database] Supabase connection established.');
    }
  } else {
    // Create local SQLite tables
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        intent TEXT,
        status TEXT NOT NULL DEFAULT 'diagnosing',
        calibration TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, session_id),
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `);
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
    console.log('[Database] SQLite tables initialized.');

    // Preload default learning sessions & history if database is empty
    const count = sqliteDb.prepare('SELECT COUNT(*) as cnt FROM sessions').get() as { cnt: number };
    if (count.cnt === 0) {
      const seed1 = 'seed-waec-chem';
      const seed2 = 'seed-calculus';
      const seed3 = 'seed-python';

      const cal = JSON.stringify({ level: 'beginner', known_concepts: [], weak_points: [] });
      sqliteDb.prepare('INSERT INTO sessions (id, title, intent, status, calibration) VALUES (?, ?, ?, ?, ?)').run(seed1, 'Prepare me for WAEC Chemistry — Organic Chemistry section', 'learning', 'learning', cal);
      sqliteDb.prepare('INSERT INTO sessions (id, title, intent, status, calibration) VALUES (?, ?, ?, ?, ?)').run(seed2, 'Help me understand Calculus — differentiation and integration', 'learning', 'learning', cal);
      sqliteDb.prepare('INSERT INTO sessions (id, title, intent, status, calibration) VALUES (?, ?, ?, ?, ?)').run(seed3, 'Teach me Python programming from scratch', 'learning', 'learning', cal);

      sqliteDb.prepare('INSERT INTO nodes (id, session_id, title, description, x, y, dependencies, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run('node-1', seed1, 'Intro & Hybridization', 'Carbon hybridization and orbital geometry', 100, 100, '[]', 'completed', 0);
      sqliteDb.prepare('INSERT INTO nodes (id, session_id, title, description, x, y, dependencies, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run('node-2', seed1, 'IUPAC Nomenclature', 'Naming alkanes, alkenes, and functional groups', 250, 100, '["node-1"]', 'active', 1);

      sqliteDb.prepare('INSERT INTO nodes (id, session_id, title, description, x, y, dependencies, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run('node-3', seed2, 'Derivatives & Limits', 'Fundamental rate of change', 100, 100, '[]', 'completed', 0);
      sqliteDb.prepare('INSERT INTO nodes (id, session_id, title, description, x, y, dependencies, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run('node-4', seed2, 'Integration Techniques', 'Definite and indefinite integrals', 250, 100, '["node-3"]', 'active', 1);

      sqliteDb.prepare('INSERT INTO nodes (id, session_id, title, description, x, y, dependencies, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run('node-5', seed3, 'Python Basics & Control Flow', 'Variables, loops, and conditions', 100, 100, '[]', 'completed', 0);

      console.log('[Database] Preloaded initial learning sessions and history.');
    }
  }
}

// --- DB Helpers ---

export async function createSession(
  id: string,
  title: string,
  intent: string,
  calibration: Calibration = { level: 'beginner', known_concepts: [], weak_points: [] }
): Promise<Session> {
  if (supabase) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        id,
        title,
        intent,
        status: 'diagnosing',
        calibration
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`[Supabase] Error creating session: ${error.message}`);
    }
    return data as Session;
  } else {
    const stmt = sqliteDb.prepare(`
      INSERT INTO sessions (id, title, intent, status, calibration)
      VALUES (?, ?, ?, 'diagnosing', ?)
    `);
    stmt.run(id, title, intent, JSON.stringify(calibration));
    const session = await getSession(id);
    if (!session) {
      throw new Error(`Failed to create session with id: ${id}`);
    }
    return session;
  }
}

export async function getSession(id: string): Promise<Session | undefined> {
  if (supabase) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return data as Session;
  } else {
    const session = sqliteDb.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as any;
    if (session) {
      session.calibration = typeof session.calibration === 'string'
        ? JSON.parse(session.calibration)
        : session.calibration;
    }
    return session as Session | undefined;
  }
}

export async function getAllSessionsWithNodes(): Promise<(Session & { nodes: CurriculumNode[] })[]> {
  if (supabase) {
    const { data: sessionsData, error: sErr } = await supabase
      .from('sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (sErr || !sessionsData) return [];

    const result: (Session & { nodes: CurriculumNode[] })[] = [];
    for (const session of sessionsData) {
      const { data: nodesData } = await supabase
        .from('nodes')
        .select('*')
        .eq('session_id', session.id)
        .order('order_index', { ascending: true });

      result.push({
        ...(session as Session),
        nodes: (nodesData || []) as CurriculumNode[]
      });
    }
    return result;
  } else {
    const rawSessions = sqliteDb.prepare('SELECT * FROM sessions ORDER BY updated_at DESC').all() as any[];
    const result: (Session & { nodes: CurriculumNode[] })[] = [];
    for (const session of rawSessions) {
      session.calibration = typeof session.calibration === 'string'
        ? JSON.parse(session.calibration)
        : session.calibration;
      const nodes = await getNodes(session.id);
      result.push({
        ...session,
        nodes
      });
    }
    return result;
  }
}

export async function updateSessionStatus(id: string, status: 'diagnosing' | 'learning'): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from('sessions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`[Supabase] Error updating status: ${error.message}`);
  } else {
    const stmt = sqliteDb.prepare('UPDATE sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, id);
  }
}

export async function updateSessionCalibration(id: string, calibration: Calibration): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from('sessions')
      .update({ calibration, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`[Supabase] Error updating calibration: ${error.message}`);
  } else {
    const stmt = sqliteDb.prepare('UPDATE sessions SET calibration = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(JSON.stringify(calibration), id);
  }
}

export async function createMessage(
  sessionId: string,
  nodeId: string | null,
  sender: 'user' | 'assistant' | 'system',
  content: string
): Promise<Message> {
  if (supabase) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        node_id: nodeId,
        sender,
        content
      })
      .select('*')
      .single();

    if (error) throw new Error(`[Supabase] Error creating message: ${error.message}`);
    return data as Message;
  } else {
    const stmt = sqliteDb.prepare(`
      INSERT INTO messages (session_id, node_id, sender, content)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(sessionId, nodeId, sender, content);
    return { id: Number(result.lastInsertRowid), session_id: sessionId, node_id: nodeId, sender, content };
  }
}

export async function getMessages(sessionId: string, nodeId: string | null = null): Promise<Message[]> {
  if (supabase) {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (nodeId) {
      query = query.eq('node_id', nodeId);
    } else {
      query = query.is('node_id', null);
    }

    const { data, error } = await query;
    if (error) throw new Error(`[Supabase] Error fetching messages: ${error.message}`);
    return data as Message[];
  } else {
    if (nodeId) {
      return sqliteDb.prepare('SELECT * FROM messages WHERE session_id = ? AND node_id = ? ORDER BY created_at ASC').all(sessionId, nodeId) as Message[];
    } else {
      return sqliteDb.prepare('SELECT * FROM messages WHERE session_id = ? AND node_id IS NULL ORDER BY created_at ASC').all(sessionId) as Message[];
    }
  }
}

export async function createNodes(nodesList: CurriculumNode[]): Promise<void> {
  if (supabase) {
    const formattedNodes = nodesList.map(n => ({
      id: n.id,
      session_id: n.session_id,
      title: n.title,
      description: n.description || '',
      x: n.x,
      y: n.y,
      dependencies: n.dependencies || [],
      status: n.status || 'locked',
      order_index: n.order_index
    }));

    const { error } = await supabase
      .from('nodes')
      .insert(formattedNodes);

    if (error) throw new Error(`[Supabase] Error creating nodes: ${error.message}`);
  } else {
    const insert = sqliteDb.prepare(`
      INSERT INTO nodes (id, session_id, title, description, x, y, dependencies, status, order_index)
      VALUES (@id, @session_id, @title, @description, @x, @y, @dependencies, @status, @order_index)
    `);

    const insertMany = sqliteDb.transaction((list: CurriculumNode[]) => {
      for (const node of list) {
        insert.run({
          id: node.id,
          session_id: node.session_id,
          title: node.title,
          description: node.description || '',
          x: node.x,
          y: node.y,
          dependencies: JSON.stringify(node.dependencies || []),
          status: node.status || 'locked',
          order_index: node.order_index
        });
      }
    });

    insertMany(nodesList);
  }
}

export async function getNodes(sessionId: string): Promise<CurriculumNode[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('session_id', sessionId)
      .order('order_index', { ascending: true });

    if (error) throw new Error(`[Supabase] Error fetching nodes: ${error.message}`);
    return data as CurriculumNode[];
  } else {
    const list = sqliteDb.prepare('SELECT * FROM nodes WHERE session_id = ? ORDER BY order_index ASC').all(sessionId) as any[];
    return list.map(node => {
      node.dependencies = typeof node.dependencies === 'string'
        ? JSON.parse(node.dependencies)
        : node.dependencies;
      return node as CurriculumNode;
    });
  }
}

export async function updateNodeStatus(
  sessionId: string,
  nodeId: string,
  status: 'locked' | 'available' | 'completed' | 'active'
): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from('nodes')
      .update({ status })
      .eq('session_id', sessionId)
      .eq('id', nodeId);

    if (error) throw new Error(`[Supabase] Error updating node status: ${error.message}`);
  } else {
    const stmt = sqliteDb.prepare('UPDATE nodes SET status = ? WHERE session_id = ? AND id = ?');
    stmt.run(status, sessionId, nodeId);
  }
}
