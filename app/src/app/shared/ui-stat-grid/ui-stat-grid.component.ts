import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

export interface UiStatItem {
  label: string;
  value: number | string;
}

@Component({
  selector: 'app-ui-stat-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-stat-grid.component.html',
  styleUrl: './ui-stat-grid.component.scss'
})
export class UiStatGridComponent {
  readonly ariaLabel = input('Resumo');
  readonly items = input.required<UiStatItem[]>();
  readonly emphasis = input<'default' | 'large'>('default');
}
