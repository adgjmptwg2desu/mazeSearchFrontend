import { useEffect, useRef, useState } from 'react';
import type { Maze } from '../features/maze/types/maze';
import type { SearchTreeState } from '../features/searchTree/types';
import { searchMaze } from '../services/mazeSearchApi';

const STEP_DELAY_MS = 35;
const EMPTY_SEARCH_TREE: SearchTreeState = {
  nodes: [],
  activeNodeIds: [],
  pathNodeIds: [],
};

type SearchStatus = 'idle' | 'searching' | 'animating' | 'completed' | 'error';

export function useMazeSearch() {
  const [searchTreeState, setSearchTreeState] =
    useState<SearchTreeState>(EMPTY_SEARCH_TREE);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [found, setFound] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [totalNodes, setTotalNodes] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const resetSearch = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setSearchTreeState(EMPTY_SEARCH_TREE);
    setStatus('idle');
    setFound(null);
    setError('');
    setTotalNodes(0);
  };

  const runSearch = async (maze: Maze) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setSearchTreeState(EMPTY_SEARCH_TREE);
    setStatus('searching');
    setFound(null);
    setError('');
    setTotalNodes(0);

    try {
      const result = await searchMaze(maze, controller.signal);
      if (controller.signal.aborted) return;

      setTotalNodes(result.state.nodes.length);
      setFound(result.found);
      setStatus('animating');

      for (
        let visibleCount = 1;
        visibleCount <= result.state.activeNodeIds.length;
        visibleCount += 1
      ) {
        await new Promise((resolve) => setTimeout(resolve, STEP_DELAY_MS));
        if (controller.signal.aborted) return;

        const activeNodeIds = result.state.activeNodeIds.slice(0, visibleCount);
        const visibleNodeIds = new Set(activeNodeIds);
        const isComplete = visibleCount === result.state.activeNodeIds.length;

        setSearchTreeState({
          nodes: result.state.nodes
            .filter((node) => visibleNodeIds.has(node.id))
            .map((node) => ({ ...node, onPath: isComplete && node.onPath })),
          activeNodeIds,
          pathNodeIds: isComplete ? result.state.pathNodeIds : [],
        });
      }

      if (!controller.signal.aborted) setStatus('completed');
    } catch (searchError) {
      if (controller.signal.aborted) return;
      setError(
        searchError instanceof Error ? searchError.message : 'Search failed',
      );
      setStatus('error');
    }
  };

  useEffect(
    () => () => controllerRef.current?.abort(),
    [],
  );

  return {
    searchTreeState,
    status,
    found,
    error,
    totalNodes,
    runSearch,
    resetSearch,
  };
}