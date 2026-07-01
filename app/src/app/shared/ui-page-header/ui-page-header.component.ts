import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ui-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ui-page-header.component.html',
  styleUrl: './ui-page-header.component.scss'
})
export class UiPageHeaderComponent {
  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly copy = input<string | null>(null);
  readonly backLabel = input<string | null>(null);
  readonly backLink = input<string | ReadonlyArray<string | number> | null>(null);
}
