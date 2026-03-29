import { Component } from '@angular/core';
import { CardBase } from "../../../shared/components/card-base/card-base";
import { ActionButton } from "../../../shared/components/action-button/action-button";

@Component({
  selector: 'app-home',
  imports: [CardBase, ActionButton],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class Home {

}
