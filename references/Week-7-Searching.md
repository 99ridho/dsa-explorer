# Algoritma dan Struktur Data
## Week 7: Searching (Elementary Symbol Tables)

**Program:** Information Systems and Technology, Universitas Negeri Jakarta
**Lecturer:** Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

---

## 1. CPMK and Sub-CPMK

**CPMK:** Students can understand, design, and implement algorithms and data structures that support the efficiency of smart technology systems.

**Sub-CPMK-1.5:** Students understand basic algorithms for searching and sorting problems. *(This session covers the searching half; Week 5 covered sorting.)*

---

## 2. Real-World Usage and Reasoning

Searching, in the sense this week covers, is really about a more general problem: associating a value with a key so it can be looked up later. Sedgewick & Wayne state the purpose directly: "the primary purpose of a symbol table is to associate a value with a key" (algs4.cs.princeton.edu/31elementary).

- **Word-frequency analysis.** The source's own `FrequencyCounter` client finds how many times each string (above a minimum length) occurs in a stream of text, and reports the most frequent one: a direct model for log analysis, word clouds, or any counting-by-key task.
- **Grade and lookup tables.** The source's GPA exercise builds a symbol table mapping letter grades to numeric scores, exactly the shape of any small, fixed lookup table (status codes, configuration keys, unit conversions).
- **Why the search method matters, not just the answer.** Both algorithms below answer the same question ("is this key present, and what's its value"), but one scans linearly and one exploits order to skip most of the data outright, which is the entire reason this week sets up the BST material two weeks later.

---

## 3. Core Material

Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 3.1 "Elementary Symbol Tables." https://algs4.cs.princeton.edu/31elementary/

### 3.1 The Symbol Table Abstraction

A symbol table lets a client insert key-value pairs and later search for the value associated with a given key (algs4.cs.princeton.edu/31elementary). By convention, only one value is ever associated with a key (inserting a key that's already present replaces its old value), which defines what's called the *associative array* abstraction: a symbol table behaves like an array where keys serve as indices (algs4.cs.princeton.edu/31elementary).

### 3.2 The Ordered Symbol Table API

When keys are comparable, a much richer set of operations becomes possible, because the symbol table can be thought of as keeping its keys in order (algs4.cs.princeton.edu/31elementary):

- **Minimum / maximum**: the smallest or largest key.
- **Floor / ceiling**: the largest key ≤ a given key, or the smallest key ≥ a given key.
- **Rank / selection**: how many keys are smaller than a given key, or which key has a given rank.
- **Range queries**: how many keys (or which keys) fall within a given range.

### 3.3 Sequential Search in an Unordered Linked List

The simplest implementation keeps key-value pairs as nodes in a linked list. `get()` scans the list, comparing the search key against each node's key, returning the matching value or null; `put()` does the same scan, either updating an existing match or inserting a new node at the front if none is found (algs4.cs.princeton.edu/31elementary). This method, sequential search, needs up to N compares for an unsuccessful search or insert, and inserting N keys into an initially empty table costs about N²/2 compares overall (algs4.cs.princeton.edu/31elementary).

### 3.4 Binary Search in an Ordered Array

Keeping keys in a sorted array, instead of an unordered list, enables *binary search*: to search, compare the search key against the key at the middle of the current subarray; if smaller, search the left half; if larger, search the right half; otherwise the key is found (algs4.cs.princeton.edu/31elementary). The `rank()` method (counting how many keys are smaller than a given key) is the workhorse behind this implementation: it tells `get()` exactly where to look and `put()` exactly where to insert or update.

Binary search in an ordered array of N keys needs no more than lg N + 1 compares for any search, successful or not (algs4.cs.princeton.edu/31elementary), a dramatic improvement over sequential search's linear cost. The trade-off is insertion: adding a new key requires shifting every larger key one position over, costing about 2N array accesses per insertion, so building a table of N keys this way costs about N² array accesses overall (algs4.cs.princeton.edu/31elementary).

### 3.5 The Trade-Off That Motivates the Rest of This Course

Sequential search (linked list) makes insertion cheap but search expensive; binary search (sorted array) makes search cheap but insertion expensive. Neither implementation makes *both* operations fast, which is exactly the gap the Binary Search Tree, covered in Week 9, is built to close.

---

## 4. Conclusion

Searching this week means implementing the symbol table abstraction (associating values with keys), and the two elementary implementations expose a genuine trade-off rather than a clear winner: an unordered linked list makes insertion fast at the cost of slow search, while a sorted array makes search logarithmic at the cost of expensive insertion. That unresolved trade-off, not a flaw in either implementation, is the direct motivation for combining a linked structure with an ordering invariant, which is precisely what a Binary Search Tree does, two weeks from now.
