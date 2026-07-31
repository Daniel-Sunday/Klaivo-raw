export interface StreamProgressCard {
  agent: string;
  thought?: string;
  status: 'started' | 'thought' | 'done' | 'error';
}

export class StreamController {
  private chatHistoryElement: HTMLElement | null;
  private activeThinkingContainer: HTMLElement | null = null;
  private activeThinkingContent: HTMLElement | null = null;
  private activeMessageWrapper: HTMLElement | null = null;

  constructor(chatHistoryId: string = 'chat-history') {
    this.chatHistoryElement = document.getElementById(chatHistoryId);
  }

  /**
   * Creates an inline Antigravity/Codex style thinking block directly inside the chat thread message stream
   */
  public createInlineThinkingBlock(): HTMLElement {
    if (!this.chatHistoryElement) {
      this.chatHistoryElement = document.getElementById('chat-history');
    }

    const msgWrapper = document.createElement('div');
    msgWrapper.className = 'chat-message assistant-message inline-agent-message';

    const thinkingBlock = document.createElement('div');
    thinkingBlock.className = 'inline-thinking-accordion expanded';

    thinkingBlock.innerHTML = `
      <div class="thinking-accordion-header" id="thinking-header">
        <div class="header-left">
          <span class="thinking-pulse-dot"></span>
          <span class="thinking-title-text">Thinking process & sub-agent execution</span>
        </div>
        <span class="thinking-chevron">▼</span>
      </div>
      <div class="thinking-accordion-body" id="thinking-body">
        <div class="thinking-steps-list" id="thinking-steps-list"></div>
      </div>
    `;

    msgWrapper.appendChild(thinkingBlock);

    if (this.chatHistoryElement) {
      this.chatHistoryElement.appendChild(msgWrapper);
      this.chatHistoryElement.scrollTop = this.chatHistoryElement.scrollHeight;
    }

    // Toggle collapse/expand on header click
    const header = thinkingBlock.querySelector('#thinking-header');
    header?.addEventListener('click', () => {
      thinkingBlock.classList.toggle('expanded');
    });

    this.activeThinkingContainer = thinkingBlock;
    this.activeThinkingContent = thinkingBlock.querySelector('#thinking-steps-list');
    this.activeMessageWrapper = msgWrapper;

    return msgWrapper;
  }

  public renderAgentEvent(event: StreamProgressCard): void {
    if (!this.activeThinkingContent) {
      this.createInlineThinkingBlock();
    }

    if (!this.activeThinkingContent) return;

    let stepItem = document.getElementById(`inline-step-${event.agent}`);
    if (!stepItem) {
      stepItem = document.createElement('div');
      stepItem.id = `inline-step-${event.agent}`;
      stepItem.className = `thinking-step-item status-${event.status}`;
      this.activeThinkingContent.appendChild(stepItem);
    }

    stepItem.className = `thinking-step-item status-${event.status}`;
    stepItem.innerHTML = `
      <div class="step-meta">
        <span class="step-icon">${event.status === 'done' ? '✓' : event.status === 'started' ? '⚡' : '⚙'}</span>
        <span class="step-agent-name">${event.agent}</span>
        <span class="step-status-tag tag-${event.status}">${event.status}</span>
      </div>
      ${event.thought ? `<div class="step-thought-text">${event.thought}</div>` : ''}
    `;

    if (this.chatHistoryElement) {
      this.chatHistoryElement.scrollTop = this.chatHistoryElement.scrollHeight;
    }
  }

  public finalizeThinkingBlock(finalResponseText?: string): void {
    if (this.activeThinkingContainer) {
      const pulseDot = this.activeThinkingContainer.querySelector('.thinking-pulse-dot');
      const titleText = this.activeThinkingContainer.querySelector('.thinking-title-text');
      if (pulseDot) pulseDot.classList.add('completed');
      if (titleText) titleText.textContent = 'Thought process completed';

      // Auto-collapse accordion after completion (like Claude/Antigravity)
      this.activeThinkingContainer.classList.remove('expanded');
    }

    if (finalResponseText && this.activeMessageWrapper) {
      const responseTextDiv = document.createElement('div');
      responseTextDiv.className = 'inline-assistant-response-text';
      responseTextDiv.textContent = finalResponseText;
      this.activeMessageWrapper.appendChild(responseTextDiv);
    }

    this.activeThinkingContainer = null;
    this.activeThinkingContent = null;
    this.activeMessageWrapper = null;
  }
}
