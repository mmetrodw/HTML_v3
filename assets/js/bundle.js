var tPlayersCollection = [];

/* UTILS */
var utils = {
	// Get Random ID
	getRandomID: () => {
	  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	  let result = '';
	  for (let i = 0; i < 10; i++) {
	    const randomIndex = Math.floor(Math.random() * chars.length);
	    result += chars[randomIndex];
	  }
	  return result;
	},
	// Deep Object Merge
	deepObjectMerge: (source, destination) => {
		return Object.entries(source).reduce((response, [key, value]) => {
			if (!(key in destination)) {
				response[key] = value;
			} else if (typeof value === "object" && value !== null) {
				response[key] = this.utils.deepObjectMerge(value, destination[key]);
			} else {
				response[key] = destination[key];
			}
	
			return response;
		}, {})
	},
	// Detect Mobile
	isMobileDevice: () => {
		const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
		return toMatch.some(function(toMatchItem) {
			return navigator.userAgent.match(toMatchItem);
		});
	},
	// Add Class
	addClass: (elements, classes) => {
		const elementList = (typeof elements === "string") ? document.querySelectorAll(elements) : (elements instanceof Element) ? [elements] : elements;
		const classList = Array.isArray(classes) ? classes : [classes];
		elementList.forEach(element => {
			classList.forEach(cls => {
				if (cls) element.classList.add(cls);
			});
		});
	},
	// Remove Class
	removeClass: (elements, classes) => {
		const elementList = (typeof elements === "string") ? document.querySelectorAll(elements) : (elements instanceof Element) ? [elements] : elements;
		const classList = Array.isArray(classes) ? classes : [classes];
		elementList.forEach(element => {
			classList.forEach(cls => {
				if (cls) element.classList.remove(cls);
			});
		});
	},
	// Toggle Class
	toggleClass: (elements, classes) => {
		const elementList = (typeof elements === "string") ? document.querySelectorAll(elements) : (elements instanceof Element) ? [elements] : elements;
		const classList = Array.isArray(classes) ? classes : [classes];
		elementList.forEach(element => {
			classList.forEach(cls => {
				if (cls) element.classList.toggle(cls);
			});
		});
	},
	// Create Element
	createElement: (
	  tagName,
	  classNames = [],
	  parentElement = null,
	  innerHtml = false,
	  shouldReturn = true
	) => {
	  // Create a new element with the specified tag name
	  const element = document.createElement(tagName);
	
	  // Add classes to the element using a utility function
	  this.utils.addClass(element, classNames);
	
	  // If innerHtml is provided, set the element's inner HTML
	  if (innerHtml) {
	    element.innerHTML = innerHtml;
	  }
	
	  // If a parent element is specified, append the new element to it
	  if (parentElement) {
	    parentElement.appendChild(element);
	  }
	
	  // Return the created element or null based on the shouldReturn parameter
	  return shouldReturn ? element : null;
	},
	// Create Element SVG
	createElementSVG: (tagName, classNames = [], parentElement = null, attributes = [], shouldReturn = true) => {
		// Create a new SVG element with the specified tag name
		// Using createElementNS with the SVG namespace to ensure proper SVG element creation
		const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
	
		// If classNames are provided, add them to the element
		if (classNames.length > 0) {
			this.utils.addClass(element, classNames);
		}
	
		// If attributes are provided, set them on the element
		if (attributes.length > 0) {
			attributes.forEach(attribute => {
				// Each attribute is expected to be an object with a single key-value pair
				const key = Object.keys(attribute)[0];
				element.setAttribute(key, attribute[key]);
			});
		}
	
		// If a parent element is specified, append the new SVG element to it
		if(parentElement) {
			parentElement.appendChild(element);
		}
	
		// Return the created SVG element or null based on the shouldReturn parameter
		return shouldReturn ? element : null;
	},
	// Format Time
	secondsToTimecode: (totalSeconds) => {
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
};

class tPlayerClass {
	constructor(options) {
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
		this.settings = utils.deepObjectMerge(defaultPlayerSettings, options);
		this.playlist = JSON.parse(JSON.stringify(this.settings.playlist)); // Clone Palylist to variable
		this.uiElements = [];
		this.playerId = utils.getRandomID();
		
		// PLAYER STATE
		this.playerState = {
			_audioEvent: null,
			_autoplay: false,
			_repeat: false,
			_scrollbarTimeOutId: null,
			_shuffle: false,
			_status: null,
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
					this.handlePlayerStatusChange(`Audio Event: ${this._audioEvent}`);
				}
			},
			set autoplay(value) { this._autoplay = value;	},
			set repeat(value) { this._repeat = value; },
			set scrollbarTimeOutId(value) { this._scrollbarTimeOutId = value; },
			set shuffle(value) { this._shuffle = value; },
			set status(value) {
				if(this._status !== value) {
					this._status = value;
					this.handleStatusChange(`Player Status: ${this._status}`);
				}
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
		
			handleStatusChange: (state) => {
				if(this.uiElements.playerStatus) {
					this.uiElements.playerStatus.innerHTML = state;
				}
			},
		
			// Method to handle state changes
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
		return new Promise((resolve, reject) => {
			try {
				this.playerState.status = "Validating Player Configuration";
				const playerContainerElement = document.getElementById(this.settings.container);
	
				// Check if the 'id' property is missing or invalid
				if (!this.settings.container) {
					return reject("tPlayer Error: Please enter a valid container name.");
				}
	
				// Check if the 'wrapper' element associated with the given 'id' is missing
				if (!playerContainerElement) {
					return reject(`tPlayer Error: Element with id "${this.settings.container}" not found.`);
				}
	
				this.uiElements.wrapper = playerContainerElement;
	
				// Check if the 'playlist' property is missing or not provided
				if (!Array.isArray(this.playlist) || this.playlist.length === 0) {
					return reject("tPlayer Error: Please, add a valid Playlist to tPlayer.");
				} else {
					this.playerState.isPlaylist = this.playlist.length > 1 ? true : false;
				}
	
				// Check for audio link for each playlist item and update properties
				for( const item of this.playlist) {
					if(item.audio === undefined || item.audio === "") {
						return reject("tPlayer Error: Not all tracks in the playlist have the audio property.");
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
				this.playerState.status = "The Configuration Has Been Vlidated";
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	// Create Player Interface
	async createPlayerInterface() {
		return new Promise((resolve, reject) => {
			try {
				this.playerState.status = 'Create Player Interface';
				const { wrapper } = this.uiElements;
				const { rounded, skin, showRepeatButton, showShuffleButton, showShareButton} = this.settings;
				const { addClass, createElement } = utils;
				const { isMobile, isPlaylist } = this.playerState;
				const fragment = document.createDocumentFragment();
	
				// Set button icons based on 'rounded' setting
				this.buttonIcons = rounded ? this.buttonIcons.rounded : this.buttonIcons.default;
	
				// Add classes to the wrapper
				addClass(wrapper, ["tp-wrapper", rounded ? "tp-rounded" : "", skin === "vertical" ? "tp-vertical" : ""]);
	
				const playerContainer = createElement('div', 'tp-player-container', fragment);
				// Cover
				let coverContainer = createElement('div', 'tp-cover-container', playerContainer);
				createElement('div', 'tp-cover-loading-spinner', coverContainer, '<span></span><span></span><span></span>', false);
				let cover = createElement('div', 'tp-cover', coverContainer);
				this.uiElements.coverImage = createElement('img', 'tp-cover-image', cover);
	
				// Player
				const player = createElement('div', 'tp-player', playerContainer);
	
				// Player Header
				let playerHeader = createElement('div', 'tp-player-header', player);
				this.uiElements.trackTitle = createElement('div', 'tp-track-title', playerHeader, 'Loading...');
	
				// Player Body
				let playerControls = createElement('div', 'tp-player-controls', player);
	
				// Playback
				this.uiElements.playbackButton = createElement('button', ['tp-playback-button', 'tp-button'], playerControls);
				this.createButtonIcon(this.uiElements.playbackButton, [], [this.buttonIcons.playback.play]);
	
				// Create Seek, Buffered, Progress and Time codes
				this.createSeekBar(playerControls);
	
				// Prev, Repeat, Next, Shuffle, Share Buttons
				const buttonsConfig = [
					{ condition: isPlaylist, classNames: ['tp-prev-button', 'tp-button'], icon: this.buttonIcons.prev, key: 'prevButton' },
					{ condition: showRepeatButton, classNames: ['tp-repeat-button', 'tp-button'], icon: this.buttonIcons.repeat, key: 'repeatButton' },
					{ condition: isPlaylist, classNames: ['tp-next-button', 'tp-button'], icon: this.buttonIcons.next, key: 'nextButton' },
					{ condition: isPlaylist && showShuffleButton, classNames: ['tp-shuffle-button', 'tp-button'], icon: this.buttonIcons.shuffle, key: 'shuffleButton' },
					{ condition: showShareButton, classNames: ['tp-share-button', 'tp-button'], icon: this.buttonIcons.share.closed, key: 'shareButton' }
				];
	
				buttonsConfig.forEach(config => {
					if (config.condition) {
						this.uiElements[config.key] = createElement('button', config.classNames, playerControls);
						this.createButtonIcon(this.uiElements[config.key], ['tp-stroke', 'tp-fill'], [config.icon.stroke, config.icon.fill]);
					}
				});
	
				// Player Footer
				let playerFooter = createElement('div', 'tp-player-footer', player);
				// Playlist Toogle or Links
				if(isPlaylist) {
					this.uiElements.togglePlaylistButton = createElement('button', ['tp-toggle-playlist-button', 'tp-button'], playerFooter);
					this.createButtonIcon(this.uiElements.togglePlaylistButton, ['tp-stroke'], [this.buttonIcons.playlist.closed])
				} else {
					if(this.playlist[0].buy) this.createLink('buy', this.playlist[0].buy, playerFooter);
					if(this.playlist[0].download) this.createLink('download', this.playlist[0].download, playerFooter);
				}
	
				// Volume controls
				if(!isMobile) {
					let volumeControl = createElement('div', 'tp-volume-control', playerFooter);
					this.uiElements.volumeButton = createElement('button', ['tp-volume-button', 'tp-button'], volumeControl);
					this.createButtonIcon(
						this.uiElements.volumeButton,
						['tp-fill', 'tp-stroke', 'tp-stroke', 'tp-stroke'],
						[this.buttonIcons.volume.speaker, this.buttonIcons.volume.line_1, this.buttonIcons.volume.line_2, this.buttonIcons.volume.muted]
					);
					this.uiElements.volumeLevelBar = createElement('div', 'tp-volume-level-bar', volumeControl);
					this.uiElements.volumeLevel = createElement('div', 'tp-volume-level', this.uiElements.volumeLevelBar);
				}
	
				// Share Buttons
				if(this.settings.showShareButton) {
					let soicalWrapper = createElement('div', 'tp-social-media-container', playerContainer);
					this.uiElements.facebookButton = createElement('button', ['tp-facebook-button', 'tp-button'], soicalWrapper);
					this.createButtonIcon(this.uiElements.facebookButton, ['tp-fill'], [this.buttonIcons.facebook]);
					this.uiElements.twitterButton = createElement('button', ['tp-twitter-button', 'tp-button'], soicalWrapper);
					this.createButtonIcon(this.uiElements.twitterButton, ['tp-fill'], [this.buttonIcons.twitter]);
					this.uiElements.tumblrButton = createElement('button', ['tp-tumblr-button', 'tp-button'], soicalWrapper);
					this.createButtonIcon(this.uiElements.tumblrButton, ['tp-fill'], [this.buttonIcons.tumblr]);
				}
	
				// Playlist
				if(isPlaylist) {
					this.uiElements.playlistContainer = createElement('div', 'tp-playlist-container', fragment);
					this.uiElements.scrollbarTrack = createElement('div', 'tp-scrollbar-track', this.uiElements.playlistContainer);
					this.uiElements.scrollbarThumb = createElement('div', 'tp-scrollbar-thumb', this.uiElements.scrollbarTrack);
					this.uiElements.playlist = createElement('ul', 'tp-playlist', this.uiElements.playlistContainer);
					this.uiElements.playlistItem = this.createPlaylist();
				}
				let errorContainer = createElement('div', 'tp-error-container', fragment);
				this.uiElements.errorMessage = createElement('div', 'tp-error-message', errorContainer);
				this.uiElements.errorClose = createElement('button', 'tp-error-close', errorContainer);
				this.createButtonIcon(this.uiElements.errorClose, ['tp-stroke'], [this.buttonIcons.playlist.closed]);
	
				wrapper.appendChild(fragment);
				this.playerState.status = 'The Player Interface is Created';
				resolve();
			} catch (e) {
				reject(e);
			}
		})
	}
	
	
	createButtonIcon(parent, pathClasses = [], paths = []) {
		let buttonIcon = utils.createElementSVG('svg', [], parent);
	
		paths.forEach((path, index) => {
			let currentPathClass = pathClasses[index] || [];
			utils.createElementSVG('path', currentPathClass, buttonIcon, [{'d': path}], false);
		});
	}
	
	
	createSeekBar(parent) {
		this.uiElements.audioSeekBar = utils.createElement('div', 'tp-audio-seekbar', parent);
		this.uiElements.audioBufferedProgress = utils.createElement('div', 'tp-audio-buffered-progress', this.uiElements.audioSeekBar);
		this.uiElements.audioPlaybackProgress = utils.createElement('div', 'tp-audio-playback-progress', this.uiElements.audioSeekBar);
		this.uiElements.currentTime = utils.createElement('div', 'tp-current-time', this.uiElements.audioSeekBar, '00:00');
		this.uiElements.duration = utils.createElement('div', 'tp-duration', this.uiElements.audioSeekBar, '00:00');
		utils.createElement('div', 'tp-player-loader', this.uiElements.audioSeekBar, '<span></span><span></span><span></span>');
		this.uiElements.playerStatus = utils.createElement('div', 'tp-player-status', this.uiElements.audioSeekBar);
	}
	
	
	createLink(type, href, parent) {
		let link = utils.createElement('a', ['tp-playlist-track-' + type, 'tp-button'], parent);
		link.setAttribute('href', href);
		link.setAttribute('target', '_blank');
		link.setAttribute('title', type === 'download' ? 'Download Now' : 'Buy Now');
		if (type === 'download') link.setAttribute('download', '');
		this.createButtonIcon(link, ['tp-stroke'], [this.buttonIcons[type]]);
	}
	
	
	createPlaylist() {
		const { createElement } = utils;
		const items = [];
		this.playlist.map(track => {
			let trackName = track.title ? `<b>${track.artist}</b> - ${track.title}` : `<b>${track.artist}</b>`;
			let trackTitle = track.title ? `${track.artist} - ${track.title}` : track.artist;
	
			let item = createElement('li', 'tp-playlist-item', this.uiElements.playlist);
			item.setAttribute('title', trackTitle);
	
			createElement('div', 'tp-playlist-indicator', item, '<span></span><span></span><span></span>', false);
			createElement('div', 'tp-playlist-track', item, trackName, false);
	
			if(track.buy) this.createLink('buy', track.buy, item);
			if(track.download) this.createLink('download', track.download, item);
	
			items.push(item);
		});
		return items;
	}

	// Function to apply styles from the JSON object as CSS variables
	async applyPlayerStyles(styles, element, prefix = '') {
		return new Promise((resolve, reject) => {
			try {
				this.playerState.status = 'Aplly Custom Styles';
				// Call the applyPlayerStyles function with the styles and playerElement
				this.addPlayerStyle(styles, element, prefix);
				this.playerState.status = 'Custom Styles Applied';
				resolve();
			} catch (err) {
				reject(err);
			}
		});
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

	// Create Audio and Add It to Collection
	async createAudio() {
		return new Promise((resolve, reject) => {
			try {
				this.playerState.status = 'Create Audio Object';
				this.audio = new Audio();
				this.audio.preload = "metadata";
				this.audio.volume = 0;
				// Add to List of Players
				tPlayersCollection[this.playerId] = this.audio;
				this.playerState.status = 'Audio Object Was Created';
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	// Sets up event listeners for the audio player
	async setupEventListeners() {
		return new Promise((resolve, reject) => {
			try {
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
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	/* AUDIO EVENTS */ 
	abort() { 
		this.playerState.audioEvent = 'abort'; 
		// Set the seeking state to false 
		this.isSeeking(false); 
		// Disable radio info updates 
		this.playerState.isRadioInfoUpdateAllowed = false; 
	} 
	 
	canplay() { 
		this.playerState.audioEvent = 'canplay'; 
		// Set loading status to false 
		this.playerState.isLoading = false; 
		// Set the seeking state to true 
		this.isSeeking(true); 
	} 
	 
	canplaythrough() { 
		this.playerState.audioEvent = 'canplaythrough'; 
		// Set loading status to false 
		this.playerState.isLoading = false; 
		// Set the seeking state to true 
		this.isSeeking(true); 
	 
		// Start playback if autoplay is enabled 
		if (this.playerState.autoplay) this.audio.play(); 
	} 
	 
	durationchange() { 
		this.playerState.audioEvent = 'durationchange'; 
		const { duration } = this.uiElements; 
	 
		// Update the duration display in the UI 
		duration.textContent = utils.secondsToTimecode(this.audio.duration); 
		// Show or hide the duration element based on whether the duration is not Infinity 
		duration.style = this.audio.duration !== Infinity ? "block" : "none"; 
		// Set the seeking state to true 
		this.isSeeking(true); 
	} 
	 
	emptied() { 
		this.playerState.audioEvent = 'emptied'; 
		// Set the seeking state to false 
		this.isSeeking(false); 
		// Disable radio info updates 
		this.playerState.isRadioInfoUpdateAllowed = false; 
	} 
	 
	// Ended 
	ended() { 
		this.playerState.audioEvent = 'ended'; 
		// Play Next 
		this.nextTrack(); 
	} 
	 
	error() { 
		this.playerState.audioEvent = 'error'; 
		// Set the seeking state to false 
		this.isSeeking(false); 
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
	 
		// Disable radio info updates 
		this.playerState.isRadioInfoUpdateAllowed = false; 
		// Pause the audio 
		this.pause(); 
		// Disable autoplay 
		this.playerState.autoplay = false; 
		// Add the 'error' class to the player UI 
		utils.addClass(this.uiElements.wrapper, 'tp-error'); 
		// Show the error message 
		this.uiElements.errorMessage.textContent = "tPlayer Error: " + errorCode; 
		console.log("tPlayer Error: " + errorCode); 
		return false; 
	} 
	 
	loadstart() { 
		this.playerState.audioEvent = 'loadstart'; 
		// Set loading status to true 
		this.playerState.isLoading = true; 
	} 
	 
	loadeddata() { 
		this.playerState.audioEvent = 'loadeddata'; 
		// Set the seeking state to true 
		this.isSeeking(true); 
		// Set loading status to false 
		this.playerState.isLoading = false; 
	} 
	 
	loadedmetadata() { 
		this.playerState.audioEvent = 'loadedmetadata'; 
		const { duration } = this.uiElements; 
	 
		// Update the duration display in the UI 
		duration.textContent = utils.secondsToTimecode(this.audio.duration); 
		// Show or hide the duration element based on whether the duration is not Infinity 
		duration.style = this.audio.duration !== Infinity ? "block" : "none"; 
		// Set the seeking state to true 
		this.isSeeking(true); 
		// Set loading status to false 
		this.playerState.isLoading = false; 
	} 
	 
	pause() { 
		this.playerState.audioEvent = 'pause'; 
		const { playlistItem, playbackButton } = this.uiElements; 
		const { removeClass } = utils; 
	 
		// Remove the 'playing' class from playlist items 
		removeClass(playlistItem, 'tp-playing'); 
		// Remove the 'active' class from the playback button 
		removeClass(playbackButton, 'tp-active'); 
		// Update the playback button icon to 'play' 
		playbackButton.querySelector('path').setAttribute('d', this.buttonIcons.playback.play); 
		// Disable radio info updates 
		this.playerState.isRadioInfoUpdateAllowed = false; 
	} 
	 
	play() { 
		this.playerState.audioEvent = 'play'; 
		const { playlistItem, playbackButton } = this.uiElements; 
		const { addClass } = utils; 
		// Pause all other players in the collection 
		for (let player in tPlayersCollection) { 
			if (player !== this.playerId) { 
				tPlayersCollection[player].pause(); 
			} 
		} 
		// Add the 'playing' class to the current playlist item 
		addClass(playlistItem[this.currentTrack.index], 'tp-playing'); 
		// Add the 'active' class to the playback button 
		addClass(playbackButton, 'tp-active'); 
		// Update the playback button icon to 'pause' 
		playbackButton.querySelector('path').setAttribute('d', this.buttonIcons.playback.pause); 
		// Set the seeking state to true 
		this.isSeeking(true); 
		// Enable radio info updates 
		this.playerState.isRadioInfoUpdateAllowed = true; 
	} 
	 
	playing() { 
		this.playerState.audioEvent = 'playing'; 
		// Set loading status to false 
		this.playerState.isLoading = false; 
		// Set the seeking state to true 
		this.isSeeking(true); 
		// Enable radio info updates 
		this.playerState.isRadioInfoUpdateAllowed = true; 
	} 
	 
	progress() { 
		this.playerState.audioEvent = 'progress'; 
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
	} 
	 
	ratechange() { 
		this.playerState.audioEvent = 'ratechange'; 
		console.log("Rate Change"); 
	} 
	 
	seeked() { 
		this.playerState.audioEvent = 'seeked'; 
		// Set loading status to false 
		this.playerState.isLoading = false; 
	} 
	 
	seeking() { 
		this.playerState.audioEvent = 'seeking'; 
		// Set loading status to true 
		this.playerState.isLoading = true; 
	} 
	 
	stalled() { 
		this.playerState.audioEvent = 'stalled'; 
		// Set the seeking state to false 
		this.isSeeking(false); 
		// Set loading status to true 
		this.playerState.isLoading = true; 
		// Disable radio info updates 
		this.playerState.isRadioInfoUpdateAllowed = false; 
		// Log the stalled event 
		console.log('Playback stalled at', this.audio.currentTime); 
	} 
	 
	suspend() { 
		this.playerState.audioEvent = 'suspend'; 
		// Disable radio info updates 
		this.playerState.isRadioInfoUpdateAllowed = false; 
	} 
	 
	timeupdate() { 
		this.playerState.audioEvent = 'timeupdate'; 
		if (!this.playerState.isUserSeekingAudio) { 
			// Set the current time of the track to match the audio's current time 
			this.currentTrack.currentTime = this.audio.currentTime; 
			// Calculate the percentage of the track that has been played 
			const percent = (this.currentTrack.currentTime / this.audio.duration) * 100; 
			// Update the width of the playback progress bar 
			this.uiElements.audioPlaybackProgress.style.width = percent + '%'; 
			// Update the displayed current time in the player 
			this.uiElements.currentTime.textContent = utils.secondsToTimecode(this.audio.currentTime); 
			// Call the progress function to update the buffered progress bar 
			this.progress(); 
		} 
	} 
	 
	volumechange() { 
		this.playerState.audioEvent = 'volumechange'; 
		const paths = this.uiElements.volumeButton.children[0].children; 
		this.settings.volume = this.audio.volume !== 0 ? this.audio.volume : this.settings.volume; 
		this.uiElements.volumeLevel.style.width = `${this.audio.volume * 100}%`; 
	 
		// Update the visibility of volume level indicators 
		paths[1].style.transform = this.audio.volume < 0.25 ? "scale(0)" : "scale(1)"; 
		paths[2].style.transform = this.audio.volume < 0.5 ? "scale(0)" : "scale(1)"; 
		paths[3].style.transform = this.audio.volume === 0 ? "scale(1)" : "scale(0)"; 
	 
		// Update the mute state and button appearance 
		if(this.audio.volume === 0) { 
			this.playerState.isVolumeMuted = true; 
			utils.addClass(this.uiElements.volumeButton, 'tp-active'); 
		} else { 
			this.playerState.isVolumeMuted = false; 
			utils.removeClass(this.uiElements.volumeButton, 'tp-active'); 
		} 
	} 
	 
	waiting() { 
		this.playerState.audioEvent = 'waiting'; 
		// Set loading status to true 
		this.playerState.isLoading = true; 
		// Set the seeking state to false 
		this.isSeeking(false); 
		// Disable radio info updates 
		this.playerState.isRadioInfoUpdateAllowed = false; 
	}



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

	// Function to animate the text change for the track title and artist
	animateTextChange(previousTrack, currentTrack) {
		// Clear any existing animation interval to prevent multiple animations running simultaneously
		if (titleAnimationInterval) {
			clearInterval(titleAnimationInterval);
		}
	
		// Extract artist and title from previous and current track objects
		let previousArtist = previousTrack.artist;
		let currentArtist = currentTrack.artist;
		let previousTitle = previousTrack.title ? previousTrack.title : " ";
		let currentTitle = currentTrack.title ? currentTrack.title : " ";
	
		// Function to update the text in the element, adjusting artist and title
		const updateText = () => {
			// Adjust the artist text based on its length compared to the current artist
			previousArtist = this.adjustText(previousArtist, currentArtist);
	
			// Adjust the title text based on its length compared to the current title
			previousTitle = this.adjustText(previousTitle, currentTitle);
	
			// Update the track title element with the new artist and title
			if(previousTitle !== " ") {
				this.uiElements.trackTitle.innerHTML = `<b>${previousArtist}</b> - ${previousTitle}`;
			} else  {
				this.uiElements.trackTitle.innerHTML = `<b>${previousArtist}</b>`;
			}
	
			// Check if both artist and title have been fully updated to the current values
			if (previousArtist === currentArtist && previousTitle === currentTitle) {
				// Clear the interval once the animation is complete
				clearInterval(titleAnimationInterval);
			}
		};
	
		// Set a new interval for the animation to update every 7 milliseconds
		titleAnimationInterval = setInterval(updateText, 7); // Interval for smooth animation
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
		try {
			this.playerState.status = 'Initializing';
			// Validate Player Config
			await this.validatePlayerConfig();
			// Create Player Interface
			await this.createPlayerInterface();
			// Apply Player Styles
			await this.applyPlayerStyles(this.settings.style, this.uiElements.wrapper);
			// Create Audio and Add It to Collection
			await this.createAudio();

			// await this.applyUserDefinedSettings();

			// Setup Event Listeners
			await this.setupEventListeners();
			// Load And Prepare The Initial Track For Playback
			await this.switchTrack();
			console.log(this);
		} catch (error) {
			console.error('Error initializing tPlayer:', error);
		}
	}

	// Button Icons
	buttonIcons = {
	  default: {
	    playback: {
	      play: "M0,0 10,5 10,15 0,20z M10,5 20,10 20,10 10,15z",
	      pause: "M0,0 3,0 3,20 0,20z M17,0 20,0 20,20, 17,20z",
	    },
	    prev: {
	      stroke: "M1.5,0 1.5,20",
	      fill: "M20,0 20,20 1,10z",
	    },
	    repeat: {
	      stroke: "M1.5,12 1.5,3.5 14,3.5 M18.5,8 18.5,16 6,16.5",
	      fill: "M13,0 20,3.5 13,7z M7,13 7,20 0,16.5z",
	    },
	    next: {
	      stroke: "M18.5,0 18.5,20",
	      fill: "M0,0 19,10 0,20z",
	    },
	    shuffle: {
	      stroke: "M1,19 17,3 M1,1 8,8 M12,12 17,17",
	      fill: "M12,0 20,0 20,8z M20,12 20,20 12,20z",
	    },
	    share: {
	      opened: {
	        fill: "M10,10 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0 M18.5,1.5 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0 M18.5,18.5 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0",
	        stroke: "M18.5,1.5 10,10 18.5,18.5 M1.5,1.5 10,10 1.5,18.5",
	      },
	      closed: {
	        fill: "M0,10 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0 M12,4 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0 M12,16 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0",
	        stroke: "M16,4 4,10 16,16 M4,10 4,10 4,10",
	      },
	    },
	    facebook:
	      "M0,0v20h8.8v-7.1H6.5V9.4h2.3V7c0-1.9,1.6-3.5,3.5-3.5h3.6V7h-3.6v2.4h3.6l-0.6,3.5h-3V20H20V0H0z",
	    twitter:
	      "M0,0v20h20V0H0z M16,6.9c0,0.1,0,0.3,0,0.4c0,4.1-3.1,8.8-8.8,8.8c-1.7,0-3.3-0.5-4.7-1.4c0.2,0,0.5,0,0.7,0c1.4,0,2.7-0.5,3.8-1.3c-1.3,0-2.5-0.9-2.9-2.1c0.2,0,0.4,0.1,0.6,0.1c0.3,0,0.5,0,0.8-0.1c-1.4-0.3-2.5-1.6-2.5-3v0C3.5,8.4,4,8.6,4.5,8.6C3.1,7.7,2.7,5.9,3.5,4.5c1.6,1.9,3.9,3.1,6.3,3.2c0-0.2-0.1-0.5-0.1-0.7c0-0.9,0.4-1.7,1-2.2C12,3.6,14,3.6,15.1,4.9c0.7-0.1,1.3-0.4,2-0.7c-0.2,0.7-0.7,1.3-1.4,1.7c0.6-0.1,1.2-0.2,1.8-0.5C17.1,6,16.6,6.5,16,6.9z",
	    tumblr:
	      "M0,0v20h20V0H0z M11.6,17.5c-3.3,0-3.9-2.5-3.9-3.2V9.4h-2V6.8C7.4,6,8.6,4.4,9,2.5H11v4.3h2.7v2.6H11v4.3c0,0.8,0.4,1.3,1.2,1.3c0.5,0,0.9-0.2,1.3-0.5l0.8,1.8C14.3,16.3,13.5,17.5,11.6,17.5z",
	    playlist: {
	      closed: "M0,3 20,3 M0,10 20,10 M0,17 20,17",
	      opened: "M1.5,1.5 18.5,18.5 M10,10 10,10 M1.5,18.5 18.5,1.5 ",
	    },
	    volume: {
	      speaker: "M10,0 10,20 4,15 0,15 0,5 4,5z",
	      line_1: "M14,14.5c1.2-1.1,2-2.7,2-4.5s-0.8-3.4-2-4.5",
	      line_2: "M15,17.5c2.4-1.6,4-4.4,4-7.5s-1.6-5.9-4-7.5",
	      muted: "M14,7.5 19,12.5 M14,12.5 19,7.5",
	    },
	    download: "M1,10v9h18v-9 M10,0v13 M8,11h4l-2,3L8,11z",
	    buy: "M11,0v9 M9,7h4l-2,3L9,7z M0,5h3l2,8h13l1-5 M6,17c0-1.1,0.9-2,2-2s2,0.9,2,2s-0.9,2-2,2S6,18.1,6,17 M13,17c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2s-0.9,2-2,2C13.9,19,13,18.1,13,17",
	  },
	  rounded: {
	    playback: {
	      play: "M1.5,1.5 18.5,10 18.5,10 1.5,18.5z M18.5,10 18.5,10 18.5,10 18.5,10z",
	      pause:
	        "M1.5,1.5 2.5,1.5 2.5,18.5 1.5,18.5z M17.5,1.5 18.5,1.5 18.5,18.5 17.5,18.5z",
	    },
	    prev: {
	      stroke: "M1.5,1.5 1.5,18.5",
	      fill: "M20,2.1v15.9c0,1.6-1.6,2.5-3,1.8L2.1,11.8c-1.4-0.8-1.4-2.9,0-3.7L17,0.2C18.4-0.5,20,0.5,20,2.1z",
	    },
	    repeat: {
	      stroke: "M1.5,11 1.5,3.5 14,3.5 M18.5,9 18.5,16.5 6,16.5",
	      fill: "M7,18.8v-4.6c0-0.9-1-1.5-1.8-1.1l-4.6,2.3c-0.9,0.4-0.9,1.7,0,2.2l4.6,2.3C6,20.3,7,19.7,7,18.8z M13,1.2v4.6c0,0.9,1,1.5,1.8,1.1l4.6-2.3c0.9-0.4,0.9-1.7,0-2.2l-4.6-2.3C14-0.3,13,0.3,13,1.2z",
	    },
	    next: {
	      stroke: "M18.5,1.5 18.5,18.5",
	      fill: "M3,0.2l14.9,7.9c1.4,0.8,1.4,2.9,0,3.7L3,19.8c-1.4,0.7-3-0.3-3-1.8V2.1C0,0.5,1.6-0.5,3,0.2z",
	    },
	    shuffle: {
	      stroke: "M1.5,18.5 17,3 M1.5,1.5 6.5,6.5 M13.5,13.5 16,16",
	      fill: "M13.2,0h5.6C19.5,0,20,0.5,20,1.2v5.6c0,1.1-1.3,1.6-2.1,0.9l-5.6-5.6C11.6,1.3,12.1,0,13.2,0z M13.2,20h5.6c0.7,0,1.2-0.5,1.2-1.2v-5.6c0-1.1-1.3-1.6-2.1-0.9l-5.6,5.6C11.6,18.7,12.1,20,13.2,20z",
	    },
	    share: {
	      opened: {
	        fill: "M10,10 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0 M18.5,1.5 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0 M18.5,18.5 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0",
	        stroke: "M18.5,1.5 10,10 18.5,18.5 M1.5,1.5 10,10 1.5,18.5",
	      },
	      closed: {
	        fill: "M0,10 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0 M12,4 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0 M12,16 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0",
	        stroke: "M16,4 4,10 16,16 M4,10 4,10 4,10",
	      },
	    },
	    facebook:
	      "M17,0H3C1.3,0,0,1.3,0,3v14c0,1.7,1.3,3,3,3h5.8v-7.1H6.5V9.4h2.3V7c0-1.9,1.6-3.5,3.5-3.5h3.6V7h-3.6v2.4h3.6l-0.6,3.5h-3V20H17c1.7,0,3-1.3,3-3V3C20,1.3,18.7,0,17,0z",
	    twitter:
	      "M17,0H3C1.3,0,0,1.3,0,3v14c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3V3C20,1.3,18.7,0,17,0z M16,6.9c0,0.1,0,0.3,0,0.4c0,4.1-3.1,8.8-8.8,8.8c-1.7,0-3.3-0.5-4.7-1.4c0.2,0,0.5,0,0.7,0c1.4,0,2.7-0.5,3.8-1.3c-1.3,0-2.5-0.9-2.9-2.1c0.2,0,0.4,0.1,0.6,0.1c0.3,0,0.5,0,0.8-0.1c-1.4-0.3-2.5-1.6-2.5-3v0C3.5,8.4,4,8.6,4.5,8.6C3.1,7.7,2.7,5.9,3.5,4.5c1.6,1.9,3.9,3.1,6.3,3.2c0-0.2-0.1-0.5-0.1-0.7c0-0.9,0.4-1.7,1-2.2C12,3.6,14,3.6,15.1,4.9c0.7-0.1,1.3-0.4,2-0.7c-0.2,0.7-0.7,1.3-1.4,1.7c0.6-0.1,1.2-0.2,1.8-0.5C17.1,6,16.6,6.5,16,6.9z",
	    tumblr:
	      "M17,0H3C1.3,0,0,1.3,0,3v14c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3V3C20,1.3,18.7,0,17,0z M11.6,17.5c-3.3,0-3.9-2.5-3.9-3.2V9.4h-2V6.8C7.4,6,8.6,4.4,9,2.5H11v4.3h2.7v2.6H11v4.3c0,0.8,0.4,1.3,1.2,1.3c0.5,0,0.9-0.2,1.3-0.5l0.8,1.8C14.3,16.3,13.5,17.5,11.6,17.5z",
	    playlist: {
	      closed: "M2,3 18,3 M2,10 18,10 M2,17 18,17",
	      opened: "M2,2 18,18 M-2,10 -2,10 M2,18 18,2",
	    },
	    playlist: {
	      closed: "M0,3 20,3 M0,10 20,10 M0,17 20,17",
	      opened: "M1.5,1.5 18.5,18.5 M-2,10 -2,10 M1.5,18.5 18.5,1.5",
	    },
	    playlist: {
	      closed: "M2,3 18,3 M2,10 18,10 M2,17 18,17",
	      opened: "M2,2 18,18 M10,10 10,10 M2,18 18,2",
	    },
	    volume: {
	      speaker:
	        "M9.4,0.1C9-0.1,8.6,0,8.3,0.3L3.6,5H1C0.4,5,0,5.4,0,6v8c0,0.6,0.4,1,1,1h2.6l4.7,4.7C8.5,19.9,8.7,20,9,20  c0.1,0,0.3,0,0.4-0.1C9.8,19.8,10,19.4,10,19V1C10,0.6,9.8,0.2,9.4,0.1z",
	      line_1: "M14,14.5c1.2-1.1,2-2.7,2-4.5s-0.8-3.4-2-4.5",
	      line_2: "M15,17.5c2.4-1.6,4-4.4,4-7.5s-1.6-5.9-4-7.5",
	      muted: "M14,7.5 19,12.5 M14,12.5 19,7.5",
	    },
	    download: "M1,10v9h18v-9 M10,1v12 M8,11h4l-2,3L8,11z",
	    buy: "M11,1v7 M9,7h4l-2,3L9,7z M1,5h2l2,8h13l1-5 M6,17c0-1.1,0.9-2,2-2s2,0.9,2,2s-0.9,2-2,2S6,18.1,6,17 M13,17c0-1.1,0.9-2,2-2s2,0.9,2,2s-0.9,2-2,2S13,18.1,13,17",
	  },
	};
	
}

function tPlayer(options) {
	return new tPlayerClass(options);
}