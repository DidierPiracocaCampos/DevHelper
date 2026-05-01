import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Loader {
  private get loader() {
    return document.getElementById('app-loader');
  }

  show() {
    const el = this.loader;
    if (el) {
      el.classList.remove('hidden');
      el.style.display = 'flex';
    }
  }

  hide() {
    const el = this.loader;
    if (el) {
      el.classList.add('hidden');

      setTimeout(() => {
        el.style.display = 'none';
      }, 300);
    }
  }
  
}