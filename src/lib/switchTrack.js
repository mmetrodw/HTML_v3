async switchTrack() {
	return new Promise(async (resolve, reject) => {
		try {
			this.playerState.status = 'Changing the Track';
			let scrollDistance = 0;
		
			const { audioBufferedProgress, audioPlaybackProgress, playlistItem, playlist, trackTitle, wrapper, coverImage } = this.uiElements;
			const { allowPlaylistScroll, maxVisibleTracks, showCover } = this.settings;
			const { addClass, removeClass } = utils;
			const currentTrackIndex = this.currentTrack.index;
		
			// Disable radio info update
			this.playerState.isRadioInfoUpdateAllowed = false;
		
			// Reset audio progress bars and pause audio
			audioBufferedProgress.style.width = "0px";
			audioPlaybackProgress.style.width = "0px";
			this.audio.pause();
			this.audio.currentTime = 0;
		
			// Update audio source and volume
			this.audio.src = this.playlist[currentTrackIndex].audio;
			this.audio.volume = this.playerState.isVolumeMuted ? 0 : this.settings.volume;
		
			// Update playlist item classes
			removeClass(playlistItem, ['tp-active', 'tp-playing']);
			addClass(playlistItem[currentTrackIndex], 'tp-active');
		
			// Handle autoplay
			if(this.playerState.autoplay) {
				this.audio.play();
				this.playerState.isRadioInfoUpdateAllowed = true;
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
				artist: this.playlist[this.previousTrackIndex].artist,
				title: this.playlist[this.previousTrackIndex].title
			}, {
				artist: this.currentTrack.artist,
				title: this.currentTrack.title
			});
			// Update track title attribute
			trackTitle.setAttribute('title', `${this.currentTrack.artist} - ${this.currentTrack.title}`);
		
			// Handle cover display
			const { cover } = this.playlist[currentTrackIndex];
		
			// Hide the cover of previous track
			coverImage.style.transform = 'scale(2)';
			coverImage.style.filter = 'blur(25px)';
			coverImage.style.opacity = 0;
			coverImage.style.transition = 'all 500ms var(--quickSlideInverse)';
		
			if(cover && cover !== "" && showCover) {
				removeClass(wrapper, 'tp-no-cover');
				setTimeout(() => {
					coverImage.setAttribute('src', cover);
				}, 500)
			} else {
				addClass(wrapper, 'tp-no-cover');
			}
			
			this.playerState.status = 'Track Changed';
			resolve();
		} catch (error) {
			reject(error);
		}
	});
}