export type TaskModality =
  | 'code_challenge'
  | 'exam_rubric_challenge'
  | 'scenario_simulation'
  | 'creative_synthesis_challenge'
  | 'dialogue_simulation'
  | 'math_proof_challenge';

export interface SandboxTask {
  id: string;
  nodeId: string;
  title: string;
  taskType: TaskModality;
  domainCategory?: string;
  instructions: string;
  starterTemplate?: string;
  solutionRubric?: string;
  evaluationCriteria?: string[];
}

export class TaskSandbox {
  private container: HTMLElement;
  private currentTask: SandboxTask | null = null;
  private onSubmitCallback: ((submission: string) => Promise<void>) | null = null;

  constructor(containerId: string) {
    let el = document.getElementById(containerId);
    if (!el) {
      el = document.createElement('div');
      el.id = containerId;
      el.className = 'task-sandbox-container hidden';
      const canvasPanel = document.getElementById('canvas-panel');
      if (canvasPanel) {
        canvasPanel.appendChild(el);
      }
    }
    this.container = el;
  }

  private getModalityMeta(modality: TaskModality): { badge: string; label: string } {
    switch (modality) {
      case 'code_challenge':
        return { badge: '💻 Code Simulation', label: 'Solution Code' };
      case 'exam_rubric_challenge':
        return { badge: '📝 Exam Rubric Challenge', label: 'Written Response' };
      case 'scenario_simulation':
        return { badge: '💼 Strategic Case Scenario', label: 'Scenario Analysis & Decision' };
      case 'creative_synthesis_challenge':
        return { badge: '🎨 Creative & Structural Synthesis', label: 'Synthesis Response' };
      case 'dialogue_simulation':
        return { badge: '💬 Interactive Dialogue Simulation', label: 'Dialogue / Translation' };
      case 'math_proof_challenge':
        return { badge: '📐 Quantitative Proof Challenge', label: 'Step-by-Step Proof' };
      default:
        return { badge: '🎯 Domain Task Challenge', label: 'Task Response' };
    }
  }

  public render(task: SandboxTask, onSubmit: (submission: string) => Promise<void>): void {
    this.currentTask = task;
    this.onSubmitCallback = onSubmit;

    const meta = this.getModalityMeta(task.taskType);

    this.container.classList.remove('hidden');
    this.container.innerHTML = `
      <div class="sandbox-header">
        <div class="sandbox-title-group">
          <span class="sandbox-badge">${meta.badge}${task.domainCategory ? ` · ${task.domainCategory}` : ''}</span>
          <h4 class="sandbox-title">${task.title}</h4>
        </div>
        <button class="sandbox-close-btn" id="sandbox-close-btn" title="Close Task Sandbox">×</button>
      </div>

      <div class="sandbox-body">
        <div class="sandbox-instructions">
          <h5>Challenge Instructions</h5>
          <p>${task.instructions}</p>
          ${task.solutionRubric ? `<div class="sandbox-rubric"><strong>Evaluation Criteria:</strong> ${task.solutionRubric}</div>` : ''}
        </div>

        <div class="sandbox-editor-wrapper">
          <div class="sandbox-editor-header">
            <span>${meta.label}</span>
          </div>
          <textarea id="sandbox-editor-input" class="sandbox-editor-textarea" placeholder="Write your response here...">${task.starterTemplate || ''}</textarea>
        </div>

        <div class="sandbox-actions">
          <button id="sandbox-submit-btn" class="sandbox-submit-btn">Submit Solution for Evaluation</button>
        </div>

        <div id="sandbox-feedback-area" class="sandbox-feedback-area hidden"></div>
      </div>
    `;

    document.getElementById('sandbox-close-btn')?.addEventListener('click', () => {
      this.hide();
    });

    document.getElementById('sandbox-submit-btn')?.addEventListener('click', async () => {
      const inputEl = document.getElementById('sandbox-editor-input') as HTMLTextAreaElement;
      const feedbackEl = document.getElementById('sandbox-feedback-area');
      const submitBtn = document.getElementById('sandbox-submit-btn') as HTMLButtonElement;

      if (!inputEl || !inputEl.value.trim()) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Evaluating Solution...';
      }

      if (feedbackEl) {
        feedbackEl.classList.remove('hidden');
        feedbackEl.innerHTML = `<div class="sandbox-eval-spinner">Running domain evaluation & rubric analysis...</div>`;
      }

      if (this.onSubmitCallback) {
        await this.onSubmitCallback(inputEl.value);
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Submit Solution for Evaluation';
      }
    });
  }

  public showFeedback(
    score: number,
    passed: boolean,
    feedback: string,
    misconceptions: string[] = [],
    strengths: string[] = []
  ): void {
    const feedbackEl = document.getElementById('sandbox-feedback-area');
    if (!feedbackEl) return;

    feedbackEl.classList.remove('hidden');
    const badgeClass = passed ? 'feedback-pass' : 'feedback-refine';
    const badgeText = passed ? '✅ PASSED (Score: ' + Math.round(score * 100) + '%)' : '⚠️ REFINEMENT NEEDED (Score: ' + Math.round(score * 100) + '%)';

    feedbackEl.innerHTML = `
      <div class="sandbox-result-badge ${badgeClass}">${badgeText}</div>
      <div class="sandbox-result-text">${feedback}</div>
      ${strengths.length > 0 ? `
        <div class="sandbox-strengths" style="margin-top: 10px; font-size: 12px; color: #34d399;">
          <strong>Demonstrated Strengths:</strong>
          <ul>${strengths.map((s) => `<li>${s}</li>`).join('')}</ul>
        </div>
      ` : ''}
      ${misconceptions.length > 0 ? `
        <div class="sandbox-misconceptions" style="margin-top: 10px; font-size: 12px; color: #fb7185;">
          <strong>Key Focus Areas:</strong>
          <ul>${misconceptions.map((m) => `<li>${m}</li>`).join('')}</ul>
        </div>
      ` : ''}
    `;
  }

  public hide(): void {
    this.container.classList.add('hidden');
  }
}
