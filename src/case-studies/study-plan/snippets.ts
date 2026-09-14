// SPEC.md §19.1: C++ / Java / Python for each operation, mapped to the pseudocode lines in ./pseudocode.ts.
// Java uses algs4 SeparateChainingHashST<String, Integer> for the index and an adjacency list that grows by one vertex per course.
import { code } from '@/lib/snippets'
import type { OperationSnippets } from '@/types/step-engine'

const addCourse: OperationSnippets = {
  java: code([
    ['public void addCourse(String code) {', 1],
    ['    // contains hashes the code, then scans that one bucket', 2],
    ['    if (st.contains(code)) return;', 3],
    ['    int v = keys.size();', 4],
    ['    keys.add(code);', 4],
    ['    adj.add(new ArrayList<>());', 4],
    ['    st.put(code, v);', 5],
    '}',
  ]),
  cpp: code([
    ['void addCourse(const std::string& code) {', 1],
    ['    int i = hash(code);', 2],
    ['    for (auto& e : bucket[i]) if (e.code == code) return;', 3],
    ['    int v = keys.size();', 4],
    ['    keys.push_back(code);', 4],
    ['    adj.emplace_back();', 4],
    ['    bucket[i].push_back({code, v});', 5],
    '}',
  ]),
  python: code([
    ['def add_course(self, code):', 1],
    ['    i = self.hash(code)', 2],
    ['    if any(c == code for c, _ in self.bucket[i]):', 3],
    ['        return', 3],
    ['    v = len(self.keys)', 4],
    ['    self.keys.append(code)', 4],
    ['    self.adj.append([])', 4],
    ['    self.bucket[i].append((code, v))', 5],
  ]),
}

const addPrereq: OperationSnippets = {
  java: code([
    ['public void addPrerequisite(String before, String after) {', 1],
    ['    Integer v = st.get(before);', 2],
    ['    Integer w = st.get(after);', 3],
    ['    if (v == null || w == null || v.equals(w)) return;', 4],
    ['    adj.get(v).add(w);', 5],
    '}',
  ]),
  cpp: code([
    ['void addPrerequisite(const std::string& before, const std::string& after) {', 1],
    ['    int v = get(before);   // -1 when missing', 2],
    ['    int w = get(after);', 3],
    ['    if (v < 0 || w < 0 || v == w) return;', 4],
    ['    adj[v].push_back(w);', 5],
    '}',
  ]),
  python: code([
    ['def add_prerequisite(self, before, after):', 1],
    ['    v = self.get(before)   # None when missing', 2],
    ['    w = self.get(after)', 3],
    ['    if v is None or w is None or v == w:', 4],
    ['        return', 4],
    ['    self.adj[v].append(w)', 5],
  ]),
}

const planTopological: OperationSnippets = {
  java: code([
    ['public Iterable<String> buildPlan() {', 1],
    ['    for (int v = 0; v < keys.size(); v++)', 2],
    ['        if (!marked[v]) dfs(v);', 3],
    ['    return reversePostorder;   // a Stack<String>', 4],
    '}',
    ['private void dfs(int v) {', 5],
    ['    marked[v] = true; onStack[v] = true;', 6],
    ['    for (int w : adj.get(v)) {', 7],
    ['        if (onStack[w]) throw new IllegalStateException("cycle");', 8],
    ['        else if (!marked[w]) dfs(w);', 9],
    '    }',
    ['    onStack[v] = false;', 10],
    ['    reversePostorder.push(keys.get(v));', 10],
    '}',
  ]),
  cpp: code([
    ['std::vector<std::string> buildPlan() {', 1],
    ['    for (int v = 0; v < V; v++)', 2],
    ['        if (!marked[v]) dfs(v);', 3],
    ['    return {postorder.rbegin(), postorder.rend()};', 4],
    '}',
    ['void dfs(int v) {', 5],
    ['    marked[v] = onStack[v] = true;', 6],
    ['    for (int w : adj[v]) {', 7],
    ['        if (onStack[w]) throw std::runtime_error("cycle");', 8],
    ['        else if (!marked[w]) dfs(w);', 9],
    '    }',
    ['    onStack[v] = false;', 10],
    ['    postorder.push_back(keys[v]);', 10],
    '}',
  ]),
  python: code([
    ['def build_plan(self):', 1],
    ['    for v in range(len(self.keys)):', 2],
    ['        if not self.marked[v]: self.dfs(v)', 3],
    ['    return self.postorder[::-1]', 4],
    '',
    ['def dfs(self, v):', 5],
    ['    self.marked[v] = self.on_stack[v] = True', 6],
    ['    for w in self.adj[v]:', 7],
    ['        if self.on_stack[w]: raise ValueError("cycle")', 8],
    ['        elif not self.marked[w]: self.dfs(w)', 9],
    ['    self.on_stack[v] = False', 10],
    ['    self.postorder.append(self.keys[v])', 10],
  ]),
}

const planAlphabetical: OperationSnippets = {
  java: code([
    ['public int alphabeticalViolations(List<String> order) {', 1],
    ['    Collections.sort(order);', 2],
    '    int violations = 0;',
    ['    for (int v = 0; v < keys.size(); v++)', 3],
    ['        for (int w : adj.get(v))', 3],
    ['            if (order.indexOf(keys.get(w)) < order.indexOf(keys.get(v))) violations++;', 4],
    ['    return violations;', 5],
    '}',
  ]),
  cpp: code([
    ['int alphabeticalViolations(std::vector<std::string>& order) {', 1],
    ['    std::sort(order.begin(), order.end());', 2],
    '    int violations = 0;',
    ['    for (int v = 0; v < V; v++)', 3],
    ['        for (int w : adj[v])', 3],
    ['            if (pos(order, keys[w]) < pos(order, keys[v])) violations++;', 4],
    ['    return violations;', 5],
    '}',
  ]),
  python: code([
    ['def alphabetical_violations(self):', 1],
    ['    order = sorted(self.keys)', 2],
    '    violations = 0',
    ['    for v in range(len(self.keys)):', 3],
    ['        for w in self.adj[v]:', 3],
    ['            if order.index(self.keys[w]) < order.index(self.keys[v]):', 4],
    ['                violations += 1', 4],
    ['    return violations', 5],
  ]),
}

export const studyPlanSnippets: Record<string, OperationSnippets> = {
  'add-course': addCourse,
  'add-prereq': addPrereq,
  'plan-topological': planTopological,
  'plan-alphabetical': planAlphabetical,
}
