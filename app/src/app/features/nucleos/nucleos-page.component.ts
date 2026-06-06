import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CadastroApiService, NucleoResumo } from '../atletas/cadastro-api.service';
import { Campeonato, CampeonatoApiService } from '../campeonatos/campeonato-api.service';

@Component({
  selector: 'app-nucleos-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './nucleos-page.component.html',
  styleUrl: './nucleos-page.component.scss'
})
export class NucleosPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly cadastroApi = inject(CadastroApiService);
  private readonly campeonatoApi = inject(CampeonatoApiService);

  readonly campeonatoId = signal<number | null>(null);
  readonly campeonato = signal<Campeonato | null>(null);
  readonly nucleos = signal<NucleoResumo[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalNucleos = computed(() => this.nucleos().length);
  readonly nucleosComResponsavel = computed(() =>
    this.nucleos().filter((nucleo) => !!nucleo.responsavel).length
  );

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    cidade: [''],
    responsavel: ['']
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
      nucleos: this.cadastroApi.listarNucleos(campeonatoId)
    }).subscribe({
      next: ({ campeonato, nucleos }) => {
        this.campeonato.set(campeonato);
        this.nucleos.set(nucleos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os nucleos deste campeonato.');
        this.loading.set(false);
      }
    });
  }

  salvar(): void {
    const campeonatoId = this.campeonatoId();

    if (!campeonatoId) {
      this.error.set('Campeonato invalido para cadastro de nucleo.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const rawValue = this.form.getRawValue();
    this.cadastroApi.criarNucleo({
      campeonatoId,
      nome: rawValue.nome.trim(),
      cidade: this.normalizeOptionalText(rawValue.cidade),
      responsavel: this.normalizeOptionalText(rawValue.responsavel)
    }).subscribe({
      next: (nucleo) => {
        this.nucleos.update((lista) => [nucleo, ...lista]);
        this.saving.set(false);
        this.form.reset({
          nome: '',
          cidade: '',
          responsavel: ''
        });
      },
      error: () => {
        this.error.set('Nao foi possivel salvar o nucleo.');
        this.saving.set(false);
      }
    });
  }

  trackByNucleo(_: number, nucleo: NucleoResumo): number {
    return nucleo.id;
  }

  private normalizeOptionalText(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
