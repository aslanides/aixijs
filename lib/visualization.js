class Visualization {
	constructor(trace) {
		this.pos_trace = trace.states
		this.rew_trace = trace.rewards
		this.model_trace = trace.models
		this.a_trace = trace.actions
		this.t_max = trace.rewards.length - 1
		this.jumps = trace.jumps

		Plot.clearAll()
		d3.select("#vis_svg").remove()
		this.plots = []
		this.plots.push(new RewardPlot(this.rew_trace))

		document.getElementById("slider").max = this.t_max
        document.getElementById("slider").step = (this.t_max+1) / this.jumps
	}
	pause() {
		clearInterval(this.interval)
	}
	run(speed) {
		this.pause()
		var f = function(viz) {
			function g() {
				viz.time++
				viz.draw()
				if (viz.time % ((viz.t_max + 1) / viz.jumps)/speed != 0) {
					return
				}
				for (var p of viz.plots) {
					p.update(viz.time)
				}
			}
			return g
		}
		this.interval = setInterval(f(this),speed)
	}
	jumpTo(time) {
		this.time = time
		this.draw()
		for (var plt of this.plots) {
			plt.update(time)
		}
	}
	draw() {
		if (this.time > this.t_max) {
			this.time = this.t_max
			this.pause()
		}
		this.updateUI()
		this.updateAgent()
		this.updateEnv()
	}
	updateUI() {
		document.getElementById("display_time").value = `${this.time}/${this.t_max}`
		document.getElementById("r_ave").value = Util.roundTo(this.rew_trace[this.time] / this.time,4)
		document.getElementById("slider").value = this.time
	}
	updateAgent() {}
	updateEnv() {}
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

		this.d = 40
	    this.width = (this.d+1)*this.M-1
	    this.height = (this.d+1)*this.N-1
		this.svg = d3.select("#gridvis").append('svg')
			.attr("id", "vis_svg")
			.attr('width', this.width).attr('height', this.height)
        	.append('g').attr('transform', 'scale(1)')
		this.g = this.svg.append('g')

		this.svg.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', 15)
			.attr('fill', "blue")
			.attr('stroke', '#000')
			.attr('id', 'cpos')

		this.grid.forEach((row,idx) => {
			row.forEach((tile,jdx) => {
				var r = this.g.append('rect')
	            	.attr('x', tile.x*this.d)
	            	.attr('y', tile.y*this.d)
	            	.attr('height', this.d)
	            	.attr('width', this.d)
	            	.attr('stroke', 'black')
	            	.attr('stroke-width', 2)
				if (tile.constructor.name != "Chocolate" &&
					tile.constructor.name != "Dispenser") {
					r.attr('fill', tile.color)
				} else {
					r.attr('fill','white')
					this.svg.append('circle')
						.attr('cx', tile.x*this.d + this.d / 2)
						.attr('cy', tile.y*this.d + this.d / 2)
						.attr('r', 5)
						.attr('fill', tile.color)
						.attr('stroke', '#000')
				}
				this.rectangles[idx][jdx] = r
			})
		})

	}
	updateEnv() {
		var x = this.pos_trace[this.time].x
		var y = this.pos_trace[this.time].y
		d3.select('#cpos')
        	.attr('cx', x*this.d+this.d/2)
        	.attr('cy', y*this.d+this.d/2)
	}
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
		this.jumpTo(0)
	}
	updateAgent() {
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

		if (this.time % ((this.t_max +1)/this.jumps) != 0) {
			return
		}
		var index = this.time / ((this.t_max+1) / this.jumps)
		if (this.time == 0) {
			this.grid.forEach(row => {
				row.forEach(tile => {
					tile.info = [0,0,0,0]
				})
			})
		} else {
			for (var [key, value] of this.q_list[index].map) {
				var coord = {
					x : key.charAt(0),
					y : key.charAt(1)
				}
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
		this.ig_trace = trace.ig
		this.plots.push(new IGPlot(this.ig_trace))
	}
	updateAgent() {
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
	static drawMCTSTree(root) {
		var data = root.toJson()
		// adapted from http://www.d3noob.org/2014/01/tree-diagrams-in-d3js_11.html

	    var margin = {top: 30, right: 120, bottom: 20, left: 120}
	    var width = 1960 - margin.right - margin.left
	    var height = 800 - margin.top - margin.bottom
	    var id = 0

	    var tree = d3.layout.tree()
	    	.size([height, width])

	    var diagonal = d3.svg.diagonal()
	    	.projection(d => [d.x, d.y])

	    var svg = d3.select("body").append("svg")
			.attr("width", width + margin.right + margin.left)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	    var nodes = tree.nodes(data).reverse()
	    var links = tree.links(nodes)

	    nodes.forEach(function(d) {d.y = d.depth * 100})

	    var node = svg.selectAll("g.node")
	    	.data(nodes, function(d) {return d.id || (d.id = ++id)})

	    var nodeEnter = node.enter().append("g")
	    	.attr("class", "node")
	    	.attr("transform",d => "translate(" + d.x + "," + d.y + ")")

	    nodeEnter.append("circle")
	    	.attr("r", 10)

	    nodeEnter.append("text")
	    	.attr("y", function(d) {
	    		return d.children || d._children ? -18 : 18
			})
	    	.attr("dy", ".35em")
	    	.attr("text-anchor", "middle")
	    	.text(d => d.name)

	    var link = svg.selectAll("path.link")
	    	.data(links,d => d.target.id)

	    link.enter().insert("path", "g")
	    	.attr("class", "link")
	    	.attr("d", diagonal)
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
	updateAgent() {
		super.updateAgent()
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
			var dat = []
			for (var x = xmin; x < xmax; x += dx) {
				dat.push({x:x,y:arm.prob(x)})
			}
			data.push(dat)
		}
		this.plot = new Plot(data,"kek",{x:"Reward",y:"Pr",value:""})
	}
	updateEnv() {
		throw "TODO: Fix up"
		d3.select("#rofl").remove()
		this.plot.svg.append('circle')
			.attr('cx', this.rew_trace[this.time+1])
			.attr('cy', 0)
			.attr('r', 5)
			.attr('fill', "blue")
			.attr('stroke', '#000')
			.attr('id', 'rofl')

	}
}
