class Puckworld extends Environment {
	constructor(options) {
		super();
		this.ppx = Math.random(); // puck x,y
		this.ppy = Math.random();
		this.pvx = Math.random() * 0.05 - 0.025; // velocity
		this.pvy = Math.random() * 0.05 - 0.025;
		this.tx = Math.random(); // target
		this.ty = Math.random();
		this.tx2 = Math.random(); // target
		this.ty2 = Math.random(); // target
		this.rad = 0.05;
		this.t = 0;
		this.reward = 0;
		this.actions = new Array(5);
		this.BADRAD = 0.25;
	}

	generatePercept() {
		return { obs: this.getState(), rew: this.reward };
	}

	getState() {
		let obs = [
			this.ppx - 0.5,
			this.ppy - 0.5,
			this.pvx * 10,
			this.pvy * 10,
			this.tx - this.ppx,
			this.ty - this.ppy,
			this.tx2 - this.ppx,
			this.ty2 - this.ppy,
		];
		return obs;
	}

	perform(a) {
		// world dynamics
		this.ppx += this.pvx; // newton
		this.ppy += this.pvy;
		this.pvx *= 0.95; // damping
		this.pvy *= 0.95;

		// agent action influences puck velocity
		let accel = 0.002;
		if (a === 0) this.pvx -= accel;
		if (a === 1) this.pvx += accel;
		if (a === 2) this.pvy -= accel;
		if (a === 3) this.pvy += accel;

		// handle boundary conditions and bounce
		if (this.ppx < this.rad) {
			this.pvx *= -0.5; // bounce!
			this.ppx = this.rad;
		}

		if (this.ppx > 1 - this.rad) {
			this.pvx *= -0.5;
			this.ppx = 1 - this.rad;
		}

		if (this.ppy < this.rad) {
			this.pvy *= -0.5; // bounce!
			this.ppy = this.rad;
		}

		if (this.ppy > 1 - this.rad) {
			this.pvy *= -0.5;
			this.ppy = 1 - this.rad;
		}

		this.t += 1;
		if (this.t % 100 === 0) {
			this.tx = Math.random(); // reset the target location
			this.ty = Math.random();
		}

		// compute distances
		let dx = this.ppx - this.tx;
		let dy = this.ppy - this.ty;
		let d1 = Math.sqrt(dx * dx + dy * dy);

		dx = this.ppx - this.tx2;
		dy = this.ppy - this.ty2;
		let d2 = Math.sqrt(dx * dx + dy * dy);

		let dxnorm = dx / d2;
		let dynorm = dy / d2;
		let speed = 0.001;
		this.tx2 += speed * dxnorm;
		this.ty2 += speed * dynorm;

		// compute reward
		let r = -d1; // want to go close to green
		if (d2 < this.BADRAD) {
			// but if we're too close to red that's bad
			r += 2 * (d2 - this.BADRAD) / this.BADRAD;
		}

		this.reward = r;
	}
}
