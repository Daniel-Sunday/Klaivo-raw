import DatabaseConstructor from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { Session, CurriculumNode, Message, Calibration } from './types';

// Initialize database connection
const projectRoot = fs.existsSync(path.join(__dirname, 'public'))
  ? __dirname
  : path.join(__dirname, '..');
const dbPath = path.join(projectRoot, 'klaivo.db');
const db = new DatabaseConstructor(dbPath, { verbose: console.log });

// Enable foreign key support
db.pragma('foreign_keys = ON');

// Initialize Tables
export function initDb(): void {
  // Create sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      intent TEXT,
      status TEXT NOT NULL DEFAULT 'diagnosing',
      calibration TEXT NOT NULL, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create nodes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      x REAL,
      y REAL,
      dependencies TEXT NOT NULL DEFAULT '[]', -- JSON array of parent node IDs
      status TEXT NOT NULL DEFAULT 'locked', -- locked, available, completed
      order_index INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id, session_id),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);

  // Create messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      node_id TEXT, -- NULL for diagnostic chat, not null for node chats
      sender TEXT NOT NULL, -- user, assistant, system
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables initialized.');
}

// --- DB Helpers ---

export function createSession(
  id: string,
  title: string,
  intent: string,
  calibration: Calibration = { level: 'beginner', known_concepts: [], weak_points: [] }
): Session {
  const stmt = db.prepare(`
    INSERT INTO sessions (id, title, intent, status, calibration)
    VALUES (?, ?, ?, 'diagnosing', ?)
  `);
  stmt.run(id, title, intent, JSON.stringify(calibration));
  const session = getSession(id);
  if (!session) {
    throw new Error(`Failed to create session with id: ${id}`);
  }
  return session;
}

export function getSession(id: string): Session | undefined {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as any;
  if (session) {
    session.calibration = JSON.parse(session.calibration);
  }
  return session;
}

export function updateSessionStatus(id: string, status: 'diagnosing' | 'learning'): void {
  const stmt = db.prepare('UPDATE sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(status, id);
}

export function updateSessionCalibration(id: string, calibration: Calibration): void {
  const stmt = db.prepare('UPDATE sessions SET calibration = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(JSON.stringify(calibration), id);
}

export function createMessage(
  sessionId: string,
  nodeId: string | null,
  sender: 'user' | 'assistant' | 'system',
  content: string
): Message {
  const stmt = db.prepare(`
    INSERT INTO messages (session_id, node_id, sender, content)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(sessionId, nodeId, sender, content);
  return { id: Number(result.lastInsertRowid), session_id: sessionId, node_id: nodeId, sender, content };
}

export function getMessages(sessionId: string, nodeId: string | null = null): Message[] {
  if (nodeId) {
    return db.prepare('SELECT * FROM messages WHERE session_id = ? AND node_id = ? ORDER BY created_at ASC').all(sessionId, nodeId) as Message[];
  } else {
    return db.prepare('SELECT * FROM messages WHERE session_id = ? AND node_id IS NULL ORDER BY created_at ASC').all(sessionId) as Message[];
  }
}

export function createNodes(nodesList: CurriculumNode[]): void {
  const insert = db.prepare(`
    INSERT INTO nodes (id, session_id, title, description, x, y, dependencies, status, order_index)
    VALUES (@id, @session_id, @title, @description, @x, @y, @dependencies, @status, @order_index)
  `);

  const insertMany = db.transaction((list: CurriculumNode[]) => {
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

export function getNodes(sessionId: string): CurriculumNode[] {
  const list = db.prepare('SELECT * FROM nodes WHERE session_id = ? ORDER BY order_index ASC').all(sessionId) as any[];
  return list.map(node => {
    node.dependencies = JSON.parse(node.dependencies);
    return node as CurriculumNode;
  });
}

export function updateNodeStatus(
  sessionId: string,
  nodeId: string,
  status: 'locked' | 'available' | 'completed' | 'active'
): void {
  const stmt = db.prepare('UPDATE nodes SET status = ? WHERE session_id = ? AND id = ?');
  stmt.run(status, sessionId, nodeId);
}

export { db };
