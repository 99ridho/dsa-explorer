// SPEC.md §11: copied verbatim from references/Week-11-BinaryHeap.md (§2 and §3).
// Do not rewrite or summarize: this text has been through the course's citation-integrity process.
// Regenerate with `node scripts/extract-content.mjs` if the reference markdown changes.

export const realWorldUsage = `
A binary heap answers one specific question fast: "what's the most urgent item right now, and give it to me, then let me add more items later." The source text itself supplies several concrete cases that turn on exactly this need (algs4.cs.princeton.edu/24pq):

- **Interrupt handling.** A real-time system handling interrupts from a mouse click or a wireless connection needs to attend to them immediately. If interrupts should be handled in arrival order, a FIFO queue suffices, but "if different interrupts have different priorities... then we need a priority queue."
- **Stock exchange matching engines.** A continuous limit order book ranks buy and sell orders by price and then by time. The source describes using "two priority queues for each stock, one for buyers and one for sellers" to match compatible orders.
- **Simulation of queueing networks.** Simulating complex queueing systems (e.g., parallel M/M/1 queues) requires a priority queue to determine which event to process next, since the events themselves don't arrive in the order they should be processed.

**Reasoning.** In every one of these cases, the total set of pending items is large and constantly changing, but only the single highest-priority item ever needs to be pulled out at a time. An unordered array makes insertion fast but forces a full scan to find the maximum; a fully sorted array makes finding the maximum instant but makes insertion expensive. A binary heap is the structure that keeps both operations logarithmic, which is precisely the trade-off these applications need.
`.trim()

export const coreMaterial = `
Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 2.4 "Priority Queues." https://algs4.cs.princeton.edu/24pq/

### 3.1 The Priority Queue Problem

Many applications need to process items in order of key, without needing full sorted order and without needing everything sorted at once: collect a set of items, process the one with the largest key, collect more, repeat. A type supporting *remove the maximum* and *insert* is called a priority queue (algs4.cs.princeton.edu/24pq).

### 3.2 Why Elementary Implementations Fall Short

Every elementary implementation (array or linked list, ordered or unordered) shares one weakness: either *insert* or *remove the maximum* takes linear time in the worst case (algs4.cs.princeton.edu/24pq). An unordered array makes insert fast but remove-the-maximum requires a full scan; an ordered array reverses the trade-off. Finding a structure where both operations are guaranteed fast is the central problem this section solves.

### 3.3 Heap Definition

A binary tree is *heap-ordered* if the key in each node is larger than (or equal to) the keys in its children. It follows immediately that the largest key in a heap-ordered tree is always at the root (algs4.cs.princeton.edu/24pq).

For efficiency, the heap is represented as a *complete* binary tree stored level-order inside an array, with the root at position 1: the children of the node at position k sit at positions 2k and 2k+1, and its parent sits at position k/2 (algs4.cs.princeton.edu/24pq).

### 3.4 The Two Core Operations: Swim and Sink

When the heap invariant is violated, the structure is repaired by "reheapifying" (algs4.cs.princeton.edu/24pq):

- **Swim (bottom-up).** Used when a node's key becomes larger than its parent's. The node is exchanged with its parent repeatedly until the invariant holds or the root is reached.
- **Sink (top-down).** Used when a node's key becomes smaller than one of its children's. The node is exchanged with its larger child repeatedly until the invariant holds or the bottom is reached.

These two operations implement *insert* (add at the end, then swim) and *remove the maximum* (take the root, move the last item to the top, then sink) (algs4.cs.princeton.edu/24pq).

### 3.5 Performance

For a priority queue of n items, the heap algorithms require no more than 1 + lg n compares for insert, and no more than 2 lg n compares for remove-the-maximum (algs4.cs.princeton.edu/24pq), a logarithmic guarantee that elementary implementations cannot offer for both operations at once.

### 3.6 Application: Heapsort

Any priority queue can drive a sorting method: insert every key, then repeatedly remove the extreme one. Using a heap for this produces *heapsort*, in two phases (algs4.cs.princeton.edu/24pq):

- **Heap construction**: turning the raw array into a heap, achievable in linear time by sinking from right to left.
- **Sortdown**: repeatedly removing the largest remaining item and placing it into the slot the shrinking heap vacates.

Sink-based heap construction is linear time, and heapsort overall uses fewer than 2n lg n compares and exchanges to sort n items (algs4.cs.princeton.edu/24pq).

### 3.7 Practical Variant: Index Priority Queue

Applications that need to reference an item already sitting in the priority queue (to update its priority, for instance) associate a unique integer index with each item, giving an *index priority queue* (algs4.cs.princeton.edu/24pq).
`.trim()
