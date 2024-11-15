import {
  Component,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
  ElementRef,
  HostListener,
  NO_ERRORS_SCHEMA,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { Node } from '../../models/grafo.models';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { NodesService } from '../../services/nodes/nodes.service';

@Component({
  selector: 'app-edit-label',
  templateUrl: './edit-label.component.html',
  styleUrls: ['./edit-label.component.scss'],
  standalone: true,
  imports: [FormsModule, MarkdownModule, CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class EditLabelComponent implements AfterViewInit {
  @Input() node!: Node;
  @Input() position!: { x: number; y: number };
  @Output() updateNodeDetails = new EventEmitter<{
    node: Node;
    newName: string;
    newDescription: string;
  }>();
  @Output() closeEdit = new EventEmitter<void>();
  nodeService = inject(NodesService);

  labelText: string = '';
  descriptionText: string = '';
  isExpanded: boolean = false;
  isDescriptionVisible: boolean = false;
  id: string = '';
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.labelText = this.node.name;
    this.descriptionText = this.node.description || '';
    const inputElement = this.el.nativeElement.querySelector('input');
    this.id = this.node.id;
    if (inputElement) {
      inputElement.focus();
    }
    this.el.nativeElement.style.position = 'absolute';

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const modalWidth = this.el.nativeElement.offsetWidth;
      const modalHeight = this.el.nativeElement.offsetHeight;

      this.el.nativeElement.style.left = `${
        (viewportWidth - modalWidth) / 2
      }px`;
      this.el.nativeElement.style.top = `${
        (viewportHeight - modalHeight) / 2
      }px`;
    } else {
      this.el.nativeElement.style.left = `${this.position.x}px`;
      this.el.nativeElement.style.top = `${this.position.y}px`;
    }

    this.el.nativeElement.style.zIndex = '1000';

    const rect = this.el.nativeElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 10;

    if (rect.right > viewportWidth - margin) {
      this.el.nativeElement.style.left = `${
        viewportWidth - rect.width - margin
      }px`;
    }
    if (rect.bottom > viewportHeight - margin) {
      this.el.nativeElement.style.top = `${
        viewportHeight - rect.height - margin
      }px`;
    }
    if (rect.left < margin) {
      this.el.nativeElement.style.left = `${margin}px`;
    }
    if (rect.top < margin) {
      this.el.nativeElement.style.top = `${margin}px`;
    }

    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.el.nativeElement.contains(target)) {
      this.closeEdit.emit();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.closeEdit.emit();
  }

  saveLabel() {
    this.updateNodeDetails.emit({
      node: this.node,
      newName: this.labelText,
      newDescription: this.descriptionText,
    });
    this.closeEdit.emit();
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  toggleDescriptionVisibility() {
    this.isDescriptionVisible = !this.isDescriptionVisible;
  }

  deleteNode(id: string) {
    this.nodeService.deleteNode(id);
    this.closeEdit.emit();
  }

  onDragStart(event: MouseEvent) {
    const targetTag = (event.target as HTMLElement).tagName.toLowerCase();
    if (targetTag === 'textarea' || targetTag === 'input') {
      return;
    }
    this.isDragging = true;
    this.dragStartX = event.clientX - this.el.nativeElement.offsetLeft;
    this.dragStartY = event.clientY - this.el.nativeElement.offsetTop;
  }

  @HostListener('document:mousemove', ['$event'])
  onDrag(event: MouseEvent) {
    if (this.isDragging) {
      this.el.nativeElement.style.left = `${event.clientX - this.dragStartX}px`;
      this.el.nativeElement.style.top = `${event.clientY - this.dragStartY}px`;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onDragEnd() {
    this.isDragging = false;
  }
}
