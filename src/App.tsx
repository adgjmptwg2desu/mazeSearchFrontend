import { useState } from 'react';
import './App.css';
import { SearchTreeVisualizer } from './features/searchTree';
import { useMazeGenerator } from './features/maze/hooks/useMazeGenerator';
import { MazeScreen } from './features/maze/screens/MazeScreen';
import { useMazeSearch } from './hooks/useMazeSearch';
import type { SearchAlgorithm } from './services/mazeSearchApi';

function App() {
  const { maze, generateNewMaze } = useMazeGenerator();
  const [algorithm, setAlgorithm] = useState<SearchAlgorithm>('bfs');
  const {
    searchTreeState,
    status,
    found,
    error,
    totalExpandedNodes,
    runSearch,
    resetSearch,
  } = useMazeSearch();

  const handleGenerateNewMaze = () => {
    generateNewMaze();
    resetSearch();
  };

  const isRunning = status === 'searching' || status === 'animating';

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Maze visualization</p>
          <h1>Random Maze + Search Tree</h1>
        </div>
        <div className="topbar-actions">
          <fieldset className="algorithm-picker" disabled={isRunning}>
            <legend>Algorithm</legend>
            <label>
              <input
                type="radio"
                name="search-algorithm"
                value="bfs"
                checked={algorithm === 'bfs'}
                onChange={() => setAlgorithm('bfs')}
              />
              <span>BFS</span>
            </label>
            <label>
              <input
                type="radio"
                name="search-algorithm"
                value="dfs"
                checked={algorithm === 'dfs'}
                onChange={() => setAlgorithm('dfs')}
              />
              <span>DFS</span>
            </label>
          </fieldset>
          <button
            className="search-button"
            type="button"
            onClick={() => void runSearch(maze, algorithm)}
            disabled={isRunning}
          >
            {isRunning ? 'Searching...' : 'Start Search'}
          </button>
          <button type="button" onClick={handleGenerateNewMaze}>
            Randomize
          </button>
        </div>
      </header>

      <section className="content-panel">
        <MazeScreen maze={maze} searchTreeState={searchTreeState} />

        <div className="tree-panel">
          <div className="tree-heading">
            <h2>Current Search Tree</h2>
            <span>{searchTreeState.nodes.length} nodes</span>
          </div>
          <p className="search-status" aria-live="polite">
            {status === 'idle' && 'Ready to search'}
            {status === 'searching' && 'Requesting search result...'}
            {status === 'animating' &&
              `Expanded nodes: ${searchTreeState.expandedNodeIds.length} / ${totalExpandedNodes}${
                searchTreeState.currentAction === 'backtrack'
                  ? ` · Backtracking to ${searchTreeState.currentNodeId}`
                  : searchTreeState.currentNodeId
                    ? ` · Expanding ${searchTreeState.currentNodeId}`
                    : ''
              }`}
            {status === 'completed' &&
              `${found ? 'Path found' : 'No path found'} · Expanded nodes: ${totalExpandedNodes}`}
            {status === 'error' && error}
          </p>
          <div className="tree-box">
            <SearchTreeVisualizer state={searchTreeState} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
