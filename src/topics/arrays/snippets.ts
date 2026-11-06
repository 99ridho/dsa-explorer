// SPEC.md §10.6: C++ / Java / Python for each operation, mapped to the pseudocode lines in ./pseudocode.ts.
// Java shows the three steps the reference names (declare, create, initialize); the C++ and Python
// forms are the practicum's equivalents, not idiomatic rewrites.
import { code } from '@/lib/snippets'
import type { OperationSnippets } from '@/types/step-engine'

const create: OperationSnippets = {
  java: code([
    ['int[] items;                // declare', 1],
    ['items = new int[N];         // create: every slot is 0', 2],
    ['for (int i = 0; i < N; i++) // initialize', 3],
    ['    items[i] = values[i];', 3],
  ]),
  cpp: code([
    ['int* items;                 // declare', 1],
    ['items = new int[N]();       // create: every slot is 0', 2],
    ['for (int i = 0; i < N; i++) // initialize', 3],
    ['    items[i] = values[i];', 3],
  ]),
  python: code([
    ['# Python lists are not fixed-size arrays; array.array is the closest match.', 1],
    ["items = array('i', [0] * N)", 2],
    ['for i in range(N):', 3],
    ['    items[i] = values[i]', 3],
  ]),
}

const access: OperationSnippets = {
  java: code([
    ['int access(int[] items, int index) {', 1],
    ['    // Java checks the bounds itself and throws ArrayIndexOutOfBoundsException', 2],
    ['    if (index < 0 || index >= items.length) throw new ArrayIndexOutOfBoundsException(index);', 2],
    ['    return items[index];', 3],
    '}',
  ]),
  cpp: code([
    ['int access(int* items, int N, int index) {', 1],
    ['    // C does not check: an illegal index reads memory it does not own', 2],
    ['    if (index < 0 || index >= N) throw std::out_of_range("index");', 2],
    ['    return items[index];', 3],
    '}',
  ]),
  python: code([
    ['def access(items, index):', 1],
    ['    if index < 0 or index >= len(items):', 2],
    ['        raise IndexError(index)', 2],
    ['    return items[index]', 3],
  ]),
}

const set: OperationSnippets = {
  java: code([
    ['void set(int[] items, int index, int value) {', 1],
    ['    if (index < 0 || index >= items.length) throw new ArrayIndexOutOfBoundsException(index);', 2],
    ['    items[index] = value;', 3],
    '}',
  ]),
  cpp: code([
    ['void set(int* items, int N, int index, int value) {', 1],
    ['    if (index < 0 || index >= N) throw std::out_of_range("index");', 2],
    ['    items[index] = value;', 3],
    '}',
  ]),
  python: code([
    ['def set_value(items, index, value):', 1],
    ['    if index < 0 or index >= len(items):', 2],
    ['        raise IndexError(index)', 2],
    ['    items[index] = value', 3],
  ]),
}

const resize: OperationSnippets = {
  java: code([
    ['int[] resize(int[] items) {', 1],
    ['    int[] resized = new int[2 * items.length];', 2],
    ['    for (int i = 0; i < items.length; i++)', 3],
    ['        resized[i] = items[i];', 3],
    ['    return resized;   // the old array is garbage-collected once nothing refers to it', 4],
    '}',
  ]),
  cpp: code([
    ['int* resize(int* items, int N) {', 1],
    ['    int* resized = new int[2 * N]();', 2],
    ['    for (int i = 0; i < N; i++)', 3],
    ['        resized[i] = items[i];', 3],
    ['    delete[] items;   // C frees the old array by hand', 4],
    ['    return resized;', 4],
    '}',
  ]),
  python: code([
    ['def resize(items):', 1],
    ["    resized = array('i', [0] * (2 * len(items)))", 2],
    ['    for i in range(len(items)):', 3],
    ['        resized[i] = items[i]', 3],
    ['    return resized', 4],
  ]),
}

const memory: OperationSnippets = {
  java: code([
    ['// Typical 64-bit JVM, from the reference: 16 bytes of object overhead,', 1],
    ['// 4 bytes for the length, 4 bytes of padding, then 4 bytes per int.', 1],
    ['int header = 16 + 4 + 4;', 2],
    ['int totalBytes = header + 4 * N;', 3],
  ]),
  cpp: code([
    ['// A C array has no header: sizeof(int) * N bytes of values only.', 1],
    ['// The 24-byte header is the Java figure the reference quotes.', 1],
    ['int header = 24;', 2],
    ['int totalBytes = header + sizeof(int) * N;', 3],
  ]),
  python: code([
    ['# array.array carries its own header; the 24-byte figure is the Java one.', 1],
    ['header = 16 + 4 + 4', 2],
    ['total_bytes = header + 4 * N', 3],
  ]),
}

export const arraysSnippets: Record<string, OperationSnippets> = { create, access, set, resize, memory }
