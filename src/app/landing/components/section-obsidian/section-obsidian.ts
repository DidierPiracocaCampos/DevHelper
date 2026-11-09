import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reveal } from '../../directives/reveal.directive';
import { OBSIDIAN_LINKS } from '../../data/obsidian-links';

@Component({
  selector: 'landing-section-obsidian',
  standalone: true,
  imports: [RouterLink, Reveal],
  templateUrl: './section-obsidian.html',
  styleUrl: './section-obsidian.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionObsidian {
  protected readonly storeUrl = OBSIDIAN_LINKS.pluginStore;
}
