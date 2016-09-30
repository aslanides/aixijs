class PuckworldVis extends Visualization {
	constructor(env, trace, ui) {
		super(trace, ui);

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

		let state = this.pos_trace[this.time];
		let a = this.a_trace[this.time];
		let rew = this.rew_trace[this.time];

		let ppx = state[0] + 0.5;
		let ppy = state[1] + 0.5;
		let tx = state[4] + ppx;
		let ty = state[5] + ppy;
		let tx2 = state[6] + ppx;
		let ty2 = state[7] + ppy;

		this.d3agent.attr('cx', ppx * this.W).attr('cy', ppy * this.H);
		this.d3target.attr('cx', tx * this.W).attr('cy', ty * this.H);
		this.d3target2.attr('cx', tx2 * this.W).attr('cy', ty2 * this.H);
		this.d3target2Radius.attr('cx', tx2 * this.W).attr('cy', ty2 * this.H)
			.attr('r', this.BADRAD * this.H);
		this.d3line.attr('x1', ppx * this.W).attr('y1', ppy * this.H).attr('x2', ppx * this.W)
			.attr('y2', ppy * this.H);
		let af = 20;
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
		let vv = rew + 0.5;
		let ms = 255.0;
		let r;
		let g;
		let b;
		if (vv > 0) {
			g = 255; r = 255 - vv * ms; b = 255 - vv * ms;
		}

		if (vv < 0) {
			g = 255 + vv * ms; r = 255; b = 255 + vv * ms;
		}

		let vcol = 'rgb(' + Math.floor(r) + ',' + Math.floor(g) + ',' + Math.floor(b) + ')';
		this.d3agent.attr('fill', vcol);
	}
}
