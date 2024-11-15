import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '../local-storage.service';
import { Link, Node } from '../../models/grafo.models';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NodesService {
  private nodesSubject = new BehaviorSubject<Node[]>(
    this.localStorageService.getData('nodes') || []
  );
  private linksSubject = new BehaviorSubject<Link[]>(
    this.localStorageService.getData('links') || []
  );

  nodesChanged$ = this.nodesSubject.asObservable();
  linksChanged$ = this.linksSubject.asObservable();

  constructor(private localStorageService: LocalStorageService) {}

  // Nodes
  addNode(node: Node) {
    const nodes = [...this.nodesSubject.getValue(), node];
    this.nodesSubject.next(nodes);
    this.localStorageService.addData('nodes', nodes);
  }

  getNodes(): Node[] {
    return this.nodesSubject.getValue();
  }

  updateNodes(nodes: Node[]) {
    this.nodesSubject.next(nodes);
    this.localStorageService.addData('nodes', nodes);
  }

  deleteNode(nodeId: string) {
    const nodes = this.nodesSubject
      .getValue()
      .filter((node) => node.id !== nodeId);
    this.nodesSubject.next(nodes);
    this.localStorageService.addData('nodes', nodes);

    const links = this.linksSubject
      .getValue()
      .filter((link) => link.source !== nodeId && link.target !== nodeId);
    this.linksSubject.next(links);
    this.localStorageService.addData('links', links);
  }

  // Links
  addLink(link: Link) {
    const links = [...this.linksSubject.getValue(), link];
    this.linksSubject.next(links);
    this.localStorageService.addData('links', links);
  }

  getLinks(): Link[] {
    return this.linksSubject.getValue();
  }

  updateLinks(links: Link[]): void {
    this.linksSubject.next(links);
    this.localStorageService.addData('links', links);
  }

  addLinkIfClose(node1: Node, node2: Node, distance: number) {
    const dx = (node1.x ?? 0) - (node2.x ?? 0);
    const dy = (node1.y ?? 0) - (node2.y ?? 0);
    if (Math.sqrt(dx * dx + dy * dy) < distance) {
      this.addLink({ source: node1.id, target: node2.id });
    }
  }

  // Clear
  clear() {
    this.nodesSubject.next([]);
    this.linksSubject.next([]);
    this.localStorageService.clearData();
  }
}
