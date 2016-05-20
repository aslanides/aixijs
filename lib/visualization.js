class Visualization {
	constructor(env,trace) {
		this.interval;
		this.time;
		this.grid = env.grid;
		this.rectangles = []
		this.arrows = [] //later contained in grid
		this.weights = [] //maybe make a universal array "this.gridValues"
		this.pos_trace = trace.states
		this.rew_trace = trace.rewards
		this.model_trace = trace.models
		this.a_trace = trace.actions
		this.q_list = trace.q_map
		this.t_max = trace.rewards.length - 1
		this.jumpSteps = 50;
		this.graphFreq = 200;
		document.getElementById("slider").max = this.t_max
        document.getElementById("slider").step = (this.t_max+1) / this.jumpSteps
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
		this.svg = d3.select(gridvis).append('svg')
			.attr("id", "grid_svg")
			.attr('width', this.width).attr('height', this.height)
        	.append('g').attr('transform', 'scale(1)')

		this.g = this.svg.append('g')


		for(var i = 0; i< this.grid.M; i++){
			for(var j = 0; j < this.grid.N; j++){

				//initialise values to 0
				//this.grid.tiles[i][j].info = [0,0,0,0]
				var xcoord = i*this.d
				var ycoord = j*this.d
				var t = this.grid.getTile(i,j)

				//initialise rectangles
				var r = this.g.append('rect')
	            	.attr('x', xcoord)
	            	.attr('y', ycoord)
	            	.attr('height', this.d)
	            	.attr('width', this.d)
	            	.attr('fill', t.color)
	            	.attr('stroke', 'black')
	            	.attr('stroke-width', 2);


				this.rectangles.push(r);
			}
		}
		this.initModel() //Cover arrows etc here
		// append agent position circle
		this.svg.append('circle')
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
				viz.checkTime()
				var freq = viz.graphFreq/speed
				if(viz.time % freq == 0){
					viz.graph.updatePlot(viz.time)
				}
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

	draw() {
		this.checkTime()
		this.updateUI()
		this.updateModel()
		//Move the agent
		var d = this.d
		var x = this.pos_trace[this.time].x
		var y = this.pos_trace[this.time].y
		d3.select('#cpos')
        .attr('cx', x*d+d/2)
        .attr('cy', y*d+d/2);
	}

	updateUI() {
		document.getElementById("display_time").value = `${this.time}/${this.t_max}`
		document.getElementById("r_ave").value = Util.roundTo(this.rew_trace[this.time] / this.time,4)
		document.getElementById("slider").value = this.time
	}
}


class TabularVis extends Visualization {
	constructor(env, trace){
		super(env, trace)
	}
	initModel(){
		//marker for arrows, taken from karpathy
		this.svg.append("defs").append("marker")
			.attr("id", "arrowhead")
			.attr("refX", 3)
			.attr("refY", 2)
			.attr("markerWidth", 3)
			.attr("markerHeight", 4)
			.attr("orient", "auto")
			.append("path")
			.attr("d", "M 0,0 V 4 L2,2	 Z");// Kind of works...


		for(var i = 0; i< this.grid.M; i++){
			for(var j = 0; j < this.grid.N; j++){
				//initialise q-values to 0
				this.grid.tiles[i][j].info = [0,0,0,0]
				var xcoord = i*this.d
				var ycoord = j*this.d
				//initialise arrows
				var arrow_list = []
				if (this.grid.tiles[i][j].legal) {
					for(var a=0;a<4;a++) {
						var arrow = this.g.append('line')
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
				} else {
					this.arrows.push(null)
				}
			}
		}
	}


	updateModel(){
		//updateArrows()

		for (var i = 0; i < this.grid.M; i++) {
			for (var j = 0; j < this.grid.N; j++) {
				if (!this.grid.tiles[i][j].legal) {
					continue
				}
				var xcoord = i*this.d
				var ycoord = j*this.d
				var k = 1 //softmax constant
				var q_sum = 0
				//get sum of all q-values for softmax

				for(var a=0; a<4; a++){
					var q = this.grid.tiles[i][j].info[a]
					q_sum += Math.pow(Math.E, k*q)
				}

				for(var a=0; a<4; a++){
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

					if (line_size > 3) {//show arrows if line at least 3 pixels long
						this.arrows[i*this.grid.N + j][a]
							.attr('x1', xcoord+this.d/2)
							.attr('y1', ycoord+this.d/2)
							.attr('x2', xcoord+this.d/2+dx)
							.attr('y2', ycoord+this.d/2+dy)
							.attr('visibility', 'visible')
					} else {
						this.arrows[i*this.grid.N + j][a]
							.attr('visibility', 'hidden')
					}
				}
			}
		}

		//updateTile() // ie update tile q value each time step
		this.grid.tiles[this.pos_trace[this.time].x][this.pos_trace[this.time].y]
			.info[this.a_trace[this.time]] = this.model_trace[this.time]
	}

	updateGridValues(){  //with q values
		var index = this.time / ((this.t_max+1) / this.jumpSteps)
		var current_map = this.q_list[index].map //Parametrise later
		if(this.time == 0){
			for(var i = 0; i< this.grid.M; i++){
				for(var j = 0; j < this.grid.N; j++){
					//initialise values to 0
					this.grid.tiles[i][j].info = [0,0,0,0]
				}
			}
		}
		else
		{
			for (var [key, value] of current_map){
				var coord = {
					//decode key into coord
					x : key.charAt(0),
					y : key.charAt(1)
				}
				//decode action
				var a = key.charAt(2)
				this.grid.tiles[coord.x][coord.y].info[a] = value
			}
		}
	}
}

class BayesVis extends Visualization {
	constructor(env, trace){
		super(env, trace)
	}

	initModel(){
		for(var i = 0; i< this.grid.M; i++){
			for(var j = 0; j < this.grid.N; j++){
				//initialise weights
				var t = this.grid.getTile(i,j)
				t.info = this.model_trace[0][i*this.grid.N + j]

				//Place a small circle at chocolate / dispenser location
				if(t.color == c_chocolate || t.color == c_dispenser){
					this.svg.append('circle')
						.attr('cx', i*this.d + this.d / 2)
						.attr('cy', j*this.d + this.d / 2)
						.attr('r', 5)
						.attr('fill', t.color)
						.attr('stroke', '#000')
				}

			}
		}
	}

	updateModel(){
		for (var i = 0; i < this.grid.M; i++) {
			for (var j = 0; j < this.grid.N; j++) {
				/*if (!this.grid.tiles[i][j].legal) {
					continue
				}*/
				//update weights here
				var t = this.grid.getTile(i,j)
				t.info = this.model_trace[this.time][i*this.grid.N + j]

				var r=255,g=255,b=255;
				var rectangle = this.rectangles[i*this.grid.N + j]
				var prob = t.info
				//change intensity based on size of grid, to compensate for lower probabilities
				var color_constant = this.grid.N*this.grid.M*100;

          		g = 255; r = 255 - prob*color_constant; b = 255 - prob*color_constant;

          		var rect_fill = 'rgb('+Math.floor(r)+','+Math.floor(g)+','+Math.floor(b)+')'
				if(t.color != c_wall){
					rectangle.attr('fill', rect_fill)
				}

				//if(prob == 0){rectangle.attr('fill', "grey")}
			}
		}
	}

	updateGridValues(){
		return null //not necessary as every time step has full weight array
	}

}
