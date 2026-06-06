import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { Campeonato, CampeonatoApiService } from '../campeonatos/campeonato-api.service';
import { CompeticaoApiService, FaseItem, GrupoItem } from './competicao-api.service';

@Component({
  selector: 'app-fases-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './fases-page.component.html',
  styleUrl: './fases-page.component.scss'
})
export class FasesPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly competicaoApi = inject(CompeticaoApiService);
  private readonly campeonatoApi = inject(CampeonatoApiService);

  readonly campeonatoId = signal<number | null>(null);
  readonly campeonato = signal<Campeonato | null>(null);
  readonly fases = signal<FaseItem[]>([]);
  readonly gruposPorFase = signal<Record<number, GrupoItem[]>>({});
  readonly loading = signal(false);
  readonly savingFase = signal(false);
  readonly savingGrupo = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalFases = computed(() => this.fases().length);
  readonly fasesGrupos = computed(() => this.fases().filter((fase) => fase.tipo === 'GRUPOS').length);
  readonly fasesEliminatorias = computed(() => this.fases().filter((fase) => fase.tipo === 'ELIMINATORIA').length);
  readonly totalGrupos = computed(() =>
    Object.values(this.gruposPorFase()).reduce((total, grupos) => total + grupos.length, 0)
  );
  readonly fasesDeGrupos = computed(() => this.fases().filter((fase) => fase.tipo === 'GRUPOS'));

  readonly faseForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    tipo: ['GRUPOS' as const, Validators.required],
    ordem: [1, [Validators.required, Validators.min(1)]],
    classificadosPorGrupo: ['']
  });

  readonly grupoForm = this.formBuilder.nonNullable.group({
    faseId: [0, [Validators.required, Validators.min(1)]],
    nome: ['', [Validators.required, Validators.maxLength(120)]]
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
      fases: this.competicaoApi.listarFases(campeonatoId)
    }).subscribe({
      next: ({ campeonato, fases }) => {
        this.campeonato.set(campeonato);
        this.fases.set(fases);
        this.prepararFormularioGrupo(fases);
        this.carregarGrupos(fases);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar as fases deste campeonato.');
        this.loading.set(false);
      }
    });
  }

  salvarFase(): void {
    const campeonatoId = this.campeonatoId();

    if (!campeonatoId) {
      this.error.set('Campeonato invalido para cadastro de fase.');
      return;
    }

    if (this.faseForm.invalid) {
      this.faseForm.markAllAsTouched();
      return;
    }

    this.savingFase.set(true);
    this.error.set(null);

    const raw = this.faseForm.getRawValue();
    this.competicaoApi.criarFase({
      campeonatoId,
      nome: raw.nome.trim(),
      tipo: raw.tipo,
      ordem: raw.ordem,
      classificadosPorGrupo: raw.tipo === 'GRUPOS' ? this.normalizeOptionalInteger(raw.classificadosPorGrupo) : null
    }).subscribe({
      next: (fase) => {
        const atualizadas = [...this.fases(), fase].sort((a, b) => a.ordem - b.ordem || a.id - b.id);
        this.fases.set(atualizadas);
        this.prepararFormularioGrupo(atualizadas);
        if (fase.tipo === 'GRUPOS') {
          this.gruposPorFase.update((mapa) => ({ ...mapa, [fase.id]: [] }));
        }
        this.savingFase.set(false);
        this.faseForm.reset({
          nome: '',
          tipo: 'GRUPOS',
          ordem: this.proximaOrdem(atualizadas),
          classificadosPorGrupo: ''
        });
      },
      error: () => {
        this.error.set('Nao foi possivel salvar a fase.');
        this.savingFase.set(false);
      }
    });
  }

  salvarGrupo(): void {
    if (this.grupoForm.invalid) {
      this.grupoForm.markAllAsTouched();
      return;
    }

    this.savingGrupo.set(true);
    this.error.set(null);

    const raw = this.grupoForm.getRawValue();
    this.competicaoApi.criarGrupo({
      faseId: raw.faseId,
      nome: raw.nome.trim()
    }).subscribe({
      next: (grupo) => {
        this.gruposPorFase.update((mapa) => ({
          ...mapa,
          [raw.faseId]: [...(mapa[raw.faseId] ?? []), grupo]
        }));
        this.savingGrupo.set(false);
        this.grupoForm.reset({
          faseId: raw.faseId,
          nome: ''
        });
      },
      error: () => {
        this.error.set('Nao foi possivel salvar o grupo.');
        this.savingGrupo.set(false);
      }
    });
  }

  gruposDaFase(faseId: number): GrupoItem[] {
    return this.gruposPorFase()[faseId] ?? [];
  }

  descricaoFase(fase: FaseItem): string {
    if (fase.tipo === 'GRUPOS') {
      return fase.classificadosPorGrupo != null
        ? `${fase.classificadosPorGrupo} classificado(s) por grupo`
        : 'Sem classificados por grupo definidos';
    }

    return 'Chave eliminatoria';
  }

  trackByFase(_: number, fase: FaseItem): number {
    return fase.id;
  }

  trackByGrupo(_: number, grupo: GrupoItem): number {
    return grupo.id;
  }

  private carregarGrupos(fases: FaseItem[]): void {
    const fasesComGrupos = fases.filter((fase) => fase.tipo === 'GRUPOS');

    if (fasesComGrupos.length === 0) {
      this.gruposPorFase.set({});
      this.loading.set(false);
      return;
    }

    forkJoin(
      fasesComGrupos.map((fase) =>
        this.competicaoApi.listarGrupos(fase.id)
      )
    ).subscribe({
      next: (respostas) => {
        const mapa: Record<number, GrupoItem[]> = {};
        fasesComGrupos.forEach((fase, index) => {
          mapa[fase.id] = respostas[index];
        });
        this.gruposPorFase.set(mapa);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os grupos das fases.');
        this.loading.set(false);
      }
    });
  }

  private prepararFormularioGrupo(fases: FaseItem[]): void {
    const primeiraFase = fases.find((fase) => fase.tipo === 'GRUPOS');
    const faseAtual = this.grupoForm.getRawValue().faseId;
    const faseExiste = fases.some((fase) => fase.id === faseAtual && fase.tipo === 'GRUPOS');

    this.grupoForm.patchValue({
      faseId: faseExiste ? faseAtual : (primeiraFase?.id ?? 0)
    });
  }

  private normalizeOptionalInteger(value: string): number | null {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private proximaOrdem(fases: FaseItem[]): number {
    if (fases.length === 0) {
      return 1;
    }

    return Math.max(...fases.map((fase) => fase.ordem)) + 1;
  }
}
