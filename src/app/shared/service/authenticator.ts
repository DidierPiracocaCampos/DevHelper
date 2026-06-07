import { computed, inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
} from '@angular/fire/auth';
import { EmailAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthProvider } from 'firebase/auth';
import { AuthResult } from './auth-result';
import { BruteForceGuard } from './brute-force.guard';
import { SessionManager } from './session-manager';
import { ToastService } from './toast';

export type { AuthResult } from './auth-result';

export enum AuthErrorCode {
  InvalidCredential = 'auth/invalid-credential',
  TooManyRequests = 'auth/too-many-requests',
  UserNotFound = 'auth/user-not-found',
  InvalidEmail = 'auth/invalid-email',
  NetworkError = 'auth/network-error',
}

type FirebaseError = { code?: string };

interface OAuthLoginConfig {
  provider: AuthProvider;
  errorTitle: string;
}

@Injectable({
  providedIn: 'root',
})
export class Authenticator {
  private _auth = inject(Auth);
  private _injector = inject(Injector);
  private _router = inject(Router);
  private _toastService = inject(ToastService);
  private _bruteForce = inject(BruteForceGuard);
  private _session = inject(SessionManager);

  readonly user = toSignal(this.$userObservable(), { initialValue: null });
  readonly isLoggedIn = computed(() => !!this.user());

  $userObservable(): Observable<User | null> {
    return runInInjectionContext(this._injector, () => authState(this._auth));
  }

  userPromise(): Promise<User | null> {
    return firstValueFrom(this.$userObservable());
  }

  async register(email: string, password: string): Promise<AuthResult> {
    return runInInjectionContext(this._injector, async () => {
      try {
        const result = await createUserWithEmailAndPassword(this._auth, email, password);
        await sendEmailVerification(result.user);
        this._session.refresh();
        await this._router.navigate(['/']);
        return { success: true };
      } catch (error) {
        const code = (error as FirebaseError).code;
        this._toastService.error('Error en registro', code);
        return { success: false, error: code };
      }
    });
  }

  async login(email: string, password: string): Promise<AuthResult> {
    return runInInjectionContext(this._injector, async () => {
      if (this._bruteForce.isAccountLocked(email)) {
        return { success: false, error: AuthErrorCode.TooManyRequests };
      }
      try {
        await signInWithEmailAndPassword(this._auth, email, password);
        this._bruteForce.clearFailedAttempts(email);
        this._session.refresh();
        await this._router.navigate(['/']);
        return { success: true };
      } catch (error) {
        this._bruteForce.recordFailedAttempt(email);
        const code = (error as FirebaseError).code;
        this._toastService.error('Error en inicio de sesión', code);
        return { success: false, error: code };
      }
    });
  }

  async loginWithGoogle(): Promise<AuthResult> {
    return this._loginWithOAuth({
      provider: new GoogleAuthProvider(),
      errorTitle: 'Error con Google',
    });
  }

  async loginWithGithub(): Promise<AuthResult> {
    return this._loginWithOAuth({
      provider: new GithubAuthProvider(),
      errorTitle: 'Error con GitHub',
    });
  }

  async sendPasswordResetEmail(email: string): Promise<AuthResult> {
    return runInInjectionContext(this._injector, async () => {
      try {
        await sendPasswordResetEmail(this._auth, email);
        return { success: true };
      } catch (error) {
        const code = (error as FirebaseError).code;
        this._toastService.error('Error al enviar correo de recuperación', code);
        return { success: false, error: code };
      }
    });
  }

  async reauthenticate(password: string): Promise<AuthResult> {
    return runInInjectionContext(this._injector, async () => {
      const user = this._auth.currentUser;
      if (!user || !user.email) {
        return { success: false, error: 'auth/invalid-user' };
      }
      try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        this._session.refresh();
        return { success: true };
      } catch (error) {
        const code = (error as FirebaseError).code;
        this._toastService.error('Error de reautenticación', code);
        return { success: false, error: code };
      }
    });
  }

  async logout(): Promise<void> {
    return runInInjectionContext(this._injector, async () => {
      await this._auth.signOut();
      await this._router.navigate(['/login']);
    });
  }

  private async _loginWithOAuth({ provider, errorTitle }: OAuthLoginConfig): Promise<AuthResult> {
    return runInInjectionContext(this._injector, async () => {
      try {
        await signInWithPopup(this._auth, provider);
        this._session.refresh();
        await this._router.navigate(['/']);
        return { success: true };
      } catch (error) {
        const code = (error as FirebaseError).code;
        this._toastService.error(errorTitle, code);
        return { success: false, error: code };
      }
    });
  }
}
