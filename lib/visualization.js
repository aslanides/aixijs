class Visualization {
	constructor(env,history) {
		this.interval;
		this.time;
		this.grid = env.grid;
		this.history = history;
		this.t_max = history.length - 1
		this.d = 40

		this.canvas = document.createElement("canvas")
	    this.canvas.width = (this.d+1)*this.grid.M-1
	    this.canvas.height = (this.d+1)*this.grid.N-1
	    document.body.insertBefore(this.canvas,document.body.childNodes[0])
	    this.context = this.canvas.getContext("2d")
		this.jumpTo(0)
	}
	run(speed) {
		this.pause()
		var f = function(viz) {
			function g() {
				viz.time++
				viz.draw()
			}
			return g
		}
		this.interval = setInterval(f(this),speed)
	}
	pause() {
		clearInterval(this.interval)
	}
	checkTime() {
		if (this.time > this.t_max) {
			this.time = this.t_max
			this.pause()
		}
	}
	jumpTo(time) {
		this.time = time
		this.draw()
	}
	draw() {
		this.checkTime()
		this.update_ui()
		var d = this.d
	    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	    for (var i = 0; i < this.grid.M; i++) {
	        for (var j = 0; j < this.grid.N; j++) {
	            var t = this.grid.getTile(i,j)
	            this.context.fillStyle = t.color
	            this.context.fillRect(i*(d+1),j*(d+1),d,d);
	        }
	    }
	    this.context.fillStyle = c_agent;
	    this.context.fillRect(this.history[this.time].pos.x*(d+1),this.history[this.time].pos.y*(d+1),d,d);
	}
	update_ui() {
		document.getElementById("select_time").value = this.time
		document.getElementById("r_ave").value = this.history[this.time].reward / this.time
	}
	static draw_mcts_tree(root) {
		var data = root.toJson()

		// adapted from http://www.d3noob.org/2014/01/tree-diagrams-in-d3js_11.html

	    var margin = {top: 30, right: 120, bottom: 20, left: 120}
	    var width = 1960 - margin.right - margin.left
	    var height = 500 - margin.top - margin.bottom
	    var id = 0;

	    var tree = d3.layout.tree()
	     .size([height, width]);

	    var diagonal = d3.svg.diagonal()
	     .projection(function(d) { return [d.x, d.y]; });

	    var svg = d3.select("body").append("svg")
	     .attr("width", width + margin.right + margin.left)
	     .attr("height", height + margin.top + margin.bottom)
	      .append("g")
	     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	    var nodes = tree.nodes(data).reverse()
	    var links = tree.links(nodes)

	    nodes.forEach(function(d) { d.y = d.depth * 100; })

	    var node = svg.selectAll("g.node")
	    .data(nodes, function(d) { return d.id || (d.id = ++id); });

	    var nodeEnter = node.enter().append("g")
	    .attr("class", "node")
	    .attr("transform", function(d) {
	    return "translate(" + d.x + "," + d.y + ")"; });

	    nodeEnter.append("circle")
	    .attr("r", 10)

	    nodeEnter.append("text")
	    .attr("y", function(d) {
	    return d.children || d._children ? -18 : 18; })
	    .attr("dy", ".35em")
	    .attr("text-anchor", "middle")
	    .text(function(d) { return d.name; })

	    var link = svg.selectAll("path.link")
	    .data(links, function(d) { return d.target.id; });

	    link.enter().insert("path", "g")
	    .attr("class", "link")
	    .attr("d", diagonal);
	}
}
