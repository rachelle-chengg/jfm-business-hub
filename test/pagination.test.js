import test from 'node:test';
import assert from 'node:assert/strict';
import { paginateRows } from '../src/lib/pagination.js';

test('keeps a short invoice and closing block on one page', () => {
  assert.deepEqual(paginateRows([48,48,48], 430, 40, 220), [[0,1,2]]);
});
test('reserves space for closing block, retaining every row in order', () => {
  const heights = Array.from({length:20}, () => 48);
  const pages = paginateRows(heights, 430, 40, 220);
  assert.deepEqual(pages.flat(), heights.map((_,i) => i));
  pages.forEach((indices, i) => {
    assert.ok(40 + indices.reduce((sum, index) => sum + heights[index], 0) + (i === pages.length - 1 ? 220 : 0) <= 430);
  });
});
test('moves a long indivisible row before a closing-only page', () => {
  assert.deepEqual(paginateRows([300], 430, 40, 220), [[0], []]);
});
test('preserves an oversized row for the layout validator to flag', () => {
  assert.deepEqual(paginateRows([900], 430, 40, 220), [[0], []]);
});
test('handles an exact final-page boundary and an empty invoice', () => {
  assert.deepEqual(paginateRows([85,85], 430, 40, 220), [[0,1]]);
  assert.deepEqual(paginateRows([], 430, 40, 220), [[]]);
});
