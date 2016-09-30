class Visualization {
	constructor(trace, ui) {
		this.pos_trace = trace.states;
		this.rew_trace = trace.rewards;
		this.model_trace = trace.models;
		this.a_trace = trace.actions;
		this.t_max = trace.rewards.length - 1;
		this.jumps = trace.jumps;

		this.ui = ui;
		this.remove();

		this.svg = d3.select('#gridvis')
			.append('svg')
			.attr('id', 'vis_svg');

		ui.slider.max = this.t_max;
		ui.slider.step = (this.t_max + 1) / this.jumps;
	}

	pause() {
		clearInterval(this.interval);
	}

	run(speed) {
		this.pause();
		this.interval = setInterval(_ => {
			this.time++;
			this.draw();
		}, speed);
	}

	jumpTo(time) {
		this.time = time;
		this.draw();
	}

	reset() {
		this.pause();
		this.jumpTo(0);
	}

	draw() {
		if (this.time > this.t_max) {
			this.time = this.t_max;
			this.pause();
		}

		this.updateUI();
		this.updateAgent();
		this.updateEnv();
	}

	updateUI() {
		this.ui.slider.value = this.time;
	}

	updateAgent() {
		return;
	}

	updateEnv() {
		return;
	}

	remove() {
		this.pause();
		d3.select('#vis_svg').remove();
	}
}
