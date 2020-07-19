import { generateRandom, makeModel } from "../environments/gridworld";
import * as util from "../utils/util";


test('Sanity check.', () => {
  const options = {
    size: 10,
    statePercepts: false,
    goalFreqs: [1, 1],  // Deterministic!
  };
  const env = generateRandom(options);
  const model = makeModel(env, 'mu');
  
  // Step environment and model 1000 times with random actions.
  for (let i = 0; i < 1000; i++) {
    const action = util.randi(0, env.numActions);
    env.perform(action);
    model.perform(action);
    expect(env.generatePercept()).toStrictEqual(model.generatePercept());
  }
});