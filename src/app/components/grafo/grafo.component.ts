import { Component, ElementRef, inject, OnInit } from '@angular/core';
import { NodesService } from '../../services/nodes/nodes.service';
import { Node } from '../../models/grafo.models';
import * as d3 from 'd3';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NodeDetailsComponent } from '../node-details/node-details.component';

@Component({
  selector: 'app-grafo',
  standalone: true,
  imports: [CommonModule, NodeDetailsComponent], // Importar CommonModule y NodeDetailsComponent
  templateUrl: './grafo.component.html',
  styleUrls: ['./grafo.component.scss'],
})
export class GrafoComponent implements OnInit {
  nodeService = inject(NodesService);

  // Usar Map para búsquedas rápidas de nodos por ID
  private nodes: (Node & {
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
  })[] = [];
  private nodesMap = new Map<string, Node>(); // Mapa de nodos para accesos eficientes
  private links: { source: Node; target: Node }[] = [];
  private simulation: d3.Simulation<Node, undefined> | undefined;

  constructor(private el: ElementRef, private router: Router) {}

  ngOnInit(): void {
    // Asegurarse de que el contenedor tenga un tamaño definido
    setTimeout(() => {
      const container = this.el.nativeElement.querySelector('.grafo-container');
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Combinar streams de nodos y enlaces para evitar actualizaciones múltiples
      combineLatest([
        this.nodeService.nodesChanged$,
        this.nodeService.linksChanged$,
      ]).subscribe(([nodes, links]) => {
        this.nodes = nodes.map((node) => ({
          id: node.id,
          name: node.name,
          description: node.description,
          x: node.x ?? width / 2, // Inicializar coordenadas x centradas
          y: node.y ?? height / 2, // Inicializar coordenadas y centradas
        }));

        // Actualizar el mapa de nodos para búsquedas rápidas
        this.nodesMap.clear();
        this.nodes.forEach((node) => this.nodesMap.set(node.id, node));

        // Actualizar enlaces con el nuevo mapa
        this.links = links.map((link) => ({
          source: this.nodesMap.get(link.source)!,
          target: this.nodesMap.get(link.target)!,
        }));

        this.updateGraph();
      });
    }, 0);
  }

  private updateGraph(): void {
    const svg = d3
      .select<SVGSVGElement, unknown>(this.el.nativeElement)
      .select<SVGSVGElement>('svg');

    if (svg.empty()) {
      // Si el SVG no existe, crear uno nuevo
      this.createGraph();
    } else {
      // Si el SVG ya existe, solo actualizar elementos
      this.updateGraphElements(svg);
    }
  }

  private createGraph(): void {
    const container = this.el.nativeElement.querySelector('.grafo-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svgElement = d3
      .select(this.el.nativeElement)
      .select('.grafo-container')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%') // Asegurarse de que el SVG ocupe todo el contenedor
      .attr('class', 'svg-container')
      .call(
        d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
          d3.select(svgElement).attr('transform', event.transform);
        })
      )
      .append('g')
      .node() as SVGSVGElement;

    const svg = d3.select<any, any>(svgElement);

    svg.append('g').attr('class', 'links');
    svg.append('g').attr('class', 'nodes');
    svg.append('g').attr('class', 'labels');

    this.updateGraphElements(svg as any);
  }

  private updateGraphElements(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ): void {
    // Asegurarse de que las coordenadas se inicialicen correctamente
    this.nodes.forEach((node) => {
      if (node.x === undefined || node.y === undefined) {
        node.x = Math.random() * 1000;
        node.y = Math.random() * 1000;
      }
    });

    // Actualizar enlaces
    svg
      .select('.links')
      .selectAll<SVGLineElement, { source: Node; target: Node }>('line')
      .data(this.links)
      .join('line') // Reutilizar elementos existentes o crearlos
      .attr('stroke-width', 2)
      .attr('stroke', '#999');

    // Actualizar nodos
    svg
      .select('.nodes')
      .selectAll<SVGCircleElement, Node>('circle')
      .data(this.nodes)
      .join('circle') // Reutilizar elementos existentes o crearlos
      .attr('r', 10)
      .attr('fill', '#69b3a2')
      .style('cursor', 'pointer')
      .on('click', (event, d) => this.goToNodeDetails(d.id))
      .call(
        d3
          .drag<SVGCircleElement, Node>()
          .on('start', (event, d) => {
            if (!event.active) this.simulation?.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) this.simulation?.alphaTarget(0);
            this.checkForNewLink(d);
            d.fx = null;
            d.fy = null;
          })
      );

    // Actualizar etiquetas
    svg
      .select('.labels')
      .selectAll<SVGTextElement, Node>('text')
      .data(this.nodes)
      .join('text') // Reutilizar elementos existentes o crearlos
      .attr('dy', -3)
      .attr('dx', 12)
      .text((d) => d.name)
      .attr('fill', () => {
        const isDarkTheme = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        return isDarkTheme ? '#ffffff' : '#000000';
      });

    // Actualizar simulación
    this.updateSimulation(svg as any);
  }

  private updateSimulation(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ): void {
    const container = this.el.nativeElement.querySelector('.grafo-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    console.log('width', width);
    console.log('height', height);

    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink<Node, { source: Node; target: Node }>(this.links)
          .id((d: Node) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-150)) // Reducir la carga para mejorar rendimiento
      .force('center', d3.forceCenter(width / 2, height / 2)) // Centrar nodos en la pantalla
      .alphaDecay(0.03); // Enfriamiento más lento para estabilidad

    this.simulation.on('tick', () => {
      svg
        .select('.links')
        .selectAll<SVGLineElement, { source: Node; target: Node }>('line')
        .attr('x1', (d) => d.source.x ?? 0)
        .attr('y1', (d) => d.source.y ?? 0)
        .attr('x2', (d) => d.target.x ?? 0)
        .attr('y2', (d) => d.target.y ?? 0);

      svg
        .select('.nodes')
        .selectAll<SVGCircleElement, Node>('circle')
        .attr('cx', (d) => d.x ?? 0)
        .attr('cy', (d) => d.y ?? 0);

      svg
        .select('.labels')
        .selectAll<SVGTextElement, Node>('text')
        .attr('x', (d) => d.x ?? 0)
        .attr('y', (d) => d.y ?? 0);
    });
  }

  private goToNodeDetails(nodeId: string): void {
    this.nodeService.selectedNode = this.nodesMap.get(nodeId) || null;
  }

  private checkForNewLink(draggedNode: Node): void {
    const detectionRadius = 50; // Aumentar la distancia de detección
    this.nodes.forEach((node) => {
      if (node === draggedNode) return; // No crear enlaces con uno mismo
      const dx = (node.x ?? 0) - (draggedNode.x ?? 0);
      const dy = (node.y ?? 0) - (draggedNode.y ?? 0);
      if (Math.sqrt(dx * dx + dy * dy) < detectionRadius) {
        // Verificar si el enlace ya existe
        const linkExists = this.links.some(
          (link) =>
            (link.source.id === draggedNode.id && link.target.id === node.id) ||
            (link.source.id === node.id && link.target.id === draggedNode.id)
        );
        if (!linkExists) {
          this.nodeService.addLink({ source: draggedNode.id, target: node.id });
        }
      }
    });
  }
}
