import {
  Component,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
  ElementRef,
  HostListener,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { Node } from '../../models/grafo.models';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';

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

  labelText: string = '';
  descriptionText: string = '';
  isExpanded: boolean = false;
  isDescriptionVisible: boolean = false;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  constructor(private el: ElementRef) {
    console.log('EditLabelComponent constructor called');
  }

  ngAfterViewInit() {
    this.labelText = this.node.name;
    this.descriptionText = this.node.description || ''; // Asegurarse de cargar la descripción
    const inputElement = this.el.nativeElement.querySelector('input');
    if (inputElement) {
      inputElement.focus();
    }
    this.el.nativeElement.style.position = 'absolute';
    this.el.nativeElement.style.left = `${this.position.x}px`;
    this.el.nativeElement.style.top = `${this.position.y}px`;
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
    console.log('toggleDescriptionVisibility called');
    console.log('isDescriptionVisible before:', this.isDescriptionVisible);
    this.isDescriptionVisible = !this.isDescriptionVisible;
    console.log('isDescriptionVisible after:', this.isDescriptionVisible);
  }

  onDragStart(event: MouseEvent) {
    if ((event.target as HTMLElement).tagName.toLowerCase() === 'textarea') {
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
