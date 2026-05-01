import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from './shared/service/loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('devhelper-web');
  private _loader = inject(Loader);

  ngOnInit(): void {
    this._loader.hide();
  }

}