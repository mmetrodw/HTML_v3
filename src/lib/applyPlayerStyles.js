async applyPlayerStyles(styles, element, prefix = '') {
	this.playerState.status = 'Aplly Custom Styles';
	// Call the applyPlayerStyles function with the styles and playerElement
	this.addPlayerStyle(styles, element, prefix);
	this.playerState.status = 'Custom Styles Applied';
}

addPlayerStyle(styles, element, prefix = '') {
	// Iterate over the keys of the styles object
	Object.keys(styles).forEach((key) => {
		const value = styles[key];

		// If the value is an object, recursively process it
		if (typeof value === 'object' && value !== null) {
			// Call the function recursively with updated prefix
			this.addPlayerStyle(value, element, prefix ? `${prefix}-${key}` : key);
		} else {
			// Generate the CSS variable name using the key
			// Replace camelCase with kebab-case (e.g., 'trackTitle' becomes 'track-title')
			const cssVariableName = `--${prefix}${prefix ? '-' : ''}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
					
			// Set the CSS variable on the provided element
			element.style.setProperty(cssVariableName, value);
		}
	});
}