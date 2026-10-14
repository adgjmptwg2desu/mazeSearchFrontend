import { useEffect, useRef } from 'react';
import type { SearchTreeViewState } from '../types';

interface SearchTreeVisualizerProps {
  state: SearchTreeViewState;
  width?: number;
  height?: number;
}

export function SearchTreeVisualizer({
  state,
  width = 680,
  height = 480,
}: SearchTreeVisualizerProps) {
  const maxDepth = Math.max(...state.nodes.map((node) => node.depth), 0);
  const levels = new Map<number, typeof state.nodes>();

  state.nodes.forEach((node) => {
    const levelNodes = levels.get(node.depth) ?? [];
    levelNodes.push(node);
    levels.set(node.depth, levelNodes);
  });

  const layout = new Map<string, { x: number; y: number }>();
  const nodeById = new Map(state.nodes.map((node) => [node.id, node]));
  const currentPathIds = new Set<string>();
  let currentPathNode = state.currentNodeId
    ? nodeById.get(state.currentNodeId)
    : undefined;

  while (currentPathNode) {
    currentPathIds.add(currentPathNode.id);
    currentPathNode = currentPathNode.parentId
      ? nodeById.get(currentPathNode.parentId)
      : undefined;
  }

  const currentNodeRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    currentNodeRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [state.currentNodeId]);

  const maxLevelSize = Math.max(
    ...Array.from(levels.values(), (nodes) => nodes.length),
    0,
  );

  levels.forEach((nodes, depth) => {
    const ordered = [...nodes].sort(
      (a, b) => a.position.y - b.position.y || a.position.x - b.position.x,
    );

    ordered.forEach((node, index) => {
      const x = 90 + depth * 160;
      const y = 60 + index * 76;
      layout.set(node.id, { x, y });
    });
  });

  const scaledWidth = Math.max(width, (maxDepth + 1) * 180 + 100);
  const scaledHeight = Math.max(height, 120 + maxLevelSize * 76);

  return (
    <svg
      viewBox={`0 0 ${scaledWidth} ${scaledHeight}`}
      width={scaledWidth}
      height={scaledHeight}
      role="img"
      aria-label="Search tree visualization"
      style={{ borderRadius: 8, background: '#f8fafc' }}
    >
      {state.nodes.map((node) => {
        if (node.parentId === null) return null;

        const parentPoint = layout.get(node.parentId);
        const nodePoint = layout.get(node.id);

        if (!parentPoint || !nodePoint) return null;
        const isOnCurrentPath =
          currentPathIds.has(node.id) && currentPathIds.has(node.parentId);

        return (
          <line
            key={`${node.parentId}-${node.id}`}
            x1={parentPoint.x + 24}
            y1={parentPoint.y}
            x2={nodePoint.x - 24}
            y2={nodePoint.y}
            stroke={isOnCurrentPath ? '#c34f32' : '#64748b'}
            strokeWidth={2.5}
            strokeDasharray={node.onPath || isOnCurrentPath ? '0' : '4 3'}
          />
        );
      })}

      {state.nodes.map((node) => {
        const point = layout.get(node.id);
        if (!point) return null;

        const isCurrent = state.currentNodeId === node.id;
        const isExpanded = state.expandedNodeIds.includes(node.id);
        const fill = isCurrent
          ? state.currentAction === 'backtrack'
            ? '#245b52'
            : '#c34f32'
          : node.onPath
            ? '#60a5fa'
            : isExpanded
              ? '#fbbf24'
              : '#e2e8f0';
        const stroke = isCurrent
          ? '#111827'
          : node.id === state.pathNodeIds[0]
            ? '#16a34a'
            : '#1f2937';

        return (
          <g key={node.id} ref={isCurrent ? currentNodeRef : null}>
            <circle
              cx={point.x}
              cy={point.y}
              r={22}
              fill={fill}
              stroke={stroke}
              strokeWidth={isCurrent || node.onPath ? 3 : 1.5}
            />
            <text
              x={point.x}
              y={point.y + 5}
              fontSize={13}
              fontWeight={700}
              textAnchor="middle"
              fill={isCurrent ? '#ffffff' : '#111827'}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
