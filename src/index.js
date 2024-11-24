var tPlayersCollection = [];
// @include('data/defaultSettings.js')

// @include('data/themes.js')

class tPlayerClass {
	constructor(options) {
		this.settings = this.deepObjectMerge(defaultPlayerSettings, options);
		this.playlist = JSON.parse(JSON.stringify(this.settings.playlist)); // Clone Palylist to variable
		this.uiElements = [];
		this.playerId = this.getRandomID();
		
		// Player State
		// @include('data/playerState.js')

		this.currentSong = {
			index: 0,
			title: null,
			artist: null,
			cover: null,
		};
		this.previousSongIndex = 0;
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
		if(showPlaylist && this.playerState.isPlaylist) this.handleTogglePlaylist(false);
		// Setup Event Listeners
		this.setupEventListeners();
		// Load And Prepare The Initial Song For Playback
		this.switchSong();
		// Adjust The Player Size To Fit It's Container Or Screen
		this.updatePlayerLayout();
		// If In Radio Mode And A Plugin Path Is Specified, Set Up Periodic Info Updates
		if(isRadio && pluginDirectoryPath) {
			setInterval(this.updateRadioInfo.bind(this), updateRadioInterval);
		}
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
		container: oldOptions.container ?? defaultPlayerSettings.container,
		playlist: oldOptions.playlist ?? defaultPlayerSettings.playlist,
		album: {
			artist: oldOptions.album?.artist ?? oldOptions.albumArtist ?? defaultPlayerSettings.album.artist,
			cover: oldOptions.album?.cover ?? oldOptions.albumCover ?? defaultPlayerSettings.album.cover,
		},
		skin: oldOptions.skin ?? oldOptions.options?.skin ?? defaultPlayerSettings.skin,
		theme: oldOptions.theme ?? oldOptions.options?.theme ?? defaultPlayerSettings.theme,
		rounded: oldOptions.rounded ?? oldOptions.options?.rounded ?? defaultPlayerSettings.rounded,
		showCover: oldOptions.showCover ?? oldOptions.options?.cover ?? defaultPlayerSettings.showCover,
		showPlaylist: oldOptions.showPlaylist ?? oldOptions.options?.playlist ?? defaultPlayerSettings.showPlaylist,
		showRepeatButton: oldOptions.showRepeatButton ?? oldOptions.options?.repeat ?? defaultPlayerSettings.showRepeatButton,
		showShuffleButton: oldOptions.showShuffleButton ?? oldOptions.options?.shuffle ?? defaultPlayerSettings.showShuffleButton,
		showShareButton: oldOptions.showShareButton ?? oldOptions.options?.share ?? defaultPlayerSettings.showShareButton,
		allowPlaylistScroll: oldOptions.allowPlaylistScroll ?? (oldOptions.options?.scrollAfter ?? 0) !== 0,
		maxVisibleSongs: oldOptions.maxVisibleSongs ? oldOptions.maxVisibleSongs : oldOptions.options?.scrollAfter > 0 ? oldOptions.options.scrollAfter : defaultPlayerSettings.maxVisibleSongs,
		volume: oldOptions.volume ?? oldOptions.options?.volume ?? defaultPlayerSettings.volume,
		isRadio: oldOptions.isRadio ?? oldOptions.options?.radio ?? defaultPlayerSettings.isRadio,
		pluginDirectoryPath: oldOptions.pluginDirectoryPath ?? oldOptions.options?.pluginPath ?? defaultPlayerSettings.pluginDirectoryPath,
		autoUpdateRadioCovers: oldOptions.autoUpdateRadioCovers ?? oldOptions.options?.coverUpdate ?? defaultPlayerSettings.autoUpdateRadioCovers,
		updateRadioInterval: oldOptions.updateRadioInterval ?? oldOptions.options?.updateRadioInterval ?? defaultPlayerSettings.updateRadioInterval,
		style: {
			player: {
				background: oldOptions.style?.player?.background ?? defaultPlayerSettings.style.player.background,
				cover: {
					background: oldOptions.style?.player?.cover?.background ?? defaultPlayerSettings.style.player.cover.background,
					loader: oldOptions.style?.player?.cover?.loader ?? defaultPlayerSettings.style.player.cover.loader,
				},
				songtitle: oldOptions.style?.player?.songtitle ?? oldOptions.style?.player?.songtitle ?? defaultPlayerSettings.style.player.songtitle,
				buttons: {
					wave: oldOptions.style?.player?.buttons?.wave ?? defaultPlayerSettings.style.player.buttons.wave,
					normal: oldOptions.style?.player?.buttons?.normal ?? defaultPlayerSettings.style.player.buttons.normal,
					hover: oldOptions.style?.player?.buttons?.hover ?? defaultPlayerSettings.style.player.buttons.hover,
					active: oldOptions.style?.player?.buttons?.active ?? defaultPlayerSettings.style.player.buttons.active,
				},
				seekbar: oldOptions.style?.player?.seekbar ?? oldOptions.style?.player?.seek ?? defaultPlayerSettings.style.player.seekbar,
				buffered: oldOptions.style?.player?.buffered ?? defaultPlayerSettings.style.player.buffered,
				progress: oldOptions.style?.player?.progress ?? defaultPlayerSettings.style.player.progress,
				timestamps: oldOptions.style?.player?.timestamps ?? defaultPlayerSettings.style.player.timestamps,
				loader: {
					background: oldOptions.style?.player?.loader?.background ?? defaultPlayerSettings.style.player.loader.background,
					color: oldOptions.style?.player?.loader?.color ?? defaultPlayerSettings.style.player.loader.color,
				},
				volume: {
					levelbar: oldOptions.style?.player?.volume?.levelbar ?? oldOptions.style?.player?.volume?.seek ?? defaultPlayerSettings.style.player.volume.levelbar,
					level: oldOptions.style?.player?.volume?.level ?? oldOptions.style?.player?.volume?.value ?? defaultPlayerSettings.style.player.volume.level,
				}
			},
			playlist: {
				scrollbar: {
					track: oldOptions.style?.playlist?.scrollbar?.track ?? oldOptions.style?.playlist?.scroll?.track ?? defaultPlayerSettings.style.playlist.scrollbar.track,
					thumb: oldOptions.style?.playlist?.scrollbar?.thumb ?? oldOptions.style?.playlist?.scroll?.thumb ?? defaultPlayerSettings.style.playlist.scrollbar.thumb,
				},
				background: oldOptions.style?.playlist?.background ?? defaultPlayerSettings.style.playlist.background,
				color: oldOptions.style?.playlist?.color ?? defaultPlayerSettings.style.playlist.color,
				separator: oldOptions.style?.playlist?.separator ?? defaultPlayerSettings.style.playlist.separator,
				hover: {
					background: oldOptions.style?.playlist?.hover?.background ?? defaultPlayerSettings.style.playlist.hover.background,
					color: oldOptions.style?.playlist?.hover?.color ?? defaultPlayerSettings.style.playlist.hover.color,
					separator: oldOptions.style?.playlist?.hover?.separator ?? defaultPlayerSettings.style.playlist.hover.separator
				},
				active: {
					background: oldOptions.style?.playlist?.active?.background ?? defaultPlayerSettings.style.playlist.active.background,
					color: oldOptions.style?.playlist?.active?.color ?? defaultPlayerSettings.style.playlist.active.color,
					separator: oldOptions.style?.playlist?.active?.separator ?? defaultPlayerSettings.style.playlist.active.separator,
				}
			}
		}
	}
}

function tPlayer(options) {
	const newOptions = migrationFromOldVersion(options);
	return new tPlayerClass(newOptions);
}