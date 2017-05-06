class GridVisualization extends Visualization {
	constructor(env, trace, ui) {
		super(trace, ui);
		this.interval;
		this.time;
		this.grid = env.grid;
		this.N = env.N;
		this.rectangles = [];
		for (var i = 0; i < env.N; i++) {
			this.rectangles.push(new Array(env.N));
		}

		this.d = GridVisualization.tile_size_px;
		this.width = (this.d + 1) * this.N - 1;
		this.height = (this.d + 1) * this.N - 1;
		this.svg
		.attr('width', this.width)
		.attr('height', this.height);

		this.grid.forEach((row, idx) => {
			row.forEach((tile, jdx) => {
				var r = GridVisualization.makeTile(this.svg, tile);
				this.rectangles[idx][jdx] = r;
			});
		});

		this.svg.append('image')
			.attr('xlink:href', 'assets/robot.svg')
			.attr('x', 0)
			.attr('y', 0)
			//.attr('width', this.d)
			.attr('height', this.d)
			.attr('id', 'agent');
	}

	updateEnv() {
		var x = this.pos_trace[this.time].x;
		var y = this.pos_trace[this.time].y;
		d3.select('#agent')
			.attr('x', (x + 0.2) * this.d)
			.attr('y', y * this.d);
	}

	static makeTile(svg, t, color) {
		const d = GridVisualization.tile_size_px;
		var r = svg.append('rect')
			.attr('x', t.x * d)
			.attr('y', t.y * d)
			.attr('height', d)
			.attr('width', d)
			.attr('stroke', 'black')
			.attr('stroke-width', 2);
		if (t.constructor != Chocolate &&
			t.constructor != Dispenser) {
			r.attr('fill', t.color);
		} else {
			r.attr('fill', GridVisualization.colors.empty);
			GridVisualization.addCircle(svg, t.x, t.y, t.color, '', t.freq);
		}

		if (color) {
			r.attr('fill', color);
		}

		return r;
	}

	static makeLegend(div, T, color) {
		var svg = d3.select(`#${div}`).append('svg')
			.attr('id', `${div}_svg`)
			.attr('width', GridVisualization.tile_size_px)
			.attr('height', GridVisualization.tile_size_px);
		GridVisualization.makeTile(svg, new T(0, 0), color);
	}

	static addCircle(svg, x, y, color, id, size) {
		const d = GridVisualization.tile_size_px;
		svg.append('circle')
			.attr('cx', x * d + d / 2)
			.attr('cy', y * d + d / 2)
			.attr('r', size ? (d / 2) * size : d / 8)
			.attr('fill', color)
			.attr('stroke', '#000')
			.attr('id', id);
	}
}

GridVisualization.tile_size_px = 40;

GridVisualization.colors = {
		empty: '#fdfdfd',
		wall: 'grey',
		chocolate: 'yellow',
		dispenser: 'orange',
		agent: 'blue',
		trap: 'pink',
		rho: 'red',
		modifier: 'blue',
	};

class TabularGridVis extends GridVisualization {
	constructor(env, trace, ui) {
		super(env, trace, ui);
		this.arrows = [];
		for (var i = 0; i < env.N; i++) {
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

				var xcoord = tile.x * this.d;
				var ycoord = tile.y * this.d;
				var arrowList = [];
				this.arrow_actions.forEach(a => {
					var arrow = this.svg.append('line')
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

				var xcoord = tile.x * this.d;
				var ycoord = tile.y * this.d;

				var qSum = 0;
				this.arrow_actions.forEach(a => {
					qSum += Math.pow(Math.E, tile.info[a]);
				});

				this.arrow_actions.forEach(a => {
					var lineSize = this.d / 2 * Math.pow(Math.E, tile.info[a]) / qSum;
					var dx = 0;
					var dy = 0;
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

		var index = this.time / ((this.t_max + 1) / this.jumps);
		if (this.time == 0) {
			this.grid.forEach(row => {
				row.forEach(tile => {
					tile.info = [0, 0, 0, 0];
				});
			});
		} else {
			for (var [key, value] of this.q_list[index].map) {
				var coord = {
					x: key.charAt(0),
					y: key.charAt(1),
				};
				var a = key.charAt(2);
				this.grid[coord.x][coord.y].info[a] = value;
			}
		}
	}
}

class BayesGridVis extends GridVisualization {
	constructor(env, trace, ui) {
		super(env, trace, ui);
		this.weights = [];
		this.color_normalization = this.N * this.N * 100;
		this.ig_trace = trace.ig;
	}

	updateAgent() {
		this.grid.forEach(row => {
			row.forEach(tile => {
				var rectangle = this.rectangles[tile.x][tile.y];
				var c = this.posteriorColor(tile, this.time);
				var col = null;
				if (c) {
					var r = Math.floor(c.r);
					var g = Math.floor(c.g);
					var b = Math.floor(c.b);
					col = `rgb(${r},${g},${b})`;
				} else {
					col = tile.color;
				}

				rectangle.attr('fill', col);
			});
		});
	}

	posteriorColor(tile, time) {
		var tc = tile.constructor;
		if (tc == Wall ||
				tc == SelfModificationTile) {
			return null;
		}

		if (tc == NoiseTile) {
			return {
				r: 255 * Math.random(),
				g: 255 * Math.random(),
				b: 255 * Math.random(),
			};
		}

		var trap = tile.constructor == Trap;

		// TODO visualize direct from agent mixture model!

		var p = this.model_trace[time][tile.y * this.N + tile.x];
		return {
			g: 255 - 100 * trap,
			r: 255 - p * this.color_normalization,
			b: 255 - p * this.color_normalization - 100 * trap,
		};
	}
}

BayesGridVis.exps = ['aixi', 'dispenser', 'mixture'];

class DirichletVis extends BayesGridVis {
	constructor(env, trace, ui) {
		super(env, trace, ui);
		this.model_trace = trace.params;
	}

	posteriorColor(tile, time) {
		var alphas = this.model_trace[time][tile.x][tile.y];
		var as = Util.sum(alphas);
		if (as == 0) {
			return { r: 255, g: 255, b: 255 };
		}

		return {
			r: 255 * (0.5 - alphas[2] / as),
			g: 255 * (1 - alphas[0] / as),
			b: 255 * (1 - alphas[1] / as),
		};
	}
}

DirichletVis.exps = ['dispenser', 'dirichlet'];

class ThompsonVis extends BayesGridVis {
	constructor(env, trace, ui) {
		super(env, trace, ui);
		this.rho_trace = trace.rhos;
	}

	updateAgent() {
		super.updateAgent();
		d3.select('#thompson_disp').remove();
		var rhoPos = this.rho_trace[this.time];
		GridVisualization.addCircle(
			this.svg, rhoPos.x, rhoPos.y, GridVisualization.colors.rho, 'thompson_disp');
	}
}

ThompsonVis.exps = ['dispenser', 'mixture', 'thompson'];

class MDLVis extends ThompsonVis {}

MDLVis.exps = ['dispenser', 'mixture', 'mdl'];

class BayesExpVis extends BayesGridVis {
	// TODO flag to show when agent is in explore mode or not
	// use trace.exploration_phases
}

BayesExpVis.exps = ['dispenser', 'mixture', 'bayesexp'];

class WireHeadVis extends BayesGridVis {
	updateAgent() {
		super.updateAgent();
		if (this.pos_trace[this.time].wireheaded) {
			for (var i = 0; i < this.N; i++) {
				for (var j = 0; j < this.N; j++) {
					var r = this.rectangles[i][j];
					var col = r.attr('fill');
					var rgb = col.replace(/[^\d,]/g, '').split(',');
					rgb[0] += 20;
					r.attr('fill', `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
				}
			}
		}
	}
}

WireHeadVis.exps = ['wirehead', 'mixture', 'dispenser'];

class HookedOnNoiseVis extends BayesGridVis {}

HookedOnNoiseVis.exps = ['dispenser', 'mixture', 'noise'];
