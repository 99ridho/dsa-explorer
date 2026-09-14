// Hand-written case study copy (SPEC.md §19.0), not generated. Every cost or property it states
// is quoted from the week reference it names; the scenario itself is illustrative.

export const scenario = `## The problem

*Illustrative scenario, not taken from the course references.* A study program lists its courses by short code and says which course must come before which. A student planning their semesters wants an order that never puts a course before one of its prerequisites. If the list contains a loop, where one course needs another that in turn needs the first, no such order exists, and the planner has to say so instead of printing a plan that cannot work.

The seed curriculum has eight courses: MTH (calculus), PR1 and PR2 (programming 1 and 2), DSC (discrete mathematics), DSA (data structures and algorithms), DB (databases), WEB (web programming), and AI (artificial intelligence).

## What the planner has to do

1. Turn a code the student types, such as PR2, into a number it can index with. It does this every time a code comes up.
2. Record that one course comes before another. PR1 before PR2 says nothing about PR2 before PR1.
3. Print an order in which every prerequisite comes first.
4. Notice the loop that makes such an order impossible.

## Try it in the simulator

Run Build study plan with the Topological design: a depth-first search walks the prerequisite digraph and prints the plan. Then switch the design to Alphabetical and build again. The planner sorts the codes from A to Z and counts every prerequisite that order breaks.

Add the prerequisite AI before PR1 and build the topological plan once more. The search now meets a course that is still on its call stack, reports the cycle, and stops. Add a new course such as PR3 to watch the index hash a code into one of its 11 buckets.
`

export const reasoning = `## Two questions, two structures

The planner answers two different questions. "Which vertex is PR2?" is an exact-key lookup, and Week 12 gives it near-constant time as long as the hash function spreads keys evenly. "What has to come first?" is about one-way relationships between items, which is what a directed graph records. Neither structure can answer the other's question: a hash table keeps no relationship between keys, and Weeks 13–15 represent a graph as an array indexed by vertex, so something has to turn codes into vertex numbers first.

## Why the naive plan fails

Sorting the codes is quick to write and always produces an order, which is what makes it tempting. Letters carry no information about prerequisites, though, so on the seed curriculum the alphabetical plan breaks 5 of the 8 prerequisites. Topological sort is not a sorting algorithm in the Week 5 sense: it compares no keys, it follows edges.
`
