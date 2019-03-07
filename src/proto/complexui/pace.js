async function paceAsync(name, target, callback) {
  const nameEnd = `${name}-end`;
  const nameStart = `${name}-start`;
  performance.mark(nameStart);
  const result = await target();
  performance.mark(nameEnd);
  performance.measure(name, nameStart, nameEnd);
  const perf = performance.getEntriesByName(name)[0];
  callback(result, perf);
  return
}