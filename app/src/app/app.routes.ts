import { Routes } from '@angular/router';
import { CampeonatoDetalhePageComponent } from './features/campeonatos/campeonato-detalhe-page.component';
import { CampeonatosPageComponent } from './features/campeonatos/campeonatos-page.component';
import { PainelPageComponent } from './features/painel/painel-page.component';

export const routes: Routes = [
  {
    path: '',
    component: PainelPageComponent,
    pathMatch: 'full'
  },
  {
    path: 'campeonatos',
    component: CampeonatosPageComponent
  },
  {
    path: 'campeonatos/:id',
    component: CampeonatoDetalhePageComponent
  }
];
