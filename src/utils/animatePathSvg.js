animatePathSvg: (pathElement, fromD, toD, duration = 1000, easing = 'linear', callback) => {
	let startTime = null;

	// Function to interpolate the 'd' attribute of the path element
	function interpolateD(from, to, progress) {
		// Split 'd' attribute values into commands and numbers
		const fromCommands = from.match(/[a-zA-Z]+|[-.\d]+/g);
		const toCommands = to.match(/[a-zA-Z]+|[-.\d]+/g);

		let result = '';
		let isNumber = false;

		// Iterate over each command/number pair
		for (let i = 0; i < fromCommands.length; i++) {
			if (isNaN(fromCommands[i])) {
				// If it's a command (e.g., M, L), append it to the result
				result += (isNumber ? ' ' : '') + fromCommands[i];
				isNumber = false; // The next value will be a number
			} else {
				// If it's a number, interpolate between 'from' and 'to' values
				const fromValue = parseFloat(fromCommands[i]);
				const toValue = parseFloat(toCommands[i]);
				const interpolatedValue = fromValue + (toValue - fromValue) * progress;

				// Determine decimal places based on progress (more precise during animation)
				result += (isNumber ? ',' : ' ') + interpolatedValue;

				isNumber = true; // The next value will be a number
			}
		}

		return result;
	}

	// Function to handle the animation frame
	const animate = (currentTime) => {
		if (!startTime) startTime = currentTime; // Initialize start time on first frame
		const elapsedTime = currentTime - startTime; // Calculate elapsed time
		const progress = Math.min(elapsedTime / duration, 1); // Normalize progress to a value between 0 and 1

		// Apply easing function to smooth the progress
		const easedProgress = easingFunctions[easing](progress);

		// Update the 'd' attribute of the path element with interpolated values
		pathElement.setAttribute('d', interpolateD(fromD, toD, easedProgress));

		// Continue animating if progress is less than 1, otherwise call the callback function
		if (progress < 1) {
			requestAnimationFrame(animate); // Request next animation frame
		} else if (callback) {
			callback(); // Call the callback function when animation is complete
		}
	};

	requestAnimationFrame(animate); // Start the animation
}