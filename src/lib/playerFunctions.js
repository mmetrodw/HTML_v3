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
		this.handleShuffleMode();
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
		this.handleShuffleMode();
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

handleShuffleMode() {
	// If shuffle is enabled, get the next track index from the shuffled order list
	this.currentTrack.index = this.orderList.shift();

	// If the order list is empty, regenerate the shuffled playlist order
	if(this.orderList.length === 0) {
		this.orderList = this.getShuffledPlaylistOrder();
	}
}

// Toggles the repeat state of the player.
repeatToggle() {
	const { repeatButton } = this.uiElements;
	const { toggleClass } = this;
	// Toggle the "tp-active" class on the repeat button
	toggleClass(repeatButton, "tp-active");
	// Simulate the click effect on the repeat button
	this.simulateClickEffect(repeatButton);
	// Toggle the repeat state
	this.playerState.repeat = !this.playerState.repeat;
}

// Toggles the shuffle state of the player.
shuffleToggle() {
	const { shuffleButton } = this.uiElements;
	const { toggleClass } = this;
	// Toggle the "tp-active" class on the shuffle button
	toggleClass(shuffleButton, "tp-active");
	// Simulate the click effect on the shuffle button
	this.simulateClickEffect(shuffleButton);
	// Toggle the shuffle state
	this.playerState.shuffle = !this.playerState.shuffle;
	// Regenerate the shuffled playlist order if shuffle is enabled, otherwise set to null
	this.orderList = (this.playerState.shuffle) ? this.getShuffledPlaylistOrder() : null;
}

// Toggles the share state of the player.
shareToggle() {
	const { shareButton, wrapper } = this.uiElements;
	// Toggle the "tp-sharing" class on the player
	this.toggleClass(wrapper, "tp-sharing");
	// Toggle the "tp-active" class on the share button
	this.toggleClass(shareButton, "tp-active");
	// Simulate the click effect on the share button
	this.simulateClickEffect(shareButton);
	// Toggle the shera display state
	this.playerState.isShareDisplayed = !this.playerState.isShareDisplayed;
	if (this.playerState.isShareDisplayed) {
		// Animate the button icon to the "opened" state
		shareButton.children[0].children[0].setAttribute('d', this.buttonIcons.close);
	} else {
		shareButton.children[0].children[0].setAttribute('d', this.buttonIcons.share);
	}
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

openPopup(url) {
	var width = 550;
	var height = 400;
	var left = (window.innerWidth - width) / 2;
	var top = (window.innerHeight - height) / 2;
	var options = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;
	window.open(url, 'Share', options);
}

// Toggle Playlist
togglePlaylist(isClick = true) {
	let playlistHeight = 0;
	const { togglePlaylistButton, playlistContainer } = this.uiElements;
	const { maxVisibleTracks, allowPlaylistScroll } = this.settings;
	const { toggleClass } = this;

	// Toggle the "tp-active" class on the toggle playlist button
	toggleClass(togglePlaylistButton, "tp-active");
	// Simulate the click effect on the toggle playlist button
	if(isClick) this.simulateClickEffect(togglePlaylistButton);
	// Toggle the playlist display state
	this.playerState.isPlaylistDisplayed = !this.playerState.isPlaylistDisplayed;

	if (this.playerState.isPlaylistDisplayed) {
		// Animate the button icon to the "opened" state
		togglePlaylistButton.children[0].children[0].setAttribute('d', this.buttonIcons.close);
		// Calculate the playlist height based on the number of tracks and settings
		playlistHeight = (this.playlist.length > maxVisibleTracks && allowPlaylistScroll)
		? maxVisibleTracks * 40 - 1
		: this.playlist.length * 40;
	} else {
		// Animate the button icon to the "closed" state
		togglePlaylistButton.children[0].children[0].setAttribute('d', this.buttonIcons.playlist);
	}

	// Set the height of the playlist wrapper
	playlistContainer.style.height = `${playlistHeight}px`;
}

// Toggles the mute state of the volume.
volumeToggle() {
	const { volumeButton, volumeLevel } = this.uiElements;
	const { toggleClass } = this;

	// Toggle the "tp-active" class on the volume button
	toggleClass(volumeButton, "tp-active");
	// Simulate the click effect on the volume button
	this.simulateClickEffect(volumeButton);
	// Toggle the mute state
	this.playerState.isVolumeMuted = !this.playerState.isVolumeMuted;
	// Adjust the audio volume based on the mute state
	this.audio.volume = this.playerState.isVolumeMuted ? 0 : this.settings.volume;
	// Update the volume level display width
	volumeLevel.style.width = this.playerState.isVolumeMuted ? this.audio.volume * 100 : 0;
}

// the audio seeking process.
audioSeeking(event) {
	const { isMobile } = this.playerState;
	// Check if the event is from a non-primary mouse button on non-mobile devices
	if(!isMobile && event.button !== 0) return false;

	const { audioSeekBar, audioPlaybackProgress, audioCurrentTime, audioDuration } = this.uiElements;
	const { secondsToTimecode } = this;// Get the bounds of the seek bar
	
	const moveEvent = isMobile ? "touchmove" : "mousemove";
	const upEvent = isMobile ? "touchend" : "mouseup";
	const seekBarBounds = audioSeekBar.getBoundingClientRect();

	// Set the user seeking state to true
	this.playerState.isUserSeekingAudio = true;
	// Remove transitions for smooth seeking
	this.uiElements.audioCurrentTime.style.transition = "";
	this.uiElements.audioDuration.style.transition = "";

	const seeking = (event) => {
		// Determine the mouse position based on the device type
		const mousePosition = this.playerState.isMobile ? event.touches[0].clientX : event.clientX;
		// Calculate the percentage of the seek bar that has been traversed
		const percent = Math.max(0, Math.min(1, (mousePosition - seekBarBounds.left) / seekBarBounds.width));
		// Update the playback progress bar width
		audioPlaybackProgress.style.width = `${percent * 100}%`;
		// Update the current track time based on the percentage
		this.currentTrack.currentTime = percent * this.audio.duration;
		// Update the current time display
		audioCurrentTime.textContent = secondsToTimecode(this.currentTrack.currentTime);
		// Calculate offsets for the current time and duration displays
		const currentTimeOffset = mousePosition - seekBarBounds.left - audioCurrentTime.offsetWidth - 5;
		const durationOffset = seekBarBounds.width - (mousePosition - seekBarBounds.left) - audioDuration.offsetWidth - 5;
		// Adjust the position of the current time and duration displays
		if(percent !== 0 && percent !== 1) {
			audioCurrentTime.style.left = `${currentTimeOffset}px`;
			audioDuration.style.right = `${durationOffset}px`;
		}
	}
	seeking(event);

	const seeked = (event) => {
		document.removeEventListener(moveEvent, seeking);
		document.removeEventListener(upEvent, seeked);

		// Return if the user is not seeking audio
		if(!this.playerState.isUserSeekingAudio) return;
		// Set the user seeking state to false
		this.playerState.isUserSeekingAudio = false;
		// Update the audio current time to match the current track time
		this.audio.currentTime = this.currentTrack.currentTime;
		// Add transitions for smooth UI updates
		Object.assign(audioCurrentTime.style, {
				transition: "all 250ms var(--easeOutExpo)",
				left: "5px"
		});
		Object.assign(audioDuration.style, {
				transition: "all 250ms var(--easeOutExpo)",
				right: "5px"
		});
	}
	
	// Add event listeners for dragging and releasing the mouse
	document.addEventListener(moveEvent, seeking);
	document.addEventListener(upEvent, seeked);
}

// the volume adjustment process.
volumeAdjustment(event) {
	event.preventDefault();
	// Set the user adjusting volume state to true
	this.playerState.isUserAdjustingVolume = true;
	// Cache DOM references and calculations
	// Get the bounds of the volume bar
	const volumeBarBounds = this.uiElements.volumeLevelBar.getBoundingClientRect();
	const barLeft = volumeBarBounds.left;
	const barWidth = volumeBarBounds.width;

	const seeking = (event) => {
		// Return if the user is not adjusting the volume
		if(!this.playerState.isUserAdjustingVolume) return;
		// Determine the mouse position
		const mousePosition = event.clientX;
		// Calculate the percentage of the volume bar that has been traversed
		const percent = Math.max(0, Math.min(1, (mousePosition - barLeft) / barWidth));
		// Update the audio volume based on the percentage
		this.audio.volume = percent;
	};

	const seeked = (event) => {
		document.removeEventListener('mousemove', seeking);
		document.removeEventListener('mouseup', seeked);
		// Set the user adjusting volume state to false
		this.playerState.isUserAdjustingVolume = false;
	};

	// Intial Seek for click
	seeking(event);

	// Add event listeners for dragging and releasing the mouse
	document.addEventListener('mousemove', seeking);
	document.addEventListener('mouseup', seeked);
}

// Function to update the scrollbar thumb's size and position
updateScrollbarThumb() {
	const { scrollbarThumb } = this.uiElements;

	var visibleRatio = this.uiElements.playlist.clientHeight / this.uiElements.playlist.scrollHeight;
	// Set thumb height relative to the visible portion of the playlist, with a minimum of 10%
	scrollbarThumb.style.height = Math.max(visibleRatio * 100, 10) + "%";
	// Position the thumb based on the current scroll position
	scrollbarThumb.style.top = (this.uiElements.playlist.scrollTop / this.uiElements.playlist.scrollHeight) * 100 + "%";
}

// Shows the scrollbar by adding a class to the playlist wrapper.
showScrollbar() {
	const { addClass } = this;
	// Add the class to show the scrollbar
	addClass(this.uiElements.playlistContainer, 'tp-playlist-hovered');
	// Clear any existing timeout for hiding the scrollbar
	clearTimeout(this.playerState.scrollbarTimeOutId);
}

// Hides the scrollbar by removing a class from the playlist wrapper after a delay.
hideScrollbar() {
	const { removeClass } = this;
	// Set a timeout to remove the class and hide the scrollbar
	this.playerState.scrollbarTimeOutId = setTimeout(() => {
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

coverLoaded() {
	const { addClass, removeClass } = this;
	const { coverContainer } = this.uiElements;

	addClass(coverContainer, "tp-end-change-cover");
	removeClass(coverContainer, 'tp-start-change-cover');
	coverContainer.onanimationend = () => {
		removeClass(coverContainer, 'tp-end-change-cover');
		coverContainer.onanimationend = null;
	}
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

// Switches to the next track in the playlist.
switchTrack() {
	this.playerState.log = 'Changing the Track';
	let scrollDistance = 0;

	const { audioBufferedProgress, audioPlaybackProgress, playlistItem, playlist, trackTitle } = this.uiElements;
	const { allowPlaylistScroll, maxVisibleTracks } = this.settings;
	const { addClass, removeClass } = this;
	const { isPlaylist } = this.playerState;
	const currentTrackIndex = this.currentTrack.index;

	// Disable radio info update
	this.playerState.allowRadioInfoUpdate = false;

	// Reset audio progress bars and pause audio
	audioBufferedProgress.style.width = "0px";
	audioPlaybackProgress.style.width = "0px";
	this.audio.pause();
	this.audio.currentTime = 0;

	// Update audio source and volume
	this.audio.src = this.playlist[currentTrackIndex].audio;
	this.audio.volume = this.playerState.isVolumeMuted ? 0 : this.settings.volume;

	// Update playlist item classes
	if(isPlaylist) {
		removeClass(playlistItem, ['tp-active', 'tp-playing']);
		addClass(playlistItem[currentTrackIndex], 'tp-active');
	}

	// Handle autoplay
	if(this.playerState.autoplay) {
		this.audio.play();
		this.playerState.allowRadioInfoUpdate = true;
	}

	// Handle playlist scrolling
	if(allowPlaylistScroll && this.playlist.length > maxVisibleTracks && this.playerState.isPlaylistDisplayed) {
		if(currentTrackIndex + 1 >= maxVisibleTracks) {
			scrollDistance = 40 * (currentTrackIndex - maxVisibleTracks + 1);
		}
		playlist.scrollTo({
			top: scrollDistance,
			behavior: 'smooth'
		});
	}

	// Update current track details
	this.currentTrack.artist = this.playlist[currentTrackIndex].artist;
	this.currentTrack.title = this.playlist[currentTrackIndex].title;
	this.currentTrack.cover = this.playlist[currentTrackIndex].cover;

	// Animate text change
	this.animateTextChange({
		artist: this.previousTrackIndex === currentTrackIndex ? '' : this.playlist[this.previousTrackIndex].artist,
		title: this.previousTrackIndex === currentTrackIndex ? '' : this.playlist[this.previousTrackIndex].title,
	}, {
		artist: this.currentTrack.artist,
		title: this.currentTrack.title
	});
	// Update track title attribute
	trackTitle.setAttribute('title', `${this.currentTrack.artist} - ${this.currentTrack.title}`);

	// Handle cover display
	const { cover } = this.playlist[currentTrackIndex];
	this.updateCovers(cover);
	
	this.playerState.log = 'Track Changed';
}

// Function to animate the text change for the track title and artist
animateTextChange(previousTrack, currentTrack) {
	const { adjustText } = this;
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
		previousArtist = adjustText(previousArtist, currentArtist);
			
		// Adjust the title text based on its length compared to the current title
		previousTitle = adjustText(previousTitle, currentTitle);
			
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

updateCovers(cover) {
	const { addClass, removeClass } = this;
	const { coverContainer, coverImage, wrapper } = this.uiElements;
	const { showCover } = this.settings;

	if(cover && cover !== "" && showCover) {
		removeClass(wrapper, 'tp-no-cover');
		addClass(coverContainer, 'tp-start-change-cover');
		coverContainer.onanimationend = () => {
			coverContainer.onanimationend = null;
			coverImage.src = cover;
		}
	} else {
		addClass(wrapper, 'tp-no-cover');
	}
}

// Fetches and updates the radio information by making a request to the server.
async updateRadioInfo() {
	const { showCover, autoUpdateRadioCovers, pluginDirectoryPath } = this.settings;
	const { allowRadioInfoUpdate, isRadioInfoUpdatePending } = this.playerState;
	const { index: currentIndex, artist: currentArtist, title: currentTitle, cover: currentCover } = this.currentTrack;
	const { trackTitle } = this.uiElements;

	// Exit if updates are not allowed or if an update is already in progress
	if (!allowRadioInfoUpdate || isRadioInfoUpdatePending) return;

	// Retrieve the audio URL for the current track
	const currentAudioUrl = this.playlist[currentIndex].audio;

	// Determine if cover images should be updated based on settings
	const shouldUpdateCovers = showCover && autoUpdateRadioCovers;

	// Prepare fetch parameters for the POST request
	const requestParams = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ url: currentAudioUrl, cover: shouldUpdateCovers })
	};

	// Set the update state to pending to prevent duplicate requests
	this.playerState.isRadioInfoUpdatePending = true;

	try {
		// Send the request to fetch new radio information
		const response = await fetch(`${pluginDirectoryPath}/assets/tp-radio-info.php`, requestParams);
		const fetchedData = await response.json();

		// Reset the pending state for the update
		this.playerState.isRadioInfoUpdatePending = false;

		// Abort the update if the track has changed since the request started
		if (currentIndex !== this.currentTrack.index) return;

		console.log(fetchedData);

		if (fetchedData) {
			const { artist: fetchedArtist, title: fetchedTitle, cover: fetchedCover } = fetchedData;

			// Update artist and title if they have changed
			if (currentArtist !== fetchedArtist || currentTitle !== fetchedTitle) {
				this.animateTextChange(
					{ artist: currentArtist, title: currentTitle },
					{ artist: fetchedArtist, title: fetchedTitle }
				);
				this.currentTrack.artist = fetchedArtist;
				this.currentTrack.title = fetchedTitle;
				trackTitle.setAttribute('title', `${fetchedArtist} - ${fetchedTitle}`);
			}

			// Update cover if fetchedCover is different, or use playlist cover if not provided
			if (fetchedCover) {
				if (fetchedCover !== currentCover) {
					this.currentTrack.cover = fetchedCover;
					this.updateCovers(fetchedCover);
				}
			} else {
				if (currentCover !== this.playlist[currentIndex].cover) {
					this.currentTrack.cover = this.playlist[currentIndex].cover;
					this.updateCovers(this.playlist[currentIndex].cover);
				}
			}
			
		} else {
			// If no data received, reset artist, title, and cover to playlist values if different
			if (currentArtist !== this.playlist[currentIndex].artist || currentTitle !== this.playlist[currentIndex].title) {
				this.animateTextChange(
					{ artist: currentArtist, title: currentTitle },
					{ artist: this.playlist[currentIndex].artist, title: this.playlist[currentIndex].title }
				);
				this.currentTrack.artist = this.playlist[currentIndex].artist;
				this.currentTrack.title = this.playlist[currentIndex].title;
			}
			if (currentCover !== this.playlist[currentIndex].cover) {
				this.currentTrack.cover = this.playlist[currentIndex].cover;
				this.updateCovers(this.playlist[currentIndex].cover);
			}
		}
	} catch (error) {
		// Log any errors encountered during the fetch operation
		console.error("Error fetching radio info:", error);
	} finally {
		// Ensure the pending state is reset after the operation
		this.playerState.isRadioInfoUpdatePending = false;
	}
}