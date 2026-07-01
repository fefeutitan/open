import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface UiDependencyLinkItem {
  label: string;
  href?: string;
  routerLink?: string | ReadonlyArray<string | number>;
}

@Component({
  selector: 'app-ui-dependency-links',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ui-dependency-links.component.html',
  styleUrl: './ui-dependency-links.component.scss'
})
export class UiDependencyLinksComponent {
  readonly items = input.required<UiDependencyLinkItem[]>();
}
