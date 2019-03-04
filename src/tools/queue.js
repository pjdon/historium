function Queue(initial=[]) {
  /* Wrapper over Array class to facilitate easier input/output of arrays.
  `push` and `unshift` expect array parameters while `shift` and `pop` expect
  a parameter `n` representing the number of items to return from the queue.
  */
  const data = initial;

  function push(items) {
    return data.push(...items);
  }
  function unshift(items) {
    return data.unshift(...items);
  }
  function shift(n=1) {
    return data.splice(0, n);
  }
  function pop(n=1) {
    return data.splice(data.length-n);
  }

  this.push = push;
  this.unshift = unshift;
  this.shift = shift;
  this.pop = pop;
  this.get = () => data;
}

