import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface CategoriaResumo {
  id: number;
  nome: string;
  genero: string;
}

export interface NucleoResumo {
  id: number;
  nome: string;
  cidade: string | null;
  responsavel: string | null;
}

export interface Atleta {
  id: number;
  nome: string;
  documento: string | null;
  dataNascimento: string | null;
  status: 'ATIVO' | 'INATIVO';
  categoria: CategoriaResumo;
  nucleo: NucleoResumo;
}

export interface AtletaRequest {
  nome: string;
  documento: string | null;
  dataNascimento: string | null;
  status: 'ATIVO' | 'INATIVO';
  categoriaId: number;
  nucleoId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CadastroApiService {
  private readonly http = inject(HttpClient);

  listarAtletas(campeonatoId: number): Observable<Atleta[]> {
    const params = new HttpParams().set('campeonatoId', campeonatoId);
    return this.http.get<Atleta[]>('/api/cadastros/atletas', { params });
  }

  criarAtleta(payload: AtletaRequest): Observable<Atleta> {
    return this.http.post<Atleta>('/api/cadastros/atletas', payload);
  }

  listarCategorias(campeonatoId: number): Observable<CategoriaResumo[]> {
    const params = new HttpParams().set('campeonatoId', campeonatoId);
    return this.http.get<CategoriaResumo[]>('/api/cadastros/categorias', { params });
  }

  listarNucleos(campeonatoId: number): Observable<NucleoResumo[]> {
    const params = new HttpParams().set('campeonatoId', campeonatoId);
    return this.http.get<NucleoResumo[]>('/api/cadastros/nucleos', { params });
  }
}
