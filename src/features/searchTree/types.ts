import type { Position } from '../maze/types/maze';

export interface SearchTreeNode {
  id: string;
  label: string;
  position: Position;
  parentId: string | null;
  depth: number;
  visited: boolean;
  onPath: boolean;
}

export interface SearchTreeState {
  nodes: SearchTreeNode[];
  activeNodeIds: string[];
  pathNodeIds: string[];
}

export interface BuildSearchTreeStateInput {
  startPosition: Position;
  goalPosition: Position;
  visitedPositions: Position[];
  parentMap: Map<string, string | null>;
  pathPositions: Position[];
}
