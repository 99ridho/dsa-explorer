// SPEC.md §7 `structure`: the ordered symbol table a BST implements and the algs4 BST node,
// from Week 9 §3.2 to §3.4.
import type { StructureSpec } from '@/types/step-engine'
import type { BSTSnapshot } from './types'

function height(snapshot: BSTSnapshot, id: string | null): number {
  if (id === null) return -1
  const node = snapshot.nodes[id]
  if (!node) return -1
  return 1 + Math.max(height(snapshot, node.left), height(snapshot, node.right))
}

export const bstStructure: StructureSpec<BSTSnapshot> = {
  adt: {
    name: 'Binary search tree',
    summary: 'An ordered symbol table: keys with values, kept in a shape that lets every search halve the work on average.',
    operations: [
      {
        name: 'put',
        signature: 'put(key, val)',
        cost: 'O(h), h the height; about 1.39 lg N compares on average for random keys',
        note: 'Searches for the key and replaces the null link where the search ends with a new node.',
        operationIds: ['insert'],
      },
      {
        name: 'get',
        signature: 'get(key)',
        cost: 'O(h), h the height; about 1.39 lg N compares on average for random keys',
        note: 'Goes left when the key is smaller than the node, right when larger, and stops at a match or a null link.',
        operationIds: ['search'],
      },
      {
        name: 'delete',
        signature: 'delete(key)',
        cost: 'O(h), h the height',
        note: 'Hibbard deletion replaces a node that has two children with its successor, the minimum of its right subtree.',
        operationIds: ['delete'],
      },
      {
        name: 'keys',
        signature: 'keys()',
        cost: 'O(N)',
        note: 'Inorder traversal returns the keys in ascending order.',
        operationIds: ['inorder'],
      },
      { name: 'min', signature: 'min()', cost: 'O(h), h the height', note: 'Follows left links from the root.' },
      { name: 'max', signature: 'max()', cost: 'O(h), h the height', note: 'Follows right links from the root.' },
      { name: 'size', signature: 'size()', cost: 'O(1)' },
    ],
    invariants: [
      'The key at any node is larger than every key in its left subtree and smaller than every key in its right subtree.',
      'Keys are unique, so put on a present key changes nothing in this visualizer.',
      'The height depends on the order the keys arrive in: random order gives about 2 ln N on average, sorted order gives N.',
    ],
  },
  representations: {
    default: {
      label: 'Linked nodes',
      declaration: [
        'class BST',
        '  root: Node   null when the tree is empty',
        'class Node',
        '  key: Key',
        '  val: Value',
        '  left: Node   subtree of smaller keys',
        '  right: Node  subtree of larger keys',
        '  N: int       nodes in this subtree',
      ],
      fields: [
        { name: 'root', type: 'Node', role: 'the top node, null when the tree is empty' },
        { name: 'Node.key', type: 'Key', role: 'the key that orders the node' },
        { name: 'Node.val', type: 'Value', role: 'the value stored with the key; the canvas does not draw it' },
        { name: 'Node.left', type: 'Node', role: 'subtree of smaller keys, null when none' },
        { name: 'Node.right', type: 'Node', role: 'subtree of larger keys, null when none' },
        { name: 'Node.N', type: 'int', role: 'nodes in this subtree, so size runs in constant time; the canvas does not draw it' },
      ],
      invariants: ['Every node is reachable from root by exactly one path of left and right links.'],
    },
  },
  liveFields: (snapshot) => {
    const h = height(snapshot, snapshot.rootId)
    return {
      root: snapshot.rootId ?? 'null',
      n: Object.keys(snapshot.nodes).length,
      height: h < 0 ? 'none' : h,
    }
  },
}
