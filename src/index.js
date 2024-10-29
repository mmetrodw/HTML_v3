var tPlayersCollection = [];
// @include('data/defaultSettings.js')

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
	// @include('lib/setupEventListeners.js')

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

	// Button Icons
	// @include('data/buttonIcons.js')
}

function tPlayer(options) {
	return new tPlayerClass(options);
}