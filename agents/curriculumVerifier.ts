import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import { TreeSkeletonSchema, TreeSkeleton } from '../schemas';

export interface CurriculumVerifierInput {
  skeleton: TreeSkeleton;
  referenceSourceText?: string;
}

export const VerificationResultSchema = z.object({
  verificationStatus: z.enum(['verified', 'verified_with_gaps', 'verification_failed']),
  verificationNotes: z.array(z.string()).default([]),
});
export type VerificationResult = z.infer<typeof VerificationResultSchema>;

export async function runCurriculumVerifier(
  input: CurriculumVerifierInput,
  mockOutput?: Partial<TreeSkeleton>,
  signal?: AbortSignal
): Promise<AgentResult<TreeSkeleton>> {
  const systemInstruction = `You are fact-checking a proposed curriculum against real-world domain rubrics, university syllabi, or certification body structures.

BANNED BEHAVIOR:
- Do not approve a tree just because it looks plausible. Actively check for: wrong prerequisite ordering, missing foundational concepts a real course would never skip, or concepts included that don't belong.
- Output ONLY valid JSON matching this schema:
{
  "verificationStatus": "verified" | "verified_with_gaps" | "verification_failed",
  "verificationNotes": ["note 1", "note 2"]
}`;

  const userPrompt = `Goal Summary: "${input.skeleton.goalSummary}"
Nodes to Verify: ${JSON.stringify(input.skeleton.nodes.map((n) => ({ id: n.id, title: n.title, prereqs: n.prerequisiteIds })))}
Real-World Reference Context / Rubrics: ${input.referenceSourceText || 'Standard domain reference check'}`;

  const result = await executeAgent<CurriculumVerifierInput, VerificationResult>({
    agentName: 'CurriculumVerifier',
    learnerId: input.skeleton.learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: VerificationResultSchema,
    temperature: 0.2,
    signal,
    mockFn: mockOutput
      ? () => ({
          verificationStatus: (mockOutput.verificationStatus && mockOutput.verificationStatus !== 'unverified')
            ? mockOutput.verificationStatus
            : 'verified',
          verificationNotes: mockOutput.verificationNotes || ['Verified against standard curriculum structure.'],
        })
      : undefined,
  });

  const finalSkeleton: TreeSkeleton = {
    ...input.skeleton,
    verificationStatus: result.output.verificationStatus,
    verificationNotes: result.output.verificationNotes,
  };

  return {
    output: finalSkeleton,
    log: result.log,
  };
}
