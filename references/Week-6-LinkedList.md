# Algoritma dan Struktur Data
## Week 6: Linked List and Pointer Concepts

**Program:** Information Systems and Technology, Universitas Negeri Jakarta
**Lecturer:** Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

---

## 1. CPMK and Sub-CPMK

**CPMK:** Students can understand, design, and implement algorithms and data structures that support the efficiency of smart technology systems.

**Sub-CPMK-1.6:** Students can apply Linked Lists.

---

## 2. Real-World Usage and Reasoning

A linked list solves a problem arrays can't: growing or shrinking a collection one item at a time without ever needing to know its final size in advance.

- **Collections with genuinely unpredictable size.** Stacks and queues (Weeks 3–4) both have linked-list implementations for exactly this reason: a stack or queue backing a real system (an undo history, a request backlog) rarely has a known maximum size ahead of time.
- **Directory structures.** The source's own example lists every file in a Unix directory (and its subdirectories) by treating the directory listing as a traversal problem: the same recursive, node-and-reference shape a linked list is built from.
- **Sequenced media with skip/back controls.** The source poses a playlist data type directly as an exercise: enqueue a song, play the next one, skip one without announcing it, or go back, operations that map naturally onto walking forward and backward through linked nodes, not onto shifting elements in an array.

---

## 3. Core Material

Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 1.3 "Bags, Queues, and Stacks." https://algs4.cs.princeton.edu/13stacks/

### 3.1 Definition

A linked list is a recursive data structure that is either empty (null) or a reference to a node containing an item and a reference to the rest of the linked list (algs4.cs.princeton.edu/13stacks). Concretely, a node is a small class holding an item and a `next` reference to another node.

### 3.2 Building and Modifying a List

Constructing a list means creating a node per item and wiring each node's `next` reference to the following node (algs4.cs.princeton.edu/13stacks). Two operations are especially cheap because they only touch one end of the list:

- **Insert at the beginning**: the easiest insertion point: create a new node, point its `next` at the current first node, then make the new node the first node (algs4.cs.princeton.edu/13stacks).
- **Remove from the beginning**: equally easy: simply advance the `first` reference to point at the second node (algs4.cs.princeton.edu/13stacks).

Inserting *at the end* requires maintaining a separate reference to the last node: without it, reaching the end would require walking the entire list first (algs4.cs.princeton.edu/13stacks).

### 3.3 Traversal

The standard idiom for visiting every node in a linked list is a for-loop driven by the `next` reference itself, rather than by a numeric index: starting at the first node, process its item, then move to `next`, repeating until a null reference is reached (algs4.cs.princeton.edu/13stacks).

### 3.4 Why Linked Lists Underlie Stack and Queue Implementations

A linked-list stack keeps the top of the stack at the beginning of the list (`push()` inserts at the beginning, `pop()` removes from the beginning), both operations from Section 3.2 above, which is exactly why both run in constant time regardless of the stack's size (algs4.cs.princeton.edu/13stacks). A linked-list queue needs both ends: `enqueue()` inserts at the end (tracked by a `last` reference) and `dequeue()` removes from the beginning (algs4.cs.princeton.edu/13stacks).

### 3.5 Pointer Concepts

The `next` reference in each node is a pointer, in the general sense used across programming languages (even though Java calls it a reference rather than exposing raw memory addresses): a variable whose value identifies the location of another piece of data, rather than holding the data itself. Following a chain of these references from node to node, rather than jumping directly to an index, is what makes a linked list's memory non-contiguous, and is exactly why linked lists can grow without needing to reserve space in advance, unlike arrays.

---

## 4. Conclusion

A linked list trades away an array's constant-time indexed access in exchange for something arrays can't offer at all: insertion and removal at either end in constant time, with no need to know the collection's size in advance. That trade-off is precisely why stacks and queues (both covered in the two weeks before this one) have natural linked-list implementations, and why the node-and-pointer pattern introduced here reappears, in a more elaborate form, in the tree structures this course covers starting Week 9.
