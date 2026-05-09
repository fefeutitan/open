import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Campeonato, CampeonatoApiService } from './campeonato-api.service';

@Component({
  selector: 'app-campeonato-detalhe-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './campeonato-detalhe-page.component.html',
  styleUrl: './campeonato-detalhe-page.component.scss'
})
export class CampeonatoDetalhePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CampeonatoApiService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly campeonato = signal<Campeonato | null>(null);

  readonly periodo = computed(() => {
    const item = this.campeonato();

    if (!item) {
      return 'Nao definido';
    }

    if (item.dataInicio && item.dataFim) {
      return `${item.dataInicio} ate ${item.dataFim}`;
    }

    return item.dataInicio || item.dataFim || 'Nao definido';
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id) || id <= 0) {
      this.error.set('Identificador de campeonato invalido.');
      return;
    }

    this.carregar(id);
  }

  carregar(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.buscar(id).subscribe({
      next: (campeonato) => {
        this.campeonato.set(campeonato);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar o detalhe do campeonato.');
        this.loading.set(false);
      }
    });
  }
}
