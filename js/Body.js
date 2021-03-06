class Body {
	constructor() {
		this.name = 'Body';
		this.mass = null;
		this.vx = this.vy = 0.0;
		this.px = this.py = 0.0;
		this.canvasContext = null;
		this.color = 'black';

		this.G = 6.67428e-11;
		this.endAngle = 2 * Math.PI;
	}

	attraction(otherBody) {
		if (this === otherBody) {
			throw new Error('Attraction of object {self.name} to itself requested');
		}

		const [sx, sy] = [this.px, this.py];
		const [ox, oy] = [otherBody.px, otherBody.py];
		const dx = ox - sx;
		const dy = oy - sy;
		const d = Math.sqrt(dx * dx + dy * dy);

		if (d === 0) {
			throw new Error('Collision between objects {self.name} and {other.name}');
		}

		// force of the gravitation
		const f = this.G * this.mass * otherBody.mass / (d * d);

		// direction of the force
		const theta = Math.atan2(dy, dx);
		const fx = Math.cos(theta) * f;
		const fy = Math.sin(theta) * f;

		return [fx, fy];
	}

	pencolor(color) {
		this.color = color;
	}

	draw(x, y, diameter) {
		if (!this.canvasContext) {
			throw new Error('Empty canvas context');
		}

		this.canvasContext.beginPath();
		this.canvasContext.arc(x, y, diameter, 0, this.endAngle, false);
		this.canvasContext.fillStyle = this.color;
		this.canvasContext.fill();
	}
}
