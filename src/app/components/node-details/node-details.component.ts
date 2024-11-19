import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { Node } from '../../models/grafo.models';
import { NodesService } from '../../services/nodes/nodes.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-node-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule, NgIf],
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss'],
})
export class NodeDetailsComponent {
  @Input() node!: Node; // Asegurarse de que la propiedad esté decorada con @Input
  constructor(private nodeService: NodesService) {}

  updateNode() {
    this.nodeService.updateNode(this.node);
  }

  deleteNode() {
    this.nodeService.deleteNode(this.node.id);
    this.closeScreen();
  }

  closeScreen() {
    this.nodeService.selectedNode = null;
  }
}
