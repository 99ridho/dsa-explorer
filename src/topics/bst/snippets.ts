// SPEC.md §10: C++ / Java / Python for each operation, mapped to the pseudocode lines in ./pseudocode.ts.
// Java follows the algs4 shape (Sedgewick & Wayne); C++ and Python are direct translations.
import { code } from '@/lib/snippets'
import type { OperationSnippets } from '@/types/step-engine'

const insert: OperationSnippets = {
  java: code([
    ['private Node insert(Node x, int key) {', 1],
    ['    if (x == null) return new Node(key);', 3],
    ['    if      (key < x.key) x.left  = insert(x.left, key);', 4],
    ['    else if (key > x.key) x.right = insert(x.right, key);', 6],
    ['    return x;', 8],
    '}',
  ]),
  cpp: code([
    ['Node* insert(Node* x, int key) {', 1],
    ['    if (x == nullptr) return new Node(key);', 3],
    ['    if      (key < x->key) x->left  = insert(x->left, key);', 4],
    ['    else if (key > x->key) x->right = insert(x->right, key);', 6],
    ['    return x;', 8],
    '}',
  ]),
  python: code([
    ['def insert(x, key):', 1],
    ['    if x is None:', 2],
    ['        return Node(key)', 3],
    ['    if key < x.key:', 4],
    ['        x.left = insert(x.left, key)', 5],
    ['    elif key > x.key:', 6],
    ['        x.right = insert(x.right, key)', 7],
    ['    return x', 8],
  ]),
}

const search: OperationSnippets = {
  java: code([
    ['private boolean search(Node x, int key) {', 1],
    ['    if (x == null) return false;', 2],
    ['    if (key == x.key) return true;', 3],
    ['    if (key < x.key) return search(x.left, key);', 4],
    ['    else             return search(x.right, key);', 5],
    '}',
  ]),
  cpp: code([
    ['bool search(Node* x, int key) {', 1],
    ['    if (x == nullptr) return false;', 2],
    ['    if (key == x->key) return true;', 3],
    ['    if (key < x->key) return search(x->left, key);', 4],
    ['    else              return search(x->right, key);', 5],
    '}',
  ]),
  python: code([
    ['def search(x, key):', 1],
    ['    if x is None:', 2],
    ['        return False', 2],
    ['    if key == x.key:', 3],
    ['        return True', 3],
    ['    if key < x.key:', 4],
    ['        return search(x.left, key)', 4],
    ['    return search(x.right, key)', 5],
  ]),
}

const del: OperationSnippets = {
  java: code([
    ['private Node delete(Node x, int key) {', 1],
    ['    if (x == null) return null;', 2],
    ['    if      (key < x.key) x.left  = delete(x.left, key);', 3],
    ['    else if (key > x.key) x.right = delete(x.right, key);', 4],
    ['    else {', 5],
    ['        if (x.right == null) return x.left;', 6],
    ['        if (x.left  == null) return x.right;', 7],
    ['        Node t = x;', 8],
    ['        x = min(t.right);', 8],
    ['        x.right = deleteMin(t.right);', 9],
    ['        x.left = t.left;', 10],
    ['    }', 11],
    ['    return x;', 12],
    '}',
  ]),
  cpp: code([
    ['Node* remove(Node* x, int key) {', 1],
    ['    if (x == nullptr) return nullptr;', 2],
    ['    if      (key < x->key) x->left  = remove(x->left, key);', 3],
    ['    else if (key > x->key) x->right = remove(x->right, key);', 4],
    ['    else {', 5],
    ['        if (x->right == nullptr) return x->left;', 6],
    ['        if (x->left  == nullptr) return x->right;', 7],
    ['        Node* t = x;', 8],
    ['        x = minNode(t->right);', 8],
    ['        x->right = deleteMin(t->right);', 9],
    ['        x->left = t->left;', 10],
    ['    }', 11],
    ['    return x;', 12],
    '}',
  ]),
  python: code([
    ['def delete(x, key):', 1],
    ['    if x is None:', 2],
    ['        return None', 2],
    ['    if key < x.key:', 3],
    ['        x.left = delete(x.left, key)', 3],
    ['    elif key > x.key:', 4],
    ['        x.right = delete(x.right, key)', 4],
    ['    else:', 5],
    ['        if x.right is None:', 6],
    ['            return x.left', 6],
    ['        if x.left is None:', 7],
    ['            return x.right', 7],
    ['        t = x', 8],
    ['        x = min_node(t.right)', 8],
    ['        x.right = delete_min(t.right)', 9],
    ['        x.left = t.left', 10],
    ['        # x now stands where t was', 11],
    ['    return x', 12],
  ]),
}

const inorder: OperationSnippets = {
  java: code([
    ['private void inorder(Node x, Queue<Integer> keys) {', 1],
    ['    if (x == null) return;', 2],
    ['    inorder(x.left, keys);', 3],
    ['    keys.enqueue(x.key);', 4],
    ['    inorder(x.right, keys);', 5],
    '}',
  ]),
  cpp: code([
    ['void inorder(Node* x, std::vector<int>& keys) {', 1],
    ['    if (x == nullptr) return;', 2],
    ['    inorder(x->left, keys);', 3],
    ['    keys.push_back(x->key);', 4],
    ['    inorder(x->right, keys);', 5],
    '}',
  ]),
  python: code([
    ['def inorder(x, keys):', 1],
    ['    if x is None:', 2],
    ['        return', 2],
    ['    inorder(x.left, keys)', 3],
    ['    keys.append(x.key)', 4],
    ['    inorder(x.right, keys)', 5],
  ]),
}

export const bstSnippets: Record<string, OperationSnippets> = { insert, search, delete: del, inorder }
