import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  ElementRef,
} from '@angular/core';
import { Node } from '../../models/grafo.models';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class ContextMenuComponent {
  @Input() node!: Node;
  @Input() position!: { x: number; y: number };
  @Output() deleteNode = new EventEmitter<Node>();
  @Output() closeMenu = new EventEmitter<void>();

  constructor(private el: ElementRef) {}

  onDeleteNode() {
    this.deleteNode.emit(this.node);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeMenu.emit();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.closeMenu.emit();
  }
}
