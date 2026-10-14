import { useEffect, useRef, useState } from 'react';
import type { Maze } from '../features/maze/types/maze';
import type { SearchTreeViewState } from '../features/searchTree/types';
import { searchMaze, type SearchAlgorithm } from '../services/mazeSearchApi';

const STEP_DELAY_MS = 35;
const EMPTY_SEARCH_TREE: SearchTreeViewState = {
  nodes: [],
  activeNodeIds: [],
  pathNodeIds: [],
  expandedNodeIds: [],
  currentNodeId: null,
  currentAction: null,
};

type SearchStatus = 'idle' | 'searching' | 'animating' | 'completed' | 'error';

export function useMazeSearch() {
  const [searchTreeState, setSearchTreeState] =
    useState<SearchTreeViewState>(EMPTY_SEARCH_TREE);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [found, setFound] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [totalExpandedNodes, setTotalExpandedNodes] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const resetSearch = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setSearchTreeState(EMPTY_SEARCH_TREE);
    setStatus('idle');
    setFound(null);
    setError('');
    setTotalExpandedNodes(0);
  };

  const runSearch = async (maze: Maze, algorithm: SearchAlgorithm) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setSearchTreeState(EMPTY_SEARCH_TREE);
    setStatus('searching');
    setFound(null);
    setError('');
    setTotalExpandedNodes(0);

    try {
      const result = await searchMaze(maze, algorithm, controller.signal);
      if (controller.signal.aborted) return;

      setTotalExpandedNodes(result.expandedNodeCount);
      setFound(result.found);
      setStatus('animating');

      const activeNodeIds: string[] = [];
      const expandedNodeIds: string[] = [];

      for (let stepIndex = 0; stepIndex < result.steps.length; stepIndex += 1) {
        await new Promise((resolve) => setTimeout(resolve, STEP_DELAY_MS));
        if (controller.signal.aborted) return;

        const step = result.steps[stepIndex];
        if (step.action === 'expand' || step.action === 'goal') {
          if (!activeNodeIds.includes(step.nodeId)) activeNodeIds.push(step.nodeId);
        }
        if (step.action === 'expand') {
          if (!expandedNodeIds.includes(step.nodeId)) expandedNodeIds.push(step.nodeId);
        }

        const visibleNodeIds = new Set(activeNodeIds);
        const isComplete = stepIndex === result.steps.length - 1;

        setSearchTreeState({
          nodes: result.state.nodes
            .filter((node) => visibleNodeIds.has(node.id))
            .map((node) => ({ ...node, onPath: isComplete && node.onPath })),
          activeNodeIds: [...activeNodeIds],
          pathNodeIds: isComplete ? result.state.pathNodeIds : [],
          expandedNodeIds: [...expandedNodeIds],
          currentNodeId: step.nodeId,
          currentAction: step.action,
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
    totalExpandedNodes,
    runSearch,
    resetSearch,
  };
}