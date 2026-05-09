import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-list-users',
  imports: [],
  templateUrl: './list-users.html',
  styleUrl: './list-users.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListUsers {

}
