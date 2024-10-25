const easingFunctions = {
	linear: (time) => {
		return time;
	},
	easeInSine: (time) => {
		return -1 * Math.cos(time * (Math.PI / 2)) + 1;
	},
	easeOutSine: (time) => {
		return Math.sin(time * (Math.PI / 2));
	},
	easeInOutSine: (time) => {
		return -0.5 * (Math.cos(Math.PI * time) - 1);
	},
	easeInQuad: (time) => {
		return time * time;
	},
	easeOutQuad: (time) => {
		return time * (2 - time);
	},
	easeInOutQuad: (time) => {
		return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
	},
	easeInCubic: (time) => {
		return time * time * time;
	},
	easeOutCubic: (time) => {
		const time1 = time - 1;
		return time1 * time1 * time1 + 1;
	},
	easeInOutCubic: (time) => {
		return time < 0.5
			? 4 * time * time * time
			: (time - 1) * (2 * time - 2) * (2 * time - 2) + 1;
	},
	easeInQuart: (time) => {
		return time * time * time * time;
	},
	easeOutQuart: (time) => {
		const time1 = time - 1;
		return 1 - time1 * time1 * time1 * time1;
	},
	easeInOutQuart: (time) => {
		const time1 = time - 1;
		return time < 0.5
			? 8 * time * time * time * time
			: 1 - 8 * time1 * time1 * time1 * time1;
	},
	easeInQuint: (time) => {
		return time * time * time * time * time;
	},
	easeOutQuint: (time) => {
		const time1 = time - 1;
		return 1 + time1 * time1 * time1 * time1 * time1;
	},
	easeInOutQuint: (time) => {
		const time1 = time - 1;
		return time < 0.5
			? 16 * time * time * time * time * time
			: 1 + 16 * time1 * time1 * time1 * time1 * time1;
	},
	easeInExpo: (time) => {
		if (time === 0) {
			return 0;
		}
		return Math.pow(2, 10 * (time - 1));
	},
	easeOutExpo: (time) => {
		if (time === 1) {
			return 1;
		}
		return -Math.pow(2, -10 * time) + 1;
	},
	easeInOutExpo: (time) => {
		if (time === 0 || time === 1) {
			return time;
		}

		const scaledTime = time * 2;
		const scaledTime1 = scaledTime - 1;

		if (scaledTime < 1) {
			return 0.5 * Math.pow(2, 10 * scaledTime1);
		}

		return 0.5 * (-Math.pow(2, -10 * scaledTime1) + 2);
	},
	easeInCirc: (time) => {
		const scaledTime = time / 1;
		return -1 * (Math.sqrt(1 - scaledTime * time) - 1);
	},
	easeOutCirc: (time) => {
		const time1 = time - 1;
		return Math.sqrt(1 - time1 * time1);
	},
	easeInOutCirc: (time) => {
		const scaledTime = time * 2;
		const scaledTime1 = scaledTime - 2;

		if (scaledTime < 1) {
			return -0.5 * (Math.sqrt(1 - scaledTime * scaledTime) - 1);
		}

		return 0.5 * (Math.sqrt(1 - scaledTime1 * scaledTime1) + 1);
	},
	easeInBack: (time, magnitude = 1.70158) => {
		return time * time * ((magnitude + 1) * time - magnitude);
	},
	easeOutBack: (time, magnitude = 1.70158) => {
		const scaledTime = time / 1 - 1;
		return (
			scaledTime * scaledTime * ((magnitude + 1) * scaledTime + magnitude) + 1
		);
	},
	easeInOutBack: (time, magnitude = 1.70158) => {
		const scaledTime = time * 2;
		const scaledTime2 = scaledTime - 2;
		const s = magnitude * 1.525;

		if (scaledTime < 1) {
			return 0.5 * scaledTime * scaledTime * ((s + 1) * scaledTime - s);
		}

		return 0.5 * (scaledTime2 * scaledTime2 * ((s + 1) * scaledTime2 + s) + 2);
	},
	easeInElastic: (time, magnitude = 0.7) => {
		if (time === 0 || time === 1) {
			return time;
		}

		const scaledTime = time / 1;
		const scaledTime1 = scaledTime - 1;
		const p = 1 - magnitude;
		const s = (p / (2 * Math.PI)) * Math.asin(1);

		return -(
			Math.pow(2, 10 * scaledTime1) *
			Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p)
		);
	},
	easeOutElastic: (time, magnitude = 0.7) => {
		if (time === 0 || time === 1) {
			return time;
		}

		const p = 1 - magnitude;
		const scaledTime = time * 2;
		const s = (p / (2 * Math.PI)) * Math.asin(1);

		return (
			Math.pow(2, -10 * scaledTime) *
				Math.sin(((scaledTime - s) * (2 * Math.PI)) / p) +
			1
		);
	},
	easeInOutElastic: (time, magnitude = 0.65) => {
		if (time === 0 || time === 1) {
			return time;
		}

		const p = 1 - magnitude;
		const scaledTime = time * 2;
		const scaledTime1 = scaledTime - 1;
		const s = (p / (2 * Math.PI)) * Math.asin(1);

		if (scaledTime < 1) {
			return (
				-0.5 *
				(Math.pow(2, 10 * scaledTime1) *
					Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p))
			);
		}

		return (
			Math.pow(2, -10 * scaledTime1) *
				Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p) *
				0.5 +
			1
		);
	},
	easeOutBounce: (time) => {
		const scaledTime = time / 1;

		if (scaledTime < 1 / 2.75) {
			return 7.5625 * scaledTime * scaledTime;
		} else if (scaledTime < 2 / 2.75) {
			const scaledTime2 = scaledTime - 1.5 / 2.75;
			return 7.5625 * scaledTime2 * scaledTime2 + 0.75;
		} else if (scaledTime < 2.5 / 2.75) {
			const scaledTime2 = scaledTime - 2.25 / 2.75;
			return 7.5625 * scaledTime2 * scaledTime2 + 0.9375;
		} else {
			const scaledTime2 = scaledTime - 2.625 / 2.75;
			return 7.5625 * scaledTime2 * scaledTime2 + 0.984375;
		}
	},
	easeInBounce: (time) => {
		return 1 - this.utils.easingFunctions.easeOutBounce(1 - time);
	},
	easeInOutBounce: (time) => {
		if (time < 0.5) {
			return this.utils.easingFunctions.easeInBounce(time * 2) * 0.5;
		}
		return this.utils.easingFunctions.easeOutBounce(time * 2 - 1) * 0.5 + 0.5;
	},
};