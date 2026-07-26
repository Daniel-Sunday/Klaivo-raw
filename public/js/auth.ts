/**
 * Client-Side Authentication Manager for Klaivo (Supabase Auth)
 */

export interface AuthUser {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

class AuthManager {
  private user: AuthUser | null = null;
  private token: string | null = null;
  private authStateCallbacks: Array<(user: AuthUser | null) => void> = [];

  constructor() {
    this.loadPersistedAuth();
  }

  private loadPersistedAuth() {
    try {
      const storedToken = localStorage.getItem('klaivo_auth_token');
      const storedUser = localStorage.getItem('klaivo_user');
      if (storedToken && storedUser) {
        this.token = storedToken;
        this.user = JSON.parse(storedUser);
      }
    } catch (e) {
      console.warn('[Auth] Error parsing persisted auth:', e);
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): AuthUser | null {
    return this.user;
  }

  public isAuthenticated(): boolean {
    return !!this.user && !!this.token;
  }

  public getAuthHeaders(): Record<string, string> {
    if (this.token) {
      return { Authorization: `Bearer ${this.token}` };
    }
    return {};
  }

  public onAuthStateChanged(cb: (user: AuthUser | null) => void) {
    this.authStateCallbacks.push(cb);
    cb(this.user);
  }

  private notifyStateChange() {
    this.authStateCallbacks.forEach((cb) => cb(this.user));
  }

  public setSession(user: AuthUser, token: string) {
    this.user = user;
    this.token = token;
    localStorage.setItem('klaivo_auth_token', token);
    localStorage.setItem('klaivo_user', JSON.stringify(user));
    this.updateUserNavUI();
    this.notifyStateChange();
  }

  public clearSession() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('klaivo_auth_token');
    localStorage.removeItem('klaivo_user');
    this.updateUserNavUI();
    this.notifyStateChange();
  }

  /**
   * Verify session with server on initial page load
   */
  public async checkSession(): Promise<AuthUser | null> {
    if (!this.token) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.user = data.user;
          localStorage.setItem('klaivo_user', JSON.stringify(data.user));
          this.updateUserNavUI();
          this.notifyStateChange();
          return this.user;
        }
      }
      // If token invalid, clear
      this.clearSession();
      return null;
    } catch (err) {
      console.warn('[Auth] Verification check error:', err);
      return this.user;
    }
  }

  /**
   * Initialize Auth UI DOM Elements & Event Listeners
   */
  public initUI(onSessionRefreshRequested?: () => void) {
    this.renderUserNavSlot();
    this.renderAuthModal();
    this.bindEvents(onSessionRefreshRequested);
    this.updateUserNavUI();
  }

  /**
   * Render User Slot at the bottom of the Left Nav Sidebar (.app-left-nav)
   */
  private renderUserNavSlot() {
    const leftNav = document.getElementById('app-left-nav');
    if (!leftNav) return;

    if (document.getElementById('user-profile-slot')) return;

    const slotContainer = document.createElement('div');
    slotContainer.className = 'user-profile-slot-container';
    slotContainer.id = 'user-profile-slot-container';
    slotContainer.innerHTML = `
      <div class="user-profile-slot" id="user-profile-slot">
        <div class="user-avatar-wrapper" id="user-avatar-wrapper">
          <span class="user-avatar-initials" id="user-avatar-initials">?</span>
        </div>
        <div class="user-info-text">
          <span class="user-display-name" id="user-display-name">Log in / Sign up</span>
          <span class="user-subtext" id="user-subtext">Save history & memory</span>
        </div>
        <div class="user-slot-action-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      <!-- Popover Menu for Logged In User -->
      <div class="user-popover-menu hidden" id="user-popover-menu">
        <div class="popover-user-header">
          <div class="popover-user-name" id="popover-user-name">Learner</div>
          <div class="popover-user-email" id="popover-user-email">learner@klaivo.com</div>
        </div>
        <div class="popover-divider"></div>
        <button class="popover-menu-item danger" id="popover-logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    `;

    leftNav.appendChild(slotContainer);
  }

  /**
   * Render Full-Screen Auth Overlay in document.body (Perplexity-Style Overlay)
   */
  private renderAuthModal() {
    if (document.getElementById('auth-modal')) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'auth-modal-overlay hidden';
    modalOverlay.id = 'auth-modal';
    modalOverlay.innerHTML = `
      <button class="auth-top-close" id="auth-modal-close" title="Close" aria-label="Close dialog">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="auth-fullscreen-container">
        <div class="auth-modal-header">
          <h1 class="auth-modal-title" id="auth-modal-title">Sign in to save your personalized learning paths & memory</h1>
        </div>

        <!-- Social Auth Option -->
        <div class="auth-social-group">
          <button type="button" class="auth-social-btn primary-social" id="auth-google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div class="auth-modal-divider"></div>

        <!-- Form Error Alert Banner -->
        <div class="auth-error-banner hidden" id="auth-error-banner"></div>

        <form class="auth-form" id="auth-form" autocomplete="on">
          <div class="auth-field-group hidden" id="auth-name-group">
            <input type="text" id="auth-input-name" class="auth-input" placeholder="Full name" autocomplete="name" />
          </div>

          <div class="auth-field-group">
            <input type="email" id="auth-input-email" class="auth-input" placeholder="Enter your email" required autocomplete="email" />
          </div>

          <div class="auth-field-group" id="auth-password-group">
            <input type="password" id="auth-input-password" class="auth-input" placeholder="Enter your password" required autocomplete="current-password" minlength="6" />
          </div>

          <button type="submit" class="auth-submit-btn" id="auth-submit-btn">
            <span id="auth-submit-text">Continue with email</span>
            <div class="auth-spinner hidden" id="auth-spinner"></div>
          </button>
        </form>

        <div class="auth-modal-footer">
          <div class="auth-mode-switch-footer" id="auth-mode-switch-container">
            <span id="auth-switch-text">Don't have an account?</span>
            <button type="button" class="auth-switch-btn" id="auth-switch-mode-btn">Sign Up</button>
          </div>
          <button type="button" class="auth-sso-link" id="auth-sso-btn">Single sign-on (SSO)</button>
        </div>

        <div class="auth-bottom-close-container">
          <button type="button" class="auth-bottom-close-btn" id="auth-bottom-close-btn">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);
  }

  /**
   * Bind event listeners for slot, modal, tabs, form, and popover
   */
  private bindEvents(onSessionRefreshRequested?: () => void) {
    const slot = document.getElementById('user-profile-slot');
    const popover = document.getElementById('user-popover-menu');
    const modal = document.getElementById('auth-modal');
    const closeBtn = document.getElementById('auth-modal-close');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');
    const form = document.getElementById('auth-form') as HTMLFormElement;
    const logoutBtn = document.getElementById('popover-logout-btn');

    let currentMode: 'login' | 'signup' = 'login';

    // Click Left Nav User Profile Slot
    slot?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.isAuthenticated()) {
        popover?.classList.toggle('hidden');
      } else {
        this.openAuthModal('login');
      }
    });

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
      if (popover && !popover.contains(e.target as Node) && !slot?.contains(e.target as Node)) {
        popover.classList.add('hidden');
      }
    });

    // Modal Close Buttons (Only explicit close triggers)
    closeBtn?.addEventListener('click', () => this.closeAuthModal());
    document.getElementById('auth-bottom-close-btn')?.addEventListener('click', () => this.closeAuthModal());

    // Social & SSO Buttons
    document.getElementById('auth-google-btn')?.addEventListener('click', () => {
      this.showError('Google OAuth is ready to connect with your Supabase Auth provider.');
    });
    document.getElementById('auth-apple-btn')?.addEventListener('click', () => {
      this.showError('Apple OAuth is ready to connect with your Supabase Auth provider.');
    });
    document.getElementById('auth-sso-btn')?.addEventListener('click', () => {
      this.showError('Single Sign-On (SSO) is available for enterprise organizations.');
    });

    // Mode Switcher (Sign In vs Create Account)
    const switchBtn = document.getElementById('auth-switch-mode-btn');
    const switchText = document.getElementById('auth-switch-text');
    const nameGroup = document.getElementById('auth-name-group');
    const submitText = document.getElementById('auth-submit-text');

    switchBtn?.addEventListener('click', () => {
      if (currentMode === 'login') {
        currentMode = 'signup';
        nameGroup?.classList.remove('hidden');
        if (submitText) submitText.textContent = 'Create Account';
        if (switchText) switchText.textContent = 'Already have an account?';
        if (switchBtn) switchBtn.textContent = 'Sign In';
      } else {
        currentMode = 'login';
        nameGroup?.classList.add('hidden');
        if (submitText) submitText.textContent = 'Continue with email';
        if (switchText) switchText.textContent = "Don't have an account?";
        if (switchBtn) switchBtn.textContent = 'Sign Up';
      }
      this.clearError();
    });

    // Form Submission
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearError();

      const email = (document.getElementById('auth-input-email') as HTMLInputElement).value.trim();
      const password = (document.getElementById('auth-input-password') as HTMLInputElement).value;
      const fullName = (document.getElementById('auth-input-name') as HTMLInputElement).value.trim();

      if (!email || !password) return;

      this.setSubmitting(true);

      try {
        const endpoint = currentMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
        const bodyPayload: any = { email, password };
        if (currentMode === 'signup' && fullName) {
          bodyPayload.full_name = fullName;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Authentication failed');
        }

        if (data.user && data.token) {
          this.setSession(data.user, data.token);

          // If there was an active guest session, claim it
          const activeSessionId = localStorage.getItem('klaivo_current_session_id');
          if (activeSessionId) {
            try {
              await fetch('/api/sessions/claim', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...this.getAuthHeaders(),
                },
                body: JSON.stringify({ sessionId: activeSessionId }),
              });
            } catch (_) {}
          }

          this.closeAuthModal();

          if (onSessionRefreshRequested) {
            onSessionRefreshRequested();
          }
        } else if (currentMode === 'signup' && !data.session) {
          // Email confirmation required
          this.showError('Registration successful! Please check your email to confirm your account before signing in.');
        }
      } catch (err: any) {
        this.showError(err.message || 'Authentication failed. Please try again.');
      } finally {
        this.setSubmitting(false);
      }
    });

    // Logout Button
    logoutBtn?.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: this.getAuthHeaders(),
        });
      } catch (_) {}
      popover?.classList.add('hidden');
      this.clearSession();
      if (onSessionRefreshRequested) {
        onSessionRefreshRequested();
      }
    });
  }

  public openAuthModal(mode: 'login' | 'signup' = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const switchBtn = document.getElementById('auth-switch-mode-btn');
    const switchText = document.getElementById('auth-switch-text');
    const nameGroup = document.getElementById('auth-name-group');
    const submitText = document.getElementById('auth-submit-text');

    if (mode === 'signup') {
      nameGroup?.classList.remove('hidden');
      if (submitText) submitText.textContent = 'Create Account';
      if (switchText) switchText.textContent = 'Already have an account?';
      if (switchBtn) switchBtn.textContent = 'Sign In';
    } else {
      nameGroup?.classList.add('hidden');
      if (submitText) submitText.textContent = 'Continue with email';
      if (switchText) switchText.textContent = "Don't have an account?";
      if (switchBtn) switchBtn.textContent = 'Sign Up';
    }
  }

  public closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
    this.clearError();
  }

  private showError(msg: string) {
    const banner = document.getElementById('auth-error-banner');
    if (banner) {
      banner.textContent = msg;
      banner.classList.remove('hidden');
    }
  }

  private clearError() {
    const banner = document.getElementById('auth-error-banner');
    if (banner) {
      banner.textContent = '';
      banner.classList.add('hidden');
    }
  }

  private setSubmitting(isSubmitting: boolean) {
    const submitBtn = document.getElementById('auth-submit-btn') as HTMLButtonElement;
    const submitText = document.getElementById('auth-submit-text');
    const spinner = document.getElementById('auth-spinner');

    if (submitBtn) submitBtn.disabled = isSubmitting;
    if (submitText) submitText.style.opacity = isSubmitting ? '0.4' : '1';
    if (spinner) spinner.classList.toggle('hidden', !isSubmitting);
  }

  /**
   * Refresh Left Navigation Profile Slot state
   */
  public updateUserNavUI() {
    const nameEl = document.getElementById('user-display-name');
    const subtextEl = document.getElementById('user-subtext');
    const initialsEl = document.getElementById('user-avatar-initials');
    const popoverName = document.getElementById('popover-user-name');
    const popoverEmail = document.getElementById('popover-user-email');

    if (this.user) {
      const displayName = this.user.display_name || this.user.email.split('@')[0];
      const initials = displayName.slice(0, 2).toUpperCase();

      if (nameEl) nameEl.textContent = displayName;
      if (subtextEl) subtextEl.textContent = this.user.email;
      if (initialsEl) initialsEl.textContent = initials;
      if (popoverName) popoverName.textContent = displayName;
      if (popoverEmail) popoverEmail.textContent = this.user.email;
    } else {
      if (nameEl) nameEl.textContent = 'Log in / Sign up';
      if (subtextEl) subtextEl.textContent = 'Save history & memory';
      if (initialsEl) initialsEl.textContent = '?';
    }
  }
}

export const authManager = new AuthManager();
