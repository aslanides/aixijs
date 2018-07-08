class Plot {
	constructor(trace, id, labels, key) {
		this.x_label = labels.x;
		this.y_label = labels.y;
		this.value = labels.value;

		this.key = key;
		this.data = trace[key];
		let data = this.data;

		this.margin = { top: 50, right: 70, bottom: 30, left: 70 };
		this.width = 500 - this.margin.left - this.margin.right;
		this.height = 270 - this.margin.top - this.margin.bottom;

		d3.select('#' + id).remove();

		this.svg = d3.select('#plots')
			.append('svg')
			.attr('id', id)
			.attr('width', this.width + this.margin.left + this.margin.right)
			.attr('height', this.height + this.margin.top + this.margin.bottom + 3)
			.append('g')
			.attr('transform', `translate(${this.margin.left},${this.margin.top})`);

		this.x = d3.scaleLinear().range([0, this.width]);
		this.y = d3.scaleLinear().range([this.height, 0]);

		this.x.domain([0, trace.t]);
		if (data.length > 0) {
			this.min = d3.min(data);
			this.max = d3.max(data);
		} else {
			this.min = 0;
			this.max = 0;
		}

		this.y.domain([this.min, this.max]);
		this.valueline = d3.line()
			.x((d, i) => this.x(i + 1))
			.y(d => this.y(d));

		this.xAxis = d3.axisBottom(this.x).ticks(5);
		this.yAxis = d3.axisLeft(this.y).ticks(5);

		let color = (function* () {
			let idx = 0;
			let colors = ['steel-blue', 'red', 'green', 'black', 'grey', 'yellow'];
			let l = colors.length;
			while (true) {
				yield colors[idx++ % l];
			}
		}());

		this.path = this.svg.append('path')
			.attr('class', 'line');
		if (data.length > 0) {
			this.path.attr('d', this.valueline(data))
				.style('stroke', color.next().value);
		}

		this.svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(0,${this.height})`)
			.call(this.xAxis);

		this.yAxisLabel = this.svg.append('g')
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
			.attr('dy', '2em')
			.style('text-anchor', 'middle')
			.text(this.y_label);
	}

	dataUpdate(trace) {
		let v = trace[this.key][trace.iter - 1];
		if (v > this.max) {
			this.max = v;
		} else if (v < this.min) {
			this.min = v;
		}
	}

	dataGUIUpdate() {
		this.y.domain([this.min, this.max]);
		this.yAxis.scale(this.y);
		this.yAxisLabel.call(this.yAxis);
		this.path.attr('d', this.valueline(this.data));
	}

	update(time) {
		return;
	}

	static clearAll() {
		let plots = d3.select('#plots')._groups[0][0];
		while (plots.children.length > 0) {
			d3.select('#' + plots.children[0].id).remove();
		}
	}
}

class TooltipPlot extends Plot {
	constructor(data, id, labels, key) {
		super(data, id, labels, key);
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
		let y = Util.roundTo(this.data[time], 2);
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

class ExplorationPlot extends TooltipPlot {
	constructor(trace) {
		super(trace, 'exp',
			{ x: 'Steps', y: '% explored', value: 'exp' }, 'explored');
	}
}

class AverageRewardPlot extends TooltipPlot {
	constructor(trace) {
		super(trace, 'rew',
			{ x: 'Steps', y: 'Reward per Step', value: 'rew' }, 'averageReward');
	}
}

class TotalRewardPlot extends TooltipPlot {
	constructor(trace) {
		super(trace, 'rew',
			{ x: 'Steps', y: 'Reward', value: 'rew' }, 'rewards');
	}
}

class AverageTrueRewardPlot extends TooltipPlot {
	constructor(trace) {
		super(trace, 'trew',
			{ x: 'Steps', y: 'True Reward per Step', value: 'rew' }, 'averageTrueReward');
	}
}

class AverageCorruptRewardPlot extends TooltipPlot {
	constructor(trace) {
		super(trace, 'crew',
			{ x: 'Steps', y: 'Corrupt Reward per Step', value: 'rew' }, 'averageCorruptReward');
	}
}

class IGPlot extends TooltipPlot {
	constructor(trace) {
		super(trace, 'ig',
			{ x: 'Steps', y: 'Information gain', value: 'IG' }, 'ig');
	}
}
