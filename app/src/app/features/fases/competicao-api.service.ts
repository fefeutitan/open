import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface FaseItem {
  id: number;
  nome: string;
  tipo: 'GRUPOS' | 'ELIMINATORIA';
  ordem: number;
  classificadosPorGrupo: number | null;
}

export interface GrupoItem {
  id: number;
  nome: string;
}

export interface ClassificacaoAtletaItem {
  atletaId: number;
  atletaNome: string;
  posicao: number;
  jogos: number;
  vitorias: number;
  derrotas: number;
  pontosClassificacao: number;
  pontosMarcados: number;
  pontosSofridos: number;
  saldoPontos: number;
}

export interface EntidadeResumo {
  id: number;
  nome: string;
}

export interface JogoGeradoItem {
  id: number;
  fase: EntidadeResumo;
  grupo: EntidadeResumo | null;
  categoria: EntidadeResumo;
  atletaVermelho: EntidadeResumo;
  atletaAzul: EntidadeResumo;
  dataHora: string | null;
  status: 'AGENDADO' | 'EM_ANDAMENTO' | 'FINALIZADO';
  vencedor: 'VERMELHO' | 'AZUL' | null;
  pontosVermelho: number | null;
  pontosAzul: number | null;
}

export interface FaseRequest {
  campeonatoId: number;
  nome: string;
  tipo: 'GRUPOS' | 'ELIMINATORIA';
  ordem: number;
  classificadosPorGrupo: number | null;
}

export interface GrupoRequest {
  faseId: number;
  nome: string;
}

export interface GeracaoMataMataRequest {
  faseEliminatoriaId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompeticaoApiService {
  private readonly http = inject(HttpClient);

  listarFases(campeonatoId: number): Observable<FaseItem[]> {
    const params = new HttpParams().set('campeonatoId', campeonatoId);
    return this.http.get<FaseItem[]>('/api/competicao/fases', { params });
  }

  criarFase(payload: FaseRequest): Observable<FaseItem> {
    return this.http.post<FaseItem>('/api/competicao/fases', payload);
  }

  listarGrupos(faseId: number): Observable<GrupoItem[]> {
    const params = new HttpParams().set('faseId', faseId);
    return this.http.get<GrupoItem[]>('/api/competicao/grupos', { params });
  }

  criarGrupo(payload: GrupoRequest): Observable<GrupoItem> {
    return this.http.post<GrupoItem>('/api/competicao/grupos', payload);
  }

  classificarGrupo(grupoId: number): Observable<ClassificacaoAtletaItem[]> {
    return this.http.get<ClassificacaoAtletaItem[]>(`/api/competicao/grupos/${grupoId}/classificacao`);
  }

  gerarMataMata(faseGruposId: number, payload: GeracaoMataMataRequest): Observable<JogoGeradoItem[]> {
    return this.http.post<JogoGeradoItem[]>(`/api/competicao/fases/${faseGruposId}/gerar-mata-mata`, payload);
  }
}
