import type { SearchTreeState } from '../types';

interface SearchTreeVisualizerProps {
  state: SearchTreeState;
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

        return (
          <line
            key={`${node.parentId}-${node.id}`}
            x1={parentPoint.x + 24}
            y1={parentPoint.y}
            x2={nodePoint.x - 24}
            y2={nodePoint.y}
            stroke="#64748b"
            strokeWidth={2.5}
            strokeDasharray={node.onPath ? '0' : '4 3'}
          />
        );
      })}

      {state.nodes.map((node) => {
        const point = layout.get(node.id);
        if (!point) return null;

        const fill = node.onPath ? '#60a5fa' : node.visited ? '#fbbf24' : '#e2e8f0';
        const stroke = node.id === state.pathNodeIds[0] ? '#16a34a' : '#1f2937';

        return (
          <g key={node.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r={22}
              fill={fill}
              stroke={stroke}
              strokeWidth={node.onPath ? 3 : 1.5}
            />
            <text
              x={point.x}
              y={point.y + 5}
              fontSize={13}
              fontWeight={700}
              textAnchor="middle"
              fill="#111827"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
