var tPlayersCollection = [];
// @include('data/defaultSettings.js')

class tPlayerClass {
	constructor(options) {
		this.settings = this.deepObjectMerge(defaultPlayerSettings, options);
		this.playlist = JSON.parse(JSON.stringify(this.settings.playlist)); // Clone Palylist to variable
		this.uiElements = [];
		this.playerId = this.getRandomID();
		
		// Player State
		// @include('data/playerState.js')

		this.currentTrack = {
			index: 0,
			title: null,
			artist: null,
			cover: null,
		};
		this.previousTrackIndex = 0;
		// Init
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

	async init() {
		const { showPlaylist, isRadio, pluginDirectoryPath, updateRadioInterval } = this.settings;
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
		if(showPlaylist && this.playerState.isPlaylist) this.togglePlaylist(false);
		// Setup Event Listeners
		this.setupEventListeners();
		// Load And Prepare The Initial Track For Playback
		this.switchTrack();
		// Adjust The Player Size To Fit It's Container Or Screen
		this.playerResize();
		// If In Radio Mode And A Plugin Path Is Specified, Set Up Periodic Info Updates
		if(isRadio && pluginDirectoryPath) {
			setInterval(this.updateRadioInfo.bind(this), updateRadioInterval);
		}
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

function migrationFromOldVersion(oldOptions) {
	return {
		container: oldOptions.container ?? null,
		playlist: oldOptions.playlist ?? null,
		album: {
			artist: oldOptions.artist ?? oldOptions.albumArtist ?? null,
			cover: oldOptions.cover ?? oldOptions.albumCover ?? null,
		},
		skin: oldOptions.skin ?? oldOptions.options?.skin ?? 'default',
		rounded: oldOptions.rounded ?? oldOptions.options?.rounded ?? false,
		showCover: oldOptions.showCover ?? oldOptions.options?.cover ?? true,
		showPlaylist: oldOptions.showPlaylist ? oldOptions.showPlaylist : oldOptions.options?.playlist ? oldOptions.options?.playlist : true,
		showRepeatButton: oldOptions.showRepeatButton ?? oldOptions.options?.repeat ?? true,
		showShuffleButton: oldOptions.showShuffleButton ?? oldOptions.options?.shuffle ?? true,
		showShareButton: oldOptions.showShareButton ?? oldOptions.options?.share ?? true,
		allowPlaylistScroll: oldOptions.allowPlaylistScroll ?? (oldOptions.options?.scrollAfter !== null),
		maxVisibleTracks: oldOptions.maxVisibleTracks ?? oldOptions.options?.scrollAfter ?? oldOptions.options?.scrollAfter > 0 ? oldOptions.options?.scrollAfter : 5,
		volume: oldOptions.volume ?? oldOptions.options?.volume ?? 1,
		isRadio: oldOptions.isRadio ?? oldOptions.options?.radio ?? false,
		pluginDirectoryPath: oldOptions.pluginDirectoryPath ?? oldOptions.options?.pluginPath ?? null,
		autoUpdateRadioCovers: oldOptions.autoUpdateRadioCovers ?? oldOptions.options?.coverUpdate ?? true,
		updateRadioInterval: oldOptions.updateRadioInterval ?? oldOptions.options?.updateRadioInterval ?? 10000,
		style: {
			player: {
				background: oldOptions.style?.player?.background ?? "#FFF",
				cover: {
					background: oldOptions.style?.player?.cover?.background ?? "#3EC3D5",
					loader: oldOptions.style?.player?.cover?.loader ?? "#FFF"
				},
				tracktitle: oldOptions.style?.player?.tracktitle ?? oldOptions.style?.player?.songtitle ?? "#555",
				buttons: {
					wave: oldOptions.style?.player?.buttons?.wave ?? "#3EC3D5",
					normal: oldOptions.style?.player?.buttons?.normal ?? "#555",
					hover: oldOptions.style?.player?.buttons?.hover ?? "#3EC3D5",
					active: oldOptions.style?.player?.buttons?.active ?? "#3EC3D5",
				},
				seekbar: oldOptions.style?.player?.seekbar ?? oldOptions.style?.player?.seek ?? "#555",
				buffered: oldOptions.style?.player?.buffered ?? "rgba(255, 255, 255, 0.15)",
				progress: oldOptions.style?.player?.progress ?? "#3EC3D5",
				timestamps: oldOptions.style?.player?.timestamps ?? "#FFF",
				loader: {
					background: oldOptions.style?.player?.loader?.background ?? "#555",
					color: oldOptions.style?.player?.loader?.color ?? "#3EC3D5"
				},
				volume: {
					levelbar: oldOptions.style?.player?.volume?.levelbar ?? oldOptions.style?.player?.volume?.seek ?? "#555",
					level: oldOptions.style?.player?.volume?.level ?? oldOptions.style?.player?.volume?.value ?? "#3EC3D5"
				}
			},
				playlist: {
				scrollbar: {
					track: oldOptions.style?.playlist?.scrollbar?.track ?? oldOptions.style?.playlist?.scroll?.track ?? "rgba(255, 255, 255, 0.5)",
					thumb: oldOptions.style?.playlist?.scrollbar?.thumb ?? oldOptions.style?.playlist?.scroll?.thumb ?? "rgba(255, 255, 255, 0.75)"
				},
				background: oldOptions.style?.playlist?.background ?? "#3EC3D5",
				color: oldOptions.style?.playlist?.color ?? "#FFF",
				separator: oldOptions.style?.playlist?.separator ?? "rgba(255, 255, 255, 0.25)",
				hover: {
					background: oldOptions.style?.playlist?.hover?.background ?? "#42CFE2",
					color: oldOptions.style?.playlist?.hover?.color ?? "#FFF",
					separator: oldOptions.style?.playlist?.hover?.separator ?? "rgba(255, 255, 255, 0.25)"
				},
				active: {
					background: oldOptions.style?.playlist?.active?.background ?? "#42CFE2",
					color: oldOptions.style?.playlist?.active?.color ?? "#FFF",
					separator: oldOptions.style?.playlist?.active?.separator ?? "rgba(255, 255, 255, 0.25)"
				}
			}
		}
	}
}

function tPlayer(options) {
	const newOptions = migrationFromOldVersion(options);
	return new tPlayerClass(newOptions);
}