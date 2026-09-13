# Algoritma dan Struktur Data
## Week 4: Stack

**Program:** Information Systems and Technology, Universitas Negeri Jakarta
**Lecturer:** Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

---

## 1. CPMK and Sub-CPMK

**CPMK:** Students can understand, design, and implement algorithms and data structures that support the efficiency of smart technology systems.

**Sub-CPMK-1.4:** Students can apply Stack algorithms.

---

## 2. Real-World Usage and Reasoning

A stack enforces the opposite rule from a queue (last in, first out), and that rule turns out to match how a surprising number of systems actually need to behave.

- **Browser navigation.** Sedgewick & Wayne's own example is exactly this: "when you click a hyperlink, your browser displays the new page (and pushes onto a stack)... you can always revisit the previous page by clicking the back button (popping it from the stack)" (algs4.cs.princeton.edu/13stacks).
- **Undo functionality.** The source poses this directly as a design question: what data type would support an "Undo" feature in a word processor? A stack of past states, popped one at a time, is the answer: the most recent change is always the first one undone.
- **Evaluating arithmetic expressions.** The source's `Evaluate.java` client evaluates fully parenthesized expressions using Dijkstra's two-stack algorithm (one stack for operands, one for operators), which is a working model of how a calculator or an interpreter processes expressions symbol by symbol.

---

## 3. Core Material

Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 1.3 "Bags, Queues, and Stacks." https://algs4.cs.princeton.edu/13stacks/

### 3.1 Definition

A pushdown stack is a collection based on the last-in-first-out (LIFO) policy: the most recently added item is the first one removed (algs4.cs.princeton.edu/13stacks).

### 3.2 Resizing-Array Implementation

With a resizing array, the stack's underlying array grows and shrinks to stay both large enough to hold every item and not so large that space is wasted: the array doubles in size when `push()` finds it full, and halves when `pop()` finds it less than one-quarter full (algs4.cs.princeton.edu/13stacks). This asymmetric threshold (doubling at full, halving at one-quarter, not one-half) exists specifically to avoid *thrashing*: repeatedly resizing back and forth on an input that hovers right at a single threshold.

### 3.3 Linked-List Implementation

A stack can also be implemented as a linked list, with the top of the stack kept at the beginning of the list, tracked by an instance variable `first`. To `push()` an item, a new node is added to the beginning of the list; to `pop()` an item, the node at the beginning is removed and its item returned (algs4.cs.princeton.edu/13stacks).

### 3.4 Dijkstra's Two-Stack Algorithm for Expression Evaluation

To evaluate a fully parenthesized arithmetic expression, two stacks are used together: operands are pushed onto an operand stack, operators onto an operator stack, left parentheses are ignored, and on encountering a right parenthesis, one operator and the required number of operands are popped, the operator is applied, and the result is pushed back onto the operand stack (algs4.cs.princeton.edu/13stacks).

### 3.5 Stack vs. Queue

As noted in the Queue material (Week 3), a stack and a queue can share almost the same underlying implementation (resizing array or linked list, one item added or removed at a time), differing only in which end of the collection is used for removal. A stack removes from the same end it inserts into; a queue removes from the opposite end.

---

## 4. Conclusion

A stack's LIFO discipline is what makes it the right structure whenever "undo the most recent thing" or "go back to where you just were" is the required behavior: browser history and undo features being the clearest everyday examples. Beyond navigation, the same LIFO structure is powerful enough to evaluate arithmetic expressions correctly using nothing but two stacks and a single left-to-right scan, a pattern that recurs throughout the rest of this course whenever an algorithm needs to "remember where it came from", including, later in the semester, the recursive call stack underlying depth-first search on graphs.
