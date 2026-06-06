import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface EntidadeResumo {
  id: number;
  nome: string;
}

export interface JogoAtletaResumo {
  id: number;
  nome: string;
}

export interface JogoItem {
  id: number;
  fase: EntidadeResumo;
  grupo: EntidadeResumo | null;
  categoria: EntidadeResumo;
  atletaVermelho: JogoAtletaResumo;
  atletaAzul: JogoAtletaResumo;
  dataHora: string | null;
  status: 'AGENDADO' | 'EM_ANDAMENTO' | 'FINALIZADO';
  vencedor: 'VERMELHO' | 'AZUL' | null;
  pontosVermelho: number | null;
  pontosAzul: number | null;
}

export interface ResultadoJogoRequest {
  pontosVermelho: number;
  pontosAzul: number;
  vencedor: 'VERMELHO' | 'AZUL' | null;
}

export interface JogoRequest {
  faseId: number;
  grupoId: number | null;
  categoriaId: number;
  atletaVermelhoId: number;
  atletaAzulId: number;
  dataHora: string | null;
}

export interface AvaliacaoJuizRequest {
  juizId: number;
  pontosVermelho: number;
  pontosAzul: number;
  observacoes: string | null;
}

export interface AvaliacaoJuizResponse {
  avaliacaoId: number;
  juizId: number;
  juizNome: string;
  pontosVermelho: number;
  pontosAzul: number;
  observacoes: string | null;
}

export interface SumulaJogoRequest {
  observacoes: string | null;
  avaliacoes: AvaliacaoJuizRequest[];
}

export interface SumulaJogoResponse {
  sumulaId: number;
  jogoId: number;
  observacoes: string | null;
  pontosVermelho: number;
  pontosAzul: number;
  vencedor: 'VERMELHO' | 'AZUL' | null;
  status: 'AGENDADO' | 'EM_ANDAMENTO' | 'FINALIZADO';
  avaliacoes: AvaliacaoJuizResponse[];
}

export interface CorrecaoJogoResponse {
  id: number;
  jogoId: number;
  tipo: 'RESULTADO' | 'SUMULA';
  motivo: string;
  detalheAnterior: string;
  detalheNovo: string;
  criadoEm: string;
}

@Injectable({
  providedIn: 'root'
})
export class JogosApiService {
  private readonly http = inject(HttpClient);

  listar(campeonatoId: number): Observable<JogoItem[]> {
    const params = new HttpParams().set('campeonatoId', campeonatoId);
    return this.http.get<JogoItem[]>('/api/competicao/jogos', { params });
  }

  listarDesempatesPendentes(campeonatoId: number): Observable<JogoItem[]> {
    const params = new HttpParams().set('campeonatoId', campeonatoId);
    return this.http.get<JogoItem[]>('/api/competicao/jogos/desempates-pendentes', { params });
  }

  iniciar(jogoId: number): Observable<JogoItem> {
    return this.http.patch<JogoItem>(`/api/competicao/jogos/${jogoId}/iniciar`, {});
  }

  criar(payload: JogoRequest): Observable<JogoItem> {
    return this.http.post<JogoItem>('/api/competicao/jogos', payload);
  }

  registrarResultado(jogoId: number, payload: ResultadoJogoRequest): Observable<JogoItem> {
    return this.http.patch<JogoItem>(`/api/competicao/jogos/${jogoId}/resultado`, payload);
  }

  registrarSumula(jogoId: number, payload: SumulaJogoRequest): Observable<SumulaJogoResponse> {
    return this.http.put<SumulaJogoResponse>(`/api/competicao/jogos/${jogoId}/sumula`, payload);
  }

  corrigirResultado(
    jogoId: number,
    payload: { motivo: string; resultado: ResultadoJogoRequest }
  ): Observable<CorrecaoJogoResponse> {
    return this.http.post<CorrecaoJogoResponse>(`/api/competicao/jogos/${jogoId}/correcoes/resultado`, payload);
  }

  corrigirSumula(
    jogoId: number,
    payload: { motivo: string; sumula: SumulaJogoRequest }
  ): Observable<CorrecaoJogoResponse> {
    return this.http.post<CorrecaoJogoResponse>(`/api/competicao/jogos/${jogoId}/correcoes/sumula`, payload);
  }
}
