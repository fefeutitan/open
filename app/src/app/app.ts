import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  private readonly currentUrl = signal(this.router.url);

  readonly currentSection = computed(() => {
    const url = this.currentUrl();

    if (url.startsWith('/campeonatos')) {
      return 'Gestao de campeonatos';
    }

    return 'Monitoramento operacional';
  });

  readonly currentDateLabel = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set((event as NavigationEnd).urlAfterRedirects);
      });
  }
}
