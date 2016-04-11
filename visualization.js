class Visualisation {
	constructor(env,history) {
		this.time = 0;
		this.interval;
		this.grid = env.grid;
		this.history = history;
		this.d = 40

		this.canvas = document.createElement("canvas")
	    this.canvas.width = (this.d+1)*this.grid.M-1
	    this.canvas.height = (this.d+1)*this.grid.N-1
	    document.body.insertBefore(this.canvas,document.body.childNodes[0])
	    this.context = this.canvas.getContext("2d")
		this.jump_to(this.time)
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
	jump_to(time) {
		this.time = time
		this.draw()
	}
	draw() {
		this.update_ui()
		var d = this.d
	    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	    for (var i = 0; i < this.grid.M; i++) {
	        for (var j = 0; j < this.grid.N; j++) {
	            var t = this.grid.get_tile(i,j)
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
}
