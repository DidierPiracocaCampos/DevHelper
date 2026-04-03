import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState, browserLocalPersistence, createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signInWithPopup, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Authenticator {

  private _auth = inject(Auth);
  private _router = inject(Router);
  readonly initialized = signal(false);
  readonly user = toSignal(authState(this._auth), { initialValue: null });
  readonly isLoggedIn = computed(() => !!this.user());

  userPromise(): Promise<User | null> {
    return firstValueFrom(authState(this._auth));
  }

  register(email: string, password: string) {
    createUserWithEmailAndPassword(this._auth, email, password).then((userCredential) => {
      this._router.navigate(['/']);
    })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this._auth, email, password)
      .then(result => {
        this._router.navigate(['/']);
      });
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();

    return setPersistence(this._auth, browserLocalPersistence)
      .then(() =>
        signInWithPopup(this._auth, provider)
      )
      .then(result => {
        this._router.navigate(['/']);
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData?.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error('Error Google Login', { errorCode, errorMessage, email, credential });
      });
  }

  logout() {
    return this._auth.signOut().then(v => this._router.navigate(['/login']));
  }
}