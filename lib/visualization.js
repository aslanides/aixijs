class Visualization {
	constructor(trace) {
		this.pos_trace = trace.states
		this.rew_trace = trace.rewards
		this.ig_trace = trace.ig
		this.model_trace = trace.models
		this.a_trace = trace.actions
		this.t_max = trace.rewards.length - 1
	}
}

class GridVisualization extends Visualization {
	constructor(env,trace) {
		super(trace)
		this.interval;
		this.time;
		this.grid = env.grid;
		this.M = env.M
		this.N = env.N
		this.rectangles = []
		for (var i = 0; i < env.M; i++) {
			this.rectangles.push(new Array(env.N))
		}

		this.jumpSteps = 50;
		this.plotFreq = 200;
		document.getElementById("slider").max = this.t_max
        document.getElementById("slider").step = (this.t_max+1) / this.jumpSteps

		this.d = 40
		var gridvis = document.getElementById("gridvis")
	    this.width = (this.d+1)*this.M-1
	    this.height = (this.d+1)*this.N-1
		gridvis.style.display="block"
		Plot.clearAll()
		this.plots = []
		this.plots.push(new RewardPlot(this.rew_trace))
		this.initGrid()
	}
	initGrid(){
		d3.select("#grid_svg").remove()
		this.svg = d3.select(gridvis).append('svg')
			.attr("id", "grid_svg")
			.attr('width', this.width).attr('height', this.height)
        	.append('g').attr('transform', 'scale(1)')
		this.g = this.svg.append('g')

		this.grid.forEach((row,idx) => {
			row.forEach((tile,jdx) => {
				var r = this.g.append('rect')
	            	.attr('x', tile.x*this.d)
	            	.attr('y', tile.y*this.d)
	            	.attr('height', this.d)
	            	.attr('width', this.d)
	            	.attr('fill', tile.color)
	            	.attr('stroke', 'black')
	            	.attr('stroke-width', 2)
				this.rectangles[idx][jdx] = r
			})
		})

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
				var freq = viz.plotFreq/speed
				if(viz.time % freq == 0){
					for (var p of viz.plots) {
						p.updatePlot(viz.time)
					}
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
		for (var p of this.plots) {
			p.updatePlot(time)
		}
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

	updateGridValues() {}
}

class TabularGridVis extends GridVisualization {
	constructor(env,trace) {
		super(env, trace)
		this.arrows = []
		for (var i = 0; i < env.M; i++) {
			this.arrows.push(new Array(env.N))
		}
		this.q_list = trace.q_map
		this.arrow_actions = [0,1,2,3]
		this.initModel()
		this.jumpTo(0)

	}
	initModel() {
		this.svg.append("defs").append("marker")
			.attr("id", "arrowhead")
			.attr("refX", 3)
			.attr("refY", 2)
			.attr("markerWidth", 3)
			.attr("markerHeight", 4)
			.attr("orient", "auto")
			.append("path")
			.attr("d", "M 0,0 V 4 L2,2	 Z");

		this.grid.forEach((row,idx) => {
			row.forEach((tile,jdx) => {
				tile.info = [0,0,0,0]
				if (!tile.legal) {
					this.arrows[idx][jdx] = null
					return
				}
				var xcoord = tile.x * this.d
				var ycoord = tile.y * this.d
				var arrow_list = []
				this.arrow_actions.forEach(a => {
					var arrow = this.g.append('line')
						.attr('x1', xcoord)
						.attr('y1', ycoord)
						.attr('x2', xcoord)
						.attr('y2', ycoord)
						.attr('stroke', 'black')
						.attr('stroke-width', '2')
						.attr("marker-end", "url(#arrowhead)")
					arrow_list.push(arrow)
				})
				this.arrows[idx][jdx] = arrow_list
			})
		})
	}
	updateModel() {
		this.grid.forEach(row => {
			row.forEach(tile => {
				if (!tile.legal) {
					return
				}
				var xcoord = tile.x * this.d
				var ycoord = tile.y * this.d

				var q_sum = 0
				this.arrow_actions.forEach(a => {
					q_sum += Math.pow(Math.E,tile.info[a])
				})

				this.arrow_actions.forEach(a => {
					var line_size = this.d/2 * Math.pow(Math.E,tile.info[a])/q_sum
					var dx = 0
					var dy = 0
					if (a < 2) {
						dx = Math.pow(-1,a+1) * line_size
					} else {
						dy = Math.pow(-1,a) * line_size
					}
					if (line_size > 3) {
						this.arrows[tile.x][tile.y][a]
							.attr('x1', xcoord+this.d/2)
							.attr('y1', ycoord+this.d/2)
							.attr('x2', xcoord+this.d/2+dx)
							.attr('y2', ycoord+this.d/2+dy)
							.attr('visibility', 'visible')
					}  else {
						this.arrows[tile.x][tile.y][a]
							.attr('visibility', 'hidden')
					}
				})
			})
		})
		this.grid[this.pos_trace[this.time].x][this.pos_trace[this.time].y]
			.info[this.a_trace[this.time]] = this.model_trace[this.time]
	}

	updateGridValues() {  //with q values
		var index = this.time / ((this.t_max+1) / this.jumpSteps)
		if (this.time == 0) {
			this.grid.forEach(row => {
				row.forEach(tile => {
					tile.info = [0,0,0,0]
				})
			})
		} else {
			for (var [key, value] of this.q_list[index].map) {
				var coord = {
					//decode key into coord
					x : key.charAt(0),
					y : key.charAt(1)
				}
				//decode action
				var a = key.charAt(2)
				this.grid[coord.x][coord.y].info[a] = value
			}
		}
	}
}

class BayesGridVis extends GridVisualization {
	constructor(env, trace) {
		super(env, trace)
		this.weights = []
		this.color_normalization = this.M*this.N*100
		this.plots.push(new IGPlot(this.ig_trace))
		this.initModel()
	}

	initModel() {
		this.grid.forEach(row => {
			row.forEach(tile => {
				tile.info = this.model_trace[0][tile.x * this.N + tile.y]
				if (tile.constructor.name == "Chocolate" || tile.constructor.name == "Dispenser") {
					this.svg.append('circle')
						.attr('cx', tile.x*this.d + this.d / 2)
						.attr('cy', tile.y*this.d + this.d / 2)
						.attr('r', 5)
						.attr('fill', tile.color)
						.attr('stroke', '#000')
				}
			})
		})
	}

	updateModel() {
		this.grid.forEach(row => {
			row.forEach(tile => {
				tile.info = this.model_trace[this.time][tile.x * this.N + tile.y]
				var rectangle = this.rectangles[tile.x][tile.y]
				var p = tile.info

				var g = 255
				var r = 255 - p * this.color_normalization
				var b = 255 - p * this.color_normalization

				if (tile.color == colors.wall) {
					r -= 100
					g -= 100
					b -= 100
				}

				var rect_fill = 'rgb('+Math.floor(r)+','+Math.floor(g)+','+Math.floor(b)+')'
				rectangle.attr('fill',rect_fill)
			})
		})
	}
}

class AIXIVis extends BayesGridVis {
	constructor(env,trace) {
		super(env,trace)
		this.jumpTo(0)
		// TODO: fix this annoying hack
	}
}

class ThompsonVis extends BayesGridVis {
	constructor(env,trace) {
		super(env,trace)
		this.rho_trace = trace.rhos
		this.jumpTo(0)
	}
	updateModel() {
		super.updateModel()
		d3.select("#thompson_disp").remove()
		this.svg.append('circle')
			.attr("id","thompson_disp")
			.attr('cx', this.rho_trace[this.time].x*this.d + this.d / 2)
			.attr('cy', this.rho_trace[this.time].y*this.d + this.d / 2)
			.attr('r', 5)
			.attr('fill', 'red')
			.attr('stroke', '#000')
	}
}

class GaussianBanditVis extends Visualization {
	constructor(env,trace) {
		super(trace)
		var data = []
		for (var arm of env.actions) {
			var xmin = arm.mu - 4 * arm.sigma
			var xmax = arm.mu + 4 * arm.sigma
			var dx = (xmax-xmin)/10000
			for (var x = xmin; x < xmax; x += dx) {
				data.push(arm.prob(x))
			}
		}
		var plot = new Plot(data,"kek",{x:"lol",y:"wtf",value:"rofl"})
	}
	pause() {

	}
}
