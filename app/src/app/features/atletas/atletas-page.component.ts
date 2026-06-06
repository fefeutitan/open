import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Campeonato, CampeonatoApiService } from '../campeonatos/campeonato-api.service';
import { Atleta, CadastroApiService, CategoriaResumo, NucleoResumo } from './cadastro-api.service';

@Component({
  selector: 'app-atletas-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './atletas-page.component.html',
  styleUrl: './atletas-page.component.scss'
})
export class AtletasPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly cadastroApi = inject(CadastroApiService);
  private readonly campeonatoApi = inject(CampeonatoApiService);

  readonly campeonatoId = signal<number | null>(null);
  readonly campeonato = signal<Campeonato | null>(null);
  readonly atletas = signal<Atleta[]>([]);
  readonly categorias = signal<CategoriaResumo[]>([]);
  readonly nucleos = signal<NucleoResumo[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalAtletas = computed(() => this.atletas().length);
  readonly atletasAtivos = computed(() => this.atletas().filter((atleta) => atleta.status === 'ATIVO').length);
  readonly faltamCategorias = computed(() => this.categorias().length === 0);
  readonly faltamNucleos = computed(() => this.nucleos().length === 0);
  readonly formularioBloqueado = computed(() => this.faltamCategorias() || this.faltamNucleos());

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    documento: [''],
    dataNascimento: [''],
    status: ['ATIVO' as const, Validators.required],
    categoriaId: [0, [Validators.required, Validators.min(1)]],
    nucleoId: [0, [Validators.required, Validators.min(1)]]
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
      atletas: this.cadastroApi.listarAtletas(campeonatoId),
      categorias: this.cadastroApi.listarCategorias(campeonatoId),
      nucleos: this.cadastroApi.listarNucleos(campeonatoId)
    }).subscribe({
      next: ({ campeonato, atletas, categorias, nucleos }) => {
        this.campeonato.set(campeonato);
        this.atletas.set(atletas);
        this.categorias.set(categorias);
        this.nucleos.set(nucleos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os atletas deste campeonato.');
        this.loading.set(false);
      }
    });
  }

  salvar(): void {
    const campeonatoId = this.campeonatoId();

    if (!campeonatoId) {
      this.error.set('Campeonato invalido para cadastro de atleta.');
      return;
    }

    if (this.formularioBloqueado()) {
      this.error.set('Cadastre categorias e nucleos antes de incluir atletas.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const rawValue = this.form.getRawValue();
    this.cadastroApi.criarAtleta({
      nome: rawValue.nome.trim(),
      documento: this.normalizeOptionalText(rawValue.documento),
      dataNascimento: this.normalizeOptionalText(rawValue.dataNascimento),
      status: rawValue.status,
      categoriaId: rawValue.categoriaId,
      nucleoId: rawValue.nucleoId
    }).subscribe({
      next: (atleta) => {
        this.atletas.update((lista) => [atleta, ...lista]);
        this.saving.set(false);
        this.form.reset({
          nome: '',
          documento: '',
          dataNascimento: '',
          status: 'ATIVO',
          categoriaId: 0,
          nucleoId: 0
        });
      },
      error: () => {
        this.error.set('Nao foi possivel salvar o atleta.');
        this.saving.set(false);
      }
    });
  }

  trackByAtleta(_: number, atleta: Atleta): number {
    return atleta.id;
  }

  private normalizeOptionalText(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
