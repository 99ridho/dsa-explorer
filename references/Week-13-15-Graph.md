# Algoritma dan Struktur Data
## Weeks 13–15: Graph

**Program:** Information Systems and Technology, Universitas Negeri Jakarta
**Lecturer:** Muhammad Ridho Kurniawan Pratama

---

## 1. CPMK and Sub-CPMK

**CPMK:** Students can understand, design, and implement algorithms and data structures that support the efficiency of smart technology systems.

**Sub-CPMK-1.9:** Students can implement the data structure a problem requires, and the algorithm appropriate to that structure.

> **Scope note.** The RPS assigns the same "Graph" topic to Weeks 13, 14, and 15. This document consolidates all three into one material covering both undirected graphs and directed graphs (digraphs).

---

## 2. Real-World Usage and Reasoning

A graph is the right structure whenever relationships between items matter more than any single item's value, and those relationships don't fit a strict hierarchy. The source text supplies several concrete cases, split by whether direction matters:

**Undirected: relationships that go both ways** (algs4.cs.princeton.edu/41graph):
- **Social networks and the Kevin Bacon game.** An actor-movie graph, searched with breadth-first search, computes the "degree of separation" between two performers, the shortest chain of shared-movie connections.

**Directed: relationships that go one way** (algs4.cs.princeton.edu/42digraph):
- **Course prerequisites and build systems.** Topological sort orders vertices so every edge points from earlier to later, the exact requirement for scheduling course prerequisites, compiling program components in dependency order, or evaluating formulas in a spreadsheet.
- **Web crawling.** A crawler explores the web graph using breadth-first search, without ever needing to build the whole graph explicitly first.
- **Garbage collection.** A mark-and-sweep collector runs depth-first search from a program's root variables, marking everything still reachable; anything unmarked afterward is reclaimed.

**Reasoning.** The undirected/directed split is not cosmetic: it determines which algorithms even apply. A friendship is inherently symmetric, so undirected connectivity and shortest-path algorithms are enough. A prerequisite or a dependency is inherently one-way, so the problem needs topological sort and cycle detection on a directed acyclic graph, not just connectivity. Picking the wrong model (say, treating "follows" as symmetric like "friends") silently breaks any algorithm built on top of it.

---

## 3. Core Material

Primary source: Sedgewick, R. & Wayne, K. (2011). *Algorithms, 4th Edition*, Section 4.1 "Undirected Graphs" (https://algs4.cs.princeton.edu/41graph/) and Section 4.2 "Directed Graphs" (https://algs4.cs.princeton.edu/42digraph/).

### 3.1 Graph Definitions

A graph is a set of vertices and a collection of edges, each connecting a pair of vertices (algs4.cs.princeton.edu/41graph). Key terms (algs4.cs.princeton.edu/41graph):

- **Self-loop**: an edge connecting a vertex to itself.
- **Parallel edges**: two edges connecting the same pair of vertices.
- **Degree**: the number of edges incident on a vertex.
- **Path / simple path**: a sequence of vertices connected by edges, with no repeated edges (simple: also no repeated vertices).
- **Cycle**: a path whose first and last vertices are the same.
- **Connected graph**: a path exists between every pair of vertices; otherwise the graph splits into connected components.
- **Tree / forest**: an acyclic connected graph; a forest is a disjoint set of trees.
- **Spanning tree**: a subgraph containing every vertex of the original graph, forming a single tree.

### 3.2 Representation: Adjacency Lists

Graphs are represented as adjacency lists: an array indexed by vertex, where each entry lists the vertices adjacent to it. The key method `adj()` lets client code iterate over a vertex's neighbors; nearly every algorithm in this section builds on that one abstraction (algs4.cs.princeton.edu/41graph).

### 3.3 Depth-First Search (DFS)

DFS systematically visits every vertex and edge: mark a vertex as visited, then recursively visit every unmarked neighbor (algs4.cs.princeton.edu/41graph). Extended to record the edge that first reaches each vertex, it finds not just whether a path exists between two vertices, but the path itself.

**Proposition.** DFS marks every vertex connected to a given source in time proportional to the sum of their degrees, and supplies a path to any marked vertex in time proportional to that path's length (algs4.cs.princeton.edu/41graph).

### 3.4 Breadth-First Search (BFS)

Where DFS finds *a* path, BFS finds the *shortest* one. It checks vertices reachable in one edge, then two edges, and so on, using a queue of marked-but-unprocessed vertices (algs4.cs.princeton.edu/41graph).

**Proposition.** For any vertex reachable from the source, BFS computes a shortest path to it, in time proportional to V + E in the worst case (algs4.cs.princeton.edu/41graph).

### 3.5 Connected Components and Further DFS Applications

DFS also finds connected components, exploiting the fact that "is connected to" is an equivalence relation partitioning vertices into classes (algs4.cs.princeton.edu/41graph). The same tool solves related problems (algs4.cs.princeton.edu/41graph):

- **Cycle detection**: does the graph contain a cycle?
- **Two-colorability (bipartiteness)**: can vertices be split into two color classes with no same-color edge?
- **Bridges**: edges whose removal increases the number of connected components.

### 3.6 Directed Graphs (Digraphs)

A digraph is a set of vertices and directed edges, each pointing from one vertex to another (algs4.cs.princeton.edu/42digraph). Additional terms (algs4.cs.princeton.edu/42digraph):

- **Outdegree / indegree**: edges leaving / entering a vertex.
- **Strongly connected**: two vertices are strongly connected if each is reachable from the other.
- **DAG (directed acyclic graph)**: a digraph with no directed cycle.

DFS and BFS remain fundamental for digraph reachability, determining whether a directed path exists from a source to a target, from one source or from many at once (algs4.cs.princeton.edu/42digraph).

### 3.7 Topological Sort

Topological sort orders a digraph's vertices so every directed edge points from an earlier vertex to a later one (algs4.cs.princeton.edu/42digraph). Three key propositions (algs4.cs.princeton.edu/42digraph):

- A digraph has a topological order if and only if it is a DAG.
- Reverse postorder of a DAG is a topological sort.
- DFS can topologically sort a DAG in time proportional to V + E.

### 3.8 Strong Connectivity and Kosaraju–Sharir

Strong connectivity is an equivalence relation on vertices (reflexive, symmetric, transitive), partitioning them into *strong components* (algs4.cs.princeton.edu/42digraph). The Kosaraju–Sharir algorithm computes these with only a small addition to the undirected connected-components algorithm: run standard DFS on the graph, but visit vertices in the reverse-postorder sequence of the graph's reverse (algs4.cs.princeton.edu/42digraph).

---

## 4. Conclusion

A graph is the most flexible structure the course covers, because it imposes no constraint on how items relate to one another beyond an edge list. Two traversal strategies, DFS and BFS, underpin nearly everything built on top of that structure, from connectivity and cycle detection on undirected graphs to reachability, topological ordering, and strong connectivity on directed ones. Whether a relationship is modeled as directed or undirected is not a minor detail: it decides which of these algorithms is even valid to apply, which is exactly why the distinction opened this session.
