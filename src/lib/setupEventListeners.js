async setupEventListeners() {
	this.playerState.log = 'Setting Up Event Listeners';
	const { isPlaylist, isMobile } = this.playerState;
	const { showCover, allowPlaylistScroll, maxVisibleSongs } = this.settings;
	const { coverImage } = this.uiElements;

	// Add listeners for all audio events
	this.setupAudioEventListeners();
	// Add listeners for playback control elements
	this.setupButtonsEventListeners();
	// Add listeners for playlist items
	if(isPlaylist) {
		this.setupPlaylistEventListeners();
		if(allowPlaylistScroll && this.playlist.length > maxVisibleSongs && !isMobile) {
			this.setupScrollbarEventListeners();
		}
	}
	// Add listeners for seek and volume bars s
	this.setupSeekingEventListeners();
	// Add listener for Cover Loading
	if(showCover) coverImage.addEventListener('load', this.handleCoverLoaded.bind(this));

	// Add listener for window resize
	window.addEventListener("resize", this.handlePlayerResize.bind(this));
	this.playerState.log = 'Event Listeners Are Set';
}

// Method to add audio event listeners
setupAudioEventListeners() {
	const audioEvents = [
		'abort', 'canplay', 'canplaythrough', 'durationchange', 'emptied', 'ended', 'error', 
		'loadeddata', 'loadedmetadata', 'loadstart', 'pause', 'play', 'playing', 'progress', 
		'ratechange', 'seeked', 'seeking', 'stalled', 'suspend', 'timeupdate', 'volumechange', 'waiting'
	];

	audioEvents.forEach(event => {
		if (typeof this[event] === 'function') {
			this.audio.addEventListener(event, this[event].bind(this));
		} else {
			console.log(`No handler found for event: ${event}`);
		}
	});
}

// Method to add listeners for all buttons
setupButtonsEventListeners() {
	const { removeClass } = this;
	const { isPlaylist, isMobile } = this.playerState;
	const { showRepeatButton, showShuffleButton, showShareButton } = this.settings;
	const { wrapper, playbackButton, prevButton, nextButton, volumeButton, repeatButton, shuffleButton, shareButton,
		facebookButton, xButton, tumblrButton, togglePlaylistButton, errorCloseButton
	} = this.uiElements;
	// Playback Button
	playbackButton.addEventListener('click', this.handlePlayback.bind(this));
	// Prev, Next, Shuffle, Toggle Playlist Button
	if(isPlaylist) {
		prevButton.addEventListener('click', this.handlePrevSong.bind(this));
		nextButton.addEventListener('click', this.handleNextSong.bind(this));
		if(showShuffleButton) shuffleButton.addEventListener('click', this.handleShuffleToggle.bind(this));
		togglePlaylistButton.addEventListener('click', this.handleTogglePlaylist.bind(this));
	}
	// Repeat Button
	if(showRepeatButton) repeatButton.addEventListener('click', this.handleRepeatToggle.bind(this));
	// Share Buttons
	if(showShareButton) {
		shareButton.addEventListener('click', this.handleShareToggle.bind(this));
		facebookButton.addEventListener('click', this.handleShare.bind(this, 'facebook'));
		xButton.addEventListener('click', this.handleShare.bind(this, 'x'));
		tumblrButton.addEventListener('click', this.handleShare.bind(this, 'tumblr'));
	}
	// Volume Button
	if(!isMobile) volumeButton.addEventListener('click', this.handleMute.bind(this));
	// Error Close
	errorCloseButton.addEventListener('click', () => removeClass(wrapper, "tp-error"));
}

// Method to add listeners for playlist items
setupPlaylistEventListeners() {
	const { playlistItem } = this.uiElements;
	// Add event listeners for playlist items
	playlistItem.forEach((item, index) => {
		const download = item.querySelector('.tp-playlist-song-download');
		const buy = item.querySelector('.tp-playlist-song-buy');

		// Select Song From Playlist
		item.addEventListener('click', () => {
			if (this.currentSong.index !== index) {
				this.previousSongIndex = this.currentSong.index;
				this.currentSong.index = index;
				this.playerState.autoplay = true;
				this.switchSong();
			} else if (this.audio.paused) {
				this.handlePlayback();
			}
		});

		// Prevent click events on download and buy links from propagating
		const preventClick = event => event.stopPropagation();
		if (download) download.addEventListener('click', preventClick);
		if (buy) buy.addEventListener('click', preventClick);
	});
}

// Method to add listeners for the playlist scrollbar
setupScrollbarEventListeners() {
	const { playlistContainer, playlist, scrollbarTrack } = this.uiElements;
	// Add event listeners for scrollbar interactions
	playlistContainer.addEventListener('mouseenter', this.showScrollbar.bind(this)); // Show scrollbar on mouse enter
	playlistContainer.addEventListener('mouseleave', this.hideScrollbar.bind(this)); // Hide scrollbar on mouse leave
	playlist.addEventListener('scroll', this.updateScrollbarThumb.bind(this)); // Update scrollbar thumb position on scroll
	scrollbarTrack.addEventListener('wheel', event => { // Handle mouse wheel scrollings
		event.preventDefault();
		playlist.scrollTop += event.deltaY;
	}, { passive: false });
	scrollbarTrack.addEventListener('mousedown', this.handleScrollbar.bind(this)); // Handle mouse down for scrollbar dragging
	// Update The Position And Size Of The Scrollbar
	this.updateScrollbarThumb();
}

// Method to add listeners for seeking
setupSeekingEventListeners() {
	const { audioSeekBar, volumeLevelBar } = this.uiElements;
	const { isMobile } = this.playerState;

	if (!isMobile) {
		audioSeekBar.addEventListener('mousedown', this.handleAudioSeeking.bind(this));
		volumeLevelBar.addEventListener('mousedown', this.handleVolumeLevel.bind(this));
	} else {
		audioSeekBar.addEventListener('touchstart', this.handleAudioSeeking.bind(this), {passive: true});
	}
}