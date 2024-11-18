import { Component, inject } from '@angular/core';
import { NodesService } from '../../../services/nodes/nodes.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  nodeService = inject(NodesService);
}
