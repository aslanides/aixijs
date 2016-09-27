const demo = {
	ui: new UI(),
	options: new Options(),
	config: {},

	run(noupdate, env) {
		this.noupdate = noupdate;
		this.ui.getOptions(this.options, 'agent');
		this.ui.getOptions(this.config, 'env');
		this.config = this.ui.getConfig(this.dem);

		if (!this.options || !this.dem) return;
		if (this.vis) this.vis.remove();

		this.env = env ? env : new this.dem.env(this.config);
		if (!this.dem.params.env) {
			this.dem.params.env = {};
		}

		if (!this.dem.params.agent) {
			this.dem.params.agent = {};
		}

		if (this.dem.params.env.mods) {
			this.dem.params.env.mods(this.env);
		}

		this.options.getDemoParams(this.dem);
		this.options.getEnvParams(this.env);

		this.agent = new this.dem.agent(this.options);

		if (this.dem.params.agent.mods) {
			this.dem.params.agent.mods(this.agent);
		}

		this.trace = new this.agent.tracer(this.options.cycles);

		this.plots = [];
		Plot.clearAll();
		for (let P of this.trace.plots) {
			this.plots.push(new P(this.trace));
		}

		for (let P of this.env.plots) {
			this.plots.push(new P(this.trace));
		}

		let update = trace => {
			for (let p of this.plots) {
				p.dataUpdate(trace);
			}
		};

		let callback = _ => {
			this.ui.end();
			if (this.dem.vis) {
				this.vis = new this.dem.vis(this.env, this.trace, this.ui);
				this.vis.reset();
			}

			this.cancel = false;
			let frames = this.trace.iter;
			let second = Util.roundTo((performance.now() - this.t0) / 1000, 4);
			let fps = Util.roundTo(frames / second, 2);
			this.trace.runtime = second;
			this.trace.fps = fps;
			console.log(`${frames} cycles, ${second} seconds (${fps} fps)`);
		};

		this.ui.start();
		this.t0 = performance.now();
		this.simulate(update, callback);
	},

	simulate(update, callback) {
		let trace = this.trace;
		let agent = this.agent;
		let env = this.env;

		let e = env.generatePercept();
		let a = env.noop;

		trace.log(agent, env, a, e);
		agent.update(a, e);

		let cycle = _ => {
			trace.log(agent, env, a, e);
			a = agent.selectAction(e);
			env.perform(a);
			e = env.generatePercept();
			agent.update(a, e);
		};

		let loop;
		if (this.noupdate) {
			loop = _ => {
				while (true) {
					if (trace.iter >= trace.t || this.cancel) {
						callback();
						break;
					}

					cycle();
				}
			};
		} else {
			loop = _ => {
				if (trace.iter >= trace.t || this.cancel) {
					callback();
					return;
				}

				cycle();
				update(trace);
				setTimeout(loop, 0);
			};
		}

		loop();
	},

	stop() {
		this.cancel = true;
	},

	reset() {
		if (this.vis) this.vis.remove();
		this.ui.end();
		this.ui.hide('navigation');
		this.ui.hide('plots');
		this.ui.show('picker');
		this.ui.hide('setup');
	},

	new(dem) {
		if (this.vis) this.vis.pause();

		Util.assert(dem);
		this.dem = dem;
		this.ui.hide('picker');
		this.ui.show('setup');
		this.ui.clearParams();
		this.ui.getDefaultParams('env', dem.env);
		this.ui.getDefaultParams('agent', dem.agent);
		this.ui.getDemoParams(dem.params);
		this.ui.showParams();
		this.ui.clearExplanations();
		if (!dem.vis.exps) return;
		for (let exp of dem.vis.exps) {
			this.ui.showExplanation(exp);
		}
	},

	experiment(dems, runs, seed) {
		results = {};
		seed = seed || 'aixi';
		for (let dem of dems) {
			Math.seedrandom(seed);
			logs = [];
			let env = null;
			this.new(dem);
			for (let i = 0; i < runs; i++) {
				console.log(`Running ${dem.agent.name} on ${dem.env.name}: run ${i + 1} of ${runs}...`);
				if (i > 0) {
					env = new env.constructor(env.config);
					Gridworld.isSolvable(env);
					this.run(true, env);
				} else {
					this.run(true);
					env = this.env;
				}

				logs.push({
					rewards: Util.arrayCopy(this.trace.averageReward),
					explored: Util.arrayCopy(this.trace.explored),
					cfg: Util.deepCopy(this.env.config),
					agent: this.dem.agent.name,
					cycles: this.trace.iter,
					runtime: this.trace.runtime,
					samples: this.agent.samples,
					horizon: this.agent.horizon,
					seed: seed,
					gamma: this.agent.gamma,
					epsilon: this.agent.epsilon,
				});
			}

			results[dem.agent.name] = logs;
		}

		console.log('Done!');

		let json = JSON.stringify(results);
		let blob = new Blob([json], { type: 'application/json' });

		let a = document.createElement('a');
		a.download = 'results.json';
		a.href = URL.createObjectURL(blob);
		a.textContent = 'Download results.json';
		document.body.appendChild(a);

		return results;
	},
};
