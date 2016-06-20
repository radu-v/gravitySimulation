const G = 6.67428e-11;
const AU = 149.6e6 * 1000; // 149.6 million km, in meters

class GravitySimulation {
	constructor(canvasId, width, height, fps) {
		this.scale = 10 / AU;

		this.canvasElement = document.getElementById(canvasId);
		this.canvasWidth = width;
		this.canvasHeight = height;
		this.fpsInterval = 1000 / fps;
	}

	static get G() {
		return G;
	}

	static get AU() {
		return AU;
	}

	run(bodies, steps) {
		// method body
		var context = this.canvasElement.getContext('2d');
		const that = this;

		this.then = Date.now();

		context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		context.save();
		context.translate(this.canvasWidth / 2, this.canvasHeight / 2);
		context.globalCompositeOperation = 'destination-over';

		for (const body of bodies) {
			body.canvasContext = context;
		}

		const draw = function () {
			const timestep = 24 * 3600;
			let step = 1;

			const now = Date.now();
			const elapsed = now - that.then;

			if (elapsed > that.fpsInterval) {
				that.then = now - elapsed % that.fpsInterval;
				if (step < steps) {
					step++;
					// context.clearRect(-that.canvasWidth / 2, -that.canvasHeight / 2, that.canvasWidth, that.canvasHeight);

					const force = [];

					for (const body of bodies) {
						let [total_fx, total_fy] = [0.0, 0.0];

						for (const other of bodies) {
							if (other !== body) {
								const [fx, fy] = body.attraction(other);

								total_fx += fx;
								total_fy += fy;
							}
						}

						force[body.name] = [total_fx, total_fy];
					}

					for (const body of bodies) {
						const [fx, fy] = force[body.name];

						body.vx += fx / body.mass * timestep;
						body.vy += fy / body.mass * timestep;

						body.px += body.vx * timestep;
						body.py += body.vy * timestep;

						body.draw(body.px * that.scale, body.py * that.scale, 1, 1);
					}
				}
			}
			window.requestAnimationFrame(draw);
		};

		draw();
	}
}
