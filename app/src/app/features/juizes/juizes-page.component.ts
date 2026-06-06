import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CadastroApiService, JuizResumo } from '../atletas/cadastro-api.service';
import { Campeonato, CampeonatoApiService } from '../campeonatos/campeonato-api.service';

@Component({
  selector: 'app-juizes-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './juizes-page.component.html',
  styleUrl: './juizes-page.component.scss'
})
export class JuizesPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly cadastroApi = inject(CadastroApiService);
  private readonly campeonatoApi = inject(CampeonatoApiService);

  readonly campeonatoId = signal<number | null>(null);
  readonly campeonato = signal<Campeonato | null>(null);
  readonly juizes = signal<JuizResumo[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalJuizes = computed(() => this.juizes().length);
  readonly juizesComRegistro = computed(() => this.juizes().filter((juiz) => !!juiz.registro).length);

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    registro: ['']
  });

  ngOnInit(): void {
    const campeonatoId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(campeonatoId) || campeonatoId <= 0) {
      this.error.set('Identificador de campeonato invalido.');
      return;
    }

    this.campeonatoId.set(campeonatoId);
    this.carregarDados(campeonatoId);
  }

  carregarDados(campeonatoId: number): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      campeonato: this.campeonatoApi.buscar(campeonatoId),
      juizes: this.cadastroApi.listarJuizes(campeonatoId)
    }).subscribe({
      next: ({ campeonato, juizes }) => {
        this.campeonato.set(campeonato);
        this.juizes.set(juizes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os juizes deste campeonato.');
        this.loading.set(false);
      }
    });
  }

  salvar(): void {
    const campeonatoId = this.campeonatoId();

    if (!campeonatoId) {
      this.error.set('Campeonato invalido para cadastro de juiz.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const rawValue = this.form.getRawValue();
    this.cadastroApi.criarJuiz({
      campeonatoId,
      nome: rawValue.nome.trim(),
      registro: this.normalizeOptionalText(rawValue.registro)
    }).subscribe({
      next: (juiz) => {
        this.juizes.update((lista) => [juiz, ...lista]);
        this.saving.set(false);
        this.form.reset({
          nome: '',
          registro: ''
        });
      },
      error: () => {
        this.error.set('Nao foi possivel salvar o juiz.');
        this.saving.set(false);
      }
    });
  }

  trackByJuiz(_: number, juiz: JuizResumo): number {
    return juiz.id;
  }

  private normalizeOptionalText(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
