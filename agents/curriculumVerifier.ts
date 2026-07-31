import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import { TreeSkeletonSchema, TreeSkeleton } from '../schemas';

export interface CurriculumVerifierInput {
  skeleton: TreeSkeleton;
  referenceSourceText?: string;
}

export async function runCurriculumVerifier(
  input: CurriculumVerifierInput,
  mockOutput?: Partial<TreeSkeleton>,
  signal?: AbortSignal
): Promise<AgentResult<TreeSkeleton>> {
  const systemInstruction = `You are fact-checking a proposed curriculum against how this subject is actually taught by real institutions, textbooks, or established learning paths — not rubber-stamping it.

Examine the proposed curriculum against established learning paths, university syllabi, or recognized certification body structures for this specific domain and objective combination.

BANNED BEHAVIOR:
- Do not approve a tree just because it looks plausible. Actively look for: wrong prerequisite ordering, missing foundational concepts a real course would never skip, or concepts included that don't actually belong at this learner's stated level.
- If you find no canonical reference exists for this specific domain (common for niche or informal skills), say so plainly in verificationNotes — this is not a failure, do not invent a fake citation to fill the gap.

Output the same TreeSkeleton with verificationStatus updated to "verified" or "verified_with_gaps", and verificationNotes listing anything specific you found — not a generic "looks good."`;

  const userPrompt = `Goal Summary: "${input.skeleton.goalSummary}"
Tree Version: ${input.skeleton.version}
Nodes to Verify: ${JSON.stringify(input.skeleton.nodes.map((n) => ({ id: n.id, title: n.title, prereqs: n.prerequisiteIds })))}
Reference Text / Standard Context: ${input.referenceSourceText || 'Standard domain reference check'}`;

  return await executeAgent<CurriculumVerifierInput, TreeSkeleton>({
    agentName: 'CurriculumVerifier',
    learnerId: input.skeleton.learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: TreeSkeletonSchema,
    temperature: 0.2,
    signal,
    mockFn: mockOutput
      ? () => ({
          ...input.skeleton,
          verificationStatus: mockOutput.verificationStatus || "verified",
          verificationNotes: mockOutput.verificationNotes || ["Verified against standard curriculum structure."],
        })
      : undefined,
  });
}
