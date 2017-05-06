class MDPVis extends Visualization {
	constructor(env, trace, ui) {
		super(trace, ui);
		this.time = 0;
		this.current_state_no = env.options._initial_state; // TODO fix.
		this.states = [];
		for (var i = 0; i < env.states.length; i++) {
			this.states[i] = env.options._states[i];
		}

		//TODO fix magic numbers (maybe base canvas size on state locations)

		this.margin = 50;
		var xMax = 0;
		var yMax = 0;
		for (var i = 0; i < this.states.length; i++) {
			var x = this.states[i].pos.x;
			var y = this.states[i].pos.y;
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

		for (var i = 0; i < this.states.length; i++) {
			var x = this.states[i].pos.x;
			var y = this.states[i].pos.y;
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
				var firstChild = this.parentNode.firstChild;
				if (firstChild) {
					this.parentNode.insertBefore(this, firstChild);
				}
			});
		};

		//Draw transition lines
		for (var i = 0; i < this.states.length; i++) {
			var state = this.states[i];

			//Initial path position
			var x1 = state.pos.x;
			var y1 = state.pos.y;
			var m = `${x1},${y1}`;

			//Go through each action in this state
			for (var j = 0; j < state.actions.length; j++) {

				//TODO logic for how to show how likely this action is (init here, update in updateAgent
				//Random colour for now
				var r = Math.random() * 256;
				var g = Math.random() * 256;
				var b = Math.random() * 256;
				var fill = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
				var transitions = state.actions[j].probabilities;

				//Loop through all possible transitions for the action
				for (var h = 0; h < transitions.length; h++) {
					var newState = this.states[h];
					var x2 = newState.pos.x;
					var y2 = newState.pos.y;
					var prob = transitions[h];

					//Change thickness based on transition probability
					var thickness = `${prob * 8}`;

					//If same state, move pos2 to make line a curve
					var xMidpoint = (x2 + x1) / 2;
					var yMidpoint = (y2 + y1) / 2;
					var xQ = 0;
					var yQ = 0;

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
						var pathGrad = (y2 - y1) / (x2 - x1);
						var normalGrad =  Math.pow(-1, j) / pathGrad;

						//Scaling factor
						//TODO: k is hoisted to function scope. this is almost certainly a bug
						var k = 40 * Math.sqrt(Math.abs(normalGrad));
						xQ = ((k * j) / normalGrad +  xMidpoint);
						yQ = (k * j * normalGrad + yMidpoint);
					}

					var pt = `${x2},${y2}`;
					var q = `${xQ},${yQ}`;
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
		var x = this.states[this.pos_trace[this.time]].pos.x;
		var y = this.states[this.pos_trace[this.time]].pos.y;
		d3.select('#cpos')
			.attr('cx', x)
			.attr('cy', y);
	}
}
