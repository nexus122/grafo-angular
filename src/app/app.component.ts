import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GrafoComponent } from './components/grafo/grafo.component';
import { FooterComponent } from './components/shared/footer/footer.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GrafoComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'grafo-angular';
}
