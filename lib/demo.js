const demo = {
	ui: new UI(),
	options: new Options(),
	config: {},

	run() {
		this.ui.getOptions(this.options, 'agent');
		this.ui.getOptions(this.config, 'env');
		this.config = this.ui.getConfig(this.dem);

		if (!this.options || !this.dem) return;
		if (this.vis) this.vis.remove();

		this.env = new this.dem.env(this.config);

		this.options.getDemoParams(this.dem);
		this.options.getEnvParams(this.env);

		this.agent = new this.dem.agent(this.options);
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

		let loop = _ => {
			if (trace.iter >= trace.t || this.cancel) {
				callback();
				return;
			}

			trace.log(agent, env, a, e);
			a = agent.selectAction(e);
			env.perform(a);
			e = env.generatePercept();
			agent.update(a, e);

			update(trace);

			setTimeout(loop, 0);
		};

		loop();

	},

	stop() {
		this.cancel = true;
	},

	new() {
		if (this.vis) this.vis.pause();

		let e = this.ui.getElementById('demo_select');
		let name = e.options[e.selectedIndex].value;
		let dem;
		for (let d in demos) {
			if (demos[d].name == name) {
				dem = demos[d];
				break;
			}
		}

		Util.assert(dem);
		this.dem = dem;
		this.ui.clearParams();
		this.ui.getDefaultParams('env', dem.env);
		this.ui.getDefaultParams('agent', dem.agent);
		this.ui.getDemoParams(dem.params);
		this.ui.showParams();
		this.ui.clearExplanations();

		for (let exp of dem.vis.exps) {
			this.ui.showExplanation(exp);
		}
	},

	experiment(runs) {
		demos = [];
		for (let i = 0; i < runs; i++) {
			this.run(i); // TODO switch off ui updates
			demos.push(this);
		}

		return demos;
	},
};
