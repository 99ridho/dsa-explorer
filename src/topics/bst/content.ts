// SPEC.md §11: copied verbatim from references/Week-9-BST.md (§2 and §3).
// Do not rewrite or summarize: this text has been through the course's citation-integrity process.
// Regenerate with `node scripts/extract-content.mjs` if the reference markdown changes.

export const realWorldUsage = `
A BST keeps keys in sorted order while allowing both fast lookup and fast insertion, something a plain sorted array or a plain linked list cannot do at the same time. That single trade-off explains most of where BSTs (and their balanced descendants) show up in practice:

- **File system directories and database indexes.** A directory or an index needs to answer "does this key exist, and if so, where," while also accepting new entries without rebuilding the whole structure. A tree-ordered index supports both.
- **Autocomplete and range queries.** Because a BST keeps keys ordered, it can answer "give me everything between A and M" directly by walking a subtree, instead of scanning every record.
- **In-memory ordered maps.** Language libraries that need a \`Map\` or \`Set\` which stays sorted (so it can be iterated in order, or queried for the nearest key) implement it as a tree-based structure for exactly this reason.

*Illustrative examples, not drawn verbatim from the primary text.* The reasoning generalizes from the same trade-off Sedgewick & Wayne describe: any application that needs both membership testing and order-based queries (nearest key, range, rank) benefits from a tree that keeps keys sorted rather than an unordered structure that would need a separate sort step.
`.trim()

export const coreMaterial = `
Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 3.2 "Binary Search Trees." https://algs4.cs.princeton.edu/32bst/

### 3.1 Why BSTs Exist

A BST combines the flexibility of insertion in a linked list with the efficiency of search in an ordered array, using two links per node. Sedgewick & Wayne describe the resulting structure as one that "qualifies as one of the most fundamental algorithms in computer science" (algs4.cs.princeton.edu/32bst).

### 3.2 Formal Definition

A binary search tree is a binary tree in which every node holds a comparable key (and an associated value), with the invariant that the key at any node is larger than every key in its left subtree and smaller than every key in its right subtree (algs4.cs.princeton.edu/32bst).

Each node stores four things: a key, a value, a left link, a right link, and a subtree node count. That count field is what makes several ordered operations (rank, select) efficient without extra traversal (algs4.cs.princeton.edu/32bst).

### 3.3 Search and Insert

**Search** follows the tree's recursive structure directly: an empty tree is a miss; a key equal to the root is a hit; otherwise the search recurses into the appropriate subtree (algs4.cs.princeton.edu/32bst).

**Insert** reuses the same logic: a search for a key that isn't present ends at a null link, and that link is replaced with a new node. If the tree is empty, a new node is returned; otherwise the result of inserting into the correct subtree becomes the new left or right link (algs4.cs.princeton.edu/32bst).

### 3.4 Performance Analysis

Running time depends entirely on the tree's shape, which in turn depends on the order keys arrive in. Under the assumption that keys arrive in random order, Sedgewick & Wayne prove (algs4.cs.princeton.edu/32bst):

- A search hit in a BST built from N random keys takes about 2 ln N (roughly 1.39 lg N) compares on average.
- Insertion and search misses take a comparable number of compares on average.

That is dramatically better than linear search on average, but a BST built from already-sorted input degenerates into a linked list, with O(N) performance. This asymmetry is exactly why balanced variants exist (a topic for a later section).

### 3.5 Order-Based Operations and Deletion

Because a BST keeps keys in order, it naturally supports (algs4.cs.princeton.edu/32bst):

- **Minimum / maximum**: found by walking left (or right) until the link is null.
- **Floor / ceiling**: the largest key ≤ (or smallest key ≥) a given key, found by comparing against the root and recursing.
- **Rank / select**: "how many keys are smaller than this one" and "what's the key of rank k," both driven by the subtree count field.
- **Deletion (Hibbard deletion)**: a node with two children is deleted by replacing it with its in-order successor (the smallest key in its right subtree), in four steps.

Sedgewick & Wayne note a practical flaw in Hibbard deletion: the choice of successor over predecessor is arbitrary and asymmetric, and repeated deletions gradually skew the tree toward one side (algs4.cs.princeton.edu/32bst).
`.trim()
