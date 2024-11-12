import { Component, inject } from '@angular/core';
import { NodesService } from '../../../services/nodes/nodes.service';
import { NodesFormComponent } from '../nodes-form/nodes-form.component';
import { LinksFormComponent } from '../links-form/links-form.component';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NodesFormComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  nodeService = inject(NodesService);
}
