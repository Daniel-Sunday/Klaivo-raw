import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import { TreeSkeletonSchema, TreeSkeleton } from '../schemas';

export interface CurriculumVerifierInput {
  skeleton: TreeSkeleton;
  referenceSourceText?: string;
}

export async function runCurriculumVerifier(
  input: CurriculumVerifierInput,
  mockOutput?: Partial<TreeSkeleton>
): Promise<AgentResult<TreeSkeleton>> {
  const systemInstruction = `You are the Klaivo Curriculum Verifier Agent. Your job is to verify an unverified tree skeleton against external domain standards, syllabi, or curricula.

RULES:
1. You do NOT rewrite or modify the tree structure unilaterally.
2. Examine the node sequence, prerequisites, and topic coverage against standard curriculum structures.
3. If all core concepts are present and correctly ordered, set "verificationStatus": "verified".
4. If there are missing topics, ordering issues, or if no external reference standard exists for a niche domain, set "verificationStatus": "verified_with_gaps" and detail your findings in "verificationNotes".
5. Never reject or throw an error simply because a domain is non-standard or lacks a canonical syllabus — fallback gracefully to "verified_with_gaps".

Output must be the updated TreeSkeleton JSON object.`;

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
    mockFn: mockOutput
      ? () => ({
          ...input.skeleton,
          verificationStatus: mockOutput.verificationStatus || "verified",
          verificationNotes: mockOutput.verificationNotes || ["Verified against standard curriculum structure."],
        })
      : undefined,
  });
}
