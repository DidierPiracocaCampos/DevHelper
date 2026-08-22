import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'landing-section-hero',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './section-hero.html',
  styleUrl: './section-hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHero {}
