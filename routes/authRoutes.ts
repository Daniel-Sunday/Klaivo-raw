import { Router, Request, Response } from 'express';
import * as db from '../database';

export const authRouter = Router();

export async function getAuthUser(req: Request): Promise<any | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const supabase = db.getSupabase();
  if (!supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (_) {
    return null;
  }
}

/**
 * POST /api/auth/signup: User Registration via Supabase Auth
 */
authRouter.post('/signup', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const supabase = db.getSupabase();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase Auth is not configured on server' });
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || email.split('@')[0],
        },
      },
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    const user = data.user ? {
      id: data.user.id,
      email: data.user.email,
      display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
      avatar_url: data.user.user_metadata?.avatar_url,
    } : null;
    return res.json({
      user,
      token: data.session?.access_token || null,
      session: data.session,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

/**
 * POST /api/auth/login: User Authentication via Supabase Auth
 */
authRouter.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const supabase = db.getSupabase();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase Auth is not configured on server' });
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    const user = data.user ? {
      id: data.user.id,
      email: data.user.email,
      display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
      avatar_url: data.user.user_metadata?.avatar_url,
    } : null;
    return res.json({
      user,
      token: data.session?.access_token || null,
      session: data.session,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

/**
 * GET /api/auth/me: Current User Profile
 */
authRouter.get('/me', async (req: Request, res: Response): Promise<any> => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
    },
  });
});
