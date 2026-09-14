// Hand-written case study copy (SPEC.md §19.0), not generated. Every cost or property it states
// is quoted from the week reference it names; the scenario itself is illustrative.

export const scenario = `## The problem

*Illustrative scenario, not taken from the course references.* An emergency room admits patients one at a time. A triage nurse gives each one a severity from 1 (can wait) to 5 (critical), and the desk always calls the most urgent waiting patient next. When two patients share a severity, the one who arrived first goes first. Patients get arrival numbers from #101 upward, in the order they walk in.

Every patient also has a record number, which has nothing to do with when they arrived: #104 is the fourth arrival today, and their record is 63. On the waiting list a patient shows both, as #104 over S5 R63. The desk keeps today's records in an archive on disk, keyed by record number, so the archive starts with one record per waiting patient. A treated patient's record stays, and a record cannot be admitted twice while its patient is still waiting. and reading one node of that archive means reading one block from the disk.

## What the desk has to do

1. Admit a patient at any moment, including while others wait.
2. Hand out the most urgent waiting patient, many times a shift.
3. Find a patient's record in the archive with as few block reads as possible, and open a new record when the archive has none.

## Try it in the simulator

With the Priority queue design, admit 5, 50. The new patient, #106, swims up past #103 and stops under #104, because #104 has the same severity and arrived earlier. Then run Treat next a few times: #104 goes first although three patients arrived before them, and #106 follows.

Switch the design to Arrival queue and run Treat next again. The desk now treats #101, #102, and #103 while #104 waits, and the bypassed counter under the canvas shows it. Find record 63 in either design to follow the archive lookup from the root to a leaf, one block read per level.
`

export const reasoning = `## One question per structure

The waiting list answers "who is most urgent right now?", and the archive answers "where is record 63?". Week 11 describes the first question exactly: the set of waiting items is large and keeps changing, but only the single highest-priority item is ever taken out. Week 10 describes the second: when visiting a node means a disk read, a structure that visits fewer nodes wins even if it compares more keys inside each node.

## Why arrival order looks fine until it is not

A queue is fair when everyone has the same priority, and in an ordinary line that is true. The emergency room gives patients different priorities on purpose, so fairness by arrival puts a critical patient behind milder cases. Week 11 makes the same point about interrupts: arrival order suffices until different interrupts have different priorities.
`
