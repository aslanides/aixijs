import {QTable} from './qtable';

test('Set and get works as expected.', () => {
  const qtable = new QTable(0, 5);
  qtable.set(1, 1, 7);
  const q = qtable.get(1, 1);
  expect(q).toBe(7);
});

test('Copy works as expected.', () => {
  const qtable = new QTable(0, 3);
  qtable.set(1, 1, 3);
  const newQTable = qtable.copy();
  const q = newQTable.get(1, 1);
  expect(q).toBe(3);
});
