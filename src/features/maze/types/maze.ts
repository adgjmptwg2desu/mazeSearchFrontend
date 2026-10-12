/** 迷路のマス目の種類 */
export type CellType = 'wall' | 'path' | 'start' | 'goal';

/** 迷路上の座標 */
export interface Position {
  /** x座標 */
  x: number;
  /** y座標 */
  y: number;
}

/** 迷路データ */
export interface Maze {
  /** 迷路のマス目 */
  cells: CellType[][];
  /** 開始位置 */
  startPosition: Position;
  /** 終了位置 */
  goalPosition: Position;
}
