import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NodesService } from '../../../services/nodes/nodes.service';
import { Node, Link } from '../../../models/grafo.models';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-links-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor],
  templateUrl: './links-form.component.html',
  styleUrl: './links-form.component.scss',
})
export class LinksFormComponent {
  linksForm: FormGroup;
  nodes: Node[] = [];

  constructor(private fb: FormBuilder, private nodesService: NodesService) {
    this.linksForm = this.fb.group({
      source: ['', Validators.required],
      target: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    this.nodesService.nodesChanged$.subscribe((nodes) => {
      this.nodes = nodes;
    });
  }

  onSubmit() {
    if (this.linksForm.valid) {
      const link: Link = {
        source: this.linksForm.value.source,
        target: this.linksForm.value.target,
      };
      console.log('Submitting link:', link); // Registro de depuración
      this.nodesService.addLink(link);
    }
  }
}
