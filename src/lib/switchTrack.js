switchTrack() {
	this.playerState.log = 'Changing the Track';
	let scrollDistance = 0;

	const { audioBufferedProgress, audioPlaybackProgress, playlistItem, playlist, trackTitle, coverContainer, coverImage } = this.uiElements;
	const { allowPlaylistScroll, maxVisibleTracks, showCover } = this.settings;
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

	if(cover && cover !== "" && showCover) {
		addClass(coverContainer, 'tp-start-change-cover');
		coverContainer.onanimationend = () => {
			coverContainer.onanimationend = null;
			coverImage.src = cover;
		}
	}
	
	this.playerState.log = 'Track Changed';
}