import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Campeonato, CampeonatoApiService } from '../campeonatos/campeonato-api.service';
import { JogoItem, JogosApiService } from '../jogos/jogos-api.service';

@Component({
  selector: 'app-painel-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './painel-page.component.html',
  styleUrl: './painel-page.component.scss'
})
export class PainelPageComponent implements OnInit {
  private readonly campeonatoApi = inject(CampeonatoApiService);
  private readonly jogosApi = inject(JogosApiService);

  readonly campeonatos = signal<Campeonato[]>([]);
  readonly campeonatoSelecionadoId = signal<number | null>(null);
  readonly jogos = signal<JogoItem[]>([]);
  readonly desempates = signal<JogoItem[]>([]);
  readonly loadingCampeonatos = signal(false);
  readonly loadingJogos = signal(false);
  readonly error = signal<string | null>(null);

  readonly campeonatoSelecionado = computed(() =>
    this.campeonatos().find((campeonato) => campeonato.id === this.campeonatoSelecionadoId()) ?? null
  );
  readonly jogosHoje = computed(() => this.jogos().filter((jogo) => this.ehHoje(jogo.dataHora)).length);
  readonly jogosEmAndamento = computed(() =>
    this.jogos().filter((jogo) => jogo.status === 'EM_ANDAMENTO').length
  );
  readonly desempatesPendentes = computed(() => this.desempates().length);
  readonly jogosFinalizados = computed(() =>
    this.jogos().filter((jogo) => jogo.status === 'FINALIZADO').length
  );
  readonly filaOperacional = computed(() =>
    [...this.jogos()]
      .filter((jogo) => jogo.status !== 'FINALIZADO')
      .sort((a, b) => this.ordemStatus(a.status) - this.ordemStatus(b.status) || this.ordemData(a, b))
  );

  ngOnInit(): void {
    this.carregarPainel();
  }

  carregarPainel(): void {
    this.loadingCampeonatos.set(true);
    this.error.set(null);

    this.campeonatoApi.listar().subscribe({
      next: (campeonatos) => {
        this.campeonatos.set(campeonatos);
        this.loadingCampeonatos.set(false);

        if (campeonatos.length === 0) {
          this.campeonatoSelecionadoId.set(null);
          this.jogos.set([]);
          return;
        }

        const atual = this.campeonatoSelecionadoId();
        const selecionado = campeonatos.some((campeonato) => campeonato.id === atual)
          ? atual
          : campeonatos[0].id;

        this.campeonatoSelecionadoId.set(selecionado);
        this.carregarJogos();
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os campeonatos do painel.');
        this.loadingCampeonatos.set(false);
      }
    });
  }

  selecionarCampeonato(valor: string): void {
    const campeonatoId = Number(valor);

    if (!Number.isFinite(campeonatoId) || campeonatoId <= 0) {
      return;
    }

    this.campeonatoSelecionadoId.set(campeonatoId);
    this.carregarJogos();
  }

  atualizarJogos(): void {
    if (!this.campeonatoSelecionadoId()) {
      return;
    }

    this.carregarJogos();
  }

  formatarDataHora(dataHora: string | null): string {
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

  statusLabel(jogo: JogoItem): string {
    if (this.desempates().some((item) => item.id === jogo.id)) {
      return 'DESEMPATE';
    }

    return jogo.status;
  }

  confronto(jogo: JogoItem): string {
    return `${jogo.atletaVermelho.nome} x ${jogo.atletaAzul.nome}`;
  }

  detalhesJogo(jogo: JogoItem): string {
    const partes = [jogo.fase.nome];

    if (jogo.grupo) {
      partes.push(`Grupo ${jogo.grupo.nome}`);
    }

    partes.push(jogo.categoria.nome);
    return partes.join(' - ');
  }

  rotaJogos(): Array<string | number> {
    const campeonatoId = this.campeonatoSelecionadoId();
    return campeonatoId ? ['/campeonatos', campeonatoId, 'jogos'] : ['/campeonatos'];
  }

  rotaFases(): Array<string | number> {
    const campeonatoId = this.campeonatoSelecionadoId();
    return campeonatoId ? ['/campeonatos', campeonatoId, 'fases'] : ['/campeonatos'];
  }

  rotaDetalhe(): Array<string | number> {
    const campeonatoId = this.campeonatoSelecionadoId();
    return campeonatoId ? ['/campeonatos', campeonatoId] : ['/campeonatos'];
  }

  trackByCampeonato(_: number, campeonato: Campeonato): number {
    return campeonato.id;
  }

  trackByJogo(_: number, jogo: JogoItem): number {
    return jogo.id;
  }

  private carregarJogos(): void {
    const campeonatoId = this.campeonatoSelecionadoId();

    if (!campeonatoId) {
      this.jogos.set([]);
      this.desempates.set([]);
      return;
    }

    this.loadingJogos.set(true);
    this.error.set(null);

    this.jogosApi.listar(campeonatoId).subscribe({
      next: (jogos) => {
        this.jogosApi.listarDesempatesPendentes(campeonatoId).subscribe({
          next: (desempates) => {
            this.jogos.set(jogos);
            this.desempates.set(desempates);
            this.loadingJogos.set(false);
          },
          error: () => {
            this.error.set('Nao foi possivel carregar os desempates pendentes do campeonato selecionado.');
            this.loadingJogos.set(false);
          }
        });
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os jogos do campeonato selecionado.');
        this.loadingJogos.set(false);
      }
    });
  }

  private ehHoje(dataHora: string | null): boolean {
    if (!dataHora) {
      return false;
    }

    const data = new Date(dataHora);
    if (Number.isNaN(data.getTime())) {
      return false;
    }

    const hoje = new Date();
    return data.getFullYear() === hoje.getFullYear()
      && data.getMonth() === hoje.getMonth()
      && data.getDate() === hoje.getDate();
  }

  private ordemStatus(status: JogoItem['status']): number {
    switch (status) {
      case 'EM_ANDAMENTO':
        return 0;
      case 'AGENDADO':
        return 1;
      default:
        return 2;
    }
  }

  private ordemData(a: JogoItem, b: JogoItem): number {
    const dataA = a.dataHora ? new Date(a.dataHora).getTime() : Number.MAX_SAFE_INTEGER;
    const dataB = b.dataHora ? new Date(b.dataHora).getTime() : Number.MAX_SAFE_INTEGER;
    return dataA - dataB;
  }
}
