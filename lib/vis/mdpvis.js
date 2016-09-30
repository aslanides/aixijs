class MDPVis extends Visualization {
	constructor(env, trace, ui) {
		super(trace, ui);
		this.time = 0;
		this.current_state_no = env.options._initial_state; // TODO fix.
		this.states = [];
		for (let i = 0; i < env.states.length; i++) {
			this.states[i] = env.options._states[i];
		}

		//TODO fix magic numbers (maybe base canvas size on state locations)

		this.margin = 50;
		let xMax = 0;
		let yMax = 0;
		for (let i = 0; i < this.states.length; i++) {
			let x = this.states[i].pos.x;
			let y = this.states[i].pos.y;
			if (x > xMax) {
				xMax = x;
			}

			if (y > yMax) {
				yMax = y;
			}
		}

		this.svg
			.attr('width', xMax + this.margin)
			.attr('height', yMax + this.margin);

		for (let i = 0; i < this.states.length; i++) {
			let x = this.states[i].pos.x;
			let y = this.states[i].pos.y;
			this.svg.append('circle')
				.attr('cx', x)
				.attr('cy', y)
				.attr('r', 30)
				.attr('fill', 'grey')
				.attr('stroke', '#000');
		}

		//Initialise agent
		this.svg.append('circle')
			.attr('cx', this.states[this.current_state_no].pos.x)
			.attr('cy', this.states[this.current_state_no].pos.y)
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

		//Draw transition lines
		for (let i = 0; i < this.states.length; i++) {
			let state = this.states[i];

			//Initial path position
			let x1 = state.pos.x;
			let y1 = state.pos.y;
			let m = `${x1},${y1}`;

			//Go through each action in this state
			for (let j = 0; j < state.actions.length; j++) {

				//TODO logic for how to show how likely this action is (init here, update in updateAgent
				//Random colour for now
				let r = Math.random() * 256;
				let g = Math.random() * 256;
				let b = Math.random() * 256;
				let fill = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
				let transitions = state.actions[j].probabilities;

				//Loop through all possible transitions for the action
				for (let h = 0; h < transitions.length; h++) {
					let newState = this.states[h];
					let x2 = newState.pos.x;
					let y2 = newState.pos.y;
					let prob = transitions[h];

					//Change thickness based on transition probability
					let thickness = `${prob * 8}`;

					//If same state, move pos2 to make line a curve
					let xMidpoint = (x2 + x1) / 2;
					let yMidpoint = (y2 + y1) / 2;
					let xQ = 0;
					let yQ = 0;

					//For same state
					if (h == i) {
						x1 -= 12;//Change to be 1/4 of the circle radius
						x2 += 12;
						xQ = xMidpoint;
						yQ = yMidpoint + 100; //Fix magic numbers

						//Update q...
					} else if (x2 == x1 || y2 == y1) {

						//Get gradient for path/normal vector and midpoint to scale Bezier control point
						if (x2 == x1) {
							xQ = x1 + k * j;
							yQ = yMidpoint;
						}

						if (y2 == y1) {
							xQ = xMidpoint;
							yQ = y1 + k * j;
						}
					} else {
						let pathGrad = (y2 - y1) / (x2 - x1);
						let normalGrad =  Math.pow(-1, j) / pathGrad;

						//Scaling factor
						//TODO: k is hoisted to function scope. this is almost certainly a bug
						var k = 40 * Math.sqrt(Math.abs(normalGrad));
						xQ = ((k * j) / normalGrad +  xMidpoint);
						yQ = (k * j * normalGrad + yMidpoint);
					}

					let pt = `${x2},${y2}`;
					let q = `${xQ},${yQ}`;
					this.svg.append('path')
						.attr('d', `M${m}Q${q} ${pt}`)
						.style('stroke', fill)
						.style('stroke-width', thickness)
						.moveToBack();
				}
			}
		}
	}

	updateAgent() {
		//Agent model: Q-Values, maybe use the colouring of the arrows for different
		//	actions to communicate the size of the value (softmax a la AIXI Gridworld)?
		return;
	}

	updateEnv() {
		//Change location of agent circle to centre of new state
		let x = this.states[this.pos_trace[this.time]].pos.x;
		let y = this.states[this.pos_trace[this.time]].pos.y;
		d3.select('#cpos')
			.attr('cx', x)
			.attr('cy', y);
	}
}
