import { Routes } from '@angular/router';
import { AtletasPageComponent } from './features/atletas/atletas-page.component';
import { CategoriasPageComponent } from './features/categorias/categorias-page.component';
import { CampeonatoDetalhePageComponent } from './features/campeonatos/campeonato-detalhe-page.component';
import { CampeonatosPageComponent } from './features/campeonatos/campeonatos-page.component';
import { FasesPageComponent } from './features/fases/fases-page.component';
import { JuizesPageComponent } from './features/juizes/juizes-page.component';
import { JogosPageComponent } from './features/jogos/jogos-page.component';
import { NucleosPageComponent } from './features/nucleos/nucleos-page.component';
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
  },
  {
    path: 'campeonatos/:id/atletas',
    component: AtletasPageComponent
  },
  {
    path: 'campeonatos/:id/categorias',
    component: CategoriasPageComponent
  },
  {
    path: 'campeonatos/:id/nucleos',
    component: NucleosPageComponent
  },
  {
    path: 'campeonatos/:id/juizes',
    component: JuizesPageComponent
  },
  {
    path: 'campeonatos/:id/fases',
    component: FasesPageComponent
  },
  {
    path: 'campeonatos/:id/jogos',
    component: JogosPageComponent
  }
];
