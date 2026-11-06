// SPEC.md §10: C++ / Java / Python for each operation, mapped to the pseudocode lines in ./pseudocode.ts.
// The logic follows algs4 BST (Sedgewick & Wayne), with descriptive names (ADR-014).
import { code } from '@/lib/snippets'
import type { OperationSnippets } from '@/types/step-engine'

const insert: OperationSnippets = {
  java: code([
    ['private Node insert(Node node, int key) {', 1],
    ['    if (node == null) return new Node(key);', 3],
    ['    if      (key < node.key) node.left  = insert(node.left, key);', 4],
    ['    else if (key > node.key) node.right = insert(node.right, key);', 6],
    ['    return node;', 8],
    '}',
  ]),
  cpp: code([
    ['Node* insert(Node* node, int key) {', 1],
    ['    if (node == nullptr) return new Node(key);', 3],
    ['    if      (key < node->key) node->left  = insert(node->left, key);', 4],
    ['    else if (key > node->key) node->right = insert(node->right, key);', 6],
    ['    return node;', 8],
    '}',
  ]),
  python: code([
    ['def insert(node, key):', 1],
    ['    if node is None:', 2],
    ['        return Node(key)', 3],
    ['    if key < node.key:', 4],
    ['        node.left = insert(node.left, key)', 5],
    ['    elif key > node.key:', 6],
    ['        node.right = insert(node.right, key)', 7],
    ['    return node', 8],
  ]),
}

const search: OperationSnippets = {
  java: code([
    ['private boolean search(Node node, int key) {', 1],
    ['    if (node == null) return false;', 2],
    ['    if (key == node.key) return true;', 3],
    ['    if (key < node.key) return search(node.left, key);', 4],
    ['    else             return search(node.right, key);', 5],
    '}',
  ]),
  cpp: code([
    ['bool search(Node* node, int key) {', 1],
    ['    if (node == nullptr) return false;', 2],
    ['    if (key == node->key) return true;', 3],
    ['    if (key < node->key) return search(node->left, key);', 4],
    ['    else              return search(node->right, key);', 5],
    '}',
  ]),
  python: code([
    ['def search(node, key):', 1],
    ['    if node is None:', 2],
    ['        return False', 2],
    ['    if key == node.key:', 3],
    ['        return True', 3],
    ['    if key < node.key:', 4],
    ['        return search(node.left, key)', 4],
    ['    return search(node.right, key)', 5],
  ]),
}

const del: OperationSnippets = {
  java: code([
    ['private Node delete(Node node, int key) {', 1],
    ['    if (node == null) return null;', 2],
    ['    if      (key < node.key) node.left  = delete(node.left, key);', 3],
    ['    else if (key > node.key) node.right = delete(node.right, key);', 4],
    ['    else {', 5],
    ['        if (node.right == null) return node.left;', 6],
    ['        if (node.left  == null) return node.right;', 7],
    ['        Node successor = min(node.right);', 8],
    ['        successor.right = deleteMin(node.right);', 9],
    ['        successor.left = node.left;', 10],
    ['        node = successor;', 11],
    '    }',
    ['    return node;', 12],
    '}',
  ]),
  cpp: code([
    ['Node* remove(Node* node, int key) {', 1],
    ['    if (node == nullptr) return nullptr;', 2],
    ['    if      (key < node->key) node->left  = remove(node->left, key);', 3],
    ['    else if (key > node->key) node->right = remove(node->right, key);', 4],
    ['    else {', 5],
    ['        if (node->right == nullptr) return node->left;', 6],
    ['        if (node->left  == nullptr) return node->right;', 7],
    ['        Node* successor = minNode(node->right);', 8],
    ['        successor->right = deleteMin(node->right);', 9],
    ['        successor->left = node->left;', 10],
    ['        node = successor;', 11],
    '    }',
    ['    return node;', 12],
    '}',
  ]),
  python: code([
    ['def delete(node, key):', 1],
    ['    if node is None:', 2],
    ['        return None', 2],
    ['    if key < node.key:', 3],
    ['        node.left = delete(node.left, key)', 3],
    ['    elif key > node.key:', 4],
    ['        node.right = delete(node.right, key)', 4],
    ['    else:', 5],
    ['        if node.right is None:', 6],
    ['            return node.left', 6],
    ['        if node.left is None:', 7],
    ['            return node.right', 7],
    ['        successor = min_node(node.right)', 8],
    ['        successor.right = delete_min(node.right)', 9],
    ['        successor.left = node.left', 10],
    ['        node = successor', 11],
    ['    return node', 12],
  ]),
}

const inorder: OperationSnippets = {
  java: code([
    ['private void inorder(Node node, Queue<Integer> keys) {', 1],
    ['    if (node == null) return;', 2],
    ['    inorder(node.left, keys);', 3],
    ['    keys.enqueue(node.key);', 4],
    ['    inorder(node.right, keys);', 5],
    '}',
  ]),
  cpp: code([
    ['void inorder(Node* node, std::vector<int>& keys) {', 1],
    ['    if (node == nullptr) return;', 2],
    ['    inorder(node->left, keys);', 3],
    ['    keys.push_back(node->key);', 4],
    ['    inorder(node->right, keys);', 5],
    '}',
  ]),
  python: code([
    ['def inorder(node, keys):', 1],
    ['    if node is None:', 2],
    ['        return', 2],
    ['    inorder(node.left, keys)', 3],
    ['    keys.append(node.key)', 4],
    ['    inorder(node.right, keys)', 5],
  ]),
}

export const bstSnippets: Record<string, OperationSnippets> = { insert, search, delete: del, inorder }
