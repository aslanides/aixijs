class Visualization {
	constructor(trace) {
		this.pos_trace = trace.states
		this.rew_trace = trace.rewards
		this.model_trace = trace.models
		this.a_trace = trace.actions
		this.t_max = trace.rewards.length - 1
		this.jumps = trace.jumps
		this.slider = document.getElementById("slider")

		Plot.clearAll()
		d3.select("#vis_svg").remove()
		this.plots = []
		this.plots.push(new RewardPlot(this.rew_trace))

		this.slider.max = this.t_max
        this.slider.step = (this.t_max+1) / this.jumps
	}
	pause() {
		clearInterval(this.interval)
	}
	run(speed) {
		this.pause()
		let f = function(viz) {
			function g() {
				viz.time++
				viz.draw()
			}
			return g
		}
		this.interval = setInterval(f(this),speed)
	}
	jumpTo(time) {
		this.time = time
		this.draw()
	}
	draw() {
		if (this.time > this.t_max) {
			this.time = this.t_max
			this.pause()
		}
		for (let plt of this.plots) {
			plt.update(this.time)
		}
		this.updateUI()
		this.updateAgent()
		this.updateEnv()
	}
	updateUI() {
		this.slider.value = this.time
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
		for (let i = 0; i < env.M; i++) {
			this.rectangles.push(new Array(env.N))
		}

		this.d = config.tile_size_px
	    this.width = (this.d+1)*this.M-1
	    this.height = (this.d+1)*this.N-1
		this.svg = d3.select("#gridvis").append('svg')
			.attr("id", "vis_svg")
			.attr('width', this.width).attr('height', this.height)

		this.grid.forEach((row,idx) => {
			row.forEach((tile,jdx) => {
				let r = GridVisualization.makeTile(this.svg,tile)
				this.rectangles[idx][jdx] = r
			})
		})

		this.svg.append("image")
	    	.attr("xlink:href","assets/robot.svg")
			.attr('x',0)
			.attr('y',0)
	    	.attr('width', this.d)
	    	.attr('height', this.d)
			.attr('id','agent')

		try {
			this.jumpTo(0)
		} catch (err) {}
	}
	updateEnv() {
		let x = this.pos_trace[this.time].x
		let y = this.pos_trace[this.time].y
		d3.select('#agent')
        	.attr('x', x*this.d)
        	.attr('y', y*this.d)
	}
	static makeTile(svg,t,color) {
		const d = config.tile_size_px
		let r = svg.append('rect')
			.attr('x', t.x*d)
			.attr('y', t.y*d)
			.attr('height', d)
			.attr('width', d)
			.attr('stroke', 'black')
			.attr('stroke-width', 2)
		if (t.constructor.name != "Chocolate" &&
			t.constructor.name != "Dispenser") {
			r.attr('fill', t.color)
		} else {
			r.attr('fill',config.colors.empty)
			GridVisualization.addCircle(svg,t.x,t.y,t.color)
		}
		if (color != undefined) {
			r.attr('fill',color)
		}
		return r
	}
	static makeLegend(div,tile,color) {
		let svg = d3.select('#'+div).append('svg')
			.attr("id", div + "_svg")
			.attr('width', config.tile_size_px)
			.attr('height', config.tile_size_px)
		GridVisualization.makeTile(svg,new tile(0,0),color)
	}
	static addCircle(svg,x,y,color,id) {
		const d = config.tile_size_px
		svg.append('circle')
			.attr('cx', x*d + d / 2)
			.attr('cy', y*d + d / 2)
			.attr('r', 5)
			.attr('fill', color)
			.attr('stroke', '#000')
			.attr('id',id)
	}
}

class TabularGridVis extends GridVisualization {
	constructor(env,trace) {
		super(env, trace)
		this.arrows = []
		for (let i = 0; i < env.M; i++) {
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
				let xcoord = tile.x * this.d
				let ycoord = tile.y * this.d
				let arrow_list = []
				this.arrow_actions.forEach(a => {
					let arrow = this.svg.append('line')
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
				let xcoord = tile.x * this.d
				let ycoord = tile.y * this.d

				let q_sum = 0
				this.arrow_actions.forEach(a => {
					q_sum += Math.pow(Math.E,tile.info[a])
				})

				this.arrow_actions.forEach(a => {
					let line_size = this.d/2 * Math.pow(Math.E,tile.info[a])/q_sum
					let dx = 0
					let dy = 0
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
		let index = this.time / ((this.t_max+1) / this.jumps)
		if (this.time == 0) {
			this.grid.forEach(row => {
				row.forEach(tile => {
					tile.info = [0,0,0,0]
				})
			})
		} else {
			for (let [key, value] of this.q_list[index].map) {
				let coord = {
					x : key.charAt(0),
					y : key.charAt(1)
				}
				let a = key.charAt(2)
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
				let rectangle = this.rectangles[tile.x][tile.y]
				let p = tile.info

				let g = 255
				let r = 255 - p * this.color_normalization
				let b = 255 - p * this.color_normalization

				if (tile.color == config.colors.wall) {
					r -= 100
					g -= 100
					b -= 100
				}

				let rect_fill = 'rgb('+Math.floor(r)+','+Math.floor(g)+','+Math.floor(b)+')'
				rectangle.attr('fill',rect_fill)
			})
		})
	}
	static drawMCTSTree(root) {
		let data = root.toJson()
		// adapted from http://www.d3noob.org/2014/01/tree-diagrams-in-d3js_11.html

	    let margin = {top: 30, right: 120, bottom: 20, left: 120}
	    let width = 1960 - margin.right - margin.left
	    let height = 800 - margin.top - margin.bottom
	    let id = 0

	    let tree = d3.layout.tree()
	    	.size([height, width])

	    let diagonal = d3.svg.diagonal()
	    	.projection(d => [d.x, d.y])

	    let svg = d3.select("body").append("svg")
			.attr("width", width + margin.right + margin.left)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	    let nodes = tree.nodes(data).reverse()
	    let links = tree.links(nodes)

	    nodes.forEach(function(d) {d.y = d.depth * 100})

	    let node = svg.selectAll("g.node")
	    	.data(nodes, function(d) {return d.id || (d.id = ++id)})

	    let nodeEnter = node.enter().append("g")
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

	    let link = svg.selectAll("path.link")
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
		let rho_pos = this.rho_trace[this.time]
		GridVisualization.addCircle(this.svg,rho_pos.x,rho_pos.y,config.colors.rho,"thompson_disp")
	}
}

class BanditVis extends Visualization {
	constructor(env,trace) {
		super(trace)
		this.a_trace[0] = 0
		this.dists = env.actions
		let data = []
		for (let arm of env.actions) {
			data.push(arm.data())
		}
		this.plots.push(new BanditPlot(data,this))
		this.jumpTo(0)
	}
}

class MDPVis extends Visualization {
	constructor(env, trace) {
		super(trace)
		this.time = 0;
		this.current_state_no = env.config.initial_state
		this.states = [];
		//Get the positions for the states
		for (let i = 0; i < env.states.length; i++){
			this.states[i] = env.config.states[i]
		}
		let gridvis = document.getElementById("gridvis")
		//TODO fix magic numbers (maybe base canvas size on state locations)
		gridvis.style.display="block"

		this.margin = 50
		let max_x = 0
		let max_y = 0
		for(let i = 0 ; i < this.states.length; i++){
			let x = this.states[i].pos.x
			let y = this.states[i].pos.y
			if (x > max_x) {
				max_x = x
			}
			if (y > max_y) {
				max_y = y
			}
		}

		this.svg = d3.select(gridvis).append('svg')
			.attr("id", "vis_svg")
			.attr('width',max_x + this.margin)
			.attr('height',max_y + this.margin)
		//Initialise environment circles

		for(let i = 0 ; i < this.states.length; i++){
			let x = this.states[i].pos.x
			let y = this.states[i].pos.y
			this.svg.append('circle')
				.attr('cx', x)
				.attr('cy', y)
				.attr('r', 30)
				.attr('fill', "grey")
				.attr('stroke', '#000')
		}

		//Initialise agent
		this.svg.append('circle')
			.attr('cx', this.states[this.current_state_no].pos.x)
			.attr('cy', this.states[this.current_state_no].pos.y)
			.attr('r', 15)
			.attr('fill', "blue")
			.attr('stroke', '#000')
			.attr('id', 'cpos')

		//Function to move elements to back of canvas,taken from http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
		d3.selection.prototype.moveToBack = function() {
		        return this.each(function() {
		            let firstChild = this.parentNode.firstChild;
		            if (firstChild) {
		                this.parentNode.insertBefore(this, firstChild);
		            }
		        });
		    };

		//Draw transition lines
		for (let i = 0 ; i < this.states.length; i++) {
			let state = this.states[i]
			//Initial path position
			let x1 = state.pos.x
			let y1 = state.pos.y
			let m = "" + x1 + "," + y1 + ""
			//Go through each action in this state
			for (let j = 0; j < state.actions.length; j++) {
				//TODO logic for how to show how likely this action is (init here, update in updateAgent
				//Random colour for now
				let r = Math.random() * 256
				let g = Math.random() * 256
				let b = Math.random() * 256
				let fill = 'rgb('+Math.floor(r)+','+Math.floor(g)+','+Math.floor(b)+')'
				let transitions = state.actions[j].probabilities
				//Loop through all possible transitions for the action
				for (let h = 0; h < transitions.length; h++) {
					let new_state = this.states[h]
					let x2 = new_state.pos.x
					let y2 = new_state.pos.y
					let prob = transitions[h]
					let thickness = "" + (prob * 8) + "" //Change thickness based on transition probability
					//If same state, move pos2 to make line a curve

					let midpoint_x = (x2 + x1)/2
					let midpoint_y = (y2 + y1)/2
					let q_x = 0;
					let q_y = 0;
					//For same state
					if (h == i) {
						x1 -= 12//Change to be 1/4 of the circle radius
						x2 += 12
						q_x = midpoint_x
						q_y = midpoint_y + 100 //Fix magic numbers
						//Update q...
					} else if (x2 == x1 || y2 == y1) {
						//Get gradient for path/normal vector and midpoint to scale Bezier control point
						if (x2 == x1) {
							q_x = x1 + k*j
							q_y = midpoint_y
						}
						if (y2 == y1){
							q_x = midpoint_x
							q_y = y1 + k*j
						}
					} else {
						let path_grad = (y2 -y1)/(x2 -x1)
						let normal_grad =  Math.pow(-1, j)/path_grad
						//Scaling factor
						let k = 40*Math.sqrt(Math.abs(normal_grad))
					    q_x = ((k*j)/normal_grad +  midpoint_x)
						q_y = (k*j*normal_grad + midpoint_y)
					}
					let pt = "" + x2 + "," + y2 + ""
					let q = "" + q_x + "," + q_y + ""
					this.svg.append("path")
						.attr("d", "M" + m +  "Q" + q + " " + pt)
						//.attr("stroke", fill)
						.style('stroke', fill)
						.style('stroke-width', thickness)
						.moveToBack()
				}
			}
		}
	}

	updateAgent(){
		//Agent model: Q-Values, maybe use the colouring of the arrows for different
		//	actions to communicate the size of the value (softmax a la AIXI Gridworld)?
	}

	updateEnv(){
		//Change location of agent circle to centre of new state
		let x = this.states[this.pos_trace[this.time]].pos.x
		let y = this.states[this.pos_trace[this.time]].pos.y
		d3.select('#cpos')
        	.attr('cx', x)
        	.attr('cy', y)
	}
}
