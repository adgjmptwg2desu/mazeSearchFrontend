import { useCallback, useState } from 'react';
import type { Maze } from '../types/maze';
import { generateRandomMaze } from '../utils/generateRandomMaze';

/**
 * 迷路データの生成と更新だけを扱うカスタムフック。
 */
export function useMazeGenerator() {
  /** 初回表示用の迷路を一度だけ生成して状態に保持する */
  const [maze, setMaze] = useState<Maze>(() => generateRandomMaze(15, 15));

  /** 新しい迷路を生成して状態を更新し、生成結果も呼び出し元へ返す */
  const generateNewMaze = useCallback(() => {
    const nextMaze = generateRandomMaze(15, 15);
    setMaze(nextMaze);
    return nextMaze;
  }, []);

  /** 外部から使う迷路状態と生成アクションを返す */
  return {
    maze,
    generateNewMaze,
  };
}
