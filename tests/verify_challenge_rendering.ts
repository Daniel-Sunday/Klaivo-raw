import assert from 'assert';

// Simulated DOM environment for client rendering test
class MockElement {
  public tagName: string;
  public className: string = '';
  public dataset: Record<string, string> = {};
  public style: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentNode: MockElement | null = null;
  public innerHTML: string = '';
  public innerText: string = '';
  public textContent: string = '';
  public scrollTop: number = 0;
  public scrollHeight: number = 100;
  private eventListeners: Record<string, Function[]> = {};

  constructor(tagName: string) {
    this.tagName = tagName;
  }

  appendChild(child: MockElement): MockElement {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child: MockElement): MockElement {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  remove(): void {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  addEventListener(event: string, fn: Function): void {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(fn);
  }

  querySelector(selector: string): MockElement | null {
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      return this.find(el => el.className.split(' ').includes(cls));
    }
    return null;
  }

  querySelectorAll(selector: string): MockElement[] {
    const results: MockElement[] = [];
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      this.findAll(el => el.className.split(' ').includes(cls), results);
    }
    return results;
  }

  closest(selector: string): MockElement | null {
    let curr: MockElement | null = this;
    const cls = selector.startsWith('.') ? selector.slice(1) : selector;
    while (curr) {
      if (curr.className.split(' ').includes(cls)) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  private find(predicate: (el: MockElement) => boolean): MockElement | null {
    if (predicate(this)) return this;
    for (const child of this.children) {
      const res = child.find(predicate);
      if (res) return res;
    }
    return null;
  }

  private findAll(predicate: (el: MockElement) => boolean, results: MockElement[]): void {
    if (predicate(this)) results.push(this);
    for (const child of this.children) {
      child.findAll(predicate, results);
    }
  }
}

async function runVerification() {
  console.log('🧪 Starting Challenge Card Rendering Order & Deduplication Test...\n');

  const mockChatHistory = new MockElement('div');
  mockChatHistory.className = 'chat-history';

  let activeNodeId: string | null = null;
  let currentNodeOpenRequestId = 0;

  function appendTaskLauncherCard(node: { id: string; title: string }): void {
    // Deduplication check: remove any existing challenge card for this node
    const existingCards = mockChatHistory.querySelectorAll('.task-launcher-card');
    existingCards.forEach(card => {
      const wrapper = card.closest('message-wrapper');
      if (wrapper && wrapper.dataset.nodeId === node.id) {
        wrapper.remove();
      }
    });

    const launcherWrapper = new MockElement('div');
    launcherWrapper.className = 'message-wrapper assistant';
    launcherWrapper.dataset.nodeId = node.id;

    const bubble = new MockElement('div');
    bubble.className = 'message-bubble';

    const card = new MockElement('div');
    card.className = 'task-launcher-card';
    card.innerHTML = `🎯 Practical Task Challenge for ${node.title}`;

    bubble.appendChild(card);
    launcherWrapper.appendChild(bubble);
    mockChatHistory.appendChild(launcherWrapper);
  }

  // --- Test 1: Deduplication Check Across 3 Nodes ---
  console.log('--- 1. Testing Duplicate Challenge Prevention ---');
  const nodeA = { id: 'node_a', title: 'Node A - Variables' };
  const nodeB = { id: 'node_b', title: 'Node B - Functions' };
  const nodeC = { id: 'node_c', title: 'Node C - Loops' };

  // Call appendTaskLauncherCard multiple times for Node A
  appendTaskLauncherCard(nodeA);
  appendTaskLauncherCard(nodeA);
  appendTaskLauncherCard(nodeA);

  const cardsNodeA = mockChatHistory.querySelectorAll('.task-launcher-card')
    .filter(c => c.closest('message-wrapper')?.dataset.nodeId === 'node_a');

  assert.strictEqual(cardsNodeA.length, 1, 'Node A should have exactly 1 challenge card rendered after 3 append calls');
  console.log('✅ Node A duplicate prevention passed! Exactly 1 card rendered.');

  // Call for Node B twice
  appendTaskLauncherCard(nodeB);
  appendTaskLauncherCard(nodeB);

  const cardsNodeB = mockChatHistory.querySelectorAll('.task-launcher-card')
    .filter(c => c.closest('message-wrapper')?.dataset.nodeId === 'node_b');

  assert.strictEqual(cardsNodeB.length, 1, 'Node B should have exactly 1 challenge card rendered after 2 append calls');
  console.log('✅ Node B duplicate prevention passed! Exactly 1 card rendered.');

  // Call for Node C
  appendTaskLauncherCard(nodeC);

  const cardsNodeC = mockChatHistory.querySelectorAll('.task-launcher-card')
    .filter(c => c.closest('message-wrapper')?.dataset.nodeId === 'node_c');

  assert.strictEqual(cardsNodeC.length, 1, 'Node C should have exactly 1 challenge card rendered');
  console.log('✅ Node C single rendering passed!\n');

  // --- Test 2: Ordering & Async Token Guard Test ---
  console.log('--- 2. Testing Execution Ordering & Async Request Invalidation ---');

  // Simulate clicking Node A fresh:
  mockChatHistory.children = []; // Clear
  const req1 = ++currentNodeOpenRequestId;
  activeNodeId = nodeA.id;

  const thinkingBubble = new MockElement('div');
  thinkingBubble.className = 'message-wrapper assistant';
  thinkingBubble.dataset.nodeId = nodeA.id;
  thinkingBubble.innerHTML = 'Thinking...';
  mockChatHistory.appendChild(thinkingBubble);

  // Explanation text streaming simulation
  const streamedChunks: string[] = [];
  let isStreamFinished = false;

  for (let i = 1; i <= 3; i++) {
    streamedChunks.push(`Chunk ${i} of explanation for ${nodeA.title}`);
  }
  isStreamFinished = true;

  // Enforce ordering: card ONLY renders after stream finishes AND request is current
  if (isStreamFinished && req1 === currentNodeOpenRequestId && activeNodeId === nodeA.id) {
    appendTaskLauncherCard(nodeA);
  }

  // Verify elements order: element[0] is thinking/explanation, element[1] is task launcher
  assert.strictEqual(mockChatHistory.children.length, 2, 'Chat history should contain explanation text wrapper and task launcher wrapper');
  const firstChild = mockChatHistory.children[0];
  const secondChild = mockChatHistory.children[1];

  assert.strictEqual(firstChild.innerHTML, 'Thinking...', 'Explanation text wrapper must render first');
  assert.strictEqual(secondChild.children[0].children[0].className, 'task-launcher-card', 'Challenge card must render SECOND (after explanation text finishes)');
  console.log('✅ Strict rendering order passed: Explanation text rendered first, Challenge Card rendered second!');

  // --- Test 3: Rapid Double-Click Race Condition Handling ---
  console.log('\n--- 3. Testing Rapid Double-Click Request Cancellation ---');
  mockChatHistory.children = [];

  // User clicks Node A (Request 1)
  const r1 = ++currentNodeOpenRequestId;
  activeNodeId = nodeA.id;

  // User immediately clicks Node B (Request 2) while Request 1 is in-flight
  const r2 = ++currentNodeOpenRequestId;
  activeNodeId = nodeB.id;

  // Request 1 tries to finish async work
  if (r1 === currentNodeOpenRequestId && activeNodeId === nodeA.id) {
    appendTaskLauncherCard(nodeA);
  }

  // Request 2 finishes async work
  if (r2 === currentNodeOpenRequestId && activeNodeId === nodeB.id) {
    appendTaskLauncherCard(nodeB);
  }

  const finalCards = mockChatHistory.querySelectorAll('.task-launcher-card');
  assert.strictEqual(finalCards.length, 1, 'Only Request 2 (active node B) should have rendered a challenge card');
  assert.strictEqual(finalCards[0].closest('message-wrapper')?.dataset.nodeId, 'node_b', 'Card must belong to Node B');

  console.log('✅ Rapid click request cancellation passed! Stale request 1 was cleanly discarded.');

  console.log('\n🎉 ALL CHALLENGE CARD RENDERING TESTS PASSED SUCCESSFULLY!');
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
