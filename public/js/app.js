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
      this.initDefs();
      this.initEvents();
    }
    /** Initialize SVG Defs (Patterns, Gradients, Filters) */
    initDefs() {
      let defs = this.svg.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this.svg.insertBefore(defs, this.svg.firstChild);
      }
      defs.innerHTML = `
      <!-- Canvas Grid Pattern -->
      <pattern id="canvas-grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
        <circle cx="16" cy="16" r="1.2" fill="rgba(255, 255, 255, 0.07)"/>
      </pattern>
      
      <!-- Linear Edge Gradients -->
      <linearGradient id="edge-grad-completed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#059669" stop-opacity="0.9"/>
      </linearGradient>

      <linearGradient id="edge-grad-active" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#d1d5db" stop-opacity="0.9"/>
      </linearGradient>

      <linearGradient id="edge-grad-locked" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.08)"/>
        <stop offset="100%" stop-color="rgba(255, 255, 255, 0.04)"/>
      </linearGradient>

      <!-- Glow Filters -->
      <filter id="glow-active" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    `;
      let bgRect = this.svg.querySelector(".canvas-grid-bg");
      if (!bgRect) {
        bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bgRect.setAttribute("class", "canvas-grid-bg");
        bgRect.setAttribute("width", "100%");
        bgRect.setAttribute("height", "100%");
        bgRect.setAttribute("fill", "url(#canvas-grid-pattern)");
        this.svg.insertBefore(bgRect, this.viewport);
      }
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
          this.zoom = Math.min(this.zoom * zoomFactor, 2.5);
        } else {
          this.zoom = Math.max(this.zoom / zoomFactor, 0.4);
        }
        this.panX = mouseX - canvasMouseX * this.zoom;
        this.panY = mouseY - canvasMouseY * this.zoom;
        this.applyTransform();
      });
      document.getElementById("zoom-in-btn")?.addEventListener("click", () => this.zoomStep(1.2));
      document.getElementById("zoom-out-btn")?.addEventListener("click", () => this.zoomStep(1 / 1.2));
      document.getElementById("zoom-reset-btn")?.addEventListener("click", () => this.resetView());
    }
    zoomStep(factor) {
      const width = this.svg.clientWidth || 800;
      const height = this.svg.clientHeight || 600;
      const canvasCenterX = (width / 2 - this.panX) / this.zoom;
      const canvasCenterY = (height / 2 - this.panY) / this.zoom;
      this.zoom = Math.max(0.4, Math.min(this.zoom * factor, 2.5));
      this.panX = width / 2 - canvasCenterX * this.zoom;
      this.panY = height / 2 - canvasCenterY * this.zoom;
      this.applyTransform();
    }
    resetView() {
      if (this.nodes && this.nodes.length > 0) {
        this.autoCenterTree(this.nodes);
      } else {
        this.panX = 0;
        this.panY = 0;
        this.zoom = 1;
        this.applyTransform();
      }
    }
    autoCenterTree(nodes) {
      if (!nodes || nodes.length === 0) return;
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      nodes.forEach((n) => {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x + 210);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y + 86);
      });
      const svgW = this.svg.clientWidth || 800;
      const svgH = this.svg.clientHeight || 600;
      const graphW = maxX - minX;
      const graphH = maxY - minY;
      const padding = 80;
      const scaleX = (svgW - padding * 2) / (graphW || 1);
      const scaleY = (svgH - padding * 2) / (graphH || 1);
      this.zoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.65), 1.1);
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      this.panX = svgW / 2 - centerX * this.zoom;
      this.panY = svgH / 2 - centerY * this.zoom;
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
      this.autoCenterTree(nodes);
    }
    drawConnection(parent, child) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const pX = parent.x + 210;
      const pY = parent.y + 43;
      const cX = child.x;
      const cY = child.y + 43;
      const dx = Math.abs(cX - pX) * 0.5;
      const dStr = `M ${pX} ${pY} C ${pX + dx} ${pY}, ${cX - dx} ${cY}, ${cX} ${cY}`;
      path.setAttribute("d", dStr);
      path.setAttribute("class", `svg-edge-path ${child.status}`);
      if (child.status === "completed") {
        path.setAttribute("stroke", "url(#edge-grad-completed)");
      } else if (child.status === "active" || child.status === "available") {
        path.setAttribute("stroke", "url(#edge-grad-active)");
      } else {
        path.setAttribute("stroke", "url(#edge-grad-locked)");
      }
      this.edgesGroup.appendChild(path);
    }
    drawNode(node) {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", `svg-node-group ${node.status}`);
      group.setAttribute("id", `node-group-${node.id}`);
      const width = 210;
      const height = 86;
      if (node.status === "active") {
        group.setAttribute("filter", "url(#glow-active)");
      }
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(node.x));
      rect.setAttribute("y", String(node.y));
      rect.setAttribute("width", String(width));
      rect.setAttribute("height", String(height));
      rect.setAttribute("rx", "14");
      rect.setAttribute("ry", "14");
      rect.setAttribute("class", "svg-node-bg");
      group.appendChild(rect);
      const accentBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      accentBar.setAttribute("x", String(node.x));
      accentBar.setAttribute("y", String(node.y));
      accentBar.setAttribute("width", "5");
      accentBar.setAttribute("height", String(height));
      accentBar.setAttribute("rx", "3");
      accentBar.setAttribute("class", `svg-node-accent-bar ${node.status}`);
      group.appendChild(accentBar);
      const iconBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      iconBg.setAttribute("x", String(node.x + 14));
      iconBg.setAttribute("y", String(node.y + 21));
      iconBg.setAttribute("width", "44");
      iconBg.setAttribute("height", "44");
      iconBg.setAttribute("rx", "11");
      iconBg.setAttribute("class", `svg-node-icon-bg ${node.status}`);
      group.appendChild(iconBg);
      const iconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      iconGroup.setAttribute("transform", `translate(${node.x + 26}, ${node.y + 33})`);
      if (node.status === "completed") {
        iconGroup.appendChild(this.createCheckIcon());
      } else if (node.status === "active") {
        iconGroup.appendChild(this.createActivePlayIcon());
      } else if (node.status === "available") {
        iconGroup.appendChild(this.createAvailableTargetIcon());
      } else {
        iconGroup.appendChild(this.createLockIcon());
      }
      group.appendChild(iconGroup);
      const badgeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      badgeGroup.setAttribute("transform", `translate(${node.x + 68}, ${node.y + 18})`);
      const badgeBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      badgeBg.setAttribute("width", "48");
      badgeBg.setAttribute("height", "15");
      badgeBg.setAttribute("rx", "5");
      badgeBg.setAttribute("class", `svg-node-badge-bg ${node.status}`);
      badgeGroup.appendChild(badgeBg);
      const badgeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      badgeText.setAttribute("x", "24");
      badgeText.setAttribute("y", "11");
      badgeText.setAttribute("text-anchor", "middle");
      badgeText.setAttribute("class", "svg-node-badge-text");
      badgeText.textContent = `NODE ${node.order_index + 1}`;
      badgeGroup.appendChild(badgeText);
      group.appendChild(badgeGroup);
      const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      titleText.setAttribute("x", String(node.x + 68));
      titleText.setAttribute("y", String(node.y + 49));
      titleText.setAttribute("class", "svg-node-text-title");
      let title = node.title;
      if (title.length > 16) title = title.substring(0, 14) + "\u2026";
      titleText.textContent = title;
      group.appendChild(titleText);
      const descText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      descText.setAttribute("x", String(node.x + 68));
      descText.setAttribute("y", String(node.y + 66));
      descText.setAttribute("class", "svg-node-text-desc");
      let desc = node.description || "";
      if (desc.length > 22) desc = desc.substring(0, 20) + "\u2026";
      descText.textContent = desc;
      group.appendChild(descText);
      group.addEventListener("click", () => {
        if (node.status === "locked") return;
        if (this.onNodeClickCallback) {
          this.onNodeClickCallback(node);
        }
      });
      this.nodesGroup.appendChild(group);
    }
    // --- Vector SVG Icon Helpers ---
    createCheckIcon() {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `<path d="M 2 10 L 7 15 L 18 4" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      return g;
    }
    createActivePlayIcon() {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `<polygon points="5,3 16,10 5,17" fill="#ffffff"/>`;
      return g;
    }
    createAvailableTargetIcon() {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `
      <circle cx="10" cy="10" r="7" fill="none" stroke="#e5e7eb" stroke-width="2"/>
      <circle cx="10" cy="10" r="2.5" fill="#e5e7eb"/>
    `;
      return g;
    }
    createLockIcon() {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = `
      <rect x="3" y="8" width="14" height="10" rx="2" fill="none" stroke="#64748b" stroke-width="2"/>
      <path d="M 6 8 V 5 A 4 4 0 0 1 14 5 V 8" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
    `;
      return g;
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
    const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
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
    const welcomeAttachBtn = document.getElementById("welcome-attach-btn");
    welcomeAttachBtn?.addEventListener("click", () => {
      welcomeFileInput.click();
    });
    const appLeftNav = document.getElementById("app-left-nav");
    const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
    const navNewSessionBtn = document.getElementById("nav-new-session-btn");
    const navSessionsGroup = document.getElementById("nav-sessions-group");
    const navSessionsHeader = document.getElementById("nav-sessions-header");
    const navSessionsList = document.getElementById("nav-sessions-list");
    const navHistoryGroup = document.getElementById("nav-history-group");
    const navHistoryHeader = document.getElementById("nav-history-header");
    const navHistoryList = document.getElementById("nav-history-list");
    const navLogoSection = document.querySelector(".nav-logo-section");
    sidebarToggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      appLeftNav.classList.toggle("collapsed");
    });
    navLogoSection?.addEventListener("click", () => {
      if (appLeftNav.classList.contains("collapsed")) {
        appLeftNav.classList.remove("collapsed");
      }
    });
    function updateTimeOfDayGreeting() {
      const greetingTitle = document.getElementById("welcome-greeting-title");
      if (!greetingTitle) return;
      const hour = (/* @__PURE__ */ new Date()).getHours();
      let timeGreeting = "Good afternoon";
      if (hour >= 5 && hour < 12) {
        timeGreeting = "Good morning";
      } else if (hour >= 12 && hour < 17) {
        timeGreeting = "Good afternoon";
      } else {
        timeGreeting = "Good evening";
      }
      greetingTitle.textContent = timeGreeting;
    }
    updateTimeOfDayGreeting();
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
      if (headerStatus) headerStatus.classList.add("hidden");
      if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = "none";
      workspaceScreen.classList.add("hidden");
      welcomeScreen.classList.remove("hidden");
      updateTimeOfDayGreeting();
      welcomeInput.focus();
      loadNavigationHistory();
    }
    function toSentenceCase(str) {
      if (!str) return "";
      const trimmed = str.trim();
      if (trimmed.length === 0) return "";
      const words = trimmed.split(/\s+/);
      return words.map((word, i) => {
        if (/^[A-Z0-9]{2,5}$/.test(word)) return word;
        if (/^(Python|JavaScript|TypeScript|React|Next|Node|C\+\+|SQL|HTML|CSS|SQLite|Postgres)$/i.test(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        if (i === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
      }).join(" ");
    }
    let activeContextMenu = null;
    function closeActiveContextMenu() {
      if (activeContextMenu) {
        activeContextMenu.remove();
        activeContextMenu = null;
        document.querySelectorAll(".nav-item-options-btn").forEach((btn) => btn.classList.remove("menu-open"));
      }
    }
    window.addEventListener("click", () => closeActiveContextMenu());
    window.addEventListener("scroll", () => closeActiveContextMenu(), true);
    function createNavItemOptionsBtn() {
      const btn = document.createElement("button");
      btn.className = "nav-item-options-btn";
      btn.title = "Options";
      btn.setAttribute("aria-label", "Options");
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="5" r="1.5"/>
      <circle cx="12" cy="12" r="1.5"/>
      <circle cx="12" cy="19" r="1.5"/>
    </svg>`;
      return btn;
    }
    function showContextMenu(e, targetBtn, menuItems) {
      e.stopPropagation();
      closeActiveContextMenu();
      targetBtn.classList.add("menu-open");
      const menu = document.createElement("div");
      menu.className = "nav-context-menu";
      menuItems.forEach((mi) => {
        const item = document.createElement("div");
        item.className = `nav-context-item ${mi.isDanger ? "danger" : ""}`;
        item.innerHTML = `${mi.iconSvg} <span>${mi.label}</span>`;
        item.addEventListener("click", (ev) => {
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
    async function loadNavigationHistory() {
      try {
        const res = await fetch("/api/sessions");
        if (!res.ok) return;
        const data = await res.json();
        const sessions = data.sessions || [];
        const buildSessionNavItem = (sess) => {
          const item = document.createElement("div");
          item.className = `nav-item ${sess.id === sessionId && !activeNodeId ? "active" : ""}`;
          const displayTitle = toSentenceCase(sess.title || "Untitled session");
          item.innerHTML = `<div class="nav-item-title-container"><div class="nav-item-title">${displayTitle}</div></div>`;
          item.addEventListener("click", () => {
            openSessionAndNode(sess.id, null);
          });
          const optBtn = createNavItemOptionsBtn();
          optBtn.addEventListener("click", (ev) => {
            showContextMenu(ev, optBtn, [
              {
                label: "Rename",
                iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`,
                onClick: async () => {
                  const newTitle = prompt("Rename learning session:", sess.title);
                  if (newTitle && newTitle.trim() && newTitle.trim() !== sess.title) {
                    try {
                      const updateRes = await fetch(`/api/sessions/${sess.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: newTitle.trim() })
                      });
                      if (updateRes.ok) {
                        if (sess.id === sessionId && sidebarNodeTitle) {
                          sidebarNodeTitle.textContent = toSentenceCase(newTitle.trim());
                        }
                        loadNavigationHistory();
                      }
                    } catch (err) {
                      console.error("Error renaming session:", err);
                    }
                  }
                }
              },
              {
                label: "Delete",
                iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
                isDanger: true,
                onClick: async () => {
                  if (confirm(`Delete "${displayTitle}"?`)) {
                    try {
                      const delRes = await fetch(`/api/sessions/${sess.id}`, { method: "DELETE" });
                      if (delRes.ok) {
                        if (sess.id === sessionId) {
                          resetToWelcomeScreen();
                        } else {
                          loadNavigationHistory();
                        }
                      }
                    } catch (err) {
                      console.error("Error deleting session:", err);
                    }
                  }
                }
              }
            ]);
          });
          item.appendChild(optBtn);
          return item;
        };
        navSessionsList.innerHTML = "";
        if (sessions.length === 0) {
          navSessionsList.innerHTML = `<div class="nav-item-sub" style="padding: 6px 8px;">No sessions yet</div>`;
        } else {
          const visibleSessions = sessions.slice(0, 7);
          const remainingSessions = sessions.slice(7);
          visibleSessions.forEach((sess) => {
            navSessionsList.appendChild(buildSessionNavItem(sess));
          });
          if (remainingSessions.length > 0) {
            const moreContainer = document.createElement("div");
            moreContainer.className = "nav-more-sessions-container";
            moreContainer.style.display = "none";
            remainingSessions.forEach((sess) => {
              moreContainer.appendChild(buildSessionNavItem(sess));
            });
            navSessionsList.appendChild(moreContainer);
            const showMoreBtn = document.createElement("div");
            showMoreBtn.className = "nav-more-toggle-btn";
            showMoreBtn.innerHTML = `<span>More</span>`;
            showMoreBtn.addEventListener("click", () => {
              const isHidden = moreContainer.style.display === "none";
              moreContainer.style.display = isHidden ? "block" : "none";
              showMoreBtn.innerHTML = isHidden ? `<span>Less</span>` : `<span>More</span>`;
            });
            navSessionsList.appendChild(showMoreBtn);
          }
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
          navHistoryList.innerHTML = `<div class="nav-item-sub" style="padding: 6px 8px;">No recent chats</div>`;
        } else {
          allNodeChats.slice(0, 20).forEach((chat) => {
            const item = document.createElement("div");
            item.className = `nav-item ${chat.sessionId === sessionId && chat.node.id === activeNodeId ? "active" : ""}`;
            const isStarred = !!chat.node.is_starred;
            const starIcon = isStarred ? `<span class="nav-item-star-icon" title="Starred">\u2605</span>` : "";
            const nodeTitle = toSentenceCase(chat.node.title);
            item.innerHTML = `<div class="nav-item-title-container">${starIcon}<div class="nav-item-title">${nodeTitle}</div></div>`;
            item.addEventListener("click", () => {
              openSessionAndNode(chat.sessionId, chat.node.id);
            });
            const optBtn = createNavItemOptionsBtn();
            optBtn.addEventListener("click", (ev) => {
              showContextMenu(ev, optBtn, [
                {
                  label: isStarred ? "Unstar" : "Star",
                  iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="${isStarred ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
                  onClick: async () => {
                    try {
                      const starRes = await fetch(`/api/sessions/${chat.sessionId}/nodes/${chat.node.id}/star`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isStarred: !isStarred })
                      });
                      if (starRes.ok) {
                        loadNavigationHistory();
                      }
                    } catch (err) {
                      console.error("Error starring history item:", err);
                    }
                  }
                },
                {
                  label: "Reset Thread",
                  iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`,
                  onClick: async () => {
                    if (confirm(`Reset conversation thread for "${nodeTitle}"?

This will clear chat history for this concept node so you can re-learn it from scratch.`)) {
                      try {
                        const resetRes = await fetch(`/api/sessions/${chat.sessionId}/nodes/${chat.node.id}/reset`, { method: "POST" });
                        if (resetRes.ok) {
                          if (chat.sessionId === sessionId && chat.node.id === activeNodeId) {
                            chatHistory.innerHTML = "";
                          }
                          loadNavigationHistory();
                        }
                      } catch (err) {
                        console.error("Error resetting history chat:", err);
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
        if (headerCalibration) headerCalibration.textContent = calibration;
        if (headerStatus) headerStatus.classList.remove("hidden");
        if (canvasSessionTitle) canvasSessionTitle.textContent = toSentenceCase(data.session.title);
        canvas.render(nodes);
        updateStats();
        enterDiscoveryMode();
        activateSplitScreen();
        document.querySelectorAll("#nav-sessions-list .nav-item, #nav-history-list .nav-item").forEach((el) => el.classList.remove("active"));
        if (nodeId) {
          const targetNode = nodes.find((n) => n.id === nodeId);
          if (targetNode) {
            activeNodeId = nodeId;
            if (sidebarNodeTitle) sidebarNodeTitle.textContent = toSentenceCase(targetNode.title);
            if (sidebarNodeStatus) {
              sidebarNodeStatus.textContent = targetNode.status.toUpperCase();
              sidebarNodeStatus.className = `node-badge ${targetNode.status}`;
            }
            if (exitNodeBtn) exitNodeBtn.style.display = "block";
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
          if (sidebarNodeTitle) sidebarNodeTitle.textContent = toSentenceCase(data.session.title || "Learning Session");
          if (sidebarNodeStatus) {
            sidebarNodeStatus.textContent = "DIAGNOSIS";
          }
          if (exitNodeBtn) exitNodeBtn.style.display = "none";
          chatHistory.innerHTML = "";
          loadGlobalChat();
        }
      } catch (err) {
        console.error("Error loading session from nav:", err);
      }
    }
    loadNavigationHistory();
    function enterDiscoveryMode() {
      welcomeScreen.classList.add("hidden");
      workspaceScreen.classList.remove("hidden");
      workspaceScreen.classList.add("discovery-mode");
      if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = "flex";
    }
    function activateSplitScreen() {
      workspaceScreen.classList.remove("discovery-mode");
      if (toggleSidebarBtn) toggleSidebarBtn.classList.remove("hidden");
      chatInput.placeholder = "Type your response...";
      if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = "flex";
    }
    let currentViewMode = "split";
    let isResizing = false;
    const headerSplitToggleBtn = document.getElementById("header-split-toggle-btn");
    const canvasFullscreenBtn = document.getElementById("canvas-fullscreen-btn");
    if (headerSplitToggleBtn) headerSplitToggleBtn.style.display = "none";
    function setWorkspaceViewMode(mode) {
      currentViewMode = mode;
      chatSidebar.classList.remove("collapsed");
      canvasPanel.classList.remove("collapsed");
      workspaceScreen.classList.remove("chat-only-mode");
      workspaceScreen.classList.remove("canvas-only-mode");
      panelResizer.style.display = "block";
      if (mode === "canvas-only") {
        chatSidebar.classList.add("collapsed");
        workspaceScreen.classList.add("canvas-only-mode");
        panelResizer.style.display = "none";
        if (headerSplitToggleBtn) headerSplitToggleBtn.classList.remove("active");
      } else if (mode === "chat-only") {
        canvasPanel.classList.add("collapsed");
        workspaceScreen.classList.add("chat-only-mode");
        panelResizer.style.display = "none";
        if (headerSplitToggleBtn) headerSplitToggleBtn.classList.remove("active");
      } else {
        if (headerSplitToggleBtn) headerSplitToggleBtn.classList.add("active");
      }
    }
    headerSplitToggleBtn?.addEventListener("click", () => {
      setWorkspaceViewMode(currentViewMode === "chat-only" ? "split" : "chat-only");
    });
    canvasFullscreenBtn?.addEventListener("click", () => {
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
      const codeBlocks = [];
      let formatted = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
        const escapedCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const langLabel = (lang || "code").toUpperCase();
        const blockHtml = `<pre><div class="code-block-header"><span>${langLabel}</span></div><code>${escapedCode}</code></pre>`;
        codeBlocks.push(blockHtml);
        return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
      });
      formatted = formatted.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[blur\](.*?)\[\/blur\]/gi, '<span class="active-recall-blur" title="Click or hover to reveal term" role="button" tabindex="0">$1</span>').replace(/\[\[(.*?)\]\]/g, '<span class="active-recall-blur" title="Click or hover to reveal term" role="button" tabindex="0">$1</span>').replace(/\[(\d+)\]/g, '<span class="citation-chip" title="Citation Source [$1]">$1</span>').replace(/\n/g, "<br>");
      codeBlocks.forEach((block, index) => {
        formatted = formatted.replace(`___CODE_BLOCK_${index}___`, block);
      });
      return formatted;
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
        const prompt2 = chip.dataset.prompt || chip.textContent?.trim() || "";
        welcomeInput.value = prompt2;
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
      const prompt2 = welcomeInput.value.trim();
      if (!prompt2) {
        welcomeInput.focus();
        return;
      }
      enterDiscoveryMode();
      appendMessage("user", prompt2);
      const thinkingWrapper = appendMessage("assistant", '<div class="thinking-dots"><span></span><span></span><span></span></div>');
      try {
        const formData = new FormData();
        formData.append("initial_prompt", prompt2);
        selectedFiles.forEach((file) => formData.append("documents", file));
        const response = await fetch("/api/sessions/start", { method: "POST", body: formData });
        if (!response.ok) throw new Error("Failed to start session");
        const data = await response.json();
        sessionId = data.sessionId;
        calibration = data.calibration.level;
        thinkingWrapper.remove();
        if (headerCalibration) headerCalibration.textContent = calibration;
        if (headerStatus) headerStatus.classList.remove("hidden");
        if (canvasSessionTitle) canvasSessionTitle.textContent = prompt2;
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
      if (sidebarNodeTitle) sidebarNodeTitle.textContent = node.title;
      if (sidebarNodeStatus) {
        sidebarNodeStatus.textContent = node.status.toUpperCase();
        sidebarNodeStatus.className = `node-badge ${node.status}`;
      }
      if (exitNodeBtn) exitNodeBtn.style.display = "block";
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
      sidebarNodeTitle.textContent = "Learning Session";
      if (sidebarNodeStatus) {
        sidebarNodeStatus.textContent = "DIAGNOSIS";
      }
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
      if (canvasSessionStats) {
        canvasSessionStats.textContent = `${completedCount} of ${nodes.length} Nodes Completed`;
      }
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
