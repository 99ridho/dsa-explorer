// SPEC.md §11: copied verbatim from references/Week-5-Sorting.md (§2 and §3).
// Do not rewrite or summarize: this text has been through the course's citation-integrity process.
// Regenerate with `node scripts/extract-content.mjs` if the reference markdown changes.

export const realWorldUsage = `
Sorting shows up anywhere data needs to be presented, compared, or processed in order, but which sorting algorithm to use depends on a real trade-off the source makes concrete rather than abstract.

- **Minimizing an expensive operation, not just total work.** The source poses a scenario directly: a shipping clerk must rearrange large crates by shipping time, where comparing labels is cheap but physically moving a crate is expensive, and there's only enough warehouse space to hold one extra crate at a time. The documented answer is selection sort, specifically *because it minimizes the number of exchanges*, a choice that only makes sense once "cost of a compare" and "cost of an exchange" are treated as different quantities, not lumped together.
- **Sorting real transactional data.** The source's own transaction-sorting exercise (comparing financial transactions by amount) is the same shape of problem as sorting sensor readings by timestamp or sorting IoT device logs by severity: real records, not just arrays of numbers.
- **Partially-sorted, real-world input.** Insertion sort's performance is tied to the number of *inversions* (out-of-order pairs) in the input, which means data that arrives "almost sorted" (common in real systems where new records are appended to an already-ordered log) sorts fast, even at large scale.
`.trim()

export const coreMaterial = `
Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 2.1 "Elementary Sorts." https://algs4.cs.princeton.edu/21elementary/

### 3.1 The Sorting Cost Model

Sorting algorithms are compared by counting *compares* and *exchanges* (or, for algorithms that don't exchange, array accesses) (algs4.cs.princeton.edu/21elementary). Sort code in general only needs to interact with the data through two operations (\`less()\` to compare two items, and \`exch()\` to swap them), which is what lets the same sorting code work for any data type that defines a valid ordering.

### 3.2 Selection Sort

Selection sort repeatedly finds the smallest remaining item and exchanges it into its correct position: find the smallest item and swap it into the first slot, then find the next-smallest and swap it into the second slot, and so on until the array is sorted (algs4.cs.princeton.edu/21elementary). It uses about N²/2 compares and exactly N exchanges to sort an array of length N: the exchange count is fixed regardless of the input's initial order, which is exactly why it's the right choice when exchanges (not compares) are the expensive operation.

### 3.3 Insertion Sort

Insertion sort works the way people often sort a hand of playing cards: consider items one at a time, inserting each into its proper place among those already considered, sliding larger items one position to the right to make room (algs4.cs.princeton.edu/21elementary). For randomly ordered arrays, it uses about N²/4 compares and N²/4 exchanges on average, better than selection sort in the average case, but its real strength is on *partially sorted* input: the number of exchanges it performs equals exactly the number of inversions in the array, so a nearly-sorted array (few inversions) sorts in nearly linear time.

### 3.4 Shellsort

Shellsort extends insertion sort by allowing exchanges between entries that are far apart, producing partially h-sorted arrays that become progressively easier to fully sort. An array is *h-sorted* if taking every h-th entry yields a sorted sequence; by h-sorting for a decreasing sequence of h values ending in 1, the array becomes fully sorted, and each pass benefits from the partial order the previous pass created (algs4.cs.princeton.edu/21elementary). With the increment sequence 1, 4, 13, 40, 121, ..., shellsort's compare count is bounded by O(N^(3/2)), asymptotically better than the quadratic behavior of selection and insertion sort.
`.trim()
