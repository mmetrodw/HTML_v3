this.playerState = {
	_allowRadioInfoUpdate: false,
	_allowSeeking: false,
	_audioEvent: null,
	_autoplay: false,
	_log: [],
	_repeat: false,
	_scrollbarTimeOutId: null,
	_shuffle: false,
	_titleAnimationInterval: null,
	_volumeToggle: false,
	_isLoading: false,
	_isMobile: this.isMobileDevice(),
	_isPlaylist: null,
	_isPlaylistDisplayed: false,
	_isRadioInfoUpdatePending: false,
	_isShareDisplayed: false,
	_isUserAdjustingVolume: false,
	_isUserSeekingAudio: false,
	_isVolumeMuted: false,

	get allowRadioInfoUpdate() { return this._allowRadioInfoUpdate; },
	get allowSeeking() { return this._allowSeeking;	},
	get audioEvent() { return this._audioEvent;	},
	get autoplay() { return this._autoplay;	},
	get log() { return this._log;	},
	get repeat() { return this._repeat;	},
	get scrollbarTimeOutId() { return this._scrollbarTimeOutId;	},
	get shuffle() { return this._shuffle;	},
	get titleAnimationInterval() { return this._titleAnimationInterval;	},
	get volumeToggle() { return this._volumeToggle;	},
	get isLoading() { return this._isLoading; },
	get isPlaylist() { return this._isPlaylist; },
	get isPlaylistDisplayed() { return this._isPlaylistDisplayed; },
	get isRadioInfoUpdatePending() { return this._isRadioInfoUpdatePending; },
	get isShareDisplayed() { return this._isShareDisplayed; },
	get isUserAdjustingVolume() { return this._isUserAdjustingVolume; },
	get isUserSeekingAudio() { return this._isUserSeekingAudio; },
	get isVolumeMuted() { return this._isVolumeMuted; },

	set allowRadioInfoUpdate(value) { this._allowRadioInfoUpdate = value; },
	set allowSeeking(value) { 
		if(this._allowSeeking !== value) {
			this._allowSeeking = value;
			this.handleAllowSeekingChange();
		}
	},
	set audioEvent(value) {
		if(this._audioEvent !== value) {
			this._audioEvent = value;
			this._log.push(`Audio Event: ${this._audioEvent}`);
		}
	},
	set autoplay(value) { this._autoplay = value;	},
	set log(value) {	this._log.push(value);	},
	set repeat(value) { this._repeat = value; },
	set scrollbarTimeOutId(value) { this._scrollbarTimeOutId = value; },
	set shuffle(value) { this._shuffle = value; },
	set titleAnimationInterval(value) { this._titleAnimationInterval = value; },
	set volumeToggle(value) { this._volumeToggle = value; },
	set isLoading(value) {
		if(this._isLoading !== value) {
			console.log(`isLoading: ${value}`);
			this._isLoading = value;
			this.handleIsLoadingChange(value);
		}
	},
	set isPlaylist(value) { this._isPlaylist = value; },
	set isPlaylistDisplayed(value) { this._isPlaylistDisplayed = value; },
	set isRadioInfoUpdatePending(value) { this._isRadioInfoUpdatePending = value; },
	set isShareDisplayed(value) { this._isShareDisplayed = value; },
	set isUserAdjustingVolume(value) { this._isUserAdjustingVolume = value; },
	set isUserSeekingAudio(value) { this._isUserSeekingAudio = value; },
	set isVolumeMuted(value) { this._isVolumeMuted = value; },

	handleAllowSeekingChange: () => {
		this.uiElements.audioSeekBar.style.pointerEvents = this._allowSeeking && this.audio.duration !== Infinity ? "all" : "none";
	},
	handleIsLoadingChange: (state) => {
		const { addClass, removeClass } = this;
		if(state) {
			// Add the loading class to the player UI
			addClass(this.uiElements.wrapper, 'tp-loading');
		} else {
			// Remove the loading class from the player UI
			removeClass(this.uiElements.wrapper, 'tp-loading');
		}
	},
}