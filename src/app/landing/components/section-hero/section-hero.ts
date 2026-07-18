import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-section-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './section-hero.html',
  styleUrl: './section-hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHero {}
