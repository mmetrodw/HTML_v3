var tPlayersCollection = [];
// @include('data/defaultSettings.js')

/* UTILS */
const utils = {
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
	// Create Element
	// @include('utils/createElement.js'),
	// Create Element SVG
	// @include('utils/createElementSVG.js'),
	// Format Time
	// @include('utils/secondsToTimecode.js')
};

class tPlayerClass {
	constructor(options) {
		this.settings = utils.deepObjectMerge(defaultPlayerSettings, options);
		this.playlist = JSON.parse(JSON.stringify(this.settings.playlist)); // Clone Palylist to variable
		this.uiElements = [];
		this.playerId = utils.getRandomID();
		
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

	// Create Audio and Add It to Collection
	async createAudio() {
		this.playerState.status = 'Create Audio Object';
		this.audio = new Audio();
		this.audio.preload = "metadata";
		this.audio.volume = 0;
		// Add to List of Players
		tPlayersCollection[this.playerId] = this.audio;
		this.playerState.status = 'Audio Object Was Created';
	}

	// Sets up event listeners for the audio player
	async setupEventListeners() {
		this.playerState.status = 'Setting Up Event Listeners';
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
				return reject(`No handler found for event: ${event}`);
			}
		});

		// Reference to UI elements
		const {
			playbackButton, prevButton, nextButton, volumeButton, repeatButton, shuffleButton, shareButton,
			facebookButton, twitterButton, tumblrButton, togglePlaylistButton, playlistItem, audioSeekBar,
			volumeLevelBar, playlistWrapper, playlist, scrollbarTrack, coverImage
		} = this.uiElements;

		// Add event listeners for control buttons
		playbackButton.addEventListener('click', this.playback.bind(this));





		this.playerState.status = 'Event Listeners Are Set';
	}

	/* AUDIO EVENTS */ 
	// @include('lib/audioEvents.js')



	/* PLAYER METHODS */

	// Simulates a button click effect by adding and then removing a CSS class.
	simulateClickEffect(element) {
		// Add the "tp-click" class to the element
		utils.addClass(element, "tp-click");
		// Remove the "tp-click" class after animation end
		if (!element.onanimationend) {
			element.onanimationend = function() {
				utils.removeClass(element, "tp-click");
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


	/* PLAYER FUNCTION */
	// Sets the pointer events for the audio seek bar based on the seeking state.
	isSeeking(state) {
		this.uiElements.audioSeekBar.style.pointerEvents = state && this.audio.duration !== Infinity ? "all" : "none";
	}

	// Switches to the next track in the playlist.
	// @include('lib/switchTrack.js')

	// Function to animate the text change for the track title and artist
	// @include('lib/animateTextChange.js')

async	init() {
		this.playerState.status = 'Initializing';
		// Validate Player Config
		await this.validatePlayerConfig();
		// Create Player Interface
		await this.createPlayerInterface();
		// Apply Player Styles
		await this.applyPlayerStyles(this.settings.style, this.uiElements.wrapper);
		// Create Audio and Add It to Collection
		await this.createAudio();

		// this.applyUserDefinedSettings();

		// Setup Event Listeners
		// this.setupEventListeners();
		// Load And Prepare The Initial Track For Playback
		// this.switchTrack();
		console.log(this);
	}

	// Button Icons
	// @include('data/buttonIcons.js')
}

function tPlayer(options) {
	return new tPlayerClass(options);
}