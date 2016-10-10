class MDP2Vis extends Visualization {
	constructor(env, trace, ui) {
		super(trace, ui);
		this.margin = 30;
		this.width = 400;
		this.height = this.width;

		this.svg
			.attr('width', this.width + 2 * this.margin)
			.attr('height', this.height + 2 * this.margin);

		this.N = env.numStates;
		this.d = this.width / this.N;
		for (let i = 0; i < this.N; i++) {
			let x = (i + 1) * this.d;
			let y = this.width / 2;
			this.svg.append('circle')
				.attr('cx', x)
				.attr('cy', y)
				.attr('r', 30)
				.attr('id', `state${i}`)
				.attr('fill', 'grey')
				.attr('stroke', '#000');
		}

		this.svg.append('circle')
			.attr('cx', 0)
			.attr('cy', this.width / 2)
			.attr('r', 15)
			.attr('fill', 'blue')
			.attr('stroke', '#000')
			.attr('id', 'cpos');
	}

	updateEnv() {
		let x = (this.pos_trace[this.time] + 1) * this.d;
		d3.select('#cpos')
			.attr('cx', x);
	}
}
