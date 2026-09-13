// SPEC.md §11 — copied verbatim from references/Week-12-HashTable.md (§2 and §3).
// Do not rewrite or summarize: this text has been through the course's citation-integrity process.
// Regenerate with `node scripts/extract-content.mjs` if the reference markdown changes.

export const realWorldUsage = `
Hash tables trade the ordering that a BST preserves for something else: near-constant-time lookup regardless of how many items are stored, as long as the hash function spreads keys evenly. The source text points to several concrete uses that depend on exactly this property (algs4.cs.princeton.edu/34hash):

- **Language-level symbol tables and objects.** Java requires every type to implement \`hashCode()\`, precisely so that any object — strings, dates, custom classes — can be used as a key in a hash-based map, with no ordering requirement at all.
- **Caching web content.** A Bloom filter — a hashing-based structure — lets a client quickly check whether a URL is "possibly cached" before paying the cost of a real cache or database lookup, which only matters because most lookups need to be fast, not ordered.
- **Integrity checking.** CRC-32 checksums and cryptographic hashes (SHA-1, MD5) verify that a file or string has not been altered, by comparing hash values instead of the full content.

**Reasoning.** None of these use cases need "the next largest key" or "everything between X and Y" — they need "does this exact key exist, and what's its value," as fast as possible. That is the one operation a hash table optimizes at the cost of losing order, which is why it fits these cases better than a BST would.
`.trim()

export const coreMaterial = `
Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 3.4 "Hash Tables." https://algs4.cs.princeton.edu/34hash/

### 3.1 The Basic Idea

If keys are small integers, an array can serve directly as a symbol table by treating the key as an index. Hashing extends this idea to handle more complex key types, using arithmetic to transform a key into an array index (algs4.cs.princeton.edu/34hash).

A hash-based search has two parts: computing a *hash function* that turns the key into an array index, and resolving *collisions* — cases where two different keys hash to the same index (algs4.cs.princeton.edu/34hash).

### 3.2 Designing a Hash Function

A good hash function needs to be deterministic, efficient to compute, and uniform in how it distributes keys (algs4.cs.princeton.edu/34hash). Several approaches follow from this (algs4.cs.princeton.edu/34hash):

- **Positive integers — modular hashing.** Choose table size M as prime, and hash a key k as \`k % M\`. Cheap to compute and effective at spreading keys evenly.
- **Strings.** Treated as large integers, using a small prime base R (Java uses R = 31).
- **Compound keys.** Multiple integer fields are mixed together the same way strings are.

Converting a 32-bit \`hashCode()\` into a valid array index takes two steps: mask off the sign bit, then reduce modulo M (algs4.cs.princeton.edu/34hash). This underpins **Assumption J** (the uniform hashing assumption): the hash function distributes keys uniformly across the range 0 to M−1 (algs4.cs.princeton.edu/34hash).

### 3.3 Collision Resolution Strategies

Two main strategies (algs4.cs.princeton.edu/34hash):

**Separate chaining.** Each of the M array slots holds a linked list of the key-value pairs that hash there. Search is two steps: hash to find the right list, then scan that list. The source proves (Property L) that in a separate-chaining table with M lists and N keys, the number of compares for search and insert is proportional to N/M.

**Linear probing (open addressing).** N key-value pairs are stored in a table of size M > N, relying on empty slots for collision resolution. On collision, the search moves to the next slot until it finds a matching key, an empty slot, or a different key to skip past. Performance depends on the load factor α = N/M, which must stay below 1 for open addressing. The source proves (Proposition M) that the average number of probes is about ½(1 + 1/(1−α)) for search hits and about ½(1 + 1/(1−α)²) for search misses or inserts.

### 3.4 Why Table Size Should Be Prime

Choosing M as prime for modular hashing avoids shared-factor patterns between keys and M that would otherwise concentrate collisions on particular indices, undermining the uniform distribution the whole scheme depends on (algs4.cs.princeton.edu/34hash).
`.trim()
