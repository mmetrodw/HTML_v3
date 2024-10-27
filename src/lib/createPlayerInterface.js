createSvg(tag, className = "", attributes = null, children = null) {
	const element = document.createElementNS("http://www.w3.org/2000/svg", tag);

	// Add class to the element if provided
	if (className) element.classList.add(className);

	// Apply each attribute to the element
	if (attributes) {
		for (let attr in attributes) {
			element.setAttribute(attr, attributes[attr]);
		}
	}

	// Recursively add children if provided
	if (children) {
		for (let child of children) {
			let childElement = this.createSvg("path", child.className, child.attributes, null);
			element.appendChild(childElement);
		}
	}

	return element;
}

// Method to create a custom link button (buy/download) with an SVG icon
createCustomLink(type, href) {
	const { addClass } = this;
	const link = document.createElement("a");
	addClass(link, ["tp-button", `tp-playlist-track-${type}`]);
	link.href = href;
	link.title = type === "buy" ? "Buy Now" : "Download Now";
	link.target = "_blank";
	if (type === "download") link.download = "";

	// Create SVG icon based on button type
	const icon = this.createSvg("svg", null, { viewBox: "0 0 20 20" }, [
		{ tagName: "path", className: "tp-stroke", attributes: { d: this.buttonIcons[type] } }
	]);
	link.appendChild(icon);
	return link;
}

// Asynchronous method to initialize the player interface and structure its components
async createPlayerInterface() {
	this.playerState.log = "Create Player Interface";
	const startTime = new Date().getTime();

	const { wrapper } = this.uiElements;
	const { rounded, skin, showCover, showRepeatButton, showShuffleButton, showShareButton} = this.settings;
	const { addClass } = this;
	const { isMobile, isPlaylist } = this.playerState;

	// Apply classes to wrapper element based on player settings
	addClass(wrapper, ["tp-wrapper", "tp-loading", rounded ? "tp-rounded" : "", skin === "vertical" ? "tp-vertical" : ""]);

	// Set button icons based on "rounded" setting
	this.buttonIcons = rounded ? this.buttonIcons.rounded : this.buttonIcons.default;

	const fragment = document.createDocumentFragment();

	// Player container setup
	const playerContainer = document.createElement("div");
	addClass(playerContainer, "tp-player-container");
	fragment.appendChild(playerContainer);

	// Add cover section if cover display is enabled
	if(showCover) {
		const coverContainer = document.createElement("div");
		addClass(coverContainer, "tp-aside-player");
		playerContainer.appendChild(coverContainer);

		const coverLoadingSpinner = document.createElement("div");
		addClass(coverLoadingSpinner, "tp-cover-loading-spinner");
		coverLoadingSpinner.innerHTML = "<span></span><span></span><span></span>";
		coverContainer.appendChild(coverLoadingSpinner);

		const cover = document.createElement("div");
		addClass(cover, "tp-cover");
		coverContainer.appendChild(cover);

		this.uiElements.coverImage = document.createElement("img");
		addClass(this.uiElements.coverImage, "tp-cover-image");
		cover.appendChild(this.uiElements.coverImage);
	}

	// Controls container and structure
	const controlsContainer = document.createElement("div");
	addClass(controlsContainer, "tp-controls-container");

	// Header section with track title
	const controlsHeader = document.createElement("div");
	addClass(controlsHeader, "tp-controls-header");
	controlsContainer.appendChild(controlsHeader);

	this.uiElements.trackTitle = document.createElement("div");
	addClass(this.uiElements.trackTitle, "tp-track-title");
	this.uiElements.trackTitle.innerHTML = "Loading...";
	controlsHeader.appendChild(this.uiElements.trackTitle);

	// Controls body, including playback, seek bar, and buttons
	const controlsBody = document.createElement("div");
	addClass(controlsBody, "tp-controls-body");

	// Playback button
	this.uiElements.playbackButton = document.createElement("button");
	addClass(this.uiElements.playbackButton, ["tp-button", "tp-playback-button"]);

	// Playback Icon
	const playbackIcon = this.createSvg("svg", null, {viewBox: "0 0 20 20"}, [
		{ tagName: "path", className: null, attributes: { d: this.buttonIcons.playback.play } }
	]);
	this.uiElements.playbackButton.appendChild(playbackIcon);
	controlsBody.appendChild(this.uiElements.playbackButton);

	// Seek bar (audio progress bar)
	this.uiElements.audioSeekBar = document.createElement("div");
	addClass(this.uiElements.audioSeekBar, "tp-audio-seek-bar");
	controlsBody.appendChild(this.uiElements.audioSeekBar);

	// Buffered progress in the seek bar
	this.uiElements.audioBufferedProgress = document.createElement("div");
	addClass(this.uiElements.audioBufferedProgress, "tp-audio-buffered-progress");
	this.uiElements.audioSeekBar.appendChild(this.uiElements.audioBufferedProgress);

	// Playback progress in the seek bar
	this.uiElements.audioPlaybackProgress = document.createElement("div");
	addClass(this.uiElements.audioPlaybackProgress, "tp-audio-playback-progress");
	this.uiElements.audioSeekBar.appendChild(this.uiElements.audioPlaybackProgress);

	// Current Time
	this.uiElements.audioCurrentTime = document.createElement("div");
	addClass(this.uiElements.audioCurrentTime, "tp-audio-current-time");
	this.uiElements.audioSeekBar.appendChild(this.uiElements.audioCurrentTime);

	// Duration
	this.uiElements.audioDuration = document.createElement("div");
	addClass(this.uiElements.audioDuration, "tp-audio-duration");
	this.uiElements.audioSeekBar.appendChild(this.uiElements.audioDuration);

	// Loading spinner for the player
	const playerLoader = document.createElement("div");
	addClass(playerLoader, "tp-player-loader");
	playerLoader.innerHTML = "<span></span><span></span><span></span>";
	this.uiElements.audioSeekBar.appendChild(playerLoader);

	// Previous track button (only for playlists)
	if(isPlaylist) {
		this.uiElements.prevButton = document.createElement("button");
		addClass(this.uiElements.prevButton, ["tp-button", "tp-prev-button"]);

		// Prev Icon
		const prevIcon = this.createSvg("svg", null, {viewBox: "0 0 20 20"}, [
			{ tagName: "path", className: "tp-fill", attributes: { d: this.buttonIcons.prev.fill } },
			{ tagName: "path", className: "tp-stroke", attributes: { d: this.buttonIcons.prev.stroke } }
		]);

		this.uiElements.prevButton.appendChild(prevIcon);
		controlsBody.appendChild(this.uiElements.prevButton);
	}

	// Repeat button, if enabled in settings
	if(showRepeatButton) {
		this.uiElements.repeatButton = document.createElement("button");
		addClass(this.uiElements.repeatButton, ["tp-button", "tp-repeat-button"]);

		// Repeat Icon
		const repeatIcon = this.createSvg("svg", null, {viewBox: "0 0 20 20"}, [
			{ tagName: "path", className: "tp-fill", attributes: { d: this.buttonIcons.repeat.fill } },
			{ tagName: "path", className: "tp-stroke", attributes: { d: this.buttonIcons.repeat.stroke } }
		]);

		this.uiElements.repeatButton.appendChild(repeatIcon);
		controlsBody.appendChild(this.uiElements.repeatButton);
	}

	// Next track button (only for playlists)
	if(isPlaylist) {
		this.uiElements.nextButton = document.createElement("button");
		addClass(this.uiElements.nextButton, ["tp-button", "tp-next-button"]);

		// Next Icon
		const nextIcon = this.createSvg("svg", null, {viewBox: "0 0 20 20"}, [
			{ tagName: "path", className: "tp-fill", attributes: { d: this.buttonIcons.next.fill } },
			{ tagName: "path", className: "tp-stroke", attributes: { d: this.buttonIcons.next.stroke } }
		]);

		this.uiElements.nextButton.appendChild(nextIcon);
		controlsBody.appendChild(this.uiElements.nextButton);
	}

	// Shuffle button if shuffle is enabled in settings
	if(showShuffleButton) {
		this.uiElements.shuffleButton = document.createElement("button");
		addClass(this.uiElements.shuffleButton, ["tp-button", "tp-shuffle-button"]);

		// Shuffle Icon
		const shuffleIcon = this.createSvg("svg", null, {viewBox: "0 0 20 20"}, [
			{ tagName: "path", className: "tp-fill", attributes: { d: this.buttonIcons.shuffle.fill } },
			{ tagName: "path", className: "tp-stroke", attributes: { d: this.buttonIcons.shuffle.stroke } }
		]);

		this.uiElements.shuffleButton.appendChild(shuffleIcon);
		controlsBody.appendChild(this.uiElements.shuffleButton);
	}

	// Share Button, if share is enabled in settings
	if(showShareButton){
		this.uiElements.shareButton = document.createElement("button");
		addClass(this.uiElements.shareButton, ["tp-button", "tp-share-button"]);

		// Share Icon
		const shuffleIcon = this.createSvg("svg", null, {viewBox: "0 0 20 20"}, [
			{ tagName: "path", className: "tp-fill", attributes: { d: this.buttonIcons.share.closed.fill } },
			{ tagName: "path", className: "tp-stroke", attributes: { d: this.buttonIcons.share.closed.stroke } }
		]);

		this.uiElements.shareButton.appendChild(shuffleIcon);
		controlsBody.appendChild(this.uiElements.shareButton);
	}

	// Adds all controls to the main controls container
	controlsContainer.appendChild(controlsBody);

	// Controls Footer - Create a footer section within the player controls
	const controlsFooter = document.createElement("div");
	addClass(controlsFooter, "tp-controls-footer");
	controlsContainer.appendChild(controlsFooter);

	// If a playlist, add a button to toggle the playlist view
	if(isPlaylist) {
		// Toggle Playlist Button
		this.uiElements.togglePlaylistButton = document.createElement("button");
		addClass(this.uiElements.togglePlaylistButton, ["tp-button", "tp-toggle-playlist-button"]);

		// Toggle Playlist Icons
		const togglePlaylistIcon = this.createSvg("svg", null, {viewBox: "0 0 20 20"}, [
			{ tagName: "path", className: "tp-stroke", attributes: { d: this.buttonIcons.playlist.closed } }
		]);

		this.uiElements.togglePlaylistButton.appendChild(togglePlaylistIcon);
		controlsFooter.appendChild(this.uiElements.togglePlaylistButton);
	} else {
		// If it's not playlist, add buttons for buying and downloading the current track if links are provided
		// Buy Button
		if(this.playlist[0].buy) {
			const buyButton = this.createCustomLink('buy', this.playlist[0].buy) ;
			controlsFooter.appendChild(buyButton);
		}
		// Download Button
		if(this.playlist[0].download) {
			const downloadButton = this.createCustomLink('download', this.playlist[0].download) ;
			controlsFooter.appendChild(downloadButton);
		}
	}

	// Volume Control Section - Only added if user is not on a mobile device
	if(!isMobile) {
		// Volume Control Container
		const volumeControl = document.createElement("div");
		addClass(volumeControl, "tp-volume-control");

		// Volume Button
		this.uiElements.volumeButton = document.createElement("button");
		addClass(this.uiElements.volumeButton, ["tp-button", "tp-volume-button"]);

		// Volume Icon
		const volumeIcon = this.createSvg("svg", null, {viewBox: "0 0 20 20"}, [
			{ tagName: "path", className: "tp-fill", attributes: { d: this.buttonIcons.volume.speaker } },
			{ tagName: "path", className: "tp-stroke", attributes: { d: this.buttonIcons.volume.line_1 } },
			{ tagName: "path", className: "tp-stroke", attributes: { d: this.buttonIcons.volume.line_2 } },
			{ tagName: "path", className: "tp-stroke", attributes: { d: this.buttonIcons.volume.muted } }
		]);

		this.uiElements.volumeButton.appendChild(volumeIcon);
		volumeControl.appendChild(this.uiElements.volumeButton);

		// Volume Level Bar - Shows current volume level
		this.uiElements.volumeLevelBar = document.createElement("div");
		addClass(this.uiElements.volumeLevelBar, "tp-volume-level-bar");
		volumeControl.appendChild(this.uiElements.volumeLevelBar);

		// Volume Level Indicator - The actual level inside the bar
		this.uiElements.volumeLevel = document.createElement("div");
		addClass(this.uiElements.volumeLevel, "tp-volume-level");
		this.uiElements.volumeLevelBar.appendChild(this.uiElements.volumeLevel);

		// Add volume control to the controls footer
		controlsFooter.appendChild(volumeControl);
	}

	// Append the fully constructed controls container (including footer) to the main player container
	playerContainer.appendChild(controlsContainer);

	// Social Media Section, if share is enabled in settings
	if(this.settings.showShareButton) {
		/* Social Media Section - Creates a container for social media buttons */
		const sosialMediaContainer = document.createElement("div");
		addClass(sosialMediaContainer, "tp-social-media-container");  // Add class to style the social media container
		playerContainer.appendChild(sosialMediaContainer);  // Add the social media container to the controls footer

		// Facebook Button
		this.uiElements.facebookButton = document.createElement("button");
		addClass(this.uiElements.facebookButton, ["tp-button", "tp-facebook-button"]);  // Add button classes for styling

		// Facebook Icon
		const facebookIcon = this.createSvg("svg", null, { viewBox: "0 0 20 20" }, [
			{ tagName: "path", className: "tp-fill", attributes: { d: this.buttonIcons.facebook } }  // Path for Facebook icon
		]);
		this.uiElements.facebookButton.appendChild(facebookIcon);  // Append icon to the button
		sosialMediaContainer.appendChild(this.uiElements.facebookButton);  // Add Facebook button to the social media container

		// Twitter Button
		this.uiElements.twitterButton = document.createElement("button");
		addClass(this.uiElements.twitterButton, ["tp-button", "tp-twitter-button"]);  // Add button classes for styling

		// Twitter Icon
		const twitterIcon = this.createSvg("svg", null, { viewBox: "0 0 20 20" }, [
			{ tagName: "path", className: "tp-fill", attributes: { d: this.buttonIcons.twitter } }  // Path for Twitter icon
		]);
		this.uiElements.twitterButton.appendChild(twitterIcon);  // Append icon to the button
		sosialMediaContainer.appendChild(this.uiElements.twitterButton);  // Add Twitter button to the social media container

		// Tumblr Button
		this.uiElements.tumblrButton = document.createElement("button");
		addClass(this.uiElements.tumblrButton, ["tp-button", "tp-tumblr-button"]);  // Add button classes for styling

		// Tumblr Icon
		const tumblrIcon = this.createSvg("svg", null, { viewBox: "0 0 20 20" }, [
			{ tagName: "path", className: "tp-fill", attributes: { d: this.buttonIcons.tumblr } }  // Path for Tumblr icon
		]);
		this.uiElements.tumblrButton.appendChild(tumblrIcon);  // Append icon to the button
		sosialMediaContainer.appendChild(this.uiElements.tumblrButton);  // Add Tumblr button to the social media container
	}

	/* Playlist */
	/* Playlist Section - Creates and populates a playlist container if it's playlist */
	if(isPlaylist) {
		this.uiElements.playlistContainer = document.createElement("div");
		addClass(this.uiElements.playlistContainer, "tp-playlist-container");

		// Playlist Wrapper - Creates an unordered list element to hold playlist items
		this.uiElements.playlist = document.createElement("ul");
		addClass(this.uiElements.playlist, "tp-playlist");
		this.uiElements.playlistContainer.appendChild(this.uiElements.playlist);

		// Playlist Item Generation - Iterates through each track to create playlist items
		this.playlist.map(track => {
			// Determine the track name to display, including artist and title if available
			const trackName = track.title ? `<b>${track.artist}</b> - ${track.title}` : `<b>${track.artist}</b>`;
			// Determine the full track title for the tooltip, including artist and title if available
			const trackTitle = track.title ? `${track.artist} - ${track.title}` : track.artist;

			const playlistItem = document.createElement("li");
			addClass(playlistItem, "tp-playlist-item");
			playlistItem.title = trackTitle;

			// Play Indicator - Adds an animated visual to indicate track is playing
			const playlistItemIndicator = document.createElement("div");
			addClass(playlistItemIndicator, "tp-playlist-item-indicator");
			playlistItemIndicator.innerHTML = "<span></span><span></span><span></span>";
			playlistItem.appendChild(playlistItemIndicator);

			// Track Title Display - Shows the track name in the playlist item
			const playlistItemTrackTitle = document.createElement("div");
			addClass(playlistItemTrackTitle, "tp-playlist-item-track-title");
			playlistItemTrackTitle.innerHTML = trackName;
			playlistItem.appendChild(playlistItemTrackTitle);

			// Buy Button - Adds a button if the track has a buy link
			if(track.buy) {
				const buyButton = this.createCustomLink('buy', track.buy) ;
				playlistItem.appendChild(buyButton);
			}

			// Download Button - Adds a button if the track has a download link
			if(track.download) {
				const downloadButton = this.createCustomLink('download', track.download) ;
				playlistItem.appendChild(downloadButton);
			}

			// Add playlist item to playlist container
			this.uiElements.playlist.appendChild(playlistItem);
		});

		// Append playlist container to fragment
		fragment.appendChild(this.uiElements.playlistContainer);
		// Update reference to playlist items
		this.uiElements.playlistItem = this.uiElements.playlist.childNodes;

		// Enable playlist scroll if allowed and the number of tracks exceeds the maximum visible tracks
		if(this.settings.allowPlaylistScroll && this.playlist.length > this.settings.maxVisibleTracks) {
			addClass(wrapper, "tp-scrollable");

			// Scrollbar Track
			this.uiElements.scrollbarTrack = document.createElement("div");
			addClass(this.uiElements.scrollbarTrack, "tp-scrollbar-track");
			this.uiElements.playlistContainer.appendChild(this.uiElements.scrollbarTrack);

			// Scrollbar Thumb
			this.uiElements.scrollbarThumb = document.createElement("div");
			addClass(this.uiElements.scrollbarThumb, "tp-scrollbar-thumb");
			this.uiElements.scrollbarTrack.appendChild(this.uiElements.scrollbarThumb);

			// Set Playlist Height - Limits visible playlist height to max visible tracks, calculated by track height
			this.uiElements.playlist.style.height = `${40 * this.settings.maxVisibleTracks}px`
		}
	}

	/* Error */
	// Create a container for displaying error messages
	const errorContainer = document.createElement("div");
	addClass(errorContainer, "tp-error-container");
	fragment.appendChild(errorContainer);

	// Create a div for the error message
	const errorMessage = document.createElement("div");
	addClass(errorMessage, "tp-error-message");
	errorContainer.appendChild(errorMessage);

	// Close Button
	this.uiElements.errorCloseButton = document.createElement("button");
	addClass(this.uiElements.errorCloseButton, ["tp-button", "tp-error-close-button"]);
	errorContainer.appendChild(this.uiElements.errorCloseButton);

	// Close Icon
	const closeIcon = this.createSvg("svg", null, {viewBox: "0 0 20 20"}, [
		{ tagName: "path", className: "tp-stroke", attributes: { d: this.buttonIcons.playlist.opened } }
	]);
	this.uiElements.errorCloseButton.appendChild(closeIcon);

	// Append Player
	wrapper.appendChild(fragment);

	const endTime = new Date().getTime();
	const duration = (endTime - startTime);
	this.playerState.log = `The Player Interface is Created in ${duration} ms`;
}