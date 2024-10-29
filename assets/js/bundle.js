var tPlayersCollection = [];
const defaultPlayerSettings = {
	container: null,
	playlist: null,
	album: {
		artist: null,
		cover: null
	},
	skin: "default",
	rounded: false,
	showCover: true,
	showPlaylist: true,
	showRepeatButton: true,
	showShuffleButton: true,
	showShareButton: true,
	allowPlaylistScroll: true,
	maxVisibleTracks: 5,
	volume: 1,
	isRadio: false,
	pluginDirectoryPath: null,
	autoUpdateRadioCovers: true,
	updateRadioInterval: 10000,
	style: {
		player: {
			background: "#FFF",
			cover: {
				background: "#3EC3D5",
				loader: "#FFF"
			},
			tracktitle: "#555",
			buttons: {
				wave: "#3EC3D5",
				normal: "#555",
				hover: "#3EC3D5",
				active: "#3EC3D5",
			},
			seekbar: "#555",
			buffered: "rgba(255, 255, 255, 0.15)",
			progress: "#3EC3D5",
			timestamps: "#FFF",
			loader: {
				background: "#555",
				color: "#3EC3D5"
			},
			volume: {
				levelbar: "#555",
				level: "#3EC3D5"
			}
		},
		playlist: {
			scrollbar: {
				track: "rgba(255, 255, 255, 0.5)",
				thumb: "rgba(255, 255, 255, 0.75)"
			},
			background: "#3EC3D5",
			color: "#FFF",
			separator: "rgba(255, 255, 255, 0.25)",
			hover: {
				background: "#42CFE2",
				color: "#FFF",
				separator: "rgba(255, 255, 255, 0.25)",
			},
			active: {
				background: "#42CFE2",
				color: "#FFF",
				separator: "rgba(255, 255, 255, 0.25)",
			}
		}
	}
};

class tPlayerClass {
	constructor(options) {
		this.settings = this.deepObjectMerge(defaultPlayerSettings, options);
		this.playlist = JSON.parse(JSON.stringify(this.settings.playlist)); // Clone Palylist to variable
		this.uiElements = [];
		this.playerId = this.getRandomID();
		
		// PLAYER STATE
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
			get isMobile() { return this._isMobile; },
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
					this.handleAllowSeekingChange(value);
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
					this._isLoading = value;
					this.handleIsLoadingChange(value);
				}
			},
			set isMobile(value) { this._isMobile = value; },
			set isPlaylist(value) { this._isPlaylist = value; },
			set isPlaylistDisplayed(value) { this._isPlaylistDisplayed = value; },
			set isRadioInfoUpdatePending(value) { this._isRadioInfoUpdatePending = value; },
			set isShareDisplayed(value) { this._isShareDisplayed = value; },
			set isUserAdjustingVolume(value) { this._isUserAdjustingVolume = value; },
			set isUserSeekingAudio(value) { this._isUserSeekingAudio = value; },
			set isVolumeMuted(value) { this._isVolumeMuted = value; },
		
			handleAllowSeekingChange: (state) => {
				this.uiElements.audioSeekBar.style.pointerEvents = state && this.audio.duration !== Infinity ? "all" : "none";
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
	async validatePlayerConfig() {
		this.playerState.log = "Validating Player Configuration";
		const startTime = new Date().getTime();
	
		const playerContainerElement = document.getElementById(this.settings.container);
	
		// Check if the 'id' property is missing or invalid
		if (!this.settings.container) {
			throw Error("tPlayer Error: Please enter a valid container name.");
		}
	
		// Check if the 'wrapper' element associated with the given 'id' is missing
		if (!playerContainerElement) {
			throw Error(`tPlayer Error: Element with id "${this.settings.container}" not found.`);
		}
	
		this.uiElements.wrapper = playerContainerElement;
	
		// Check if the 'playlist' property is missing or not provided
		if (!Array.isArray(this.playlist) || this.playlist.length === 0) {
			throw Error("tPlayer Error: Please, add a valid Playlist to tPlayer.");
		}
	
		// Check for audio link for each playlist item and update properties
		for( const item of this.playlist) {
			if(item.audio === undefined || item.audio === "") {
				throw Error("tPlayer Error: Not all tracks in the playlist have the audio property.");
			}
	
			// Update artist if Album Artist is set
			if (this.settings.album.artist) {
				item.artist = this.settings.album.artist;
			}
			// Update cover if Album Cover is set and cover usage is enabled
			if (this.settings.album.cover && this.settings.album.cover !== "" && this.settings.showCover) {
				item.cover = this.settings.album.cover;
			}
		}
	
		this.playerState.isPlaylist = this.playlist.length > 1 ? true : false;
	
		const endTime = new Date().getTime();
		const duration = (endTime - startTime);
		this.playerState.log = `The Configuration Has Been Validated ${duration} ms.`;
	}

	// Create Player Interface
	// Asynchronous method to initialize the player interface and structure its components
	async createPlayerInterface() {
		this.playerState.log = "Create Player Interface";
		const startTime = new Date().getTime();
	
		const { wrapper } = this.uiElements;
		const { rounded, skin, showCover, showRepeatButton, showShuffleButton, showShareButton} = this.settings;
		const { addClass } = this;
		const { isMobile, isPlaylist } = this.playerState;
	
		// Apply classes to wrapper element based on player settings
		addClass(wrapper, ["tp-wrapper", "tp-loading", rounded ? "tp-rounded" : "", skin === "vertical" || isMobile ? "tp-vertical" : "", isMobile ? "tp-mobile" : ""]); ;
	
		// Determine button icon style based on "rounded" setting
		this.buttonIcons = rounded ? this.buttonIcons.rounded : this.buttonIcons.default;
	
		// Fragment
		const fragment = document.createDocumentFragment();
		// Player container
		const playerContainer = this.createElement("div", "tp-player-container", fragment);
	
		// Add cover section if cover display is enabled in settings
		if(showCover) {
			const playerAside = this.createElement("div", "tp-aside-player", playerContainer);
			const coverLoadingSpinner = this.createElement("div", "tp-cover-loading-spinner", playerAside);
			coverLoadingSpinner.innerHTML = "<span></span><span></span><span></span>";
			this.uiElements.coverContainer = this.createElement("div", "tp-cover", playerAside);
			this.uiElements.coverImage = this.createElement("img", "tp-cover-image", this.uiElements.coverContainer);
		}
	
		// Main controls container
		const controlsContainer = this.createElement("div", "tp-controls-container", playerContainer);
		// Header
		const controlsHeader = this.createElement("div", "tp-controls-header", controlsContainer);
		this.uiElements.trackTitle = this.createElement("div", "tp-track-title", controlsHeader);
		// Body
		const controlsBody = this.createElement("div", "tp-controls-body", controlsContainer);
		this.uiElements.playbackButton = this.createButtonWithIcon("playback", "play", controlsBody);
		this.uiElements.audioSeekBar = this.createElement("div", "tp-audio-seek-bar", controlsBody);
		this.uiElements.audioBufferedProgress = this.createElement("div", "tp-audio-buffered-progress", this.uiElements.audioSeekBar);
		this.uiElements.audioPlaybackProgress = this.createElement("div", "tp-audio-playback-progress", this.uiElements.audioSeekBar);
		this.uiElements.audioCurrentTime = this.createElement("div", "tp-audio-current-time", this.uiElements.audioSeekBar);
		this.uiElements.audioCurrentTime.textContent = '00:00';
		this.uiElements.audioDuration = this.createElement("div", "tp-audio-duration", this.uiElements.audioSeekBar);
		this.uiElements.audioDuration.textContent = '00:00';
		const playerLoader = this.createElement("div", "tp-player-loader", this.uiElements.audioSeekBar);
		playerLoader.innerHTML = "<span></span><span></span><span></span>";
	
		// Previous (only shown for playlists)
		if(isPlaylist) this.uiElements.prevButton = this.createButtonWithIcon("prev", "prev", controlsBody);
		// Repeat button, if enabled in settings
		if(showRepeatButton) this.uiElements.repeatButton = this.createButtonWithIcon("repeat", "repeat", controlsBody);
		// Next (only shown for playlists)
		if(isPlaylist) this.uiElements.nextButton = this.createButtonWithIcon("next", "next", controlsBody);
		// Shuffle button, if enabled in settings and it's playlist
		if(isPlaylist && showShuffleButton) this.uiElements.shuffleButton = this.createButtonWithIcon("shuffle", "shuffle", controlsBody);
		// Share Button, if enabled in settings
		if(showShareButton) this.uiElements.shareButton = this.createButtonWithIcon("share", "share", controlsBody);
	
		// Footer
		const controlsFooter = this.createElement("div", "tp-controls-footer", controlsContainer);
		// Playlist toggle button for playlists or buy/download buttons for individual tracks
		if(isPlaylist) {
			this.uiElements.togglePlaylistButton = this.createButtonWithIcon("toggle-playlis", "playlist", controlsFooter);
		} else {
			// Buy Button
			if(this.playlist[0].buy) {
				const buyButton = this.createCustomLink('buy', this.playlist[0].buy, controlsFooter);
				controlsFooter.appendChild(buyButton);
			}
			// Download Button
			if(this.playlist[0].download) {
				const downloadButton = this.createCustomLink('download', this.playlist[0].download, controlsFooter);
				controlsFooter.appendChild(downloadButton);
			}
		}
	
		// Volume Control for non-mobile devices
		if(!isMobile) {
			const volumeControl = this.createElement("div", "tp-volume-control", controlsFooter);
			this.uiElements.volumeButton = this.createButtonWithIcon("volume", "volume", volumeControl);
			this.uiElements.volumeLevelBar = this.createElement("div", "tp-volume-level-bar", volumeControl);
			this.uiElements.volumeLevel = this.createElement("div", "tp-volume-level", this.uiElements.volumeLevelBar);
		}
	
		// Social media share buttons, if enabled in settings
		if(showShareButton) {
			const socialMediaContainer = this.createElement("div", "tp-social-media-container", playerContainer);
			this.uiElements.facebookButton = this.createButtonWithIcon("facebook", "facebook", socialMediaContainer);
			this.uiElements.twitterButton = this.createButtonWithIcon("twitter", "twitter", socialMediaContainer);
			this.uiElements.tumblrButton = this.createButtonWithIcon("tumblr", "tumblr", socialMediaContainer);
		}
	
		// Playlist
		if(isPlaylist) {
			this.uiElements.playlistContainer = this.createElement("div", "tp-playlist-container", fragment);
			this.uiElements.playlist = this.createElement("ul", "tp-playlist", this.uiElements.playlistContainer);
			// Generate playlist items for each track
			this.playlist.map(track => {
				// Determine the track name to display, including artist and title if available
				const trackName = track.title ? `<b>${track.artist}</b> - ${track.title}` : `<b>${track.artist}</b>`;
				// Determine the full track title for the tooltip, including artist and title if available
				const trackTitle = track.title ? `${track.artist} - ${track.title}` : track.artist;
	
				const playlistItem = this.createElement("li", "tp-playlist-item", this.uiElements.playlist);
				playlistItem.title = trackTitle;
				const playlistItemIndicator = this.createElement("div", "tp-playlist-item-indicator", playlistItem);
				playlistItemIndicator.innerHTML = "<span></span><span></span><span></span>";
				const playlistItemTrackTitle = this.createElement("div", "tp-playlist-item-track-title", playlistItem);
				playlistItemTrackTitle.innerHTML = trackName;
	
				if(track.buy) {
					const buyButton = this.createCustomLink('buy', track.buy) ;
					playlistItem.appendChild(buyButton);
				}
	
				if(track.download) {
					const downloadButton = this.createCustomLink('download', track.download) ;
					playlistItem.appendChild(downloadButton);
				}
	
				this.uiElements.playlist.appendChild(playlistItem);
			});
	
			// Update reference to playlist items
			this.uiElements.playlistItem = this.uiElements.playlist.childNodes;
	
			// Enable playlist scroll if settings allow and track count exceeds visible max
			if(this.settings.allowPlaylistScroll && this.playlist.length > this.settings.maxVisibleTracks) {
				if(!isMobile) {
					addClass(wrapper, "tp-scrollable");
					this.uiElements.scrollbarTrack = this.createElement("div", "tp-scrollbar-track", this.uiElements.playlistContainer);
					this.uiElements.scrollbarThumb = this.createElement("div", "tp-scrollbar-thumb", this.uiElements.scrollbarTrack);
				}
				// Set Playlist Height - Limits visible playlist height to max visible tracks, calculated by track height
				this.uiElements.playlist.style.height = `${40 * this.settings.maxVisibleTracks}px`
			}
		}
	
		// Error display container for any error messages
		const errorContainer = this.createElement("div", "tp-error-container", fragment);
		this.uiElements.errorMessage = this.createElement("div", "tp-error-container", errorContainer);
		this.uiElements.errorCloseButton = this.createButtonWithIcon("close", "close", errorContainer)
	
		// Append all player components to the main wrapper
		wrapper.appendChild(fragment);
	
		const endTime = new Date().getTime();
		const duration = (endTime - startTime);
		this.playerState.log = `The Player Interface is Created in ${duration} ms`;
	}
	
	// Helper method to create a new HTML element with classes and optional parent
	createElement(tagName, classes, parent) {
		const { addClass } = this;
		const element = document.createElement(tagName);
	
		if (classes && classes.length > 0) {
			addClass(element, classes);
		}
		if (parent) parent.appendChild(element);
		return element;
	}
	
	// Method to create a button with an SVG icon
	createButtonWithIcon(type, iconType, parent) {
		const button = this.createElement("button", ["tp-button", `tp-${type}-button`]);
		const icon = this.createSvgIcon(this.buttonIcons[iconType]);
		button.appendChild(icon);
		if (parent) parent.appendChild(button);
		return button;
	}
	
	// Creates an SVG icon element based on provided path data
	createSvgIcon(path) {
		const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
		const svgElement = document.createElementNS(SVG_NAMESPACE, "svg");
		svgElement.setAttribute("viewBox", "0 0 20 20");
	
		const pathElement = document.createElementNS(SVG_NAMESPACE, "path");
		pathElement.setAttribute("d", path);
		svgElement.appendChild(pathElement);
	
		return svgElement;
	}
	
	// Method to create a custom link button (buy/download) with an SVG icon
	createCustomLink(type, href) {
		const { addClass } = this;
		const link = document.createElement("a");
		addClass(link, ["tp-button", `tp-playlist-track-${type}`]);
		link.href = href;
		link.title = type === "buy" ? "Buy Now" : "Download Now";
		link.target = "_blank";
		if (type === "download") link.download = "";
	
		// Create SVG icon based on button type
		const icon = this.createSvgIcon(this.buttonIcons[type]);
		link.appendChild(icon);
		return link;
	}

	// Function to apply styles from the JSON object as CSS variables
	async applyPlayerStyles() {
		this.playerState.log = 'Aplly Custom Styles';
		const startTime = new Date().getTime();
	
		// Call the applyPlayerStyles function with the styles and playerElement
		this.addPlayerStyle(this.settings.style, this.uiElements.wrapper);
	
		const endTime = new Date().getTime();
		const duration = (endTime - startTime);
		this.playerState.log = `Custom Styles Applied in ${duration} ms`;
	}
	
	addPlayerStyle(styles, element, prefix = '') {
		// Iterate over the keys of the styles object
		Object.keys(styles).forEach((key) => {
			const value = styles[key];
	
			// If the value is an object, recursively process it
			if (typeof value === 'object' && value !== null) {
				// Call the function recursively with updated prefix
				this.addPlayerStyle(value, element, prefix ? `${prefix}-${key}` : key);
			} else {
				// Generate the CSS variable name using the key
				// Replace camelCase with kebab-case (e.g., 'trackTitle' becomes 'track-title')
				const cssVariableName = `--${prefix}${prefix ? '-' : ''}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
	
				// Set the CSS variable on the provided element
				element.style.setProperty(cssVariableName, value);
			}
		});
	}

	// Sets up event listeners for the audio player
	async setupEventListeners() {
		this.playerState.log = 'Setting Up Event Listeners';
		const { isPlaylist, isMobile } = this.playerState;
		const { showRepeatButton, showShuffleButton, showShareButton, showCover, allowPlaylistScroll, maxVisibleTracks } = this.settings;
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
	
			if(allowPlaylistScroll && this.playlist.length > maxVisibleTracks && !isMobile) {
				// Add event listeners for scrollbar interactions
				playlistContainer.addEventListener('mouseenter', this.showScrollbar.bind(this)); // Show scrollbar on mouse enter
				playlistContainer.addEventListener('mouseleave', this.hideScrollbar.bind(this)); // Hide scrollbar on mouse leave
				playlist.addEventListener('scroll', this.updateScrollbarThumb.bind(this)); // Update scrollbar thumb position on scroll
				// Update The Position And Size Of The Scrollbar
				this.updateScrollbarThumb();
				scrollbarTrack.addEventListener('wheel', event => { // Handle mouse wheel scrolling
					event.preventDefault();
					playlist.scrollTop += event.deltaY;
				}, { passive: false });
				scrollbarTrack.addEventListener('mousedown', this.scrollbarTrackSeekingStart.bind(this)); // Handle mouse down for scrollbar dragging
			}
		}
	
		if(showRepeatButton) repeatButton.addEventListener('click', this.repeatToggle.bind(this));
	
		if(showShareButton) {
			shareButton.addEventListener('click', this.shareToggle.bind(this));
			facebookButton.addEventListener('click', this.shareFacebook.bind(this));
			twitterButton.addEventListener('click', this.shareTwitter.bind(this));
			tumblrButton.addEventListener('click', this.shareTumblr.bind(this));
		}
	
		// Add event listeners for seeking audio and Volume
		const eventsSeekbar = isMobile ?
			{
				startEvent: 'touchstart',
				moveEvent: 'touchmove',
				endEvent: 'touchend',
				options: { passive: true }
			}
			:
			{
				startEvent: 'mousedown',
				moveEvent: 'mousemove',
				endEvent: 'mouseup',
				options: false
			};
	
			audioSeekBar.addEventListener(eventsSeekbar.startEvent, this.startAudioSeeking.bind(this), eventsSeekbar.options);
			document.addEventListener(eventsSeekbar.moveEvent, this.updateAudioSeekPosition.bind(this), eventsSeekbar.options);
			document.addEventListener(eventsSeekbar.endEvent, this.finalizeAudioSeeking.bind(this), eventsSeekbar.options);
	
		if (!isMobile) {
			volumeButton.addEventListener('click', this.volumeToggle.bind(this));
			volumeLevelBar.addEventListener('mousedown', this.startVolumeAdjustment.bind(this), false);
			document.addEventListener('mousemove', this.updateVolumeAdjustment.bind(this), false);
			document.addEventListener('mouseup', this.finalizeVolumeAdjustment.bind(this), false);
		}
	
		if(showCover) coverImage.addEventListener('load', this.coverLoaded.bind(this));
	
		// Add event listener for window resize
		window.addEventListener("resize", this.playerResize.bind(this));
	
		// Error Close
		errorCloseButton.addEventListener('click', () => {
			removeClass(wrapper, "tp-error");
		});
	
		this.playerState.log = 'Event Listeners Are Set';
	}

	/* AUDIO EVENTS */ 
	abort() {
		// Forbid Seeking
		this.playerState.allowSeeking = false;
		// Disable radio info updates
		this.playerState.allowRadioInfoUpdate = false;
		// Set Audio Event
		this.playerState.audioEvent = 'abort';
	}
	
	canplay() {
		// Set loading status to false
		this.playerState.isLoading = false;
		// Allow Seeking
		this.playerState.allowSeeking = true;
		this.playerState.audioEvent = 'canplay';
	}
	
	canplaythrough() {
		// Set loading status to false
		this.playerState.isLoading = false;
		// Allow Seeking
		this.playerState.allowSeeking = true;
		// Start playback if autoplay is enabled
		if (this.playerState.autoplay) this.audio.play();
		// Set Audio Event
		this.playerState.audioEvent = 'canplaythrough';
	}
	
	durationchange() {
		const { audioDuration } = this.uiElements;
		const { secondsToTimecode } = this;
		// Update the duration display in the UI
		audioDuration.textContent = secondsToTimecode(this.audio.duration);
		// Show or hide the duration element based on whether the duration is not Infinity
		audioDuration.style.display = this.audio.duration !== Infinity ? "block" : "none";
		// Allow Seeking
		this.playerState.allowSeeking = true;
		// Set Audio Event
		this.playerState.audioEvent = 'durationchange';
	}
	
	emptied() {
		// Forbid Seeking
		this.playerState.allowSeeking = false;
		// Disable radio info updates
		this.playerState.allowRadioInfoUpdate = false;
		// Set Audio Event
		this.playerState.audioEvent = 'emptied';
	}
	
	// Ended
	ended() {
		// Play Next
		this.nextTrack();
		// Set Audio Event
		this.playerState.audioEvent = 'ended';
	}
	
	error() {
		const { addClass } = this;
		// Forbid Seeking
		this.playerState.allowSeeking = false;
		// Set loading status to false
		this.playerState.isLoading = false;
	
		// Define error messages for different error codes
		const errorCodes = {
			1: 'The user canceled the audio.',
			2: 'A network error occurred while fetching the audio.',
			3: 'An error occurred while decoding the audio.',
			4: 'The audio is missing or is in a format not supported by your browser.',
			default: 'An unknown error occurred.'
		};
	
		// Get the error message based on the error code
		const errorCode = errorCodes[this.audio.error.code] || errorCodes['default'];
		// Add the 'error' class to the player UI
		addClass(this.uiElements.wrapper, 'tp-error');
		// Show the error message
		this.uiElements.errorMessage.textContent = "tPlayer Error: " + errorCode;
		// Pause the audio
		this.pause();
		// Disable radio info updates
		this.playerState.allowRadioInfoUpdate = false;
		// Disable autoplay
		this.playerState.autoplay = false;
		// Set Audio Event
		this.playerState.audioEvent = 'error';
		return false;
	}
	
	loadstart() {
		// Set loading status to true
		this.playerState.isLoading = true;
		// Set Audio Event
		this.playerState.audioEvent = 'loadstart';
	}
	
	loadeddata() {
		// Allow Seeking
		this.playerState.allowSeeking = true;
		// Set loading status to false
		this.playerState.isLoading = false;
		// Set Audio Event
		this.playerState.audioEvent = 'loadeddata';
	}
	
	loadedmetadata() {
		const { secondsToTimecode } = this;
		const { audioDuration } = this.uiElements;
		// Update the duration display in the UI
		audioDuration.textContent = secondsToTimecode(this.audio.duration);
		// Show or hide the duration element based on whether the duration is not Infinity
		audioDuration.style.display = this.audio.duration !== Infinity ? "block" : "none";
		// Allow Seeking
		this.playerState.allowSeeking = true;
		// Set loading status to false
		this.playerState.isLoading = false;
		// Set Audio Event
		this.playerState.audioEvent = 'loadedmetadata';
	}
	
	pause() {
		const { playlistItem, playbackButton } = this.uiElements;
		const { removeClass } = this;
		// Remove the 'playing' class from playlist items
		removeClass(playlistItem, 'tp-playing');
		// Remove the 'active' class from the playback button
		removeClass(playbackButton, 'tp-active');
		// Update the playback button icon to 'play'
		playbackButton.querySelector('path').setAttribute('d', this.buttonIcons.play);
		// Disable radio info updates
		this.playerState.allowRadioInfoUpdate = false;
		// Set Audio Event
		this.playerState.audioEvent = 'pause';
	}
	
	play() {
		const { playlistItem, playbackButton } = this.uiElements;
		const { addClass } = this;
		// Pause all other players in the collection
		for (let player in tPlayersCollection) {
			if (player !== this.playerId) {
				tPlayersCollection[player].pause();
			}
		}
		// Add the 'playing' class to the current playlist item, if it's Playlist
		if(this.playerState.isPlaylist) addClass(playlistItem[this.currentTrack.index], 'tp-playing');
		// Add the 'active' class to the playback button
		addClass(playbackButton, 'tp-active');
		// Update the playback button icon to 'pause'
		playbackButton.querySelector('path').setAttribute('d', this.buttonIcons.pause);
		// Allow Seeking
		this.playerState.allowSeeking = true;
		// Enable radio info updates
		this.playerState.allowRadioInfoUpdate = true;
		// Set Audio Event
		this.playerState.audioEvent = 'play';
	}
	
	playing() {
		// Set loading status to false
		this.playerState.isLoading = false;
		// Allow Seeking
		this.playerState.allowSeeking = true;
		// Enable radio info updates
		this.playerState.allowRadioInfoUpdate = true;
		// Set Audio Event
		this.playerState.audioEvent = 'playing';
	}
	
	progress() {
		// Check if there are buffered data
		if (this.audio.buffered.length) {
			const duration = this.audio.duration;
			const buffered = this.audio.buffered.end(this.audio.buffered.length - 1);
			const progress = buffered / duration;
			// Update the width of the buffered progress bar
			this.uiElements.audioBufferedProgress.style.width = `${progress * 100}%`;
			// Set the opacity of the buffered progress bar
			this.uiElements.audioBufferedProgress.style.opacity = progress === 1 ? 0 : 1;
		}
		// Set Audio Event
		this.playerState.audioEvent = 'progress';
	}
	
	ratechange() {
		// Set Audio Event
		this.playerState.audioEvent = 'ratechange';
	}
	
	seeked() {
		// Set loading status to false
		this.playerState.isLoading = false;
		// Allow Seeking
		this.playerState.allowSeeking = true;
		// Enable radio info updates
		this.playerState.allowRadioInfoUpdate = true;
		// Set Audio Event
		this.playerState.audioEvent = 'seeked';
	}
	
	seeking() {
		// Set loading status to true
		this.playerState.isLoading = true;
		// Forbid Seeking
		this.playerState.allowSeeking = false;
		// Disable radio info updates
		this.playerState.allowRadioInfoUpdate = false;
		// Set Audio Event
		this.playerState.audioEvent = 'seeking';
	}
	
	stalled() {
		// Forbid Seeking
		this.playerState.allowSeeking = false;
		// Set loading status to true
		this.playerState.isLoading = true;
		// Disable radio info updates
		this.playerState.allowRadioInfoUpdate = false;
		// Log the stalled event
		console.log('Playback stalled at', this.audio.currentTime);
		// Set Audio Event
		this.playerState.audioEvent = 'stalled';
	}
	
	suspend() {
		// Disable radio info updates
		this.playerState.allowRadioInfoUpdate = false;
		// Set Audio Event
		this.playerState.audioEvent = 'suspend';
	}
	
	timeupdate() {
		const { secondsToTimecode } = this;
		if (!this.playerState.isUserSeekingAudio) {
			// Set the current time of the track to match the audio's current time
			this.currentTrack.currentTime = this.audio.currentTime;
			// Calculate the percentage of the track that has been played
			const percent = (this.currentTrack.currentTime / this.audio.duration) * 100;
			// Update the width of the playback progress bar
			this.uiElements.audioPlaybackProgress.style.width = percent + '%';
			// Update the displayed current time in the player
			this.uiElements.audioCurrentTime.textContent = secondsToTimecode(this.audio.currentTime);
			// Call the progress function to update the buffered progress bar
			this.progress();
		}
		// Set Audio Event
		this.playerState.audioEvent = 'timeupdate';
	}
	
	volumechange() {
		const { addClass, removeClass } = this;
		const { volumeLevel, volumeButton } = this.uiElements;
		const { isMobile } = this.playerState;
		this.settings.volume = this.audio.volume !== 0 ? this.audio.volume : this.settings.volume;
	
		if(!isMobile) {
			volumeLevel.style.width = `${this.audio.volume * 100}%`;
	
			// Update the mute state and button appearance
			if(this.audio.volume === 0) {
				this.playerState.isVolumeMuted = true;
				addClass(volumeButton, 'tp-active');
				volumeButton.children[0].children[0].setAttribute('d', this.buttonIcons.muted);
			} else {
				this.playerState.isVolumeMuted = false;
				removeClass(volumeButton, 'tp-active');
				volumeButton.children[0].children[0].setAttribute('d', this.buttonIcons.volume);
			}
		}
	
		// Set Audio Event
		this.playerState.audioEvent = 'volumechange';
	}
	
	waiting() {
		// Set loading status to true
		this.playerState.isLoading = true;
		// Forbid Seeking
		this.playerState.allowSeeking = false;
		// Disable radio info updates
		this.playerState.allowRadioInfoUpdate = false;
		// Set Audio Event
		this.playerState.audioEvent = 'waiting';
	}

	/* PLAYER FUNCTION */
	// Simulates a button click effect by adding and then removing a CSS class.
	simulateClickEffect(element) {
		// Add the "tp-click" class to the element
		this.addClass(element, "tp-click");
		// Remove the "tp-click" class after animation end
		if (!element.onanimationend) {
			element.onanimationend = () => {
				this.removeClass(element, "tp-click");
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
				this.orderList = this.getShuffledPlaylistOrder();
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
				this.orderList = this.getShuffledPlaylistOrder();
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
		this.toggleClass(repeatButton, "tp-active");
		// Simulate the click effect on the repeat button
		this.simulateClickEffect(repeatButton);
	}
	
	// Toggles the shuffle state of the player.
	shuffleToggle() {
		const { shuffleButton } = this.uiElements;
		const { toggleClass } = this;
	
		// Toggle the shuffle state
		this.playerState.shuffle = !this.playerState.shuffle;
	
		// Toggle the "tp-active" class on the shuffle button
		toggleClass(shuffleButton, "tp-active");
	
		// Simulate the click effect on the shuffle button
		this.simulateClickEffect(shuffleButton);
	
		// Regenerate the shuffled playlist order if shuffle is enabled, otherwise set to null
		this.orderList = (this.playerState.shuffle) ? this.getShuffledPlaylistOrder() : null;
	}
	
	// Toggles the share state of the player.
	shareToggle() {
		const { shareButton, wrapper } = this.uiElements;
	
		// Toggle the shera display state
		this.playerState.isShareDisplayed = !this.playerState.isShareDisplayed;
		// Toggle the "tp-sharing" class on the player
		this.toggleClass(wrapper, "tp-sharing");
		// Toggle the "tp-active" class on the share button
		this.toggleClass(shareButton, "tp-active");
		// Simulate the click effect on the share button
		this.simulateClickEffect(shareButton);
	
		if (this.playerState.isShareDisplayed) {
			// Animate the button icon to the "opened" state
			shareButton.children[0].children[0].setAttribute('d', this.buttonIcons.close);
		} else {
			shareButton.children[0].children[0].setAttribute('d', this.buttonIcons.share);
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
		this.toggleClass(togglePlaylistButton, "tp-active");
		// Simulate the click effect on the toggle playlist button
		this.simulateClickEffect(togglePlaylistButton);
	
		if (this.playerState.isPlaylistDisplayed && this.playerState.isPlaylist) {
			// Animate the button icon to the "opened" state
			togglePlaylistButton.children[0].children[0].setAttribute('d', this.buttonIcons.close);
			// Calculate the playlist height based on the number of tracks and settings
			playlistHeight = (this.playlist.length > maxVisibleTracks && allowPlaylistScroll)
			? maxVisibleTracks * 40 - 1
			: this.playlist.length * 40;
		} else {
			// Animate the button icon to the "closed" state
			togglePlaylistButton.children[0].children[0].setAttribute('d', this.buttonIcons.playlist);
		}
	
		// Set the height of the playlist wrapper
		playlistContainer.style.height = `${playlistHeight}px`;
	}
	
	// Toggles the mute state of the volume.
	volumeToggle() {
		const { volumeButton, volumeLevel } = this.uiElements;
		const { toggleClass } = this;
	
		// Toggle the mute state
		this.playerState.isVolumeMuted = !this.playerState.isVolumeMuted;
		// Toggle the "tp-active" class on the volume button
		toggleClass(volumeButton, "tp-active");
		// Simulate the click effect on the volume button
		this.simulateClickEffect(volumeButton);
		// Adjust the audio volume based on the mute state
		this.audio.volume = this.playerState.isVolumeMuted ? 0 : this.settings.volume;
		// Update the volume level display width
		volumeLevel.style.width = this.playerState.isVolumeMuted ? this.audio.volume * 100 : 0;
	}
	
	// Initiates the audio seeking process.
	startAudioSeeking(event) {
		const { isMobile } = this.playerState;
		if(!isMobile) event.preventDefault();
	
		// Check if the event is from a non-primary mouse button on non-mobile devices
		if(!isMobile && event.button !== 0) return false;
	
		// Set the user seeking state to true
		this.playerState.isUserSeekingAudio = true;
		this.updateAudioSeekPosition(event, this);
		// Remove transitions for smooth seeking
		this.uiElements.audioCurrentTime.style.transition = "";
		this.uiElements.audioDuration.style.transition = "";
	}
	
	// Updates the audio seek position based on the user's input.
	updateAudioSeekPosition(event) {
		// Return if the user is not seeking audio
		if(!this.playerState.isUserSeekingAudio) return;
	
		const { audioSeekBar, audioPlaybackProgress, audioCurrentTime, audioDuration } = this.uiElements;
		const { secondsToTimecode } = this;// Get the bounds of the seek bar
		const seekBarBounds = audioSeekBar.getBoundingClientRect();
		// Determine the mouse position based on the device type
		const mousePosition = this.playerState.isMobile ? event.touches[0].clientX : event.clientX;
		// Calculate the percentage of the seek bar that has been traversed
		let percent = (mousePosition - seekBarBounds.left) / seekBarBounds.width;
		percent = Math.max(0, Math.min(1, percent));
	
		// Update the playback progress bar width
		audioPlaybackProgress.style.width = `${percent * 100}%`;
		// Update the current track time based on the percentage
		this.currentTrack.currentTime = percent * this.audio.duration;
		// Update the current time display
		audioCurrentTime.textContent = secondsToTimecode(this.currentTrack.currentTime);
	
		// Calculate offsets for the current time and duration displays
		const currentTimeOffset = mousePosition - seekBarBounds.left - audioCurrentTime.offsetWidth - 5;
		const durationOffset = seekBarBounds.width - (mousePosition - seekBarBounds.left) - audioDuration.offsetWidth - 5;
	
		// Adjust the position of the current time and duration displays
		if(percent !== 0 && percent !== 1) {
			audioCurrentTime.style.left = `${currentTimeOffset}px`;
			audioDuration.style.right = `${durationOffset}px`;
		}
	}
	
	// Finalizes the audio seeking process.
	finalizeAudioSeeking() {
		const { audioCurrentTime, audioDuration } = this.uiElements;
		// Return if the user is not seeking audio
		if(!this.playerState.isUserSeekingAudio) return;
		// Set the user seeking state to false
		this.playerState.isUserSeekingAudio = false;
		// Update the audio current time to match the current track time
		this.audio.currentTime = this.currentTrack.currentTime;
	
		// Add transitions for smooth UI updates
		Object.assign(audioCurrentTime.style, {
				transition: "all 250ms var(--easeOutExpo)",
				left: "5px"
		});
	
		Object.assign(audioDuration.style, {
				transition: "all 250ms var(--easeOutExpo)",
				right: "5px"
		});
	}
	
	// Initiates the volume adjustment process.
	startVolumeAdjustment(event) {
		event.preventDefault();
	
		// Check if the event is from a non-primary mouse button
		if(event.button !== 0) return false;
		// Set the user adjusting volume state to true
		this.playerState.isUserAdjustingVolume = true;
		// Update the volume based on the event
		this.updateVolumeAdjustment(event, this); // If No MouseMove, Set Value From Start
	}
	
	// Updates the volume based on the user's input.
	updateVolumeAdjustment(event) {
		// Return if the user is not adjusting the volume
		if(!this.playerState.isUserAdjustingVolume) return;
		// Get the bounds of the volume bar
		const volumeBarBounds = this.uiElements.volumeLevelBar.getBoundingClientRect();
		// Determine the mouse position
		const mousePosition = event.clientX;
		// Calculate the percentage of the volume bar that has been traversed
		let percent = (mousePosition - volumeBarBounds.left) / volumeBarBounds.width;
		percent = Math.max(0, Math.min(1, percent));
		// Update the audio volume based on the percentage
		this.audio.volume = percent;
	}
	
	// Finalizes the volume adjustment process.
	finalizeVolumeAdjustment() {
		// Set the user adjusting volume state to false
		this.playerState.isUserAdjustingVolume = false;
	}
	
	// Function to update the scrollbar thumb's size and position
	updateScrollbarThumb() {
		var visibleRatio = this.uiElements.playlist.clientHeight / this.uiElements.playlist.scrollHeight;
	
		// Set thumb height relative to the visible portion of the playlist, with a minimum of 10%
		this.uiElements.scrollbarThumb.style.height = Math.max(visibleRatio * 100, 10) + "%";
	
		// Position the thumb based on the current scroll position
		this.uiElements.scrollbarThumb.style.top = (this.uiElements.playlist.scrollTop / this.uiElements.playlist.scrollHeight) * 100 + "%";
	}
	
	// Shows the scrollbar by adding a class to the playlist wrapper.
	showScrollbar() {
		const { addClass } = this;
		// Add the class to show the scrollbar
		addClass(this.uiElements.playlistContainer, 'tp-playlist-hovered');
		// Clear any existing timeout for hiding the scrollbar
		clearTimeout(this.playerState.playlistScrollbarHideDelay);
	}
	
	// Hides the scrollbar by removing a class from the playlist wrapper after a delay.
	hideScrollbar() {
		const { removeClass } = this;
		// Set a timeout to remove the class and hide the scrollbar
		this.playerState.playlistScrollbarHideDelay = setTimeout(() => {
			removeClass(this.uiElements.playlistContainer, 'tp-playlist-hovered')
		}, 2000);
	}
	
	// Initiates the scrollbar track seeking process.
	scrollbarTrackSeekingStart(event) {
		event.preventDefault();
	
		const { playlist, scrollbarTrack } = this.uiElements;
	
		const initialMouseY = event.clientY; // Starting Y position of the mouse
		const initialScrollTop = playlist.scrollTop; // Initial scroll position
		const maxScrollPosition = playlist.scrollHeight - playlist.clientHeight; // Max scroll position
		let isDragging = false; // Flag to detect dragging vs. clicking
	
		// Function to handle mouse movements for dragging
		const scrollbarTrackSeeking = (event) => {
			const dragDeltaY = event.clientY - initialMouseY; // Mouse movement distance
	
			// Determine if dragging has started (more than 5px of movement)
			if (Math.abs(dragDeltaY) > 5) {
		isDragging = true;
			}
	
			// Calculate new scroll position relative to the drag distance and track size
			const newScrollTop = initialScrollTop + (dragDeltaY / scrollbarTrack.clientHeight) * maxScrollPosition;
	
			// Set the new scrollTop, ensuring it doesn't exceed bounds
			playlist.scrollTop = Math.max(0, Math.min(newScrollTop, maxScrollPosition));
		};
	
		// Function to handle mouse release (mouseup event)
		const scrollbarTrackSeekingEnd = (event) => {
			document.removeEventListener("mousemove", scrollbarTrackSeeking);
			document.removeEventListener("mouseup", scrollbarTrackSeekingEnd);
	
			// If it was a simple click (no dragging), scroll to the click position
			if (!isDragging) {
		const clickPositionY = event.clientY;
		const trackRect = this.uiElements.scrollbarTrack.getBoundingClientRect();
		const clickRatio = (clickPositionY - trackRect.top) / scrollbarTrack.clientHeight; // Position in % on the track
		const newScrollTop = clickRatio * maxScrollPosition;
	
		// Scroll to the clicked position
		playlist.scrollTop = Math.max(0, Math.min(newScrollTop, maxScrollPosition));
			}
		};
	
		// Add event listeners for dragging and releasing the mouse
		document.addEventListener("mousemove", scrollbarTrackSeeking);
		document.addEventListener("mouseup", scrollbarTrackSeekingEnd);
	}
	
	coverLoaded() {
		const { addClass, removeClass } = this;
		const { coverContainer } = this.uiElements;
	
		addClass(coverContainer, "tp-end-change-cover");
		removeClass(coverContainer, 'tp-start-change-cover');
		coverContainer.onanimationend = () => {
			removeClass(coverContainer, 'tp-end-change-cover');
			coverContainer.onanimationend = null;
		}
	}
	
	// Adjusts the player layout based on the wrapper's width.
	playerResize() {
		const { addClass, removeClass } = this;
		// Check if the width of the wrapper element is less than 550 pixels
		if(this.uiElements.wrapper.clientWidth < 550) {
			// Add the 'tp-vertical' class to the wrapper element
			addClass(this.uiElements.wrapper, 'tp-vertical');
		} else {
			// If the skin setting is not 'vertical', remove the 'tp-vertical' class
			if(this.settings.skin !== 'vertical') {
				removeClass(this.uiElements.wrapper, 'tp-vertical');
			}
		}
	}
	
	// Switches to the next track in the playlist.
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

	// Function to animate the text change for the track title and artist
	animateTextChange(previousTrack, currentTrack) {
		const { adjustText } = this;
		// Clear any existing animation interval to prevent multiple animations running simultaneously
		if (this.playerState.titleAnimationInterval) {
			clearInterval(this.playerState.titleAnimationInterval);
		}
	
		// Extract artist and title from previous and current track objects
		let previousArtist = previousTrack.artist;
		let currentArtist = currentTrack.artist;
		let previousTitle = previousTrack.title ? previousTrack.title : " ";
		let currentTitle = currentTrack.title ? currentTrack.title : " ";
	
		// Function to update the text in the element, adjusting artist and title
		const updateText = () => {
			// Adjust the artist text based on its length compared to the current artist
			previousArtist = adjustText(previousArtist, currentArtist);
	
			// Adjust the title text based on its length compared to the current title
			previousTitle = adjustText(previousTitle, currentTitle);
	
			// Update the track title element with the new artist and title
			if(previousTitle !== " ") {
				this.uiElements.trackTitle.innerHTML = `<b>${previousArtist}</b> - ${previousTitle}`;
			} else  {
				this.uiElements.trackTitle.innerHTML = `<b>${previousArtist}</b>`;
			}
	
			// Check if both artist and title have been fully updated to the current values
			if (previousArtist === currentArtist && previousTitle === currentTitle) {
				// Clear the interval once the animation is complete
				clearInterval(this.playerState.titleAnimationInterval);
			}
		};
	
		// Set a new interval for the animation to update every 7 milliseconds
		this.playerState.titleAnimationInterval = setInterval(updateText, 7); // Interval for smooth animation
	}
	
	// Function to adjust the length of the text by either trimming or expanding it
	adjustText(previousText, currentText) {
		// If the previous text is longer than the current text, trim the previous text
		if (previousText.length > currentText.length) {
			return previousText.slice(0, -1); // Remove the last character
		}
		// If the previous text is shorter than the current text, expand the previous text
		else if (previousText.length < currentText.length) {
			return currentText.slice(0, previousText.length + 1); // Add the next character
		}
		// If both texts are of the same length, return the current text
		return currentText; // Texts are the same length
	}


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
	getRandomID() {
	  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	  let result = '';
	  for (let i = 0; i < 10; i++) {
	    const randomIndex = Math.floor(Math.random() * chars.length);
	    result += chars[randomIndex];
	  }
	  return result;
	}
	// Deep Object Merge
	deepObjectMerge(source, destination) {
		return Object.entries(source).reduce((response, [key, value]) => {
			if (!(key in destination)) {
				response[key] = value;
			} else if (typeof value === "object" && value !== null) {
				response[key] = this.deepObjectMerge(value, destination[key]);
			} else {
				response[key] = destination[key];
			}
	
			return response;
		}, {})
	}
	// Detect Mobile
	isMobileDevice() {
		const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
		return toMatch.some(function(toMatchItem) {
			return navigator.userAgent.match(toMatchItem);
		});
	}
	// Add Class
	addClass(elements, classes) {
		const elementList = (typeof elements === "string") ? document.querySelectorAll(elements) : (elements instanceof Element) ? [elements] : elements;
		const classList = Array.isArray(classes) ? classes : [classes];
		elementList.forEach(element => {
			classList.forEach(cls => {
				if (cls) element.classList.add(cls);
			});
		});
	}
	// Remove Class
	removeClass(elements, classes) {
		const elementList = (typeof elements === "string") ? document.querySelectorAll(elements) : (elements instanceof Element) ? [elements] : elements;
		const classList = Array.isArray(classes) ? classes : [classes];
		elementList.forEach(element => {
			classList.forEach(cls => {
				if (cls) element.classList.remove(cls);
			});
		});
	}
	// Toggle Class
	toggleClass(elements, classes) {
		const elementList = (typeof elements === "string") ? document.querySelectorAll(elements) : (elements instanceof Element) ? [elements] : elements;
		const classList = Array.isArray(classes) ? classes : [classes];
		elementList.forEach(element => {
			classList.forEach(cls => {
				if (cls) element.classList.toggle(cls);
			});
		});
	}
	// Format Time
	secondsToTimecode(totalSeconds) {
		if(totalSeconds == Infinity) {
			return "00:00";
		}
		totalSeconds = parseInt(totalSeconds, 10);
		const h = Math.floor(totalSeconds / 3600);
		const m = Math.floor(totalSeconds / 60) % 60;
		const s = totalSeconds % 60;
	
		const timeArr = [h, m, s];
		const formattedArr = timeArr.map(function(value) {
			return value < 10 ? "0" + value : value;
		});
		const filteredArr = formattedArr.filter(function(value, index) {
			return value !== "00" || index > 0;
		});
		return filteredArr.join(":");
	}
	// Shuffle Array
	getShuffledPlaylistOrder() {
		let array = [], i, j, temp = null;
		// Create Array of Nums from 0 to Playlist Length
		for (i = 0; i < this.playlist.length; i++) {
			if (i !== this.currentTrack.index) {
				array.push(i);
			}
		}
		// Shuffle Array and Return
		for (i = array.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}

	// Button Icons
	buttonIcons = {
	  default: {
			play: "M0 20 20 10 0 0 0 20z",
			pause: "M0,0 3,0 3,20 0,20z M17,0 20,0 20,20, 17,20z",
	    prev: "M20 0 3 8.5 3 0 0 0 0 20 3 20 3 11.5 20 20 20 0z",
	    repeat: "M17 14.5 7 14.5 7 12 0 16 7 20 7 17.5 17 17.5 20 17.5 20 14.5 20 10 17 10 17 14.5z M3 5.5 13 5.5 13 8 20 4 13 0 13 2.5 3 2.5 0 2.5 0 5.5 0 10 3 10 3 5.5z",
	    next: "M17 0 17 8.5 0 0 0 20 17 11.5 17 20 20 20 20 0 17 0z",
	    shuffle: "M0,2L2,0l6.9,6.9-2,2L0,2ZM13.1,11.1l-2,2,3.9,3.9-3,3h8v-8l-3,3-3.9-3.9Z M12 0 15 3 0 18 2 20 17 5 20 8 20 0 12 0z",
	    share: "M17 12 17 17 3 17 3 3 8 3 8 0 3 0 0 0 0 3 0 17 0 20 3 20 17 20 20 20 20 17 20 12 17 12z M12 0 15 3 9 9 11 11 17 5 20 8 20 0 12 0z",
	    facebook: "M0,0v20h8.8v-7.1H6.5V9.4h2.3V7c0-1.9,1.6-3.5,3.5-3.5h3.6V7h-3.6v2.4h3.6l-0.6,3.5h-3V20H20V0H0z",
	    twitter: "M0,0v20h20V0H0z M16,6.9c0,0.1,0,0.3,0,0.4c0,4.1-3.1,8.8-8.8,8.8c-1.7,0-3.3-0.5-4.7-1.4c0.2,0,0.5,0,0.7,0c1.4,0,2.7-0.5,3.8-1.3c-1.3,0-2.5-0.9-2.9-2.1c0.2,0,0.4,0.1,0.6,0.1c0.3,0,0.5,0,0.8-0.1c-1.4-0.3-2.5-1.6-2.5-3v0C3.5,8.4,4,8.6,4.5,8.6C3.1,7.7,2.7,5.9,3.5,4.5c1.6,1.9,3.9,3.1,6.3,3.2c0-0.2-0.1-0.5-0.1-0.7c0-0.9,0.4-1.7,1-2.2C12,3.6,14,3.6,15.1,4.9c0.7-0.1,1.3-0.4,2-0.7c-0.2,0.7-0.7,1.3-1.4,1.7c0.6-0.1,1.2-0.2,1.8-0.5C17.1,6,16.6,6.5,16,6.9z",
	    tumblr: "M0,0v20h20V0H0z M11.6,17.5c-3.3,0-3.9-2.5-3.9-3.2V9.4h-2V6.8C7.4,6,8.6,4.4,9,2.5H11v4.3h2.7v2.6H11v4.3c0,0.8,0.4,1.3,1.2,1.3c0.5,0,0.9-0.2,1.3-0.5l0.8,1.8C14.3,16.3,13.5,17.5,11.6,17.5z",
	    playlist: "M0,15.5h20v3H0v-3ZM0,8.5h20v3H0v-3ZM0,1.5h20v3H0V1.5Z",
			volume: "M10,0v20l-6-5H0V5h4L10,0ZM14.7,15.2l-1.4-1.5c1.1-1,1.7-2.3,1.7-3.8s-.6-2.8-1.7-3.8l1.4-1.5c1.5,1.4,2.3,3.3,2.3,5.2s-.8,3.9-2.3,5.2v.2ZM15.6,18.3l-1.1-1.7c2.2-1.5,3.6-4,3.6-6.7s-1.4-5.2-3.6-6.7l1.1-1.7c2.7,1.8,4.4,5,4.4,8.3s-1.7,6.5-4.4,8.3v.2Z",
			muted: "M10,0v20l-6-5H0V5h4L10,0ZM18.7,8.2l-1.4-1.4-1.8,1.8-1.8-1.8-1.4,1.4,1.8,1.8-1.8,1.8,1.4,1.4,1.8-1.8,1.8,1.8,1.4-1.4-1.8-1.8,1.8-1.8Z",
	    download: "M17,10v7H3v-7H0v10h20v-10h-3ZM11.5,7V0h-3v7h-2.5l4,7,4-7h-2.5Z",
	    buy: "M17.4,14.8H4L2,5.2H0v-2.4h4l2,9.4h9.6l2-5.6,2.4.8-2.6,7.4ZM4.5,17.5c0-1.4,1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5-1.1,2.5-2.5,2.5-2.5-1.1-2.5-2.5M12.5,17.5c0-1.4,1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5-1.1,2.5-2.5,2.5-2.5-1.1-2.5-2.5M12.5,6.5V0h-3v6.5h-2.5l4,5,4-5h-2.5Z",
			close: "M20.06 2.06 17.94 -.06 10 7.88 2.06 -.06 -.06 2.06 7.88 10 -.06 17.94 2.06 20.06 10 12.12 17.94 20.06 20.06 17.94 12.12 10 20.06 2.06z"
	  },
	  rounded: {
			play: "M19.45,9.11L1.45.11C1.14-.05.77-.03.47.15c-.29.18-.47.5-.47.85v18c0,.35.18.67.47.85.16.1.34.15.53.15.15,0,.31-.04.45-.11l18-9c.34-.17.55-.52.55-.89s-.21-.73-.55-.89Z",
			pause: "M1.5,20h0C.7,20,0,19.3,0,18.5V1.5C0,.7.7,0,1.5,0h0c.8,0,1.5.7,1.5,1.5v17c0,.8-.7,1.5-1.5,1.5ZM20,18.5V1.5c0-.8-.7-1.5-1.5-1.5h0c-.8,0-1.5.7-1.5,1.5v17c0,.8.7,1.5,1.5,1.5h0c.8,0,1.5-.7,1.5-1.5Z",
	    prev: "M19.53.15c-.29-.18-.66-.2-.97-.04L3,7.88V1.5c0-.83-.67-1.5-1.5-1.5S0,.67,0,1.5v17c0,.83.67,1.5,1.5,1.5s1.5-.67,1.5-1.5v-6.38l15.55,7.78c.14.07.29.11.45.11.18,0,.37-.05.53-.15.29-.18.47-.5.47-.85V1c0-.35-.18-.67-.47-.85Z",
	    repeat: "M20,4c0,.18-.09.34-.25.43l-6,3.5c-.08.04-.17.07-.25.07s-.17-.02-.25-.07c-.16-.09-.25-.25-.25-.43v-2H3v3c0,.83-.67,1.5-1.5,1.5s-1.5-.67-1.5-1.5v-4.5c0-.83.67-1.5,1.5-1.5h11.5V.5c0-.18.1-.34.25-.43s.35-.09.5,0l6,3.5c.15.09.25.25.25.43ZM18.5,10c-.83,0-1.5.67-1.5,1.5v3H7v-2c0-.18-.1-.34-.25-.43-.15-.09-.35-.09-.5,0L.25,15.57c-.15.09-.25.25-.25.43s.09.34.25.43l6,3.5c.08.05.17.07.25.07s.17-.02.25-.07c.16-.09.25-.25.25-.43v-2h11.5c.83,0,1.5-.67,1.5-1.5v-4.5c0-.83-.67-1.5-1.5-1.5Z",
	    next: "M18.5,0c-.83,0-1.5.67-1.5,1.5v6.38L1.45.11C1.14-.05.77-.03.47.15c-.29.18-.47.5-.47.85v18c0,.35.18.67.47.85.16.1.34.15.53.15.15,0,.31-.04.45-.11l15.55-7.78v6.38c0,.83.67,1.5,1.5,1.5s1.5-.67,1.5-1.5V1.5c0-.83-.67-1.5-1.5-1.5Z",
	    shuffle: "M.44,2.56C-.15,1.98-.15,1.02.44.44,1.03-.15,1.97-.15,2.56.44l6.38,6.38-2.12,2.12L.44,2.56ZM19.5,0h-7c-.2,0-.38.12-.46.31s-.03.4.11.54l2.44,2.44L.44,17.44c-.59.59-.59,1.54,0,2.12.29.29.68.44,1.06.44s.77-.15,1.06-.44l14.15-14.15,2.44,2.44c.1.1.22.15.35.15.06,0,.13-.01.19-.04.19-.08.31-.26.31-.46V.5c0-.28-.22-.5-.5-.5ZM19.69,12.04c-.19-.08-.4-.04-.54.11l-2.44,2.44-3.53-3.53-2.12,2.12,3.53,3.53-2.44,2.44c-.14.14-.19.36-.11.54s.26.31.46.31h7c.28,0,.5-.22.5-.5v-7c0-.2-.12-.38-.31-.46Z",
	    share: "M20,13.5v5c0,.83-.67,1.5-1.5,1.5H1.5c-.83,0-1.5-.67-1.5-1.5V1.5C0,.67.67,0,1.5,0h5c.83,0,1.5.67,1.5,1.5s-.67,1.5-1.5,1.5h-3.5v14h14v-3.5c0-.83.67-1.5,1.5-1.5s1.5.67,1.5,1.5ZM19.5,0h-7c-.2,0-.38.12-.46.31s-.03.4.11.54l2.44,2.44-5.65,5.65c-.59.59-.59,1.54,0,2.12.29.29.68.44,1.06.44s.77-.15,1.06-.44l5.65-5.65,2.44,2.44c.1.1.22.15.35.15.06,0,.13-.01.19-.04.19-.08.31-.26.31-.46V.5c0-.28-.22-.5-.5-.5Z",
	    facebook: "M17,0H3C1.3,0,0,1.3,0,3v14c0,1.7,1.3,3,3,3h5.8v-7.1H6.5V9.4h2.3V7c0-1.9,1.6-3.5,3.5-3.5h3.6V7h-3.6v2.4h3.6l-0.6,3.5h-3V20H17c1.7,0,3-1.3,3-3V3C20,1.3,18.7,0,17,0z",
	    twitter: "M17,0H3C1.3,0,0,1.3,0,3v14c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3V3C20,1.3,18.7,0,17,0z M16,6.9c0,0.1,0,0.3,0,0.4c0,4.1-3.1,8.8-8.8,8.8c-1.7,0-3.3-0.5-4.7-1.4c0.2,0,0.5,0,0.7,0c1.4,0,2.7-0.5,3.8-1.3c-1.3,0-2.5-0.9-2.9-2.1c0.2,0,0.4,0.1,0.6,0.1c0.3,0,0.5,0,0.8-0.1c-1.4-0.3-2.5-1.6-2.5-3v0C3.5,8.4,4,8.6,4.5,8.6C3.1,7.7,2.7,5.9,3.5,4.5c1.6,1.9,3.9,3.1,6.3,3.2c0-0.2-0.1-0.5-0.1-0.7c0-0.9,0.4-1.7,1-2.2C12,3.6,14,3.6,15.1,4.9c0.7-0.1,1.3-0.4,2-0.7c-0.2,0.7-0.7,1.3-1.4,1.7c0.6-0.1,1.2-0.2,1.8-0.5C17.1,6,16.6,6.5,16,6.9z",
	    tumblr: "M17,0H3C1.3,0,0,1.3,0,3v14c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3V3C20,1.3,18.7,0,17,0z M11.6,17.5c-3.3,0-3.9-2.5-3.9-3.2V9.4h-2V6.8C7.4,6,8.6,4.4,9,2.5H11v4.3h2.7v2.6H11v4.3c0,0.8,0.4,1.3,1.2,1.3c0.5,0,0.9-0.2,1.3-0.5l0.8,1.8C14.3,16.3,13.5,17.5,11.6,17.5z",
	    playlist: "M18.5,18.5H1.5c-.8,0-1.5-.7-1.5-1.5h0c0-.8.7-1.5,1.5-1.5h17c.8,0,1.5.7,1.5,1.5h0c0,.8-.7,1.5-1.5,1.5ZM20,10h0c0-.8-.7-1.5-1.5-1.5H1.5c-.8,0-1.5.7-1.5,1.5h0c0,.8.7,1.5,1.5,1.5h17c.8,0,1.5-.7,1.5-1.5ZM20,3h0c0-.8-.7-1.5-1.5-1.5H1.5c-.8,0-1.5.7-1.5,1.5h0c0,.8.7,1.5,1.5,1.5h17c.8,0,1.5-.7,1.5-1.5Z",
			default: "M10,1v18c0,.4-.24.77-.62.92-.12.05-.25.08-.38.08-.26,0-.52-.1-.71-.29l-4.71-4.71H1c-.55,0-1-.45-1-1V6c0-.55.45-1,1-1h2.59L8.29.29c.29-.29.71-.37,1.09-.22.37.15.62.52.62.92ZM14.68,15.24c1.48-1.35,2.32-3.26,2.32-5.24s-.85-3.88-2.32-5.24c-.41-.37-1.04-.35-1.41.06-.37.41-.35,1.04.06,1.41,1.07.98,1.68,2.35,1.68,3.76s-.61,2.79-1.68,3.76c-.41.37-.43,1.01-.06,1.41.2.21.47.32.74.32.24,0,.48-.09.68-.26ZM15.55,18.33c2.74-1.83,4.45-5.02,4.45-8.33s-1.7-6.5-4.45-8.33c-.46-.31-1.08-.18-1.39.28-.31.46-.18,1.08.28,1.39,2.19,1.46,3.55,4.02,3.55,6.67s-1.36,5.21-3.55,6.67c-.46.31-.58.93-.28,1.39.19.29.51.45.83.45.19,0,.38-.05.55-.17Z",
			muted: "M10,1v18c0,.4-.24.77-.62.92-.12.05-.25.08-.38.08-.26,0-.52-.1-.71-.29l-4.71-4.71H1c-.55,0-1-.45-1-1V6c0-.55.45-1,1-1h2.59L8.29.29c.29-.29.71-.37,1.09-.22.37.15.62.52.62.92ZM18.71,13.21c.39-.39.39-1.02,0-1.41l-1.79-1.79,1.79-1.79c.39-.39.39-1.02,0-1.41s-1.02-.39-1.41,0l-1.79,1.79-1.79-1.79c-.39-.39-1.02-.39-1.41,0s-.39,1.02,0,1.41l1.79,1.79-1.79,1.79c-.39.39-.39,1.02,0,1.41s1.02.39,1.41,0l1.79-1.79,1.79,1.79c.2.2.45.29.71.29s.51-.1.71-.29Z",
	    download: "M20,11.5v7c0,.83-.67,1.5-1.5,1.5H1.5c-.83,0-1.5-.67-1.5-1.5v-7c0-.83.67-1.5,1.5-1.5s1.5.67,1.5,1.5v5.5h14v-5.5c0-.83.67-1.5,1.5-1.5s1.5.67,1.5,1.5ZM14.44,7.76c-.09-.16-.26-.26-.44-.26h-2.5V1.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5,1.5v6h-2.5c-.18,0-.35.1-.44.26s-.08.36.02.51l4,6c.09.14.25.22.42.22s.32-.08.42-.22l4-6c.1-.15.11-.35.02-.51Z",
	    buy: "M16.2,14.75H4.8c-.59,0-1.1-.41-1.22-.99L1.79,5.25h-.59C.51,5.25-.05,4.69-.05,4s.56-1.25,1.25-1.25h1.6c.59,0,1.1.41,1.22.99l1.79,8.51h9.54l2.29-5.71c.26-.64.99-.95,1.62-.7.64.26.95.98.7,1.62l-2.6,6.5c-.19.47-.65.79-1.16.79ZM4.2,17.5c0,1.4,1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5-1.1-2.5-2.5-2.5-2.5,1.1-2.5,2.5M12.2,17.5c0,1.4,1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5-1.1-2.5-2.5-2.5-2.5,1.1-2.5,2.5M15.25,5.78c-.08-.17-.26-.28-.45-.28h-2.6V1.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5,1.5v4h-2.4c-.19,0-.37.11-.45.28-.08.17-.06.38.06.53l4,5c.09.12.24.19.39.19s.3-.07.39-.19l4-5c.12-.15.14-.36.06-.53Z",
			close: "M12.12,10l7.44-7.44c.59-.59.59-1.54,0-2.12-.59-.59-1.54-.59-2.12,0l-7.44,7.44L2.56.44C1.97-.15,1.03-.15.44.44-.15,1.02-.15,1.98.44,2.56l7.44,7.44L.44,17.44c-.59.59-.59,1.54,0,2.12.29.29.68.44,1.06.44s.77-.15,1.06-.44l7.44-7.44,7.44,7.44c.29.29.68.44,1.06.44s.77-.15,1.06-.44c.59-.59.59-1.54,0-2.12l-7.44-7.44Z"
	  },
	};
}

function tPlayer(options) {
	return new tPlayerClass(options);
}