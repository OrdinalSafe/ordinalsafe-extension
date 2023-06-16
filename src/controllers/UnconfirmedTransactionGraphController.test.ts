import {
  UnconfirmedTransactionGraph,
  UnconfirmedTransactionGraphNode,
} from '../shared/types';

import {
  addTransactionToGraph,
  removeTransactionFromGraph,
  exploreFromNode,
  checkIfNewTxAcceptable,
} from './UnconfirmedTransactionGraphController';

const createComplexTransactionGraph = (graph: UnconfirmedTransactionGraph) => {
  addTransactionToGraph(graph, 'tx1', 111, []);
  addTransactionToGraph(graph, 'tx2', 111, []);
  addTransactionToGraph(graph, 'tx3', 111, []);
  addTransactionToGraph(graph, 'tx4', 111, []);

  addTransactionToGraph(graph, 'tx5', 111, ['tx1', 'tx2']);
  addTransactionToGraph(graph, 'tx6', 111, ['tx2', 'tx3']);
  addTransactionToGraph(graph, 'tx7', 111, ['tx3', 'tx4']);

  addTransactionToGraph(graph, 'tx8', 111, ['tx5', 'tx6']);
  addTransactionToGraph(graph, 'tx9', 111, ['tx6', 'tx7']);

  addTransactionToGraph(graph, 'tx10', 111, ['tx8', 'tx9']);

  addTransactionToGraph(graph, 'tx11', 111, ['tx5', 'tx10']);
  addTransactionToGraph(graph, 'tx12', 111, ['tx11']);
  addTransactionToGraph(graph, 'tx13', 111, ['tx11', 'tx10']);

  addTransactionToGraph(graph, 'tx14', 111, []);
  addTransactionToGraph(graph, 'tx15', 111, ['tx14']);
  addTransactionToGraph(graph, 'tx16', 111, ['tx14']);
  addTransactionToGraph(graph, 'tx17', 111, ['tx15', 'tx16']);
};

describe('UnconfirmedTransactionTreeController', () => {
  test('can add no dependency graph', () => {
    const graph: UnconfirmedTransactionGraph = {};
    addTransactionToGraph(graph, 'tx1', 111, []);
    expect(graph).toEqual({
      tx1: {
        ancestors: [],
        descendants: [],
        size: 111,
      } as UnconfirmedTransactionGraphNode,
    });
  });

  test('can add graph with dependencies', () => {
    const graph: UnconfirmedTransactionGraph = {};
    addTransactionToGraph(graph, 'tx1', 111, []);
    addTransactionToGraph(graph, 'tx2', 111, ['tx1']);
    expect(graph).toEqual({
      tx1: {
        ancestors: [],
        descendants: ['tx2'],
        size: 111,
      } as UnconfirmedTransactionGraphNode,
      tx2: {
        ancestors: ['tx1'],
        descendants: [],
        size: 111,
      } as UnconfirmedTransactionGraphNode,
    });
    expect(graph['tx1'].descendants).toEqual(['tx2']);
  });

  test('can remove from graph', () => {
    const graph: UnconfirmedTransactionGraph = {};
    addTransactionToGraph(graph, 'tx1', 111, []);
    addTransactionToGraph(graph, 'tx2', 111, ['tx1']);

    removeTransactionFromGraph(graph, 'tx1');

    expect(graph).toEqual({
      tx2: {
        ancestors: [],
        descendants: [],
        size: 111,
      } as UnconfirmedTransactionGraphNode,
    });
  });

  test('can explore from graph', () => {
    const graph: UnconfirmedTransactionGraph = {};
    createComplexTransactionGraph(graph);
    expect(exploreFromNode(graph, 'tx17')).toEqual({
      chainLength: 4,
      totalSize: 444,
    });

    expect(exploreFromNode(graph, 'tx6')).toEqual({
      chainLength: 13,
      totalSize: 1443,
    });

    addTransactionToGraph(graph, 'tx18', 111, ['tx10', 'tx14']);

    expect(exploreFromNode(graph, 'tx18')).toEqual({
      chainLength: 18,
      totalSize: 1998,
    });
  });

  test('can determine if a new tx is acceptable', () => {
    const graph: UnconfirmedTransactionGraph = {};
    createComplexTransactionGraph(graph);
    expect(
      checkIfNewTxAcceptable(graph, 'tx18', 111, ['tx10', 'tx14'], 17, 1998)
    ).toEqual(false);

    expect(
      checkIfNewTxAcceptable(graph, 'tx18', 111, ['tx10', 'tx14'], 18, 1900)
    ).toEqual(false);

    expect(
      checkIfNewTxAcceptable(graph, 'tx18', 111, ['tx10', 'tx14'], 19, 2000)
    ).toEqual(true);
  });
});
