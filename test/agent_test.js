QUnit.test('ThompsonAgent', function (assert) {
	// given a thompson sampling agent on a dispenser grid
	let cfg = config.environments.dispenser2;
	let env = new SimpleDispenserGrid(cfg);
	let options = new Options();
	options.getEnvParams(env);
	options.modelClass = env.makeModelClass();
	let agent = new ThompsonAgent(options);

	// after we move once
	let e;
	let a;
	e = env.generatePercept();
	a = agent.selectAction(e);
	env.perform(a);
	e = env.generatePercept();
	agent.update(a, e);

	// check that the model class, rho, and environment states all agree
	let x = env.pos.x;
	let y = env.pos.y;
	assert.equal(agent.rho.pos.x, x);
	assert.equal(agent.rho.pos.y, y);
	agent.model.modelClass.forEach(m => {
		assert.equal(m.pos.x, x);
		assert.equal(m.pos.y, y);
	});
});

QUnit.test('ThompsonSearch', function (assert) {
	let cfg = config.environments.dispenser2;
	let env = new SimpleDispenserGrid(cfg);
	let options = new Options();
	options.samples = 400;
	options.getEnvParams(env);
	options.modelClass = env.makeModelClass();
	agent = new ThompsonAgent(options);
	agent.rho = agent.model.modelClass[1].copy();

	let e = env.generatePercept();
	for (let i = 0; i < 100; i++) {
		agent.T = 1;
		let a = agent.selectAction(e);

		assert.equal(a, 1);
		if (a != 1) {
			break;
		}
	}
});
