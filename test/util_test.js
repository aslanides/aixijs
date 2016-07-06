QUnit.test('Sample', function (assert) {
	{
		let weights = [0.4, 0.3, 0.3];
		let samples = [0, 0, 0];
		for (let i = 0; i < 10000; i++) {
			let s = Util.sample(weights);
			samples[s] += 1;
		}

		assert.ok(samples[0] > 3800 && samples[0] < 4200);
		assert.ok(samples[1] > 2800 && samples[1] < 3200);
		assert.ok(samples[2] > 2800 && samples[2] < 3200);
	}

	{
		let weights = [1];
		let s = Util.sample(weights);
		assert.equal(s, 0);
	}
});
