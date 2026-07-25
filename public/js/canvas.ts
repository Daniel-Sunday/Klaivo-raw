import { CurriculumNode } from '../../types';

export class ConceptCanvas {
  private svg: SVGSVGElement;
  private viewport: SVGGElement;
  private edgesGroup: SVGGElement;
  private nodesGroup: SVGGElement;
  
  private panX: number = 0;
  private panY: number = 0;
  private zoom: number = 1;
  private isDragging: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  
  private nodes: CurriculumNode[] = [];
  private onNodeClickCallback: ((node: CurriculumNode) => void) | null = null;
  private thinkingHudEl: HTMLElement | null = null;
  private thinkingAgentEl: HTMLElement | null = null;
  private thinkingStreamEl: HTMLElement | null = null;
  
  constructor(svgId: string) {
    this.svg = document.getElementById(svgId) as unknown as SVGSVGElement;
    this.viewport = document.getElementById('canvas-viewport') as unknown as SVGGElement;
    this.edgesGroup = document.getElementById('svg-edges') as unknown as SVGGElement;
    this.nodesGroup = document.getElementById('svg-nodes') as unknown as SVGGElement;

    this.thinkingHudEl = document.getElementById('canvas-thinking-hud');
    this.thinkingAgentEl = document.getElementById('thinking-agent-name');
    this.thinkingStreamEl = document.getElementById('thinking-stream-text');
    
    this.initDefs();
    this.initEvents();
  }

  /** Initialize SVG Defs (Patterns, Gradients, Filters) */
  private initDefs(): void {
    if (!this.svg) return;
    let defs = this.svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      this.svg.insertBefore(defs, this.svg.firstChild);
    }
    
    defs.innerHTML = `
      <!-- Canvas Grid Pattern -->
      <pattern id="canvas-grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
        <circle cx="16" cy="16" r="1.2" fill="rgba(255, 255, 255, 0.07)"/>
      </pattern>
      
      <!-- Glow Filters -->
      <filter id="glow-active" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    `;

    // Ensure background pattern rect exists
    let bgRect = this.svg.querySelector('.canvas-grid-bg');
    if (!bgRect) {
      bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('class', 'canvas-grid-bg');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', 'url(#canvas-grid-pattern)');
      if (this.viewport) {
        this.svg.insertBefore(bgRect, this.viewport);
      } else {
        this.svg.appendChild(bgRect);
      }
    }
  }

  private initEvents(): void {
    if (!this.svg) return;

    // Panning events
    this.svg.addEventListener('mousedown', (e: MouseEvent) => {
      if ((e.target as Element).closest('.svg-node-group')) return;
      this.isDragging = true;
      this.svg.style.cursor = 'grabbing';
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.applyTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.svg.style.cursor = 'grab';
      }
    });

    // Zooming events
    this.svg.addEventListener('wheel', (e: WheelEvent) => {
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

    // Button controls
    document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.zoomStep(1.2));
    document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.zoomStep(1/1.2));
    document.getElementById('zoom-reset-btn')?.addEventListener('click', () => this.resetView());
  }

  private zoomStep(factor: number): void {
    if (!this.svg) return;
    const width = this.svg.clientWidth || 800;
    const height = this.svg.clientHeight || 600;
    
    const canvasCenterX = (width / 2 - this.panX) / this.zoom;
    const canvasCenterY = (height / 2 - this.panY) / this.zoom;
    
    this.zoom = Math.max(0.4, Math.min(this.zoom * factor, 2.5));
    this.panX = width / 2 - canvasCenterX * this.zoom;
    this.panY = height / 2 - canvasCenterY * this.zoom;
    
    this.applyTransform();
  }

  public resetView(): void {
    if (this.nodes && this.nodes.length > 0) {
      this.autoCenterTree(this.nodes);
    } else {
      this.panX = 0;
      this.panY = 0;
      this.zoom = 1;
      this.applyTransform();
    }
  }

  private autoCenterTree(nodes: CurriculumNode[]): void {
    if (!nodes || nodes.length === 0 || !this.svg) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    nodes.forEach(n => {
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

  private applyTransform(): void {
    if (this.viewport) {
      this.viewport.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.zoom})`);
    }
  }

  // ── Ghostly Thinking Stream HUD Public API ──

  public showThinking(agentName: string, thoughtText: string): void {
    if (!this.thinkingHudEl) this.thinkingHudEl = document.getElementById('canvas-thinking-hud');
    if (!this.thinkingAgentEl) this.thinkingAgentEl = document.getElementById('thinking-agent-name');
    if (!this.thinkingStreamEl) this.thinkingStreamEl = document.getElementById('thinking-stream-text');

    if (this.thinkingAgentEl) this.thinkingAgentEl.textContent = agentName;
    if (this.thinkingStreamEl) {
      this.thinkingStreamEl.textContent = thoughtText;
      this.thinkingStreamEl.classList.remove('error-text');
    }

    const dot = this.thinkingHudEl?.querySelector('.thinking-hud-dot');
    if (dot) {
      dot.className = 'thinking-hud-dot';
    }

    if (this.thinkingHudEl) {
      this.thinkingHudEl.classList.remove('hidden');
    }
  }

  public showThinkingError(agentName: string, errorMessage: string): void {
    if (!this.thinkingHudEl) this.thinkingHudEl = document.getElementById('canvas-thinking-hud');
    if (!this.thinkingAgentEl) this.thinkingAgentEl = document.getElementById('thinking-agent-name');
    if (!this.thinkingStreamEl) this.thinkingStreamEl = document.getElementById('thinking-stream-text');

    if (this.thinkingAgentEl) this.thinkingAgentEl.textContent = agentName;
    if (this.thinkingStreamEl) {
      this.thinkingStreamEl.textContent = errorMessage;
      this.thinkingStreamEl.classList.add('error-text');
    }

    const dot = this.thinkingHudEl?.querySelector('.thinking-hud-dot');
    if (dot) {
      dot.className = 'thinking-hud-dot error';
    }

    if (this.thinkingHudEl) {
      this.thinkingHudEl.classList.remove('hidden');
    }
  }

  public hideThinking(finalStatus?: string): void {
    if (!this.thinkingHudEl) this.thinkingHudEl = document.getElementById('canvas-thinking-hud');
    if (!this.thinkingStreamEl) this.thinkingStreamEl = document.getElementById('thinking-stream-text');

    if (finalStatus && this.thinkingStreamEl) {
      this.thinkingStreamEl.textContent = finalStatus;
      this.thinkingStreamEl.classList.remove('error-text');
      const dot = this.thinkingHudEl?.querySelector('.thinking-hud-dot');
      if (dot) dot.className = 'thinking-hud-dot verified';

      setTimeout(() => {
        if (this.thinkingHudEl) this.thinkingHudEl.classList.add('hidden');
      }, 2400);
    } else if (this.thinkingHudEl) {
      this.thinkingHudEl.classList.add('hidden');
    }
  }

  public onNodeClick(callback: (node: CurriculumNode) => void): void {
    this.onNodeClickCallback = callback;
  }

  public render(nodes: CurriculumNode[], animate: boolean = true): void {
    const oldNodes = this.nodes;
    this.nodes = nodes;
    
    if (!nodes || nodes.length === 0) {
      this.nodesGroup.innerHTML = '';
      this.edgesGroup.innerHTML = '';
      return;
    }

    // Identify removed nodes to trigger dissolve animation before DOM removal
    const newIdSet = new Set(nodes.map(n => n.id));
    oldNodes.forEach(oldNode => {
      if (!newIdSet.has(oldNode.id)) {
        const oldGroup = document.getElementById(`node-group-${oldNode.id}`);
        if (oldGroup) {
          oldGroup.classList.add('dissolving');
          setTimeout(() => {
            if (oldGroup.parentNode) oldGroup.parentNode.removeChild(oldGroup);
          }, 350);
        }
      }
    });

    this.nodesGroup.innerHTML = '';
    this.edgesGroup.innerHTML = '';

    // 1. Draw Paths / Edges
    const nodeMap: Record<string, CurriculumNode> = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    nodes.forEach(node => {
      if (node.dependencies && Array.isArray(node.dependencies)) {
        node.dependencies.forEach(depId => {
          const parentNode = nodeMap[depId];
          if (parentNode) {
            this.drawConnection(parentNode, node, animate);
          }
        });
      }
    });

    // 2. Draw Nodes
    nodes.forEach(node => {
      this.drawNode(node, animate);
    });

    // 3. Auto center view
    this.autoCenterTree(nodes);
  }

  private drawConnection(parent: CurriculumNode, child: CurriculumNode, animate: boolean = true): void {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Connect from right edge of parent to left edge of child
    const pX = parent.x + 210;
    const pY = parent.y + 43;
    const cX = child.x;
    const cY = child.y + 43;
    
    const dx = Math.abs(cX - pX) * 0.5;
    const dStr = `M ${pX} ${pY} C ${pX + dx} ${pY}, ${cX - dx} ${cY}, ${cX} ${cY}`;
    
    path.setAttribute('d', dStr);
    path.setAttribute('class', `svg-edge-path ${child.status}`);
    
    if (child.status === 'completed') {
      path.setAttribute('stroke', '#10b981');
    } else if (child.status === 'active' || child.status === 'available') {
      path.setAttribute('stroke', '#ffffff');
    } else {
      path.setAttribute('stroke', 'rgba(255, 255, 255, 0.12)');
    }
    
    this.edgesGroup.appendChild(path);

    if (animate) {
      const length = Math.ceil(path.getTotalLength ? (path.getTotalLength() || 300) : 300);
      path.style.setProperty('--path-len', `${length}`);
      path.classList.add('animated');
      const edgeDelay = Math.max(0, (child.order_index - 0.5) * 180);
      path.style.animationDelay = `${edgeDelay}ms`;
    }
  }

  private drawNode(node: CurriculumNode, animate: boolean = true): void {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', `svg-node-group ${node.status}`);
    group.setAttribute('id', `node-group-${node.id}`);
    group.style.transformOrigin = `${node.x + 105}px ${node.y + 43}px`;

    if (animate) {
      group.classList.add('animated');
      const nodeDelay = Math.max(0, node.order_index * 180);
      group.style.animationDelay = `${nodeDelay}ms`;
    }
    group.setAttribute('id', `node-group-${node.id}`);
    
    const width = 210;
    const height = 86;
    
    // 1. Ambient Glow filter for active node
    if (node.status === 'active') {
      group.setAttribute('filter', 'url(#glow-active)');
    }

    // 2. Background Glassmorphic Card
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(node.x));
    rect.setAttribute('y', String(node.y));
    rect.setAttribute('width', String(width));
    rect.setAttribute('height', String(height));
    rect.setAttribute('rx', '14');
    rect.setAttribute('ry', '14');
    rect.setAttribute('class', 'svg-node-bg');
    group.appendChild(rect);

    // 3. Left Indicator Status Accent Bar
    const accentBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    accentBar.setAttribute('x', String(node.x));
    accentBar.setAttribute('y', String(node.y));
    accentBar.setAttribute('width', '5');
    accentBar.setAttribute('height', String(height));
    accentBar.setAttribute('rx', '3');
    accentBar.setAttribute('class', `svg-node-accent-bar ${node.status}`);
    group.appendChild(accentBar);
    
    // 4. Icon Container Background
    const iconBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    iconBg.setAttribute('x', String(node.x + 14));
    iconBg.setAttribute('y', String(node.y + 21));
    iconBg.setAttribute('width', '44');
    iconBg.setAttribute('height', '44');
    iconBg.setAttribute('rx', '11');
    iconBg.setAttribute('class', `svg-node-icon-bg ${node.status}`);
    group.appendChild(iconBg);

    // 5. Precision Vector SVG Icon
    const iconGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    iconGroup.setAttribute('transform', `translate(${node.x + 26}, ${node.y + 33})`);
    
    if (node.status === 'completed') {
      iconGroup.appendChild(this.createCheckIcon());
    } else if (node.status === 'active') {
      iconGroup.appendChild(this.createActivePlayIcon());
    } else if (node.status === 'available') {
      iconGroup.appendChild(this.createAvailableTargetIcon());
    } else {
      iconGroup.appendChild(this.createLockIcon());
    }
    group.appendChild(iconGroup);

    // 6. Sequence Order Badge Pill
    const badgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    badgeGroup.setAttribute('transform', `translate(${node.x + 68}, ${node.y + 18})`);
    
    const badgeBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    badgeBg.setAttribute('width', '48');
    badgeBg.setAttribute('height', '15');
    badgeBg.setAttribute('rx', '5');
    badgeBg.setAttribute('class', `svg-node-badge-bg ${node.status}`);
    badgeGroup.appendChild(badgeBg);

    const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    badgeText.setAttribute('x', '24');
    badgeText.setAttribute('y', '11');
    badgeText.setAttribute('text-anchor', 'middle');
    badgeText.setAttribute('class', 'svg-node-badge-text');
    badgeText.textContent = `NODE ${node.order_index + 1}`;
    badgeGroup.appendChild(badgeText);

    group.appendChild(badgeGroup);

    // 7. Title Text
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', String(node.x + 68));
    titleText.setAttribute('y', String(node.y + 49));
    titleText.setAttribute('class', 'svg-node-text-title');
    
    let title = node.title;
    if (title.length > 16) title = title.substring(0, 14) + '…';
    titleText.textContent = title;
    group.appendChild(titleText);
    
    // 8. Description Subtext
    const descText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    descText.setAttribute('x', String(node.x + 68));
    descText.setAttribute('y', String(node.y + 66));
    descText.setAttribute('class', 'svg-node-text-desc');
    
    let desc = node.description || '';
    if (desc.length > 22) desc = desc.substring(0, 20) + '…';
    descText.textContent = desc;
    group.appendChild(descText);

    // Event listener — Learner Autonomy: Allow clicking any node for exploration or challenge
    group.addEventListener('click', () => {
      if (this.onNodeClickCallback) {
        this.onNodeClickCallback(node);
      }
    });

    this.nodesGroup.appendChild(group);
  }

  // --- Vector SVG Icon Helpers ---
  private createCheckIcon(): SVGElement {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = `<path d="M 2 10 L 7 15 L 18 4" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    return g;
  }

  private createActivePlayIcon(): SVGElement {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = `<polygon points="5,3 16,10 5,17" fill="#ffffff"/>`;
    return g;
  }

  private createAvailableTargetIcon(): SVGElement {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = `
      <circle cx="10" cy="10" r="7" fill="none" stroke="#e5e7eb" stroke-width="2"/>
      <circle cx="10" cy="10" r="2.5" fill="#e5e7eb"/>
    `;
    return g;
  }

  private createLockIcon(): SVGElement {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = `
      <rect x="3" y="8" width="14" height="10" rx="2" fill="none" stroke="#64748b" stroke-width="2"/>
      <path d="M 6 8 V 5 A 4 4 0 0 1 14 5 V 8" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
    `;
    return g;
  }
}
