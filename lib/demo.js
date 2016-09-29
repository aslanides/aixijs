const demo = {
	ui: new UI(),

	run(noupdate, env) {
		this.noupdate = noupdate;

		// new: class defaults -> config -> ui
		// run: ui -> options -> env/agent

		let config = this.config;
		let options = {};
		options.agent = {
			modelParametrization: config.modelParametrization || 'goal', // TODO default somewhere
		};

		options.env = {};

		this.ui.getOptions(options.agent, 'agent');
		this.ui.getOptions(options.env, 'env');
		this.ui.updateConfig(options.env);

		if (this.vis) this.vis.remove();

		this.env = env ? env : new this.config.env(options.env);
		options.model = this.env.makeModel(options.modelParametrization);

		options.discount = GeometricDiscount;
		options.discountParams = { gamma: 0.99 }; // TODO fix

		options.numActions = this.env.numActions;
		options.min_reward = this.env.min_reward;
		options.max_reward = this.env.max_reward;

		if (config.env.mods) {
			config.env.mods(this.env);
		}

		this.agent = new this.config.agent(options.agent);

		if (config.agent.mods) {
			config.agent.mods(this.agent);
		}

		this.trace = new this.agent.tracer(options.cycles);

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
			if (this.config.vis) {
				this.vis = new this.config.vis(this.env, this.trace, this.ui);
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

	getDefaults(options) {
		let lst = [];
		for (let ptr = options.type; ptr; ptr = ptr.__proto__) {
			if (!ptr.params) {
				continue;
			}

			for (let p of ptr.params) {
				lst.push(p);
			}
		}

		for (let i = lst.length - 1; i >= 0; i--) {
			options[lst[i].field] = lst[i].value;
		}
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

	new(config) {
		if (this.vis) this.vis.pause();

		this.getDefaults(config.env);
		this.getDefaults(config.agent);

		this.ui.hide('picker');
		this.ui.show('setup');

		this.ui.clear();
		this.ui.push(config);

		let label = this.ui.getElementById('setup_label');
		label.innerText = `Setup: ${config.name}`;

		this.config = config;

		this.ui.clearExplanations();
		if (!config.vis.exps) return;
		for (let exp of config.vis.exps) {
			this.ui.showExplanation(exp);
		}

	},

	experiment(dems, runs, seed) {
		results = {};
		seed = seed || 'aixi';
		for (let config of dems) {
			Math.seedrandom(seed);
			logs = [];
			let env = null;
			this.new(config);
			for (let i = 0; i < runs; i++) {
				console.log(`Running ${config.agent.name} on ${config.env.name}: run ${i + 1} of ${runs}...`);
				if (i > 0) {
					env = new env.constructor(env.options);
					Gridworld.isSolvable(env); // TODO fix hack
					this.run(true, env);
				} else {
					this.run(true);
					env = this.env;
				}

				logs.push({
					rewards: Util.arrayCopy(this.trace.averageReward),
					explored: Util.arrayCopy(this.trace.explored),
					cfg: Util.deepCopy(this.env.options),
					agent: this.config.agent.name,
					cycles: this.trace.iter,
					runtime: this.trace.runtime,
					samples: this.agent.samples,
					horizon: this.agent.horizon,
					seed: seed,
					gamma: this.agent.gamma,
					epsilon: this.agent.epsilon,
				});
			}

			results[config.agent.name] = logs;
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
