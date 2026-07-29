import { ConceptCanvas } from './canvas';
import { TaskSandbox } from './sandbox';
import { authManager } from './auth';
import { CurriculumNode, Message } from '../../types';

document.addEventListener('DOMContentLoaded', () => {
  // --- Auth & State ---
  let sessionId: string | null = null;
  let activeNodeId: string | null = null;
  let currentNodeOpenRequestId: number = 0;
  let calibration: string = 'Beginner';
  let nodes: CurriculumNode[] = [];
  let selectedFiles: File[] = [];

  authManager.initUI(() => {
    loadNavigationHistory();
  });
  authManager.checkSession();

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
  const toggleSidebarBtn  = document.getElementById('toggle-sidebar-btn') as HTMLButtonElement;

  const sidebarNodeTitle  = document.getElementById('sidebar-node-title') as HTMLElement;
  const sidebarNodeStatus = document.getElementById('sidebar-node-status') as HTMLElement;
  const exitNodeBtn       = document.getElementById('exit-node-btn') as HTMLButtonElement;
  const chatHistory       = document.getElementById('chat-history') as HTMLElement;
  const chatInput         = document.getElementById('chat-input') as HTMLTextAreaElement;
  const sendChatBtn       = document.getElementById('send-chat-btn') as HTMLButtonElement;

  // Attachment in chat bar
  const onboardingFileInput = document.getElementById('onboarding-file-input') as HTMLInputElement;
  const onboardingFilesList = document.getElementById('onboarding-files-list') as HTMLElement;

  // Canvas & Sandbox
  const canvasSessionTitle = document.getElementById('canvas-session-title') as HTMLElement;
  const canvasSessionStats = document.getElementById('canvas-session-stats') as HTMLElement;
  const canvas = new ConceptCanvas('concept-svg');
  (window as any).canvas = canvas;
  const taskSandbox = new TaskSandbox('task-sandbox-container');

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

  const welcomeAttachBtn  = document.getElementById('welcome-attach-btn') as HTMLButtonElement;
  welcomeAttachBtn?.addEventListener('click', () => {
    welcomeFileInput.click();
  });

  // ══════════════════════════════════════════════════
  // STAGE 0 — Left Navigation Bar & Greetings
  // ══════════════════════════════════════════════════
  const appLeftNav          = document.getElementById('app-left-nav') as HTMLElement;
  const sidebarToggleBtn    = document.getElementById('sidebar-toggle-btn') as HTMLButtonElement;
  const navNewSessionBtn    = document.getElementById('nav-new-session-btn') as HTMLButtonElement;
  const navSessionsGroup    = document.getElementById('nav-sessions-group') as HTMLElement;
  const navSessionsHeader   = document.getElementById('nav-sessions-header') as HTMLElement;
  const navSessionsList     = document.getElementById('nav-sessions-list') as HTMLElement;
  const navHistoryGroup     = document.getElementById('nav-history-group') as HTMLElement;
  const navHistoryHeader    = document.getElementById('nav-history-header') as HTMLElement;
  const navHistoryList      = document.getElementById('nav-history-list') as HTMLElement;

  const navLogoSection      = document.querySelector('.nav-logo-section') as HTMLElement;

  // Toggle Left Navigation Bar
  sidebarToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    appLeftNav.classList.toggle('collapsed');
  });

  navLogoSection?.addEventListener('click', () => {
    if (appLeftNav.classList.contains('collapsed')) {
      appLeftNav.classList.remove('collapsed');
    }
  });

  // Dynamic Single-Line Time-of-Day Greeting Generator
  function updateTimeOfDayGreeting(): void {
    const greetingTitle = document.getElementById('welcome-greeting-title');
    if (!greetingTitle) return;
    const hour = new Date().getHours();
    let timeGreeting = 'Good afternoon';
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }
    greetingTitle.textContent = timeGreeting;
  }

  // Initialize greeting on startup
  updateTimeOfDayGreeting();

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
    currentNodeOpenRequestId++;
    sessionId = null;
    activeNodeId = null;
    nodes = [];
    selectedFiles = [];

    canvas.render([]);
    welcomeInput.value = '';
    welcomeInput.style.height = 'auto';
    welcomeFilesList.innerHTML = '';
    onboardingFilesList.innerHTML = '';
    chatHistory.innerHTML = '';
    if (headerStatus) headerStatus.classList.add('hidden');
    if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = 'none';

    workspaceScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    updateTimeOfDayGreeting();
    welcomeInput.focus();
    loadNavigationHistory();
  }

  /** Helper to format strings into clean Sentence case */
  function toSentenceCase(str: string): string {
    if (!str) return '';
    const trimmed = str.trim();
    if (trimmed.length === 0) return '';
    const words = trimmed.split(/\s+/);
    return words.map((word, i) => {
      // Preserve uppercase acronyms like WAEC, AWS, AI, PDF, API, SQL, CSS, etc.
      if (/^[A-Z0-9]{2,5}$/.test(word)) return word;
      // Preserve tech names
      if (/^(Python|JavaScript|TypeScript|React|Next|Node|C\+\+|SQL|HTML|CSS|SQLite|Postgres)$/i.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      if (i === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    }).join(' ');
  }

  // ══════════════════════════════════════════════════
  // Context Menu Helper for Nav Items (Rename, Delete, Star)
  // ══════════════════════════════════════════════════
  let activeContextMenu: HTMLElement | null = null;

  function closeActiveContextMenu(): void {
    if (activeContextMenu) {
      activeContextMenu.remove();
      activeContextMenu = null;
      document.querySelectorAll('.nav-item-options-btn').forEach(btn => btn.classList.remove('menu-open'));
    }
  }

  window.addEventListener('click', () => closeActiveContextMenu());
  window.addEventListener('scroll', () => closeActiveContextMenu(), true);

  function createNavItemOptionsBtn(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'nav-item-options-btn';
    btn.title = 'Options';
    btn.setAttribute('aria-label', 'Options');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="5" r="1.5"/>
      <circle cx="12" cy="12" r="1.5"/>
      <circle cx="12" cy="19" r="1.5"/>
    </svg>`;
    return btn;
  }

  function showContextMenu(
    e: MouseEvent,
    targetBtn: HTMLElement,
    menuItems: Array<{ label: string; iconSvg: string; isDanger?: boolean; onClick: () => void }>
  ): void {
    e.stopPropagation();
    closeActiveContextMenu();

    targetBtn.classList.add('menu-open');
    const menu = document.createElement('div');
    menu.className = 'nav-context-menu';

    menuItems.forEach(mi => {
      const item = document.createElement('div');
      item.className = `nav-context-item ${mi.isDanger ? 'danger' : ''}`;
      item.innerHTML = `${mi.iconSvg} <span>${mi.label}</span>`;
      item.addEventListener('click', (ev) => {
        ev.stopPropagation();
        closeActiveContextMenu();
        mi.onClick();
      });
      menu.appendChild(item);
    });

    document.body.appendChild(menu);
    activeContextMenu = menu;

    const rect = targetBtn.getBoundingClientRect();
    let top = rect.bottom + 4;
    let left = rect.left - 110;
    if (left < 10) left = rect.right + 4;
    if (top + 90 > window.innerHeight) top = rect.top - 90;

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
  }

  // Fetch & Render Navigation History from backend
  async function loadNavigationHistory(): Promise<void> {
    try {
      const res = await fetch('/api/sessions', {
        headers: authManager.getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      const rawSessions = data.sessions || [];
      const sessions = rawSessions.map((s: any) => (s.session ? { ...s.session, nodes: s.nodes } : s));

      // Helper to build a session nav item with 3-dot options
      const buildSessionNavItem = (sess: any): HTMLElement => {
        const item = document.createElement('div');
        item.className = `nav-item ${sess.id === sessionId && !activeNodeId ? 'active' : ''}`;
        const displayTitle = toSentenceCase(sess.title || 'Untitled session');
        item.innerHTML = `<div class="nav-item-title-container"><div class="nav-item-title">${displayTitle}</div></div>`;
        
        item.addEventListener('click', () => {
          openSessionAndNode(sess.id, null);
        });

        const optBtn = createNavItemOptionsBtn();
        optBtn.addEventListener('click', (ev) => {
          showContextMenu(ev, optBtn, [
            {
              label: 'Rename',
              iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`,
              onClick: async () => {
                const newTitle = prompt('Rename learning session:', sess.title);
                if (newTitle && newTitle.trim() && newTitle.trim() !== sess.title) {
                  try {
                    const updateRes = await fetch(`/api/sessions/${sess.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: newTitle.trim() })
                    });
                    if (updateRes.ok) {
                      if (sess.id === sessionId && sidebarNodeTitle) {
                        sidebarNodeTitle.textContent = toSentenceCase(newTitle.trim());
                      }
                      loadNavigationHistory();
                    }
                  } catch (err) {
                    console.error('Error renaming session:', err);
                  }
                }
              }
            },
            {
              label: 'Delete',
              iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
              isDanger: true,
              onClick: async () => {
                if (confirm(`Delete "${displayTitle}"?`)) {
                  try {
                    const delRes = await fetch(`/api/sessions/${sess.id}`, { method: 'DELETE' });
                    if (delRes.ok) {
                      if (sess.id === sessionId) {
                        resetToWelcomeScreen();
                      } else {
                        loadNavigationHistory();
                      }
                    }
                  } catch (err) {
                    console.error('Error deleting session:', err);
                  }
                }
              }
            }
          ]);
        });

        item.appendChild(optBtn);
        return item;
      };

      // 1. Render Session section
      navSessionsList.innerHTML = '';
      if (sessions.length === 0) {
        navSessionsList.innerHTML = `<div class="nav-item-sub" style="padding: 6px 8px;">No sessions yet</div>`;
      } else {
        const visibleSessions = sessions.slice(0, 7);
        const remainingSessions = sessions.slice(7);

        visibleSessions.forEach((sess: any) => {
          navSessionsList.appendChild(buildSessionNavItem(sess));
        });

        if (remainingSessions.length > 0) {
          const moreContainer = document.createElement('div');
          moreContainer.className = 'nav-more-sessions-container';
          moreContainer.style.display = 'none';

          remainingSessions.forEach((sess: any) => {
            moreContainer.appendChild(buildSessionNavItem(sess));
          });

          navSessionsList.appendChild(moreContainer);

          const showMoreBtn = document.createElement('div');
          showMoreBtn.className = 'nav-more-toggle-btn';
          showMoreBtn.innerHTML = `<span>More</span>`;
          showMoreBtn.addEventListener('click', () => {
            const isHidden = moreContainer.style.display === 'none';
            moreContainer.style.display = isHidden ? 'block' : 'none';
            showMoreBtn.innerHTML = isHidden ? `<span>Less</span>` : `<span>More</span>`;
          });

          navSessionsList.appendChild(showMoreBtn);
        }
      }

      // 2. Render History section (Chronological node chats with Star + Delete)
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
        navHistoryList.innerHTML = `<div class="nav-item-sub" style="padding: 6px 8px;">No recent chats</div>`;
      } else {
        allNodeChats.slice(0, 20).forEach(chat => {
          const item = document.createElement('div');
          item.className = `nav-item ${chat.sessionId === sessionId && chat.node.id === activeNodeId ? 'active' : ''}`;
          const isStarred = !!chat.node.is_starred;
          const starIcon = isStarred ? `<span class="nav-item-star-icon" title="Starred">★</span>` : '';
          const nodeTitle = toSentenceCase(chat.node.title);
          item.innerHTML = `<div class="nav-item-title-container">${starIcon}<div class="nav-item-title">${nodeTitle}</div></div>`;

          item.addEventListener('click', () => {
            openSessionAndNode(chat.sessionId, chat.node.id);
          });

          const optBtn = createNavItemOptionsBtn();
          optBtn.addEventListener('click', (ev) => {
            showContextMenu(ev, optBtn, [
              {
                label: isStarred ? 'Unstar' : 'Star',
                iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="${isStarred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
                onClick: async () => {
                  try {
                    const starRes = await fetch(`/api/sessions/${chat.sessionId}/nodes/${chat.node.id}/star`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ isStarred: !isStarred })
                    });
                    if (starRes.ok) {
                      loadNavigationHistory();
                    }
                  } catch (err) {
                    console.error('Error starring history item:', err);
                  }
                }
              },
              {
                label: 'Reset Thread',
                iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`,
                onClick: async () => {
                  if (confirm(`Reset conversation thread for "${nodeTitle}"?\n\nThis will clear chat history for this concept node so you can re-learn it from scratch.`)) {
                    try {
                      const resetRes = await fetch(`/api/sessions/${chat.sessionId}/nodes/${chat.node.id}/reset`, { method: 'POST' });
                      if (resetRes.ok) {
                        if (chat.sessionId === sessionId && chat.node.id === activeNodeId) {
                          chatHistory.innerHTML = '';
                        }
                        loadNavigationHistory();
                      }
                    } catch (err) {
                      console.error('Error resetting history chat:', err);
                    }
                  }
                }
              }
            ]);
          });

          item.appendChild(optBtn);
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

      if (headerCalibration) headerCalibration.textContent = calibration;
      if (headerStatus) headerStatus.classList.remove('hidden');
      if (canvasSessionTitle) canvasSessionTitle.textContent = toSentenceCase(data.session.title);

      canvas.render(nodes);
      updateStats();

      enterDiscoveryMode();
      activateSplitScreen();

      // Update active nav item styling
      document.querySelectorAll('#nav-sessions-list .nav-item, #nav-history-list .nav-item').forEach(el => el.classList.remove('active'));

      if (nodeId) {
        const targetNode = nodes.find(n => String(n.id) === String(nodeId));
        if (targetNode) {
          const requestId = ++currentNodeOpenRequestId;
          activeNodeId = targetNode.id;
          if (targetNode.status !== 'completed') {
            targetNode.status = 'in_progress';
          }
          await fetch(`/api/sessions/${sessId}/nodes/${targetNode.id}/open`, { method: 'POST' }).catch(() => {});
          if (sidebarNodeTitle) sidebarNodeTitle.textContent = toSentenceCase(targetNode.title);
          if (sidebarNodeStatus) {
            sidebarNodeStatus.textContent = targetNode.status.toUpperCase();
            sidebarNodeStatus.className = `node-badge ${targetNode.status}`;
          }
          if (exitNodeBtn) exitNodeBtn.style.display = 'block';

          document.querySelectorAll('.svg-node-group').forEach(el => el.classList.remove('active'));
          document.getElementById(`node-group-${targetNode.id}`)?.classList.add('active');

          chatHistory.innerHTML = '';
          const chatRes = await fetch(`/api/sessions/${sessId}/nodes/${targetNode.id}/chat`);
          if (requestId !== currentNodeOpenRequestId || activeNodeId !== targetNode.id) return;

          if (chatRes.ok) {
            const historyMsgs: Message[] = await chatRes.json();
            if (requestId !== currentNodeOpenRequestId || activeNodeId !== targetNode.id) return;

            historyMsgs.forEach(msg => appendMessage(msg.sender, msg.content, targetNode.id));
            if (historyMsgs.some(m => m.sender === 'assistant')) {
              appendTaskLauncherCard(targetNode);
            }
          }
        }
      } else {
        activeNodeId = null;
        if (sidebarNodeTitle) sidebarNodeTitle.textContent = toSentenceCase(data.session.title || 'Learning Session');
        if (sidebarNodeStatus) {
          sidebarNodeStatus.textContent = 'DIAGNOSIS';
        }
        if (exitNodeBtn) exitNodeBtn.style.display = 'none';
        chatHistory.innerHTML = '';
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.forEach((msg: any) => {
            appendMessage(msg.sender === 'user' ? 'user' : 'assistant', msg.content);
          });
        }
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
    if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = 'flex';
  }

  /** Helper to compute balanced ~45% split width per UI Constitution */
  function getBalancedSplitWidth(): number {
    const navLeft = appLeftNav ? appLeftNav.getBoundingClientRect().width : 0;
    const availableWidth = window.innerWidth - navLeft;
    return Math.max(360, Math.min(Math.round(availableWidth * 0.45), 750));
  }

  /** Stage 2 → Stage 3: expand chat+canvas split view */
  function activateSplitScreen(): void {
    workspaceScreen.classList.remove('discovery-mode');
    if (toggleSidebarBtn) toggleSidebarBtn.classList.remove('hidden');
    chatInput.placeholder = 'Type your response...';
    if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = 'flex';
    chatSidebar.style.width = `${getBalancedSplitWidth()}px`;
  }

  type WorkspaceViewMode = 'split' | 'canvas-only' | 'chat-only';
  let currentViewMode: WorkspaceViewMode = 'split';
  let isResizing = false;

  const headerSplitToggleBtn = document.getElementById('header-split-toggle-btn') as HTMLButtonElement;
  const canvasFullscreenBtn  = document.getElementById('canvas-fullscreen-btn') as HTMLButtonElement;

  // Initialize top-right split toggle as hidden on welcome screen
  if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = 'none';

  function setWorkspaceViewMode(mode: WorkspaceViewMode): void {
    currentViewMode = mode;
    chatSidebar.classList.remove('collapsed');
    canvasPanel.classList.remove('collapsed');
    workspaceScreen.classList.remove('chat-only-mode');
    workspaceScreen.classList.remove('canvas-only-mode');
    panelResizer.style.display = 'block';

    if (mode === 'canvas-only') {
      chatSidebar.classList.add('collapsed');
      workspaceScreen.classList.add('canvas-only-mode');
      panelResizer.style.display = 'none';
      if (headerSplitToggleBtn) headerSplitToggleBtn.classList.remove('active');
    } else if (mode === 'chat-only') {
      canvasPanel.classList.add('collapsed');
      workspaceScreen.classList.add('chat-only-mode');
      panelResizer.style.display = 'none';
      if (headerSplitToggleBtn) headerSplitToggleBtn.classList.remove('active');
    } else {
      if (headerSplitToggleBtn) headerSplitToggleBtn.classList.add('active');
    }
  }

  headerSplitToggleBtn?.addEventListener('click', () => {
    setWorkspaceViewMode(currentViewMode === 'chat-only' ? 'split' : 'chat-only');
  });

  canvasFullscreenBtn?.addEventListener('click', () => {
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

  // Double-click resizer to reset width to balanced ~45% split ratio
  panelResizer?.addEventListener('dblclick', (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.gutter-toggle-btn')) return;
    chatSidebar.style.width = `${getBalancedSplitWidth()}px`;
    if (currentViewMode === 'canvas-only') {
      setWorkspaceViewMode('split');
    }
  });

  // Pointer Capture Dragging (Eliminates mouse drops & slippery drag lag)
  let dragStartLeftOffset = 0;

  panelResizer?.addEventListener('pointerdown', (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('.gutter-toggle-btn')) return;
    isResizing = true;
    try {
      panelResizer.setPointerCapture(e.pointerId);
    } catch (_) {}

    // Measure left boundary offset of chatSidebar (accounts for left navigation rail)
    const sidebarRect = chatSidebar.getBoundingClientRect();
    dragStartLeftOffset = sidebarRect.left;

    panelResizer.classList.add('resizing');
    chatSidebar.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  panelResizer?.addEventListener('pointermove', (e: PointerEvent) => {
    if (!isResizing) return;
    const mouseWidth = e.clientX - dragStartLeftOffset;
    const snapThreshold = 180;
    const minWidth = 280;
    const availableWidth = window.innerWidth - dragStartLeftOffset;
    const maxWidth = Math.min(availableWidth - 300, availableWidth * 0.75);

    if (mouseWidth < snapThreshold) {
      // Snap to collapsed when dragged under snap threshold
      setWorkspaceViewMode('canvas-only');
    } else {
      if (currentViewMode === 'canvas-only') {
        setWorkspaceViewMode('split');
      }
      const clampedWidth = Math.max(minWidth, Math.min(mouseWidth, maxWidth));
      chatSidebar.style.width = `${clampedWidth}px`;
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

    const codeBlocks: string[] = [];
    let formatted = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
      const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const langLabel = (lang || 'code').toUpperCase();
      const blockHtml = `<pre><div class="code-block-header"><span>${langLabel}</span></div><code>${escapedCode}</code></pre>`;
      codeBlocks.push(blockHtml);
      return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
    });

    formatted = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[blur\](.*?)\[\/blur\]/gi, '<span class="active-recall-blur" title="Click or hover to reveal term" role="button" tabindex="0">$1</span>')
      .replace(/\[\[(.*?)\]\]/g, '<span class="active-recall-blur" title="Click or hover to reveal term" role="button" tabindex="0">$1</span>')
      .replace(/\[(\d+)\]/g, '<span class="citation-chip" title="Citation Source [$1]">$1</span>')
      .replace(/\n/g, '<br>');

    codeBlocks.forEach((block, index) => {
      formatted = formatted.replace(`___CODE_BLOCK_${index}___`, block);
    });

    return formatted;
  }

  // ══════════════════════════════════════════════════
  // Frontend Typewriter Progressive Reveal Animation
  // ══════════════════════════════════════════════════
  interface ActiveTypewriter {
    bubble: HTMLElement;
    fullText: string;
    finish: () => void;
    cancel: () => void;
  }

  let activeTypewriter: ActiveTypewriter | null = null;

  function animateTextReveal(
    bubble: HTMLElement,
    fullText: string,
    requestId?: number,
    targetNodeId?: string | null
  ): Promise<void> {
    return new Promise((resolve) => {
      if (activeTypewriter) {
        activeTypewriter.finish();
      }

      if (!fullText || !bubble) {
        resolve();
        return;
      }

      let timerId: any = null;
      let charIndex = 0;
      const totalLength = fullText.length;
      let isCompleted = false;

      // Calculate reveal pacing proportionally to response length (~240 chars / sec target)
      const speedMs = 18;
      const targetCharsPerSec = 240;
      const targetTotalMs = Math.min(7000, Math.max(350, (totalLength / targetCharsPerSec) * 1000));
      const totalTicks = Math.max(1, Math.round(targetTotalMs / speedMs));
      const charsPerTick = Math.max(1, Math.ceil(totalLength / totalTicks));

      const finish = () => {
        if (isCompleted) return;
        isCompleted = true;
        if (timerId) clearInterval(timerId);
        renderMessageBubble(bubble, fullText, false);
        if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
        if (activeTypewriter?.bubble === bubble) {
          activeTypewriter = null;
        }
        resolve();
      };

      const cancel = () => {
        if (isCompleted) return;
        isCompleted = true;
        if (timerId) clearInterval(timerId);
        renderMessageBubble(bubble, fullText, false);
        if (activeTypewriter?.bubble === bubble) {
          activeTypewriter = null;
        }
        resolve();
      };

      activeTypewriter = { bubble, fullText, finish, cancel };

      timerId = setInterval(() => {
        if (requestId !== undefined && requestId !== currentNodeOpenRequestId) {
          cancel();
          return;
        }
        if (targetNodeId !== undefined && targetNodeId !== activeNodeId) {
          cancel();
          return;
        }

        charIndex += charsPerTick;

        // Advance to nearest word boundary so words complete smoothly without slicing mid-word
        if (charIndex < totalLength) {
          while (charIndex < totalLength && !/\s|[.,!?;:]/.test(fullText[charIndex])) {
            charIndex++;
          }
        }

        if (charIndex >= totalLength) {
          finish();
        } else {
          const partialText = fullText.slice(0, charIndex);
          renderMessageBubble(bubble, partialText, true);
          if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
        }
      }, speedMs);
    });
  }

  // Active Recall Mask Click Handler
  chatHistory?.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target && target.classList.contains('active-recall-blur')) {
      target.classList.toggle('revealed');
    }
  });

  function renderMessageBubble(bubble: HTMLElement, content: string, isAnimating: boolean = false): void {
    const cursorHtml = isAnimating ? '<span class="typing-cursor"></span>' : '';
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
          <p>${formatMarkdown(questionText)}${cursorHtml}</p>
        </div>`;
    } else {
      bubble.innerHTML = `<p>${formatMarkdown(content)}${cursorHtml}</p>`;
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
  welcomeFileInput?.addEventListener('change', (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    files.forEach(file => {
      if (selectedFiles.some(f => f.name === file.name)) return;
      selectedFiles.push(file);
      const tag = document.createElement('div');
      tag.className = 'uploaded-file-tag';
      tag.innerHTML = `📄 ${file.name.substring(0, 20)}${file.name.length > 20 ? '…' : ''} <span class="remove-file-btn" data-name="${file.name}">×</span>`;
      if (welcomeFilesList) welcomeFilesList.appendChild(tag);
    });
    if (welcomeFileInput) welcomeFileInput.value = '';
  });

  welcomeFilesList?.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('remove-file-btn')) {
      selectedFiles = selectedFiles.filter(f => f.name !== target.dataset.name);
      target.parentElement?.remove();
    }
  });

  // Suggestion chips
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt || chip.getAttribute('data-prompt') || chip.textContent?.trim() || '';
      if (prompt && welcomeInput) {
        welcomeInput.value = prompt;
        welcomeInput.style.height = 'auto';
        welcomeInput.style.height = `${Math.min(welcomeInput.scrollHeight, 160)}px`;
        startSession();
      }
    });
  });

  // Enter key on welcome input (Shift+Enter inserts newline)
  welcomeInput?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startSession();
    }
  });

  // Active Stream Cleanup Guard
  let activeStreamReader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  async function readSseStream(
    url: string,
    options: RequestInit,
    onEvent: (event: string, data: any) => void
  ): Promise<void> {
    if (activeStreamReader) {
      try { activeStreamReader.cancel(); } catch (_) {}
      activeStreamReader = null;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...authManager.getAuthHeaders(),
        'Accept': 'text/event-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`Stream request failed with status ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body reader unavailable');
    activeStreamReader = reader;

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          if (!block.trim()) continue;
          let eventName = 'message';
          let eventData = '';

          const lines = block.split('\n');
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.substring(6).trim();
            } else if (line.startsWith('data:')) {
              eventData += line.substring(5).trim();
            }
          }

          if (eventData) {
            try {
              const parsed = JSON.parse(eventData);
              onEvent(eventName, parsed);
            } catch (_) {}
          }
        }
      }
    } finally {
      if (activeStreamReader === reader) {
        activeStreamReader = null;
      }
    }
  }

  welcomeSendBtn?.addEventListener('click', startSession);

  async function startSession(): Promise<void> {
    currentNodeOpenRequestId++;
    const prompt = welcomeInput.value.trim();
    if (!prompt) { welcomeInput.focus(); return; }

    // Clear canvas from previous session immediately
    nodes = [];
    activeNodeId = null;
    canvas.render([]);

    // Move to discovery mode & open split screen immediately
    enterDiscoveryMode();
    activateSplitScreen();
    canvas.showThinking('IntentAgent', 'Initializing intake & intent classification...');

    appendMessage('user', prompt);
    const thinkingWrapper = appendMessage('assistant', '<div class="thinking-dots"><span></span><span></span><span></span></div>');

    try {
      const formData = new FormData();
      formData.append('initial_prompt', prompt);
      selectedFiles.forEach(file => formData.append('documents', file));

      let finalData: any = null;

      await readSseStream('/api/sessions/start?stream=true', {
        method: 'POST',
        body: formData,
      }, (event, data) => {
        if (event === 'agent_progress') {
          if (data.status === 'error') {
            canvas.showThinkingError(data.agent, data.thought || 'Stage delayed — retrying...');
          } else {
            canvas.showThinking(data.agent, data.thought || 'Processing stage...');
          }

          if (data.payload?.nodes) {
            nodes = data.payload.nodes;
            canvas.render(nodes, true);
            updateStats();
          }
        } else if (event === 'pipeline_complete') {
          finalData = data;
        }
      });

      if (!finalData) throw new Error('Session creation stream ended unexpectedly.');

      sessionId     = finalData.sessionId;
      localStorage.setItem('klaivo_current_session_id', sessionId);
      calibration   = finalData.calibration?.level || 'intermediate';

      thinkingWrapper.remove();

      if (headerCalibration) headerCalibration.textContent = calibration;
      if (headerStatus) headerStatus.classList.remove('hidden');
      if (canvasSessionTitle) canvasSessionTitle.textContent = prompt;

      const diagQuestWrapper = appendMessage('assistant', '');
      await animateTextReveal(
        diagQuestWrapper.querySelector('.message-bubble') as HTMLElement,
        finalData.diagnosticQuestion
      );

      if (finalData.status === 'generation_failed') {
        canvas.showThinkingError('CurriculumVerifier', finalData.error || 'Curriculum generation temporarily unavailable');
        appendMessage('assistant', `⚠️ **Generation Delayed**: ${finalData.response || finalData.error || 'Curriculum generation is temporarily unavailable — please try again shortly.'}`);
      } else if (finalData.nodes && finalData.nodes.length > 0) {
        nodes = finalData.nodes;
        canvas.render(nodes, true);
        updateStats();
        canvas.hideThinking('✓ Curriculum Verified against Domain Rubrics');
        appendMessage('assistant', "🎉 Your personalized learning tree has been built! Click on the first unlocked node on the right to start learning.");
      } else {
        canvas.hideThinking();
      }

      selectedFiles = [];
      welcomeFilesList.innerHTML = '';
      loadNavigationHistory();

    } catch (err: any) {
      console.error(err);
      thinkingWrapper.remove();
      canvas.showThinkingError('Orchestrator', `Session intake error: ${err.message}`);
      appendMessage('assistant', `Something went wrong starting your session: ${err.message}`);
    }
  }


  // ══════════════════════════════════════════════════
  // STAGE 2/3 — Chat sidebar: file attach
  // ══════════════════════════════════════════════════
  onboardingFileInput?.addEventListener('change', (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    files.forEach(file => {
      if (selectedFiles.some(f => f.name === file.name)) return;
      selectedFiles.push(file);
      const tag = document.createElement('div');
      tag.className = 'uploaded-file-tag';
      tag.innerHTML = `📄 ${file.name.substring(0, 20)}${file.name.length > 20 ? '…' : ''} <span class="remove-file-btn" data-name="${file.name}">×</span>`;
      if (onboardingFilesList) onboardingFilesList.appendChild(tag);
    });
    if (onboardingFileInput) onboardingFileInput.value = '';
  });

  onboardingFilesList?.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('remove-file-btn')) {
      selectedFiles = selectedFiles.filter(f => f.name !== target.dataset.name);
      target.parentElement?.remove();
    }
  });


  // ══════════════════════════════════════════════════
  // Node canvas click → open teaching thread & task challenges
  // ══════════════════════════════════════════════════
  canvas.onNodeClick(async (node) => {
    const requestId = ++currentNodeOpenRequestId;

    document.querySelectorAll('.svg-node-group').forEach(el => el.classList.remove('active'));
    document.getElementById(`node-group-${node.id}`)?.classList.add('active');

    activeNodeId = node.id;
    if (node.status !== 'completed') {
      node.status = 'in_progress';
    }
    await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/open`, { method: 'POST' }).catch(() => {});
    await loadNavigationHistory();

    if (sidebarNodeTitle) sidebarNodeTitle.textContent = node.title;
    if (sidebarNodeStatus) {
      sidebarNodeStatus.textContent = 'IN_PROGRESS';
      sidebarNodeStatus.className = `node-badge in_progress`;
    }
    if (exitNodeBtn) exitNodeBtn.style.display = 'block';

    chatHistory.innerHTML = '';
    const thinkingWrapper = appendMessage('assistant', '<div class="thinking-dots"><span></span><span></span><span></span></div>', node.id);

    try {
      const chatResponse = await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/chat`);
      if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;

      if (chatResponse.ok) {
        const history: Message[] = await chatResponse.json();
        if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;

        if (history.length > 0) {
          thinkingWrapper.remove();
          history.forEach(msg => appendMessage(msg.sender, msg.content, node.id));
          if (history.some(m => m.sender === 'assistant')) {
            appendTaskLauncherCard(node);
          }
          return;
        }
      }

      const streamUrl = `/api/sessions/${sessionId}/nodes/${node.id}/teach`;
      const response = await fetch(streamUrl);
      if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;
      if (!response.ok) throw new Error('Teaching agent failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body reader not available');

      const decoder = new TextDecoder('utf-8');
      let currentMsgWrapper: HTMLDivElement | null = thinkingWrapper;
      let streamedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) {
          try { reader.cancel(); } catch (_) {}
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;
      }

      if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;

      // Progressive typewriter reveal animation for explanation text
      await animateTextReveal(
        currentMsgWrapper.querySelector('.message-bubble') as HTMLElement,
        streamedContent,
        requestId,
        node.id
      );

      if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;

      // Append interactive Task Challenge launcher card ONLY AFTER explanation typewriter reveal finishes
      appendTaskLauncherCard(node);

    } catch (err) {
      if (requestId !== currentNodeOpenRequestId || activeNodeId !== node.id) return;
      console.error(err);
      thinkingWrapper.remove();
      appendMessage('assistant', 'Failed to load learning content. Please try clicking the node again.');
    }
  });

  function appendTaskLauncherCard(node: CurriculumNode): void {
    // Deduplication check: remove any existing challenge card for this node before appending a new one
    const existingCards = chatHistory.querySelectorAll('.task-launcher-card');
    existingCards.forEach(card => {
      const wrapper = card.closest('.message-wrapper');
      if (wrapper && (wrapper as HTMLElement).dataset.nodeId === node.id) {
        wrapper.remove();
      }
    });

    const launcherWrapper = document.createElement('div');
    launcherWrapper.className = 'message-wrapper assistant';
    launcherWrapper.dataset.nodeId = node.id;
    launcherWrapper.innerHTML = `
      <div class="message-bubble">
        <div class="task-launcher-card" style="padding: 12px; background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; margin-top: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div>
              <strong style="font-size: 13px; color: #60a5fa;">🎯 Practical Task Challenge</strong>
              <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 2px;">Test your understanding on "${node.title}" with runtime evaluation.</div>
            </div>
            <button id="launch-task-btn-${node.id}" style="padding: 6px 12px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer;">
              Launch Challenge
            </button>
          </div>
        </div>
      </div>
    `;
    chatHistory.appendChild(launcherWrapper);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    document.getElementById(`launch-task-btn-${node.id}`)?.addEventListener('click', async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/task-simulation`, { method: 'POST' });
        if (!res.ok) return;
        const { task } = await res.json();

        taskSandbox.render(task, async (submission: string) => {
          const evalRes = await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/evaluate-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submission, taskSpec: task }),
          });

          if (evalRes.ok) {
            const data = await evalRes.json();
            taskSandbox.showFeedback(
              data.evaluation.score,
              data.evaluation.passed,
              data.evaluation.feedback,
              data.evaluation.detectedMisconceptions
            );

            if (data.nodes) {
              nodes = data.nodes;
              canvas.render(nodes);
              updateStats();
            }
          }
        });
      } catch (err) {
        console.error('Error launching task simulation:', err);
      }
    });
  }

  exitNodeBtn?.addEventListener('click', () => {
    currentNodeOpenRequestId++;
    activeNodeId = null;
    if (sidebarNodeTitle) sidebarNodeTitle.textContent = 'Learning Session';
    if (sidebarNodeStatus) {
      sidebarNodeStatus.textContent = 'DIAGNOSIS';
    }
    if (exitNodeBtn) exitNodeBtn.style.display = 'none';
    if (chatHistory) chatHistory.innerHTML = '';
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
  sendChatBtn?.addEventListener('click', sendMessage);
  chatInput?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  async function sendMessage(): Promise<void> {
    const text = chatInput ? chatInput.value.trim() : '';
    if (!text) return;

    if (chatInput) {
      chatInput.value = '';
      chatInput.style.height = 'auto';
    }

    appendMessage('user', text, activeNodeId);
    const thinkingWrapper = appendMessage('assistant', '<div class="thinking-dots"><span></span><span></span><span></span></div>', activeNodeId);

    try {
      if (activeNodeId) {
        if (!sessionId) throw new Error('Session ID is missing');

        // ── Node teaching context ──
        const response = await fetch(`/api/sessions/${sessionId}/nodes/${activeNodeId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: text, text: text, content: text, message: text })
        });
        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.error || errBody.message || 'Failed to send node message');
        }

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          thinkingWrapper.remove();
          const replyText = data.feedback || data.response || data.content || 'Response received.';
          const replyWrapper = appendMessage('assistant', '', activeNodeId);
          await animateTextReveal(
            replyWrapper.querySelector('.message-bubble') as HTMLElement,
            replyText,
            currentNodeOpenRequestId,
            activeNodeId
          );

          if (data.nodesUpdated && data.nodes) {
            nodes = data.nodes;
            canvas.render(nodes);
            updateStats();
          }
          if (data.calibration && headerCalibration) {
            calibration = data.calibration.level || data.calibration;
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
          }
          thinkingWrapper.remove();
          const streamReplyWrapper = appendMessage('assistant', '', activeNodeId);
          await animateTextReveal(
            streamReplyWrapper.querySelector('.message-bubble') as HTMLElement,
            streamedContent,
            currentNodeOpenRequestId,
            activeNodeId
          );
        }

      } else {
        // ── Diagnosis / discovery context with real SSE streaming ──
        activateSplitScreen();
        if (nodes.length === 0) {
          canvas.showThinking('DiagnosisAgent', 'Processing your response...');
        }

        let finalData: any = null;

        await readSseStream(`/api/sessions/${sessionId}/diagnose?stream=true`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        }, (event, data) => {
          if (event === 'agent_progress') {
            if (data.status === 'error') {
              canvas.showThinkingError(data.agent, data.thought || 'Stage delayed — retrying...');
            } else {
              canvas.showThinking(data.agent, data.thought || 'Processing stage...');
            }

            if (data.payload?.nodes) {
              nodes = data.payload.nodes;
              canvas.render(nodes, true);
              updateStats();
            }
          } else if (event === 'pipeline_complete') {
            finalData = data;
          }
        });

        if (!finalData) throw new Error('Diagnosis stream ended unexpectedly.');

        thinkingWrapper.remove();
        const diagReplyWrapper = appendMessage('assistant', '');
        await animateTextReveal(
          diagReplyWrapper.querySelector('.message-bubble') as HTMLElement,
          finalData.response
        );

        if (finalData.title) {
          if (canvasSessionTitle) canvasSessionTitle.textContent = finalData.title;
          loadNavigationHistory();
        }

        if (finalData.status === 'generation_failed') {
          canvas.showThinkingError('CurriculumVerifier', finalData.error || 'Curriculum generation temporarily unavailable');
          appendMessage('assistant', `⚠️ **Generation Delayed**: ${finalData.response || finalData.error || 'Curriculum generation is temporarily unavailable — please try again shortly.'}`);
        } else if (finalData.status === 'learning' || (finalData.nodes && finalData.nodes.length > 0)) {
          nodes = finalData.nodes;
          canvas.render(nodes, true);
          updateStats();
          canvas.hideThinking('✓ Curriculum Verified against Domain Rubrics');
          appendMessage('assistant', "🎉 Your personalized learning tree has been built! Click on the first unlocked node on the right to start learning.");
        } else {
          canvas.hideThinking();
        }
      }
    } catch (err: any) {
      console.error(err);
      thinkingWrapper.remove();
      canvas.showThinkingError('Orchestrator', `Turn error: ${err.message}`);
      appendMessage('assistant', `Sorry, something went wrong: ${err.message}`);
    }
  }

  function updateStats(): void {
    const completedCount = nodes.filter(n => n.status === 'completed').length;
    if (canvasSessionStats) {
      canvasSessionStats.textContent = `${completedCount} of ${nodes.length} Nodes Completed`;
    }

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
