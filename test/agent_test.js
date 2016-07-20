QUnit.test('ThompsonAgent', function (assert) {
	let cfg = config.environments.dispenser2;

	let env = new SimpleDispenserGrid(cfg);
	let options = new Options();
	options.getEnvParams(env);
	options.modelClass = env.makeModelClass();
	let agent = new ThompsonAgent(options);

	let e;
	let a;
	e = env.generatePercept();
	a = agent.selectAction(e);
	env.perform(a);
	e = env.generatePercept();
	agent.update(a, e);

	let x = env.pos.x;
	let y = env.pos.y;

	assert.equal(agent.rho.pos.x, x);
	assert.equal(agent.rho.pos.y, y);
	agent.model.modelClass.forEach(m => {
		assert.equal(m.pos.x, x);
		assert.equal(m.pos.y, y);
	});
});
