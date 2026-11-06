// SPEC.md §10.10: C++ / Java / Python for each operation, mapped to the pseudocode lines in ./pseudocode.ts.
// The logic follows the algs4 Node idiom (item + next), with descriptive names (ADR-014).
import { code } from '@/lib/snippets'
import type { OperationSnippets } from '@/types/step-engine'

const insertFirst: OperationSnippets = {
  java: code([
    ['void insertFirst(Item item) {', 1],
    ['    Node oldFirst = first;', 2],
    ['    first = new Node();', 3],
    ['    first.item = item;', 3],
    ['    first.next = oldFirst;', 4],
    ['    if (oldFirst == null) last = first;', 5],
    '}',
  ]),
  cpp: code([
    ['void insertFirst(int item) {', 1],
    ['    Node* oldFirst = first;', 2],
    ['    first = new Node{item, nullptr};', 3],
    ['    first->next = oldFirst;', 4],
    ['    if (oldFirst == nullptr) last = first;', 5],
    '}',
  ]),
  python: code([
    ['def insert_first(self, item):', 1],
    ['    old_first = self.first', 2],
    ['    self.first = Node(item, None)', 3],
    ['    self.first.next = old_first', 4],
    ['    if old_first is None:', 5],
    ['        self.last = self.first', 5],
  ]),
}

const insertLast: OperationSnippets = {
  java: code([
    ['void insertLast(Item item) {', 1],
    ['    Node oldLast = last;', 2],
    ['    last = new Node();', 3],
    ['    last.item = item;', 3],
    ['    if (oldLast == null) first = last;', 4],
    ['    else oldLast.next = last;', 5],
    '}',
  ]),
  cpp: code([
    ['void insertLast(int item) {', 1],
    ['    Node* oldLast = last;', 2],
    ['    last = new Node{item, nullptr};', 3],
    ['    if (oldLast == nullptr) first = last;', 4],
    ['    else oldLast->next = last;', 5],
    '}',
  ]),
  python: code([
    ['def insert_last(self, item):', 1],
    ['    old_last = self.last', 2],
    ['    self.last = Node(item, None)', 3],
    ['    if old_last is None:', 4],
    ['        self.first = self.last', 4],
    ['    else:', 5],
    ['        old_last.next = self.last', 5],
  ]),
}

const removeFirst: OperationSnippets = {
  java: code([
    ['Item removeFirst() {', 1],
    ['    if (first == null) return null;', 2],
    ['    Item item = first.item;', 3],
    ['    first = first.next;', 4],
    ['    if (first == null) last = null;', 5],
    ['    return item;', 6],
    '}',
  ]),
  cpp: code([
    ['int removeFirst() {', 1],
    ['    if (first == nullptr) throw std::out_of_range("empty");', 2],
    ['    int item = first->item;', 3],
    ['    Node* removed = first;', 3],
    ['    first = first->next;', 4],
    ['    delete removed;', 4],
    ['    if (first == nullptr) last = nullptr;', 5],
    ['    return item;', 6],
    '}',
  ]),
  python: code([
    ['def remove_first(self):', 1],
    ['    if self.first is None:', 2],
    ['        return None', 2],
    ['    item = self.first.item', 3],
    ['    self.first = self.first.next', 4],
    ['    if self.first is None:', 5],
    ['        self.last = None', 5],
    ['    return item', 6],
  ]),
}

const traverse: OperationSnippets = {
  java: code([
    ['void traverse() {', 1],
    ['    for (Node node = first; node != null; node = node.next)', 2],
    ['        visit(node.item);', 3],
    '}',
  ]),
  cpp: code([
    ['void traverse() {', 1],
    ['    for (Node* node = first; node != nullptr; node = node->next)', 2],
    ['        visit(node->item);', 3],
    '}',
  ]),
  python: code([
    ['def traverse(self):', 1],
    ['    node = self.first', 2],
    ['    while node is not None:', 2],
    ['        visit(node.item)', 3],
    ['        node = node.next', 2],
  ]),
}

export const linkedListSnippets: Record<string, OperationSnippets> = {
  'insert-first': insertFirst,
  'insert-last': insertLast,
  'remove-first': removeFirst,
  traverse,
}
