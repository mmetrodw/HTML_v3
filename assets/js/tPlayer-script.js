var tPlayersCollection = [];

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
		this.settings = this.utils.deepObjectMerge(defaultPlayerSettings, options);
		this.playerContainerId = this.settings.container;
		this.playlist = JSON.parse(JSON.stringify(this.settings.playlist)); // Clone Palylist to variable
		this.volume = this.settings.volume;
		this.uiElements = [];
		// States
		this.playerState = {
			autoplay: false,
			isUserSeekingAudio: false,
			isUserAdjustingVolume: false,
			repeat: false,
			shuffle: false,
			isPlaylistDisplayed: false,
			isShareDisplayed: false,
			volumeToggle: false,
			isRadioInfoUpdateAllowed: false,
			isRadioInfoUpdatePending: false,
			isMobile: this.utils.isMobileDevice(),
			playlistScrollbarHideDelay: null
		};
		// Create Audio
		this.audio = new Audio();
		this.audio.preload = "metadata";
		this.audio.volume = 0;
		// Add to List of Players
		tPlayersCollection[this.playerContainerId] = this.audio;

		this.currentTrack = {
			index: 0,
			title: null,
			artist: null,
			cover: null
		};
		this.previousTrackIndex = 0;

		this.init();
		console.log(this)
	}


	validatePlayerConfig() {
		const playerContainerElement = document.getElementById(this.playerContainerId);

		// Check if the 'id' property is missing or invalid
		if (!this.playerContainerId) {
			console.error("tPlayer Error: Please enter a valid container name.");
			return false;
		}

		// Check if the 'wrapper' element associated with the given 'id' is missing
		if (!playerContainerElement) {
				console.error(`tPlayer Error: Element with id "${this.playerContainerId}" not found.`);
				return false;
		}

		this.uiElements.wrapper = playerContainerElement;

		// Check if the 'playlist' property is missing or not provided
		if (!Array.isArray(this.playlist) || this.playlist.length === 0) {
			console.error("tPlayer Error: Please, add a valid Playlist to tPlayer.");
			return false;
		}

		// Check for audio link for each playlist item and update properties
		for( const item of this.playlist) {
			if(item.audio === undefined || item.audio === "") {
				console.error("tPlayer Error: Not all tracks in the playlist have the audio property.");
				return false;
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
	}


	// Create Player Interface
	createPlayerInterface() {
		const { wrapper } = this.uiElements;
		const { rounded, skin } = this.settings;
		const { addClass } = this.utils;
		
		// Set button icons based on 'rounded' setting
		this.buttonIcons = rounded ? this.buttonIcons.rounded : this.buttonIcons.default;

		// Add classes to the wrapper
		addClass(wrapper, ["tp-wrapper", rounded ? "tp-rounded" : "", skin === "vertical" ? "tp-vertical" : ""]);

		// Generate HTML markup for the player interface
		let htmlMarkup = `
				<div class="tp-player-wrapper">
					${this.createCover()}
					${this.createControls()}
					${this.createSocialMedia()}
				</div>
				${this.createPlaylistWrapper()}
				${this.createErrorWrapper()}
		`;

		// Inject the generated HTML into the wrapper
		wrapper.innerHTML = htmlMarkup;
	}

	// Create the cover section
	createCover() {
		return `
		<div class="tp-cover-wrapper">
				<div class="tp-cover-loader"><span></span><span></span><span></span></div>
				<div class="tp-cover"><img class="tp-cover-image" src=""></div>
		</div>`;
	}


	// Create the control buttons (play, prev, next, shuffle, etc.)
	createControls() {
		const { playback, prev, repeat, next, shuffle, playlist, volume } = this.buttonIcons;
		const hasMultipleTracks = this.playlist.length > 1;

		let controlsMarkup = `
		<div class="tp-player-controls-wrapper">
			<div class="tp-player-header">
				<div class="tp-track-title"></div>
			</div>
			<div class="tp-player-controls">
				${this.createButton(playback.play, "tp-playback-button")}
				<div class="tp-audio-seekbar">
					<div class="tp-audio-buffer-progress"></div>
					<div class="tp-audio-playback-progress"></div>
					<div class="tp-current-time">00:00</div>
					<div class="tp-duration">00:00</div>
					<div class="tp-player-loader"><span></span><span></span><span></span></div>
				</div>
			`;
		// Add buttons only if there are multiple tracks
		if (hasMultipleTracks) {
			controlsMarkup += `
				${this.createButton(prev.stroke, "tp-prev-button")}
				${this.settings.showRepeatButton ? this.createButton(repeat.stroke, "tp-repeat-button") : ''}
				${this.createButton(next.stroke, "tp-next-button")}
				${this.settings.showShuffleButton ? this.createButton(shuffle.stroke, "tp-shuffle-button") : ''}
			`;
		}
		controlsMarkup += `
			</div>
			<div class="tp-player-footer">`;
			if (hasMultipleTracks) {
				controlsMarkup += `${this.createButton(playlist.closed, "tp-toggle-playlist-button")}`
			} else {
				if (this.playlist[0].buy) {
					controlsMarkup += `<a href=${this.playlist[0].buy} target="_blank" class="tp-playlist-track-buy tp-button"><svg viewBox="0 0 20 20"><path class="tp-stroke" d="${this.buttonIcons.buy}"></path></svg></a>`;
				}
				// Add download link if available
				if (this.playlist[0].download) {
					controlsMarkup += `<a href=${this.playlist[0].download} target="_blank" download class="tp-playlist-track-download tp-button"><svg viewBox="0 0 20 20"><path class="tp-stroke" d="${this.buttonIcons.download}"></path></svg></a>`;
				}
			}
			controlsMarkup +=`
				<div class="tp-volume-control-wrapper">
					<div class="tp-volume-button tp-button">
						<svg viewBox="0 0 20 20">
							<path class="tp-fill" d="${volume.speaker}"></path>
							<path class="tp-stroke" d="${volume.line_1}"></path>
							<path class="tp-stroke" d="${volume.line_2}"></path>
							<path class="tp-stroke" d="${volume.muted}"></path>
						</svg>
					</div>
					<div class="tp-volume-level-bar">
						<div class="tp-volume-level"></div>
					</div>
				</div>
			</div>
		</div>
		`;
		return controlsMarkup;
	}


	// Create a single button
	createButton(iconPath, cssClass) {
		return `<div class="${cssClass} tp-button"><svg viewBox="0 0 20 20"><path d="${iconPath}"></path></svg></div>`;
	}


	// Create social media buttons
	createSocialMedia() {
		const { facebook, twitter, tumblr } = this.buttonIcons;
		return `
		<div class="tp-social-media-wrapper">
			${this.createButton(facebook, "tp-facebook-button")}
			${this.createButton(twitter, "tp-twitter-button")}
			${this.createButton(tumblr, "tp-tumblr-button")}
		</div>`;
	}


	// Create the playlist wrapper
	createPlaylistWrapper() {
		if (this.playlist.length > 1) {
			return `
				<div class="tp-playlist-wrapper">
					<div class="tp-scrollbar-track">
						<div class="tp-scrollbar-thumb"></div>
					</div>
					<ul class="tp-playlist">${this.generatePlaylistHTML()}</ul>
				</div>`;
		}
		return '';
	}


	// Create the error message wrapper
	createErrorWrapper() {
		const { playlist } = this.buttonIcons;
		return `
		<div class="tp-error-wrapper">
			<div class="tp-error-message"></div>
			<div class="tp-error-close">
				<svg viewBox="0 0 20 20">
					<path class="tp-stroke" d="${playlist.opened}"></path>
				</svg>
			</div>
		</div>`;
	}


	// Generates the HTML for the playlist
	generatePlaylistHTML() {
		return this.playlist.map(track => {
			const trackName = track.title ? `<b>${track.artist}</b> - ${track.title}` : `<b>${track.artist}</b>`;
			const trackTitle = track.title ? `${track.artist} - ${track.title}` : track.artist;

			return `
				<div class="tp-playlist-item" title="${trackTitle}">
					<div class="tp-playlist-indicator"><span></span><span></span><span></span></div>
					<div class="tp-playlist-track">${trackName}</div>
					${track.buy ? `<a href="${track.buy}" target="_blank" class="tp-playlist-track-buy"><svg viewBox="0 0 20 20"><path d="${this.buttonIcons.buy}"/></svg></a>` : ''}
					${track.download ? `<a href="${track.download}" download target="_blank" class="tp-playlist-track-download"><svg viewBox="0 0 20 20"><path d="${this.buttonIcons.download}"/></svg></a>` : ''}
				</div>`;
		}).join("");
	}


	init() {
		// Validate Player Config
		this.validatePlayerConfig();
		// Create Player Interface
		this.createPlayerInterface();
	}

	/* UTILS */

	utils = {
		// Extend Object Deep
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
	};

	// Button Icons
	buttonIcons = {
		default: {
			playback: {
				play: "M0,0 10,5 10,15 0,20z M10,5 20,10 20,10 10,15z",
				pause: "M0,0 3,0 3,20 0,20z M17,0 20,0 20,20, 17,20z",
			},
			prev: {
				stroke: "M1.5,0 1.5,20",
				fill: "M20,0 20,20 1,10z"
			},
			repeat: {
				stroke: "M1.5,12 1.5,3.5 14,3.5 M18.5,8 18.5,16 6,16.5",
				fill: "M13,0 20,3.5 13,7z M7,13 7,20 0,16.5z"
			},
			next: {
				stroke: "M18.5,0 18.5,20",
				fill: "M0,0 19,10 0,20z"
			},
			shuffle: {
				stroke: "M1,19 17,3 M1,1 8,8 M12,12 17,17",
				fill: "M12,0 20,0 20,8z M20,12 20,20 12,20z"
			},
			share: {
				opened: {
					fill: "M10,10 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0 M18.5,1.5 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0 M18.5,18.5 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0",
					stroke: "M18.5,1.5 10,10 18.5,18.5 M1.5,1.5 10,10 1.5,18.5"
				},
				closed: {
					fill: "M0,10 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0 M12,4 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0 M12,16 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0",
					stroke: "M16,4 4,10 16,16 M4,10 4,10 4,10"
				}
			},
			facebook: "M0,0v20h8.8v-7.1H6.5V9.4h2.3V7c0-1.9,1.6-3.5,3.5-3.5h3.6V7h-3.6v2.4h3.6l-0.6,3.5h-3V20H20V0H0z",
			twitter: "M0,0v20h20V0H0z M16,6.9c0,0.1,0,0.3,0,0.4c0,4.1-3.1,8.8-8.8,8.8c-1.7,0-3.3-0.5-4.7-1.4c0.2,0,0.5,0,0.7,0c1.4,0,2.7-0.5,3.8-1.3c-1.3,0-2.5-0.9-2.9-2.1c0.2,0,0.4,0.1,0.6,0.1c0.3,0,0.5,0,0.8-0.1c-1.4-0.3-2.5-1.6-2.5-3v0C3.5,8.4,4,8.6,4.5,8.6C3.1,7.7,2.7,5.9,3.5,4.5c1.6,1.9,3.9,3.1,6.3,3.2c0-0.2-0.1-0.5-0.1-0.7c0-0.9,0.4-1.7,1-2.2C12,3.6,14,3.6,15.1,4.9c0.7-0.1,1.3-0.4,2-0.7c-0.2,0.7-0.7,1.3-1.4,1.7c0.6-0.1,1.2-0.2,1.8-0.5C17.1,6,16.6,6.5,16,6.9z",
			tumblr: "M0,0v20h20V0H0z M11.6,17.5c-3.3,0-3.9-2.5-3.9-3.2V9.4h-2V6.8C7.4,6,8.6,4.4,9,2.5H11v4.3h2.7v2.6H11v4.3c0,0.8,0.4,1.3,1.2,1.3c0.5,0,0.9-0.2,1.3-0.5l0.8,1.8C14.3,16.3,13.5,17.5,11.6,17.5z",
			playlist: {
				closed: "M0,3 20,3 M0,10 20,10 M0,17 20,17",
				opened: "M1.5,1.5 18.5,18.5 M10,10 10,10 M1.5,18.5 18.5,1.5 "
			},
			volume: {
				speaker: "M10,0 10,20 4,15 0,15 0,5 4,5z",
				line_1: "M14,14.5c1.2-1.1,2-2.7,2-4.5s-0.8-3.4-2-4.5",
				line_2: "M15,17.5c2.4-1.6,4-4.4,4-7.5s-1.6-5.9-4-7.5",
				muted: "M14,7.5 19,12.5 M14,12.5 19,7.5"
			},
			download: "M1,10v9h18v-9 M10,0v13 M8,11h4l-2,3L8,11z",
			buy: "M11,0v9 M9,7h4l-2,3L9,7z M0,5h3l2,8h13l1-5 M6,17c0-1.1,0.9-2,2-2s2,0.9,2,2s-0.9,2-2,2S6,18.1,6,17 M13,17c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2s-0.9,2-2,2C13.9,19,13,18.1,13,17"
		},
		rounded: {
			playback: {
				play: "M1.5,1.5 18.5,10 18.5,10 1.5,18.5z M18.5,10 18.5,10 18.5,10 18.5,10z",
				pause: "M1.5,1.5 2.5,1.5 2.5,18.5 1.5,18.5z M17.5,1.5 18.5,1.5 18.5,18.5 17.5,18.5z",
			},
			prev: {
				stroke: "M1.5,1.5 1.5,18.5",
				fill: "M20,2.1v15.9c0,1.6-1.6,2.5-3,1.8L2.1,11.8c-1.4-0.8-1.4-2.9,0-3.7L17,0.2C18.4-0.5,20,0.5,20,2.1z"
			},
			repeat: {
				stroke: "M1.5,11 1.5,3.5 14,3.5 M18.5,9 18.5,16.5 6,16.5",
				fill: "M7,18.8v-4.6c0-0.9-1-1.5-1.8-1.1l-4.6,2.3c-0.9,0.4-0.9,1.7,0,2.2l4.6,2.3C6,20.3,7,19.7,7,18.8z M13,1.2v4.6c0,0.9,1,1.5,1.8,1.1l4.6-2.3c0.9-0.4,0.9-1.7,0-2.2l-4.6-2.3C14-0.3,13,0.3,13,1.2z"
			},
			next: {
				stroke: "M18.5,1.5 18.5,18.5",
				fill: "M3,0.2l14.9,7.9c1.4,0.8,1.4,2.9,0,3.7L3,19.8c-1.4,0.7-3-0.3-3-1.8V2.1C0,0.5,1.6-0.5,3,0.2z"
			},
			shuffle: {
				stroke: "M1.5,18.5 17,3 M1.5,1.5 6.5,6.5 M13.5,13.5 16,16",
				fill: "M13.2,0h5.6C19.5,0,20,0.5,20,1.2v5.6c0,1.1-1.3,1.6-2.1,0.9l-5.6-5.6C11.6,1.3,12.1,0,13.2,0z M13.2,20h5.6c0.7,0,1.2-0.5,1.2-1.2v-5.6c0-1.1-1.3-1.6-2.1-0.9l-5.6,5.6C11.6,18.7,12.1,20,13.2,20z"
			},
			share: {
				opened: {
					fill: "M10,10 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0 M18.5,1.5 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0 M18.5,18.5 a 0,0 0 1,1 0,0 a0,0 0 1,1 -0,0",
					stroke: "M18.5,1.5 10,10 18.5,18.5 M1.5,1.5 10,10 1.5,18.5"
				},
				closed: {
					fill: "M0,10 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0 M12,4 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0 M12,16 a 4,4 0 1,1 8,0 a4,4 0 1,1 -8,0",
					stroke: "M16,4 4,10 16,16 M4,10 4,10 4,10"
				}
			},
			facebook:  "M17,0H3C1.3,0,0,1.3,0,3v14c0,1.7,1.3,3,3,3h5.8v-7.1H6.5V9.4h2.3V7c0-1.9,1.6-3.5,3.5-3.5h3.6V7h-3.6v2.4h3.6l-0.6,3.5h-3V20H17c1.7,0,3-1.3,3-3V3C20,1.3,18.7,0,17,0z",
			twitter: "M17,0H3C1.3,0,0,1.3,0,3v14c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3V3C20,1.3,18.7,0,17,0z M16,6.9c0,0.1,0,0.3,0,0.4c0,4.1-3.1,8.8-8.8,8.8c-1.7,0-3.3-0.5-4.7-1.4c0.2,0,0.5,0,0.7,0c1.4,0,2.7-0.5,3.8-1.3c-1.3,0-2.5-0.9-2.9-2.1c0.2,0,0.4,0.1,0.6,0.1c0.3,0,0.5,0,0.8-0.1c-1.4-0.3-2.5-1.6-2.5-3v0C3.5,8.4,4,8.6,4.5,8.6C3.1,7.7,2.7,5.9,3.5,4.5c1.6,1.9,3.9,3.1,6.3,3.2c0-0.2-0.1-0.5-0.1-0.7c0-0.9,0.4-1.7,1-2.2C12,3.6,14,3.6,15.1,4.9c0.7-0.1,1.3-0.4,2-0.7c-0.2,0.7-0.7,1.3-1.4,1.7c0.6-0.1,1.2-0.2,1.8-0.5C17.1,6,16.6,6.5,16,6.9z",
			tumblr: "M17,0H3C1.3,0,0,1.3,0,3v14c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3V3C20,1.3,18.7,0,17,0z M11.6,17.5c-3.3,0-3.9-2.5-3.9-3.2V9.4h-2V6.8C7.4,6,8.6,4.4,9,2.5H11v4.3h2.7v2.6H11v4.3c0,0.8,0.4,1.3,1.2,1.3c0.5,0,0.9-0.2,1.3-0.5l0.8,1.8C14.3,16.3,13.5,17.5,11.6,17.5z",
			playlist: {
				closed: "M2,3 18,3 M2,10 18,10 M2,17 18,17",
				opened: "M2,2 18,18 M-2,10 -2,10 M2,18 18,2"
			},
			playlist: {
				closed: "M0,3 20,3 M0,10 20,10 M0,17 20,17",
				opened: "M1.5,1.5 18.5,18.5 M-2,10 -2,10 M1.5,18.5 18.5,1.5"
			},
			playlist: {
				closed: "M2,3 18,3 M2,10 18,10 M2,17 18,17",
				opened: "M2,2 18,18 M10,10 10,10 M2,18 18,2"
			},
			volume: {
				speaker: "M9.4,0.1C9-0.1,8.6,0,8.3,0.3L3.6,5H1C0.4,5,0,5.4,0,6v8c0,0.6,0.4,1,1,1h2.6l4.7,4.7C8.5,19.9,8.7,20,9,20  c0.1,0,0.3,0,0.4-0.1C9.8,19.8,10,19.4,10,19V1C10,0.6,9.8,0.2,9.4,0.1z",
				line_1: "M14,14.5c1.2-1.1,2-2.7,2-4.5s-0.8-3.4-2-4.5",
				line_2: "M15,17.5c2.4-1.6,4-4.4,4-7.5s-1.6-5.9-4-7.5",
				muted: "M14,7.5 19,12.5 M14,12.5 19,7.5"
			},
			download: "M1,10v9h18v-9 M10,1v12 M8,11h4l-2,3L8,11z",
			buy: "M11,1v7 M9,7h4l-2,3L9,7z M1,5h2l2,8h13l1-5 M6,17c0-1.1,0.9-2,2-2s2,0.9,2,2s-0.9,2-2,2S6,18.1,6,17 M13,17c0-1.1,0.9-2,2-2s2,0.9,2,2s-0.9,2-2,2S13,18.1,13,17"
		}
	};
}

// Migration From Old Version

function tPlayer(userOptions) {
	return new tPlayerClass(userOptions);
}
