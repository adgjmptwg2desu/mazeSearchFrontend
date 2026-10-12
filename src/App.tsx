import { useState } from 'react';
import './App.css';
import {
  buildInitialSearchTreeState,
  SearchTreeVisualizer,
} from './features/searchTree';
import { useMazeGenerator } from './features/maze/hooks/useMazeGenerator';
import { MazeScreen } from './features/maze/screens/MazeScreen';

function App() {
  /** 迷路機能から現在の迷路と新規生成処理を取得する */
  const { maze, generateNewMaze } = useMazeGenerator();

  /** 現在の迷路に対応する探索木表示状態を保持する */
  const [searchTreeState, setSearchTreeState] = useState(() =>
    buildInitialSearchTreeState(maze),
  );

  /** 迷路を更新し、対応する探索木表示状態も同期する */
  const handleGenerateNewMaze = () => {
    const nextMaze = generateNewMaze();
    setSearchTreeState(buildInitialSearchTreeState(nextMaze));
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Maze visualization</p>
          <h1>Random Maze + Search Tree</h1>
        </div>
        <button type="button" onClick={handleGenerateNewMaze}>Randomize</button>
      </header>

      <section className="content-panel">
        <MazeScreen maze={maze} searchTreeState={searchTreeState} />

        <div className="tree-panel">
          <h2>Current Search Tree</h2>
          <div className="tree-box">
            <SearchTreeVisualizer state={searchTreeState} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
