import { computed, inject, Injectable, Injector, runInInjectionContext, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState, createUserWithEmailAndPassword, GithubAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, User } from '@angular/fire/auth';
import { EmailAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { ToastService } from './toast';

export enum AuthErrorCode {
  InvalidCredential = 'auth/invalid-credential',
  TooManyRequests = 'auth/too-many-requests',
  UserNotFound = 'auth/user-not-found',
  NetworkError = 'auth/network-error',
}

export interface FailedAttempt {
  timestamp: number;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class Authenticator {

  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly FAILED_ATTEMPTS_WINDOW_MS = 5 * 60 * 1000;
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000;

  private _auth = inject(Auth);
  private _injector = inject(Injector);
  private _router = inject(Router);
  private _toastService = inject(ToastService);
  readonly initialized = signal(false);
  readonly user = toSignal(this.$userObservable(), { initialValue: null });
  readonly isLoggedIn = computed(() => !!this.user());
  private _failedAttempts: FailedAttempt[] = [];
  private _lastActivityTimestamp = signal<number>(Date.now());

  $userObservable(): Observable<User | null> {
    return runInInjectionContext(this._injector, () => authState(this._auth));
  }

  userPromise(): Promise<User | null> {
    return firstValueFrom(this.$userObservable());
  }

  private _isAccountLocked(email: string): boolean {
    const now = Date.now();
    const recentAttempts = this._failedAttempts.filter(
      a => a.email.toLowerCase() === email.toLowerCase() &&
        now - a.timestamp < this.FAILED_ATTEMPTS_WINDOW_MS
    );
    if (recentAttempts.length >= this.MAX_FAILED_ATTEMPTS) {
      const oldestAttempt = recentAttempts[0];
      if (now - oldestAttempt.timestamp < this.LOCKOUT_DURATION_MS) {
        return true;
      }
      this._failedAttempts = this._failedAttempts.filter(a => a.timestamp > oldestAttempt.timestamp);
    }
    return false;
  }

  private _recordFailedAttempt(email: string): void {
    this._failedAttempts.push({ timestamp: Date.now(), email });
    if (this._failedAttempts.length > 100) {
      this._failedAttempts = this._failedAttempts.slice(-50);
    }
  }

  private _clearFailedAttempts(email: string): void {
    this._failedAttempts = this._failedAttempts.filter(
      a => a.email.toLowerCase() !== email.toLowerCase()
    );
  }

  refreshActivity(): void {
    this._lastActivityTimestamp.set(Date.now());
  }

  isSessionExpired(): boolean {
    if (!this.isLoggedIn()) return false;
    const elapsed = Date.now() - this._lastActivityTimestamp();
    return elapsed > this.SESSION_TIMEOUT_MS;
  }

  private _updateLastActivity(): void {
    this.refreshActivity();
  }

  async register(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    return runInInjectionContext(this._injector, async () => {
      try {
        const result = await createUserWithEmailAndPassword(this._auth, email, password);
        await sendEmailVerification(result.user);
        this._updateLastActivity();
        this._router.navigate(['/']);
        return { success: true };
      } catch (error: any) {
        this._toastService.error('Error en registro', error.code);
        return { success: false, error: error.code };
      }
    });
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    return runInInjectionContext(this._injector, async () => {
      if (this._isAccountLocked(email)) {
        return { success: false, error: AuthErrorCode.TooManyRequests };
      }
      try {
        const result = await signInWithEmailAndPassword(this._auth, email, password);
        this._clearFailedAttempts(email);
        this._updateLastActivity();
        this._router.navigate(['/']);
        return { success: true };
      } catch (error: any) {
        this._recordFailedAttempt(email);
        this._toastService.error('Error en inicio de sesión', error.code);
        return { success: false, error: error.code };
      }
    });
  }

  async loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
    return runInInjectionContext(this._injector, async () => {
      const provider = new GoogleAuthProvider();
      try {
        console.log('Google: Calling signInWithPopup...');
        await signInWithPopup(this._auth, provider);
        console.log('Google: Popup success, navigating...');
        this._updateLastActivity();
        this._router.navigate(['/']);
        return { success: true };
      } catch (error: any) {
        console.error('Google login error:', error.code, error.message);
        this._toastService.error('Error con Google', error.code);
        return { success: false, error: error.code };
      }
    });
  }

  async loginWithGithub(): Promise<{ success: boolean; error?: string }> {
    return runInInjectionContext(this._injector, async () => {
      const provider = new GithubAuthProvider();
      try {
        console.log('GitHub: Calling signInWithPopup...');
        await signInWithPopup(this._auth, provider);
        console.log('GitHub: Popup success, navigating...');
        this._updateLastActivity();
        this._router.navigate(['/']);
        return { success: true };
      } catch (error: any) {
        console.error('GitHub login error:', error.code, error.message);
        this._toastService.error('Error con GitHub', error.code);
        return { success: false, error: error.code };
      }
    });
  }

  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    return runInInjectionContext(this._injector, async () => {
      try {
        await sendPasswordResetEmail(this._auth, email);
        return { success: true };
      } catch (error: any) {
        this._toastService.error('Error al enviar correo de recuperación', error.code);
        return { success: false, error: error.code };
      }
    });
  }

  async reauthenticate(password: string): Promise<{ success: boolean; error?: string }> {
    return runInInjectionContext(this._injector, async () => {
      const user = this._auth.currentUser;
      if (!user || !user.email) {
        return { success: false, error: 'auth/invalid-user' };
      }
      try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        this._updateLastActivity();
        return { success: true };
      } catch (error: any) {
        this._toastService.error('Error de reautenticación', error.code);
        return { success: false, error: error.code };
      }
    });
  }

  async logout(): Promise<void> {
    return runInInjectionContext(this._injector, async () => {
      await this._auth.signOut();
      await this._router.navigate(['/login']);
    });
  }
}