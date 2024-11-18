import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  ViewContainerRef,
  HostListener,
} from '@angular/core';
import { NodesService } from '../../services/nodes/nodes.service';
import { Node } from '../../models/grafo.models';
import * as d3 from 'd3';
import { EditLabelComponent } from '../edit-label/edit-label.component';

@Component({
  selector: 'app-grafo',
  standalone: true,
  imports: [],
  templateUrl: './grafo.component.html',
  styleUrls: ['./grafo.component.scss'],
})
export class GrafoComponent {
  nodeService = inject(NodesService);
  @ViewChild('contextMenuContainer', { read: ViewContainerRef })
  contextMenuContainer!: ViewContainerRef;
  @ViewChild('editLabelContainer', { read: ViewContainerRef })
  editLabelContainer!: ViewContainerRef;

  private nodes: (Node & {
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
  })[] = [];
  private links: { source: Node; target: Node }[] = [];

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.nodeService.nodesChanged$.subscribe((nodes) => {
      this.nodes = nodes.map((node) => ({
        id: node.id,
        name: node.name,
        description: node.description,
      }));
      this.updateLinks();
      this.updateGraph();
    });
    this.nodeService.linksChanged$.subscribe((links) => {
      this.links = links.map((link) => ({
        source: this.nodes.find((node) => node.id === link.source)!,
        target: this.nodes.find((node) => node.id === link.target)!,
      }));
      this.updateGraph();
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.contextMenuContainer.clear();
    this.editLabelContainer.clear();
  }

  private updateLinks(): void {
    this.links = this.nodeService.getLinks().map((link) => ({
      source: this.nodes.find((node) => node.id === link.source)!,
      target: this.nodes.find((node) => node.id === link.target)!,
    }));
  }

  private updateGraph(): void {
    d3.select(this.el.nativeElement).select('svg').remove();
    this.createGraph();
  }

  private createGraph(): void {
    const svgElement = d3
      .select(this.el.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('style', 'position: absolute; top: 0;')
      .call(
        d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
          svg.attr('transform', event.transform);
        })
      )
      .append('g')
      .node() as SVGElement;

    const svg = d3.select(svgElement);

    if (!(svgElement instanceof SVGElement)) {
      throw new Error('svgElement is not an instance of SVGElement');
    }

    const { width, height } = this.el.nativeElement.getBoundingClientRect();

    const simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink<Node, { source: Node; target: Node }>(this.links)
          .id((d: Node) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter()
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', '#999');

    const node = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', '#69b3a2')
      .style('cursor', 'pointer')
      .on('dblclick', (event, d) => {
        this.showEditLabelInput(event, d);
      })
      .call(
        d3
          .drag<SVGCircleElement, Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            this.nodes.forEach((node) => {
              if (node.id !== d.id) {
                this.nodeService.addLinkIfClose(d, node, 50);
              }
            });
          })
      );

    const label = svg
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(this.nodes)
      .enter()
      .append('text')
      .attr('dy', -3)
      .attr('dx', 12)
      .text((d) => d.name)
      .attr('fill', () => {
        const isDarkTheme = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        return isDarkTheme ? '#ffffff' : '#000000';
      });

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x ?? 0)
        .attr('y1', (d) => d.source.y ?? 0)
        .attr('x2', (d) => d.target.x ?? 0)
        .attr('y2', (d) => d.target.y ?? 0);

      node.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0);

      label.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0);
    });
  }

  private showEditLabelInput(event: MouseEvent, node: Node): void {
    this.editLabelContainer.clear();
    const componentRef =
      this.editLabelContainer.createComponent(EditLabelComponent);
    const instance = componentRef.instance as EditLabelComponent;
    instance.node = node;
    instance.position = { x: event.pageX, y: event.pageY };
    instance.updateNodeDetails.subscribe(
      ({
        node,
        newName,
        newDescription,
      }: {
        node: Node;
        newName: string;
        newDescription: string;
      }) => {
        this.updateNodeDetails(node, newName, newDescription);
        this.editLabelContainer.clear();
      }
    );
    instance.closeEdit.subscribe(() => {
      this.editLabelContainer.clear();
    });
  }

  private updateNodeDetails(
    node: Node,
    newName: string,
    newDescription: string
  ): void {
    const nodes = this.nodeService
      .getNodes()
      .map((n) =>
        n.id === node.id
          ? { ...n, name: newName, description: newDescription }
          : n
      );
    this.nodeService.updateNodes(nodes);
    this.updateLinks();
    this.updateGraph();
  }
}
