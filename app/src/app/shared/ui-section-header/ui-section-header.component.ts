import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-section-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-section-header.component.html',
  styleUrl: './ui-section-header.component.scss'
})
export class UiSectionHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly compact = input(false);
  readonly anchorId = input<string | null>(null);
}
