"use strict";
(() => {
  // public/js/canvas.ts
  var ConceptCanvas = class {
    svg;
    viewport;
    edgesGroup;
    nodesGroup;
    panX = 0;
    panY = 0;
    zoom = 1;
    isDragging = false;
    startX = 0;
    startY = 0;
    nodes = [];
    onNodeClickCallback = null;
    constructor(svgId) {
      this.svg = document.getElementById(svgId);
      this.viewport = document.getElementById("canvas-viewport");
      this.edgesGroup = document.getElementById("svg-edges");
      this.nodesGroup = document.getElementById("svg-nodes");
      this.initEvents();
    }
    initEvents() {
      this.svg.addEventListener("mousedown", (e) => {
        if (e.target.closest(".svg-node-group")) return;
        this.isDragging = true;
        this.svg.style.cursor = "grabbing";
        this.startX = e.clientX - this.panX;
        this.startY = e.clientY - this.panY;
      });
      window.addEventListener("mousemove", (e) => {
        if (!this.isDragging) return;
        this.panX = e.clientX - this.startX;
        this.panY = e.clientY - this.startY;
        this.applyTransform();
      });
      window.addEventListener("mouseup", () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.svg.style.cursor = "grab";
        }
      });
      this.svg.addEventListener("wheel", (e) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        const svgRect = this.svg.getBoundingClientRect();
        const mouseX = e.clientX - svgRect.left;
        const mouseY = e.clientY - svgRect.top;
        const canvasMouseX = (mouseX - this.panX) / this.zoom;
        const canvasMouseY = (mouseY - this.panY) / this.zoom;
        if (e.deltaY < 0) {
          this.zoom = Math.min(this.zoom * zoomFactor, 3);
        } else {
          this.zoom = Math.max(this.zoom / zoomFactor, 0.4);
        }
        this.panX = mouseX - canvasMouseX * this.zoom;
        this.panY = mouseY - canvasMouseY * this.zoom;
        this.applyTransform();
      });
      document.getElementById("zoom-in-btn").addEventListener("click", () => this.zoomStep(1.2));
      document.getElementById("zoom-out-btn").addEventListener("click", () => this.zoomStep(1 / 1.2));
      document.getElementById("zoom-reset-btn").addEventListener("click", () => this.resetView());
    }
    zoomStep(factor) {
      const width = this.svg.clientWidth;
      const height = this.svg.clientHeight;
      const canvasCenterX = (width / 2 - this.panX) / this.zoom;
      const canvasCenterY = (height / 2 - this.panY) / this.zoom;
      this.zoom = Math.max(0.4, Math.min(this.zoom * factor, 3));
      this.panX = width / 2 - canvasCenterX * this.zoom;
      this.panY = height / 2 - canvasCenterY * this.zoom;
      this.applyTransform();
    }
    resetView() {
      this.panX = 0;
      this.panY = 0;
      this.zoom = 1;
      this.applyTransform();
    }
    applyTransform() {
      this.viewport.setAttribute("transform", `translate(${this.panX}, ${this.panY}) scale(${this.zoom})`);
    }
    onNodeClick(callback) {
      this.onNodeClickCallback = callback;
    }
    render(nodes) {
      this.nodes = nodes;
      this.nodesGroup.innerHTML = "";
      this.edgesGroup.innerHTML = "";
      if (!nodes || nodes.length === 0) return;
      const nodeMap = {};
      nodes.forEach((n) => {
        nodeMap[n.id] = n;
      });
      nodes.forEach((node) => {
        if (node.dependencies && Array.isArray(node.dependencies)) {
          node.dependencies.forEach((depId) => {
            const parentNode = nodeMap[depId];
            if (parentNode) {
              this.drawConnection(parentNode, node);
            }
          });
        }
      });
      nodes.forEach((node) => {
        this.drawNode(node);
      });
    }
    drawConnection(parent, child) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const pX = parent.x + 90;
      const pY = parent.y + 40;
      const cX = child.x + 90;
      const cY = child.y + 40;
      const midX = (pX + cX) / 2;
      const dStr = `M ${pX} ${pY} C ${midX} ${pY}, ${midX} ${cY}, ${cX} ${cY}`;
      path.setAttribute("d", dStr);
      path.setAttribute("class", `svg-edge-path ${child.status}`);
      this.edgesGroup.appendChild(path);
    }
    drawNode(node) {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", `svg-node-group ${node.status}`);
      group.setAttribute("id", `node-group-${node.id}`);
      const width = 180;
      const height = 80;
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(node.x));
      rect.setAttribute("y", String(node.y));
      rect.setAttribute("width", String(width));
      rect.setAttribute("height", String(height));
      rect.setAttribute("class", "svg-node-bg");
      group.appendChild(rect);
      const iconBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      iconBg.setAttribute("x", String(node.x + 12));
      iconBg.setAttribute("y", String(node.y + 16));
      iconBg.setAttribute("width", "48");
      iconBg.setAttribute("height", "48");
      iconBg.setAttribute("class", "svg-node-icon-bg");
      group.appendChild(iconBg);
      const symbolText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      symbolText.setAttribute("x", String(node.x + 36));
      symbolText.setAttribute("y", String(node.y + 45));
      symbolText.setAttribute("text-anchor", "middle");
      symbolText.setAttribute("dominant-baseline", "middle");
      symbolText.setAttribute("font-size", "16");
      symbolText.setAttribute("fill", node.status === "completed" ? "#10b981" : node.status === "active" || node.status === "available" ? "#6366f1" : "#64748b");
      let symbol = "\u{1F512}";
      if (node.status === "completed") symbol = "\u2713";
      else if (node.status === "active") symbol = "\u2794";
      else if (node.status === "available") symbol = "\u25CB";
      symbolText.textContent = symbol;
      group.appendChild(symbolText);
      const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      titleText.setAttribute("x", String(node.x + 72));
      titleText.setAttribute("y", String(node.y + 32));
      titleText.setAttribute("class", "svg-node-text-title");
      let title = node.title;
      if (title.length > 14) title = title.substring(0, 12) + "...";
      titleText.textContent = title;
      group.appendChild(titleText);
      const descText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      descText.setAttribute("x", String(node.x + 72));
      descText.setAttribute("y", String(node.y + 48));
      descText.setAttribute("class", "svg-node-text-desc");
      let desc = node.description || "";
      if (desc.length > 20) desc = desc.substring(0, 18) + "...";
      descText.textContent = desc;
      group.appendChild(descText);
      const badgeBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      badgeBg.setAttribute("x", String(node.x + 72));
      badgeBg.setAttribute("y", String(node.y + 56));
      badgeBg.setAttribute("width", "45");
      badgeBg.setAttribute("height", "14");
      badgeBg.setAttribute("class", "svg-node-badge-bg");
      group.appendChild(badgeBg);
      const badgeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      badgeText.setAttribute("x", String(node.x + 94));
      badgeText.setAttribute("y", String(node.y + 66));
      badgeText.setAttribute("text-anchor", "middle");
      badgeText.setAttribute("class", "svg-node-badge-text");
      badgeText.textContent = `Node ${node.order_index + 1}`;
      group.appendChild(badgeText);
      group.addEventListener("click", () => {
        if (node.status === "locked") return;
        if (this.onNodeClickCallback) {
          this.onNodeClickCallback(node);
        }
      });
      this.nodesGroup.appendChild(group);
    }
  };

  // public/js/app.ts
  document.addEventListener("DOMContentLoaded", () => {
    let sessionId = null;
    let activeNodeId = null;
    let calibration = "Beginner";
    let nodes = [];
    let selectedFiles = [];
    const welcomeScreen = document.getElementById("welcome-screen");
    const workspaceScreen = document.getElementById("workspace-screen");
    const headerStatus = document.getElementById("header-status");
    const headerCalibration = document.getElementById("header-calibration");
    const progressOverlay = document.getElementById("progress-overlay");
    const progressText = document.getElementById("progress-text");
    const welcomeInput = document.getElementById("welcome-input");
    const welcomeSendBtn = document.getElementById("welcome-send-btn");
    const welcomeFileInput = document.getElementById("welcome-file-input");
    const welcomeFilesList = document.getElementById("welcome-files-list");
    const suggestionChips = document.querySelectorAll(".suggestion-chip");
    const chatSidebar = document.getElementById("chat-sidebar");
    const canvasPanel = document.getElementById("canvas-panel");
    const panelResizer = document.getElementById("panel-resizer");
    const gutterToggleBtn = document.getElementById("gutter-toggle-btn");
    const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
    const expandSidebarBtn = document.getElementById("expand-sidebar-btn");
    const collapseCanvasBtn = document.getElementById("collapse-canvas-btn");
    const expandCanvasBtn = document.getElementById("expand-canvas-btn");
    const sidebarNodeTitle = document.getElementById("sidebar-node-title");
    const sidebarNodeStatus = document.getElementById("sidebar-node-status");
    const exitNodeBtn = document.getElementById("exit-node-btn");
    const chatHistory = document.getElementById("chat-history");
    const chatInput = document.getElementById("chat-input");
    const sendChatBtn = document.getElementById("send-chat-btn");
    const onboardingFileInput = document.getElementById("onboarding-file-input");
    const onboardingFilesList = document.getElementById("onboarding-files-list");
    const canvasSessionTitle = document.getElementById("canvas-session-title");
    const canvasSessionStats = document.getElementById("canvas-session-stats");
    const canvas = new ConceptCanvas("concept-svg");
    function setupAutoResizeTextarea(textarea) {
      if (!textarea) return;
      const adjustHeight = () => {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
      };
      textarea.addEventListener("input", adjustHeight);
    }
    setupAutoResizeTextarea(welcomeInput);
    setupAutoResizeTextarea(chatInput);
    const appLeftNav = document.getElementById("app-left-nav");
    const navNewSessionBtn = document.getElementById("nav-new-session-btn");
    const navSessionsGroup = document.getElementById("nav-sessions-group");
    const navSessionsHeader = document.getElementById("nav-sessions-header");
    const navSessionsList = document.getElementById("nav-sessions-list");
    const navHistoryGroup = document.getElementById("nav-history-group");
    const navHistoryHeader = document.getElementById("nav-history-header");
    const navHistoryList = document.getElementById("nav-history-list");
    const toggleNavBtn = document.getElementById("toggle-nav-btn");
    const headerSessionTitle = document.getElementById("header-session-title");
    toggleNavBtn?.addEventListener("click", () => {
      appLeftNav.classList.toggle("collapsed");
    });
    navSessionsHeader?.addEventListener("click", () => {
      navSessionsGroup.classList.toggle("collapsed");
    });
    navHistoryHeader?.addEventListener("click", () => {
      navHistoryGroup.classList.toggle("collapsed");
    });
    navNewSessionBtn?.addEventListener("click", resetToWelcomeScreen);
    function resetToWelcomeScreen() {
      sessionId = null;
      activeNodeId = null;
      nodes = [];
      selectedFiles = [];
      welcomeInput.value = "";
      welcomeInput.style.height = "auto";
      welcomeFilesList.innerHTML = "";
      onboardingFilesList.innerHTML = "";
      chatHistory.innerHTML = "";
      headerStatus.classList.add("hidden");
      headerSessionTitle.textContent = "Klaivo Workspace";
      workspaceScreen.classList.add("hidden");
      welcomeScreen.classList.remove("hidden");
      welcomeInput.focus();
      loadNavigationHistory();
    }
    async function loadNavigationHistory() {
      try {
        const res = await fetch("/api/sessions");
        if (!res.ok) return;
        const data = await res.json();
        const sessions = data.sessions || [];
        navSessionsList.innerHTML = "";
        if (sessions.length === 0) {
          navSessionsList.innerHTML = `<div class="nav-item-sub" style="padding: 6px 10px;">No sessions yet</div>`;
        } else {
          sessions.forEach((sess) => {
            const item = document.createElement("div");
            item.className = `nav-item ${sess.id === sessionId ? "active" : ""}`;
            item.innerHTML = `
            <div class="nav-item-title">${sess.title || "Untitled Session"}</div>
            <div class="nav-item-sub">
              <span>${sess.nodes ? sess.nodes.length : 0} topics</span>
              <span>\u2022</span>
              <span style="text-transform: capitalize;">${sess.calibration?.level || "Beginner"}</span>
            </div>
          `;
            if (sess.nodes && sess.nodes.length > 0) {
              const tree = document.createElement("div");
              tree.className = "nav-node-tree";
              sess.nodes.forEach((n) => {
                const nodeEl = document.createElement("div");
                nodeEl.className = `nav-node-item ${sess.id === sessionId && n.id === activeNodeId ? "active" : ""}`;
                nodeEl.textContent = `${n.status === "completed" ? "\u2713 " : ""}${n.title}`;
                nodeEl.addEventListener("click", (e) => {
                  e.stopPropagation();
                  openSessionAndNode(sess.id, n.id);
                });
                tree.appendChild(nodeEl);
              });
              item.appendChild(tree);
            }
            item.addEventListener("click", () => {
              openSessionAndNode(sess.id, null);
            });
            navSessionsList.appendChild(item);
          });
        }
        navHistoryList.innerHTML = "";
        const allNodeChats = [];
        sessions.forEach((sess) => {
          if (sess.nodes) {
            sess.nodes.forEach((n) => {
              if (n.status !== "locked") {
                allNodeChats.push({ sessionId: sess.id, sessionTitle: sess.title, node: n });
              }
            });
          }
        });
        if (allNodeChats.length === 0) {
          navHistoryList.innerHTML = `<div class="nav-item-sub" style="padding: 6px 10px;">No recent chats</div>`;
        } else {
          allNodeChats.slice(0, 20).forEach((chat) => {
            const item = document.createElement("div");
            item.className = `nav-item ${chat.sessionId === sessionId && chat.node.id === activeNodeId ? "active" : ""}`;
            item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; opacity: 0.7;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <div class="nav-item-title">${chat.node.title}</div>
            </div>
            <div class="nav-item-sub" style="padding-left: 21px;">${chat.sessionTitle}</div>
          `;
            item.addEventListener("click", () => {
              openSessionAndNode(chat.sessionId, chat.node.id);
            });
            navHistoryList.appendChild(item);
          });
        }
      } catch (err) {
        console.error("Error loading navigation history:", err);
      }
    }
    async function openSessionAndNode(sessId, nodeId) {
      try {
        const res = await fetch(`/api/sessions/${sessId}`);
        if (!res.ok) return;
        const data = await res.json();
        sessionId = sessId;
        calibration = data.session.calibration.level;
        nodes = data.nodes || [];
        headerCalibration.textContent = calibration;
        headerStatus.classList.remove("hidden");
        canvasSessionTitle.textContent = data.session.title;
        headerSessionTitle.textContent = data.session.title;
        canvas.render(nodes);
        updateStats();
        enterDiscoveryMode();
        activateSplitScreen();
        if (nodeId) {
          const targetNode = nodes.find((n) => n.id === nodeId);
          if (targetNode) {
            activeNodeId = nodeId;
            sidebarNodeTitle.textContent = targetNode.title;
            sidebarNodeStatus.textContent = targetNode.status.toUpperCase();
            sidebarNodeStatus.className = `node-badge ${targetNode.status}`;
            exitNodeBtn.style.display = "block";
            document.querySelectorAll(".svg-node-group").forEach((el) => el.classList.remove("active"));
            document.getElementById(`node-group-${nodeId}`)?.classList.add("active");
            chatHistory.innerHTML = "";
            const chatRes = await fetch(`/api/sessions/${sessId}/nodes/${nodeId}/chat`);
            if (chatRes.ok) {
              const historyMsgs = await chatRes.json();
              historyMsgs.forEach((msg) => appendMessage(msg.sender, msg.content, nodeId));
            }
          }
        } else {
          activeNodeId = null;
          sidebarNodeTitle.textContent = "Curriculum Diagnostic";
          sidebarNodeStatus.textContent = "DIAGNOSIS";
          sidebarNodeStatus.className = "node-badge diagnosis";
          exitNodeBtn.style.display = "none";
          chatHistory.innerHTML = "";
          loadGlobalChat();
        }
        loadNavigationHistory();
      } catch (err) {
        console.error("Error loading session from nav:", err);
      }
    }
    loadNavigationHistory();
    function enterDiscoveryMode() {
      welcomeScreen.classList.add("hidden");
      workspaceScreen.classList.remove("hidden");
      workspaceScreen.classList.add("discovery-mode");
    }
    function activateSplitScreen() {
      workspaceScreen.classList.remove("discovery-mode");
      toggleSidebarBtn.classList.remove("hidden");
      chatInput.placeholder = "Type your response...";
    }
    let currentViewMode = "split";
    let isResizing = false;
    function setWorkspaceViewMode(mode) {
      currentViewMode = mode;
      chatSidebar.classList.remove("collapsed");
      canvasPanel.classList.remove("collapsed");
      workspaceScreen.classList.remove("chat-only-mode");
      workspaceScreen.classList.remove("canvas-only-mode");
      expandSidebarBtn.classList.add("hidden");
      expandCanvasBtn.classList.add("hidden");
      panelResizer.style.display = "block";
      if (mode === "canvas-only") {
        chatSidebar.classList.add("collapsed");
        workspaceScreen.classList.add("canvas-only-mode");
        expandSidebarBtn.classList.remove("hidden");
        panelResizer.style.display = "none";
      } else if (mode === "chat-only") {
        canvasPanel.classList.add("collapsed");
        workspaceScreen.classList.add("chat-only-mode");
        expandCanvasBtn.classList.remove("hidden");
        panelResizer.style.display = "none";
      }
    }
    toggleSidebarBtn?.addEventListener("click", () => {
      setWorkspaceViewMode(currentViewMode === "canvas-only" ? "split" : "canvas-only");
    });
    expandSidebarBtn?.addEventListener("click", () => setWorkspaceViewMode("split"));
    collapseCanvasBtn?.addEventListener("click", () => {
      setWorkspaceViewMode(currentViewMode === "chat-only" ? "split" : "chat-only");
    });
    expandCanvasBtn?.addEventListener("click", () => setWorkspaceViewMode("split"));
    gutterToggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      setWorkspaceViewMode(currentViewMode === "canvas-only" ? "split" : "canvas-only");
    });
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        if (workspaceScreen.classList.contains("discovery-mode")) return;
        e.preventDefault();
        setWorkspaceViewMode(currentViewMode === "split" ? "canvas-only" : "split");
      }
    });
    panelResizer?.addEventListener("dblclick", (e) => {
      if (e.target.closest(".gutter-toggle-btn")) return;
      chatSidebar.style.width = "420px";
      if (currentViewMode === "canvas-only") {
        setWorkspaceViewMode("split");
      }
    });
    panelResizer?.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".gutter-toggle-btn")) return;
      isResizing = true;
      try {
        panelResizer.setPointerCapture(e.pointerId);
      } catch (_) {
      }
      panelResizer.classList.add("resizing");
      chatSidebar.classList.add("resizing");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    });
    panelResizer?.addEventListener("pointermove", (e) => {
      if (!isResizing) return;
      const snapThreshold = 180;
      const maxWidth = Math.min(window.innerWidth - 300, window.innerWidth * 0.75);
      if (e.clientX < snapThreshold) {
        setWorkspaceViewMode("canvas-only");
      } else {
        if (currentViewMode === "canvas-only") {
          setWorkspaceViewMode("split");
        }
        const newWidth = Math.min(e.clientX, maxWidth);
        chatSidebar.style.width = `${newWidth}px`;
      }
    });
    const stopPointerResizing = (e) => {
      if (isResizing) {
        isResizing = false;
        try {
          panelResizer.releasePointerCapture(e.pointerId);
        } catch (_) {
        }
        panelResizer.classList.remove("resizing");
        chatSidebar.classList.remove("resizing");
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    panelResizer?.addEventListener("pointerup", stopPointerResizing);
    panelResizer?.addEventListener("pointercancel", stopPointerResizing);
    function showLoader(text) {
      progressText.textContent = text;
      progressOverlay.classList.remove("hidden");
    }
    function hideLoader() {
      progressOverlay.classList.add("hidden");
    }
    function formatMarkdown(text) {
      if (!text) return "";
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[blur\](.*?)\[\/blur\]/gi, '<span class="active-recall-blur" title="Click or hover to reveal term" role="button" tabindex="0">$1</span>').replace(/\[\[(.*?)\]\]/g, '<span class="active-recall-blur" title="Click or hover to reveal term" role="button" tabindex="0">$1</span>').replace(/\[(\d+)\]/g, '<span class="citation-chip" title="Citation Source [$1]">$1</span>').replace(/\n/g, "<br>");
    }
    chatHistory?.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.classList.contains("active-recall-blur")) {
        target.classList.toggle("revealed");
      }
    });
    function renderMessageBubble(bubble, content) {
      if (content.includes("thinking-dots")) {
        bubble.innerHTML = content;
        return;
      }
      if (content.includes("ASSESSMENT QUESTION:") || content.includes("CHECK YOUR UNDERSTANDING:")) {
        const parts = content.split(/(ASSESSMENT QUESTION:|CHECK YOUR UNDERSTANDING:)/i);
        const mainText = parts[0];
        const questionText = parts.slice(1).join("");
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
    function appendMessage(sender, content, nodeId = null) {
      const wrapper = document.createElement("div");
      wrapper.className = `message-wrapper ${sender}`;
      if (nodeId) wrapper.dataset.nodeId = nodeId;
      const bubble = document.createElement("div");
      bubble.className = "message-bubble";
      renderMessageBubble(bubble, content);
      wrapper.appendChild(bubble);
      chatHistory.appendChild(wrapper);
      chatHistory.scrollTop = chatHistory.scrollHeight;
      return wrapper;
    }
    welcomeFileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        if (selectedFiles.some((f) => f.name === file.name)) return;
        selectedFiles.push(file);
        const tag = document.createElement("div");
        tag.className = "uploaded-file-tag";
        tag.innerHTML = `\u{1F4C4} ${file.name.substring(0, 20)}${file.name.length > 20 ? "\u2026" : ""} <span class="remove-file-btn" data-name="${file.name}">\xD7</span>`;
        welcomeFilesList.appendChild(tag);
      });
      welcomeFileInput.value = "";
    });
    welcomeFilesList.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("remove-file-btn")) {
        selectedFiles = selectedFiles.filter((f) => f.name !== target.dataset.name);
        target.parentElement?.remove();
      }
    });
    suggestionChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const prompt = chip.dataset.prompt || chip.textContent?.trim() || "";
        welcomeInput.value = prompt;
        welcomeInput.focus();
      });
    });
    welcomeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        startSession();
      }
    });
    welcomeSendBtn.addEventListener("click", startSession);
    async function startSession() {
      const prompt = welcomeInput.value.trim();
      if (!prompt) {
        welcomeInput.focus();
        return;
      }
      enterDiscoveryMode();
      appendMessage("user", prompt);
      const thinkingWrapper = appendMessage("assistant", '<div class="thinking-dots"><span></span><span></span><span></span></div>');
      try {
        const formData = new FormData();
        formData.append("initial_prompt", prompt);
        selectedFiles.forEach((file) => formData.append("documents", file));
        const response = await fetch("/api/sessions/start", { method: "POST", body: formData });
        if (!response.ok) throw new Error("Failed to start session");
        const data = await response.json();
        sessionId = data.sessionId;
        calibration = data.calibration.level;
        thinkingWrapper.remove();
        headerCalibration.textContent = calibration;
        headerStatus.classList.remove("hidden");
        canvasSessionTitle.textContent = prompt;
        appendMessage("assistant", data.diagnosticQuestion);
        if (data.nodes && data.nodes.length > 0) {
          nodes = data.nodes;
          canvas.render(nodes);
          updateStats();
          activateSplitScreen();
          appendMessage("assistant", "\u{1F389} Your personalized learning tree has been built! Click on the first unlocked node on the right to start learning.");
        }
        selectedFiles = [];
        welcomeFilesList.innerHTML = "";
        loadNavigationHistory();
      } catch (err) {
        console.error(err);
        thinkingWrapper.remove();
        appendMessage("assistant", `Something went wrong starting your session: ${err.message}`);
      }
    }
    onboardingFileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        if (selectedFiles.some((f) => f.name === file.name)) return;
        selectedFiles.push(file);
        const tag = document.createElement("div");
        tag.className = "uploaded-file-tag";
        tag.innerHTML = `\u{1F4C4} ${file.name.substring(0, 20)}${file.name.length > 20 ? "\u2026" : ""} <span class="remove-file-btn" data-name="${file.name}">\xD7</span>`;
        onboardingFilesList.appendChild(tag);
      });
      onboardingFileInput.value = "";
    });
    onboardingFilesList.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("remove-file-btn")) {
        selectedFiles = selectedFiles.filter((f) => f.name !== target.dataset.name);
        target.parentElement?.remove();
      }
    });
    canvas.onNodeClick(async (node) => {
      if (node.status === "locked") return;
      document.querySelectorAll(".svg-node-group").forEach((el) => el.classList.remove("active"));
      document.getElementById(`node-group-${node.id}`)?.classList.add("active");
      activeNodeId = node.id;
      sidebarNodeTitle.textContent = node.title;
      sidebarNodeStatus.textContent = node.status.toUpperCase();
      sidebarNodeStatus.className = `node-badge ${node.status}`;
      exitNodeBtn.style.display = "block";
      chatHistory.innerHTML = "";
      const thinkingWrapper = appendMessage("assistant", '<div class="thinking-dots"><span></span><span></span><span></span></div>', node.id);
      try {
        const chatResponse = await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/chat`);
        if (chatResponse.ok) {
          const history = await chatResponse.json();
          if (history.length > 0) {
            thinkingWrapper.remove();
            history.forEach((msg) => appendMessage(msg.sender, msg.content, node.id));
            return;
          }
        }
        const streamUrl = `/api/sessions/${sessionId}/nodes/${node.id}/teach`;
        const response = await fetch(streamUrl);
        if (!response.ok) throw new Error("Teaching agent failed");
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Response body reader not available");
        const decoder = new TextDecoder("utf-8");
        let currentMsgWrapper = thinkingWrapper;
        let streamedContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          streamedContent += chunk;
          renderMessageBubble(currentMsgWrapper.querySelector(".message-bubble"), streamedContent);
          chatHistory.scrollTop = chatHistory.scrollHeight;
        }
      } catch (err) {
        console.error(err);
        thinkingWrapper.remove();
        appendMessage("assistant", "Failed to load learning content. Please try clicking the node again.");
      }
    });
    exitNodeBtn.addEventListener("click", () => {
      activeNodeId = null;
      sidebarNodeTitle.textContent = "Curriculum Diagnostic";
      sidebarNodeStatus.textContent = "DIAGNOSIS";
      sidebarNodeStatus.className = "node-badge diagnosis";
      exitNodeBtn.style.display = "none";
      chatHistory.innerHTML = "";
      loadGlobalChat();
    });
    async function loadGlobalChat() {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            data.messages.forEach((msg) => {
              if (!msg.node_id) appendMessage(msg.sender, msg.content);
            });
          }
        }
      } catch (err) {
        console.error("Error reloading global chat:", err);
      }
    }
    sendChatBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    async function sendMessage() {
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = "";
      chatInput.style.height = "auto";
      appendMessage("user", text, activeNodeId);
      const thinkingWrapper = appendMessage("assistant", '<div class="thinking-dots"><span></span><span></span><span></span></div>', activeNodeId);
      try {
        if (activeNodeId) {
          const response = await fetch(`/api/sessions/${sessionId}/nodes/${activeNodeId}/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answer: text })
          });
          if (!response.ok) throw new Error("Failed to send message");
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            thinkingWrapper.remove();
            appendMessage("assistant", data.feedback, activeNodeId);
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
            if (!reader) throw new Error("Response body reader not available");
            const decoder = new TextDecoder("utf-8");
            let streamedContent = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              streamedContent += decoder.decode(value, { stream: true });
              renderMessageBubble(thinkingWrapper.querySelector(".message-bubble"), streamedContent);
              chatHistory.scrollTop = chatHistory.scrollHeight;
            }
          }
        } else {
          const response = await fetch(`/api/sessions/${sessionId}/diagnose`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
          });
          if (!response.ok) throw new Error("Diagnosis message failed");
          const data = await response.json();
          thinkingWrapper.remove();
          appendMessage("assistant", data.response);
          if (data.status === "learning" || data.nodes && data.nodes.length > 0) {
            nodes = data.nodes;
            canvas.render(nodes);
            updateStats();
            activateSplitScreen();
            appendMessage("assistant", "\u{1F389} Your personalized learning tree has been built! Click on the first unlocked node on the right to start learning.");
          }
        }
      } catch (err) {
        console.error(err);
        thinkingWrapper.remove();
        appendMessage("assistant", `Sorry, something went wrong: ${err.message}`);
      }
    }
    function updateStats() {
      const completedCount = nodes.filter((n) => n.status === "completed").length;
      canvasSessionStats.textContent = `${completedCount} of ${nodes.length} Nodes Completed`;
      const masteryPath = document.getElementById("header-mastery-progress-path");
      const masteryText = document.getElementById("header-mastery-text");
      const masteryWrapper = document.querySelector(".mastery-ring-wrapper");
      if (!nodes || nodes.length === 0) {
        if (masteryPath) masteryPath.setAttribute("stroke-dasharray", "0, 100");
        if (masteryText) masteryText.textContent = "0%";
        return;
      }
      const percent = Math.round(completedCount / nodes.length * 100);
      if (masteryPath) masteryPath.setAttribute("stroke-dasharray", `${percent}, 100`);
      if (masteryText) masteryText.textContent = `${percent}%`;
      if (masteryWrapper) masteryWrapper.setAttribute("aria-label", `Mastery Rate ${percent}%`);
    }
  });
})();
//# sourceMappingURL=app.js.map
