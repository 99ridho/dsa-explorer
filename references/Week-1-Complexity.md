# Algoritma dan Struktur Data
## Week 1: Analysis of Algorithms (Measuring Complexity)

**Program:** Information Systems and Technology, Universitas Negeri Jakarta
**Lecturer:** Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

---

## 1. CPMK and Sub-CPMK

**CPMK:** Students can understand, design, and implement algorithms and data structures that support the efficiency of smart technology systems.

**Sub-CPMK-1.1:** Students understand how to measure algorithmic complexity.

---

## 2. Real-World Usage and Reasoning

Sedgewick & Wayne frame this entire topic around two questions every programmer eventually runs into: "How long will my program take?" and "Why does my program run out of memory?" (algs4.cs.princeton.edu/14analysis). Those aren't academic questions: they're the two failure modes that show up in production.

- **Choosing between two working solutions.** When two algorithms both produce the correct answer, complexity analysis is what tells you which one will still work when the input is 100x larger, something you can't discover by just running both once on a small test case.
- **Safety-critical systems.** Worst-case performance guarantees matter most where failure is unacceptable: the source gives the example directly: software that runs "a nuclear reactor or a pacemaker or the brakes in your car" (algs4.cs.princeton.edu/14analysis), where "usually fast" isn't good enough and a proven upper bound is required.
- **Designing faster algorithms, not just measuring slow ones.** The source doesn't stop at analysis: it uses the same order-of-growth thinking to redesign a brute-force N² algorithm (2-sum) into an N log N one via sorting and binary search, which is the actual payoff of learning to measure complexity in the first place.

---

## 3. Core Material

Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 1.4 "Analysis of Algorithms." https://algs4.cs.princeton.edu/14analysis/

### 3.1 The Scientific Method, Applied to Programs

Studying running time borrows directly from the scientific method: observe a program's behavior with precise measurements, hypothesize a model consistent with those observations, predict future behavior from the hypothesis, then verify and validate by further observation (algs4.cs.princeton.edu/14analysis).

### 3.2 Mathematical Models

The total running time of a program comes down to two factors: the cost of executing each statement, and how frequently each statement executes (algs4.cs.princeton.edu/14analysis). To keep formulas manageable, low-order terms are discarded using *tilde approximations*: writing `g(N) ~ f(N)` to mean the ratio `g(N)/f(N)` approaches 1 as N grows. Most running times reduce to just a handful of *order-of-growth* functions of the input size N, because algorithms are built from only a few structural primitives: statements, conditionals, loops, nesting, and method calls (algs4.cs.princeton.edu/14analysis).

A *cost model* makes this concrete by naming the specific operation being counted: for the classic 3-sum problem (counting triples in an array that sum to zero), the natural cost model is the number of array accesses, and the brute-force solution needs about N³/2 of them (algs4.cs.princeton.edu/14analysis).

### 3.3 Designing Faster Algorithms

The point of measuring order of growth isn't just diagnosis: it's redesign. The brute-force 2-sum solution takes time proportional to N², but sorting the array first and then using binary search brings it down to N log N; the same idea pushes 3-sum from N³ down to N² log N (algs4.cs.princeton.edu/14analysis).

### 3.4 Coping with Input Dependence

Running time often varies with the specific input, not just its size, which is handled through a few different lenses (algs4.cs.princeton.edu/14analysis):

- **Worst-case guarantees**: a bound that holds no matter what the input is, appropriate when failure is unacceptable.
- **Randomized algorithms**: introducing randomness (as quicksort and hashing do) to make worst-case behavior astronomically unlikely rather than impossible.
- **Amortized analysis**: a worst-case guarantee over a *sequence* of operations rather than any single one; the source proves that both linked-list and resizing-array implementations of stacks and queues achieve constant time per operation *on average over a sequence*, even though a single resizing-array operation can occasionally cost more.

### 3.5 Memory as a Second Cost

Running time isn't the only resource that matters: the same analytical habit applies to memory. On a typical 64-bit machine, primitive types have fixed costs, objects add roughly 16 bytes of overhead beyond their fields, and arrays carry about 24 bytes of header overhead beyond their contents (algs4.cs.princeton.edu/14analysis). This is the same "count the operations, multiply by their cost" thinking as time analysis, just applied to bytes instead of seconds.

---

## 4. Conclusion

Complexity analysis turns "does it work" into "does it keep working as the input grows", a question that can't be answered by testing alone. The core discipline is picking a cost model, counting how an algorithm's operations scale with input size N, and using that order-of-growth to compare algorithms or to redesign a slow one entirely, as the 2-sum and 3-sum examples show. The same counting habit applies equally to memory, which matters just as much as running time once data sizes grow large, a theme this course returns to with every data structure that follows.
