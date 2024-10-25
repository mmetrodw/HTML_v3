abort() {
	this.playerState.audioEvent = 'abort';
	// Set the seeking state to false
	this.isSeeking(false);
	// Disable radio info updates
	this.playerState.isRadioInfoUpdateAllowed = false;
}

canplay() {
	this.playerState.audioEvent = 'canplay';
	// Set loading status to false
	this.playerState.isLoading = false;
	// Set the seeking state to true
	this.isSeeking(true);
}

canplaythrough() {
	this.playerState.audioEvent = 'canplaythrough';
	// Set loading status to false
	this.playerState.isLoading = false;
	// Set the seeking state to true
	this.isSeeking(true);

	// Start playback if autoplay is enabled
	if (this.playerState.autoplay) this.audio.play();
}

durationchange() {
	this.playerState.audioEvent = 'durationchange';
	const { audioDuration } = this.uiElements;

	// Update the duration display in the UI
	audioDuration.textContent = this.utils.secondsToTimecode(this.audio.duration);
	// Show or hide the duration element based on whether the duration is not Infinity
	audioDuration.style = this.audio.duration !== Infinity ? "block" : "none";
	// Set the seeking state to true
	this.isSeeking(true);
}

emptied() {
	this.playerState.audioEvent = 'emptied';
	// Set the seeking state to false
	this.isSeeking(false);
	// Disable radio info updates
	this.playerState.isRadioInfoUpdateAllowed = false;
}

// Ended
ended() {
	this.playerState.audioEvent = 'ended';
	// Play Next
	this.nextTrack();
}

error() {
	this.playerState.audioEvent = 'error';
	// Set the seeking state to false
	this.isSeeking(false);
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

	// Disable radio info updates
	this.playerState.isRadioInfoUpdateAllowed = false;
	// Pause the audio
	this.pause();
	// Disable autoplay
	this.playerState.autoplay = false;
	// Add the 'error' class to the player UI
	this.utils.addClass(this.uiElements.wrapper, 'tp-error');
	// Show the error message
	this.uiElements.errorMessage.textContent = "tPlayer Error: " + errorCode;
	console.log("tPlayer Error: " + errorCode);
	return false;
}

loadstart() {
	this.playerState.audioEvent = 'loadstart';
	// Set loading status to true
	this.playerState.isLoading = true;
}

loadeddata() {
	this.playerState.audioEvent = 'loadeddata';
	// Set the seeking state to true
	this.isSeeking(true);
	// Set loading status to false
	this.playerState.isLoading = false;
}

loadedmetadata() {
	this.playerState.audioEvent = 'loadedmetadata';
	const { audioDuration } = this.uiElements;

	// Update the duration display in the UI
	audioDuration.textContent = this.utils.secondsToTimecode(this.audio.duration);
	// Show or hide the duration element based on whether the duration is not Infinity
	audioDuration.style = this.audio.duration !== Infinity ? "block" : "none";
	// Set the seeking state to true
	this.isSeeking(true);
	// Set loading status to false
	this.playerState.isLoading = false;
}

pause() {
	this.playerState.audioEvent = 'pause';
	const { playlistItem, playbackButton } = this.uiElements;
	const { removeClass } = this.utils;

	// Remove the 'playing' class from playlist items
	removeClass(playlistItem, 'tp-playing');
	// Remove the 'active' class from the playback button
	removeClass(playbackButton, 'tp-active');
	// Update the playback button icon to 'play'
	playbackButton.querySelector('path').setAttribute('d', this.buttonIcons.playback.play);
	// Disable radio info updates
	this.playerState.isRadioInfoUpdateAllowed = false;
}

play() {
	this.playerState.audioEvent = 'play';
	const { playlistItem, playbackButton } = this.uiElements;
	const { addClass } = this.utils;
	// Pause all other players in the collection
	for (let player in tPlayersCollection) {
		if (player !== this.playerId) {
			tPlayersCollection[player].pause();
		}
	}
	// Add the 'playing' class to the current playlist item
	if(this.playerState.isPlaylist) addClass(playlistItem[this.currentTrack.index], 'tp-playing');
	// Add the 'active' class to the playback button
	addClass(playbackButton, 'tp-active');
	// Update the playback button icon to 'pause'
	playbackButton.querySelector('path').setAttribute('d', this.buttonIcons.playback.pause);
	// Set the seeking state to true
	this.isSeeking(true);
	// Enable radio info updates
	this.playerState.isRadioInfoUpdateAllowed = true;
}

playing() {
	this.playerState.audioEvent = 'playing';
	// Set loading status to false
	this.playerState.isLoading = false;
	// Set the seeking state to true
	this.isSeeking(true);
	// Enable radio info updates
	this.playerState.isRadioInfoUpdateAllowed = true;
}

progress() {
	this.playerState.audioEvent = 'progress';
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
}

ratechange() {
	this.playerState.audioEvent = 'ratechange';
	console.log("Rate Change");
}

seeked() {
	this.playerState.audioEvent = 'seeked';
	// Set loading status to false
	this.playerState.isLoading = false;
}

seeking() {
	this.playerState.audioEvent = 'seeking';
	// Set loading status to true
	this.playerState.isLoading = true;
}

stalled() {
	this.playerState.audioEvent = 'stalled';
	// Set the seeking state to false
	this.isSeeking(false);
	// Set loading status to true
	this.playerState.isLoading = true;
	// Disable radio info updates
	this.playerState.isRadioInfoUpdateAllowed = false;
	// Log the stalled event
	console.log('Playback stalled at', this.audio.currentTime);
}

suspend() {
	this.playerState.audioEvent = 'suspend';
	// Disable radio info updates
	this.playerState.isRadioInfoUpdateAllowed = false;
}

timeupdate() {
	this.playerState.audioEvent = 'timeupdate';
	if (!this.playerState.isUserSeekingAudio) {
		// Set the current time of the track to match the audio's current time
		this.currentTrack.currentTime = this.audio.currentTime;
		// Calculate the percentage of the track that has been played
		const percent = (this.currentTrack.currentTime / this.audio.duration) * 100;
		// Update the width of the playback progress bar
		this.uiElements.audioPlaybackProgress.style.width = percent + '%';
		// Update the displayed current time in the player
		this.uiElements.audioCurrentTime.textContent = this.utils.secondsToTimecode(this.audio.currentTime);
		// Call the progress function to update the buffered progress bar
		this.progress();
	}
}

volumechange() {
	this.playerState.audioEvent = 'volumechange';
	const paths = this.uiElements.volumeButton.children[0].children;
	this.settings.volume = this.audio.volume !== 0 ? this.audio.volume : this.settings.volume;
	this.uiElements.volumeLevel.style.width = `${this.audio.volume * 100}%`;

	// Update the visibility of volume level indicators
	paths[1].style.transform = this.audio.volume < 0.25 ? "scale(0)" : "scale(1)";
	paths[2].style.transform = this.audio.volume < 0.5 ? "scale(0)" : "scale(1)";
	paths[3].style.transform = this.audio.volume === 0 ? "scale(1)" : "scale(0)";

	// Update the mute state and button appearance
	if(this.audio.volume === 0) {
		this.playerState.isVolumeMuted = true;
		this.utils.addClass(this.uiElements.volumeButton, 'tp-active');
	} else {
		this.playerState.isVolumeMuted = false;
		this.utils.removeClass(this.uiElements.volumeButton, 'tp-active');
	}
}

waiting() {
	this.playerState.audioEvent = 'waiting';
	// Set loading status to true
	this.playerState.isLoading = true;
	// Set the seeking state to false
	this.isSeeking(false);
	// Disable radio info updates
	this.playerState.isRadioInfoUpdateAllowed = false;
}