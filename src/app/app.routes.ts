import { Routes } from '@angular/router';
import { InstructionsComponent } from './components/instructions/instructions.component';
import { GrafoComponent } from './components/grafo/grafo.component';
import { NodeDetailsComponent } from './components/node-details/node-details.component';
export const routes: Routes = [
  { path: 'grapho', component: GrafoComponent },
  { path: 'node/:id', component: NodeDetailsComponent },
  { path: 'instructions', component: InstructionsComponent },
  { path: '', redirectTo: 'grapho', pathMatch: 'full' },
];
