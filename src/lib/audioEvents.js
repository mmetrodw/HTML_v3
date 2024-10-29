abort() {
	// Forbid Seeking
	this.playerState.allowSeeking = false;
	// Disable radio info updates
	this.playerState.allowRadioInfoUpdate = false;
	// Set Audio Event
	this.playerState.audioEvent = 'abort';
}

canplay() {
	// Set loading status to false
	this.playerState.isLoading = false;
	// Allow Seeking
	this.playerState.allowSeeking = true;
	this.playerState.audioEvent = 'canplay';
}

canplaythrough() {
	// Set loading status to false
	this.playerState.isLoading = false;
	// Allow Seeking
	this.playerState.allowSeeking = true;
	// Start playback if autoplay is enabled
	if (this.playerState.autoplay) this.audio.play();
	// Set Audio Event
	this.playerState.audioEvent = 'canplaythrough';
}

durationchange() {
	const { audioDuration } = this.uiElements;
	const { secondsToTimecode } = this;
	// Update the duration display in the UI
	audioDuration.textContent = secondsToTimecode(this.audio.duration);
	// Show or hide the duration element based on whether the duration is not Infinity
	audioDuration.style.display = this.audio.duration !== Infinity ? "block" : "none";
	// Allow Seeking
	this.playerState.allowSeeking = true;
	// Set Audio Event
	this.playerState.audioEvent = 'durationchange';
}

emptied() {
	// Forbid Seeking
	this.playerState.allowSeeking = false;
	// Disable radio info updates
	this.playerState.allowRadioInfoUpdate = false;
	// Set Audio Event
	this.playerState.audioEvent = 'emptied';
}

// Ended
ended() {
	// Play Next
	this.nextTrack();
	// Set Audio Event
	this.playerState.audioEvent = 'ended';
}

error() {
	const { addClass } = this;
	// Forbid Seeking
	this.playerState.allowSeeking = false;
	// Set loading status to false
	this.playerState.isLoading = false;

	// Define error messages for different error codes
	const errorCodes = {
		1: 'The user canceled the audio.',
		2: 'A network error occurred while fetching the audio.',
		3: 'An error occurred while decoding the audio.',
		4: 'The audio is missing or is in a format not supported by your browser.',
		default: 'An unknown error occurred.'
	};

	// Get the error message based on the error code
	const errorCode = errorCodes[this.audio.error.code] || errorCodes['default'];
	// Add the 'error' class to the player UI
	addClass(this.uiElements.wrapper, 'tp-error');
	// Show the error message
	this.uiElements.errorMessage.textContent = "tPlayer Error: " + errorCode;
	// Pause the audio
	this.pause();
	// Disable radio info updates
	this.playerState.allowRadioInfoUpdate = false;
	// Disable autoplay
	this.playerState.autoplay = false;
	// Set Audio Event
	this.playerState.audioEvent = 'error';
	return false;
}

loadstart() {
	// Set loading status to true
	this.playerState.isLoading = true;
	// Set Audio Event
	this.playerState.audioEvent = 'loadstart';
}

loadeddata() {
	// Allow Seeking
	this.playerState.allowSeeking = true;
	// Set loading status to false
	this.playerState.isLoading = false;
	// Set Audio Event
	this.playerState.audioEvent = 'loadeddata';
}

loadedmetadata() {
	const { secondsToTimecode } = this;
	const { audioDuration } = this.uiElements;
	// Update the duration display in the UI
	audioDuration.textContent = secondsToTimecode(this.audio.duration);
	// Show or hide the duration element based on whether the duration is not Infinity
	audioDuration.style.display = this.audio.duration !== Infinity ? "block" : "none";
	// Allow Seeking
	this.playerState.allowSeeking = true;
	// Set loading status to false
	this.playerState.isLoading = false;
	// Set Audio Event
	this.playerState.audioEvent = 'loadedmetadata';
}

pause() {
	const { playlistItem, playbackButton } = this.uiElements;
	const { removeClass } = this;
	// Remove the 'playing' class from playlist items
	removeClass(playlistItem, 'tp-playing');
	// Remove the 'active' class from the playback button
	removeClass(playbackButton, 'tp-active');
	// Update the playback button icon to 'play'
	playbackButton.querySelector('path').setAttribute('d', this.buttonIcons.play);
	// Disable radio info updates
	this.playerState.allowRadioInfoUpdate = false;
	// Set Audio Event
	this.playerState.audioEvent = 'pause';
}

play() {
	const { playlistItem, playbackButton } = this.uiElements;
	const { addClass } = this;
	// Pause all other players in the collection
	for (let player in tPlayersCollection) {
		if (player !== this.playerId) {
			tPlayersCollection[player].pause();
		}
	}
	// Add the 'playing' class to the current playlist item, if it's Playlist
	if(this.playerState.isPlaylist) addClass(playlistItem[this.currentTrack.index], 'tp-playing');
	// Add the 'active' class to the playback button
	addClass(playbackButton, 'tp-active');
	// Update the playback button icon to 'pause'
	playbackButton.querySelector('path').setAttribute('d', this.buttonIcons.pause);
	// Allow Seeking
	this.playerState.allowSeeking = true;
	// Enable radio info updates
	this.playerState.allowRadioInfoUpdate = true;
	// Set Audio Event
	this.playerState.audioEvent = 'play';
}

playing() {
	// Set loading status to false
	this.playerState.isLoading = false;
	// Allow Seeking
	this.playerState.allowSeeking = true;
	// Enable radio info updates
	this.playerState.allowRadioInfoUpdate = true;
	// Set Audio Event
	this.playerState.audioEvent = 'playing';
}

progress() {
	// Check if there are buffered data
	if (this.audio.buffered.length) {
		const duration = this.audio.duration;
		const buffered = this.audio.buffered.end(this.audio.buffered.length - 1);
		const progress = buffered / duration;
		// Update the width of the buffered progress bar
		this.uiElements.audioBufferedProgress.style.width = `${progress * 100}%`;
		// Set the opacity of the buffered progress bar
		this.uiElements.audioBufferedProgress.style.opacity = progress === 1 ? 0 : 1;
	}
	// Set Audio Event
	this.playerState.audioEvent = 'progress';
}

ratechange() {
	// Set Audio Event
	this.playerState.audioEvent = 'ratechange';
}

seeked() {
	// Set loading status to false
	this.playerState.isLoading = false;
	// Allow Seeking
	this.playerState.allowSeeking = true;
	// Enable radio info updates
	this.playerState.allowRadioInfoUpdate = true;
	// Set Audio Event
	this.playerState.audioEvent = 'seeked';
}

seeking() {
	// Set loading status to true
	this.playerState.isLoading = true;
	// Forbid Seeking
	this.playerState.allowSeeking = false;
	// Disable radio info updates
	this.playerState.allowRadioInfoUpdate = false;
	// Set Audio Event
	this.playerState.audioEvent = 'seeking';
}

stalled() {
	// Forbid Seeking
	this.playerState.allowSeeking = false;
	// Set loading status to true
	this.playerState.isLoading = true;
	// Disable radio info updates
	this.playerState.allowRadioInfoUpdate = false;
	// Log the stalled event
	console.log('Playback stalled at', this.audio.currentTime);
	// Set Audio Event
	this.playerState.audioEvent = 'stalled';
}

suspend() {
	// Disable radio info updates
	this.playerState.allowRadioInfoUpdate = false;
	// Set Audio Event
	this.playerState.audioEvent = 'suspend';
}

timeupdate() {
	const { secondsToTimecode } = this;
	if (!this.playerState.isUserSeekingAudio) {
		// Set the current time of the track to match the audio's current time
		this.currentTrack.currentTime = this.audio.currentTime;
		// Calculate the percentage of the track that has been played
		const percent = (this.currentTrack.currentTime / this.audio.duration) * 100;
		// Update the width of the playback progress bar
		this.uiElements.audioPlaybackProgress.style.width = percent + '%';
		// Update the displayed current time in the player
		this.uiElements.audioCurrentTime.textContent = secondsToTimecode(this.audio.currentTime);
		// Call the progress function to update the buffered progress bar
		this.progress();
	}
	// Set Audio Event
	this.playerState.audioEvent = 'timeupdate';
}

volumechange() {
	const { addClass, removeClass } = this;
	const { volumeLevel, volumeButton } = this.uiElements;
	this.settings.volume = this.audio.volume !== 0 ? this.audio.volume : this.settings.volume;
	volumeLevel.style.width = `${this.audio.volume * 100}%`;


	// Update the mute state and button appearance
	if(this.audio.volume === 0) {
		this.playerState.isVolumeMuted = true;
		addClass(volumeButton, 'tp-active');
		volumeButton.children[0].children[0].setAttribute('d', this.buttonIcons.muted);
	} else {
		this.playerState.isVolumeMuted = false;
		removeClass(volumeButton, 'tp-active');
		volumeButton.children[0].children[0].setAttribute('d', this.buttonIcons.volume);
	}
	// Set Audio Event
	this.playerState.audioEvent = 'volumechange';
}

waiting() {
	// Set loading status to true
	this.playerState.isLoading = true;
	// Forbid Seeking
	this.playerState.allowSeeking = false;
	// Disable radio info updates
	this.playerState.allowRadioInfoUpdate = false;
	// Set Audio Event
	this.playerState.audioEvent = 'waiting';
}