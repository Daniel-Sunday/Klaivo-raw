import { ConceptCanvas } from './canvas';
import { CurriculumNode, Message } from '../../types';

document.addEventListener('DOMContentLoaded', () => {
  // --- State Variables ---
  let sessionId: string | null = null;
  let activeNodeId: string | null = null;
  let calibration: string = 'Beginner';
  let nodes: CurriculumNode[] = [];
  let selectedFiles: File[] = [];
  
  // --- UI Elements ---
  const landingScreen = document.getElementById('landing-screen') as HTMLElement;
  const workspaceScreen = document.getElementById('workspace-screen') as HTMLElement;
  const headerStatus = document.getElementById('header-status') as HTMLElement;
  const headerCalibration = document.getElementById('header-calibration') as HTMLElement;
  const progressOverlay = document.getElementById('progress-overlay') as HTMLElement;
  const progressText = document.getElementById('progress-text') as HTMLElement;
  
  // Onboarding Screen
  const initialPromptTextarea = document.getElementById('initial-prompt') as HTMLTextAreaElement;
  const onboardingFileInput = document.getElementById('onboarding-file-input') as HTMLInputElement;
  const onboardingFilesList = document.getElementById('onboarding-files-list') as HTMLElement;
  const startSessionBtn = document.getElementById('start-session-btn') as HTMLButtonElement;
  
  // Workspace Sidebar
  const sidebarNodeTitle = document.getElementById('sidebar-node-title') as HTMLElement;
  const sidebarNodeStatus = document.getElementById('sidebar-node-status') as HTMLElement;
  const exitNodeBtn = document.getElementById('exit-node-btn') as HTMLButtonElement;
  const chatHistory = document.getElementById('chat-history') as HTMLElement;
  const chatInput = document.getElementById('chat-input') as HTMLInputElement;
  const sendChatBtn = document.getElementById('send-chat-btn') as HTMLButtonElement;
  
  // Workspace Canvas
  const canvasSessionTitle = document.getElementById('canvas-session-title') as HTMLElement;
  const canvasSessionStats = document.getElementById('canvas-session-stats') as HTMLElement;
  
  // Initialize SVG Canvas
  const canvas = new ConceptCanvas('concept-svg');

  // --- Utility Functions ---
  function showLoader(text: string): void {
    progressText.textContent = text;
    progressOverlay.classList.remove('hidden');
  }

  function hideLoader(): void {
    progressOverlay.classList.add('hidden');
  }

  function formatMarkdown(text: string): string {
    if (!text) return '';
    // Basic Markdown parser for HTML display
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function renderMessageBubble(bubble: HTMLElement, content: string): void {
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

  // --- Onboarding / Start Flow ---
  onboardingFileInput.addEventListener('change', (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    files.forEach(file => {
      if (selectedFiles.some(f => f.name === file.name)) return;
      selectedFiles.push(file);
      
      const tag = document.createElement('div');
      tag.className = 'uploaded-file-tag';
      tag.innerHTML = `📄 ${file.name.substring(0, 15)}... <span class="remove-file-btn" data-name="${file.name}">×</span>`;
      onboardingFilesList.appendChild(tag);
    });
    onboardingFileInput.value = ''; // Reset input
  });

  onboardingFilesList.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('remove-file-btn')) {
      const fileName = target.dataset.name;
      selectedFiles = selectedFiles.filter(f => f.name !== fileName);
      target.parentElement?.remove();
    }
  });

  startSessionBtn.addEventListener('click', async () => {
    const prompt = initialPromptTextarea.value.trim();
    if (!prompt) {
      alert('Please enter what you want to learn first!');
      return;
    }

    showLoader('Starting your learning session...');
    
    try {
      const formData = new FormData();
      formData.append('initial_prompt', prompt);
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });

      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to start session');
      
      const data = await response.json();
      sessionId = data.sessionId;
      calibration = data.calibration.level;
      
      // Update UI Header
      headerCalibration.textContent = calibration;
      headerStatus.classList.remove('hidden');
      canvasSessionTitle.textContent = prompt;
      
      // Transition screen
      landingScreen.classList.add('hidden');
      workspaceScreen.classList.remove('hidden');
      
      // Clear Chat panel and add initial diagnostic prompt
      chatHistory.innerHTML = '';
      appendMessage('assistant', data.diagnosticQuestion);
      
      // Check if curriculum generated (for stub/instant paths) or if we need context
      if (data.nodes && data.nodes.length > 0) {
        nodes = data.nodes;
        canvas.render(nodes);
        updateStats();
      }
      
    } catch (err: any) {
      console.error(err);
      alert('Error initializing session: ' + err.message);
    } finally {
      hideLoader();
    }
  });

  // --- Node Canvas Clicks ---
  canvas.onNodeClick(async (node) => {
    if (node.status === 'locked') return;
    
    // Clear active state of other nodes in SVG
    document.querySelectorAll('.svg-node-group').forEach(el => el.classList.remove('active'));
    document.getElementById(`node-group-${node.id}`)?.classList.add('active');
    
    activeNodeId = node.id;
    
    // Update Chat sidebar header
    sidebarNodeTitle.textContent = node.title;
    sidebarNodeStatus.textContent = node.status.toUpperCase();
    sidebarNodeStatus.className = `node-badge ${node.status}`;
    exitNodeBtn.style.display = 'block';
    
    // Clear chat display for node specific thread
    chatHistory.innerHTML = '';
    
    showLoader(`Opening node: ${node.title}...`);
    
    try {
      // 1. Fetch chat history for this specific node
      const chatResponse = await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/chat`);
      if (chatResponse.ok) {
        const history: Message[] = await chatResponse.json();
        if (history.length > 0) {
          history.forEach(msg => {
            appendMessage(msg.sender, msg.content, node.id);
          });
          hideLoader();
          return;
        }
      }
      
      // 2. If no history, stream new teaching explanation from backend
      appendMessage('assistant', `Loading explanation for **${node.title}**...`);
      hideLoader();
      
      // Set up SSE/streaming for the teaching node explanation
      const streamUrl = `/api/sessions/${sessionId}/nodes/${node.id}/teach`;
      const response = await fetch(streamUrl);
      if (!response.ok) throw new Error('Teaching agent failed');
      
      // Read chunks from response reader for typing animation effect
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body reader not available');
      
      const decoder = new TextDecoder('utf-8');
      let currentMsgWrapper: HTMLDivElement | null = null;
      let streamedContent = '';
      
      chatHistory.lastElementChild?.remove(); // Remove the "Loading..." placeholder
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;
        
        // Render or update message
        if (!currentMsgWrapper) {
          currentMsgWrapper = appendMessage('assistant', streamedContent, node.id);
        } else {
          renderMessageBubble(currentMsgWrapper.querySelector('.message-bubble') as HTMLElement, streamedContent);
          chatHistory.scrollTop = chatHistory.scrollHeight;
        }
      }
      
    } catch (err) {
      console.error(err);
      appendMessage('assistant', `Failed to load learning content. Please try clicking the node again.`);
    } finally {
      hideLoader();
    }
  });

  // Exit node button (Return to global diagnosis)
  exitNodeBtn.addEventListener('click', () => {
    activeNodeId = null;
    sidebarNodeTitle.textContent = "Curriculum Diagnostic";
    sidebarNodeStatus.textContent = "DIAGNOSIS";
    sidebarNodeStatus.className = "node-badge diagnosis";
    exitNodeBtn.style.display = 'none';
    
    // Reload global diagnosis messages
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
            if (!msg.node_id) {
              appendMessage(msg.sender, msg.content);
            }
          });
        }
      }
    } catch (err) {
      console.error('Error reloading global chat:', err);
    }
  }

  // --- Send Message / Submit Interaction ---
  sendChatBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  });

  async function sendMessage(): Promise<void> {
    const text = chatInput.value.trim();
    if (!text) return;
    
    chatInput.value = '';
    appendMessage('user', text, activeNodeId);
    
    showLoader('Klaivo is thinking...');
    
    try {
      if (activeNodeId) {
        // Send message in the node teaching context
        const response = await fetch(`/api/sessions/${sessionId}/nodes/${activeNodeId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: text })
        });
        
        if (!response.ok) throw new Error('Failed to send message');
        
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // It's a structured assessment result
          const data = await response.json();
          hideLoader();
          
          // Append response feedback
          appendMessage('assistant', data.feedback, activeNodeId);
          
          // Update nodes and canvas if status changed
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
          // It's a streamed follow-up answer
          hideLoader();
          
          const reader = response.body?.getReader();
          if (!reader) throw new Error('Response body reader not available');
          
          const decoder = new TextDecoder('utf-8');
          let currentMsgWrapper: HTMLDivElement | null = null;
          let streamedContent = '';
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            streamedContent += chunk;
            
            if (!currentMsgWrapper) {
              currentMsgWrapper = appendMessage('assistant', streamedContent, activeNodeId);
            } else {
              renderMessageBubble(currentMsgWrapper.querySelector('.message-bubble') as HTMLElement, streamedContent);
              chatHistory.scrollTop = chatHistory.scrollHeight;
            }
          }
        }
        
      } else {
        // Send message in the global diagnostic context
        const response = await fetch(`/api/sessions/${sessionId}/diagnose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        
        if (!response.ok) throw new Error('Diagnosis message failed');
        
        const data = await response.json();
        
        // Append diagnosis follow-up or confirmation
        appendMessage('assistant', data.response);
        
        // If path generated, show canvas elements and complete diagnosis
        if (data.status === 'learning' || (data.nodes && data.nodes.length > 0)) {
          nodes = data.nodes;
          canvas.render(nodes);
          updateStats();
          
          appendMessage('assistant', "🎉 Your personalized learning tree has been built! Click on the first unlocked node (marked in blue) on the right to start learning.");
        }
      }
    } catch (err: any) {
      console.error(err);
      appendMessage('assistant', `Sorry, something went wrong processing that request: ${err.message}`);
    } finally {
      hideLoader();
    }
  }

  function updateStats(): void {
    const completedCount = nodes.filter(n => n.status === 'completed').length;
    const totalCount = nodes.length;
    canvasSessionStats.textContent = `${completedCount} of ${totalCount} Nodes Completed`;
  }
});
