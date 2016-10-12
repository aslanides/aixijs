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
		let edges = graph.edges;
		let bilinks = [];
		let svg = this.svg;

		svg.append('defs').selectAll('marker')
		.data(['end'])
		.enter().append('marker')
		.attr('id', 'arrowhead')
		.attr('viewBox', '0 -5 10 10')
		.attr('refX', 15)
		.attr('refY', -1.5)
		.attr('markerWidth', 6)
		.attr('markerHeight', 6)
		.attr('orient', 'auto')
		.append('path')
		.attr('d', 'M0,-5L10,0L0,5');

		edges.forEach(edge => {
			let s = edge.source = nodeById.get(edge.source);
			let t = edge.target = nodeById.get(edge.target);
			let i = { a: edge.a }; // intermediate node
			nodes.push(i);
			if (s == t) {
				let j = { a: edge.a };
				nodes.push(j);
				edges.push({ source: s, target: i, a: edge.a }, { source: i, target: j, a: edge.a }, { source: j, target: t, a: edge.a });
				bilinks.push([s, i, j, s]);
				return;
			}

			edges.push({ source: s, target: i, a: edge.a }, { source: i, target: t, a: edge.a });
			bilinks.push([s, i, t]);
		});

		let link = svg.selectAll('.link')
			.data(bilinks)
			.enter().append('path')
			.attr('fill', 'none')
			.style('stroke', d => color(d[1].a))
			.attr('marker-end', _ => `url(#arrowhead)`);

		let node = svg.selectAll('.node')
			.data(nodes.filter(d => d.id != undefined))
			.enter().append('circle')
			.attr('class', 'node')
			.attr('r', 30)
			.attr('fill', d => color(d.group))
			.call(d3.drag()
			.on('start', dragstarted)
			.on('drag', dragged)
			.on('end', dragended));

		node.append('title')
			.text(d => d.id);

		let simulation = d3.forceSimulation()
			//.force('link', d3.forceLink(edges).distance(50).strength(.1))
			.force('collide', d3.forceCollide(30).strength(0.2))
			.force('centerX', d3.forceX(width / 2).strength(.1))
			.force('centerY', d3.forceY(height / 2).strength(1));

		simulation.nodes(nodes)
			.on('tick', ticked);

		function ticked() {
			link.attr('d', positionLink);
			node.attr('transform', positionNode);
		}

		function positionLink(d) {
			let curve = 'S';
			if (d.length == 4) {
				curve = 'C';
			}

			let s = `M${d[0].x},${d[0].y}${curve}${d[1].x},${d[1].y} ${d[2].x},${d[2].y}`;
			if (d.length == 4) {
				s += ` ${d[3].x},${d[3].y}`;
			}

			return s;
		}

		let positionNode = d => `translate(${d.x},${d.y})`;

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
		this.edges = edges;

	}

	updateEnv() {

	}
}
