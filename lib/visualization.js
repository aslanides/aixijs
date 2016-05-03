class Visualization {
	constructor(env,trace) {
		this.interval;
		this.time;
		this.grid = env.grid;

		this.pos_trace = trace.positions
		this.rew_trace = trace.rewards
		this.q_trace = trace.qs
		this.t_max = trace.rewards.length - 1

		this.d = 40
		this.canvas = document.createElement("canvas")
		this.canvas.id = "canvas"
	    this.canvas.width = (this.d+1)*this.grid.M-1
	    this.canvas.height = (this.d+1)*this.grid.N-1
		var gridvis = document.getElementById("gridvis")
		var canv = document.getElementById("canvas")
		if (canv == undefined) {
			gridvis.style.display="block"
			gridvis.appendChild(this.canvas)
		} else {
			gridvis.replaceChild(this.canvas,gridvis.children[0])
		}
	    this.context = this.canvas.getContext("2d")
      this.graph = new Plot(this.rew_trace,"average")

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
    this.graph.updatePlot(time)
	}
	draw() { // TODO May need to add parameters later for different environments (e.g. what states are visible)
		this.checkTime()
		this.updateUI()
		var d = this.d
		for (var i = 0; i < this.grid.M; i++) {
			for (var j = 0; j < this.grid.N; j++) {
					var t = this.grid.getTile(i,j)
						this.context.fillStyle = t.color
						this.context.fillRect(i*(d+1),j*(d+1),d,d);
					}
			}
			this.context.fillStyle = c_agent;
			this.context.fillRect(this.pos_trace[this.time].x*(d+1),this.pos_trace[this.time].y*(d+1),d,d);
			this.drawToTile(this.pos_trace[this.time].x*this.d, this.pos_trace[this.time].y*this.d, this.q_trace[this.time])
	}

	drawToTile(x, y, data){
			this.context.fillStyle = "white"
			this.context.font = "10px Arial"
			this.context.fillText(Util.roundTo(data,2), x + this.d/4 , y + this.d/2)
	}

	updateUI() {
		document.getElementById("select_time").value = this.time
		document.getElementById("r_ave").value = Util.roundTo(this.rew_trace[this.time] / this.time,4)
		document.getElementById("slider").value = this.time
	}

	static drawMCTSTree(root) {
		var data = root.toJson()

		// adapted from http://www.d3noob.org/2014/01/tree-diagrams-in-d3js_11.html

	    var margin = {top: 30, right: 120, bottom: 20, left: 120}
	    var width = 1960 - margin.right - margin.left
	    var height = 800 - margin.top - margin.bottom
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
