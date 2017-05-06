class MDP2Vis extends Visualization {
	constructor(env, trace, ui) {
		super(trace, ui);
		this.margin = 30;
		this.width = 400;
		this.height = this.width;

		let width = this.width;
		let height = this.height;

		let S = env.numStates;
		let A = env.numActions;
		let P = env.transitions;

		let graph = {};
		graph.nodes = [];
		graph.edges = [];

		for (let s = 0; s < S; s++) {
			graph.nodes.push({ id: s, group: env.groups[s] });
			for (let a = 0; a < A; a++) {
				for (let s_ = 0; s_ < S; s_++) {
					if (P[a][s][s_] == 0) {
						continue;
					}

					graph.edges.push({ source: s, target: s_, a: a, p: P[a][s][s_] });
				}
			}
		}

		let color = d3.scaleOrdinal(d3.schemeCategory10);
		this.svg
			.attr('width', this.width + 2 * this.margin)
			.attr('height', this.height + 2 * this.margin);
		let nodes = graph.nodes;
		let nodeById = d3.map(nodes, d => d.id);
		let links = graph.edges;
		let bilinks = [];
		let svg = this.svg;

		let simulation = d3.forceSimulation()
		.force('link', d3.forceLink().distance(100).strength(0.1))
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force('charge', d3.forceManyBody().strength(-50));

		var link = svg.append('g')
							.attr('class', 'link')
					.selectAll('line')
					.data(links)
					.enter().append('line')
					.style('stroke', d => color(d.a))
					.attr('stroke-width', 5);

		var node = svg.append('g')
						.attr('class', 'nodes')
				.selectAll('circle')
				.data(graph.nodes)
				.enter().append('circle')
						.attr('r', 30)
						.attr('fill', function (d) { return color(d.group); })
						.call(d3.drag()
										.on('start', dragstarted)
										.on('drag', dragged)
										.on('end', dragended));

		node.append('title')
						.text(function (d) { return d.id; });

		simulation
						.nodes(graph.nodes)
						.on('tick', ticked);

		simulation.force('link')
						.links(links);

		function ticked() {
			link
							.attr('x1', function (d) { return d.source.x; })
							.attr('y1', function (d) { return d.source.y; })
							.attr('x2', function (d) { return d.target.x; })
							.attr('y2', function (d) { return d.target.y; });

			node
							.attr('cx', function (d) { return d.x; })
							.attr('cy', function (d) { return d.y; });
		}

		function dragstarted(d) {
			if (!d3.event.active) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(d) {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}

		function dragended(d) {
			if (!d3.event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}

		this.nodes = nodes;
		this.edges = links;

	}

	updateEnv() {
		return;
	}
}
