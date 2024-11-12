export interface Node {
  id: string;
  name: string;
  description?: string; // Nuevo campo de descripción
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  source: string;
  target: string;
}
