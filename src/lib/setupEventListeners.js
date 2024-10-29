async setupEventListeners() {
	this.playerState.log = 'Setting Up Event Listeners';
	const { isPlaylist, isMobile } = this.playerState;
	const { showRepeatButton, showShuffleButton, showShareButton, showCover, allowPlaylistScroll, maxVisibleTracks } = this.settings;
	const { removeClass } = this;

	// List of audio events to listen for
	const audioEvents = [
		'abort', 'canplay', 'canplaythrough', 'durationchange', 'emptied', 'ended', 'error', 
		'loadeddata', 'loadedmetadata', 'loadstart', 'pause', 'play', 'playing', 'progress', 
		'ratechange', 'seeked', 'seeking', 'stalled', 'suspend', 'timeupdate', 'volumechange', 'waiting'
	];

	// Add event listeners for all audio events
	audioEvents.forEach((event) => {
		if (typeof this[event] === 'function') {
			this.audio.addEventListener(event, this[event].bind(this));
		} else {
			console.log(`No handler found for event: ${event}`);
		}
	});

	// Reference to UI elements
	const {
		wrapper, playbackButton, prevButton, nextButton, volumeButton, repeatButton, shuffleButton, shareButton,
		facebookButton, twitterButton, tumblrButton, togglePlaylistButton, playlistItem, audioSeekBar,
		volumeLevelBar, playlistContainer, playlist, scrollbarTrack, coverImage, errorCloseButton
	} = this.uiElements;

	playbackButton.addEventListener('click', this.playback.bind(this));

	if(isPlaylist) {
		prevButton.addEventListener('click', this.prevTrack.bind(this));
		nextButton.addEventListener('click', this.nextTrack.bind(this));
		if(showShuffleButton) shuffleButton.addEventListener('click', this.shuffleToggle.bind(this));
		togglePlaylistButton.addEventListener('click', this.togglePlaylist.bind(this));

		// Add event listeners for playlist items
		playlistItem.forEach((item, index) => {
			const download = item.querySelector('.tp-playlist-track-download');
			const buy = item.querySelector('.tp-playlist-track-buy');

			// Select Track From Playlist
			item.addEventListener('click', () => {
				if (this.currentTrack.index !== index) {
					this.previousTrackIndex = this.currentTrack.index;
					this.currentTrack.index = index;
					this.playerState.autoplay = true;
					this.switchTrack();
				} else if (this.audio.paused) {
					this.playback();
				}
			});

			// Prevent click events on download and buy links from propagating
			const preventClick = event => event.stopPropagation();
			if (download) download.addEventListener('click', preventClick);
			if (buy) buy.addEventListener('click', preventClick);
		});

		if(allowPlaylistScroll && this.playlist.length > maxVisibleTracks) {
			// Add event listeners for scrollbar interactions
			playlistContainer.addEventListener('mouseenter', this.showScrollbar.bind(this)); // Show scrollbar on mouse enter
			playlistContainer.addEventListener('mouseleave', this.hideScrollbar.bind(this)); // Hide scrollbar on mouse leave
			playlist.addEventListener('scroll', this.updateScrollbarThumb.bind(this)); // Update scrollbar thumb position on scroll
			// Update The Position And Size Of The Scrollbar
			this.updateScrollbarThumb();
			scrollbarTrack.addEventListener('wheel', event => { // Handle mouse wheel scrolling
				event.preventDefault();
				playlist.scrollTop += event.deltaY;
			}, { passive: false });
			scrollbarTrack.addEventListener('mousedown', this.scrollbarTrackSeekingStart.bind(this)); // Handle mouse down for scrollbar dragging
		}
	}

	if(showRepeatButton) repeatButton.addEventListener('click', this.repeatToggle.bind(this));

	if(showShareButton) {
		shareButton.addEventListener('click', this.shareToggle.bind(this));
		facebookButton.addEventListener('click', this.shareFacebook.bind(this));
		twitterButton.addEventListener('click', this.shareTwitter.bind(this));
		tumblrButton.addEventListener('click', this.shareTumblr.bind(this));
	}

	// Add event listeners for seeking audio and Volume
	if (isMobile) {
		audioSeekBar.addEventListener('touchstart', this.startAudioSeeking.bind(this), { passive: true });
	} else {
		audioSeekBar.addEventListener('mousedown', this.startAudioSeeking.bind(this), false);
		volumeLevelBar.addEventListener('mousedown', this.startVolumeAdjustment.bind(this), false);
		volumeButton.addEventListener('click', this.volumeToggle.bind(this));
	}

	if(showCover) coverImage.addEventListener('load', this.coverLoaded.bind(this));

	// Add event listener for window resize
	window.addEventListener("resize", this.playerResize.bind(this));

	// Error Close
	errorCloseButton.addEventListener('click', () => {
		removeClass(wrapper, "tp-error");
	});

	this.playerState.log = 'Event Listeners Are Set';
}