import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UiEmptyStateComponent } from '../../shared/ui-empty-state/ui-empty-state.component';
import { UiFeedbackComponent } from '../../shared/ui-feedback/ui-feedback.component';
import { Campeonato, CampeonatoApiService } from '../campeonatos/campeonato-api.service';
import {
  ClassificacaoAtletaItem,
  CompeticaoApiService,
  JogoGeradoItem,
  FaseItem,
  GrupoItem
} from './competicao-api.service';

@Component({
  selector: 'app-fases-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiFeedbackComponent, UiEmptyStateComponent],
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
  readonly classificacaoPorGrupo = signal<Record<number, ClassificacaoAtletaItem[]>>({});
  readonly jogosGerados = signal<JogoGeradoItem[]>([]);
  readonly loading = signal(false);
  readonly refreshingClassificacao = signal(false);
  readonly savingFase = signal(false);
  readonly savingGrupo = signal(false);
  readonly generatingMataMata = signal(false);
  readonly error = signal<string | null>(null);
  readonly classificacaoError = signal<string | null>(null);
  readonly mataMataError = signal<string | null>(null);
  readonly mataMataSuccess = signal<string | null>(null);

  readonly totalFases = computed(() => this.fases().length);
  readonly fasesGrupos = computed(() => this.fases().filter((fase) => fase.tipo === 'GRUPOS').length);
  readonly fasesEliminatorias = computed(() => this.fases().filter((fase) => fase.tipo === 'ELIMINATORIA').length);
  readonly totalGrupos = computed(() =>
    Object.values(this.gruposPorFase()).reduce((total, grupos) => total + grupos.length, 0)
  );
  readonly totalAtletasClassificados = computed(() =>
    Object.values(this.classificacaoPorGrupo()).reduce((total, itens) => total + itens.length, 0)
  );
  readonly fasesDeGrupos = computed(() => this.fases().filter((fase) => fase.tipo === 'GRUPOS'));
  readonly fasesEliminatoriasDisponiveis = computed(() =>
    this.fases().filter((fase) => fase.tipo === 'ELIMINATORIA')
  );
  readonly gruposCadastrados = computed(() =>
    Object.values(this.gruposPorFase()).reduce((total, grupos) => total + grupos.length, 0)
  );
  readonly faseGruposSelecionada = computed(() =>
    this.fasesDeGrupos().find((fase) => fase.id === this.mataMataForm.getRawValue().faseGruposId) ?? null
  );
  readonly podeGerarMataMata = computed(() =>
    this.fasesDeGrupos().length > 0 && this.fasesEliminatoriasDisponiveis().length > 0
  );
  readonly cadastroGrupoBloqueado = computed(() => this.fasesDeGrupos().length === 0);
  readonly mataMataBloqueado = computed(() => {
    if (this.fasesDeGrupos().length === 0 || this.fasesEliminatoriasDisponiveis().length === 0) {
      return true;
    }

    const fase = this.faseGruposSelecionada();
    return !fase || fase.classificadosPorGrupo == null || fase.classificadosPorGrupo < 1 || this.gruposCadastrados() === 0;
  });

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

  readonly mataMataForm = this.formBuilder.nonNullable.group({
    faseGruposId: [0, [Validators.required, Validators.min(1)]],
    faseEliminatoriaId: [0, [Validators.required, Validators.min(1)]]
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
        this.prepararFormularioMataMata(fases);
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
        this.prepararFormularioMataMata(atualizadas);
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
        this.classificacaoPorGrupo.update((mapa) => ({ ...mapa, [grupo.id]: [] }));
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

  classificacaoDoGrupo(grupoId: number): ClassificacaoAtletaItem[] {
    return this.classificacaoPorGrupo()[grupoId] ?? [];
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

  trackByClassificacao(_: number, item: ClassificacaoAtletaItem): number {
    return item.atletaId;
  }

  atualizarClassificacao(): void {
    this.classificacaoError.set(null);
    this.refreshingClassificacao.set(true);
    this.carregarClassificacoes();
  }

  gerarMataMata(): void {
    this.mataMataError.set(null);
    this.mataMataSuccess.set(null);

    if (!this.podeGerarMataMata()) {
      this.mataMataError.set('Cadastre uma fase de grupos e uma fase eliminatoria antes de gerar o mata-mata.');
      return;
    }

    if (this.mataMataForm.invalid) {
      this.mataMataForm.markAllAsTouched();
      return;
    }

    const raw = this.mataMataForm.getRawValue();
    if (raw.faseGruposId === raw.faseEliminatoriaId) {
      this.mataMataError.set('Selecione fases diferentes para origem e destino do mata-mata.');
      return;
    }

    this.generatingMataMata.set(true);
    this.competicaoApi.gerarMataMata(raw.faseGruposId, {
      faseEliminatoriaId: raw.faseEliminatoriaId
    }).subscribe({
      next: (jogos) => {
        this.jogosGerados.set(jogos);
        this.generatingMataMata.set(false);
        this.mataMataSuccess.set(`${jogos.length} jogo(s) eliminatorio(s) gerado(s) com sucesso.`);
      },
      error: () => {
        this.mataMataError.set('Nao foi possivel gerar o mata-mata com os dados informados.');
        this.generatingMataMata.set(false);
      }
    });
  }

  descricaoBloqueioMataMata(): string {
    if (this.fasesDeGrupos().length === 0) {
      return 'Crie primeiro uma fase do tipo GRUPOS para definir os classificados.';
    }

    if (this.fasesEliminatoriasDisponiveis().length === 0) {
      return 'Crie uma fase do tipo ELIMINATORIA para receber os confrontos gerados.';
    }

    if (this.gruposCadastrados() === 0) {
      return 'Cadastre ao menos um grupo na fase de grupos antes de gerar o mata-mata.';
    }

    const fase = this.faseGruposSelecionada();
    if (fase?.classificadosPorGrupo == null || fase.classificadosPorGrupo < 1) {
      return 'A fase de grupos escolhida precisa informar quantos atletas classificam por grupo.';
    }

    return '';
  }

  descricaoBloqueioGrupo(): string {
    return 'Crie primeiro uma fase do tipo GRUPOS para habilitar o cadastro de grupos.';
  }

  confrontoGerado(jogo: JogoGeradoItem): string {
    return `${jogo.atletaVermelho.nome} x ${jogo.atletaAzul.nome}`;
  }

  trackByJogoGerado(_: number, jogo: JogoGeradoItem): number {
    return jogo.id;
  }

  private carregarGrupos(fases: FaseItem[]): void {
    const fasesComGrupos = fases.filter((fase) => fase.tipo === 'GRUPOS');

    if (fasesComGrupos.length === 0) {
      this.gruposPorFase.set({});
      this.classificacaoPorGrupo.set({});
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
        this.carregarClassificacoes();
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os grupos das fases.');
        this.loading.set(false);
      }
    });
  }

  private carregarClassificacoes(): void {
    const grupos = Object.values(this.gruposPorFase()).flat();

    if (grupos.length === 0) {
      this.classificacaoPorGrupo.set({});
      this.classificacaoError.set(null);
      this.loading.set(false);
      this.refreshingClassificacao.set(false);
      return;
    }

    forkJoin(grupos.map((grupo) => this.competicaoApi.classificarGrupo(grupo.id))).subscribe({
      next: (respostas) => {
        const mapa: Record<number, ClassificacaoAtletaItem[]> = {};
        grupos.forEach((grupo, index) => {
          mapa[grupo.id] = respostas[index];
        });
        this.classificacaoPorGrupo.set(mapa);
        this.classificacaoError.set(null);
        this.loading.set(false);
        this.refreshingClassificacao.set(false);
      },
      error: () => {
        this.classificacaoError.set('Nao foi possivel carregar a classificacao dos grupos.');
        this.loading.set(false);
        this.refreshingClassificacao.set(false);
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

  private prepararFormularioMataMata(fases: FaseItem[]): void {
    const faseGruposAtual = this.mataMataForm.getRawValue().faseGruposId;
    const faseEliminatoriaAtual = this.mataMataForm.getRawValue().faseEliminatoriaId;
    const primeiraFaseGrupos = fases.find((fase) => fase.tipo === 'GRUPOS');
    const primeiraEliminatoria = fases.find((fase) => fase.tipo === 'ELIMINATORIA');

    this.mataMataForm.patchValue({
      faseGruposId: fases.some((fase) => fase.id === faseGruposAtual && fase.tipo === 'GRUPOS')
        ? faseGruposAtual
        : (primeiraFaseGrupos?.id ?? 0),
      faseEliminatoriaId: fases.some((fase) => fase.id === faseEliminatoriaAtual && fase.tipo === 'ELIMINATORIA')
        ? faseEliminatoriaAtual
        : (primeiraEliminatoria?.id ?? 0)
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
