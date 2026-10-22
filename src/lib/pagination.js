/** Pack measured rows without splitting a line item across pages. */
export function paginateRows(heights, capacity, header, closing) {
  let startOfFinal = heights.length;
  let used = header + closing;
  while (startOfFinal > 0 && used + heights[startOfFinal - 1] <= capacity) {
    used += heights[--startOfFinal];
  }
  const pages = [];
  let current = [];
  used = header;
  for (let i = 0; i < startOfFinal; i++) {
    if (current.length && used + heights[i] > capacity) {
      pages.push(current);
      current = [];
      used = header;
    }
    current.push(i);
    used += heights[i];
  }
  if (current.length) pages.push(current);
  pages.push(heights.slice(startOfFinal).map((_, i) => startOfFinal + i));
  return pages;
}

