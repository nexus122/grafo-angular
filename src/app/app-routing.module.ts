import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GrafoComponent } from './components/grafo/grafo.component';
import { NodeDetailsComponent } from './components/node-details/node-details.component';
import { InstructionsComponent } from './components/instructions/instructions.component';

const routes: Routes = [
  { path: '', redirectTo: 'grapho', pathMatch: 'full' },
  { path: 'grapho', component: GrafoComponent },
  { path: 'node/:id', component: NodeDetailsComponent },
  { path: 'instructions', component: InstructionsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
