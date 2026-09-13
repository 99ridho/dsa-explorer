// SPEC.md §11: copied verbatim from references/Week-3-Queue.md (§2 and §3).
// Do not rewrite or summarize: this text has been through the course's citation-integrity process.
// Regenerate with `node scripts/extract-content.mjs` if the reference markdown changes.

export const realWorldUsage = `
A queue enforces exactly one rule (first in, first out), and that single rule is enough to model an enormous range of everyday situations. Sedgewick & Wayne describe it as a policy encountered "from people waiting in line at a theater, to cars waiting in line at a toll booth, to tasks waiting to be serviced by an application on your computer" (algs4.cs.princeton.edu/13stacks).

- **Task and print scheduling.** Any system that must serve requests in the order they arrived (a print spooler, a request queue behind a web server) is a direct application of FIFO order.
- **Directory and web traversal.** The source's own example lists all files in a Unix directory (including subdirectories) in level order using a queue: the same queue-driven traversal pattern this course revisits with breadth-first search on graphs later in the semester.
- **Fairness as a design property.** A queue is the structure to reach for whenever "whoever asked first gets served first" is a requirement, not just a convenience: arbitrary reordering would be a correctness bug, not just a performance one.
`.trim()

export const coreMaterial = `
Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 1.3 "Bags, Queues, and Stacks." https://algs4.cs.princeton.edu/13stacks/

### 3.1 Definition

A FIFO queue is a collection based on the first-in-first-out policy: items are removed in the same order they were added (algs4.cs.princeton.edu/13stacks).

### 3.2 Resizing-Array Implementation

A queue can be implemented with an array that grows and shrinks as needed (a *resizing array*), dynamically adjusting its capacity so it's always large enough to hold every item without wasting excessive space (algs4.cs.princeton.edu/13stacks). The same doubling/halving discipline used for stacks applies: the array doubles in size when full, and roughly halves when it drops below one-quarter full, keeping the amortized cost per operation constant.

### 3.3 Linked-List Implementation

A queue can also be implemented as a linked list, ordered from least recently to most recently added item, tracked with two instance variables: \`first\` (the front of the queue) and \`last\` (the back). To *enqueue* an item, it's added to the end of the list (at \`last\`); to *dequeue* an item, it's removed from the beginning (at \`first\`) (algs4.cs.princeton.edu/13stacks).

### 3.4 Iteration

Because a queue is a collection clients need to step through, it implements Java's \`Iterable\` interface: this lets client code process every item with a \`foreach\` loop rather than manually managing an index or a node reference, by providing an \`iterator()\` method that returns an object satisfying the \`hasNext()\`/\`next()\` contract (algs4.cs.princeton.edu/13stacks).

### 3.5 Queue vs. Stack: Same Shape, Different Rule

A queue and a stack (next week's topic) share almost the same implementation shape (both can be built on a resizing array or a linked list, both support adding and removing a single item at a time), but they differ in exactly one place: which end of the collection the *removal* operation looks at. A queue removes from the opposite end it inserts into (FIFO); a stack removes from the same end it inserts into (LIFO). That single difference is what produces two entirely different behaviors from nearly identical code.
`.trim()
