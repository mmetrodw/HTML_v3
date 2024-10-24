animateTextChange(previousTrack, currentTrack) {
	// Clear any existing animation interval to prevent multiple animations running simultaneously
	if (this.playerState.titleAnimationInterval) {
		clearInterval(this.playerState.titleAnimationInterval);
	}

	// Extract artist and title from previous and current track objects
	let previousArtist = previousTrack.artist;
	let currentArtist = currentTrack.artist;
	let previousTitle = previousTrack.title ? previousTrack.title : " ";
	let currentTitle = currentTrack.title ? currentTrack.title : " ";

	// Function to update the text in the element, adjusting artist and title
	const updateText = () => {
		// Adjust the artist text based on its length compared to the current artist
		previousArtist = this.adjustText(previousArtist, currentArtist);
			
		// Adjust the title text based on its length compared to the current title
		previousTitle = this.adjustText(previousTitle, currentTitle);
			
		// Update the track title element with the new artist and title
		if(previousTitle !== " ") {
			this.uiElements.trackTitle.innerHTML = `<b>${previousArtist}</b> - ${previousTitle}`;
		} else  {
			this.uiElements.trackTitle.innerHTML = `<b>${previousArtist}</b>`;
		}

		// Check if both artist and title have been fully updated to the current values
		if (previousArtist === currentArtist && previousTitle === currentTitle) {
			// Clear the interval once the animation is complete
			clearInterval(this.playerState.titleAnimationInterval);
		}
	};

	// Set a new interval for the animation to update every 7 milliseconds
	this.playerState.titleAnimationInterval = setInterval(updateText, 7); // Interval for smooth animation
}

// Function to adjust the length of the text by either trimming or expanding it
adjustText(previousText, currentText) {
	// If the previous text is longer than the current text, trim the previous text
	if (previousText.length > currentText.length) {
		return previousText.slice(0, -1); // Remove the last character
	} 
	// If the previous text is shorter than the current text, expand the previous text
	else if (previousText.length < currentText.length) {
		return currentText.slice(0, previousText.length + 1); // Add the next character
	}
	// If both texts are of the same length, return the current text
	return currentText; // Texts are the same length
}