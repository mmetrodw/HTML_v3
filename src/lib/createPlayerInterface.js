// Asynchronous method to initialize the player interface and structure its components
async createPlayerInterface() {
	this.playerState.log = "Create Player Interface";
	const startTime = new Date().getTime();

	const { wrapper } = this.uiElements;
	const { rounded, skin, showCover, showShareButton} = this.settings;
	const { addClass } = this;
	const { isMobile, isPlaylist } = this.playerState;

	// Apply classes to wrapper element based on player settings
	addClass(wrapper, [
		"tp-wrapper",
		"tp-loading",
		rounded ? "tp-rounded" : "",
		(skin === "vertical" || isMobile) ? "tp-vertical" : ""
	]);

	// Determine button icon style based on "rounded" setting
	this.buttonIcons = rounded ? this.buttonIcons.rounded : this.buttonIcons.default;

	// Fragment
	const fragment = document.createDocumentFragment();
	// Player container
	const playerContainer = this.createElement("div", "tp-player-container", fragment);
	// Add cover section if cover display is enabled in settings
	if(showCover) this.createCoverSection(playerContainer);
	// Main controls container
	const controlsContainer = this.createElement("div", "tp-controls-container", playerContainer);
	this.createControlsHeader(controlsContainer);
	this.createControlsBody(controlsContainer)
	this.createControlsFooter(controlsContainer);
	// Social media share buttons, if enabled in settings
	if(showShareButton) this.createSocialMediaButtons(playerContainer);
	// Playlist
	if(isPlaylist) this.createPlaylist(fragment);
	// Error display container for any error messages
	const errorContainer = this.createElement("div", "tp-error-container", fragment);
	this.uiElements.errorMessage = this.createElement("div", "tp-error-message", errorContainer);
	this.uiElements.errorCloseButton = this.createButtonWithIcon("error-close", "close", errorContainer)
	// Player Debug
	// this.uiElements.playerLog = this.createElement("div", "tp-player-log", fragment);
	// Append all player components to the main wrapper
	wrapper.appendChild(fragment);

	const endTime = new Date().getTime();
	const duration = (endTime - startTime);
	this.playerState.log = `The Player Interface is Created in ${duration} ms`;
}

createCoverSection(playerContainer) {
	const playerAside = this.createElement("div", "tp-aside-player", playerContainer);
	const coverLoadingSpinner = this.createElement("div", "tp-cover-loading-spinner", playerAside);
	coverLoadingSpinner.innerHTML = "<span></span><span></span><span></span>";
	this.uiElements.coverContainer = this.createElement("div", "tp-cover", playerAside);
	this.uiElements.coverImage = this.createElement("img", "tp-cover-image", this.uiElements.coverContainer);
}

createControlsHeader(controlsContainer) {
	const controlsHeader = this.createElement("div", "tp-controls-header", controlsContainer);
	this.uiElements.songTitle = this.createElement("div", "tp-song-title", controlsHeader);
}

createControlsBody(controlsContainer) {
	const { isPlaylist } = this.playerState;
	const { showRepeatButton, showShuffleButton, showShareButton } = this.settings;

	const controlsBody = this.createElement("div", "tp-controls-body", controlsContainer);
	this.uiElements.playbackButton = this.createButtonWithIcon("playback", "play", controlsBody);
	this.uiElements.audioSeekBar = this.createElement("div", "tp-audio-seek-bar", controlsBody);
	this.uiElements.audioBufferedProgress = this.createElement("div", "tp-audio-buffered-progress", this.uiElements.audioSeekBar);
	this.uiElements.audioPlaybackProgress = this.createElement("div", "tp-audio-playback-progress", this.uiElements.audioSeekBar);
	this.uiElements.audioCurrentTime = this.createElement("div", "tp-audio-current-time", this.uiElements.audioSeekBar);
	this.uiElements.audioCurrentTime.textContent = '00:00';
	this.uiElements.audioDuration = this.createElement("div", "tp-audio-duration", this.uiElements.audioSeekBar);
	this.uiElements.audioDuration.textContent = '00:00';
	const playerLoader = this.createElement("div", "tp-player-loader", this.uiElements.audioSeekBar);
	playerLoader.innerHTML = "<span></span><span></span><span></span>";

	// Previous (only shown for playlists)
	if(isPlaylist) this.uiElements.prevButton = this.createButtonWithIcon("prev", "prev", controlsBody);
	// Repeat button, if enabled in settings
	if(showRepeatButton) this.uiElements.repeatButton = this.createButtonWithIcon("repeat", "repeat", controlsBody);
	// Next (only shown for playlists)
	if(isPlaylist) this.uiElements.nextButton = this.createButtonWithIcon("next", "next", controlsBody);
	// Shuffle button, if enabled in settings and it's playlist
	if(isPlaylist && showShuffleButton) this.uiElements.shuffleButton = this.createButtonWithIcon("shuffle", "shuffle", controlsBody);
	// Share Button, if enabled in settings
	if(showShareButton) this.uiElements.shareButton = this.createButtonWithIcon("share", "share", controlsBody);
}

createControlsFooter(controlsContainer) {
	const { isPlaylist, isMobile } = this.playerState;

	const controlsFooter = this.createElement("div", "tp-controls-footer", controlsContainer);
	// Playlist toggle button for playlists or buy/download buttons for individual songs
	if(isPlaylist) {
		this.uiElements.togglePlaylistButton = this.createButtonWithIcon("toggle-playlis", "playlist", controlsFooter);
	} else {
		this.createBuyDownloadButtons(controlsFooter);
	}

	// Volume Control for non-mobile devices
	if(!isMobile) {
		const volumeControl = this.createElement("div", "tp-volume-control", controlsFooter);
		this.uiElements.volumeButton = this.createButtonWithIcon("volume", "volume", volumeControl);
		this.uiElements.volumeLevelBar = this.createElement("div", "tp-volume-level-bar", volumeControl);
		this.uiElements.volumeLevel = this.createElement("div", "tp-volume-level", this.uiElements.volumeLevelBar);
	}
}

createBuyDownloadButtons(controlsFooter) {
	const song = this.playlist[0];
	// Buy Button
	if(song.buy) {
		const buyButton = this.createCustomLink('buy', song.buy, controlsFooter);
		controlsFooter.appendChild(buyButton);
	}
	// Download Button
	if(song.download) {
		const downloadButton = this.createCustomLink('download', song.download, controlsFooter);
		controlsFooter.appendChild(downloadButton);
	}

}

createSocialMediaButtons(playerContainer) {
	const socialMediaContainer = this.createElement("div", "tp-social-media-container", playerContainer);
	this.uiElements.facebookButton = this.createButtonWithIcon("facebook", "facebook", socialMediaContainer);
	this.uiElements.xButton = this.createButtonWithIcon("x", "x", socialMediaContainer);
	this.uiElements.tumblrButton = this.createButtonWithIcon("tumblr", "tumblr", socialMediaContainer);
}

createPlaylist(fragment) {
	const { isMobile } = this.playerState;
	const { wrapper } = this.uiElements;
	const { addClass } = this;

	this.uiElements.playlistContainer = this.createElement("div", "tp-playlist-container", fragment);
	this.uiElements.playlist = this.createElement("ul", "tp-playlist", this.uiElements.playlistContainer);
	
	// Generate playlist items for each song
	this.playlist.forEach(song => {
		const playlistItem = this.createElement("li", "tp-playlist-item", this.uiElements.playlist);
		playlistItem.title =  song.title ? `${song.artist} - ${song.title}` : song.artist;

		const playlistItemIndicator = this.createElement("div", "tp-playlist-item-indicator", playlistItem);
		playlistItemIndicator.innerHTML = "<span></span><span></span><span></span>";
	
		const playlistItemSongTitle = this.createElement("div", "tp-playlist-item-song-title", playlistItem);
		playlistItemSongTitle.innerHTML = song.title ? `<b>${song.artist}</b> - ${song.title}` : `<b>${song.artist}</b>`;

		if(song.buy) {
			const buyButton = this.createCustomLink('buy', song.buy) ;
			playlistItem.appendChild(buyButton);
		}

		if(song.download) {
			const downloadButton = this.createCustomLink('download', song.download) ;
			playlistItem.appendChild(downloadButton);
		}

		this.uiElements.playlist.appendChild(playlistItem);
	});

	// Update reference to playlist items
	this.uiElements.playlistItem = this.uiElements.playlist.childNodes;

	// Enable playlist scroll if settings allow and song count exceeds visible max
	if(this.settings.allowPlaylistScroll && this.playlist.length > this.settings.maxVisibleSongs) {
		if(!isMobile) {
			addClass(wrapper, "tp-scrollable");
			this.uiElements.scrollbarTrack = this.createElement("div", "tp-scrollbar-track", this.uiElements.playlistContainer);
			this.uiElements.scrollbarThumb = this.createElement("div", "tp-scrollbar-thumb", this.uiElements.scrollbarTrack);
		} else {
			addClass(wrapper, "tp-mobile");
		}
		// Set Playlist Height - Limits visible playlist height to max visible songs, calculated by song height
		this.uiElements.playlist.style.height = `${40 * this.settings.maxVisibleSongs}px`
	}
}

// Helper method to create a new HTML element with classes and optional parent
createElement(tagName, classes, parent) {
	const { addClass } = this;
	const element = document.createElement(tagName);

	if (classes && classes.length > 0) {
		addClass(element, classes);
	}
	if (parent) parent.appendChild(element);
	return element;
}

// Method to create a button with an SVG icon
createButtonWithIcon(type, iconType, parent) {
	const button = this.createElement("button", ["tp-button", `tp-${type}-button`]);
	const icon = this.createSvgIcon(this.buttonIcons[iconType]);
	button.appendChild(icon);
	if (parent) parent.appendChild(button);
	return button;
}

// Creates an SVG icon element based on provided path data
createSvgIcon(path) {
	const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
	const svgElement = document.createElementNS(SVG_NAMESPACE, "svg");
	svgElement.setAttribute("viewBox", "0 0 20 20");

	const pathElement = document.createElementNS(SVG_NAMESPACE, "path");
	pathElement.setAttribute("d", path);
	svgElement.appendChild(pathElement);

	return svgElement;
}

// Method to create a custom link button (buy/download) with an SVG icon
createCustomLink(type, href) {
	const { addClass } = this;
	const link = document.createElement("a");
	addClass(link, ["tp-button", `tp-playlist-song-${type}`]);
	link.href = href;
	link.title = type === "buy" ? "Buy Now" : "Download Now";
	link.target = "_blank";
	if (type === "download") link.download = "";

	// Create SVG icon based on button type
	const icon = this.createSvgIcon(this.buttonIcons[type]);
	link.appendChild(icon);
	return link;
}