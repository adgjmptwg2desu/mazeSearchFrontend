import type { SearchTreeState } from '../../searchTree/types';
import type { Maze } from '../types/maze';
import './MazeScreen.css';

interface MazeScreenProps {
  maze: Maze;
  searchTreeState: SearchTreeState;
}

export function MazeScreen({ maze, searchTreeState }: MazeScreenProps) {
  return (
    <div className="maze-panel">
      <div
        className="maze-grid"
        style={{ gridTemplateColumns: `repeat(${maze.cells[0].length}, 18px)` }}
      >
        {maze.cells.map((row, y) =>
          row.map((cell, x) => {
            const key = `${x},${y}`;
            const isVisited = searchTreeState.activeNodeIds.includes(key);
            const isPath = searchTreeState.pathNodeIds.includes(key);

            let className = 'cell';
            if (cell === 'wall') className += ' wall';
            if (cell === 'start') className += ' start';
            if (cell === 'goal') className += ' goal';
            if (isVisited && cell !== 'wall') className += ' visited';
            if (isPath && cell !== 'wall') className += ' path';

            return <div key={key} className={className} aria-label={`cell ${key}`} />;
          }),
        )}
      </div>
    </div>
  );
}