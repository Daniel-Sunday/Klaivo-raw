/**
 * Session Titler Utility
 * Generates concise, professional, title-cased session titles for learning sessions.
 */

export function formatTitleCase(str: string): string {
  if (!str) return 'Learning Session';

  const minorWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'en', 'for', 'from', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'v', 'via', 'with'
  ]);

  const words = str.trim().split(/\s+/);
  const formatted = words.map((word, idx) => {
    const lower = word.toLowerCase();

    // Preserve acronyms like LLM, AWS, WAEC, SAT, GRE, MCAT, Rust, AI
    if (word.length > 1 && word === word.toUpperCase() && !/[a-z]/.test(word)) {
      return word;
    }

    if (idx > 0 && idx < words.length - 1 && minorWords.has(lower)) {
      return lower;
    }

    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });

  return formatted.join(' ');
}

export function generateSessionTitle(
  rawPrompt: string,
  targetSubject?: string,
  goalSummary?: string
): string {
  // 1. Prefer targetSubject if available
  if (targetSubject && targetSubject.trim().length > 0) {
    let cleanSubj = targetSubject.trim();
    if (!cleanSubj.toLowerCase().startsWith('build') && !cleanSubj.toLowerCase().startsWith('learn') && !cleanSubj.toLowerCase().startsWith('master')) {
      if (rawPrompt.toLowerCase().includes('build')) {
        cleanSubj = `Building ${cleanSubj}`;
      } else if (rawPrompt.toLowerCase().includes('exam') || rawPrompt.toLowerCase().includes('prep') || rawPrompt.toLowerCase().includes('waec') || rawPrompt.toLowerCase().includes('aws')) {
        if (!cleanSubj.toLowerCase().includes('prep') && !cleanSubj.toLowerCase().includes('exam')) {
          cleanSubj = `${cleanSubj} Prep`;
        }
      }
    }
    return formatTitleCase(cleanSubj);
  }

  // 2. Prefer goalSummary if available
  if (goalSummary && goalSummary.trim().length > 0) {
    const cleanGoal = goalSummary
      .replace(/^master\s+/i, '')
      .replace(/^learn\s+/i, '')
      .replace(/^understand\s+/i, '')
      .split('.')[0];
    return formatTitleCase(cleanGoal.slice(0, 50));
  }

  // 3. Fallback to cleaning raw prompt
  if (!rawPrompt || rawPrompt.trim().length === 0) {
    return 'Learning Session';
  }

  let cleaned = rawPrompt
    .trim()
    .replace(/^(i\s+want\s+to\s+learn\s+how\s+to\s+)/i, '')
    .replace(/^(i\s+want\s+to\s+learn\s+)/i, '')
    .replace(/^(help\s+me\s+understand\s+)/i, '')
    .replace(/^(teach\s+me\s+)/i, '')
    .replace(/^(prepare\s+me\s+for\s+)/i, '')
    .replace(/^(i\s+want\s+to\s+master\s+)/i, '');

  const words = cleaned.split(/\s+/);
  if (words.length > 6) {
    cleaned = words.slice(0, 6).join(' ');
  }

  return formatTitleCase(cleaned);
}
