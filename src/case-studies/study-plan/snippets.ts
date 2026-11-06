// SPEC.md §19.1: C++ / Java / Python for each operation, mapped to the pseudocode lines in ./pseudocode.ts.
// Java uses algs4 SeparateChainingHashST<String, Integer> for the index and an adjacency list that grows by one vertex
// per course, with descriptive names (ADR-014).
import { code } from '@/lib/snippets'
import type { OperationSnippets } from '@/types/step-engine'

const addCourse: OperationSnippets = {
  java: code([
    ['public void addCourse(String code) {', 1],
    ['    // contains hashes the code, then scans that one bucket', 2],
    ['    if (courseIndex.contains(code)) return;', 3],
    ['    int course = codes.size();', 4],
    ['    codes.add(code);', 4],
    ['    adjacent.add(new ArrayList<>());', 4],
    ['    courseIndex.put(code, course);', 5],
    '}',
  ]),
  cpp: code([
    ['void addCourse(const std::string& code) {', 1],
    ['    int index = hash(code);', 2],
    ['    for (auto& entry : buckets[index]) if (entry.code == code) return;', 3],
    ['    int course = codes.size();', 4],
    ['    codes.push_back(code);', 4],
    ['    adjacent.emplace_back();', 4],
    ['    buckets[index].push_back({code, course});', 5],
    '}',
  ]),
  python: code([
    ['def add_course(self, code):', 1],
    ['    index = self.hash(code)', 2],
    ['    if any(existing == code for existing, _ in self.buckets[index]):', 3],
    ['        return', 3],
    ['    course = len(self.codes)', 4],
    ['    self.codes.append(code)', 4],
    ['    self.adjacent.append([])', 4],
    ['    self.buckets[index].append((code, course))', 5],
  ]),
}

const addPrereq: OperationSnippets = {
  java: code([
    ['public void addPrerequisite(String before, String after) {', 1],
    ['    Integer beforeCourse = courseIndex.get(before);', 2],
    ['    Integer afterCourse = courseIndex.get(after);', 3],
    ['    if (beforeCourse == null || afterCourse == null || beforeCourse.equals(afterCourse)) return;', 4],
    ['    adjacent.get(beforeCourse).add(afterCourse);', 5],
    '}',
  ]),
  cpp: code([
    ['void addPrerequisite(const std::string& before, const std::string& after) {', 1],
    ['    int beforeCourse = get(before);   // -1 when missing', 2],
    ['    int afterCourse = get(after);', 3],
    ['    if (beforeCourse < 0 || afterCourse < 0 || beforeCourse == afterCourse) return;', 4],
    ['    adjacent[beforeCourse].push_back(afterCourse);', 5],
    '}',
  ]),
  python: code([
    ['def add_prerequisite(self, before, after):', 1],
    ['    before_course = self.get(before)   # None when missing', 2],
    ['    after_course = self.get(after)', 3],
    ['    if before_course is None or after_course is None or before_course == after_course:', 4],
    ['        return', 4],
    ['    self.adjacent[before_course].append(after_course)', 5],
  ]),
}

const planTopological: OperationSnippets = {
  java: code([
    ['public Iterable<String> buildPlan() {', 1],
    ['    for (int course = 0; course < codes.size(); course++)', 2],
    ['        if (!visited[course]) dfs(course);', 3],
    ['    return reversePostorder;   // a Stack<String>', 4],
    '}',
    ['private void dfs(int course) {', 5],
    ['    visited[course] = true; onStack[course] = true;', 6],
    ['    for (int dependent : adjacent.get(course)) {', 7],
    ['        if (onStack[dependent]) throw new IllegalStateException("cycle");', 8],
    ['        else if (!visited[dependent]) dfs(dependent);', 9],
    '    }',
    ['    onStack[course] = false;', 10],
    ['    reversePostorder.push(codes.get(course));', 10],
    '}',
  ]),
  cpp: code([
    ['std::vector<std::string> buildPlan() {', 1],
    ['    for (int course = 0; course < V; course++)', 2],
    ['        if (!visited[course]) dfs(course);', 3],
    ['    return {postorder.rbegin(), postorder.rend()};', 4],
    '}',
    ['void dfs(int course) {', 5],
    ['    visited[course] = onStack[course] = true;', 6],
    ['    for (int dependent : adjacent[course]) {', 7],
    ['        if (onStack[dependent]) throw std::runtime_error("cycle");', 8],
    ['        else if (!visited[dependent]) dfs(dependent);', 9],
    '    }',
    ['    onStack[course] = false;', 10],
    ['    postorder.push_back(codes[course]);', 10],
    '}',
  ]),
  python: code([
    ['def build_plan(self):', 1],
    ['    for course in range(len(self.codes)):', 2],
    ['        if not self.visited[course]: self.dfs(course)', 3],
    ['    return self.postorder[::-1]', 4],
    '',
    ['def dfs(self, course):', 5],
    ['    self.visited[course] = self.on_stack[course] = True', 6],
    ['    for dependent in self.adjacent[course]:', 7],
    ['        if self.on_stack[dependent]: raise ValueError("cycle")', 8],
    ['        elif not self.visited[dependent]: self.dfs(dependent)', 9],
    ['    self.on_stack[course] = False', 10],
    ['    self.postorder.append(self.codes[course])', 10],
  ]),
}

const planAlphabetical: OperationSnippets = {
  java: code([
    ['public int alphabeticalViolations(List<String> order) {', 1],
    ['    Collections.sort(order);', 2],
    '    int violations = 0;',
    ['    for (int course = 0; course < codes.size(); course++)', 3],
    ['        for (int dependent : adjacent.get(course))', 3],
    ['            if (order.indexOf(codes.get(dependent)) < order.indexOf(codes.get(course))) violations++;', 4],
    ['    return violations;', 5],
    '}',
  ]),
  cpp: code([
    ['int alphabeticalViolations(std::vector<std::string>& order) {', 1],
    ['    std::sort(order.begin(), order.end());', 2],
    '    int violations = 0;',
    ['    for (int course = 0; course < V; course++)', 3],
    ['        for (int dependent : adjacent[course])', 3],
    ['            if (positionOf(order, codes[dependent]) < positionOf(order, codes[course])) violations++;', 4],
    ['    return violations;', 5],
    '}',
  ]),
  python: code([
    ['def alphabetical_violations(self):', 1],
    ['    order = sorted(self.codes)', 2],
    '    violations = 0',
    ['    for course in range(len(self.codes)):', 3],
    ['        for dependent in self.adjacent[course]:', 3],
    ['            if order.index(self.codes[dependent]) < order.index(self.codes[course]):', 4],
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
