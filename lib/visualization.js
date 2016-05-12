class Visualization {
	//TODO make visTile/ visGrid to store Visualization specific data
	//(currently storing in environment grid) (useful for abstraction later)
	//TODO Tidy up
	//TODO Could optimise and draw arrows for only one tile when running
	constructor(env,trace) {
		this.interval;
		this.time;
		this.grid = env.grid; //Make a new "grid" (different from tiles.Grid) with vis specific info
		//this grid should be have separate MxN arrays of data and svg elements (e.g. policy arrows)
		this.arrows = [] //later contained in grid
		this.rectangles = []
		this.pos_trace = trace.positions
		this.rew_trace = trace.rewards
		this.q_trace = trace.qs
		this.a_trace = trace.a
		this.q_list = trace.q_map
		this.t_max = trace.rewards.length - 1
		this.d = 40
		var gridvis = document.getElementById("gridvis")
	    this.width = (this.d+1)*this.grid.M-1
	    this.height = (this.d+1)*this.grid.N-1
		gridvis.style.display="block"
      	this.graph = new Plot(this.rew_trace,"average")
		this.initGrid()
	    this.jumpTo(0)
	}
	//Eventually take an array of initial values which may be non-zero
	initGrid(){
		d3.select("#grid_svg").remove()
		var svg = d3.select(gridvis).append('svg')
			.attr("id", "grid_svg")
			.attr('width', this.width).attr('height', this.height)
        	.append('g').attr('transform', 'scale(1)')

		//marker for arrows, taken from karpathy
      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("refX", 3)
        .attr("refY", 2)
        .attr("markerWidth", 3)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
		.attr("d", "M 0,0 V 4 L2,2	 Z");// Kind of works...

		  var g = svg.append('g')

		for(var i = 0; i< this.grid.M; i++){
			for(var j = 0; j < this.grid.N; j++){
			//initialise values to 0
				this.grid.tiles[i][j].info = [0,0,0,0]
				var xcoord = i*this.d
				var ycoord = j*this.d
				var arrow_list = []
				var t = this.grid.getTile(i,j)
				//initialise rectangles
          		var r = g.append('rect')
            	.attr('x', xcoord)
            	.attr('y', ycoord)
            	.attr('height', this.d)
            	.attr('width', this.d)
            	.attr('fill', t.color)
            	.attr('stroke', 'black')
            	.attr('stroke-width', 2);
          			this.rectangles.push(r);

				//initialise arrows
				if(this.grid.tiles[i][j].legal==true){
				for(var a=0;a<4;a++) {
				    var arrow = g.append('line')
			          .attr('x1', xcoord)
		              .attr('y1', ycoord)
					  .attr('x2', xcoord)
			          .attr('y2', ycoord)
		              .attr('stroke', 'black')
					  .attr('stroke-width', '2')
				      .attr("marker-end", "url(#arrowhead)");
			           arrow_list.push(arrow);
		          }
				  this.arrows.push(arrow_list)
			}else this.arrows.push(null)
		}
	}
		// append agent position circle
      svg.append('circle')
        .attr('cx', 100)
        .attr('cy', 100)
        .attr('r', 15)
        .attr('fill', "blue")
        .attr('stroke', '#000')
        .attr('id', 'cpos');
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
		this.updateGridValues()
		this.draw()
    	this.graph.updatePlot(time)
	}
	//Update whole grid with values when jumping
	updateGridValues(){
		var current_map = this.q_list[this.time/2000].map //Parametrise later
		for (var [key, value] of current_map){
			var coord = {
				//decode key into coord
				x : key.charAt(0),
				y:  key.charAt(1)
			}
			//decode action
			var a = key.charAt(2)
			this.grid.tiles[coord.x][coord.y].info[a] = value
		}
	}
	draw() { // TODO May need to add parameters later for different environments (e.g. what states are visible)
		this.checkTime()
		this.updateUI()
		this.updateTile()
		this.updateArrows()
		if(this.time % 200 == 0){
			this.graph.updatePlot(this.time)
		}
		//Move the agent
		var d = this.d
		var x = this.pos_trace[this.time].x
		var y = this.pos_trace[this.time].y
		d3.select('#cpos')
        .attr('cx', x*d+d/2)
        .attr('cy', y*d+d/2);
	}

	updateArrows(){
		for (var i = 0; i < this.grid.M; i++) {
			for (var j = 0; j < this.grid.N; j++) {
				if(this.grid.tiles[i][j].legal==true){
				var xcoord = i*this.d
				var ycoord = j*this.d
				var k = 1 //softmax constant
				var q_sum = 0
				//get sum of all q-values for softmax
				for(var a=0;a<4;a++){
					var q = this.grid.tiles[i][j].info[a]
					q_sum += Math.pow(Math.E, k*q )
				}


			for(var a=0;a<4;a++){
				var line_size = 0
				var q = this.grid.tiles[i][j].info[a]
				//softmax
				line_size = ((Math.pow(Math.E, k*q))/q_sum)*this.d/2
				var dx = 0
				var dy = 0
				//Find which arrow line to update
				if(a === 0) {dx=-line_size; dy=0;}
				if(a === 1) {dx=line_size; dy=0}
				if(a === 2) {dx=0; dy=line_size;}
				if(a === 3) {dx=0; dy=-line_size;}


				if (line_size > 3) //Only show arrows if line at least 3 pixels long
				{
					this.arrows[i*this.grid.N + j][a].attr('x1', xcoord+this.d/2)
							.attr('visibility', 'visible')


				this.arrows[i*this.grid.N + j][a].attr('x1', xcoord+this.d/2)
				  .attr('y1', ycoord+this.d/2)
				  .attr('x2', xcoord+this.d/2+dx)
				  .attr('y2', ycoord+this.d/2+dy)
			  		}
				else this.arrows[i*this.grid.N + j][a].attr('x1', xcoord+this.d/2)
						.attr('visibility', 'hidden')
				}
			}
		}
	}
}

	updateTile(){
		this.grid.tiles[this.pos_trace[this.time].x][this.pos_trace[this.time].y].info[this.a_trace[this.time]] = this.q_trace[this.time]
	}

	drawToTile(x, y, data){
			this.context.fillStyle = "white"
			this.context.font = "10px Arial"
			this.context.fillText(Util.roundTo(data,2), x + this.d/4 , y + this.d/2)
	}

	updateUI() {
		document.getElementById("display_time").value = `${this.time}/${this.t_max}`
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
