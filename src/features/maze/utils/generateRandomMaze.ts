import type { CellType, Maze, Position } from '../types/maze';

/**
 * 迷路の通路がすべてつながるように、ランダムに壁を掘って道をつくる。
 * 今は探索方法の実装ではなく、UI で見える迷路データを生成する役目に限定する。
 */
export function generateRandomMaze(width = 17, height = 17): Maze {
  /** 迷路の横幅を奇数に揃えて、壁と通路の境界を安定させる */
  const columns = width % 2 === 0 ? width + 1 : width;

  /** 迷路の縦幅を奇数に揃えて、壁と通路の境界を安定させる */
  const rows = height % 2 === 0 ? height + 1 : height;

  /** すべてのセルを壁で初期化した 2 次元配列 */
  const cells: CellType[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => 'wall' as CellType),
  );

  /** スタート位置を左上寄りに固定 */
  const startPosition: Position = { x: 1, y: 1 };

  /** ゴール位置を右下寄りに固定 */
  const goalPosition: Position = { x: columns - 2, y: rows - 2 };

  /** 迷路を掘るときの4方向の移動ベクトル。壁を飛び越えて次の通路候補へ進む */
  const directions = [
    { x: 2, y: 0 },
    { x: -2, y: 0 },
    { x: 0, y: 2 },
    { x: 0, y: -2 },
  ] as const;

  /** 迷路生成の探索スタック。現在位置の履歴を保持する */
  const stack: Position[] = [startPosition];

  /** すでに訪問した座標を記録して、同じ場所を重複して掘らないようにする */
  const visited = new Set<string>([`${startPosition.x},${startPosition.y}`]);

  /** スタート位置を通路として開ける */
  cells[startPosition.y][startPosition.x] = 'path';

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    const candidates = directions
      .map((direction) => ({
        x: current.x + direction.x,
        y: current.y + direction.y,
      }))
      .filter((next) => {
        if (next.x <= 0 || next.y <= 0) return false;
        if (next.x >= columns - 1 || next.y >= rows - 1) return false;
        return !visited.has(`${next.x},${next.y}`);
      });

    if (candidates.length === 0) {
      stack.pop();
      continue;
    }

    const next = candidates[Math.floor(Math.random() * candidates.length)];
    const between: Position = {
      x: current.x + (next.x - current.x) / 2,
      y: current.y + (next.y - current.y) / 2,
    };

    cells[between.y][between.x] = 'path';
    cells[next.y][next.x] = 'path';
    visited.add(`${next.x},${next.y}`);
    stack.push(next);
  }

  cells[startPosition.y][startPosition.x] = 'start';
  cells[goalPosition.y][goalPosition.x] = 'goal';

  return {
    cells,
    startPosition,
    goalPosition,
  };
}
