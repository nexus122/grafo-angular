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

  // Links
  addLink(link: Link) {
    const links = [...this.linksSubject.getValue(), link];
    this.linksSubject.next(links);
    this.localStorageService.addData('links', links);
  }

  getLinks(): Link[] {
    return this.linksSubject.getValue();
  }

  // Clear
  clear() {
    this.nodesSubject.next([]);
    this.linksSubject.next([]);
    this.localStorageService.clearData();
  }
}
