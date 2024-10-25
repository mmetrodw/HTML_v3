this.playerState = {
	_audioEvent: null,
	_autoplay: false,
	_repeat: false,
	_scrollbarTimeOutId: null,
	_shuffle: false,
	_status: [],
	_titleAnimationInterval: null,
	_volumeToggle: false,
	_isLoading: false,
	_isMobile: utils.isMobileDevice(),
	_isPlaylist: null,
	_isPlaylistDisplayed: false,
	_isRadioInfoUpdateAllowed: false,
	_isRadioInfoUpdatePending: false,
	_isShareDisplayed: false,
	_isUserAdjustingVolume: false,
	_isUserSeekingAudio: false,
	_isVolumeMuted: false,

	get audioEvent() { return this._audioEvent;	},
	get autoplay() { return this._autoplay;	},
	get repeat() { return this._repeat;	},
	get scrollbarTimeOutId() { return this._scrollbarTimeOutId;	},
	get shuffle() { return this._shuffle;	},
	get status() { return this._status;	},
	get titleAnimationInterval() { return this._titleAnimationInterval;	},
	get volumeToggle() { return this._volumeToggle;	},
	get isLoading() { return this._isLoading; },
	get isPlaylist() { return this._isPlaylist; },
	get isPlaylistDisplayed() { return this._isPlaylistDisplayed; },
	get isRadioInfoUpdateAllowed() { return this._isRadioInfoUpdateAllowed; },
	get isRadioInfoUpdatePending() { return this._isRadioInfoUpdatePending; },
	get isShareDisplayed() { return this._isShareDisplayed; },
	get isUserAdjustingVolume() { return this._isUserAdjustingVolume; },
	get isUserSeekingAudio() { return this._isUserSeekingAudio; },
	get isVolumeMuted() { return this._isVolumeMuted; },

	set audioEvent(value) {
		if(this._audioEvent !== value) {
			this._audioEvent = value;
			this._status.push(`Audio Event: ${this._audioEvent}`);
		}
	},
	set autoplay(value) { this._autoplay = value;	},
	set repeat(value) { this._repeat = value; },
	set scrollbarTimeOutId(value) { this._scrollbarTimeOutId = value; },
	set shuffle(value) { this._shuffle = value; },
	set status(value) {	this._status.push(value);
	},
	set titleAnimationInterval(value) { this._titleAnimationInterval = value; },
	set volumeToggle(value) { this._volumeToggle = value; },
	set isLoading(value) {
		if(this._isLoading !== value) {
			console.log(`isLoading: ${value}`);
			this._isLoading = value;
			this.handleIsLoadingChange();
		}
	},
	set isPlaylist(value) { this._isPlaylist = value; },
	set isPlaylistDisplayed(value) { this._isPlaylistDisplayed = value; },
	set isRadioInfoUpdateAllowed(value) { this._isRadioInfoUpdateAllowed = value; },
	set isRadioInfoUpdatePending(value) { this._isRadioInfoUpdatePending = value; },
	set isShareDisplayed(value) { this._isShareDisplayed = value; },
	set isUserAdjustingVolume(value) { this._isUserAdjustingVolume = value; },
	set isUserSeekingAudio(value) { this._isUserSeekingAudio = value; },
	set isVolumeMuted(value) { this._isVolumeMuted = value; },

	handleIsLoadingChange: () => {
		if(this._isLoading) {
			// Add the loading class to the player UI
			utils.addClass(this.uiElements.wrapper, 'tp-loading');
		} else {
			// Remove the loading class from the player UI
			utils.removeClass(this.uiElements.wrapper, 'tp-loading');
		}
	},
}