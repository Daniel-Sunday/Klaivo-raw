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
  
  constructor(svgId: string) {
    this.svg = document.getElementById(svgId) as unknown as SVGSVGElement;
    this.viewport = document.getElementById('canvas-viewport') as unknown as SVGGElement;
    this.edgesGroup = document.getElementById('svg-edges') as unknown as SVGGElement;
    this.nodesGroup = document.getElementById('svg-nodes') as unknown as SVGGElement;
    
    this.initEvents();
  }

  private initEvents(): void {
    // Panning events
    this.svg.addEventListener('mousedown', (e: MouseEvent) => {
      // Prevent drag initiation on nodes themselves
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
      
      // Calculate mouse position relative to canvas coordinate space before zoom
      const canvasMouseX = (mouseX - this.panX) / this.zoom;
      const canvasMouseY = (mouseY - this.panY) / this.zoom;
      
      if (e.deltaY < 0) {
        this.zoom = Math.min(this.zoom * zoomFactor, 3);
      } else {
        this.zoom = Math.max(this.zoom / zoomFactor, 0.4);
      }
      
      // Adjust pan to zoom into cursor point
      this.panX = mouseX - canvasMouseX * this.zoom;
      this.panY = mouseY - canvasMouseY * this.zoom;
      
      this.applyTransform();
    });

    // Button controls
    (document.getElementById('zoom-in-btn') as HTMLElement).addEventListener('click', () => this.zoomStep(1.2));
    (document.getElementById('zoom-out-btn') as HTMLElement).addEventListener('click', () => this.zoomStep(1/1.2));
    (document.getElementById('zoom-reset-btn') as HTMLElement).addEventListener('click', () => this.resetView());
  }

  private zoomStep(factor: number): void {
    const width = this.svg.clientWidth;
    const height = this.svg.clientHeight;
    
    // Zoom around the center of the viewport
    const canvasCenterX = (width / 2 - this.panX) / this.zoom;
    const canvasCenterY = (height / 2 - this.panY) / this.zoom;
    
    this.zoom = Math.max(0.4, Math.min(this.zoom * factor, 3));
    this.panX = width / 2 - canvasCenterX * this.zoom;
    this.panY = height / 2 - canvasCenterY * this.zoom;
    
    this.applyTransform();
  }

  public resetView(): void {
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.applyTransform();
  }

  private applyTransform(): void {
    this.viewport.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.zoom})`);
  }

  public onNodeClick(callback: (node: CurriculumNode) => void): void {
    this.onNodeClickCallback = callback;
  }

  public render(nodes: CurriculumNode[]): void {
    this.nodes = nodes;
    this.nodesGroup.innerHTML = '';
    this.edgesGroup.innerHTML = '';
    
    if (!nodes || nodes.length === 0) return;

    // 1. Draw Paths / Edges
    // Build a map of nodes for easy coordinate lookup
    const nodeMap: Record<string, CurriculumNode> = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    nodes.forEach(node => {
      if (node.dependencies && Array.isArray(node.dependencies)) {
        node.dependencies.forEach(depId => {
          const parentNode = nodeMap[depId];
          if (parentNode) {
            this.drawConnection(parentNode, node);
          }
        });
      }
    });

    // 2. Draw Nodes
    nodes.forEach(node => {
      this.drawNode(node);
    });
  }

  private drawConnection(parent: CurriculumNode, child: CurriculumNode): void {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Calculate S-curve path points from parent (x, y) to child (x, y)
    // Starting at center of nodes (nodes are 180x80 box, so center x + 90, center y + 40)
    const pX = parent.x + 90;
    const pY = parent.y + 40;
    const cX = child.x + 90;
    const cY = child.y + 40;
    
    // Cubic bezier anchor points to make a smooth curve
    // We want the path to move out horizontally, then up, then in
    const midX = (pX + cX) / 2;
    const dStr = `M ${pX} ${pY} C ${midX} ${pY}, ${midX} ${cY}, ${cX} ${cY}`;
    
    path.setAttribute('d', dStr);
    path.setAttribute('class', `svg-edge-path ${child.status}`);
    
    this.edgesGroup.appendChild(path);
  }

  private drawNode(node: CurriculumNode): void {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', `svg-node-group ${node.status}`);
    group.setAttribute('id', `node-group-${node.id}`);
    
    // Node dimensions: 180 width, 80 height
    const width = 180;
    const height = 80;
    
    // Background Card
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(node.x));
    rect.setAttribute('y', String(node.y));
    rect.setAttribute('width', String(width));
    rect.setAttribute('height', String(height));
    rect.setAttribute('class', 'svg-node-bg');
    group.appendChild(rect);
    
    // Colored Status Icon Wrapper background
    const iconBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    iconBg.setAttribute('x', String(node.x + 12));
    iconBg.setAttribute('y', String(node.y + 16));
    iconBg.setAttribute('width', '48');
    iconBg.setAttribute('height', '48');
    iconBg.setAttribute('class', 'svg-node-icon-bg');
    group.appendChild(iconBg);

    // Status Indicator Symbol
    const symbolText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    symbolText.setAttribute('x', String(node.x + 36));
    symbolText.setAttribute('y', String(node.y + 45));
    symbolText.setAttribute('text-anchor', 'middle');
    symbolText.setAttribute('dominant-baseline', 'middle');
    symbolText.setAttribute('font-size', '16');
    symbolText.setAttribute('fill', node.status === 'completed' ? '#10b981' : node.status === 'active' || node.status === 'available' ? '#6366f1' : '#64748b');
    
    let symbol = '🔒';
    if (node.status === 'completed') symbol = '✓';
    else if (node.status === 'active') symbol = '➔';
    else if (node.status === 'available') symbol = '○';
    symbolText.textContent = symbol;
    group.appendChild(symbolText);

    // Title Text (Truncated if too long)
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', String(node.x + 72));
    titleText.setAttribute('y', String(node.y + 32));
    titleText.setAttribute('class', 'svg-node-text-title');
    
    let title = node.title;
    if (title.length > 14) title = title.substring(0, 12) + '...';
    titleText.textContent = title;
    group.appendChild(titleText);
    
    // Description Subtext
    const descText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    descText.setAttribute('x', String(node.x + 72));
    descText.setAttribute('y', String(node.y + 48));
    descText.setAttribute('class', 'svg-node-text-desc');
    
    let desc = node.description || '';
    if (desc.length > 20) desc = desc.substring(0, 18) + '...';
    descText.textContent = desc;
    group.appendChild(descText);

    // Order Badge
    const badgeBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    badgeBg.setAttribute('x', String(node.x + 72));
    badgeBg.setAttribute('y', String(node.y + 56));
    badgeBg.setAttribute('width', '45');
    badgeBg.setAttribute('height', '14');
    badgeBg.setAttribute('class', 'svg-node-badge-bg');
    group.appendChild(badgeBg);

    const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    badgeText.setAttribute('x', String(node.x + 94)); // Centered relative to badgeBg
    badgeText.setAttribute('y', String(node.y + 66));
    badgeText.setAttribute('text-anchor', 'middle');
    badgeText.setAttribute('class', 'svg-node-badge-text');
    badgeText.textContent = `Node ${node.order_index + 1}`;
    group.appendChild(badgeText);

    // Event listener
    group.addEventListener('click', () => {
      if (node.status === 'locked') return;
      if (this.onNodeClickCallback) {
        this.onNodeClickCallback(node);
      }
    });

    this.nodesGroup.appendChild(group);
  }
}
