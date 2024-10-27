// Simulates a button click effect by adding and then removing a CSS class.
simulateClickEffect(element) {
	// Add the "tp-click" class to the element
	this.addClass(element, "tp-click");
	// Remove the "tp-click" class after animation end
	if (!element.onanimationend) {
		element.onanimationend = () => {
			this.removeClass(element, "tp-click");
		};
	}
}


// Toggles playback of the audio element and updates the player state.
playback() {
	// Simulate button click effect
	this.simulateClickEffect(this.uiElements.playbackButton);

	if (this.audio.paused) {
		// Play the audio and set autoplay to true
		this.audio.play();
		this.playerState.autoplay = true;
	} else {
		// Pause the audio and set autoplay to false
		this.audio.pause();
		this.playerState.autoplay = false;
	}
}

// Handles the logic for switching to the previous track.
prevTrack() {
	// Simulate button click effect
	this.simulateClickEffect(this.uiElements.prevButton);

	// Store the current track index as the previous track index
	this.previousTrackIndex = this.currentTrack.index;

	if(this.playerState.shuffle) {
		// Set current track to the first index of the order list and remove it
		this.currentTrack.index = this.orderList.shift();

		// If the order list is now empty, get a new shuffled order list
		if(this.orderList.length === 0) {
			this.orderList = this.getShuffledPlaylistOrder();
		}
	} else {
		// If there is a previous track in the playlist
		if(this.currentTrack.index - 1 >= 0) {
			// Decrement the current track index
			this.currentTrack.index--;
		} else {
			// If there is no previous track and Repeat Mode is On, play the last track in the playlist
			if(this.playerState.repeat) {
				this.currentTrack.index = this.playlist.length - 1;
			} else {
				// If Repeat Mode is Off, pause the audio, set current time to 0, and turn off autoplay
				this.audio.pause();
				this.audio.currentTime = 0;
				this.playerState.autoplay = false;
				return;
			}
		}
	}
	// Switch to the next track
	this.switchTrack();
}

// Handles the logic for switching to the next track.
nextTrack() {
	// Simulate the click effect on the next button
	this.simulateClickEffect(this.uiElements.nextButton);

	// Store the current track index as the previous track index
	this.previousTrackIndex = this.currentTrack.index;

	if(this.playerState.shuffle) {
		// If shuffle is enabled, get the next track index from the shuffled order list
		this.currentTrack.index = this.orderList.shift();

		// If the order list is empty, regenerate the shuffled playlist order
		if(this.orderList.length === 0) {
			this.orderList = this.getShuffledPlaylistOrder();
		}
	} else {
		// If shuffle is not enabled, move to the next track in the playlist
		if(this.currentTrack.index + 1 < this.playlist.length) {
			this.currentTrack.index++;
		} else {
			// If repeat is enabled, go back to the first track
			if(this.playerState.repeat) {
				this.currentTrack.index = 0;
			} else {
				// If repeat is not enabled, stop the audio and reset the player state
				this.audio.pause();
				this.audio.currentTime = 0;
				this.playerState.autoplay = false;
				return;
			}
		}
	}

	// Switch to the new track
	this.switchTrack();
}

// Toggles the repeat state of the player.
repeatToggle() {
	const { repeatButton } = this.uiElements;

	// Toggle the repeat state
	this.playerState.repeat = !this.playerState.repeat;
	// Toggle the "tp-active" class on the repeat button
	this.toggleClass(repeatButton, "tp-active");
	// Simulate the click effect on the repeat button
	this.simulateClickEffect(repeatButton);
}

// Toggles the shuffle state of the player.
shuffleToggle() {
	const { shuffleButton } = this.uiElements;
	const { toggleClass } = this;
	
	// Toggle the shuffle state
	this.playerState.shuffle = !this.playerState.shuffle;

	// Toggle the "tp-active" class on the shuffle button
	toggleClass(shuffleButton, "tp-active");

	// Simulate the click effect on the shuffle button
	this.simulateClickEffect(shuffleButton);

	// Regenerate the shuffled playlist order if shuffle is enabled, otherwise set to null
	this.orderList = (this.playerState.shuffle) ? this.getShuffledPlaylistOrder() : null;
}

// Toggles the share state of the player.
shareToggle() {
	const { shareButton, wrapper } = this.uiElements;

	// Toggle the shera display state
	this.playerState.isShareDisplayed = !this.playerState.isShareDisplayed;
	// Toggle the "tp-sharing" class on the player
	this.toggleClass(wrapper, "tp-sharing");
	// Toggle the "tp-active" class on the share button
	this.toggleClass(shareButton, "tp-active");
	// Simulate the click effect on the share button
	this.simulateClickEffect(shareButton);

	if (this.playerState.isShareDisplayed) {
		// Animate the button icon to the "opened" state
		this.animatePathSvg(
			shareButton.querySelector('.tp-stroke'),
			this.buttonIcons.share.closed.stroke,
			this.buttonIcons.share.opened.stroke,
			250,
			'easeOutExpo'
		);
		this.animatePathSvg(
			shareButton.querySelector('.tp-fill'),
			this.buttonIcons.share.closed.fill,
			this.buttonIcons.share.opened.fill,
			250,
			'easeOutExpo'
		);
	} else {
		// Animate the button icon to the "closed" state
		this.animatePathSvg(
			shareButton.querySelector('.tp-stroke'),
			this.buttonIcons.share.opened.stroke,
			this.buttonIcons.share.closed.stroke,
			250,
			'easeOutExpo'
		);
		this.animatePathSvg(
			shareButton.querySelector('.tp-fill'),
			this.buttonIcons.share.opened.fill,
			this.buttonIcons.share.closed.fill,
			250,
			'easeOutExpo'
		);
	}
}

openPopup(url) {
	var width = 550;
	var height = 400;
	var left = (window.innerWidth - width) / 2;
	var top = (window.innerHeight - height) / 2;
	var options = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;
	window.open(url, 'Share', options);
}

shareFacebook() {
	const url = window.location.href;
	const text = this.currentTrack.artist + " - " + this.currentTrack.title;
	const shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '&quote=' + encodeURIComponent(text);
	this.openPopup(shareUrl);
}

shareTwitter() {
	const url = window.location.href;
	const text = this.currentTrack.artist + " - " + this.currentTrack.title;
	const shareUrl = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text);
	this.openPopup(shareUrl);
}

shareTumblr() {
	const url = window.location.href;
	const text = this.currentTrack.artist + " - " + this.currentTrack.title;
	const shareUrl = 'https://www.tumblr.com/widgets/share/tool?canonicalUrl=' + encodeURIComponent(url) + '&caption=' + encodeURIComponent(text);
	this.openPopup(shareUrl);
}

// Toggle Playlist
togglePlaylist() {
	let playlistHeight = 0;
	const { togglePlaylistButton, playlistContainer } = this.uiElements;
	const { maxVisibleTracks, allowPlaylistScroll } = this.settings;

	// Toggle the playlist display state
	this.playerState.isPlaylistDisplayed = !this.playerState.isPlaylistDisplayed;
	// Toggle the "tp-active" class on the toggle playlist button
	this.toggleClass(togglePlaylistButton, "tp-active");
	// Simulate the click effect on the toggle playlist button
	this.simulateClickEffect(togglePlaylistButton);

	if (this.playerState.isPlaylistDisplayed && this.playerState.isPlaylist) {
		// Animate the button icon to the "opened" state
		this.animatePathSvg(
			togglePlaylistButton.querySelector('path'),
			this.buttonIcons.playlist.closed,
			this.buttonIcons.playlist.opened,
			250,
			'easeOutExpo'
		);
		// Calculate the playlist height based on the number of tracks and settings
		playlistHeight = (this.playlist.length > maxVisibleTracks && allowPlaylistScroll) 
		? maxVisibleTracks * 40 - 1 
		: this.playlist.length * 40;
	} else {
		// Animate the button icon to the "closed" state
		this.animatePathSvg(
			this.uiElements.togglePlaylistButton.querySelector('path'),
			this.buttonIcons.playlist.opened,
			this.buttonIcons.playlist.closed,
			250,
			'easeOutExpo'
		);
	}

	// Set the height of the playlist wrapper
	playlistContainer.style.height = `${playlistHeight}px`;
}

// Toggles the mute state of the volume.
volumeToggle() {
	const { volumeButton, volumeLevel } = this.uiElements;
	const { toggleClass } = this;

	// Toggle the mute state
	this.playerState.isVolumeMuted = !this.playerState.isVolumeMuted;
	// Toggle the "tp-active" class on the volume button
	toggleClass(volumeButton, "tp-active");
	// Simulate the click effect on the volume button
	this.simulateClickEffect(volumeButton);
	// Adjust the audio volume based on the mute state
	this.audio.volume = this.playerState.isVolumeMuted ? 0 : this.settings.volume;
	// Update the volume level display width
	volumeLevel.style.width = this.playerState.isVolumeMuted ? this.audio.volume * 100 : 0;
}

// Initiates the audio seeking process.
startAudioSeeking(event) {
	event.preventDefault();

	// Check if the event is from a non-primary mouse button on non-mobile devices
	if(!this.playerState.isMobile && event.button !== 0) return false;
	// Set the user seeking state to true
	this.playerState.isUserSeekingAudio = true;
	// Update the audio seek position based on the event
	this.updateAudioSeekPosition(event); // If No MouseMove, Set Value From Start
	// Determine the appropriate pointer events based on the device type
	const pointerMoveEvent = this.playerState.isMobile ? 'touchmove' : 'mousemove';
	const pointerUpEvent = this.playerState.isMobile ? 'touchend' : 'mouseup';

	// Add event listeners for pointer movements and pointer release
	document.addEventListener(pointerMoveEvent, this.updateAudioSeekPosition.bind(this), false);
	document.addEventListener(pointerUpEvent, this.finalizeAudioSeeking.bind(this), false);

	// Remove transitions for smooth seeking
	this.uiElements.currentTime.style.transition = "";
	this.uiElements.duration.style.transition = "";
}

// Updates the audio seek position based on the user's input.
updateAudioSeekPosition(event) {
	const { audioSeekBar, audioPlaybackProgress, currentTime, duration } = this.uiElements;
	const { secondsToTimecode } = this;

	// Return if the user is not seeking audio
	if(!this.playerState.isUserSeekingAudio) return;

	// Get the bounds of the seek bar
	const seekBarBounds = audioSeekBar.getBoundingClientRect();
	// Determine the mouse position based on the device type
	const mousePosition = this.playerState.isMobile ? event.touches[0].clientX : event.clientX;
	// Calculate the percentage of the seek bar that has been traversed
	let percent = (mousePosition - seekBarBounds.left) / seekBarBounds.width;
	percent = Math.max(0, Math.min(1, percent));

	// Update the playback progress bar width
	audioPlaybackProgress.style.width = `${percent * 100}%`;
	// Update the current track time based on the percentage
	this.currentTrack.currentTime = percent * this.audio.duration;
	// Update the current time display
	currentTime.textContent = secondsToTimecode(this.currentTrack.currentTime);

	// Calculate offsets for the current time and duration displays
	const currentTimeOffset = mousePosition - seekBarBounds.left - currentTime.offsetWidth - 5;
	const durationOffset = seekBarBounds.width - (mousePosition - seekBarBounds.left) - duration.offsetWidth - 5;

	// Adjust the position of the current time and duration displays
	if(percent !== 0 && percent !== 1) {
		currentTime.style.left = `${currentTimeOffset}px`;
		duration.style.right = `${durationOffset}px`;
	}
}

// Finalizes the audio seeking process.
finalizeAudioSeeking() {
	const { currentTime, duration } = this.uiElements;

	// Set the user seeking state to false
	this.playerState.isUserSeekingAudio = false;

	// Determine the appropriate pointer events based on the device type
	const moveEvent = this.playerState.isMobile ? 'touchmove' : 'mousemove';
	const upEvent = this.playerState.isMobile ? 'touchend' : 'mouseup';

	// Remove event listeners for pointer movements and pointer release
	document.removeEventListener(moveEvent, this.updateAudioSeekPosition.bind(this), false);
	document.removeEventListener(upEvent, this.finalizeAudioSeeking.bind(this), false);

	// Update the audio current time to match the current track time
	this.audio.currentTime = this.currentTrack.currentTime;

	// Add transitions for smooth UI updates
	Object.assign(currentTime.style, {
			transition: "all 250ms var(--easeOutExpo)",
			left: "5px"
	});

	Object.assign(duration.style, {
			transition: "all 250ms var(--easeOutExpo)",
			right: "5px"
	});
}

// Initiates the volume adjustment process.
startVolumeAdjustment(event) {
	event.preventDefault();

	// Check if the event is from a non-primary mouse button
	if(event.button !== 0) return false;

	// Set the user adjusting volume state to true
	this.playerState.isUserAdjustingVolume = true;
	// Update the volume based on the event
	this.updateVolumeAdjustment(event); // If No MouseMove, Set Value From Start

	// Add event listeners for pointer movements and pointer release
	document.addEventListener('mousemove', this.updateVolumeAdjustment.bind(this), false);
	document.addEventListener('mouseup', this.finalizeVolumeAdjustment.bind(this), false);
}

// Updates the volume based on the user's input.
updateVolumeAdjustment(event) {
	// Return if the user is not adjusting the volume
	if(!this.playerState.isUserAdjustingVolume) return;

	// Get the bounds of the volume bar
	const volumeBarBounds = this.uiElements.volumeLevelBar.getBoundingClientRect();
	// Determine the mouse position
	const mousePosition = event.clientX;
	// Calculate the percentage of the volume bar that has been traversed
	let percent = (mousePosition - volumeBarBounds.left) / volumeBarBounds.width;
	percent = Math.max(0, Math.min(1, percent));

	// Update the audio volume based on the percentage
	this.audio.volume = percent;
}

// Finalizes the volume adjustment process.
finalizeVolumeAdjustment() {
	// Set the user adjusting volume state to false
	this.playerState.isUserAdjustingVolume = false;

	// Remove event listeners for pointer movements and pointer release
	document.removeEventListener('mousemove', this.updateVolumeAdjustment.bind(this), false);
	document.removeEventListener('mouseup', this.finalizeVolumeAdjustment.bind(this), false);
}

// Function to update the scrollbar thumb's size and position
updateScrollbarThumb() {
	console.log('updtate');
	var visibleRatio = this.uiElements.playlist.clientHeight / this.uiElements.playlist.scrollHeight;

	// Set thumb height relative to the visible portion of the playlist, with a minimum of 10%
	this.uiElements.scrollbarThumb.style.height = Math.max(visibleRatio * 100, 10) + "%";

	// Position the thumb based on the current scroll position
	this.uiElements.scrollbarThumb.style.top = (this.uiElements.playlist.scrollTop / this.uiElements.playlist.scrollHeight) * 100 + "%";
}

// Shows the scrollbar by adding a class to the playlist wrapper.
showScrollbar() {
	const { addClass } = this;
	// Add the class to show the scrollbar
	addClass(this.uiElements.playlistContainer, 'tp-playlist-hovered');
	// Clear any existing timeout for hiding the scrollbar
	clearTimeout(this.playerState.playlistScrollbarHideDelay);
}

// Hides the scrollbar by removing a class from the playlist wrapper after a delay.
hideScrollbar() {
	const { removeClass } = this;
	// Set a timeout to remove the class and hide the scrollbar
	this.playerState.playlistScrollbarHideDelay = setTimeout(() => {
		removeClass(this.uiElements.playlistContainer, 'tp-playlist-hovered')
	}, 2000);
}

// Initiates the scrollbar track seeking process.
scrollbarTrackSeekingStart(event) {
	event.preventDefault();
	
	const { playlist, scrollbarTrack } = this.uiElements;

	const initialMouseY = event.clientY; // Starting Y position of the mouse
	const initialScrollTop = playlist.scrollTop; // Initial scroll position
	const maxScrollPosition = playlist.scrollHeight - playlist.clientHeight; // Max scroll position
	let isDragging = false; // Flag to detect dragging vs. clicking

	// Function to handle mouse movements for dragging
	const scrollbarTrackSeeking = (event) => {
		const dragDeltaY = event.clientY - initialMouseY; // Mouse movement distance

		// Determine if dragging has started (more than 5px of movement)
		if (Math.abs(dragDeltaY) > 5) {
	isDragging = true;
		}

		// Calculate new scroll position relative to the drag distance and track size
		const newScrollTop = initialScrollTop + (dragDeltaY / scrollbarTrack.clientHeight) * maxScrollPosition;

		// Set the new scrollTop, ensuring it doesn't exceed bounds
		playlist.scrollTop = Math.max(0, Math.min(newScrollTop, maxScrollPosition));
	};

	// Function to handle mouse release (mouseup event)
	const scrollbarTrackSeekingEnd = (event) => {
		document.removeEventListener("mousemove", scrollbarTrackSeeking);
		document.removeEventListener("mouseup", scrollbarTrackSeekingEnd);

		// If it was a simple click (no dragging), scroll to the click position
		if (!isDragging) {
	const clickPositionY = event.clientY;
	const trackRect = this.uiElements.scrollbarTrack.getBoundingClientRect();
	const clickRatio = (clickPositionY - trackRect.top) / scrollbarTrack.clientHeight; // Position in % on the track
	const newScrollTop = clickRatio * maxScrollPosition;

	// Scroll to the clicked position
	playlist.scrollTop = Math.max(0, Math.min(newScrollTop, maxScrollPosition));
		}
	};

	// Add event listeners for dragging and releasing the mouse
	document.addEventListener("mousemove", scrollbarTrackSeeking);
	document.addEventListener("mouseup", scrollbarTrackSeekingEnd);
}

// Adjusts the player layout based on the wrapper's width.
playerResize() {
	const { addClass, removeClass } = this;
	// Check if the width of the wrapper element is less than 550 pixels
	if(this.uiElements.wrapper.clientWidth < 550) {
		// Add the 'tp-vertical' class to the wrapper element
		addClass(this.uiElements.wrapper, 'tp-vertical');
	} else {
		// If the skin setting is not 'vertical', remove the 'tp-vertical' class
		if(this.settings.skin !== 'vertical') {
			removeClass(this.uiElements.wrapper, 'tp-vertical');
		}
	}
}