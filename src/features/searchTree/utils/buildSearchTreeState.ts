import type { Maze, Position } from '../../maze/types/maze';
import type {
  BuildSearchTreeStateInput,
  SearchTreeNode,
  SearchTreeState,
} from '../types';

function toKey(position: Position): string {
  return `${position.x},${position.y}`;
}

export function buildSearchTreeState({
  startPosition,
  goalPosition,
  visitedPositions,
  parentMap,
  pathPositions,
}: BuildSearchTreeStateInput): SearchTreeState {
  const visitedSet = new Set(visitedPositions.map(toKey));
  const pathSet = new Set(pathPositions.map(toKey));
  const nodeMap = new Map<string, SearchTreeNode>();

  const allPositions = new Map<string, Position>();
  visitedPositions.forEach((position) => {
    allPositions.set(toKey(position), position);
  });
  pathPositions.forEach((position) => {
    allPositions.set(toKey(position), position);
  });

  for (const position of allPositions.values()) {
    const key = toKey(position);
    const parentId = parentMap.get(key) ?? null;
    const node: SearchTreeNode = {
      id: key,
      label:
        position.x === startPosition.x && position.y === startPosition.y
          ? 'S'
          : position.x === goalPosition.x && position.y === goalPosition.y
            ? 'G'
            : `${position.x},${position.y}`,
      position,
      parentId,
      depth: 0,
      visited: visitedSet.has(key),
      onPath: pathSet.has(key),
    };
    nodeMap.set(key, node);
  }

  const computeDepth = (key: string): number => {
    const node = nodeMap.get(key);
    if (!node) return 0;
    if (node.parentId === null) return 0;
    const parentNode = nodeMap.get(node.parentId);
    if (!parentNode) return 0;
    return computeDepth(parentNode.id) + 1;
  };

  for (const [key, node] of nodeMap.entries()) {
    node.depth = computeDepth(key);
  }

  const nodes = [...nodeMap.values()].sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.position.y - b.position.y || a.position.x - b.position.x;
  });

  return {
    nodes,
    activeNodeIds: visitedPositions.map(toKey),
    pathNodeIds: pathPositions.map(toKey),
  };
}

export function buildInitialSearchTreeState(maze: Maze): SearchTreeState {
  /** 現時点の仮データとして、スタート位置だけを訪問済みにする */
  const visitedPositions = [maze.startPosition];

  /** 現時点の仮データとして、スタートからゴールへの経路を用意する */
  const pathPositions = [maze.startPosition, maze.goalPosition];

  /** 仮の親子関係として、ゴールの親をスタートに設定する */
  const parentMap = new Map<string, string | null>([
    [`${maze.startPosition.x},${maze.startPosition.y}`, null],
    [
      `${maze.goalPosition.x},${maze.goalPosition.y}`,
      `${maze.startPosition.x},${maze.startPosition.y}`,
    ],
  ]);

  return buildSearchTreeState({
    startPosition: maze.startPosition,
    goalPosition: maze.goalPosition,
    visitedPositions,
    parentMap,
    pathPositions,
  });
}
