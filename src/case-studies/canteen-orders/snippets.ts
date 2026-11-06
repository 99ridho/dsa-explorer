// SPEC.md §19.3: C++ / Java / Python for each operation, mapped to the pseudocode lines in ./pseudocode.ts.
// The logic follows algs4 Queue<Integer> and Stack<Integer> on linked nodes and a resizing int[] log,
// with descriptive names (ADR-014).
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
    ['    if (size == log.length) resize(2 * log.length);', 4],
    ['    log[size++] = number;', 5],
    '}',
    ['private void resize(int capacity) {', 4],
    ['    log = java.util.Arrays.copyOf(log, capacity);', 4],
    '}',
  ]),
  cpp: code([
    ['void serveNext() {', 1],
    ['    if (pending.empty()) return;', 2],
    ...cpp.map((line) => [`    ${line}`, 3] as [string, number]),
    ['    if (size == capacity) resize(2 * capacity);', 4],
    ['    log[size++] = number;', 5],
    '}',
  ]),
  python: code([
    ['def serve_next(self):', 1],
    ['    if not self.pending: return', 2],
    [`    number = ${python}`, 3],
    ['    if self.size == len(self.log):', 4],
    ['        self.log = self.log + [None] * len(self.log)', 4],
    ['    self.log[self.size] = number', 5],
    ['    self.size += 1', 5],
  ]),
})

const findBinary: OperationSnippets = {
  java: code([
    ['public int findOrder(int number) {', 1],
    ['    int low = 0, high = size - 1;', 2],
    ['    while (low <= high) {', 3],
    ['        int middle = low + (high - low) / 2;', 4],
    ['        if (number < log[middle]) high = middle - 1;', 5],
    ['        else if (number > log[middle]) low = middle + 1;', 6],
    ['        else return middle;', 7],
    '    }',
    ['    return -1;', 8],
    '}',
  ]),
  cpp: code([
    ['int findOrder(int number) {', 1],
    ['    int low = 0, high = size - 1;', 2],
    ['    while (low <= high) {', 3],
    ['        int middle = low + (high - low) / 2;', 4],
    ['        if (number < log[middle]) high = middle - 1;', 5],
    ['        else if (number > log[middle]) low = middle + 1;', 6],
    ['        else return middle;', 7],
    '    }',
    ['    return -1;', 8],
    '}',
  ]),
  python: code([
    ['def find_order(self, number):', 1],
    ['    low, high = 0, self.size - 1', 2],
    ['    while low <= high:', 3],
    ['        middle = (low + high) // 2', 4],
    ['        if number < self.log[middle]: high = middle - 1', 5],
    ['        elif number > self.log[middle]: low = middle + 1', 6],
    ['        else: return middle', 7],
    ['    return -1', 8],
  ]),
}

const findSequential: OperationSnippets = {
  java: code([
    ['public int findOrder(int number) {', 1],
    ['    for (int i = 0; i < size; i++)', 2],
    ['        if (log[i] == number) return i;', 3],
    ['    return -1;', 4],
    '}',
  ]),
  cpp: code([
    ['int findOrder(int number) {', 1],
    ['    for (int i = 0; i < size; i++)', 2],
    ['        if (log[i] == number) return i;', 3],
    ['    return -1;', 4],
    '}',
  ]),
  python: code([
    ['def find_order(self, number):', 1],
    ['    for i in range(self.size):', 2],
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
