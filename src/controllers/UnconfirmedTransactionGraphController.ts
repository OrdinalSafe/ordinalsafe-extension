import {
  UnconfirmedTransactionGraph,
  UnconfirmedTransactionGraphNode,
} from '../shared/types';

export const addTransactionToGraph = (
  graph: UnconfirmedTransactionGraph,
  txId: string,
  txSize: number,
  ancestors: Array<string>
): UnconfirmedTransactionGraph => {
  // first check for given ancestors that are in the graph
  const newAncestors = ancestors.filter((ancestor) => {
    return graph[ancestor] !== undefined;
  });

  // if there are no ancestors in the graph, just add the txId to the graph
  if (newAncestors.length === 0) {
    graph[txId] = {
      ancestors: [],
      descendants: [],
      size: txSize,
    } as UnconfirmedTransactionGraphNode;
  } else {
    // otherwise, add the txId to the descendants of each ancestor
    newAncestors.forEach((ancestor) => {
      graph[ancestor].descendants.push(txId);
    });

    // and add the ancestors to the ancestors of the txId
    graph[txId] = {
      ancestors: newAncestors,
      descendants: [],
      size: txSize,
    } as UnconfirmedTransactionGraphNode;
  }

  return graph;
};

export const removeTransactionFromGraph = (
  graph: UnconfirmedTransactionGraph,
  txId: string
): UnconfirmedTransactionGraph => {
  // first check for given ancestors that are in the graph
  const ancestors = graph[txId].ancestors;
  const descendants = graph[txId].descendants;
  // if there are no ancestors in the graph, just remove the txId from the graph
  if (ancestors.length > 0) {
    // otherwise, remove the txId from the descendants of each ancestor
    ancestors.forEach((ancestor) => {
      graph[ancestor].descendants = graph[ancestor].descendants.filter(
        (descendant) => {
          return descendant !== txId;
        }
      );
    });
  }

  if (descendants.length > 0) {
    // otherwise, remove the txId from the ancestors of each descendant
    descendants.forEach((descendant) => {
      graph[descendant].ancestors = graph[descendant].ancestors.filter(
        (ancestor) => {
          return ancestor !== txId;
        }
      );
    });
  }

  delete graph[txId];

  return graph;
};

export const exploreFromNode = (
  graph: UnconfirmedTransactionGraph,
  txId: string
): { chainLength: number; totalSize: number } => {
  // traverse the graph using BFS and count the reachable nodes (both descendants and ancestors)
  const visited = new Set<string>();
  const stack = [txId];
  let sumSize = 0;
  while (stack.length > 0) {
    const current = stack.pop() as string;
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);
    sumSize += graph[current].size;
    const descendants = graph[current].descendants;
    const ancestors = graph[current].ancestors;
    descendants.forEach((descendant) => {
      stack.push(descendant);
    });
    ancestors.forEach((ancestor) => {
      stack.push(ancestor);
    });
  }

  return {
    chainLength: visited.size,
    totalSize: sumSize,
  };
};

export const checkIfNewTxAcceptable = (
  graph: UnconfirmedTransactionGraph,
  txId: string,
  txSize: number,
  ancestors: Array<string>,
  maxChainLength: number,
  maxTotalSize: number
): boolean => {
  // first copy tree
  const newGraph = { ...graph };

  // then add new tx to tree
  addTransactionToGraph(newGraph, txId, txSize, ancestors);

  // then check if new tx is acceptable
  const { chainLength, totalSize } = exploreFromNode(newGraph, txId);
  return chainLength <= maxChainLength && totalSize <= maxTotalSize;
};
