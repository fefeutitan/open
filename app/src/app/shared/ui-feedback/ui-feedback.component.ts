import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-feedback.component.html',
  styleUrl: './ui-feedback.component.scss'
})
export class UiFeedbackComponent {
  readonly tone = input<'error' | 'warning' | 'success'>('warning');
  readonly title = input<string | null>(null);
  readonly message = input.required<string>();
  readonly inline = input(false);
  readonly fullWidth = input(false);
}
