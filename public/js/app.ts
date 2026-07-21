import { ConceptCanvas } from './canvas';
import { CurriculumNode, Message } from '../../types';

document.addEventListener('DOMContentLoaded', () => {
  // --- State ---
  let sessionId: string | null = null;
  let activeNodeId: string | null = null;
  let calibration: string = 'Beginner';
  let nodes: CurriculumNode[] = [];
  let selectedFiles: File[] = [];

  // --- Screens ---
  const welcomeScreen    = document.getElementById('welcome-screen') as HTMLElement;
  const workspaceScreen  = document.getElementById('workspace-screen') as HTMLElement;

  // --- Header ---
  const headerStatus      = document.getElementById('header-status') as HTMLElement;
  const headerCalibration = document.getElementById('header-calibration') as HTMLElement;

  // --- Progress overlay (kept but rarely used) ---
  const progressOverlay = document.getElementById('progress-overlay') as HTMLElement;
  const progressText    = document.getElementById('progress-text') as HTMLElement;

  // ══════════════════════════════════════════════════
  // STAGE 1 — Welcome screen elements
  // ══════════════════════════════════════════════════
  const welcomeInput      = document.getElementById('welcome-input') as HTMLTextAreaElement;
  const welcomeSendBtn    = document.getElementById('welcome-send-btn') as HTMLButtonElement;
  const welcomeFileInput  = document.getElementById('welcome-file-input') as HTMLInputElement;
  const welcomeFilesList  = document.getElementById('welcome-files-list') as HTMLElement;
  const suggestionChips   = document.querySelectorAll<HTMLButtonElement>('.suggestion-chip');

  // ══════════════════════════════════════════════════
  // STAGE 2 / 3 — Workspace elements
  // ══════════════════════════════════════════════════
  const chatSidebar       = document.getElementById('chat-sidebar') as HTMLElement;
  const canvasPanel       = document.getElementById('canvas-panel') as HTMLElement;
  const panelResizer      = document.getElementById('panel-resizer') as HTMLElement;
  const gutterToggleBtn   = document.getElementById('gutter-toggle-btn') as HTMLButtonElement;
  const toggleSidebarBtn  = document.getElementById('toggle-sidebar-btn') as HTMLButtonElement;
  const expandSidebarBtn  = document.getElementById('expand-sidebar-btn') as HTMLButtonElement;
  const collapseCanvasBtn = document.getElementById('collapse-canvas-btn') as HTMLButtonElement;
  const expandCanvasBtn   = document.getElementById('expand-canvas-btn') as HTMLButtonElement;

  const sidebarNodeTitle  = document.getElementById('sidebar-node-title') as HTMLElement;
  const sidebarNodeStatus = document.getElementById('sidebar-node-status') as HTMLElement;
  const exitNodeBtn       = document.getElementById('exit-node-btn') as HTMLButtonElement;
  const chatHistory       = document.getElementById('chat-history') as HTMLElement;
  const chatInput         = document.getElementById('chat-input') as HTMLTextAreaElement;
  const sendChatBtn       = document.getElementById('send-chat-btn') as HTMLButtonElement;

  // Attachment in chat bar
  const onboardingFileInput = document.getElementById('onboarding-file-input') as HTMLInputElement;
  const onboardingFilesList = document.getElementById('onboarding-files-list') as HTMLElement;

  // Canvas
  const canvasSessionTitle = document.getElementById('canvas-session-title') as HTMLElement;
  const canvasSessionStats = document.getElementById('canvas-session-stats') as HTMLElement;
  const canvas = new ConceptCanvas('concept-svg');

  // ══════════════════════════════════════════════════
  // Auto-resizing multiline composer helper
  // ══════════════════════════════════════════════════
  function setupAutoResizeTextarea(textarea: HTMLTextAreaElement): void {
    if (!textarea) return;
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    };
    textarea.addEventListener('input', adjustHeight);
  }

  setupAutoResizeTextarea(welcomeInput);
  setupAutoResizeTextarea(chatInput);

  // ══════════════════════════════════════════════════
  // STAGE 0 — Left Navigation Bar (Perplexity style)
  // ══════════════════════════════════════════════════
  const appLeftNav          = document.getElementById('app-left-nav') as HTMLElement;
  const navNewSessionBtn    = document.getElementById('nav-new-session-btn') as HTMLButtonElement;
  const navSessionsGroup    = document.getElementById('nav-sessions-group') as HTMLElement;
  const navSessionsHeader   = document.getElementById('nav-sessions-header') as HTMLElement;
  const navSessionsList     = document.getElementById('nav-sessions-list') as HTMLElement;
  const navHistoryGroup     = document.getElementById('nav-history-group') as HTMLElement;
  const navHistoryHeader    = document.getElementById('nav-history-header') as HTMLElement;
  const navHistoryList      = document.getElementById('nav-history-list') as HTMLElement;
  const toggleNavBtn        = document.getElementById('toggle-nav-btn') as HTMLButtonElement;
  const headerSessionTitle  = document.getElementById('header-session-title') as HTMLElement;

  // Toggle Left Navigation Bar
  toggleNavBtn?.addEventListener('click', () => {
    appLeftNav.classList.toggle('collapsed');
  });

  // Collapsible section toggles
  navSessionsHeader?.addEventListener('click', () => {
    navSessionsGroup.classList.toggle('collapsed');
  });
  navHistoryHeader?.addEventListener('click', () => {
    navHistoryGroup.classList.toggle('collapsed');
  });

  // New Session Button: Return to Welcome Screen
  navNewSessionBtn?.addEventListener('click', resetToWelcomeScreen);

  function resetToWelcomeScreen(): void {
    sessionId = null;
    activeNodeId = null;
    nodes = [];
    selectedFiles = [];

    welcomeInput.value = '';
    welcomeInput.style.height = 'auto';
    welcomeFilesList.innerHTML = '';
    onboardingFilesList.innerHTML = '';
    chatHistory.innerHTML = '';
    headerStatus.classList.add('hidden');
    headerSessionTitle.textContent = 'Klaivo Workspace';

    workspaceScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    welcomeInput.focus();
    loadNavigationHistory();
  }

  // Fetch & Render Navigation History from backend
  async function loadNavigationHistory(): Promise<void> {
    try {
      const res = await fetch('/api/sessions');
      if (!res.ok) return;
      const data = await res.json();
      const sessions = data.sessions || [];

      // 1. Render Sessions section (Tree/Map sessions)
      navSessionsList.innerHTML = '';
      if (sessions.length === 0) {
        navSessionsList.innerHTML = `<div class="nav-item-sub" style="padding: 6px 10px;">No sessions yet</div>`;
      } else {
        sessions.forEach((sess: any) => {
          const item = document.createElement('div');
          item.className = `nav-item ${sess.id === sessionId ? 'active' : ''}`;
          item.innerHTML = `
            <div class="nav-item-title">${sess.title || 'Untitled Session'}</div>
            <div class="nav-item-sub">
              <span>${sess.nodes ? sess.nodes.length : 0} topics</span>
              <span>•</span>
              <span style="text-transform: capitalize;">${sess.calibration?.level || 'Beginner'}</span>
            </div>
          `;

          // Expandable node topic chats inside session
          if (sess.nodes && sess.nodes.length > 0) {
            const tree = document.createElement('div');
            tree.className = 'nav-node-tree';
            sess.nodes.forEach((n: CurriculumNode) => {
              const nodeEl = document.createElement('div');
              nodeEl.className = `nav-node-item ${sess.id === sessionId && n.id === activeNodeId ? 'active' : ''}`;
              nodeEl.textContent = `${n.status === 'completed' ? '✓ ' : ''}${n.title}`;
              nodeEl.addEventListener('click', (e) => {
                e.stopPropagation();
                openSessionAndNode(sess.id, n.id);
              });
              tree.appendChild(nodeEl);
            });
            item.appendChild(tree);
          }

          item.addEventListener('click', () => {
            openSessionAndNode(sess.id, null);
          });

          navSessionsList.appendChild(item);
        });
      }

      // 2. Render History section (Chronological node chats across all sessions, shown by default)
      navHistoryList.innerHTML = '';
      const allNodeChats: Array<{ sessionId: string; sessionTitle: string; node: CurriculumNode }> = [];
      sessions.forEach((sess: any) => {
        if (sess.nodes) {
          sess.nodes.forEach((n: CurriculumNode) => {
            if (n.status !== 'locked') {
              allNodeChats.push({ sessionId: sess.id, sessionTitle: sess.title, node: n });
            }
          });
        }
      });

      if (allNodeChats.length === 0) {
        navHistoryList.innerHTML = `<div class="nav-item-sub" style="padding: 6px 10px;">No recent chats</div>`;
      } else {
        allNodeChats.slice(0, 20).forEach(chat => {
          const item = document.createElement('div');
          item.className = `nav-item ${chat.sessionId === sessionId && chat.node.id === activeNodeId ? 'active' : ''}`;
          item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; opacity: 0.7;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <div class="nav-item-title">${chat.node.title}</div>
            </div>
            <div class="nav-item-sub" style="padding-left: 21px;">${chat.sessionTitle}</div>
          `;
          item.addEventListener('click', () => {
            openSessionAndNode(chat.sessionId, chat.node.id);
          });
          navHistoryList.appendChild(item);
        });
      }

    } catch (err) {
      console.error('Error loading navigation history:', err);
    }
  }

  async function openSessionAndNode(sessId: string, nodeId: string | null): Promise<void> {
    try {
      const res = await fetch(`/api/sessions/${sessId}`);
      if (!res.ok) return;
      const data = await res.json();

      sessionId = sessId;
      calibration = data.session.calibration.level;
      nodes = data.nodes || [];

      headerCalibration.textContent = calibration;
      headerStatus.classList.remove('hidden');
      canvasSessionTitle.textContent = data.session.title;
      headerSessionTitle.textContent = data.session.title;

      canvas.render(nodes);
      updateStats();

      enterDiscoveryMode();
      activateSplitScreen();

      if (nodeId) {
        const targetNode = nodes.find(n => n.id === nodeId);
        if (targetNode) {
          activeNodeId = nodeId;
          sidebarNodeTitle.textContent = targetNode.title;
          sidebarNodeStatus.textContent = targetNode.status.toUpperCase();
          sidebarNodeStatus.className = `node-badge ${targetNode.status}`;
          exitNodeBtn.style.display = 'block';

          document.querySelectorAll('.svg-node-group').forEach(el => el.classList.remove('active'));
          document.getElementById(`node-group-${nodeId}`)?.classList.add('active');

          chatHistory.innerHTML = '';
          const chatRes = await fetch(`/api/sessions/${sessId}/nodes/${nodeId}/chat`);
          if (chatRes.ok) {
            const historyMsgs: Message[] = await chatRes.json();
            historyMsgs.forEach(msg => appendMessage(msg.sender, msg.content, nodeId));
          }
        }
      } else {
        activeNodeId = null;
        sidebarNodeTitle.textContent = 'Curriculum Diagnostic';
        sidebarNodeStatus.textContent = 'DIAGNOSIS';
        sidebarNodeStatus.className = 'node-badge diagnosis';
        exitNodeBtn.style.display = 'none';
        chatHistory.innerHTML = '';
        loadGlobalChat();
      }

      loadNavigationHistory();
    } catch (err) {
      console.error('Error loading session from nav:', err);
    }
  }

  // Load navigation items on startup
  loadNavigationHistory();


  // ══════════════════════════════════════════════════
  // Screen transition helpers
  // ══════════════════════════════════════════════════

  /** Stage 1 → Stage 2: hide welcome, show single-column chat */
  function enterDiscoveryMode(): void {
    welcomeScreen.classList.add('hidden');
    workspaceScreen.classList.remove('hidden');
    workspaceScreen.classList.add('discovery-mode');
  }

  /** Stage 2 → Stage 3: expand chat+canvas split view */
  function activateSplitScreen(): void {
    workspaceScreen.classList.remove('discovery-mode');
    toggleSidebarBtn.classList.remove('hidden');
    chatInput.placeholder = 'Type your response...';
  }


  // ══════════════════════════════════════════════════
  // Collapsible split-pane & drag-resize
  // ══════════════════════════════════════════════════
  type WorkspaceViewMode = 'split' | 'canvas-only' | 'chat-only';
  let currentViewMode: WorkspaceViewMode = 'split';
  let isResizing = false;

  function setWorkspaceViewMode(mode: WorkspaceViewMode): void {
    currentViewMode = mode;
    chatSidebar.classList.remove('collapsed');
    canvasPanel.classList.remove('collapsed');
    workspaceScreen.classList.remove('chat-only-mode');
    workspaceScreen.classList.remove('canvas-only-mode');
    expandSidebarBtn.classList.add('hidden');
    expandCanvasBtn.classList.add('hidden');
    panelResizer.style.display = 'block';

    if (mode === 'canvas-only') {
      chatSidebar.classList.add('collapsed');
      workspaceScreen.classList.add('canvas-only-mode');
      expandSidebarBtn.classList.remove('hidden');
      panelResizer.style.display = 'none';
    } else if (mode === 'chat-only') {
      canvasPanel.classList.add('collapsed');
      workspaceScreen.classList.add('chat-only-mode');
      expandCanvasBtn.classList.remove('hidden');
      panelResizer.style.display = 'none';
    }
  }

  toggleSidebarBtn?.addEventListener('click', () => {
    setWorkspaceViewMode(currentViewMode === 'canvas-only' ? 'split' : 'canvas-only');
  });
  expandSidebarBtn?.addEventListener('click', () => setWorkspaceViewMode('split'));

  collapseCanvasBtn?.addEventListener('click', () => {
    setWorkspaceViewMode(currentViewMode === 'chat-only' ? 'split' : 'chat-only');
  });
  expandCanvasBtn?.addEventListener('click', () => setWorkspaceViewMode('split'));

  // Dedicated Gutter Toggle Button (Cursor & Antigravity IDE standard)
  gutterToggleBtn?.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    setWorkspaceViewMode(currentViewMode === 'canvas-only' ? 'split' : 'canvas-only');
  });

  // Ctrl+B toggles sidebar collapse (like Cursor & Antigravity IDE)
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      if (workspaceScreen.classList.contains('discovery-mode')) return;
      e.preventDefault();
      setWorkspaceViewMode(currentViewMode === 'split' ? 'canvas-only' : 'split');
    }
  });

  // Double-click resizer to reset width to default 420px
  panelResizer?.addEventListener('dblclick', (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.gutter-toggle-btn')) return;
    chatSidebar.style.width = '420px';
    if (currentViewMode === 'canvas-only') {
      setWorkspaceViewMode('split');
    }
  });

  // Pointer Capture Dragging (Eliminates mouse drops & slippery drag lag)
  panelResizer?.addEventListener('pointerdown', (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('.gutter-toggle-btn')) return;
    isResizing = true;
    try {
      panelResizer.setPointerCapture(e.pointerId);
    } catch (_) {}
    panelResizer.classList.add('resizing');
    chatSidebar.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  panelResizer?.addEventListener('pointermove', (e: PointerEvent) => {
    if (!isResizing) return;
    const snapThreshold = 180;
    const maxWidth = Math.min(window.innerWidth - 300, window.innerWidth * 0.75);

    if (e.clientX < snapThreshold) {
      // Snap to collapsed when dragged under snap threshold
      setWorkspaceViewMode('canvas-only');
    } else {
      if (currentViewMode === 'canvas-only') {
        setWorkspaceViewMode('split');
      }
      const newWidth = Math.min(e.clientX, maxWidth);
      chatSidebar.style.width = `${newWidth}px`;
    }
  });

  const stopPointerResizing = (e: PointerEvent) => {
    if (isResizing) {
      isResizing = false;
      try {
        panelResizer.releasePointerCapture(e.pointerId);
      } catch (_) {}
      panelResizer.classList.remove('resizing');
      chatSidebar.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  };

  panelResizer?.addEventListener('pointerup', stopPointerResizing);
  panelResizer?.addEventListener('pointercancel', stopPointerResizing);


  // ══════════════════════════════════════════════════
  // Utility
  // ══════════════════════════════════════════════════
  function showLoader(text: string): void {
    progressText.textContent = text;
    progressOverlay.classList.remove('hidden');
  }

  function hideLoader(): void {
    progressOverlay.classList.add('hidden');
  }

  function formatMarkdown(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Constitution Active Recall Blur Mask: [[term]] or [blur]term[/blur]
      .replace(/\[blur\](.*?)\[\/blur\]/gi, '<span class="active-recall-blur" title="Click or hover to reveal term" role="button" tabindex="0">$1</span>')
      .replace(/\[\[(.*?)\]\]/g, '<span class="active-recall-blur" title="Click or hover to reveal term" role="button" tabindex="0">$1</span>')
      // Constitution Superscript Citation Chips: [1], [2]
      .replace(/\[(\d+)\]/g, '<span class="citation-chip" title="Citation Source [$1]">$1</span>')
      .replace(/\n/g, '<br>');
  }

  // Active Recall Mask Click Handler (reveals blurred terms)
  chatHistory?.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target && target.classList.contains('active-recall-blur')) {
      target.classList.toggle('revealed');
    }
  });

  function renderMessageBubble(bubble: HTMLElement, content: string): void {
    if (content.includes('thinking-dots')) {
      bubble.innerHTML = content;
      return;
    }
    if (content.includes('ASSESSMENT QUESTION:') || content.includes('CHECK YOUR UNDERSTANDING:')) {
      const parts = content.split(/(ASSESSMENT QUESTION:|CHECK YOUR UNDERSTANDING:)/i);
      const mainText = parts[0];
      const questionText = parts.slice(1).join('');
      bubble.innerHTML = `<p>${formatMarkdown(mainText)}</p>
        <div class="assessment-card">
          <div class="assessment-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Check Your Understanding
          </div>
          <p>${formatMarkdown(questionText)}</p>
        </div>`;
    } else {
      bubble.innerHTML = `<p>${formatMarkdown(content)}</p>`;
    }
  }

  function appendMessage(sender: 'user' | 'assistant' | 'system', content: string, nodeId: string | null = null): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${sender}`;
    if (nodeId) wrapper.dataset.nodeId = nodeId;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    renderMessageBubble(bubble, content);

    wrapper.appendChild(bubble);
    chatHistory.appendChild(wrapper);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return wrapper;
  }


  // ══════════════════════════════════════════════════
  // STAGE 1 — Welcome screen: file attach + send
  // ══════════════════════════════════════════════════

  // File attach on welcome screen
  welcomeFileInput.addEventListener('change', (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    files.forEach(file => {
      if (selectedFiles.some(f => f.name === file.name)) return;
      selectedFiles.push(file);
      const tag = document.createElement('div');
      tag.className = 'uploaded-file-tag';
      tag.innerHTML = `📄 ${file.name.substring(0, 20)}${file.name.length > 20 ? '…' : ''} <span class="remove-file-btn" data-name="${file.name}">×</span>`;
      welcomeFilesList.appendChild(tag);
    });
    welcomeFileInput.value = '';
  });

  welcomeFilesList.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('remove-file-btn')) {
      selectedFiles = selectedFiles.filter(f => f.name !== target.dataset.name);
      target.parentElement?.remove();
    }
  });

  // Suggestion chips
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt || chip.textContent?.trim() || '';
      welcomeInput.value = prompt;
      welcomeInput.focus();
    });
  });

  // Enter key on welcome input (Shift+Enter inserts newline)
  welcomeInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startSession();
    }
  });

  welcomeSendBtn.addEventListener('click', startSession);

  async function startSession(): Promise<void> {
    const prompt = welcomeInput.value.trim();
    if (!prompt) { welcomeInput.focus(); return; }

    // Move to discovery mode chat first (immediate UI response)
    enterDiscoveryMode();

    // Show the user's message and a thinking dot loader
    appendMessage('user', prompt);
    const thinkingWrapper = appendMessage('assistant', '<div class="thinking-dots"><span></span><span></span><span></span></div>');

    try {
      const formData = new FormData();
      formData.append('initial_prompt', prompt);
      selectedFiles.forEach(file => formData.append('documents', file));

      const response = await fetch('/api/sessions/start', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to start session');

      const data = await response.json();
      sessionId     = data.sessionId;
      calibration   = data.calibration.level;

      thinkingWrapper.remove();

      // Update header
      headerCalibration.textContent = calibration;
      headerStatus.classList.remove('hidden');
      canvasSessionTitle.textContent = prompt;

      // Show AI's first diagnostic question
      appendMessage('assistant', data.diagnosticQuestion);

      // If tree already built (instant path), jump straight to split-screen
      if (data.nodes && data.nodes.length > 0) {
        nodes = data.nodes;
        canvas.render(nodes);
        updateStats();
        activateSplitScreen();
        appendMessage('assistant', "🎉 Your personalized learning tree has been built! Click on the first unlocked node on the right to start learning.");
      }

      // Reset
      selectedFiles = [];
      welcomeFilesList.innerHTML = '';
      loadNavigationHistory();

    } catch (err: any) {
      console.error(err);
      thinkingWrapper.remove();
      appendMessage('assistant', `Something went wrong starting your session: ${err.message}`);
    }
  }


  // ══════════════════════════════════════════════════
  // STAGE 2/3 — Chat sidebar: file attach
  // ══════════════════════════════════════════════════
  onboardingFileInput.addEventListener('change', (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    files.forEach(file => {
      if (selectedFiles.some(f => f.name === file.name)) return;
      selectedFiles.push(file);
      const tag = document.createElement('div');
      tag.className = 'uploaded-file-tag';
      tag.innerHTML = `📄 ${file.name.substring(0, 20)}${file.name.length > 20 ? '…' : ''} <span class="remove-file-btn" data-name="${file.name}">×</span>`;
      onboardingFilesList.appendChild(tag);
    });
    onboardingFileInput.value = '';
  });

  onboardingFilesList.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('remove-file-btn')) {
      selectedFiles = selectedFiles.filter(f => f.name !== target.dataset.name);
      target.parentElement?.remove();
    }
  });


  // ══════════════════════════════════════════════════
  // Node canvas click → open teaching thread
  // ══════════════════════════════════════════════════
  canvas.onNodeClick(async (node) => {
    if (node.status === 'locked') return;

    document.querySelectorAll('.svg-node-group').forEach(el => el.classList.remove('active'));
    document.getElementById(`node-group-${node.id}`)?.classList.add('active');

    activeNodeId = node.id;
    sidebarNodeTitle.textContent = node.title;
    sidebarNodeStatus.textContent = node.status.toUpperCase();
    sidebarNodeStatus.className = `node-badge ${node.status}`;
    exitNodeBtn.style.display = 'block';

    chatHistory.innerHTML = '';
    const thinkingWrapper = appendMessage('assistant', '<div class="thinking-dots"><span></span><span></span><span></span></div>', node.id);

    try {
      const chatResponse = await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/chat`);
      if (chatResponse.ok) {
        const history: Message[] = await chatResponse.json();
        if (history.length > 0) {
          thinkingWrapper.remove();
          history.forEach(msg => appendMessage(msg.sender, msg.content, node.id));
          return;
        }
      }

      const streamUrl = `/api/sessions/${sessionId}/nodes/${node.id}/teach`;
      const response = await fetch(streamUrl);
      if (!response.ok) throw new Error('Teaching agent failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body reader not available');

      const decoder = new TextDecoder('utf-8');
      let currentMsgWrapper: HTMLDivElement | null = thinkingWrapper;
      let streamedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;
        renderMessageBubble(currentMsgWrapper.querySelector('.message-bubble') as HTMLElement, streamedContent);
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }

    } catch (err) {
      console.error(err);
      thinkingWrapper.remove();
      appendMessage('assistant', 'Failed to load learning content. Please try clicking the node again.');
    }
  });

  exitNodeBtn.addEventListener('click', () => {
    activeNodeId = null;
    sidebarNodeTitle.textContent = 'Curriculum Diagnostic';
    sidebarNodeStatus.textContent = 'DIAGNOSIS';
    sidebarNodeStatus.className = 'node-badge diagnosis';
    exitNodeBtn.style.display = 'none';
    chatHistory.innerHTML = '';
    loadGlobalChat();
  });

  async function loadGlobalChat(): Promise<void> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          data.messages.forEach((msg: Message) => {
            if (!msg.node_id) appendMessage(msg.sender, msg.content);
          });
        }
      }
    } catch (err) {
      console.error('Error reloading global chat:', err);
    }
  }


  // ══════════════════════════════════════════════════
  // Send message in discovery / node context
  // ══════════════════════════════════════════════════
  sendChatBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  async function sendMessage(): Promise<void> {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    chatInput.style.height = 'auto';
    appendMessage('user', text, activeNodeId);
    const thinkingWrapper = appendMessage('assistant', '<div class="thinking-dots"><span></span><span></span><span></span></div>', activeNodeId);

    try {
      if (activeNodeId) {
        // ── Node teaching context ──
        const response = await fetch(`/api/sessions/${sessionId}/nodes/${activeNodeId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: text })
        });
        if (!response.ok) throw new Error('Failed to send message');

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          thinkingWrapper.remove();
          appendMessage('assistant', data.feedback, activeNodeId);

          if (data.nodesUpdated) {
            nodes = data.nodes;
            canvas.render(nodes);
            updateStats();
          }
          if (data.calibration) {
            calibration = data.calibration.level;
            headerCalibration.textContent = calibration;
          }
        } else {
          const reader = response.body?.getReader();
          if (!reader) throw new Error('Response body reader not available');
          const decoder = new TextDecoder('utf-8');
          let streamedContent = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            streamedContent += decoder.decode(value, { stream: true });
            renderMessageBubble(thinkingWrapper.querySelector('.message-bubble') as HTMLElement, streamedContent);
            chatHistory.scrollTop = chatHistory.scrollHeight;
          }
        }

      } else {
        // ── Diagnosis / discovery context ──
        const response = await fetch(`/api/sessions/${sessionId}/diagnose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        if (!response.ok) throw new Error('Diagnosis message failed');

        const data = await response.json();
        thinkingWrapper.remove();
        appendMessage('assistant', data.response);

        if (data.status === 'learning' || (data.nodes && data.nodes.length > 0)) {
          nodes = data.nodes;
          canvas.render(nodes);
          updateStats();
          activateSplitScreen();
          appendMessage('assistant', "🎉 Your personalized learning tree has been built! Click on the first unlocked node on the right to start learning.");
        }
      }
    } catch (err: any) {
      console.error(err);
      thinkingWrapper.remove();
      appendMessage('assistant', `Sorry, something went wrong: ${err.message}`);
    }
  }

  function updateStats(): void {
    const completedCount = nodes.filter(n => n.status === 'completed').length;
    canvasSessionStats.textContent = `${completedCount} of ${nodes.length} Nodes Completed`;

    // Constitution Section 7.2: Update Header Mastery Progress Ring SVG
    const masteryPath = document.getElementById('header-mastery-progress-path') as SVGPathElement;
    const masteryText = document.getElementById('header-mastery-text');
    const masteryWrapper = document.querySelector('.mastery-ring-wrapper');

    if (!nodes || nodes.length === 0) {
      if (masteryPath) masteryPath.setAttribute('stroke-dasharray', '0, 100');
      if (masteryText) masteryText.textContent = '0%';
      return;
    }

    const percent = Math.round((completedCount / nodes.length) * 100);
    if (masteryPath) masteryPath.setAttribute('stroke-dasharray', `${percent}, 100`);
    if (masteryText) masteryText.textContent = `${percent}%`;
    if (masteryWrapper) masteryWrapper.setAttribute('aria-label', `Mastery Rate ${percent}%`);
  }
});
