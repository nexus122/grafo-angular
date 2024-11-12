import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  ComponentFactoryResolver,
  ViewContainerRef,
  HostListener,
} from '@angular/core';
import { NodesService } from '../../services/nodes/nodes.service';
import { Node } from '../../models/grafo.models';
import * as d3 from 'd3';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { EditLabelComponent } from '../edit-label/edit-label.component';

@Component({
  selector: 'app-grafo',
  standalone: true,
  imports: [],
  templateUrl: './grafo.component.html',
  styleUrl: './grafo.component.scss',
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

  constructor(
    private el: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    this.nodeService.nodesChanged$.subscribe((nodes) => {
      this.nodes = nodes.map((node) => ({
        id: node.id,
        name: node.name,
        description: node.description, // Asegurarse de incluir la descripción
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
      .call(
        d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
          svg.attr('transform', event.transform);
        })
      )
      .append('g')
      .node() as SVGGElement;

    const svg = d3.select(svgElement);

    // Asegúrate de que svgElement sea un elemento SVG válido
    if (!(svgElement instanceof SVGGElement)) {
      throw new Error('svgElement is not an instance of SVGGElement');
    }

    const { width, height } = this.el.nativeElement.getBoundingClientRect();

    const simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink(this.links)
          .id((d: any) => d.id)
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
      .style('cursor', 'pointer') // Agregar estilo de cursor
      .on('contextmenu', (event, d) => {
        event.preventDefault();
        this.showContextMenu(event, d);
      })
      .on('dblclick', (event, d) => {
        console.log('Doble clic en nodo:', d); // Registro de depuración
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

  private showContextMenu(event: MouseEvent, node: Node): void {
    this.contextMenuContainer.clear();
    const factory =
      this.componentFactoryResolver.resolveComponentFactory(
        ContextMenuComponent
      );
    const componentRef = this.contextMenuContainer.createComponent(factory);
    componentRef.instance.node = node;
    componentRef.instance.position = { x: event.pageX, y: event.pageY };
    componentRef.instance.deleteNode.subscribe(() => {
      this.removeNode(node);
      this.contextMenuContainer.clear();
    });
    componentRef.instance.closeMenu.subscribe(() => {
      this.contextMenuContainer.clear();
    });
  }

  private showEditLabelInput(event: MouseEvent, node: Node): void {
    this.editLabelContainer.clear();
    const factory =
      this.componentFactoryResolver.resolveComponentFactory(EditLabelComponent);
    const componentRef = this.editLabelContainer.createComponent(factory);
    componentRef.instance.node = node;
    componentRef.instance.position = { x: event.pageX, y: event.pageY };
    componentRef.instance.updateNodeDetails.subscribe(
      ({ node, newName, newDescription }) => {
        this.updateNodeDetails(node, newName, newDescription);
        this.editLabelContainer.clear();
      }
    );
    componentRef.instance.closeEdit.subscribe(() => {
      this.editLabelContainer.clear();
    });
  }

  private getNodePosition(node: Node): { x: number; y: number } {
    const svgElement = this.el.nativeElement.querySelector('svg');
    const point = svgElement.createSVGPoint();
    point.x = node.x ?? 0;
    point.y = node.y ?? 0;
    const transformedPoint = point.matrixTransform(svgElement.getScreenCTM());
    return { x: transformedPoint.x, y: transformedPoint.y };
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

  private removeNode(node: Node): void {
    const nodes = this.nodeService.getNodes().filter((n) => n.id !== node.id);
    const links = this.nodeService
      .getLinks()
      .filter((link) => link.source !== node.id && link.target !== node.id);
    this.nodeService.updateNodes(nodes);
    this.nodeService.updateLinks(links);
    this.updateLinks();
    this.updateGraph();
  }
}
