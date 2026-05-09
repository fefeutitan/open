import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Campeonato, CampeonatoApiService } from './campeonato-api.service';

@Component({
  selector: 'app-campeonatos-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './campeonatos-page.component.html',
  styleUrl: './campeonatos-page.component.scss'
})
export class CampeonatosPageComponent implements OnInit {
  private readonly api = inject(CampeonatoApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly campeonatos = signal<Campeonato[]>([]);

  readonly totalCampeonatos = computed(() => this.campeonatos().length);
  readonly campeonatosAtivos = computed(() =>
    this.campeonatos().filter((campeonato) => campeonato.status !== 'RASCUNHO').length
  );

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    descricao: [''],
    local: ['', [Validators.required, Validators.maxLength(120)]],
    dataInicio: [''],
    dataFim: ['']
  });

  ngOnInit(): void {
    this.carregarCampeonatos();
  }

  carregarCampeonatos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.listar().subscribe({
      next: (campeonatos) => {
        this.campeonatos.set(campeonatos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os campeonatos.');
        this.loading.set(false);
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const rawValue = this.form.getRawValue();
    this.api.criar({
      nome: rawValue.nome.trim(),
      descricao: this.normalizeOptionalText(rawValue.descricao),
      local: rawValue.local.trim(),
      dataInicio: this.normalizeOptionalText(rawValue.dataInicio),
      dataFim: this.normalizeOptionalText(rawValue.dataFim)
    }).subscribe({
      next: (campeonato) => {
        this.campeonatos.update((lista) => [campeonato, ...lista]);
        this.saving.set(false);
        this.form.reset({
          nome: '',
          descricao: '',
          local: '',
          dataInicio: '',
          dataFim: ''
        });
      },
      error: () => {
        this.error.set('Nao foi possivel salvar o campeonato.');
        this.saving.set(false);
      }
    });
  }

  trackByCampeonato(_: number, campeonato: Campeonato): number {
    return campeonato.id;
  }

  private normalizeOptionalText(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
