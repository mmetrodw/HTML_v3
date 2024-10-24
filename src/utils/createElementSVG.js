createElementSVG: (tagName, classNames = [], parentElement = null, attributes = [], shouldReturn = true) => {
	// Create a new SVG element with the specified tag name
	// Using createElementNS with the SVG namespace to ensure proper SVG element creation
	const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);

	// If classNames are provided, add them to the element
	if (classNames.length > 0) {
		this.utils.addClass(element, classNames);
	}

	// If attributes are provided, set them on the element
	if (attributes.length > 0) {
		attributes.forEach(attribute => {
			// Each attribute is expected to be an object with a single key-value pair
			const key = Object.keys(attribute)[0];
			element.setAttribute(key, attribute[key]);
		});
	}

	// If a parent element is specified, append the new SVG element to it
	if(parentElement) {
		parentElement.appendChild(element);
	}

	// Return the created SVG element or null based on the shouldReturn parameter
	return shouldReturn ? element : null;
}