import { Routes } from '@angular/router';
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
  }
];
