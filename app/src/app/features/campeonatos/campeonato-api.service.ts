import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Campeonato {
  id: number;
  nome: string;
  descricao: string | null;
  local: string;
  dataInicio: string | null;
  dataFim: string | null;
  status: string;
}

export interface CampeonatoRequest {
  nome: string;
  descricao: string | null;
  local: string;
  dataInicio: string | null;
  dataFim: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CampeonatoApiService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Campeonato[]> {
    return this.http.get<Campeonato[]>('/api/campeonatos');
  }

  buscar(id: number): Observable<Campeonato> {
    return this.http.get<Campeonato>(`/api/campeonatos/${id}`);
  }

  criar(payload: CampeonatoRequest): Observable<Campeonato> {
    return this.http.post<Campeonato>('/api/campeonatos', payload);
  }
}
