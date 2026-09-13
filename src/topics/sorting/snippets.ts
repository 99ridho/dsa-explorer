// SPEC.md §10.9: C++ / Java / Python for each operation, mapped to the pseudocode lines in ./pseudocode.ts.
// Java follows algs4 Selection, Insertion, and Shell (less/exch); C++ and Python are direct translations.
import { code } from '@/lib/snippets'
import type { OperationSnippets } from '@/types/step-engine'

const load: OperationSnippets = {
  java: code([['int[] a = values;', 2], ['int N = a.length;', 2]]),
  cpp: code([['std::vector<int> a = values;', 2], ['int N = a.size();', 2]]),
  python: code([['a = list(values)', 2], ['N = len(a)', 2]]),
}

const selection: OperationSnippets = {
  java: code([
    ['public static void sort(Comparable[] a) {', 1],
    ['    int N = a.length;', 1],
    ['    for (int i = 0; i < N; i++) {', 2],
    ['        int min = i;', 3],
    ['        for (int j = i + 1; j < N; j++)', 4],
    ['            if (less(a[j], a[min])) min = j;', 5],
    ['        exch(a, i, min);', 6],
    '    }',
    '}',
  ]),
  cpp: code([
    ['void selectionSort(std::vector<int>& a) {', 1],
    ['    int N = a.size();', 1],
    ['    for (int i = 0; i < N; i++) {', 2],
    ['        int min = i;', 3],
    ['        for (int j = i + 1; j < N; j++)', 4],
    ['            if (a[j] < a[min]) min = j;', 5],
    ['        std::swap(a[i], a[min]);', 6],
    '    }',
    '}',
  ]),
  python: code([
    ['def selection_sort(a):', 1],
    ['    N = len(a)', 1],
    ['    for i in range(N):', 2],
    ['        m = i', 3],
    ['        for j in range(i + 1, N):', 4],
    ['            if a[j] < a[m]:', 5],
    ['                m = j', 5],
    ['        a[i], a[m] = a[m], a[i]', 6],
  ]),
}

const insertion: OperationSnippets = {
  java: code([
    ['public static void sort(Comparable[] a) {', 1],
    ['    int N = a.length;', 1],
    ['    for (int i = 1; i < N; i++) {', 2],
    ['        for (int j = i; j > 0; j--) {', 3],
    ['            if (less(a[j], a[j-1])) exch(a, j, j-1);', 4],
    ['            else break;', 5],
    '        }',
    '    }',
    '}',
  ]),
  cpp: code([
    ['void insertionSort(std::vector<int>& a) {', 1],
    ['    int N = a.size();', 1],
    ['    for (int i = 1; i < N; i++) {', 2],
    ['        for (int j = i; j > 0; j--) {', 3],
    ['            if (a[j] < a[j-1]) std::swap(a[j], a[j-1]);', 4],
    ['            else break;', 5],
    '        }',
    '    }',
    '}',
  ]),
  python: code([
    ['def insertion_sort(a):', 1],
    ['    N = len(a)', 1],
    ['    for i in range(1, N):', 2],
    ['        for j in range(i, 0, -1):', 3],
    ['            if a[j] < a[j-1]:', 4],
    ['                a[j], a[j-1] = a[j-1], a[j]', 4],
    ['            else:', 5],
    ['                break', 5],
  ]),
}

const shell: OperationSnippets = {
  java: code([
    ['public static void sort(Comparable[] a) {', 1],
    ['    int N = a.length;', 1],
    ['    int h = 1;', 2],
    ['    while (h < N/3) h = 3*h + 1;', 3],
    ['    while (h >= 1) {', 4],
    ['        for (int i = h; i < N; i++) {', 5],
    ['            for (int j = i; j >= h; j -= h) {', 6],
    ['                if (less(a[j], a[j-h])) exch(a, j, j-h);', 7],
    ['                else break;', 8],
    '            }',
    '        }',
    ['        h = h/3;', 9],
    '    }',
    '}',
  ]),
  cpp: code([
    ['void shellsort(std::vector<int>& a) {', 1],
    ['    int N = a.size();', 1],
    ['    int h = 1;', 2],
    ['    while (h < N/3) h = 3*h + 1;', 3],
    ['    while (h >= 1) {', 4],
    ['        for (int i = h; i < N; i++) {', 5],
    ['            for (int j = i; j >= h; j -= h) {', 6],
    ['                if (a[j] < a[j-h]) std::swap(a[j], a[j-h]);', 7],
    ['                else break;', 8],
    '            }',
    '        }',
    ['        h = h/3;', 9],
    '    }',
    '}',
  ]),
  python: code([
    ['def shellsort(a):', 1],
    ['    N = len(a)', 1],
    ['    h = 1', 2],
    ['    while h < N // 3:', 3],
    ['        h = 3 * h + 1', 3],
    ['    while h >= 1:', 4],
    ['        for i in range(h, N):', 5],
    ['            j = i', 6],
    ['            while j >= h:', 6],
    ['                if a[j] < a[j-h]:', 7],
    ['                    a[j], a[j-h] = a[j-h], a[j]', 7],
    ['                else:', 8],
    ['                    break', 8],
    ['                j -= h', 6],
    ['        h = h // 3', 9],
  ]),
}

export const sortingSnippets: Record<string, OperationSnippets> = {
  load,
  'selection-sort': selection,
  'insertion-sort': insertion,
  shellsort: shell,
}
