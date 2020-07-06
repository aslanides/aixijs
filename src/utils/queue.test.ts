import { Queue } from "./queue";

test('Queue is sane', () => {
  // Make a queue of arbitrary objects.
  const queue = new Queue<{a: number}>();
  expect(queue.empty()).toBe(true);

  // Now push an element.
  const x = {a: 3};
  queue.push(x);
  expect(queue.empty()).toBe(false);
  expect(queue.peek()).toBe(x);
  expect(queue.peekBack()).toBe(x);

  // Pop.
  const el = queue.pop();
  expect(el).toBe(x);
  expect(queue.empty()).toBe(true);
});
