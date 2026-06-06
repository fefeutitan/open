import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Atleta, CadastroApiService, CategoriaResumo, JuizResumo } from '../atletas/cadastro-api.service';
import { Campeonato, CampeonatoApiService } from '../campeonatos/campeonato-api.service';
import { CompeticaoApiService, FaseItem, GrupoItem } from '../fases/competicao-api.service';
import {
  JogoItem,
  JogosApiService,
  SumulaJogoResponse
} from './jogos-api.service';

type FiltroStatus = 'TODOS' | 'AGENDADO' | 'EM_ANDAMENTO' | 'FINALIZADO';
type EditorOperacao = 'RESULTADO' | 'SUMULA' | 'CORRECAO_RESULTADO' | 'CORRECAO_SUMULA' | null;

@Component({
  selector: 'app-jogos-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './jogos-page.component.html',
  styleUrl: './jogos-page.component.scss'
})
export class JogosPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly cadastroApi = inject(CadastroApiService);
  private readonly competicaoApi = inject(CompeticaoApiService);
  private readonly jogosApi = inject(JogosApiService);
  private readonly campeonatoApi = inject(CampeonatoApiService);

  readonly campeonatoId = signal<number | null>(null);
  readonly campeonato = signal<Campeonato | null>(null);
  readonly jogos = signal<JogoItem[]>([]);
  readonly juizes = signal<JuizResumo[]>([]);
  readonly fases = signal<FaseItem[]>([]);
  readonly gruposPorFase = signal<Record<number, GrupoItem[]>>({});
  readonly categorias = signal<CategoriaResumo[]>([]);
  readonly atletas = signal<Atleta[]>([]);
  readonly loading = signal(false);
  readonly refreshing = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);
  readonly statusFiltro = signal<FiltroStatus>('TODOS');
  readonly jogoEmAcaoId = signal<number | null>(null);
  readonly editorJogoId = signal<number | null>(null);
  readonly editorOperacao = signal<EditorOperacao>(null);
  readonly savingCadastro = signal(false);

  readonly cadastroForm = this.formBuilder.nonNullable.group({
    faseId: [0, [Validators.required, Validators.min(1)]],
    grupoId: [0],
    categoriaId: [0, [Validators.required, Validators.min(1)]],
    atletaVermelhoId: [0, [Validators.required, Validators.min(1)]],
    atletaAzulId: [0, [Validators.required, Validators.min(1)]],
    dataHora: ['']
  });

  readonly resultadoForm = this.formBuilder.nonNullable.group({
    pontosVermelho: [0, [Validators.required, Validators.min(0)]],
    pontosAzul: [0, [Validators.required, Validators.min(0)]]
  });

  readonly sumulaForm = this.formBuilder.nonNullable.group({
    observacoes: [''],
    juiz1Id: [0, [Validators.required, Validators.min(1)]],
    juiz1PontosVermelho: [10, [Validators.required, Validators.min(0)]],
    juiz1PontosAzul: [8, [Validators.required, Validators.min(0)]],
    juiz1Observacoes: [''],
    juiz2Id: [0, [Validators.required, Validators.min(1)]],
    juiz2PontosVermelho: [9, [Validators.required, Validators.min(0)]],
    juiz2PontosAzul: [10, [Validators.required, Validators.min(0)]],
    juiz2Observacoes: [''],
    juiz3Id: [0, [Validators.required, Validators.min(1)]],
    juiz3PontosVermelho: [10, [Validators.required, Validators.min(0)]],
    juiz3PontosAzul: [9, [Validators.required, Validators.min(0)]],
    juiz3Observacoes: ['']
  });

  readonly correcaoForm = this.formBuilder.nonNullable.group({
    motivo: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  readonly filtroForm = this.formBuilder.nonNullable.group({
    faseId: [0],
    grupoId: [0],
    categoriaId: [0],
    data: ['']
  });

  readonly jogosFiltrados = computed(() => {
    const filtro = this.statusFiltro();
    const filtroAvancado = this.filtroForm.getRawValue();
    let jogos = this.jogos();

    if (filtro !== 'TODOS') {
      jogos = jogos.filter((jogo) => jogo.status === filtro);
    }

    if (filtroAvancado.faseId > 0) {
      jogos = jogos.filter((jogo) => jogo.fase.id === filtroAvancado.faseId);
    }

    if (filtroAvancado.grupoId > 0) {
      jogos = jogos.filter((jogo) => jogo.grupo?.id === filtroAvancado.grupoId);
    }

    if (filtroAvancado.categoriaId > 0) {
      jogos = jogos.filter((jogo) => jogo.categoria.id === filtroAvancado.categoriaId);
    }

    const dataFiltro = filtroAvancado.data.trim();
    if (dataFiltro.length > 0) {
      jogos = jogos.filter((jogo) => this.comecaNaData(jogo.dataHora, dataFiltro));
    }

    return jogos;
  });

  readonly totalJogos = computed(() => this.jogos().length);
  readonly jogosAgendados = computed(() => this.jogos().filter((jogo) => jogo.status === 'AGENDADO').length);
  readonly jogosEmAndamento = computed(() =>
    this.jogos().filter((jogo) => jogo.status === 'EM_ANDAMENTO').length
  );
  readonly jogosFinalizados = computed(() =>
    this.jogos().filter((jogo) => jogo.status === 'FINALIZADO').length
  );
  readonly jogoEmEdicao = computed(() =>
    this.jogos().find((jogo) => jogo.id === this.editorJogoId()) ?? null
  );
  readonly podeRegistrarSumula = computed(() => this.juizes().length >= 3);
  readonly faseSelecionada = computed(() =>
    this.fases().find((fase) => fase.id === this.cadastroForm.getRawValue().faseId) ?? null
  );
  readonly gruposDisponiveis = computed(() => {
    const fase = this.faseSelecionada();
    if (!fase || fase.tipo !== 'GRUPOS') {
      return [] as GrupoItem[];
    }

    return this.gruposPorFase()[fase.id] ?? [];
  });
  readonly atletasDisponiveis = computed(() => {
    const categoriaId = this.cadastroForm.getRawValue().categoriaId;

    if (!categoriaId) {
      return [] as Atleta[];
    }

    return this.atletas()
      .filter((atleta) => atleta.status === 'ATIVO' && atleta.categoria.id === categoriaId)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  });
  readonly podeCadastrarJogos = computed(() =>
    this.fases().length > 0 && this.categorias().length > 0 && this.atletas().length >= 2
  );
  readonly faseFiltroSelecionada = computed(() =>
    this.fases().find((fase) => fase.id === this.filtroForm.getRawValue().faseId) ?? null
  );
  readonly gruposDisponiveisFiltro = computed(() => {
    const fase = this.faseFiltroSelecionada();
    if (!fase || fase.tipo !== 'GRUPOS') {
      return [] as GrupoItem[];
    }

    return this.gruposPorFase()[fase.id] ?? [];
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

  carregarDados(campeonatoId: number, silencioso = false): void {
    if (silencioso) {
      this.refreshing.set(true);
    } else {
      this.loading.set(true);
    }

    this.error.set(null);
    this.actionError.set(null);

    forkJoin({
      campeonato: this.campeonatoApi.buscar(campeonatoId),
      jogos: this.jogosApi.listar(campeonatoId),
      juizes: this.cadastroApi.listarJuizes(campeonatoId),
      fases: this.competicaoApi.listarFases(campeonatoId),
      categorias: this.cadastroApi.listarCategorias(campeonatoId),
      atletas: this.cadastroApi.listarAtletas(campeonatoId)
    }).subscribe({
      next: ({ campeonato, jogos, juizes, fases, categorias, atletas }) => {
        this.campeonato.set(campeonato);
        this.jogos.set(jogos);
        this.juizes.set(juizes);
        this.fases.set(fases);
        this.categorias.set(categorias);
        this.atletas.set(atletas);
        this.prepararCadastro(fases, categorias, atletas);
        this.carregarGruposDasFases(fases);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os jogos deste campeonato.');
        this.loading.set(false);
        this.refreshing.set(false);
      }
    });
  }

  definirFiltro(status: FiltroStatus): void {
    this.statusFiltro.set(status);
  }

  atualizar(): void {
    const campeonatoId = this.campeonatoId();

    if (!campeonatoId) {
      return;
    }

    this.carregarDados(campeonatoId, true);
  }

  atualizarFiltros(): void {
    const fase = this.faseFiltroSelecionada();
    const grupos = this.gruposDisponiveisFiltro();
    const atual = this.filtroForm.getRawValue();

    if (!fase || fase.tipo !== 'GRUPOS') {
      this.filtroForm.patchValue({ grupoId: 0 });
      return;
    }

    if (!grupos.some((grupo) => grupo.id === atual.grupoId)) {
      this.filtroForm.patchValue({ grupoId: 0 });
    }
  }

  limparFiltros(): void {
    this.filtroForm.reset({
      faseId: 0,
      grupoId: 0,
      categoriaId: 0,
      data: ''
    });
  }

  atualizarDependenciasCadastro(): void {
    const fase = this.faseSelecionada();
    const grupos = this.gruposDisponiveis();
    const cadastro = this.cadastroForm.getRawValue();

    if (!fase || fase.tipo !== 'GRUPOS') {
      this.cadastroForm.patchValue({ grupoId: 0 });
    } else if (!grupos.some((grupo) => grupo.id === cadastro.grupoId)) {
      this.cadastroForm.patchValue({ grupoId: grupos[0]?.id ?? 0 });
    }

    const atletas = this.atletasDisponiveis();
    if (!atletas.some((atleta) => atleta.id === cadastro.atletaVermelhoId)) {
      this.cadastroForm.patchValue({ atletaVermelhoId: atletas[0]?.id ?? 0 });
    }

    const disponiveisAzul = atletas.filter((atleta) => atleta.id !== this.cadastroForm.getRawValue().atletaVermelhoId);
    if (!disponiveisAzul.some((atleta) => atleta.id === cadastro.atletaAzulId)) {
      this.cadastroForm.patchValue({ atletaAzulId: disponiveisAzul[0]?.id ?? 0 });
    }
  }

  salvarCadastro(): void {
    if (!this.podeCadastrarJogos()) {
      this.actionError.set('Cadastre fases, categorias e ao menos dois atletas ativos antes de criar jogos.');
      return;
    }

    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const raw = this.cadastroForm.getRawValue();
    if (raw.atletaVermelhoId === raw.atletaAzulId) {
      this.actionError.set('Selecione atletas diferentes para vermelho e azul.');
      return;
    }

    const fase = this.faseSelecionada();
    const grupoId = fase?.tipo === 'GRUPOS' ? (raw.grupoId > 0 ? raw.grupoId : null) : null;

    this.savingCadastro.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.jogosApi.criar({
      faseId: raw.faseId,
      grupoId,
      categoriaId: raw.categoriaId,
      atletaVermelhoId: raw.atletaVermelhoId,
      atletaAzulId: raw.atletaAzulId,
      dataHora: this.normalizeOptionalDateTime(raw.dataHora)
    }).subscribe({
      next: (jogo) => {
        this.jogos.update((lista) => [jogo, ...lista]);
        this.savingCadastro.set(false);
        this.actionSuccess.set('Jogo criado com sucesso.');
        this.prepararCadastro(this.fases(), this.categorias(), this.atletas(), true);
      },
      error: () => {
        this.actionError.set('Nao foi possivel criar o jogo.');
        this.savingCadastro.set(false);
      }
    });
  }

  iniciarJogo(jogoId: number): void {
    this.jogoEmAcaoId.set(jogoId);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.jogosApi.iniciar(jogoId).subscribe({
      next: (jogoAtualizado) => {
        this.jogos.update((lista) => lista.map((jogo) => (jogo.id === jogoId ? jogoAtualizado : jogo)));
        this.jogoEmAcaoId.set(null);
        this.actionSuccess.set('Jogo iniciado com sucesso.');
      },
      error: () => {
        this.actionError.set('Nao foi possivel iniciar o jogo selecionado.');
        this.jogoEmAcaoId.set(null);
      }
    });
  }

  abrirEditorResultado(jogo: JogoItem): void {
    this.editorJogoId.set(jogo.id);
    this.editorOperacao.set('RESULTADO');
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.correcaoForm.reset({ motivo: '' });
    this.resultadoForm.reset({
      pontosVermelho: jogo.pontosVermelho ?? 0,
      pontosAzul: jogo.pontosAzul ?? 0
    });
  }

  abrirEditorCorrecaoResultado(jogo: JogoItem): void {
    this.editorJogoId.set(jogo.id);
    this.editorOperacao.set('CORRECAO_RESULTADO');
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.correcaoForm.reset({ motivo: '' });
    this.resultadoForm.reset({
      pontosVermelho: jogo.pontosVermelho ?? 0,
      pontosAzul: jogo.pontosAzul ?? 0
    });
  }

  abrirEditorSumula(jogo: JogoItem): void {
    this.editorJogoId.set(jogo.id);
    this.editorOperacao.set('SUMULA');
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.correcaoForm.reset({ motivo: '' });
    this.preencherSumulaPadrao();
  }

  abrirEditorCorrecaoSumula(jogo: JogoItem): void {
    this.editorJogoId.set(jogo.id);
    this.editorOperacao.set('CORRECAO_SUMULA');
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.correcaoForm.reset({ motivo: '' });
    this.preencherSumulaPadrao();
  }

  fecharEditor(): void {
    this.editorJogoId.set(null);
    this.editorOperacao.set(null);
  }

  salvarResultado(): void {
    const jogo = this.jogoEmEdicao();

    if (!jogo) {
      return;
    }

    if (this.resultadoForm.invalid) {
      this.resultadoForm.markAllAsTouched();
      return;
    }

    this.jogoEmAcaoId.set(jogo.id);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    const raw = this.resultadoForm.getRawValue();
    const vencedor = this.calcularVencedor(raw.pontosVermelho, raw.pontosAzul);

    this.jogosApi.registrarResultado(jogo.id, {
      pontosVermelho: raw.pontosVermelho,
      pontosAzul: raw.pontosAzul,
      vencedor
    }).subscribe({
      next: (jogoAtualizado) => {
        this.jogos.update((lista) => lista.map((item) => (item.id === jogo.id ? jogoAtualizado : item)));
        this.jogoEmAcaoId.set(null);
        this.actionSuccess.set('Resultado registrado com sucesso.');
        this.fecharEditor();
      },
      error: () => {
        this.actionError.set('Nao foi possivel registrar o resultado.');
        this.jogoEmAcaoId.set(null);
      }
    });
  }

  corrigirResultado(): void {
    const jogo = this.jogoEmEdicao();

    if (!jogo) {
      return;
    }

    if (this.correcaoForm.invalid || this.resultadoForm.invalid) {
      this.correcaoForm.markAllAsTouched();
      this.resultadoForm.markAllAsTouched();
      return;
    }

    this.jogoEmAcaoId.set(jogo.id);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    const correcao = this.correcaoForm.getRawValue();
    const resultado = this.resultadoForm.getRawValue();
    const vencedor = this.calcularVencedor(resultado.pontosVermelho, resultado.pontosAzul);

    this.jogosApi.corrigirResultado(jogo.id, {
      motivo: correcao.motivo.trim(),
      resultado: {
        pontosVermelho: resultado.pontosVermelho,
        pontosAzul: resultado.pontosAzul,
        vencedor
      }
    }).subscribe({
      next: () => {
        this.jogos.update((lista) =>
          lista.map((item) =>
            item.id === jogo.id
              ? {
                  ...item,
                  pontosVermelho: resultado.pontosVermelho,
                  pontosAzul: resultado.pontosAzul,
                  vencedor
                }
              : item
          )
        );
        this.jogoEmAcaoId.set(null);
        this.actionSuccess.set('Resultado corrigido com sucesso.');
        this.fecharEditor();
      },
      error: () => {
        this.actionError.set('Nao foi possivel corrigir o resultado.');
        this.jogoEmAcaoId.set(null);
      }
    });
  }

  salvarSumula(): void {
    const jogo = this.jogoEmEdicao();

    if (!jogo) {
      return;
    }

    if (!this.podeRegistrarSumula()) {
      this.actionError.set('Cadastre ao menos 3 juizes para registrar a sumula.');
      return;
    }

    if (this.sumulaForm.invalid) {
      this.sumulaForm.markAllAsTouched();
      return;
    }

    this.jogoEmAcaoId.set(jogo.id);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.jogosApi.registrarSumula(jogo.id, this.montarPayloadSumula()).subscribe({
      next: (sumula) => {
        this.aplicarSumula(sumula);
        this.jogoEmAcaoId.set(null);
        this.actionSuccess.set('Sumula registrada com sucesso.');
        this.fecharEditor();
      },
      error: () => {
        this.actionError.set('Nao foi possivel registrar a sumula.');
        this.jogoEmAcaoId.set(null);
      }
    });
  }

  corrigirSumula(): void {
    const jogo = this.jogoEmEdicao();

    if (!jogo) {
      return;
    }

    if (!this.podeRegistrarSumula()) {
      this.actionError.set('Cadastre ao menos 3 juizes para corrigir a sumula.');
      return;
    }

    if (this.correcaoForm.invalid || this.sumulaForm.invalid) {
      this.correcaoForm.markAllAsTouched();
      this.sumulaForm.markAllAsTouched();
      return;
    }

    this.jogoEmAcaoId.set(jogo.id);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.jogosApi.corrigirSumula(jogo.id, {
      motivo: this.correcaoForm.getRawValue().motivo.trim(),
      sumula: this.montarPayloadSumula()
    }).subscribe({
      next: () => {
        const sumula = this.montarSumulaLocal(jogo.id);
        this.aplicarSumula(sumula);
        this.jogoEmAcaoId.set(null);
        this.actionSuccess.set('Sumula corrigida com sucesso.');
        this.fecharEditor();
      },
      error: () => {
        this.actionError.set('Nao foi possivel corrigir a sumula.');
        this.jogoEmAcaoId.set(null);
      }
    });
  }

  trackByJogo(_: number, jogo: JogoItem): number {
    return jogo.id;
  }

  trackByJuiz(_: number, juiz: JuizResumo): number {
    return juiz.id;
  }

  trackByFase(_: number, fase: FaseItem): number {
    return fase.id;
  }

  trackByGrupo(_: number, grupo: GrupoItem): number {
    return grupo.id;
  }

  trackByCategoria(_: number, categoria: CategoriaResumo): number {
    return categoria.id;
  }

  trackByAtleta(_: number, atleta: Atleta): number {
    return atleta.id;
  }

  descricaoStatus(status: FiltroStatus): string {
    switch (status) {
      case 'AGENDADO':
        return 'Agendados';
      case 'EM_ANDAMENTO':
        return 'Em andamento';
      case 'FINALIZADO':
        return 'Finalizados';
      default:
        return 'Todos';
    }
  }

  tituloEditor(): string {
    switch (this.editorOperacao()) {
      case 'RESULTADO':
        return 'Registrar resultado';
      case 'SUMULA':
        return 'Registrar sumula';
      case 'CORRECAO_RESULTADO':
        return 'Corrigir resultado';
      case 'CORRECAO_SUMULA':
        return 'Corrigir sumula';
      default:
        return 'Editor';
    }
  }

  modoCorrecao(): boolean {
    return this.editorOperacao() === 'CORRECAO_RESULTADO' || this.editorOperacao() === 'CORRECAO_SUMULA';
  }

  modoResultado(): boolean {
    return this.editorOperacao() === 'RESULTADO' || this.editorOperacao() === 'CORRECAO_RESULTADO';
  }

  formatoDataHora(dataHora: string | null): string {
    if (!dataHora) {
      return 'Nao agendado';
    }

    const data = new Date(dataHora);
    if (Number.isNaN(data.getTime())) {
      return dataHora;
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(data);
  }

  placar(jogo: JogoItem): string {
    if (jogo.pontosVermelho == null || jogo.pontosAzul == null) {
      return 'Sem placar';
    }

    return `${jogo.pontosVermelho} x ${jogo.pontosAzul}`;
  }

  vencedor(jogo: JogoItem): string {
    if (jogo.vencedor === 'VERMELHO') {
      return jogo.atletaVermelho.nome;
    }

    if (jogo.vencedor === 'AZUL') {
      return jogo.atletaAzul.nome;
    }

    return 'Empate ou indefinido';
  }

  grupoLabel(jogo: JogoItem): string | null {
    return jogo.grupo ? `Grupo ${jogo.grupo.nome}` : null;
  }

  resumoFiltros(): string {
    const filtro = this.filtroForm.getRawValue();
    const partes: string[] = [this.descricaoStatus(this.statusFiltro())];

    if (filtro.faseId > 0) {
      const fase = this.fases().find((item) => item.id === filtro.faseId);
      if (fase) {
        partes.push(`fase ${fase.nome}`);
      }
    }

    if (filtro.grupoId > 0) {
      const grupo = this.gruposDisponiveisFiltro().find((item) => item.id === filtro.grupoId);
      if (grupo) {
        partes.push(`grupo ${grupo.nome}`);
      }
    }

    if (filtro.categoriaId > 0) {
      const categoria = this.categorias().find((item) => item.id === filtro.categoriaId);
      if (categoria) {
        partes.push(`categoria ${categoria.nome}`);
      }
    }

    if (filtro.data.trim().length > 0) {
      partes.push(`data ${filtro.data}`);
    }

    return partes.join(' • ');
  }

  tituloCadastroDependencias(): string {
    if (this.fases().length === 0) {
      return 'Cadastre ao menos uma fase antes de criar jogos.';
    }

    if (this.categorias().length === 0) {
      return 'Cadastre ao menos uma categoria antes de criar jogos.';
    }

    if (this.atletasDisponiveis().length < 2) {
      return 'Escolha uma categoria com pelo menos dois atletas ativos para montar o confronto.';
    }

    return '';
  }

  private carregarGruposDasFases(fases: FaseItem[]): void {
    const fasesComGrupos = fases.filter((fase) => fase.tipo === 'GRUPOS');

    if (fasesComGrupos.length === 0) {
      this.gruposPorFase.set({});
      this.loading.set(false);
      this.refreshing.set(false);
      return;
    }

    forkJoin(fasesComGrupos.map((fase) => this.competicaoApi.listarGrupos(fase.id))).subscribe({
      next: (respostas) => {
        const mapa: Record<number, GrupoItem[]> = {};
        fasesComGrupos.forEach((fase, index) => {
          mapa[fase.id] = respostas[index];
        });
        this.gruposPorFase.set(mapa);
        this.atualizarDependenciasCadastro();
        this.loading.set(false);
        this.refreshing.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os grupos das fases.');
        this.loading.set(false);
        this.refreshing.set(false);
      }
    });
  }

  private prepararCadastro(
    fases: FaseItem[],
    categorias: CategoriaResumo[],
    atletas: Atleta[],
    limparData = false
  ): void {
    const atual = this.cadastroForm.getRawValue();
    const faseId = fases.some((fase) => fase.id === atual.faseId) ? atual.faseId : (fases[0]?.id ?? 0);
    const categoriaId = categorias.some((categoria) => categoria.id === atual.categoriaId)
      ? atual.categoriaId
      : (categorias[0]?.id ?? 0);

    const atletasDaCategoria = atletas
      .filter((atleta) => atleta.status === 'ATIVO' && atleta.categoria.id === categoriaId)
      .sort((a, b) => a.nome.localeCompare(b.nome));
    const atletaVermelhoId = atletasDaCategoria.some((atleta) => atleta.id === atual.atletaVermelhoId)
      ? atual.atletaVermelhoId
      : (atletasDaCategoria[0]?.id ?? 0);
    const atletaAzulCandidatos = atletasDaCategoria.filter((atleta) => atleta.id !== atletaVermelhoId);
    const atletaAzulId = atletaAzulCandidatos.some((atleta) => atleta.id === atual.atletaAzulId)
      ? atual.atletaAzulId
      : (atletaAzulCandidatos[0]?.id ?? 0);

    this.cadastroForm.reset({
      faseId,
      grupoId: 0,
      categoriaId,
      atletaVermelhoId,
      atletaAzulId,
      dataHora: limparData ? '' : atual.dataHora
    });
  }

  private preencherSumulaPadrao(): void {
    const juizes = this.juizes();
    this.sumulaForm.reset({
      observacoes: '',
      juiz1Id: juizes[0]?.id ?? 0,
      juiz1PontosVermelho: 10,
      juiz1PontosAzul: 8,
      juiz1Observacoes: '',
      juiz2Id: juizes[1]?.id ?? 0,
      juiz2PontosVermelho: 9,
      juiz2PontosAzul: 10,
      juiz2Observacoes: '',
      juiz3Id: juizes[2]?.id ?? 0,
      juiz3PontosVermelho: 10,
      juiz3PontosAzul: 9,
      juiz3Observacoes: ''
    });
  }

  private montarPayloadSumula() {
    const raw = this.sumulaForm.getRawValue();

    return {
      observacoes: this.normalizeOptionalText(raw.observacoes),
      avaliacoes: [
        {
          juizId: raw.juiz1Id,
          pontosVermelho: raw.juiz1PontosVermelho,
          pontosAzul: raw.juiz1PontosAzul,
          observacoes: this.normalizeOptionalText(raw.juiz1Observacoes)
        },
        {
          juizId: raw.juiz2Id,
          pontosVermelho: raw.juiz2PontosVermelho,
          pontosAzul: raw.juiz2PontosAzul,
          observacoes: this.normalizeOptionalText(raw.juiz2Observacoes)
        },
        {
          juizId: raw.juiz3Id,
          pontosVermelho: raw.juiz3PontosVermelho,
          pontosAzul: raw.juiz3PontosAzul,
          observacoes: this.normalizeOptionalText(raw.juiz3Observacoes)
        }
      ]
    };
  }

  private montarSumulaLocal(jogoId: number): SumulaJogoResponse {
    const payload = this.montarPayloadSumula();
    const totalVermelho = payload.avaliacoes.reduce((acc, item) => acc + item.pontosVermelho, 0);
    const totalAzul = payload.avaliacoes.reduce((acc, item) => acc + item.pontosAzul, 0);
    const votosVermelho = payload.avaliacoes.filter((item) => item.pontosVermelho > item.pontosAzul).length;
    const votosAzul = payload.avaliacoes.length - votosVermelho;
    const vencedor = votosVermelho > votosAzul ? 'VERMELHO' : 'AZUL';

    return {
      sumulaId: 0,
      jogoId,
      observacoes: payload.observacoes,
      pontosVermelho: totalVermelho,
      pontosAzul: totalAzul,
      vencedor,
      status: 'FINALIZADO',
      avaliacoes: []
    };
  }

  private aplicarSumula(sumula: SumulaJogoResponse): void {
    this.jogos.update((lista) =>
      lista.map((jogo) =>
        jogo.id === sumula.jogoId
          ? {
              ...jogo,
              pontosVermelho: sumula.pontosVermelho,
              pontosAzul: sumula.pontosAzul,
              vencedor: sumula.vencedor,
              status: sumula.status
            }
          : jogo
      )
    );
  }

  private calcularVencedor(pontosVermelho: number, pontosAzul: number): 'VERMELHO' | 'AZUL' | null {
    if (pontosVermelho === pontosAzul) {
      return null;
    }

    return pontosVermelho > pontosAzul ? 'VERMELHO' : 'AZUL';
  }

  private normalizeOptionalText(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeOptionalDateTime(value: string): string | null {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  private comecaNaData(dataHora: string | null, data: string): boolean {
    if (!dataHora) {
      return false;
    }

    const parsed = new Date(dataHora);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }

    const ano = parsed.getFullYear();
    const mes = `${parsed.getMonth() + 1}`.padStart(2, '0');
    const dia = `${parsed.getDate()}`.padStart(2, '0');
    return `${ano}-${mes}-${dia}` === data;
  }
}
