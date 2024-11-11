import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NodesService } from '../../../services/nodes/nodes.service';
import { Node } from '../../../models/grafo.models';

@Component({
  selector: 'app-nodes-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './nodes-form.component.html',
  styleUrl: './nodes-form.component.scss',
})
export class NodesFormComponent {
  nodeForm: FormGroup;

  constructor(private fb: FormBuilder, private nodesService: NodesService) {
    this.nodeForm = this.fb.group({
      nodeName: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.nodeForm.valid) {
      const node: Node = {
        id: Date.now().toString(),
        name: this.nodeForm.value.nodeName,
      };
      this.nodesService.addNode(node);
      this.nodeForm.reset();
      this.nodeForm.controls['nodeName'].setErrors(null);
      document.getElementById('nodeName')?.focus();
    }
  }
}
