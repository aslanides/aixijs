class Visualization {
	constructor(trace) {
		this.pos_trace = trace.states;
		this.rew_trace = trace.rewards;
		this.model_trace = trace.models;
		this.a_trace = trace.actions;
		this.t_max = trace.rewards.length - 1;
		this.jumps = trace.jumps;
		this.slider = document.getElementById('slider');

		Plot.clearAll();
		d3.select('#vis_svg').remove();
		this.plots = [];
		this.plots.push(new RewardPlot(this.rew_trace));

		this.slider.max = this.t_max;
		this.slider.step = (this.t_max + 1) / this.jumps;
	}

	pause() {
		clearInterval(this.interval);
	}

	run(speed) {
		this.pause();
		let f = function (viz) {
			function g() {
				viz.time++;
				viz.draw();
			}

			return g;
		};

		this.interval = setInterval(f(this), speed);
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

		for (let plt of this.plots) {
			plt.update(this.time);
		}

		this.updateUI();
		this.updateAgent();
		this.updateEnv();
	}

	updateUI() {
		this.slider.value = this.time;
	}

	updateAgent() {
		return;
	}

	updateEnv() {
		return;
	}
}

class GridVisualization extends Visualization {
	constructor(env, trace) {
		super(trace);
		this.interval;
		this.time;
		this.grid = env.grid;
		this.M = env.M;
		this.N = env.N;
		this.rectangles = [];
		for (let i = 0; i < env.M; i++) {
			this.rectangles.push(new Array(env.N));
		}

		this.d = config.tile_size_px;
		this.width = (this.d + 1) * this.M - 1;
		this.height = (this.d + 1) * this.N - 1;
		this.svg = d3.select('#gridvis').append('svg')
			.attr('id', 'vis_svg')
			.attr('width', this.width).attr('height', this.height);

		this.grid.forEach((row, idx) => {
			row.forEach((tile, jdx) => {
				let r = GridVisualization.makeTile(this.svg, tile);
				this.rectangles[idx][jdx] = r;
			});
		});

		this.svg.append('image')
			.attr('xlink:href', 'assets/robot.svg')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', this.d)
			.attr('height', this.d)
			.attr('id', 'agent');
	}

	updateEnv() {
		let x = this.pos_trace[this.time].x;
		let y = this.pos_trace[this.time].y;
		d3.select('#agent')
			.attr('x', x * this.d)
			.attr('y', y * this.d);
	}

	static makeTile(svg, t, color) {
		const d = config.tile_size_px;
		let r = svg.append('rect')
			.attr('x', t.x * d)
			.attr('y', t.y * d)
			.attr('height', d)
			.attr('width', d)
			.attr('stroke', 'black')
			.attr('stroke-width', 2);
		if (t.constructor.name != 'Chocolate' &&
			t.constructor.name != 'Dispenser') {
			r.attr('fill', t.color);
		} else {
			r.attr('fill', config.colors.empty);
			GridVisualization.addCircle(svg, t.x, t.y, t.color);
		}

		if (color) {
			r.attr('fill', color);
		}

		return r;
	}

	static makeLegend(div, T, color) {
		let svg = d3.select(`#${div}`).append('svg')
			.attr('id', `${div}_svg`)
			.attr('width', config.tile_size_px)
			.attr('height', config.tile_size_px);
		GridVisualization.makeTile(svg, new T(0, 0), color);
	}

	static addCircle(svg, x, y, color, id) {
		const d = config.tile_size_px;
		svg.append('circle')
			.attr('cx', x * d + d / 2)
			.attr('cy', y * d + d / 2)
			.attr('r', 5)
			.attr('fill', color)
			.attr('stroke', '#000')
			.attr('id', id);
	}
}

class TabularGridVis extends GridVisualization {
	constructor(env, trace) {
		super(env, trace);
		this.arrows = [];
		for (let i = 0; i < env.M; i++) {
			this.arrows.push(new Array(env.N));
		}

		this.q_list = trace.q_map;
		this.arrow_actions = [0, 1, 2, 3];

		this.svg.append('defs').append('marker')
			.attr('id', 'arrowhead')
			.attr('refX', 3)
			.attr('refY', 2)
			.attr('markerWidth', 3)
			.attr('markerHeight', 4)
			.attr('orient', 'auto')
			.append('path')
			.attr('d', 'M 0,0 V 4 L2,2	 Z');

		this.grid.forEach((row, idx) => {
			row.forEach((tile, jdx) => {
				tile.info = [0, 0, 0, 0];
				if (!tile.legal || tile.goal) {
					this.arrows[idx][jdx] = null;
					return;
				}

				let xcoord = tile.x * this.d;
				let ycoord = tile.y * this.d;
				let arrowList = [];
				this.arrow_actions.forEach(a => {
					let arrow = this.svg.append('line')
						.attr('x1', xcoord)
						.attr('y1', ycoord)
						.attr('x2', xcoord)
						.attr('y2', ycoord)
						.attr('stroke', 'black')
						.attr('stroke-width', '2')
						.attr('marker-end', 'url(#arrowhead)');
					arrowList.push(arrow);
				});
				this.arrows[idx][jdx] = arrowList;
			});
		});
	}

	updateAgent() {
		this.grid.forEach(row => {
			row.forEach(tile => {
				if (!tile.legal || tile.goal) {
					return;
				}

				let xcoord = tile.x * this.d;
				let ycoord = tile.y * this.d;

				let qSum = 0;
				this.arrow_actions.forEach(a => {
					qSum += Math.pow(Math.E, tile.info[a]);
				});

				this.arrow_actions.forEach(a => {
					let lineSize = this.d / 2 * Math.pow(Math.E, tile.info[a]) / qSum;
					let dx = 0;
					let dy = 0;
					if (a < 2) {
						dx = Math.pow(-1, a + 1) * lineSize;
					} else {
						dy = Math.pow(-1, a) * lineSize;
					}

					if (lineSize > 3) {
						this.arrows[tile.x][tile.y][a]
							.attr('x1', xcoord + this.d / 2)
							.attr('y1', ycoord + this.d / 2)
							.attr('x2', xcoord + this.d / 2 + dx)
							.attr('y2', ycoord + this.d / 2 - dy)
							.attr('visibility', 'visible');
					}  else {
						this.arrows[tile.x][tile.y][a]
							.attr('visibility', 'hidden');
					}
				});
			});
		});
		this.grid[this.pos_trace[this.time].x][this.pos_trace[this.time].y]
			.info[this.a_trace[this.time]] = this.model_trace[this.time];

		if (this.time % ((this.t_max + 1) / this.jumps) != 0) {
			return;
		}

		let index = this.time / ((this.t_max + 1) / this.jumps);
		if (this.time == 0) {
			this.grid.forEach(row => {
				row.forEach(tile => {
					tile.info = [0, 0, 0, 0];
				});
			});
		} else {
			for (let [key, value] of this.q_list[index].map) {
				let coord = {
					x: key.charAt(0),
					y: key.charAt(1),
				};
				let a = key.charAt(2);
				this.grid[coord.x][coord.y].info[a] = value;
			}
		}
	}
}

class BayesGridVis extends GridVisualization {
	constructor(env, trace) {
		super(env, trace);
		this.weights = [];
		this.color_normalization = this.M * this.N * 100;
		this.ig_trace = trace.ig;
		this.plots.push(new IGPlot(this.ig_trace));
	}

	updateAgent() {
		this.grid.forEach(row => {
			row.forEach(tile => {
				tile.info = this.model_trace[this.time][tile.y * this.N + tile.x];
				let rectangle = this.rectangles[tile.x][tile.y];
				let p = tile.info;

				let g = 255;
				let r = 255 - p * this.color_normalization;
				let b = 255 - p * this.color_normalization;

				if (tile.color == config.colors.wall) {
					r -= 100;
					g -= 100;
					b -= 100;
				}

				let rectFill = 'rgb(' + Math.floor(r) + ',' + Math.floor(g) + ',' + Math.floor(b) + ')';
				rectangle.attr('fill', rectFill);
			});
		});
	}

	static drawMCTSTree(root) {
		let data = root.toJson();

		let margin = { top: 30, right: 120, bottom: 20, left: 120 };
		let width = 1960 - margin.right - margin.left;
		let height = 800 - margin.top - margin.bottom;
		let id = 0;

		let tree = d3.layout.tree()
			.size([height, width]);

		let diagonal = d3.svg.diagonal()
			.projection(d => [d.x, d.y]);

		let svg = d3.select('body').append('svg')
			.attr('width', width + margin.right + margin.left)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		let nodes = tree.nodes(data).reverse();
		let links = tree.links(nodes);

		nodes.forEach(function (d) {d.y = d.depth * 100;});

		let node = svg.selectAll('g.node')
			.data(nodes, function (d) {return d.id || (d.id = ++id);});

		let nodeEnter = node.enter().append('g')
			.attr('class', 'node')
			.attr('transform', d => `translate(${d.x},${d.y})`);

		nodeEnter.append('circle')
			.attr('r', 10);

		nodeEnter.append('text')
			.attr('y', function (d) {
				return d.children || d._children ? -18 : 18;
			})
			.attr('dy', '.35em')
			.attr('text-anchor', 'middle')
			.text(d => d.name);

		let link = svg.selectAll('path.link')
			.data(links, d => d.target.id);

		link.enter().insert('path', 'g')
			.attr('class', 'link')
			.attr('d', diagonal);
	}
}

class AIXIVis extends BayesGridVis {
	constructor(env, trace) {
		super(env, trace);
	}
}

class ThompsonVis extends BayesGridVis {
	constructor(env, trace) {
		super(env, trace);
		this.rho_trace = trace.rhos;
	}

	updateAgent() {
		super.updateAgent();
		d3.select('#thompson_disp').remove();
		let rhoPos = this.rho_trace[this.time];
		GridVisualization.addCircle(this.svg, rhoPos.x, rhoPos.y, config.colors.rho, 'thompson_disp');
	}
}

class BanditVis extends Visualization {
	constructor(env, trace) {
		super(trace);
		this.a_trace[0] = 0;
		this.dists = env.actions;
		let data = [];
		for (let arm of env.actions) {
			data.push(arm.data());
		}

		this.plots.push(new BanditPlot(data, this));
	}
}

class MDPVis extends Visualization {
	constructor(env, trace) {
		super(trace);
		this.time = 0;
		this.current_state_no = env.config.initial_state;
		this.states = [];
		for (let i = 0; i < env.states.length; i++) {
			this.states[i] = env.config.states[i];
		}

		let gridvis = document.getElementById('gridvis');

		//TODO fix magic numbers (maybe base canvas size on state locations)
		gridvis.style.display = 'block';

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

		this.svg = d3.select(gridvis).append('svg')
			.attr('id', 'vis_svg')
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

class PuckworldVis extends Visualization {
	constructor(env, trace) {
		super(trace);

		this.W = 350;
		this.H = 350;
		this.BADRAD = env.BADRAD;

		this.rew_trace = Util.cumToInc(this.rew_trace);

		let svg = d3.select('#gridvis').append('svg')
			.attr('id', 'vis_svg')
			.attr('width', this.W)
			.attr('height', this.H)
			.append('g')
			.attr('transform', 'scale(1)');

		// define a marker for drawing arrowheads
		svg.append('defs').append('marker')
			.attr('id', 'arrowhead')
			.attr('refX', 3)
			.attr('refY', 2)
			.attr('markerWidth', 3)
			.attr('markerHeight', 4)
			.attr('orient', 'auto')
			.append('path')
				.attr('d', 'M 0,0 V 4 L3,2 Z');

		// draw the puck
		this.d3agent = svg.append('circle')
			.attr('cx', 100)
			.attr('cy', 100)
			.attr('r', env.rad * this.W)
			.attr('fill', '#FF0')
			.attr('stroke', '#000')
			.attr('id', 'puck');

		// draw the target
		this.d3target = svg.append('circle')
			.attr('cx', 200)
			.attr('cy', 200)
			.attr('r', 10)
			.attr('fill', '#0F0')
			.attr('stroke', '#000')
			.attr('id', 'target');

		// bad target
		this.d3target2 = svg.append('circle')
			.attr('cx', 300)
			.attr('cy', 300)
			.attr('r', 10)
			.attr('fill', '#F00')
			.attr('stroke', '#000')
			.attr('id', 'target2');

		this.d3target2Radius = svg.append('circle')
			.attr('cx', 300)
			.attr('cy', 300)
			.attr('r', 10)
			.attr('fill', 'rgba(255,0,0,0.1)')
			.attr('stroke', '#000');

		// draw line indicating forces
		this.d3line = svg.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', 0)
			.attr('y2', 0)
			.attr('stroke', 'black')
			.attr('stroke-width', '2')
			.attr('marker-end', 'url(#arrowhead)');
	}

	updateEnv() {
		// reflect puck world state on screen

		var state = this.pos_trace[this.time];
		var a = this.a_trace[this.time];
		var rew = this.rew_trace[this.time];

		var ppx = state[0] + 0.5;
		var ppy = state[1] + 0.5;
		var tx = state[4] + ppx;
		var ty = state[5] + ppy;
		var tx2 = state[6] + ppx;
		var ty2 = state[7] + ppy;

		this.d3agent.attr('cx', ppx * this.W).attr('cy', ppy * this.H);
		this.d3target.attr('cx', tx * this.W).attr('cy', ty * this.H);
		this.d3target2.attr('cx', tx2 * this.W).attr('cy', ty2 * this.H);
		this.d3target2Radius.attr('cx', tx2 * this.W).attr('cy', ty2 * this.H)
			.attr('r', this.BADRAD * this.H);
		this.d3line.attr('x1', ppx * this.W).attr('y1', ppy * this.H).attr('x2', ppx * this.W)
			.attr('y2', ppy * this.H);
		var af = 20;
		this.d3line.attr('visibility', a === 4 ? 'hidden' : 'visible');
		if (a === 0) {
			this.d3line.attr('x2', ppx * this.W - af);
		}

		if (a === 1) {
			this.d3line.attr('x2', ppx * this.W + af);
		}

		if (a === 2) {
			this.d3line.attr('y2', ppy * this.H - af);
		}

		if (a === 3) {
			this.d3line.attr('y2', ppy * this.H + af);
		}

		// color agent by reward
		var vv = rew + 0.5;
		var ms = 255.0;
		var r;
		var g;
		var b;
		if (vv > 0) {
			g = 255; r = 255 - vv * ms; b = 255 - vv * ms;
		}

		if (vv < 0) {
			g = 255 + vv * ms; r = 255; b = 255 + vv * ms;
		}

		var vcol = 'rgb(' + Math.floor(r) + ',' + Math.floor(g) + ',' + Math.floor(b) + ')';
		this.d3agent.attr('fill', vcol);
	}
}
