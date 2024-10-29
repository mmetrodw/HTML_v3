async validatePlayerConfig() {
	this.playerState.log = "Validating Player Configuration";
	const startTime = new Date().getTime();

	const playerContainerElement = document.getElementById(this.settings.container);

	// Check if the 'id' property is missing or invalid
	if (!this.settings.container) {
		throw Error("tPlayer Error: Please enter a valid container name.");
	}

	// Check if the 'wrapper' element associated with the given 'id' is missing
	if (!playerContainerElement) {
		throw Error(`tPlayer Error: Element with id "${this.settings.container}" not found.`);
	}

	this.uiElements.wrapper = playerContainerElement;

	// Check if the 'playlist' property is missing or not provided
	if (!Array.isArray(this.playlist) || this.playlist.length === 0) {
		throw Error("tPlayer Error: Please, add a valid Playlist to tPlayer.");
	}

	// Check for audio link for each playlist item and update properties
	for( const item of this.playlist) {
		if(item.audio === undefined || item.audio === "") {
			throw Error("tPlayer Error: Not all tracks in the playlist have the audio property.");
		}

		// Update artist if Album Artist is set
		if (this.settings.album.artist) {
			item.artist = this.settings.album.artist;
		}
		// Update cover if Album Cover is set and cover usage is enabled
		if (this.settings.album.cover && this.settings.album.cover !== "" && this.settings.showCover) {
			item.cover = this.settings.album.cover;
		}
	}
	
	this.playerState.isPlaylist = this.playlist.length > 1 ? true : false;
	
	const endTime = new Date().getTime();
	const duration = (endTime - startTime);
	this.playerState.log = `The Configuration Has Been Validated ${duration} ms.`;
}