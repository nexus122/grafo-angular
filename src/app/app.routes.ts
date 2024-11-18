import { Routes } from '@angular/router';
import { InstructionsComponent } from './components/instructions/instructions.component';
import { GrafoComponent } from './components/grafo/grafo.component';
export const routes: Routes = [
  { path: '', component: GrafoComponent },
  { path: 'instructions', component: InstructionsComponent },
];
