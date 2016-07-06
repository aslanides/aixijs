class Plot{
	constructor(data, id, labels) {
		if (data[0].length == undefined) {
			this.data = [data];
		} else {
			this.data = data;
		}

		this.x_label = labels.x;
		this.y_label = labels.y;
		this.value = labels.value;

		this.margin = { top: 50, right: 70, bottom: 30, left: 70 };
		this.width = 600 - this.margin.left - this.margin.right;
		this.height = 270 - this.margin.top - this.margin.bottom;

		d3.select('#' + id).remove();
		this.svg = d3.select('#plots')
			.append('svg')
			.attr('id', id)
			.attr('width', this.width + this.margin.left + this.margin.right)
			.attr('height', this.height + this.margin.top + this.margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

		this.x = d3.scale.linear().range([0, this.width]);
		this.y = d3.scale.linear().range([this.height, 0]);
		if (this.data.length == 1) {
			this.x.domain(d3.extent(this.data[0], (d, i) => i + 1));
			this.y.domain([d3.min(this.data[0], d => d), d3.max(this.data[0], d => d)]);
			this.valueline = d3.svg.line()
				.x((d, i) => this.x(i + 1))
				.y(d => this.y(d));
		} else {
			this.x.domain(
				[d3.min(this.data, d => d3.min(d, x=>x.x)), d3.max(this.data, d => d3.max(d, x=>x.x))]);
			this.y.domain(
				[d3.min(this.data, d => d3.min(d, x=>x.y)), d3.max(this.data, d => d3.max(d, x=>x.y))]);
			this.valueline = d3.svg.line()
				.x(d => this.x(d.x))
				.y(d => this.y(d.y));
		}

		this.xAxis = d3.svg.axis().scale(this.x)
			.orient('bottom').ticks(5);

		this.yAxis = d3.svg.axis().scale(this.y)
			.orient('left').ticks(5);

		let color = (function* () {
			let idx = 0;
			let colors = ['steel-blue', 'red', 'green', 'black', 'grey', 'yellow'];
			let l = colors.length;
			while (true) {
				yield colors[idx++ % l];
			}
		}());

		for (let dat of this.data) {
			this.svg.append('path')
				.attr('class', 'line')
				.attr('d', this.valueline(dat))
				.style('stroke', color.next().value);
		}

		this.svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + this.height + ')')
			.call(this.xAxis);

		this.svg.append('g')
			.attr('class', 'y axis')
			.call(this.yAxis);

		this.svg.append('text')
			.attr('x', this.width / 2)
			.attr('y', this.height + this.margin.bottom)
			.style('text-anchor', 'middle')
			.text(this.x_label);

		this.svg.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('x', 0 - this.height / 2)
			.attr('y', 0 - this.margin.left)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.text(this.y_label);
	}

	update(time) {
		return;
	}

	static clearAll() {
		let plots = d3.select('#plots')[0][0];
		while (plots.children.length > 0) {
			d3.select('#' + plots.children[0].id).remove();
		}
	}
}

class TooltipPlot extends Plot {
	constructor(data, id, labels) {
		super(data, id, labels);
		this.tooltip = this.svg.append('g').style('display', 'none');

		this.tooltip.append('circle')
			.attr('class', 'y')
			.style('fill', 'none')
			.style('stroke', 'grey')
			.attr('r', 4);

		this.tooltip.append('text')
						.attr('class', 'y1')
						.style('stroke', 'white')
						.style('stroke-width', '3.5px')
						.style('opacity', 0.8)
						.attr('dx', 8)
						.attr('dy', '-.3em');
		this.tooltip.append('text')
						.attr('class', 'y2')
						.attr('dx', 8)
						.attr('dy', '-.3em');
		this.tooltip.append('text')
						.attr('class', 'y3')
						.style('stroke', 'white')
						.style('stroke-width', '3.5px')
						.style('opacity', 0.8)
						.attr('dx', 8)
						.attr('dy', '1em');
		this.tooltip.append('text')
						.attr('class', 'y4')
						.attr('dx', 8)
						.attr('dy', '1em');
	}

	update(time) {
		let y = Util.roundTo(this.data[0][time], 2);
		this.tooltip.select('circle.y')
			.attr('transform',
			`translate(${this.x(time)},${this.y(y)})`);
		this.tooltip.style('display', null);

		for (let i = 1; i < 5; i++) {
			let text = 't: ' + (time + 1);
			if (i == 2) {
				text = this.value + ': ' + y;
			}

			this.tooltip.select('text.y' + i)
				.attr('transform',
				`translate(${this.x(time)},${this.y(y)})`)
				.text(text);
		}
	}
}

class RewardPlot extends TooltipPlot {
	constructor(trace) {
		let data = trace.map((x, i) => x / (i + 1));
		super(data, 'reward_plot', { x: 'Cycles', y: 'Average reward', value: 'rew' });
	}
}

class IGPlot extends TooltipPlot {
	constructor(trace) {
		super(trace, 'ig_plot', { x: 'Cycles', y: 'Cumulative Information gain', value: 'IG' });
	}
}

class BanditPlot extends Plot {
	constructor(data, vis) {
		super(data, 'bandit', { x: 'Reward', y: 'Pr', value: '' });

		this.dists = vis.dists;
		this.a_trace = vis.a_trace;
		this.rew_trace = vis.rew_trace;

		let T = this.rew_trace.length;
		this.rew_inc = new Array(T);
		this.rew_inc[0] = 0;
		for (let i = 1; i < T; i++) {
			this.rew_inc[i] = this.rew_trace[i] - this.rew_trace[i - 1];
		}

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
