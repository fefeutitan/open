import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UiEmptyStateComponent } from '../../shared/ui-empty-state/ui-empty-state.component';
import { UiFeedbackComponent } from '../../shared/ui-feedback/ui-feedback.component';
import { Campeonato, CampeonatoApiService } from '../campeonatos/campeonato-api.service';
import { CadastroApiService, CategoriaResumo } from '../atletas/cadastro-api.service';

@Component({
  selector: 'app-categorias-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiFeedbackComponent, UiEmptyStateComponent],
  templateUrl: './categorias-page.component.html',
  styleUrl: './categorias-page.component.scss'
})
export class CategoriasPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly cadastroApi = inject(CadastroApiService);
  private readonly campeonatoApi = inject(CampeonatoApiService);

  readonly campeonatoId = signal<number | null>(null);
  readonly campeonato = signal<Campeonato | null>(null);
  readonly categorias = signal<CategoriaResumo[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalCategorias = computed(() => this.categorias().length);

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    genero: ['MASCULINO' as const, Validators.required],
    idadeMinima: [''],
    idadeMaxima: [''],
    pesoMinimo: [''],
    pesoMaximo: ['']
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
      categorias: this.cadastroApi.listarCategorias(campeonatoId)
    }).subscribe({
      next: ({ campeonato, categorias }) => {
        this.campeonato.set(campeonato);
        this.categorias.set(categorias);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar as categorias deste campeonato.');
        this.loading.set(false);
      }
    });
  }

  salvar(): void {
    const campeonatoId = this.campeonatoId();

    if (!campeonatoId) {
      this.error.set('Campeonato invalido para cadastro de categoria.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const rawValue = this.form.getRawValue();
    this.cadastroApi.criarCategoria({
      campeonatoId,
      nome: rawValue.nome.trim(),
      genero: rawValue.genero,
      idadeMinima: this.normalizeOptionalInteger(rawValue.idadeMinima),
      idadeMaxima: this.normalizeOptionalInteger(rawValue.idadeMaxima),
      pesoMinimo: this.normalizeOptionalDecimal(rawValue.pesoMinimo),
      pesoMaximo: this.normalizeOptionalDecimal(rawValue.pesoMaximo)
    }).subscribe({
      next: (categoria) => {
        this.categorias.update((lista) => [categoria, ...lista]);
        this.saving.set(false);
        this.form.reset({
          nome: '',
          genero: 'MASCULINO',
          idadeMinima: '',
          idadeMaxima: '',
          pesoMinimo: '',
          pesoMaximo: ''
        });
      },
      error: () => {
        this.error.set('Nao foi possivel salvar a categoria.');
        this.saving.set(false);
      }
    });
  }

  trackByCategoria(_: number, categoria: CategoriaResumo): number {
    return categoria.id;
  }

  faixaIdade(categoria: CategoriaResumo): string {
    const minima = categoria.idadeMinima;
    const maxima = categoria.idadeMaxima;

    if (minima == null && maxima == null) {
      return 'Livre';
    }

    if (minima != null && maxima != null) {
      return `${minima} a ${maxima} anos`;
    }

    if (minima != null) {
      return `${minima}+ anos`;
    }

    return `Ate ${maxima} anos`;
  }

  faixaPeso(categoria: CategoriaResumo): string {
    const minimo = categoria.pesoMinimo;
    const maximo = categoria.pesoMaximo;

    if (minimo == null && maximo == null) {
      return 'Livre';
    }

    if (minimo != null && maximo != null) {
      return `${minimo} a ${maximo} kg`;
    }

    if (minimo != null) {
      return `${minimo}+ kg`;
    }

    return `Ate ${maximo} kg`;
  }

  private normalizeOptionalInteger(value: string): number | null {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private normalizeOptionalDecimal(value: string): number | null {
    const trimmed = value.trim().replace(',', '.');
    if (trimmed.length === 0) {
      return null;
    }

    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
