const AU = 149.6e6 * 1000; // 149.6 million km, in meters

class GravitySimulation {
	constructor(canvasId, width, height, fps = 60) {
		this.scale = 100 / AU;

		this.canvasElement = document.getElementById(canvasId);
		this.canvasWidth = width;
		this.canvasHeight = height;
		if (fps <= 0) {
			fps = 60;
		}
		this.fpsInterval = 1000 / fps;
	}

	static get AU() {
		return AU;
	}

	static get EarthDiameter() {
		return 12756000;
	}

	run(bodies, steps = 1000) {
		// method body
		const canvasCtx = this.canvasElement.getContext('2d');

		canvasCtx.currentScale = 1;

		const wheelHandler = (e) => {
			const ev = window.event || e;

			ev.stopPropagation();
			ev.preventDefault();

			const delta = Math.max(-1, Math.min(1, ev.wheelDelta || -e.detail));

			canvasCtx.currentScale += delta / 500;
			console.log(canvasCtx.currentScale);
			if (canvasCtx.currentScale <= 0) {
				canvasCtx.currentScale = 0.1;
			}
			canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
			canvasCtx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
			canvasCtx.scale(canvasCtx.currentScale, canvasCtx.currentScale);
		};

		this.canvasElement.addEventListener('mousewheel', wheelHandler, false);
		this.canvasElement.addEventListener('DOMMouseScroll', wheelHandler, false);

		this.then = Date.now();

		canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		canvasCtx.save();
		canvasCtx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
		canvasCtx.globalCompositeOperation = 'destination-over';

		for (const body of bodies) {
			body.canvasContext = canvasCtx;
		}

		const draw = function (context) {
			const timestep = 24 * 3600;
			let step = 1;

			const now = Date.now();
			const elapsed = now - context.then;

			if (elapsed > context.fpsInterval) {
				context.then = now - elapsed % context.fpsInterval;
				if (step < steps) {
					step++;

					canvasCtx.save();
					canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
					canvasCtx.clearRect(0, 0, context.canvasWidth, context.canvasHeight);
					canvasCtx.restore();

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

						body.draw(body.px * context.scale, body.py * context.scale, body.diameter * context.scale * 100);
					}
				} else {
					clearInterval(context.drawInterval);
				}
			}
		};

		this.drawInterval = setInterval(draw, this.fpsInterval || 16, this); /* default 16ms = 60fps */
	}
}
