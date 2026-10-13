import type { Maze } from '../features/maze/types/maze';
import type { SearchTreeState } from '../features/searchTree/types';

export interface MazeSearchResponse {
  found: boolean;
  state: SearchTreeState;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function searchMaze(
  maze: Maze,
  signal?: AbortSignal,
): Promise<MazeSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(maze),
    signal,
  });

  const body: unknown = await response.json();

  if (!response.ok) {
    const detail =
      typeof body === 'object' && body !== null && 'detail' in body
        ? body.detail
        : undefined;
    const message = typeof detail === 'string' ? detail : '迷路探索に失敗しました';
    throw new Error(message);
  }

  return body as MazeSearchResponse;
}
