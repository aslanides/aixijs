QUnit.test('BayesMixtureUpdates', function (assert) {
	// given an informed bayes mixture
	let cfg = config.test.dispenser;
	let M = Gridworld.modelClass(SimpleDispenserGrid, cfg);
	let truth = 5;
	let model = new BayesMixture({ modelClass: M, priorType: 'Informed', mu: 5 });

	// and given corresponding ground truth environment
	cfg.goal_pos = { x: 2, y: 1 };
	let env = new SimpleDispenserGrid(cfg);

	// then as we move around and update, our model should be consistent with
	// the environment
	model.save();
	let actions = [0, 1, 2, 3, 4];
	for (let i = 0; i < 1e2; i++) {
		let a = Util.randomChoice(actions);
		let or = Test.perform(env, a);
		try {
			model.update(a, or);
			assert.deepEqual(env.pos, model.modelClass[truth].pos);
		} catch (e) {
			console.error(e);
			assert.ok(false);
			break;
		}
	}

	// when we load the saved model
	model.load();

	// then we should retrieve the original model state
	for (let i = 0; i < model.C; i++) {
		assert.deepEqual(model.modelClass[i].pos.x, 0);
		assert.deepEqual(model.modelClass[i].pos.y, 0);
	}

	// final sanity checks: normalization, etc
	assert.equal(model.weights[truth], 1);
	assert.equal(Util.sum(model.weights), 1);
});

QUnit.test('BayesMixtureSamples', function (assert) {
	let options = {
		modelClass: Gridworld.modelClass(SimpleDispenserGrid, config.test.dispenser),
		mu: 5,
		numActions: 5,
		priorType: 'Informed',
	};
	let model = new BayesMixture(options);
	let percept;
	assert.equal(model.weights[options.mu], 1);
	for (let i = 0; i < 100; i++) {
		percept = Test.perform(model, 4); // noop
		assert.equal(percept.rew, config.rewards.move);
	}

	let percept = Test.perform(model, 1); // right
	assert.equal(percept.rew, config.rewards.move);
	let percept = Test.perform(model, 3); // down
	assert.equal(percept.rew, config.rewards.move);
	let percept = Test.perform(model, 1); // right
	assert.equal(percept.rew, config.rewards.chocolate + config.rewards.move);
	for (let i = 0; i < 100; i++) {
		percept = Test.perform(model, 4); // noop
		assert.equal(percept.rew, config.rewards.chocolate + config.rewards.move);
	}

	assert.equal(model.xi(percept), 1);
});

QUnit.test('BayesMixtureCopy', function (assert) {
	let options = {
		modelClass: Gridworld.modelClass(SimpleDispenserGrid, config.environments.dispenser2),
		mu: 5,
		numActions: 5,
		priorType: 'Informed',
	};
	let model = new BayesMixture(options);
	let idx = Util.sample(model.weights);
	let rho = model.modelClass[idx].copy();
	rho.perform(1);
	assert.equal(rho.pos.x, 1);
	assert.equal(model.modelClass[idx].pos.x, 0);
});
