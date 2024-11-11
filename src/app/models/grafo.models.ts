export interface Node {
  id: string;
  name: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  source: string;
  target: string;
}
