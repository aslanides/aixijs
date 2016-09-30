class BanditVis extends Visualization {
	constructor(env, trace, ui) {
		super(trace, ui);
		this.a_trace[0] = 0;
		this.dists = env.actions;
		let data = [];
		for (let arm of env.actions) {
			data.push(arm.data());
		}

		this.plot = new BanditPlot(data, this);
	}
}

class BanditPlot extends Plot {
	constructor(data, vis) {
		super(data, 'bandit', { x: 'Reward', y: 'Pr', value: '' }, 'densities');

		// TODO fix
		this.dists = vis.dists;
		this.a_trace = vis.a_trace;
		this.rew_trace = vis.rew_trace;

		this.rew_inc = Util.cumToInc(this.rew_trace);
		this.tooltip = this.svg.append('g');
		this.tooltip.append('circle')
			.attr('class', 'y')
			.style('fill', 'none')
			.style('stroke', 'grey')
			.attr('r', 4);
	}

	update(time) {
		let rew = this.rew_inc[time];
		let a = this.a_trace[time];

		this.tooltip.select('circle.y')
			.attr('transform',
			`translate(${this.x(rew)},${this.y(this.dists[a].prob(rew))})`);
	}
}
