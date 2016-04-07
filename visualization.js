class Visualisation {
	constructor(env,res) {
		this.time = 0;
		this.interval;
		this.env = env;
		this.res = res;
		this.d = 40

		this.canvas = document.createElement("canvas")
	    this.canvas.width = (this.d+1)*env.grid.M-1
	    this.canvas.height = (this.d+1)*env.grid.N-1
	    document.body.insertBefore(this.canvas,document.body.childNodes[0])
	    this.context = this.canvas.getContext("2d")
	}
	run(speed) {
		this.pause()
		var f = function(viz) {
			function g() {
				viz.time++
				viz.draw()
				viz.update()
			}
			return g
		}
		this.interval = setInterval(f(this),speed)
	}
	viewTime() {
	    this.time = doc_get("selectTime")
	    this.update()
	    this.draw()
	}
	pause() {
		clearInterval(this.interval)
	}
	increment() {
	    this.pause();
	    this.time++;
	    this.update()
	    this.draw()
	}
	slide(time){
		this.time = time
		this.update()
		this.viewTime()
	}
	draw() {
		var d = this.d
	    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	    for (var i = 0; i < this.env.grid.M; i++) {
	        for (var j = 0; j < this.env.grid.N; j++) {
	            var t = this.env.grid.get_tile(i,j)
	            this.context.fillStyle = t.color
	            this.context.fillRect(i*(d+1),j*(d+1),d,d);
	        }
	    }
	    this.context.fillStyle = "blue";
	    this.context.fillRect(this.res[this.time].pos.x*(d+1),this.res[this.time].pos.y*(d+1),d,d);
	}
	update() {
		document.getElementById("selectTime").value = this.time
		document.getElementById("r_ave").value = this.res[this.time].reward / this.time
	}
}
