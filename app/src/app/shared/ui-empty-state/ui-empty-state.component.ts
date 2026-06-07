import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-empty-state.component.html',
  styleUrl: './ui-empty-state.component.scss'
})
export class UiEmptyStateComponent {
  readonly title = input.required<string>();
  readonly message = input<string | null>(null);
  readonly inline = input(false);
}
