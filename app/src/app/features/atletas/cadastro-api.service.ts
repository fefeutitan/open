import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface CategoriaResumo {
  id: number;
  nome: string;
  genero: string;
  idadeMinima: number | null;
  idadeMaxima: number | null;
  pesoMinimo: number | null;
  pesoMaximo: number | null;
}

export interface NucleoResumo {
  id: number;
  nome: string;
  cidade: string | null;
  responsavel: string | null;
}

export interface JuizResumo {
  id: number;
  nome: string;
  registro: string | null;
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

export interface CategoriaRequest {
  campeonatoId: number;
  nome: string;
  genero: 'MASCULINO' | 'FEMININO' | 'MISTO';
  idadeMinima: number | null;
  idadeMaxima: number | null;
  pesoMinimo: number | null;
  pesoMaximo: number | null;
}

export interface NucleoRequest {
  campeonatoId: number;
  nome: string;
  cidade: string | null;
  responsavel: string | null;
}

export interface JuizRequest {
  campeonatoId: number;
  nome: string;
  registro: string | null;
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

  criarCategoria(payload: CategoriaRequest): Observable<CategoriaResumo> {
    return this.http.post<CategoriaResumo>('/api/cadastros/categorias', payload);
  }

  listarNucleos(campeonatoId: number): Observable<NucleoResumo[]> {
    const params = new HttpParams().set('campeonatoId', campeonatoId);
    return this.http.get<NucleoResumo[]>('/api/cadastros/nucleos', { params });
  }

  criarNucleo(payload: NucleoRequest): Observable<NucleoResumo> {
    return this.http.post<NucleoResumo>('/api/cadastros/nucleos', payload);
  }

  listarJuizes(campeonatoId: number): Observable<JuizResumo[]> {
    const params = new HttpParams().set('campeonatoId', campeonatoId);
    return this.http.get<JuizResumo[]>('/api/cadastros/juizes', { params });
  }

  criarJuiz(payload: JuizRequest): Observable<JuizResumo> {
    return this.http.post<JuizResumo>('/api/cadastros/juizes', payload);
  }
}
