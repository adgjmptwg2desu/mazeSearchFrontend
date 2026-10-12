import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateRandomMaze } from '../../../../src/features/maze/utils/generateRandomMaze';

describe('generateRandomMaze', () => {
  it('creates an odd-sized maze with a start and a goal', () => {
    const maze = generateRandomMaze(15, 15);

    assert.equal(maze.cells.length, 15);
    assert.equal(maze.cells[0].length, 15);
    assert.equal(maze.cells[maze.startPosition.y][maze.startPosition.x], 'start');
    assert.equal(maze.cells[maze.goalPosition.y][maze.goalPosition.x], 'goal');
  });
});
