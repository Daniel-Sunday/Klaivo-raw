import { getModelProvider } from '../providers/modelProvider';
import { DiagnosisAgentSummary, CurriculumNode } from '../types';

type NodeTemplate = Omit<CurriculumNode, 'session_id'>;

/**
 * Curriculum & Knowledge Graph Agent
 * Generates personalized learning paths with dependency nodes and coordinates.
 */
export async function generateCurriculum(sessionSummary: DiagnosisAgentSummary): Promise<NodeTemplate[]> {
  const systemInstruction = `
    You are the Curriculum & Knowledge Graph Agent for Klaivo.
    Your job is to break down the user's learning goal into a sequence of 5 to 7 core concept nodes and establish their dependencies.
    
    Goal context:
    - Target Goal: "${sessionSummary.userGoal}"
    - Learning Intent: "${sessionSummary.intent}"
    - Extracted Context/Syllabus: "${sessionSummary.extractedContext || 'None'}"
    - Learner Level: "${sessionSummary.calibration.level}"
    
    Rules for path generation:
    1. Output between 5 and 7 nodes.
    2. Sequence them logically: node_1 should be the absolute foundational node.
    3. Specify dependencies for each node (e.g. node_2 depends on node_1; node_5 depends on node_3 and node_4).
    4. Provide coordinate mappings (x, y) where:
       - The canvas is 1000 width by 800 height.
       - Nodes flow diagonally starting from the bottom-left and moving to the top-right.
       - The first node (index 0) starts near x=100, y=600.
       - Succeeding nodes must increase in X (moving right) and decrease in Y (moving up) to represent progression.
       - Branching paths (parallel concepts) are highly encouraged where concepts can be learned concurrently, then merging later.
      5. The first node (order_index: 0) must have status: "available" and dependencies: []. All other nodes must have status: "locked".
    
    Return a JSON array of nodes matching this schema:
    [
      {
        "id": "node_1",
        "title": "Clean Concept Name",
        "description": "Brief description of what will be taught in this node (under 12 words)",
        "dependencies": [],
        "x": 100,
        "y": 600,
        "status": "available",
        "order_index": 0
      },
      ...
    ]
  `;

  try {
    const provider = getModelProvider();
    let nodes = await provider.generateJSON<NodeTemplate[]>(
      `Generate curriculum path for goal: "${sessionSummary.userGoal}"`,
      systemInstruction
    );
    console.log('[CurriculumAgent] Graph Response JSON:', nodes);
    
    if (!Array.isArray(nodes)) {
      throw new Error('Graph output is not an array');
    }

    // Apply auto-layout coordinate fallback & validation
    nodes = validateAndLayoutNodes(nodes);
    return nodes;
    
  } catch (err) {
    console.error('[CurriculumAgent] Generation failed, using template fallback:', err);
    return getFallbackCurriculum(sessionSummary.userGoal);
  }
}

/**
 * Validates and mathematical coordinates layout alignment fallback.
 * Ensures nodes are sorted by order_index and flow diagonally up and to the right.
 */
function validateAndLayoutNodes(nodes: any[]): NodeTemplate[] {
  // Sort nodes by order_index
  nodes.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  return nodes.map((node, i) => {
    // Generate clean diagonal coordinates if missing, invalid, or compressed
    const targetX = 100 + i * 140 + Math.sin(i) * 25;
    const targetY = 620 - i * 85 + Math.cos(i) * 15;

    return {
      id: node.id || `node_${i + 1}`,
      title: node.title || `Concept ${i + 1}`,
      description: node.description || `Understand core aspects of concept ${i + 1}`,
      dependencies: Array.isArray(node.dependencies) ? node.dependencies : [],
      x: node.x && Math.abs(node.x - targetX) < 300 ? node.x : targetX, // Use LLM coordinate if within boundary, else fallback
      y: node.y && Math.abs(node.y - targetY) < 300 ? node.y : targetY,
      status: i === 0 ? 'available' : 'locked',
      order_index: i
    };
  });
}

function getFallbackCurriculum(goal: string): NodeTemplate[] {
  console.log('[CurriculumAgent] Loading default WAEC Organic Chemistry syllabus template.');
  
  const nodes: NodeTemplate[] = [
    {
      id: 'node_1',
      title: 'Intro & Hybridization',
      description: 'Covalent bonds, sp3/sp2/sp carbon shapes',
      dependencies: [],
      x: 100,
      y: 600,
      status: 'available',
      order_index: 0
    },
    {
      id: 'node_2',
      title: 'IUPAC Nomenclature',
      description: 'Naming alkanes, alkenes, alkynes & groups',
      dependencies: ['node_1'],
      x: 260,
      y: 480,
      status: 'locked',
      order_index: 1
    },
    {
      id: 'node_3',
      title: 'Hydrocarbon Reactions',
      description: 'Substitution, addition, and combustion',
      dependencies: ['node_2'],
      x: 440,
      y: 420,
      status: 'locked',
      order_index: 2
    },
    {
      id: 'node_4',
      title: 'Isomerism Concepts',
      description: 'Structural and stereoisomerism differences',
      dependencies: ['node_2'],
      x: 440,
      y: 280,
      status: 'locked',
      order_index: 3
    },
    {
      id: 'node_5',
      title: 'Alkanols & Esters',
      description: 'Esterification and properties of alcohols',
      dependencies: ['node_3', 'node_4'],
      x: 640,
      y: 330,
      status: 'locked',
      order_index: 4
    },
    {
      id: 'node_6',
      title: 'Polymers & Synthesis',
      description: 'Addition & condensation polymerization',
      dependencies: ['node_5'],
      x: 820,
      y: 200,
      status: 'locked',
      order_index: 5
    }
  ];

  return nodes;
}
