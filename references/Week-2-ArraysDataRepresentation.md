# Algoritma dan Struktur Data
## Week 2: Data Types, Arrays, Structures, Unions, and Static/Dynamic Variables

**Program:** Information Systems and Technology, Universitas Negeri Jakarta
**Lecturer:** Muhammad Ridho Kurniawan Pratama, S.Kom., M.T.I.

---

## 1. CPMK and Sub-CPMK

**CPMK:** Students can understand, design, and implement algorithms and data structures that support the efficiency of smart technology systems.

**Sub-CPMK-1.2:** Students understand the importance of data representation.

> **Source note.** Sedgewick & Wayne is a Java text; Java has no `struct` or `union`, and manages memory very differently from the C environment (DEV-C++) this course's practicum uses. Arrays and primitive types below are drawn from the primary source; struct, union, and static-vs-dynamic memory allocation are labeled explicitly as illustrative synthesis, since the primary text does not cover them.

---

## 2. Real-World Usage and Reasoning

How data is represented in memory isn't a background detail: it's what makes every data structure later in this course possible or impossible to implement efficiently.

- **Choosing the right container before choosing the right algorithm.** An array's fixed size and constant-time indexed access, versus a struct's ability to group unlike fields under one name, versus a union's ability to let fields share the same memory: each of these representational choices constrains what operations are cheap and what operations are expensive, before any algorithm is even written.
- **Memory-constrained smart-technology devices.** On an embedded IoT sensor node with kilobytes of RAM, knowing exactly how many bytes a data type or array costs (not just "it fits") is the difference between a program that runs and one that silently corrupts memory.

*Illustrative reasoning for struct/union/static vs. dynamic, not drawn from the primary text, which doesn't cover these C-specific constructs.* A `struct` groups related fields (e.g., a sensor reading's timestamp, value, and location) under one name, the same shape of problem Java solves with classes. A `union` lets multiple fields share one memory location, useful when only one interpretation of the same bytes is needed at a time, at the cost of the programmer tracking which interpretation is currently valid. Static variables persist for a program's entire lifetime and are allocated once; dynamic (stack/heap) variables are allocated and freed as functions are called and return, trading persistence for reclaimable memory.

---

## 3. Core Material

Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 1.1 "Programming Model" and Section 1.4 "Analysis of Algorithms" (memory usage). https://algs4.cs.princeton.edu/11model/ and https://algs4.cs.princeton.edu/14analysis/

### 3.1 Primitive Data Types

A data type is defined as a set of values together with a set of operations on those values. The four primitive types underlying the language are integers, real numbers, booleans, and characters, each with their own arithmetic, logical, or comparison operations (algs4.cs.princeton.edu/11model).

### 3.2 Arrays

An array stores a sequence of values of the same type, referenced by index from 0 to N−1 (algs4.cs.princeton.edu/11model). Building an array involves three distinct steps: declaring the array's name and type, creating the array, and initializing its values, steps that are often collapsed into a single statement using default initialization (zero for numeric types, false for boolean) (algs4.cs.princeton.edu/11model).

Once created, an array's size is fixed, and bounds are checked automatically: an illegal index terminates the program with an out-of-bounds exception rather than silently corrupting memory (algs4.cs.princeton.edu/11model). Two-dimensional arrays are implemented as arrays of arrays, and may be *ragged*: each row can have a different length (algs4.cs.princeton.edu/11model).

An important and easy-to-miss property is *aliasing*: an array name refers to the whole array, so assigning one array variable to another gives both names access to the same underlying data: a change through one name is visible through the other (algs4.cs.princeton.edu/11model).

### 3.3 Memory Cost of Representation

The same analytical thinking from complexity analysis (Week 1) applies directly to how much memory each representation choice costs, on a typical 64-bit machine (algs4.cs.princeton.edu/14analysis):

- **Primitive types** have fixed, small memory footprints.
- **Objects** add roughly 16 bytes of overhead beyond their instance variables, with memory padded to a multiple of 8 bytes.
- **References** to objects cost 8 bytes each.
- **Arrays** carry about 24 bytes of header overhead (16 bytes object overhead, 4 bytes length, 4 bytes padding) beyond the memory needed for their values.

### 3.4 Struct, Union, and Static/Dynamic Variables

*The following is illustrative synthesis, not drawn from the primary text.* In a C-based environment like this course's practicum:

- A **struct** bundles multiple named fields into a single composite type, with each field getting its own dedicated memory: the total size is roughly the sum of its fields (plus padding for alignment).
- A **union** also bundles named fields, but all of them *share* the same memory location, sized to the largest field: writing one field can overwrite the bytes another field would read, so the programmer is responsible for knowing which field is currently valid.
- A **static variable** is allocated once and persists for the entire run of the program, retaining its value across function calls.
- A **dynamic (automatic/local) variable** is allocated when its enclosing function is called and freed when that function returns: cheap and self-cleaning, but its value doesn't survive past the function's lifetime.

---

## 4. Conclusion

Every data structure in this course is, underneath, a specific way of arranging primitive types and arrays in memory, so the representational choices covered this week (fixed-size indexed arrays, field-grouping structs, memory-sharing unions, and the static/dynamic lifetime distinction) are the raw material every later structure is built from. Understanding what each representation costs, in both a Java-style memory model and a C-style one, is what makes it possible to reason about why a linked list, a heap, or a hash table is shaped the way it is.
