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
    const landingScreen = document.getElementById("landing-screen");
    const workspaceScreen = document.getElementById("workspace-screen");
    const headerStatus = document.getElementById("header-status");
    const headerCalibration = document.getElementById("header-calibration");
    const progressOverlay = document.getElementById("progress-overlay");
    const progressText = document.getElementById("progress-text");
    const initialPromptTextarea = document.getElementById("initial-prompt");
    const onboardingFileInput = document.getElementById("onboarding-file-input");
    const onboardingFilesList = document.getElementById("onboarding-files-list");
    const startSessionBtn = document.getElementById("start-session-btn");
    const sidebarNodeTitle = document.getElementById("sidebar-node-title");
    const sidebarNodeStatus = document.getElementById("sidebar-node-status");
    const exitNodeBtn = document.getElementById("exit-node-btn");
    const chatHistory = document.getElementById("chat-history");
    const chatInput = document.getElementById("chat-input");
    const sendChatBtn = document.getElementById("send-chat-btn");
    const canvasSessionTitle = document.getElementById("canvas-session-title");
    const canvasSessionStats = document.getElementById("canvas-session-stats");
    const canvas = new ConceptCanvas("concept-svg");
    function showLoader(text) {
      progressText.textContent = text;
      progressOverlay.classList.remove("hidden");
    }
    function hideLoader() {
      progressOverlay.classList.add("hidden");
    }
    function formatMarkdown(text) {
      if (!text) return "";
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
    }
    function appendMessage(sender, content, nodeId = null) {
      const wrapper = document.createElement("div");
      wrapper.className = `message-wrapper ${sender}`;
      if (nodeId) wrapper.dataset.nodeId = nodeId;
      const bubble = document.createElement("div");
      bubble.className = "message-bubble";
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
      wrapper.appendChild(bubble);
      chatHistory.appendChild(wrapper);
      chatHistory.scrollTop = chatHistory.scrollHeight;
      return wrapper;
    }
    onboardingFileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        if (selectedFiles.some((f) => f.name === file.name)) return;
        selectedFiles.push(file);
        const tag = document.createElement("div");
        tag.className = "uploaded-file-tag";
        tag.innerHTML = `\u{1F4C4} ${file.name.substring(0, 15)}... <span class="remove-file-btn" data-name="${file.name}">\xD7</span>`;
        onboardingFilesList.appendChild(tag);
      });
      onboardingFileInput.value = "";
    });
    onboardingFilesList.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("remove-file-btn")) {
        const fileName = target.dataset.name;
        selectedFiles = selectedFiles.filter((f) => f.name !== fileName);
        target.parentElement?.remove();
      }
    });
    startSessionBtn.addEventListener("click", async () => {
      const prompt = initialPromptTextarea.value.trim();
      if (!prompt) {
        alert("Please enter what you want to learn first!");
        return;
      }
      showLoader("Starting your learning session...");
      try {
        const formData = new FormData();
        formData.append("initial_prompt", prompt);
        selectedFiles.forEach((file) => {
          formData.append("documents", file);
        });
        const response = await fetch("/api/sessions/start", {
          method: "POST",
          body: formData
        });
        if (!response.ok) throw new Error("Failed to start session");
        const data = await response.json();
        sessionId = data.sessionId;
        calibration = data.calibration.level;
        headerCalibration.textContent = calibration;
        headerStatus.classList.remove("hidden");
        canvasSessionTitle.textContent = prompt;
        landingScreen.classList.add("hidden");
        workspaceScreen.classList.remove("hidden");
        chatHistory.innerHTML = "";
        appendMessage("assistant", data.diagnosticQuestion);
        if (data.nodes && data.nodes.length > 0) {
          nodes = data.nodes;
          canvas.render(nodes);
          updateStats();
        }
      } catch (err) {
        console.error(err);
        alert("Error initializing session: " + err.message);
      } finally {
        hideLoader();
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
      showLoader(`Opening node: ${node.title}...`);
      try {
        const chatResponse = await fetch(`/api/sessions/${sessionId}/nodes/${node.id}/chat`);
        if (chatResponse.ok) {
          const history = await chatResponse.json();
          if (history.length > 0) {
            history.forEach((msg) => {
              appendMessage(msg.sender, msg.content, node.id);
            });
            hideLoader();
            return;
          }
        }
        appendMessage("assistant", `Loading explanation for **${node.title}**...`);
        hideLoader();
        const streamUrl = `/api/sessions/${sessionId}/nodes/${node.id}/teach`;
        const response = await fetch(streamUrl);
        if (!response.ok) throw new Error("Teaching agent failed");
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Response body reader not available");
        const decoder = new TextDecoder("utf-8");
        let currentMsgWrapper = null;
        let streamedContent = "";
        chatHistory.lastElementChild?.remove();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          streamedContent += chunk;
          if (!currentMsgWrapper) {
            currentMsgWrapper = appendMessage("assistant", streamedContent, node.id);
          } else {
            currentMsgWrapper.querySelector(".message-bubble").innerHTML = formatMarkdown(streamedContent);
            chatHistory.scrollTop = chatHistory.scrollHeight;
          }
        }
      } catch (err) {
        console.error(err);
        appendMessage("assistant", `Failed to load learning content. Please try clicking the node again.`);
      } finally {
        hideLoader();
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
              if (!msg.node_id) {
                appendMessage(msg.sender, msg.content);
              }
            });
          }
        }
      } catch (err) {
        console.error("Error reloading global chat:", err);
      }
    }
    sendChatBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });
    async function sendMessage() {
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = "";
      appendMessage("user", text, activeNodeId);
      showLoader("Klaivo is thinking...");
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
            hideLoader();
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
            hideLoader();
            const reader = response.body?.getReader();
            if (!reader) throw new Error("Response body reader not available");
            const decoder = new TextDecoder("utf-8");
            let currentMsgWrapper = null;
            let streamedContent = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              streamedContent += chunk;
              if (!currentMsgWrapper) {
                currentMsgWrapper = appendMessage("assistant", streamedContent, activeNodeId);
              } else {
                currentMsgWrapper.querySelector(".message-bubble").innerHTML = formatMarkdown(streamedContent);
                chatHistory.scrollTop = chatHistory.scrollHeight;
              }
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
          appendMessage("assistant", data.response);
          if (data.status === "learning" || data.nodes && data.nodes.length > 0) {
            nodes = data.nodes;
            canvas.render(nodes);
            updateStats();
            appendMessage("assistant", "\u{1F389} Your personalized learning tree has been built! Click on the first unlocked node (marked in blue) on the right to start learning.");
          }
        }
      } catch (err) {
        console.error(err);
        appendMessage("assistant", `Sorry, something went wrong processing that request: ${err.message}`);
      } finally {
        hideLoader();
      }
    }
    function updateStats() {
      const completedCount = nodes.filter((n) => n.status === "completed").length;
      const totalCount = nodes.length;
      canvasSessionStats.textContent = `${completedCount} of ${totalCount} Nodes Completed`;
    }
  });
})();
//# sourceMappingURL=app.js.map
