import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-note-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-note-card.component.html',
  styleUrl: './ui-note-card.component.scss'
})
export class UiNoteCardComponent {
  readonly title = input.required<string>();
}
