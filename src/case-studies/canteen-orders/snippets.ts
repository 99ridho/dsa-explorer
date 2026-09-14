// SPEC.md §19.3: C++ / Java / Python for each operation, mapped to the pseudocode lines in ./pseudocode.ts.
// Java follows algs4: Queue<Integer> and Stack<Integer> on linked nodes, and a resizing int[] log.
import { code } from '@/lib/snippets'
import type { OperationSnippets } from '@/types/step-engine'

const place = (java: string, cpp: string, python: string): OperationSnippets => ({
  java: code([
    ['public void placeOrder() {', 1],
    ['    int number = nextOrder++;', 2],
    [`    ${java}`, 3],
    '}',
  ]),
  cpp: code([
    ['void placeOrder() {', 1],
    ['    int number = nextOrder++;', 2],
    [`    ${cpp}`, 3],
    '}',
  ]),
  python: code([
    ['def place_order(self):', 1],
    ['    number = self.next_order', 2],
    ['    self.next_order += 1', 2],
    [`    ${python}`, 3],
  ]),
})

const serve = (java: string, cpp: string[], python: string): OperationSnippets => ({
  java: code([
    ['public void serveNext() {', 1],
    ['    if (pending.isEmpty()) return;', 2],
    [`    int number = ${java};`, 3],
    ['    if (n == log.length) resize(2 * log.length);', 4],
    ['    log[n++] = number;', 5],
    '}',
    ['private void resize(int capacity) {', 4],
    ['    log = java.util.Arrays.copyOf(log, capacity);', 4],
    '}',
  ]),
  cpp: code([
    ['void serveNext() {', 1],
    ['    if (pending.empty()) return;', 2],
    ...cpp.map((line) => [`    ${line}`, 3] as [string, number]),
    ['    if (n == capacity) resize(2 * capacity);', 4],
    ['    log[n++] = number;', 5],
    '}',
  ]),
  python: code([
    ['def serve_next(self):', 1],
    ['    if not self.pending: return', 2],
    [`    number = ${python}`, 3],
    ['    if self.n == len(self.log):', 4],
    ['        self.log = self.log + [None] * len(self.log)', 4],
    ['    self.log[self.n] = number', 5],
    ['    self.n += 1', 5],
  ]),
})

const findBinary: OperationSnippets = {
  java: code([
    ['public int findOrder(int number) {', 1],
    ['    int lo = 0, hi = n - 1;', 2],
    ['    while (lo <= hi) {', 3],
    ['        int mid = lo + (hi - lo) / 2;', 4],
    ['        if (number < log[mid]) hi = mid - 1;', 5],
    ['        else if (number > log[mid]) lo = mid + 1;', 6],
    ['        else return mid;', 7],
    '    }',
    ['    return -1;', 8],
    '}',
  ]),
  cpp: code([
    ['int findOrder(int number) {', 1],
    ['    int lo = 0, hi = n - 1;', 2],
    ['    while (lo <= hi) {', 3],
    ['        int mid = lo + (hi - lo) / 2;', 4],
    ['        if (number < log[mid]) hi = mid - 1;', 5],
    ['        else if (number > log[mid]) lo = mid + 1;', 6],
    ['        else return mid;', 7],
    '    }',
    ['    return -1;', 8],
    '}',
  ]),
  python: code([
    ['def find_order(self, number):', 1],
    ['    lo, hi = 0, self.n - 1', 2],
    ['    while lo <= hi:', 3],
    ['        mid = (lo + hi) // 2', 4],
    ['        if number < self.log[mid]: hi = mid - 1', 5],
    ['        elif number > self.log[mid]: lo = mid + 1', 6],
    ['        else: return mid', 7],
    ['    return -1', 8],
  ]),
}

const findSequential: OperationSnippets = {
  java: code([
    ['public int findOrder(int number) {', 1],
    ['    for (int i = 0; i < n; i++)', 2],
    ['        if (log[i] == number) return i;', 3],
    ['    return -1;', 4],
    '}',
  ]),
  cpp: code([
    ['int findOrder(int number) {', 1],
    ['    for (int i = 0; i < n; i++)', 2],
    ['        if (log[i] == number) return i;', 3],
    ['    return -1;', 4],
    '}',
  ]),
  python: code([
    ['def find_order(self, number):', 1],
    ['    for i in range(self.n):', 2],
    ['        if self.log[i] == number: return i', 3],
    ['    return -1', 4],
  ]),
}

export const canteenSnippets: Record<string, OperationSnippets> = {
  'place-queue': place('pending.enqueue(number);', 'pending.push(number);   // std::queue<int>', 'self.pending.append(number)   # a collections.deque'),
  'place-stack': place('pending.push(number);', 'pending.push(number);   // std::stack<int>', 'self.pending.append(number)   # a list used as a stack'),
  'serve-queue': serve('pending.dequeue()', ['int number = pending.front();', 'pending.pop();'], 'self.pending.popleft()'),
  'serve-stack': serve('pending.pop()', ['int number = pending.top();', 'pending.pop();'], 'self.pending.pop()'),
  'find-binary': findBinary,
  'find-sequential': findSequential,
}
