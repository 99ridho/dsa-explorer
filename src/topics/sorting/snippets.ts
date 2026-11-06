// SPEC.md §10.9: C++ / Java / Python for each operation, mapped to the pseudocode lines in ./pseudocode.ts.
// The logic follows algs4 Selection, Insertion, and Shell (less and exch, here exchange), with descriptive names (ADR-014).
import { code } from '@/lib/snippets'
import type { OperationSnippets } from '@/types/step-engine'

const load: OperationSnippets = {
  java: code([['int[] items = values;', 2], ['int N = items.length;', 2]]),
  cpp: code([['std::vector<int> items = values;', 2], ['int N = items.size();', 2]]),
  python: code([['items = list(values)', 2], ['N = len(items)', 2]]),
}

const selection: OperationSnippets = {
  java: code([
    ['public static void sort(Comparable[] items) {', 1],
    ['    int N = items.length;', 1],
    ['    for (int i = 0; i < N; i++) {', 2],
    ['        int minIndex = i;', 3],
    ['        for (int j = i + 1; j < N; j++)', 4],
    ['            if (less(items[j], items[minIndex])) minIndex = j;', 5],
    ['        exchange(items, i, minIndex);', 6],
    '    }',
    '}',
  ]),
  cpp: code([
    ['void selectionSort(std::vector<int>& items) {', 1],
    ['    int N = items.size();', 1],
    ['    for (int i = 0; i < N; i++) {', 2],
    ['        int minIndex = i;', 3],
    ['        for (int j = i + 1; j < N; j++)', 4],
    ['            if (items[j] < items[minIndex]) minIndex = j;', 5],
    ['        std::swap(items[i], items[minIndex]);', 6],
    '    }',
    '}',
  ]),
  python: code([
    ['def selection_sort(items):', 1],
    ['    N = len(items)', 1],
    ['    for i in range(N):', 2],
    ['        min_index = i', 3],
    ['        for j in range(i + 1, N):', 4],
    ['            if items[j] < items[min_index]:', 5],
    ['                min_index = j', 5],
    ['        items[i], items[min_index] = items[min_index], items[i]', 6],
  ]),
}

const insertion: OperationSnippets = {
  java: code([
    ['public static void sort(Comparable[] items) {', 1],
    ['    int N = items.length;', 1],
    ['    for (int i = 1; i < N; i++) {', 2],
    ['        for (int j = i; j > 0; j--) {', 3],
    ['            if (less(items[j], items[j - 1])) exchange(items, j, j - 1);', 4],
    ['            else break;', 5],
    '        }',
    '    }',
    '}',
  ]),
  cpp: code([
    ['void insertionSort(std::vector<int>& items) {', 1],
    ['    int N = items.size();', 1],
    ['    for (int i = 1; i < N; i++) {', 2],
    ['        for (int j = i; j > 0; j--) {', 3],
    ['            if (items[j] < items[j - 1]) std::swap(items[j], items[j - 1]);', 4],
    ['            else break;', 5],
    '        }',
    '    }',
    '}',
  ]),
  python: code([
    ['def insertion_sort(items):', 1],
    ['    N = len(items)', 1],
    ['    for i in range(1, N):', 2],
    ['        for j in range(i, 0, -1):', 3],
    ['            if items[j] < items[j - 1]:', 4],
    ['                items[j], items[j - 1] = items[j - 1], items[j]', 4],
    ['            else:', 5],
    ['                break', 5],
  ]),
}

const shell: OperationSnippets = {
  java: code([
    ['public static void sort(Comparable[] items) {', 1],
    ['    int N = items.length;', 1],
    ['    int gap = 1;', 2],
    ['    while (gap < N / 3) gap = 3 * gap + 1;', 3],
    ['    while (gap >= 1) {', 4],
    ['        for (int i = gap; i < N; i++) {', 5],
    ['            for (int j = i; j >= gap; j -= gap) {', 6],
    ['                if (less(items[j], items[j - gap])) exchange(items, j, j - gap);', 7],
    ['                else break;', 8],
    '            }',
    '        }',
    ['        gap = gap / 3;', 9],
    '    }',
    '}',
  ]),
  cpp: code([
    ['void shellsort(std::vector<int>& items) {', 1],
    ['    int N = items.size();', 1],
    ['    int gap = 1;', 2],
    ['    while (gap < N / 3) gap = 3 * gap + 1;', 3],
    ['    while (gap >= 1) {', 4],
    ['        for (int i = gap; i < N; i++) {', 5],
    ['            for (int j = i; j >= gap; j -= gap) {', 6],
    ['                if (items[j] < items[j - gap]) std::swap(items[j], items[j - gap]);', 7],
    ['                else break;', 8],
    '            }',
    '        }',
    ['        gap = gap / 3;', 9],
    '    }',
    '}',
  ]),
  python: code([
    ['def shellsort(items):', 1],
    ['    N = len(items)', 1],
    ['    gap = 1', 2],
    ['    while gap < N // 3:', 3],
    ['        gap = 3 * gap + 1', 3],
    ['    while gap >= 1:', 4],
    ['        for i in range(gap, N):', 5],
    ['            j = i', 6],
    ['            while j >= gap:', 6],
    ['                if items[j] < items[j - gap]:', 7],
    ['                    items[j], items[j - gap] = items[j - gap], items[j]', 7],
    ['                else:', 8],
    ['                    break', 8],
    ['                j -= gap', 6],
    ['        gap = gap // 3', 9],
  ]),
}

export const sortingSnippets: Record<string, OperationSnippets> = {
  load,
  'selection-sort': selection,
  'insertion-sort': insertion,
  shellsort: shell,
}
