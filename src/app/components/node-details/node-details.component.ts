import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { Node } from '../../models/grafo.models';
import { NodesService } from '../../services/nodes/nodes.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-node-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss'],
})
export class NodeDetailsComponent implements OnInit {
  node!: Node;

  constructor(
    private route: ActivatedRoute,
    private nodeService: NodesService
  ) {}

  ngOnInit() {
    const nodeId = this.route.snapshot.paramMap.get('id');
    this.node = this.nodeService.getNodeById(nodeId || '');
  }

  updateNode() {
    this.nodeService.updateNode(this.node);
  }

  deleteNode() {
    this.nodeService.deleteNode(this.node.id);
  }
}
