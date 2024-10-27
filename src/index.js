var tPlayersCollection = [];
// @include('data/defaultSettings.js')

// Easings 
// @include('data/easingFunctions.js')

class tPlayerClass {
	constructor(options) {
		this.settings = this.deepObjectMerge(defaultPlayerSettings, options);
		this.playlist = JSON.parse(JSON.stringify(this.settings.playlist)); // Clone Palylist to variable
		this.uiElements = [];
		this.playerId = this.getRandomID();
		
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
		this.playerState.log = 'Setting Up Event Listeners';
		const { isPlaylist, isMobile } = this.playerState;
		const { showRepeatButton, showShuffleButton, showShareButton, showCover } = this.settings;
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

			// Add event listeners for scrollbar interactions
			playlistContainer.addEventListener('mouseenter', this.showScrollbar.bind(this)); // Show scrollbar on mouse enter
			playlistContainer.addEventListener('mouseleave', this.hideScrollbar.bind(this)); // Hide scrollbar on mouse leave
			playlist.addEventListener('scroll', this.updateScrollbarThumb.bind(this)); // Update scrollbar thumb position on scroll
			this.updateScrollbarThumb(); // Set Initial Scrollbar Thumb Position
			scrollbarTrack.addEventListener('wheel', event => { // Handle mouse wheel scrolling
				event.preventDefault();
				playlist.scrollTop += event.deltaY;
			}, { passive: false });
			scrollbarTrack.addEventListener('mousedown', this.scrollbarTrackSeekingStart.bind(this)); // Handle mouse down for scrollbar dragging
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

		// Add event listener for window resize
		window.addEventListener("resize", this.playerResize.bind(this));

		// Error Close
		errorCloseButton.addEventListener('click', () => {
			removeClass(wrapper, "tp-error");
		});

		this.playerState.log = 'Event Listeners Are Set';
	}

	/* AUDIO EVENTS */ 
	// @include('lib/audioEvents.js')

	/* PLAYER FUNCTION */
	// @include('lib/playerFunctions.js')
	
	// Switches to the next track in the playlist.
	// @include('lib/switchTrack.js')

	// Function to animate the text change for the track title and artist
	// @include('lib/animateTextChange.js')

	async init() {
		this.playerState.log = 'Initializing';
		// Validate Player Config
		await this.validatePlayerConfig();
		// Create Player Interface
		await this.createPlayerInterface();
		// Apply Player Styles
		await this.applyPlayerStyles();
		// Create Audio and Add It to Collection
		this.audio = new Audio();
		this.audio.preload = "metadata";
		this.audio.volume = 0;
		// Add to List of Players
		tPlayersCollection[this.playerId] = this.audio;
		// Show playlist if the setting is enabled and its Playlist
		if(this.settings.showPlaylist && this.playerState.isPlaylist) {
			this.togglePlaylist();
		}
		// Setup Event Listeners
		this.setupEventListeners();
		// Load And Prepare The Initial Track For Playback
		this.switchTrack();
		console.log(this);
		console.log(this.playerState.log);
	}

	/* UTILS */
	// Get Random ID
	// @include('utils/getRandomID.js')
	// Deep Object Merge
	// @include('utils/deepObjectMerge.js')
	// Detect Mobile
	// @include('utils/isMobileDevice.js')
	// Add Class
	// @include('utils/addClass.js')
	// Remove Class
	// @include('utils/removeClass.js')
	// Toggle Class
	// @include('utils/toggleClass.js')
	// Format Time
	// @include('utils/secondsToTimecode.js')
	// Shuffle Array
	// @include('utils/getShuffledPlaylistOrder.js')
	// Animate Path Svg
	// @include('utils/animatePathSvg.js')

	// Button Icons
	// @include('data/buttonIcons.js')
}

function tPlayer(options) {
	return new tPlayerClass(options);
}