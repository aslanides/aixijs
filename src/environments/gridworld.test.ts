import { Gridworld } from "./gridworld"

function makeTestEnv() {
  const options = {
    statePercepts: false,
    map: [
      ['F', 'W', 'C'],
      ['F', 'W', 'F'],
      ['F', 'F', 'F'],
    ],
    goals: [{x: 2, y: 0, freq: 1}],
  }
  return new Gridworld(options)
}

test('Gridworld sanity check.', () => {
  const env = makeTestEnv()
  expect(env.getState()).toStrictEqual({x: 0, y: 0})
})