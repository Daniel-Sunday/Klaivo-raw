export class ChatController {
  private chatHistoryElement: HTMLElement | null;
  private chatInputElement: HTMLTextAreaElement | null;

  constructor(chatHistoryId: string, chatInputId: string) {
    this.chatHistoryElement = document.getElementById(chatHistoryId);
    this.chatInputElement = document.getElementById(chatInputId) as HTMLTextAreaElement;
    this.initAutoResize();
  }

  private initAutoResize(): void {
    if (!this.chatInputElement) return;
    this.chatInputElement.addEventListener('input', () => {
      this.chatInputElement!.style.height = 'auto';
      this.chatInputElement!.style.height = `${Math.min(this.chatInputElement!.scrollHeight, 160)}px`;
    });
  }

  public appendMessage(sender: 'user' | 'assistant', content: string): void {
    if (!this.chatHistoryElement) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}-message`;
    msgDiv.textContent = content;
    this.chatHistoryElement.appendChild(msgDiv);
    this.chatHistoryElement.scrollTop = this.chatHistoryElement.scrollHeight;
  }

  public clearHistory(): void {
    if (this.chatHistoryElement) {
      this.chatHistoryElement.innerHTML = '';
    }
  }

  public getInputValue(): string {
    return this.chatInputElement?.value.trim() || '';
  }

  public clearInput(): void {
    if (this.chatInputElement) {
      this.chatInputElement.value = '';
      this.chatInputElement.style.height = 'auto';
    }
  }
}
