var tPlayersCollection = [];
// @include('data/defaultSettings.js')

// Easings 
// @include('data/easingFunctions.js')

class tPlayerClass {
	constructor(options) {
		this.settings = this.utils.deepObjectMerge(defaultPlayerSettings, options);
		this.playlist = JSON.parse(JSON.stringify(this.settings.playlist)); // Clone Palylist to variable
		this.uiElements = [];
		this.playerId = this.utils.getRandomID();
		
		// PLAYER STATE
		// @include('data/playerState.js')

		this.currentTrack = {
			index: 0,
			title: null,
			artist: null,
			cover: null,
		};

		this.previousTrackIndex = 0;

		this.init();
	}


	// Validate Player Config
	// @include('lib/validatePlayerConfig.js')

	// Create Player Interface
	// @include('lib/createPlayerInterface.js')

	// Function to apply styles from the JSON object as CSS variables
	// @include('lib/applyPlayerStyles.js')

	// Sets up event listeners for the audio player
	async setupEventListeners() {
		this.playerState.status = 'Setting Up Event Listeners';
		const { isPlaylist, isMoblie } = this.playerState;
		const { showRepeatButton, showShuffleButton, showShareButton } = this.settings;
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
			playbackButton, prevButton, nextButton, volumeButton, repeatButton, shuffleButton, shareButton,
			facebookButton, twitterButton, tumblrButton, togglePlaylistButton, playlistItem, audioSeekBar,
			volumeLevelBar, playlistConainer, playlist, scrollbarTrack, coverImage
		} = this.uiElements;

		// Add event listeners for control buttons
		playbackButton.addEventListener('click', this.playback.bind(this));

		if(isPlaylist) {
			prevButton.addEventListener('click', this.prevTrack.bind(this));
			nextButton.addEventListener('click', this.nextTrack.bind(this));
			if(showShuffleButton) shuffleButton.addEventListener('click', this.shuffleToggle.bind(this));
			togglePlaylistButton.addEventListener('click', this.togglePlaylist.bind(this));
		}

		if(showRepeatButton) repeatButton.addEventListener('click', this.repeatToggle.bind(this));

		if(showShareButton) {
			shareButton.addEventListener('click', this.shareToggle.bind(this));
			facebookButton.addEventListener('click', this.shareFacebook.bind(this));
			twitterButton.addEventListener('click', this.shareTwitter.bind(this));
			tumblrButton.addEventListener('click', this.shareTumblr.bind(this));
		}

		volumeButton.addEventListener('click', this.volumeToggle.bind(this));



		this.playerState.status = 'Event Listeners Are Set';
	}

	/* AUDIO EVENTS */ 
	// @include('lib/audioEvents.js')



	/* PLAYER METHODS */

	// Simulates a button click effect by adding and then removing a CSS class.
	simulateClickEffect(element) {
		// Add the "tp-click" class to the element
		this.utils.addClass(element, "tp-click");
		// Remove the "tp-click" class after animation end
		if (!element.onanimationend) {
			element.onanimationend = () => {
				this.utils.removeClass(element, "tp-click");
			};
		}
	}



	/* PLAYER FUNCTION */
	
	// Sets the pointer events for the audio seek bar based on the seeking state.
	isSeeking(state) {
		this.uiElements.audioSeekBar.style.pointerEvents = state && this.audio.duration !== Infinity ? "all" : "none";
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
				this.orderList = this.utils.getShuffledPlaylistOrder();
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
				this.orderList = this.utils.getShuffledPlaylistOrder();
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
		this.utils.toggleClass(repeatButton, "tp-active");
		// Simulate the click effect on the repeat button
		this.simulateClickEffect(repeatButton);
	}

	// Toggles the shuffle state of the player.
	shuffleToggle() {
		const { shuffleButton } = this.uiElements;
		const { toggleClass, getShuffledPlaylistOrder } = this.utils;
		
		// Toggle the shuffle state
		this.playerState.shuffle = !this.playerState.shuffle;

		// Toggle the "tp-active" class on the shuffle button
		toggleClass(shuffleButton, "tp-active");

		// Simulate the click effect on the shuffle button
		this.simulateClickEffect(shuffleButton);

		// Regenerate the shuffled playlist order if shuffle is enabled, otherwise set to null
		this.orderList = (this.playerState.shuffle) ? getShuffledPlaylistOrder() : null;
	}

	// Toggles the share state of the player.
	shareToggle() {
		const { shareButton, wrapper } = this.uiElements;

		// Toggle the shera display state
		this.playerState.isShareDisplayed = !this.playerState.isShareDisplayed;
		// Toggle the "tp-sharing" class on the player
		this.utils.toggleClass(wrapper, "tp-sharing");
		// Toggle the "tp-active" class on the share button
		this.utils.toggleClass(shareButton, "tp-active");
		// Simulate the click effect on the share button
		this.simulateClickEffect(shareButton);

		if (this.playerState.isShareDisplayed) {
			// Animate the button icon to the "opened" state
			this.utils.animatePathSvg(
				shareButton.querySelector('.tp-stroke'),
				this.buttonIcons.share.closed.stroke,
				this.buttonIcons.share.opened.stroke,
				250,
				'easeOutExpo'
			);
			this.utils.animatePathSvg(
				shareButton.querySelector('.tp-fill'),
				this.buttonIcons.share.closed.fill,
				this.buttonIcons.share.opened.fill,
				250,
				'easeOutExpo'
			);
		} else {
			// Animate the button icon to the "closed" state
			this.utils.animatePathSvg(
				shareButton.querySelector('.tp-stroke'),
				this.buttonIcons.share.opened.stroke,
				this.buttonIcons.share.closed.stroke,
				250,
				'easeOutExpo'
			);
			this.utils.animatePathSvg(
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
		this.utils.toggleClass(togglePlaylistButton, "tp-active");
		// Simulate the click effect on the toggle playlist button
		this.simulateClickEffect(togglePlaylistButton);

		if (this.playerState.isPlaylistDisplayed && this.playlist.length > 1) {
			// Animate the button icon to the "opened" state
			this.utils.animatePathSvg(
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
			this.utils.animatePathSvg(
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

		// Toggle the mute state
		this.playerState.isVolumeMuted = !this.playerState.isVolumeMuted;
		// Toggle the "tp-active" class on the volume button
		this.utils.toggleClass(volumeButton, "tp-active");
		// Simulate the click effect on the volume button
		this.simulateClickEffect(volumeButton);
		// Adjust the audio volume based on the mute state
		this.audio.volume = this.playerState.isVolumeMuted ? 0 : this.volume;
		// Update the volume level display width
		volumeLevel.style.width = this.playerState.isVolumeMuted ? this.audio.volume * 100 : 0;
	}
	
	// Switches to the next track in the playlist.
	// @include('lib/switchTrack.js')

	// Function to animate the text change for the track title and artist
	// @include('lib/animateTextChange.js')

	async init() {
		this.playerState.status = 'Initializing';
		// Validate Player Config
		await this.validatePlayerConfig();
		// Create Player Interface
		await this.createPlayerInterface();
		// Apply Player Styles
		await this.applyPlayerStyles(this.settings.style, this.uiElements.wrapper);
		// Create Audio and Add It to Collection
		this.audio = new Audio();
		this.audio.preload = "metadata";
		this.audio.volume = 0;
		// Add to List of Players
		tPlayersCollection[this.playerId] = this.audio;
		// Enable playlist scroll if allowed and the number of tracks exceeds the maximum visible tracks
		if (this.settings.allowPlaylistScroll && this.playlist.length > this.settings.maxVisibleTracks && this.playerState.isPlaylist) {
			this.utils.addClass(this.uiElements.wrapper, "tp-scrollable");
			this.uiElements.playlist.style.height = `${40 * this.settings.maxVisibleTracks}px`;
		}
		// Show playlist if the setting is enabled and its Playlist
		if(this.settings.showPlaylist && this.playerState.isPlaylist) {
			this.togglePlaylist();
		}
		// Setup Event Listeners
		this.setupEventListeners();
		// Load And Prepare The Initial Track For Playback
		this.switchTrack();
		console.log(this);
		console.log(this.playerState.status);
	}

	/* UTILS */
	utils = {
		// Get Random ID
		// @include('utils/getRandomID.js'),
		// Deep Object Merge
		// @include('utils/deepObjectMerge.js'),
		// Detect Mobile
		// @include('utils/isMobileDevice.js'),
		// Add Class
		// @include('utils/addClass.js'),
		// Remove Class
		// @include('utils/removeClass.js'),
		// Toggle Class
		// @include('utils/toggleClass.js'),
		// Format Time
		// @include('utils/secondsToTimecode.js'),
		// Shuffle Array
		// @include('utils/getShuffledPlaylistOrder.js'),
		// Animate Path Svg
		// @include('utils/animatePathSvg.js'),
	};

	// Button Icons
	// @include('data/buttonIcons.js')
}

function tPlayer(options) {
	return new tPlayerClass(options);
}