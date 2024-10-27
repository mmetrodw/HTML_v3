loadCover(url) {
	// Create a new Image object
	const img = new Image();
	// Load the image source
	img.src = url;
	img.classList.add('tp-cover-image');

	// Add an event listener for when the image is loaded
	img.onload = function() {
		// Once loaded, set opacity to 1 to show the image
		img.style.opacity = '1';
	};

	// Optionally, handle loading errors
	img.onerror = function() {
		console.error("Failed to load image:", url);
		// You might want to show an error placeholder or message
	};

	this.uiElements.coverContainer.appendChild(img);
}