// SPEC.md §10.6: C++ / Java / Python for each operation, mapped to the pseudocode lines in ./pseudocode.ts.
// Java shows the three steps the reference names (declare, create, initialize); the C++ and Python
// forms are the practicum's equivalents, not idiomatic rewrites.
import { code } from '@/lib/snippets'
import type { OperationSnippets } from '@/types/step-engine'

const create: OperationSnippets = {
  java: code([
    ['int[] a;                    // declare', 1],
    ['a = new int[N];             // create: every slot is 0', 2],
    ['for (int i = 0; i < N; i++) // initialize', 3],
    ['    a[i] = values[i];', 3],
  ]),
  cpp: code([
    ['int* a;                     // declare', 1],
    ['a = new int[N]();           // create: every slot is 0', 2],
    ['for (int i = 0; i < N; i++) // initialize', 3],
    ['    a[i] = values[i];', 3],
  ]),
  python: code([
    ['# Python lists are not fixed-size arrays; array.array is the closest match.', 1],
    ["a = array('i', [0] * N)", 2],
    ['for i in range(N):', 3],
    ['    a[i] = values[i]', 3],
  ]),
}

const access: OperationSnippets = {
  java: code([
    ['int access(int[] a, int i) {', 1],
    ['    // Java checks the bounds itself and throws ArrayIndexOutOfBoundsException', 2],
    ['    if (i < 0 || i >= a.length) throw new ArrayIndexOutOfBoundsException(i);', 2],
    ['    return a[i];', 3],
    '}',
  ]),
  cpp: code([
    ['int access(int* a, int N, int i) {', 1],
    ['    // C does not check: an illegal index reads memory it does not own', 2],
    ['    if (i < 0 || i >= N) throw std::out_of_range("index");', 2],
    ['    return a[i];', 3],
    '}',
  ]),
  python: code([
    ['def access(a, i):', 1],
    ['    if i < 0 or i >= len(a):', 2],
    ['        raise IndexError(i)', 2],
    ['    return a[i]', 3],
  ]),
}

const set: OperationSnippets = {
  java: code([
    ['void set(int[] a, int i, int v) {', 1],
    ['    if (i < 0 || i >= a.length) throw new ArrayIndexOutOfBoundsException(i);', 2],
    ['    a[i] = v;', 3],
    '}',
  ]),
  cpp: code([
    ['void set(int* a, int N, int i, int v) {', 1],
    ['    if (i < 0 || i >= N) throw std::out_of_range("index");', 2],
    ['    a[i] = v;', 3],
    '}',
  ]),
  python: code([
    ['def set_value(a, i, v):', 1],
    ['    if i < 0 or i >= len(a):', 2],
    ['        raise IndexError(i)', 2],
    ['    a[i] = v', 3],
  ]),
}

const resize: OperationSnippets = {
  java: code([
    ['int[] resize(int[] a) {', 1],
    ['    int[] copy = new int[2 * a.length];', 2],
    ['    for (int i = 0; i < a.length; i++)', 3],
    ['        copy[i] = a[i];', 3],
    ['    return copy;   // the old array is garbage-collected once nothing refers to it', 4],
    '}',
  ]),
  cpp: code([
    ['int* resize(int* a, int N) {', 1],
    ['    int* copy = new int[2 * N]();', 2],
    ['    for (int i = 0; i < N; i++)', 3],
    ['        copy[i] = a[i];', 3],
    ['    delete[] a;    // C frees the old array by hand', 4],
    ['    return copy;', 4],
    '}',
  ]),
  python: code([
    ['def resize(a):', 1],
    ["    copy = array('i', [0] * (2 * len(a)))", 2],
    ['    for i in range(len(a)):', 3],
    ['        copy[i] = a[i]', 3],
    ['    return copy', 4],
  ]),
}

const memory: OperationSnippets = {
  java: code([
    ['// Typical 64-bit JVM, from the reference: 16 bytes of object overhead,', 1],
    ['// 4 bytes for the length, 4 bytes of padding, then 4 bytes per int.', 1],
    ['int header = 16 + 4 + 4;', 2],
    ['int bytes = header + 4 * N;', 3],
  ]),
  cpp: code([
    ['// A C array has no header: sizeof(int) * N bytes of values only.', 1],
    ['// The 24-byte header is the Java figure the reference quotes.', 1],
    ['int header = 24;', 2],
    ['int bytes = header + sizeof(int) * N;', 3],
  ]),
  python: code([
    ['# array.array carries its own header; the 24-byte figure is the Java one.', 1],
    ['header = 16 + 4 + 4', 2],
    ['nbytes = header + 4 * N', 3],
  ]),
}

export const arraysSnippets: Record<string, OperationSnippets> = { create, access, set, resize, memory }
