QUnit.test('GridModel', function (assert) {
	let cfg = config.environments.dispenser2;
	let model = new Model(cfg);
	model.perform(1);
	assert.equal(model.env.pos, model.env.grid[1][0]);
	for (let i = 0; i < 100; i++) {
		let e = model.generatePercept();
		model.perform(4);
		let p = model.conditionalDistribution(e);
		model.update(4, e);
	}

});
