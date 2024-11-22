async applyPlayerStyles() {
	this.playerState.log = 'Aplly Custom Styles';
	const startTime = new Date().getTime();
	let style =  this.settings.style;
	
	// Get the theme from the settings
	const theme = this.settings.theme;
	// If the theme is not 'custom', apply the corresponding styles
	if(theme !== 'custom' && themes.hasOwnProperty(theme)) {
		style = themes[theme];
	}
	// Call the applyPlayerStyles function with the styles and playerElement
	this.addPlayerStyle(style, this.uiElements.wrapper);

	const endTime = new Date().getTime();
	const duration = (endTime - startTime);
	this.playerState.log = `Custom Styles Applied in ${duration} ms`;
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
			// Replace camelCase with kebab-case (e.g., 'songTitle' becomes 'song-title')
			const cssVariableName = `--${prefix}${prefix ? '-' : ''}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
					
			// Set the CSS variable on the provided element
			element.style.setProperty(cssVariableName, value);
		}
	});
}