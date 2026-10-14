import './App.css';
import { SearchTreeVisualizer } from './features/searchTree';
import { useMazeGenerator } from './features/maze/hooks/useMazeGenerator';
import { MazeScreen } from './features/maze/screens/MazeScreen';
import { useMazeSearch } from './hooks/useMazeSearch';

function App() {
  const { maze, generateNewMaze } = useMazeGenerator();
  const {
    searchTreeState,
    status,
    found,
    error,
    totalNodes,
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
          <button
            className="search-button"
            type="button"
            onClick={() => void runSearch(maze)}
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
              `Explored ${searchTreeState.activeNodeIds.length} / ${totalNodes}`}
            {status === 'completed' && (found ? 'Path found' : 'No path found')}
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
