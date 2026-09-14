// Hand-written case study copy (SPEC.md §19.0), not generated. Every cost or property it states
// is quoted from the week reference it names; the scenario itself is illustrative.

export const scenario = `## The problem

*Illustrative scenario, not taken from the course references.* A campus canteen takes orders at one counter. Each order gets the next number, starting at 101, and waits until the kitchen cooks it. When the kitchen finishes an order, the number goes into a log of served orders for the day. A student standing at the pickup shelf can ask whether their number has been served yet.

## What the counter has to do

1. Take a new order at any time, with no limit known in advance on how many will wait during lunch.
2. Serve the order that has waited longest, because that is what the students in line expect.
3. Keep every served number for the day.
4. Answer "has order 117 been served?" quickly, even late in a busy day.

## Try it in the simulator

With the Queue design, run Serve next twice. The first serve takes order 104 from the front and fills the log's last free slot, so the second serve doubles the log to 8 slots before order 105 goes in. Then find order 101 and follow binary search as it halves the log.

Switch the design to Stack. The same morning already shows skipped = 3: the kitchen served 103, 102, and 104 while order 101 was still waiting. Serve next once more and the count grows. Find order 104 and watch the search read the log from the start, because the log is no longer in number order.
`

export const reasoning = `## One design choice pays twice

Choosing a queue for fairness has a second effect. Order numbers only grow, and a queue serves them in the order they were given, so the log comes out sorted with no extra work. Week 7 charges an ordered array for keeping its order, about 2N array accesses per insertion, because larger keys have to shift. Here every new number is the largest so far, so nothing ever shifts and the log gets binary search for free.

## How the naive counter fails

A stack is the right structure for undo or a browser's back button (Week 4), where the newest item should come out first. At a counter it serves the newest order first, which breaks the one rule customers care about, and it scrambles the log. Sequential search still works on a scrambled log, but it can read every entry, and Week 1's question is exactly whether a program keeps working as the input grows.

Sorting the scrambled log before each search would also work, and Week 1 shows the same move turning 2-sum from N² into N log N. The queue design simply never needs that sort.
`
