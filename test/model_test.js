QUnit.test('DirichletModel', function (assert) {
	cfg = config.environments.dispenser2;
	env = new SimpleDispenserGrid(cfg);
	model = new DirichletModel(cfg);

	let a = 1;
	env.perform(a);
	let e = env.generatePercept();

	model.update(a, e);
	assert.equal(model.pos.x, env.pos.x);
	assert.equal(model.pos.y, env.pos.y);

});
