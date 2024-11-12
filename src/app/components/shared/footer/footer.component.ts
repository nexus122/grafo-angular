import { Component } from '@angular/core';
import { NodesFormComponent } from '../nodes-form/nodes-form.component';
import { NodesService } from '../../../services/nodes/nodes.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NodesFormComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  constructor(private nodeService: NodesService) {}

  exportData() {
    const nodes = localStorage.getItem('nodes');
    const links = localStorage.getItem('links');
    const data = { nodes, links };
    const dataStr = JSON.stringify(data);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  importData(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const data = JSON.parse(content);
      console.log(data);
      if (data.nodes) {
        localStorage.setItem('nodes', data.nodes);
        this.nodeService.updateNodes(JSON.parse(data.nodes));
      }
      if (data.links) {
        localStorage.setItem('links', data.links);
        this.nodeService.updateLinks(JSON.parse(data.links));
      }
    };
    reader.readAsText(file);
  }

  clearData() {
    localStorage.removeItem('nodes');
    localStorage.removeItem('links');
    this.nodeService.updateNodes([]);
    this.nodeService.updateLinks([]);
  }

  deleteNode(event: MouseEvent, nodeId: string) {
    event.preventDefault();
    const nodes = JSON.parse(localStorage.getItem('nodes') || '[]');
    const links = JSON.parse(localStorage.getItem('links') || '[]');

    const updatedNodes = nodes.filter((node: any) => node.id !== nodeId);
    const updatedLinks = links.filter(
      (link: any) => link.source !== nodeId && link.target !== nodeId
    );

    localStorage.setItem('nodes', JSON.stringify(updatedNodes));
    localStorage.setItem('links', JSON.stringify(updatedLinks));

    this.nodeService.updateNodes(updatedNodes);
    this.nodeService.updateLinks(updatedLinks);
  }
}
