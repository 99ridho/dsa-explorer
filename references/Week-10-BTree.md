# Algoritma dan Struktur Data
## Week 10: B-Tree

**Program:** Information Systems and Technology — Universitas Negeri Jakarta
**Lecturer:** Muhammad Ridho Kurniawan Pratama

---

## 1. CPMK and Sub-CPMK

**CPMK:** Students can understand, design, and implement algorithms and data structures that support the efficiency of smart technology systems.

**Sub-CPMK-1.8:** Students can recognize and understand variations on basic data structures — for example B-Tree, Hash Table, and Binary Heap.

> **Source note.** Sedgewick & Wayne's own B-Trees section (6.2) is, as published, "under major construction" — it contains no expository prose, only the reference implementation's source code and javadoc. This deck draws what it can from that code and javadoc (branching factor, operation cost, node structure) and from one line in their lecture notes. General B-tree mechanics beyond that — why multiway branching matters for disk-backed storage — are labeled explicitly as illustrative synthesis, not attributed to the primary text.

---

## 2. Real-World Usage and Reasoning

A B-tree is what a BST becomes when it's optimized for storage that is expensive to seek but cheap to read in large chunks — disks, not RAM. Sedgewick & Wayne's lecture notes place it directly in that context: B-trees are "a generalization of 2–3 trees that are widely used to implement file systems" (algs4.cs.princeton.edu/lectures).

- **File systems and database indexes.** The whole point of a B-tree's high branching factor is to keep the tree shallow — so that looking up a record costs a small, bounded number of *disk block reads*, not a small number of *comparisons*. That distinction is what a plain BST, tuned for in-memory comparisons, doesn't optimize for.
- **Name-to-address lookup tables.** The reference implementation's own example (`BTree.java`) builds a symbol table mapping domain names to IP addresses — the same shape of problem as a DNS-style lookup, where entries are added once and looked up far more often than they're modified.

*Illustrative reasoning — not drawn verbatim from the primary text.* Every disk seek costs orders of magnitude more time than an in-memory comparison. A structure that trades "more comparisons per node" for "far fewer nodes visited" is a direct win when each node visited means a disk read — which is exactly the trade a high branching factor makes.

---

## 3. Core Material

Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 6.2 "B-trees" and its reference implementation `BTree.java`. https://algs4.cs.princeton.edu/62btree/

### 3.1 What a B-Tree Generalizes

B-trees extend the idea behind the balanced search trees covered earlier in the course (2-3 trees, red-black BSTs) to an arbitrary branching factor rather than 2 or 3 children per node. Sedgewick & Wayne describe them as "a generalization of 2–3 trees that are widely used to implement file systems" (algs4.cs.princeton.edu/lectures).

### 3.2 Node Structure

In the reference implementation, a node holds up to `M − 1` keys and `M` children, where `M` must be even and greater than 2 (the canonical example sets `M = 4`). Nodes come in two kinds, distinguished by what they store: internal nodes hold only a key and a link to a subtree, while external (leaf) nodes hold a key and its associated value (algs4.cs.princeton.edu/62btree, from `BTree.java`).

### 3.3 Operations and Performance

The `get`, `put`, and `contains` operations each make at most log_m(n) probes in the worst case, where `n` is the number of key-value pairs and `m` is the branching factor — each "probe" corresponds to descending one level of the tree. The `size` and `is-empty` operations take constant time, and construction takes constant time (algs4.cs.princeton.edu/62btree, from `BTree.java`'s documentation).

That log_m(n) bound is the entire point of the structure: with a large `m`, the tree stays shallow even for a huge `n`, so very few probes (in the disk-backed case, very few disk reads) are needed to find any key.

### 3.4 Why Branching Factor, Not Depth, Is the Lever

*The following is illustrative synthesis, not drawn from the primary text, since the source chapter itself does not elaborate on it.* A plain balanced BST keeps height at O(log₂ n) by fixing the branching factor at 2 and letting height grow logarithmically. A B-tree instead fixes a *target height* (often just 2 or 3 levels even for millions of entries) by making the branching factor as large as a single disk block can hold. The two structures solve the same shape of problem — keep operations logarithmic — by trading off which quantity (branching factor vs. tree height) is allowed to grow.

---

## 4. Conclusion

A B-tree is the balanced-tree idea from earlier in the course, re-tuned for a cost model where visiting a node is expensive (a disk read) and comparing keys within a node is comparatively free — so it maximizes branching factor instead of minimizing comparisons. That single change in cost model is why B-trees, rather than BSTs or red-black trees, are the structure underneath most file systems and database indexes, even though all three guarantee the same logarithmic order of growth.
