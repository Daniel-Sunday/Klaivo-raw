import { GoogleGenerativeAI } from '@google/generative-ai';
import { CurriculumNode, Calibration, Message, WriteChunkCallback } from '../types';

type NodeTemplate = Omit<CurriculumNode, 'session_id'>;

/**
 * Teaching Agent - Streams explanations calibrated to the user's level.
 */
export async function streamExplanation(
  node: NodeTemplate,
  calibration: Calibration,
  writeChunk: WriteChunkCallback
): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[TeachingAgent] API Key missing. Falling back to stub explanation.');
    return getStubExplanation(node, calibration, writeChunk);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

  const systemInstruction = `
    You are the Teaching Agent for Klaivo, an AI-powered adaptive learning platform.
    Teach the following concept to the learner:
    - Concept Title: "${node.title}"
    - Concept Description: "${node.description}"
    
    Calibration State:
    - Learner Level: "${calibration.level}"
    - Known Concepts: ${JSON.stringify(calibration.known_concepts)}
    - Inferred Weak Points: ${JSON.stringify(calibration.weak_points)}
    
    Requirements:
    1. Explain the concept using language and analogies calibrated to a ${calibration.level} learner. If they are beginner, keep it simple and analogical. If advanced, be rigorous.
    2. Keep the explanation engaging, concise, and structured. Use Markdown (headers, bold text, bullets). Limit explanation to ~200-250 words.
    3. At the very end of your explanation, insert a blank line followed by the exact header:
       "ASSESSMENT QUESTION:"
       followed by one application-oriented question. This question must require the student to *apply* the concept rather than just recall facts (e.g. solve an equation, predict a chemical structure/behavior, analyze a compound).
  `;

  try {
    const resultStream = await model.generateContentStream(systemInstruction);
    for await (const chunk of resultStream.stream) {
      const chunkText = chunk.text();
      writeChunk(chunkText);
    }
  } catch (error) {
    console.error('[TeachingAgent] API streaming failed:', error);
    return getStubExplanation(node, calibration, writeChunk);
  }
}

async function getStubExplanation(
  node: NodeTemplate,
  calibration: Calibration,
  writeChunk: WriteChunkCallback
): Promise<void> {
  // Static content fallback helper
  const explanations: Record<string, string> = {
    node_1: `### Carbon Hybridization and Organic Chemistry

Welcome to your first step! Organic Chemistry is the study of carbon compounds. Carbon is unique because it has **4 valence electrons**, allowing it to form stable covalent bonds.

1. **sp3 Hybridization**: Found in Methane ($CH_4$). Tetrahedral geometry with bond angles of **109.5°**.
2. **sp2 Hybridization**: Found in Ethene ($C_2H_4$). Trigonal planar (angles of **120°**).
3. **sp Hybridization**: Found in Ethyne ($C_2H_2$). Linear (angles of **180°**).

ASSESSMENT QUESTION:
Consider the hydrocarbon Methane ($CH_4$) and Ethene ($C_2H_4$). Explain the difference in carbon hybridization between these two molecules, and state the expected bond angles for each.`,
    
    node_2: `### IUPAC Nomenclature

To name organic molecules, follow these core steps:
1. **Identify the longest continuous carbon chain** (meth-, eth-, prop-, but-, pent-...).
2. **Number the chain** starting from the end closest to substituents or double/triple bonds.
3. **Name branches/substituents** (e.g., methyl, ethyl).
4. Assemble alphabetically.

ASSESSMENT QUESTION:
What is the IUPAC name for this molecule?
\`CH3 - CH(CH3) - CH2 - CH2 - CH3\`
Explain how you numbered the chain.`,

    node_3: `### Hydrocarbon Reactions

1. **Alkanes (Saturated)**: Relativly unreactive. Undergo **Substitution Reactions** (e.g. chlorination) and **Combustion**.
2. **Alkenes & Alkynes (Unsaturated)**: Highly reactive double/triple bonds. Undergo **Addition Reactions** (e.g., halogen addition).

ASSESSMENT QUESTION:
If you bubble Ethene gas through orange Bromine water, what visual change occurs, and is this an addition or substitution reaction?`,

    node_4: `### Isomerism Concepts

Isomers are compounds that share the same **molecular formula** but have different **structural formulas**.
- **Structural Isomers**: Chain, position, and functional isomerism.
- **Stereoisomers**: Cis/trans isomerism.

ASSESSMENT QUESTION:
Butane has the formula $C_4H_{10}$. Describe its structural isomers and name them.`,

    node_5: `### Alkanols and Esterification

Alkanols contain the hydroxyl (**-OH**) group.
Key reaction: **Esterification**:
$$\\text{Alkanol} + \\text{Alkanoic Acid} \\xrightarrow{H_2SO_4} \\text{Ester} + \\text{Water}$$
Esters have sweet, fruity smells.

ASSESSMENT QUESTION:
Ethanol reacts with Ethanoic Acid with H2SO4 catalyst. Name the ester formed and its smell.`,

    node_6: `### Polymers & Synthesis

Polymers are giant molecules made of monomers:
- **Addition Polymerization**: Monomers join without loss of atoms (e.g., Polyethene).
- **Condensation Polymerization**: Monomers link with elimination of water (e.g., Nylon).

ASSESSMENT QUESTION:
Identify the monomer used to manufacture PVC, and state if PVC is an addition or condensation polymer.`
  };

  const text = explanations[node.id] || `### ${node.title}\n\nConcept details.\n\nASSESSMENT QUESTION:\nExplain ${node.title}.`;
  
  const words = text.split(' ');
  for (let i = 0; i < words.length; i += 4) {
    const chunk = words.slice(i, i + 4).join(' ') + ' ';
    writeChunk(chunk);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

export async function streamFollowUpAnswer(
  node: NodeTemplate,
  calibration: Calibration,
  chatHistoryList: Message[],
  writeChunk: WriteChunkCallback
): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getStubFollowUpAnswer(node, writeChunk);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

  const historyText = chatHistoryList.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');

  const systemInstruction = `
    You are the Teaching Agent for Klaivo, an AI-powered adaptive learning platform.
    The learner is studying the concept node: "${node.title}" (${node.description}).
    They are currently at a "${calibration.level}" level.
    
    Here is the chat history in this node thread:
    ${historyText}
    
    Answer the user's latest follow-up question in an engaging, helpful, and concise manner.
    Keep your explanation calibrated to their level, using analogies if helpful.
    Use Markdown. Limit your response to ~150 words.
    Do NOT append an assessment question at the end (the user is already in the middle of learning).
  `;

  try {
    const resultStream = await model.generateContentStream(systemInstruction);
    for await (const chunk of resultStream.stream) {
      const chunkText = chunk.text();
      writeChunk(chunkText);
    }
  } catch (error) {
    console.error('[TeachingAgent] Streaming follow-up failed:', error);
    return getStubFollowUpAnswer(node, writeChunk);
  }
}

async function getStubFollowUpAnswer(node: NodeTemplate, writeChunk: WriteChunkCallback): Promise<void> {
  const text = `This is a helpful follow-up response for your question about **${node.title}**. We are focusing on making sure you understand the concepts step-by-step. Let me know if you have any other questions or if you're ready to try the assessment!`;
  const words = text.split(' ');
  for (let i = 0; i < words.length; i += 4) {
    const chunk = words.slice(i, i + 4).join(' ') + ' ';
    writeChunk(chunk);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
