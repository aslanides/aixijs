import {Gridworld, generateRandom} from "./gridworld";

function makeTestEnv() {
  const options = {
    statePercepts: false,
    map: [
      ['F', 'W', 'C'],
      ['F', 'W', 'F'],
      ['F', 'F', 'F'],
    ],
    goals: [{x: 2, y: 0, freq: 1}],
  };
  return new Gridworld(options);
}

test('Initial state sanity check.', () => {
  const env = makeTestEnv();
  expect(env.getState()).toStrictEqual({x: 0, y: 0});
});

test('Percepts and dynamics.', () => {
  const env = makeTestEnv();
  expect(env.generatePercept()).toStrictEqual({'obs': 1110, rew: Gridworld.rewards.empty + Gridworld.rewards.move});
  env.perform(4);  // No-op
  expect(env.generatePercept()).toStrictEqual({'obs': 1110, rew: Gridworld.rewards.empty + Gridworld.rewards.move});
  env.perform(3);  // Down
  expect(env.generatePercept()).toStrictEqual({'obs': 1100, rew: Gridworld.rewards.empty + Gridworld.rewards.move});
  env.perform(1);  // Right
  expect(env.generatePercept()).toStrictEqual({'obs': 1100, rew: Gridworld.rewards.wall + Gridworld.rewards.move});
  env.perform(3);  // Down
  expect(env.generatePercept()).toStrictEqual({'obs': 1001, rew: Gridworld.rewards.empty + Gridworld.rewards.move});
  env.perform(1);  // Right
  expect(env.generatePercept()).toStrictEqual({'obs': 11, rew: Gridworld.rewards.empty + Gridworld.rewards.move});
  env.perform(1);  // Right
  expect(env.generatePercept()).toStrictEqual({'obs': 101, rew: Gridworld.rewards.empty + Gridworld.rewards.move});
  env.perform(2);  // Up
  expect(env.generatePercept()).toStrictEqual({'obs': 1100, rew: Gridworld.rewards.empty + Gridworld.rewards.move});
  env.perform(2);  // Up
  expect(env.generatePercept()).toStrictEqual({'obs': 1110, rew: Gridworld.rewards.chocolate + Gridworld.rewards.move});
});

test('Random initialisation', () => {
  const options = {
    wallProb: 0,
    size: 10,
    statePercepts: false,
    goalFreqs: [0.5],
  };
  const env = generateRandom(options);
  expect(env.validate()).toBe(true);
});