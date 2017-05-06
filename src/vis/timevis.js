class TIVis extends Visualization {
	constructor(env, trace, ui) {
		super(trace, ui);
		this.time = 0;
		this.current_state_no = env.initial_state;
		this.states = env.states;
		this.plan_vis = [];
		this.history = trace.states;
		this.counter_goal = env.delayed_dispense;
		this.counters = [];
		this.plan_trace = trace.plans;
		for (let i = 0; i < this.history.length; i++) {
			this.counters.push(this.history[i].count);
		}

		this.pos_array = env.pos_array;

		//TODO fix magic numbers (maybe base canvas size on state locations)

		//Get number of time inconsistent actions and output their occurences
		let counter = 0;
		for (let i = 1; i < this.plan_trace.length - 2; i++) {
			if (this.plan_trace[i + 1][1] != this.plan_trace[i + 2][0]) {
				counter++;
				console.log('time inconsistent at ' + i);
			}
		}

		this.margin = 50;
		this.text_margin = 20;
		let xMax = 0;
		let yMax = 0;
		for (let i = 0; i < this.pos_array.length; i++) {
			let x = this.pos_array[i].x;
			let y = this.pos_array[i].y;
			if (x > xMax) {
				xMax = x;
			}

			if (y > yMax) {
				yMax = y;
			}
		}

		this.height = yMax + this.margin;

		this.svg
			.attr('width', xMax + this.margin)
			.attr('height', this.height + this.margin + 70); //TODO fix magic no.

		this.svg
			.append('text')
			.text('Current Plan:')
			.attr('y', this.height + 30); //TODO font size etc.

		for (let i = 0; i < this.states.length; i++) {
			let x = this.pos_array[i].x;
			let y = this.pos_array[i].y;
			this.svg.append('circle')
				.attr('cx', x)
				.attr('cy', y)
				.attr('r', 30)
				.attr('fill', 'grey')
				.attr('stroke', '#000');
		}

		//Initialise agent
		this.svg.append('circle')
			.attr('cx', this.pos_array[this.current_state_no].x)
			.attr('cy', this.pos_array[this.current_state_no].y)
			.attr('r', 15)
			.attr('fill', 'blue')
			.attr('stroke', '#000')
			.attr('id', 'cpos');

		//Function to move elements to back of canvas,taken from http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
		d3.selection.prototype.moveToBack = function () {
			return this.each(function () {
				let firstChild = this.parentNode.firstChild;
				if (firstChild) {
					this.parentNode.insertBefore(this, firstChild);
				}
			});
		};
	}

	updateAgent() {
		for (let j = 0; j < this.plan_vis.length; j++) {
			this.plan_vis[j]
				.attr('visibility', 'hidden');  //Remove?
		}

		this.plan_vis = [];
		for (let i = 0; i < this.plan_trace[this.time + 2].length; i++) {
			let planIter = this.svg.append('text')
				.text(this.plan_trace[this.time + 3][i])  //index off, needs to be a time step higher
				.attr('y', this.height + 80)
				.attr('x', this.text_margin * (i + 1));

			this.plan_vis.push(planIter);
		}
	}

	updateEnv() {
		//Change location of agent circle to centre of new state
		let x = this.pos_array[this.pos_trace[this.time].current].x;
		let y = this.pos_array[this.pos_trace[this.time].current].y;
		if (this.history[this.time].reward == 1000) {
			d3.select('#cpos')
				.attr('fill', 'green');
		} else {
			d3.select('#cpos')
				.attr('fill', 'blue');
		}

		d3.select('#cpos')
			.attr('cx', x)
			.attr('cy', y);
	}
}

TIVis.exps = ['time_inconsistent'];
