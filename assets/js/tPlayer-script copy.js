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
	}

	validatePlayerConfig() {
		const playerContainerElement = document.getElementById(this.playerContainerId);
		// Check if the 'id' property is missing or invalid
		if (!this.playerContainerId) {
			alert("tPlayer Error: Please enter a valid container name.");
			return false;
		}
		// Check if the 'wrapper' element associated with the given 'id' is missing
		if (!playerContainerElement) {
			alert(`tPlayer Error: Element with id "${this.playerContainerId}" not found.`);
			return false;
		} else {
			this.uiElements.wrapper = playerContainerElement;
		}
		// Check if the 'playlist' property is missing or not provided
		if (!this.playlist) {
			alert("tPlayer Error: Please, add Playlist to tPlayer.");
			return false;
		} else {
			// Check Playlist and update items if necessary
			this.playlist.forEach((item, index) => {
				// Update artist if Album Artist is set
				if (this.settings.album.artist) {
					this.playlist[index].artist = this.settings.album.artist;
				}
				// Update cover if Album Cover is set and cover usage is enabled
				if (this.settings.album.cover && this.settings.album.cover != "" && this.settings.showCover) {
					this.playlist[index].cover = this.settings.album.cover;
				}
			});
		}
	}

	// Create Player Interface
	createPlayerInterface() {
		const { wrapper } = this.uiElements;
		const { rounded, skin } = this.settings;
		const { addClass } = this.utils;
		// Set button icons based on 'rounded' setting
		// If 'rounded' is true, use rounded icons; otherwise, use default icons
		this.buttonIcons = rounded ? this.buttonIcons.rounded : this.buttonIcons.default;
		const { playback, prev, repeat, next, shuffle, share, facebook, twitter, tumblr, playlist, volume } = this.buttonIcons;

		addClass(wrapper, ["tp-wrapper", rounded ? "tp-rounded" : "", skin === "vertical" ? "tp-vertical" : ""]);

		wrapper.innerHTML = `
		<div class="tp-player-wrapper">
			<div class="tp-cover-wrapper">
				<div class="tp-cover-loader"><span></span><span></span><span></span></div>
				<div class="tp-cover"><img class="tp-cover-image" src=""></div>
			</div>
			<div class="tp-player-controls-wrapper">
				<div class="tp-player-header">
					<div class="tp-track-title"></div>
				</div>
				<div class="tp-player-controls">
					<div class="tp-playback-button tp-button"><svg viewBox="0 0 20 20"><path d="${playback.play}"></path></svg></div>
					<div class="tp-audio-seekbar">
						<div class="tp-audio-buffer-progress"></div>
						<div class="tp-audio-playback-progress"></div>
						<div class="tp-current-time">00:00</div>
						<div class="tp-duration">00:00</div>
						<div class="tp-player-loader"><span></span><span></span><span></span></div>
					</div>
					<div class="tp-prev-button tp-button"><svg viewBox="0 0 20 20"><path class="tp-stroke" d="${prev.stroke}"></path><path class="tp-fill" d="${prev.fill}"></path></svg></div>
					<div class="tp-repeat-button tp-button"><svg viewBox="0 0 20 20"><path class="tp-fill" d="${repeat.fill}"></path><path class="tp-stroke" d="${repeat.stroke}"></path></div>
					<div class="tp-next-button tp-button"><svg viewBox="0 0 20 20"><path class="tp-fill" d="${next.fill}"></path><path class="tp-stroke" d="${next.stroke}"></path></div>
					<div class="tp-shuffle-button tp-button"><svg viewBox="0 0 20 20"><path class="tp-fill" d="${shuffle.fill}"></path><path class="tp-stroke" d="${shuffle.stroke}"></path></svg></div>
					<div class="tp-share-button tp-button"><svg viewBox="0 0 20 20"><path class="tp-fill" d="${share.closed.fill}"></path><path class="tp-stroke" d="${share.closed.stroke}"></path></svg></div>
				</div>
				<div class="tp-player-footer">
					<div class="tp-toggle-playlist-button tp-button"><svg viewBox="0 0 20 20"><path class="tp-stroke" d="${playlist.closed}"></path></svg></div>
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
			<div class="tp-social-media-wrapper">
				<div class="tp-facebook-button tp-button"><svg viewBox="0 0 20 20"><path class="tp-fill" d="${facebook}"></path></div>
				<div class="tp-twitter-button tp-button"><svg viewBox="0 0 20 20"><path class="tp-fill" d="${twitter}"></path></div>
				<div class="tp-tumblr-button tp-button"><svg viewBox="0 0 20 20"><path class="tp-fill" d="${tumblr}"></path></div>
			</div>
		</div>
		<div class="tp-playlist-wrapper">
			<div class="tp-scrollbar-track">
				<div class="tp-scrollbar-thumb"></div>
			</div>
			<ul class="tp-playlist">${this.generatePlaylistHTML()}</ul>
		</div>
		<div class="tp-error-wrapper"><div class="tp-error-message"></div><div class="tp-error-close"><svg viewBox="0 0 20 20"><path class="tp-stroke" d="${playlist.opened}"></path></svg></div></div>
		`;
	}

	applyPlayerStyles() {
		let playerCSS = '', documentHead = document.head || document.getElementsByTagName('head')[0], playerStyleElement = document.getElementById('tp-styles');

		// Create Styles
		if (!playerStyleElement) {
			playerStyleElement = document.createElement('style');
			playerStyleElement.id = 'tp-styles';
			documentHead.appendChild(playerStyleElement);
			playerStyleElement.setAttribute('type', 'text/css');
		}

		/* Player CSS  Style */
		let playerStyle = [{
			selector: ".tp-player-wrapper",
			properties: {
				background: this.settings.style.player.background
			}
		}, {
			selector: ".tp-cover-wrapper",
			properties: {
				background: this.settings.style.player.cover.background
			}
		}, {
			selector: ".tp-cover-loader span",
			properties: {
				background: this.settings.style.player.cover.loader
			}
		}, {
			selector: ".tp-player-header",
			properties: {
				color: this.settings.style.player.tracktitle
			}
		}, {
			selector: ".tp-button::before",
			properties: {
				background: this.settings.style.player.buttons.wave
			}
		}, {
			selector: [".tp-playback-button path", ".tp-button .tp-stroke"],
			properties: {
				stroke: this.settings.style.player.buttons.normal
			}
		}, {
			selector: [".tp-playback-button path", ".tp-playback-button path", ".tp-button .tp-fill"],
			properties: {
				fill: this.settings.style.player.buttons.normal
			}
		}, {
			selector: [".tp-playback-button:hover path", ".tp-button:hover .tp-stroke"],
			properties: {
				stroke: this.settings.style.player.buttons.hover
			}
		}, {
			selector: [".tp-playback-button:hover path", ".tp-playback-button:hover path", ".tp-button:hover .tp-fill"],
			properties: {
				fill: this.settings.style.player.buttons.hover
			}
		}, {
			selector: [".tp-playback-button.tp-active path", ".tp-button.tp-active .tp-stroke", ".tp-playback-button.tp-active path", ".tp-button.tp-active .tp-stroke"],
			properties: {
				stroke: this.settings.style.player.buttons.active
			}
		}, {
			selector: [".tp-playback-button.tp-active path", ".tp-playback-button.tp-active path", ".tp-button.tp-active .tp-fill", ".tp-playback-button:active path", ".tp-playback-button:active path", ".tp-button:active .tp-fill"],
			properties: {
				fill: this.settings.style.player.buttons.hover
			}
		}, {
			selector: ".tp-audio-seekbar",
			properties: {
				background: this.settings.style.player.seekbar
			}
		}, {
			selector: ".tp-audio-buffer-progress",
			properties: {
				background: this.settings.style.player.buffered
			}
		}, {
			selector: [".tp-audio-playback-progress", ".tp-equalizer-wrapper"],
			properties: {
				background: this.settings.style.player.progress
			}
		}, {
			selector: [".tp-current-time", ".tp-duration"],
			properties: {
				color: this.settings.style.player.timestamps
			}
		}, {
			selector: ".tp-player-loader",
			properties: {
				background: this.settings.style.player.loader.background
			}
		}, {
			selector: ".tp-player-loader span",
			properties: {
				background: this.settings.style.player.loader.color
			}
		}, {
			selector: ".tp-volume-level-bar",
			properties: {
				background: this.settings.style.player.volume.levelbar
			}
		}, {
			selector: ".tp-volume-level",
			properties: {
				background: this.settings.style.player.volume.level
			}
		}, {
			selector: ".tp-playlist-wrapper",
			properties: {
				background: this.settings.style.playlist.background
			}
		}, {
			selector: ".tp-scrollbar-track",
			properties: {
				background: this.settings.style.playlist.scrollbar.track
			}
		}, {
			selector: ".tp-scrollbar-thumb",
			properties: {
				background: this.settings.style.playlist.scrollbar.thumb
			}
		}, {
			selector: ".tp-playlist-item",
			properties: {
				background: this.settings.style.playlist.background,
				color: this.settings.style.playlist.color,
				borderBottomColor: this.settings.style.playlist.separator
			}
		}, {
			selector: ".tp-playlist-item:hover",
			properties: {
				background: this.settings.style.playlist.hover.background,
				color: this.settings.style.playlist.hover.color,
				borderBottomColor: this.settings.style.playlist.hover.separator
			}
		}, {
			selector: ".tp-playlist-item.tp-active",
			properties: {
				background: this.settings.style.playlist.active.background,
				color: this.settings.style.playlist.active.color,
				borderBottomColor: this.settings.style.playlist.active.separator
			}
		}, {
			selector: ".tp-playlist-item .tp-playlist-indicator span",
			properties: {
				background: this.settings.style.playlist.color
			}
		}, {
			selector: ".tp-playlist-item:hover .tp-playlist-indicator span",
			properties: {
				background: this.settings.style.playlist.hover.color
			}
		}, {
			selector: ".tp-playlist-item.tp-active .tp-playlist-indicator span",
			properties: {
				background: this.settings.style.playlist.active.color
			}
		}, {
			selector: [".tp-playlist-item .tp-playlist-track-download", ".tp-playlist-item .tp-playlist-track-buy"],
			properties: {
				stroke: this.settings.style.playlist.color
			}
		}, {
			selector: [".tp-playlist-item:hover .tp-playlist-track-download", ".tp-playlist-item:hover .tp-playlist-track-buy"],
			properties: {
				stroke: this.settings.style.playlist.hover.color
			}
		}, {
			selector: [".tp-playlist-item.tp-active .tp-playlist-track-download", ".tp-playlist-item.tp-active .tp-playlist-track-buy"],
			properties: {
				stroke: this.settings.style.playlist.active.color
			}
		}];

		// Generate Styles
		playerStyle.forEach((item) => {
			let cssSelector = [];

			// Check if the selector is an array
			if (Array.isArray(item.selector)) {
				// If the selector is an array, iterate through each selector
				item.selector.forEach((name, index) => {
					// Prepend the component's ID to each selector to scope it
					cssSelector[index] = '#' + this.playerContainerId + ' ' + item.selector[index];
				});
			} else {
				// If the selector is not an array, simply prepend the component's ID
				cssSelector = '#' + this.playerContainerId + ' ' + item.selector;
			}

			// Start the CSS rule with the selector(s)
			playerCSS += cssSelector + ' {\n';

			// Iterate over the properties in the item
			for (var property in item.properties) {
				if (item.properties.hasOwnProperty(property)) {
					// Convert camelCase to kebab-case for CSS properties
					playerCSS += property.replace(/[A-Z]/g, function(m) {
						return "-" + m.toLowerCase();
					}) + ': ' + item.properties[property] + ';\n';
				}
			}

			// Close the CSS rule
			playerCSS += '}\n';
		});

		// Add Styles
		playerStyleElement.appendChild(document.createTextNode(playerCSS));
	}

	// Generates the HTML for the playlist
	generatePlaylistHTML() {
		return this.playlist.map(track => {
			// Determine the track name to display, including artist and title if available
			const trackName = track.title ? `<b>${track.artist}</b> - ${track.title}` : `<b>${track.artist}</b>`;
			// Determine the full track title for the tooltip, including artist and title if available
			const trackTitle = track.title ? `${track.artist} - ${track.title}` : track.artist;

			// Generate the HTML for each playlist item
			return `
				<div class="tp-playlist-item" title="${trackTitle}">
					<div class="tp-playlist-indicator"><span></span><span></span><span></span></div>
					<div class="tp-playlist-track">${trackName}</div>
					${track.buy ? `<a href="${track.buy}" target="_blank" class="tp-playlist-track-buy"><svg viewBox="0 0 20 20"><path d="${this.buttonIcons.buy}"/></svg></a>` : ''}
					${track.download ? `<a href="${track.download}" download target="_blank" class="tp-playlist-track-download"><svg viewBox="0 0 20 20"><path d="${this.buttonIcons.download}"/></svg></a>` : ''}
				</div>
			`;
		}).join("");
	}
	
	// Initializes the player controls by querying and storing UI elements.
	initializePlayerControls() {
		const query = selector => this.uiElements.wrapper.querySelector(selector);
		this.uiElements.trackTitle = query(".tp-track-title");
		this.uiElements.coverWrapper = query(".tp-cover-wrapper");
		this.uiElements.errorWrapper = query(".tp-error-wrapper");
		this.uiElements.errorMessage = query(".tp-error-message");
		this.uiElements.errorClose = query(".tp-error-close");
		this.uiElements.coverImage = query(".tp-cover-image");
		this.uiElements.playbackButton = query(".tp-playback-button");
		this.uiElements.audioSeekBar = query('.tp-audio-seekbar');
		this.uiElements.audioBufferedProgress = query('.tp-audio-buffer-progress');
		this.uiElements.audioPlaybackProgress = query('.tp-audio-playback-progress');
		this.uiElements.currentTime = query('.tp-current-time');
		this.uiElements.duration = query('.tp-duration');
		this.uiElements.prevButton = query(".tp-prev-button");
		this.uiElements.repeatButton = query(".tp-repeat-button");
		this.uiElements.nextButton = query(".tp-next-button");
		this.uiElements.shuffleButton = query(".tp-shuffle-button");
		this.uiElements.shareButton = query(".tp-share-button");
		this.uiElements.facebookButton = query(".tp-facebook-button");
		this.uiElements.twitterButton = query(".tp-twitter-button");
		this.uiElements.tumblrButton = query(".tp-tumblr-button");
		this.uiElements.togglePlaylistButton = query(".tp-toggle-playlist-button");
		this.uiElements.volumeButton = query(".tp-volume-button");
		this.uiElements.volumeLevelBar = query(".tp-volume-level-bar");
		this.uiElements.volumeLevel = query(".tp-volume-level");
		this.uiElements.playlistWrapper = query(".tp-playlist-wrapper");
		this.uiElements.scrollbarTrack = query(".tp-scrollbar-track");
		this.uiElements.scrollbarThumb = query(".tp-scrollbar-thumb");
		this.uiElements.playlist = query(".tp-playlist");
		this.uiElements.playlistItem = this.uiElements.wrapper.querySelectorAll(".tp-playlist-item");
	}

	// Applies user-defined settings to the player interface.
	applyUserDefinedSettings() {
		// Hide cover if the setting is disabled
		if(!this.settings.showCover) {
			this.utils.addClass(this.uiElements.wrapper, "tp-no-cover");
		}

		// Enable playlist scroll if allowed and the number of tracks exceeds the maximum visible tracks
		if (this.settings.allowPlaylistScroll && this.playlist.length > this.settings.maxVisibleTracks) {
			this.utils.addClass(this.uiElements.wrapper, "tp-scrollable");
			this.uiElements.playlist.style.height = `${40 * this.settings.maxVisibleTracks}px`;
		}

		// Handle the case where there is only one track in the playlist
		if(this.playlist.length === 1) {
			// Hide repeat, shuffle, next, and previous buttons
			const buttonsArray = [this.uiElements.togglePlaylistButton, this.uiElements.shuffleButton, this.uiElements.nextButton, this.uiElements.prevButton];
			buttonsArray.forEach(element => element.style.display = "none");

			// Function to generate download or buy link HTML
			const generatePlaylistHTMLLink = (icon, url, classList, download = false) => {
				let $link = document.createElement("a");
				$link.classList.add(...classList);
				$link.setAttribute("href", url);
				$link.setAttribute("target", "_blank");
				if(download) {
					$link.setAttribute("download", "");
				}
				$link.innerHTML = `<svg viewBox="0 0 20 20"><path class="tp-stroke" d="${icon}"/></svg></a>`;
				return $link;
			}
			// Add buy link if available
			if (this.playlist[0].buy) {
				const buyLink = generatePlaylistHTMLLink(this.buttonIcons.buy, this.playlist[0].buy, ["tp-playlist-track-buy", "tp-button"]);
				this.uiElements.togglePlaylistButton.insertAdjacentElement("afterend", buyLink);
			}
			// Add download link if available
			if (this.playlist[0].download) {
				const downloadLink = generatePlaylistHTMLLink(this.buttonIcons.download, this.playlist[0].download, ["tp-playlist-track-download", "tp-button"], true);
				this.uiElements.togglePlaylistButton.insertAdjacentElement("afterend", downloadLink);
			}
		}

		// Show playlist if the setting is enabled
		if(this.settings.showPlaylist) {
			this.togglePlaylist();
		}

		// Hide repeat button if the setting is disabled
		if(!this.settings.showRepeatButton) {
			this.uiElements.repeatButton.style.display = "none";
		}

		// Hide shuffle button if the setting is disabled
		if(!this.settings.showShuffleButton) {
			this.uiElements.shuffleButton.style.display = "none";
		}

		// Hide share button if the setting is disabled
		if(!this.settings.showShareButton) {
			this.uiElements.shareButton.style.display = "none";
		}

		// Hide volume controls if the device is a mobile phone
		if (this.playerState.isMobile) {
			[this.uiElements.volumeButton, this.uiElements.volumeLevelBar].forEach(element => element.style.display = "none");
		}
	}

	// Sets up event listeners for the audio player
	setupEventListeners() {
		/// List of audio events to listen for
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
				console.warn(`No handler found for event: ${event}`);
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
		prevButton.addEventListener('click', this.prevTrack.bind(this));
		nextButton.addEventListener('click', this.nextTrack.bind(this));
		volumeButton.addEventListener('click', this.volumeToggle.bind(this));
		repeatButton.addEventListener('click', this.repeatToggle.bind(this));
		shuffleButton.addEventListener('click', this.shuffleToggle.bind(this));
		shareButton.addEventListener('click', this.shareToggle.bind(this));;
		facebookButton.addEventListener('click', this.shareFacebook.bind(this));
		twitterButton.addEventListener('click', this.shareTwitter.bind(this));
		tumblrButton.addEventListener('click', this.shareTumblr.bind(this));
		togglePlaylistButton.addEventListener('click', this.togglePlaylist.bind(this));
		coverImage.addEventListener('load', () => {
			coverImage.style.transform = 'scale(1)';
			coverImage.style.filter = 'blur(0px)';
			coverImage.style.opacity = 1;
			coverImage.style.transition = 'all 500ms var(--quickSlide)';
		})

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

		// Add event listeners for seeking audio
		if (this.playerState.isMobile) {
			audioSeekBar.addEventListener('touchstart', this.startAudioSeeking.bind(this), { passive: true });
		} else {
			audioSeekBar.addEventListener('mousedown', this.startAudioSeeking.bind(this), false);
			volumeLevelBar.addEventListener('mousedown', this.startVolumeAdjustment.bind(this), false);
		}

		// Add event listeners for scrollbar interactions
		playlistWrapper.addEventListener('mouseenter', this.showScrollbar.bind(this)); // Show scrollbar on mouse enter
		playlistWrapper.addEventListener('mouseleave', this.hideScrollbar.bind(this)); // Hide scrollbar on mouse leave
		playlist.addEventListener('scroll', this.updateScrollbarThumb.bind(this)); // Update scrollbar thumb position on scroll
		scrollbarTrack.addEventListener('wheel', event => { // Handle mouse wheel scrolling
			event.preventDefault();
			playlist.scrollTop += event.deltaY;
		}, { passive: false });
		scrollbarTrack.addEventListener('mousedown', this.scrollbarTrackSeekingStart.bind(this)); // Handle mouse down for scrollbar dragging

		// Add event listener for window resize
		window.addEventListener("resize", this.playerResize.bind(this));

		// Error Close
		this.uiElements.errorClose.addEventListener('click', () => {
			this.utils.removeClass(this.uiElements.wrapper, "tp-error");
		})
	}

	/* AUDIO EVENTS */
	
	abort() {
		// Set the seeking state to false
		this.isSeeking(false);
		// Disable radio info updates
		this.playerState.isRadioInfoUpdateAllowed = false;
	};

	canplay() {
		// Remove the loading class from the player UI
		this.utils.removeClass(this.uiElements.wrapper, 'tp-loading');
		// Set the seeking state to true
		this.isSeeking(true);
	};

	canplaythrough() {
		// Remove the loading class from the player UI
		this.utils.removeClass(this.uiElements.wrapper, 'tp-loading');
		// Set the seeking state to true
		this.isSeeking(true);

		// Start playback if autoplay is enabled
		if (this.playerState.autoplay) this.audio.play();
	};

	durationchange() {
		const { duration } = this.uiElements;

		// Update the duration display in the UI
		duration.textContent = this.utils.secondsToTimecode(this.audio.duration);
		// Show or hide the duration element based on whether the duration is not Infinity
		duration.style = this.audio.duration !== Infinity ? "block" : "none";
		// Set the seeking state to true
		this.isSeeking(true);
	};

	emptied() {
		// Set the seeking state to false
		this.isSeeking(false);
		// Disable radio info updates
		this.playerState.isRadioInfoUpdateAllowed = false;
	};

	// Ended
	ended() {
		// Play Next
		this.nextTrack();
	};

	error() {
		// Set the seeking state to false
		this.isSeeking(false);

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
		// Remove the loading class from the player UI
		this.utils.removeClass(this.uiElements.wrapper, 'tp-loading');
		this.utils.addClass(this.uiElements.wrapper, 'tp-error');
		// Show the error message
		this.uiElements.errorMessage.textContent = "tPlayer Error: " + errorCode;
		console.log("tPlayer Error: " + errorCode);
		return false;
	};

	loadstart() {
		// Add the loading class for the player UI
		this.utils.addClass(this.uiElements.wrapper, 'tp-loading');
	};

	loadeddata() {
		// Set the seeking state to true
		this.isSeeking(true);
	};

	loadedmetadata() {
		const { duration } = this.uiElements;

		// Update the duration display in the UI
		duration.textContent = this.utils.secondsToTimecode(this.audio.duration);
		// Show or hide the duration element based on whether the duration is not Infinity
		duration.style = this.audio.duration !== Infinity ? "block" : "none";
		// Set the seeking state to true
		this.isSeeking(true);
	};

	pause() {
		const { playlistItem, playbackButton } = this.uiElements;
		const { removeClass } = this.utils;

		// Remove the 'playing' class from playlist items
		removeClass(playlistItem, 'tp-playing');
		// Remove the 'active' class from the playback button
		removeClass(playbackButton, 'tp-active');
		// Update the playback button icon to 'play' after a short delay
		setTimeout(() => {
			playbackButton.querySelector('path').setAttribute('d', this.buttonIcons.playback.play);
		}, 200);
		// Disable radio info updates
		this.playerState.isRadioInfoUpdateAllowed = false;
	}

	play() {
		const { playlistItem, playbackButton } = this.uiElements;
		const { addClass } = this.utils;

		// Pause all other players in the collection
		for (let player in tPlayersCollection) {
			if (player !== this.playerContainerId) {
				tPlayersCollection[player].pause();
			}
		}
		// Add the 'playing' class to the current playlist item
		addClass(playlistItem[this.currentTrack.index], 'tp-playing');
		// Add the 'active' class to the playback button
		addClass(playbackButton, 'tp-active');
		// Update the playback button icon to 'pause' after a short delay
		setTimeout(() => {
			playbackButton.querySelector('path').setAttribute('d', this.buttonIcons.playback.pause);
		}, 200);
		// Set the seeking state to true
		this.isSeeking(true);
		// Enable radio info updates
		this.playerState.isRadioInfoUpdateAllowed = true;
	};

	playing() {
		// Remove the loading class from the player UI
		this.utils.removeClass(this.uiElements.wrapper, 'tp-loading');
		// Set the seeking state to true
		this.isSeeking(true);
		// Enable radio info updates
		this.playerState.isRadioInfoUpdateAllowed = true;
	};

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
	};

	ratechange(){
		console.log("Rate Change");
	};

	seeked() {
		// Remove the loading class from the player UI
		this.utils.removeClass(this.uiElements.wrapper, 'tp-loading');
	};

	seeking() {
		// Add the loading class for the player UI
		this.utils.addClass(this.uiElements.wrapper, 'tp-loading');
	};

	stalled() {
		// Set the seeking state to false
		this.isSeeking(false);
		// Disable radio info updates
		this.playerState.isRadioInfoUpdateAllowed = false;
		// Log the stalled event
		console.log('Playback stalled at', this.audio.currentTime);
	};

	suspend() {
		// Disable radio info updates
		this.playerState.isRadioInfoUpdateAllowed = false;
	};

	timeupdate() {
		if (!this.playerState.isUserSeekingAudio) {
			// Set the current time of the track to match the audio's current time
			this.currentTrack.currentTime = this.audio.currentTime;
			// Calculate the percentage of the track that has been played
			const percent = (this.currentTrack.currentTime / this.audio.duration) * 100;
			// Update the width of the playback progress bar
			this.uiElements.audioPlaybackProgress.style.width = percent + '%';
			// Update the displayed current time in the player
			this.uiElements.currentTime.textContent = this.utils.secondsToTimecode(this.audio.currentTime);
			// Call the progress function to update the buffered progress bar
			this.progress();
		}
	};

	volumechange() {
		const paths = this.uiElements.volumeButton.children[0].children;
		this.volume = this.audio.volume !== 0 ? this.audio.volume : this.volume;
		this.uiElements.volumeLevel.style.width = `${this.audio.volume * 100}%`;

		// Update the visibility of volume level indicators
		paths[1].style.transform = this.audio.volume < 0.25 ? "scale(0)" : "scale(1)";
		paths[2].style.transform = this.audio.volume < 0.5 ? "scale(0)" : "scale(1)";
		paths[3].style.transform = this.audio.volume === 0 ? "scale(1)" : "scale(0)";

		// Update the mute state and button appearance
		if(this.audio.volume === 0) {
			this.playerState.isVolumeMuted = true;
			this.utils.addClass(this.uiElements.volumeButton, 'tp-active');
		} else {
			this.playerState.isVolumeMuted = false;
			this.utils.removeClass(this.uiElements.volumeButton, 'tp-active');
		}
	};

	waiting() {
		// Add the loading class for the player UI
		this.utils.addClass(this.uiElements.wrapper, 'tp-loading');
		// Set the seeking state to false
		this.isSeeking(false);
		// Disable radio info updates
		this.playerState.isRadioInfoUpdateAllowed = false;
	};


	/* PLAYER UI EVENTS */

	// Simulates a button click effect by adding and then removing a CSS class.
	simulateClickEffect(element) {
		// Add the "tp-click" class to the element
		this.utils.addClass(element, "tp-click");
		// Remove the "tp-click" class after 400 milliseconds
		setTimeout(() => {
			this.utils.removeClass(element, "tp-click");
		}, 600);
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
			this.utils.animatePathD(
				shareButton.querySelector('.tp-stroke'),
				this.buttonIcons.share.closed.stroke,
				this.buttonIcons.share.opened.stroke,
				250,
				'easeOutExpo'
			);
			this.utils.animatePathD(
				shareButton.querySelector('.tp-fill'),
				this.buttonIcons.share.closed.fill,
				this.buttonIcons.share.opened.fill,
				250,
				'easeOutExpo'
			);
		} else {
			// Animate the button icon to the "closed" state
			this.utils.animatePathD(
				shareButton.querySelector('.tp-stroke'),
				this.buttonIcons.share.opened.stroke,
				this.buttonIcons.share.closed.stroke,
				250,
				'easeOutExpo'
			);
			this.utils.animatePathD(
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

	// Toggles the display state of the playlist.
	togglePlaylist() {

		let playlistHeight = 0;
		const { togglePlaylistButton, playlistWrapper } = this.uiElements;
		const { maxVisibleTracks, allowPlaylistScroll } = this.settings;

		// Toggle the playlist display state
		this.playerState.isPlaylistDisplayed = !this.playerState.isPlaylistDisplayed;
		// Toggle the "tp-active" class on the toggle playlist button
		this.utils.toggleClass(togglePlaylistButton, "tp-active");
		// Simulate the click effect on the toggle playlist button
		this.simulateClickEffect(togglePlaylistButton);

		if (this.playerState.isPlaylistDisplayed && this.playlist.length > 1) {
			// Animate the button icon to the "opened" state
			this.utils.animatePathD(
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
			this.utils.animatePathD(
				this.uiElements.togglePlaylistButton.querySelector('path'),
				this.buttonIcons.playlist.opened,
				this.buttonIcons.playlist.closed,
				250,
				'easeOutExpo'
			);
		}

		// Set the height of the playlist wrapper
		playlistWrapper.style.height = `${playlistHeight}px`;
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

	// Initiates the audio seeking process.
	startAudioSeeking(event) {
		event.preventDefault();

		// Check if the event is from a non-primary mouse button on non-mobile devices
		if(!this.playerState.isMobile && event.button !== 0) return false;
		// Set the user seeking state to true
		this.playerState.isUserSeekingAudio = true;
		// Update the audio seek position based on the event
		this.updateAudioSeekPosition(event); // If No MouseMove, Set Value From Start
		// Determine the appropriate pointer events based on the device type
		const pointerMoveEvent = this.playerState.isMobile ? 'touchmove' : 'mousemove';
		const pointerUpEvent = this.playerState.isMobile ? 'touchend' : 'mouseup';

		// Add event listeners for pointer movements and pointer release
		document.addEventListener(pointerMoveEvent, this.updateAudioSeekPosition.bind(this), false);
		document.addEventListener(pointerUpEvent, this.finalizeAudioSeeking.bind(this), false);

		// Remove transitions for smooth seeking
		this.uiElements.currentTime.style.transition = "";
		this.uiElements.duration.style.transition = "";
	}
	
	// Updates the audio seek position based on the user's input.
	updateAudioSeekPosition(event) {
		const { audioSeekBar, audioPlaybackProgress, currentTime, duration } = this.uiElements;

		// Return if the user is not seeking audio
		if(!this.playerState.isUserSeekingAudio) return;

		// Get the bounds of the seek bar
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
		currentTime.textContent = this.utils.secondsToTimecode(this.currentTrack.currentTime);

		// Calculate offsets for the current time and duration displays
		const currentTimeOffset = mousePosition - seekBarBounds.left - currentTime.offsetWidth - 5;
		const durationOffset = seekBarBounds.width - (mousePosition - seekBarBounds.left) - duration.offsetWidth - 5;

		// Adjust the position of the current time and duration displays
		if(percent !== 0 && percent !== 1) {
			currentTime.style.left = `${currentTimeOffset}px`;
			duration.style.right = `${durationOffset}px`;
		}
	}

	// Finalizes the audio seeking process.
	finalizeAudioSeeking() {
		const { currentTime, duration } = this.uiElements;

		// Set the user seeking state to false
		this.playerState.isUserSeekingAudio = false;

		// Determine the appropriate pointer events based on the device type
		const moveEvent = this.playerState.isMobile ? 'touchmove' : 'mousemove';
		const upEvent = this.playerState.isMobile ? 'touchend' : 'mouseup';

		// Remove event listeners for pointer movements and pointer release
		document.removeEventListener(moveEvent, this.updateAudioSeekPosition.bind(this), false);
		document.removeEventListener(upEvent, this.finalizeAudioSeeking.bind(this), false);

		// Update the audio current time to match the current track time
		this.audio.currentTime = this.currentTrack.currentTime;

		// Add transitions for smooth UI updates
		Object.assign(currentTime.style, {
				transition: "all 250ms var(--easeOutExpo)",
				left: "5px"
		});

		Object.assign(duration.style, {
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
		this.updateVolumeAdjustment(event); // If No MouseMove, Set Value From Start

		// Add event listeners for pointer movements and pointer release
		document.addEventListener('mousemove', this.updateVolumeAdjustment.bind(this), false);
		document.addEventListener('mouseup', this.finalizeVolumeAdjustment.bind(this), false);
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

		// Remove event listeners for pointer movements and pointer release
		document.removeEventListener('mousemove', this.updateVolumeAdjustment.bind(this), false);
		document.removeEventListener('mouseup', this.finalizeVolumeAdjustment.bind(this), false);
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
		// Add the class to show the scrollbar
		this.utils.addClass(this.uiElements.playlistWrapper, 'tp-playlist-hovered');
		// Clear any existing timeout for hiding the scrollbar
		clearTimeout(this.playerState.playlistScrollbarHideDelay);
	}

	// Hides the scrollbar by removing a class from the playlist wrapper after a delay.
	hideScrollbar() {
		// Set a timeout to remove the class and hide the scrollbar
		this.playerState.playlistScrollbarHideDelay = setTimeout(() => {
			this.utils.removeClass(this.uiElements.playlistWrapper, 'tp-playlist-hovered')
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

	/* PLAYER FUNCTION */

	// Sets the pointer events for the audio seek bar based on the seeking state.
	isSeeking(state) {
		this.uiElements.audioSeekBar.style.pointerEvents = state && this.audio.duration !== Infinity ? "all" : "none";
	}

	// Switches to the next track in the playlist.
	switchTrack() {
		let scrollDistance = 0;

		const { audioBufferedProgress, audioPlaybackProgress, playlistItem, playlist, trackTitle, wrapper, coverImage } = this.uiElements;
		const { allowPlaylistScroll, maxVisibleTracks, showCover } = this.settings;
		const { addClass, removeClass } = this.utils;
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
		this.audio.volume = this.playerState.isVolumeMuted ? 0 : this.volume;

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
	}

	// Updates the radio information by fetching new data from the server.
	async updateRadioInfo() {
		const { index: currentIndex, artist: currentArtist, title: currentTitle, cover: currentCover } = this.currentTrack;
		const { showCover, autoUpdateRadioCovers, pluginDirectoryPath } = this.settings;

		// Return if radio info update is not allowed or already pending
		if (!this.playerState.isRadioInfoUpdateAllowed || this.playerState.isRadioInfoUpdatePending) return;

		// Get the audio URL of the current track
		const audioUrl = this.playlist[currentIndex].audio;
		// Determine if covers should be updated based on settings
		const updateCovers = showCover && autoUpdateRadioCovers;

		// Prepare fetch parameters for the POST request
		const fetchParams = {
			method: 'POST',
			mode: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				url: audioUrl,
				cover: updateCovers
			})
		};

		// Set the radio info update state to pending
		this.playerState.isRadioInfoUpdatePending = true;

		try {
			// Fetch new radio information from the server
			const response = await fetch(`${pluginDirectoryPath}/assets/tp-radio-info.php`, fetchParams);
			const data = await response.json();

			// Reset the radio info update pending state
			this.playerState.isRadioInfoUpdatePending = false;

			// If the user changed the track, abort the update
			if (currentIndex !== this.currentTrack.index) return;

			if (data) {
				const { artist: fetchedArtist, title: fetchedTitle, cover: fetchedCover } = data;

				// Update track title if it has changed
				if (currentArtist !== fetchedArtist || currentTitle !== fetchedTitle) {
					// Animate the text change for artist and title
					this.animateTextChange(
						{ artist: currentArtist, title: currentTitle },
						{ artist: fetchedArtist, title: fetchedTitle }
					);

					// Update the current track's artist and title
					this.currentTrack.artist = fetchedArtist;
					this.currentTrack.title = fetchedTitle;

					// Update the track title attribute for the UI
					this.uiElements.trackTitle.setAttribute('title', `${fetchedArtist} - ${fetchedTitle}`);
				}

				if(showCover) {
					// Check if there is a new cover and it is different from the current cover
					if (fetchedCover && currentCover !== fetchedCover) {
						// Update the current track's cover to the new cover
						this.currentTrack.cover = fetchedCover;
						// Update the cover image source in the UI
						this.uiElements.coverImage.setAttribute('src', fetchedCover);
						// Remove the class that hides the cover
						this.utils.removeClass(this.uiElements.wrapper, "tp-no-cover");
					// Check if there is no new cover and no current cover
					} else if (!fetchedCover && !currentCover) {
						// Add the class that hides the cover
						this.utils.addClass(this.uiElements.wrapper, "tp-no-cover");
					}
				}
			}
		} catch (error) {
			// Log any errors to the console
			console.error("Error fetching radio info:", error);
			// Reset the radio info update pending state
			this.playerState.isRadioInfoUpdatePending = false;
		}
	}

	// Function to animate the text change for the track title and artist
	animateTextChange(previousTrack, currentTrack) {
		// Clear any existing animation interval to prevent multiple animations running simultaneously
		if (this.titleAnimationInterval) {
			clearInterval(this.titleAnimationInterval);
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
				clearInterval(this.titleAnimationInterval);
			}
		};

		// Set a new interval for the animation to update every 7 milliseconds
		this.titleAnimationInterval = setInterval(updateText, 7); // Interval for smooth animation
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

	// Adjusts the player layout based on the wrapper's width.
	playerResize() {
		// Check if the width of the wrapper element is less than 550 pixels
		if(this.uiElements.wrapper.clientWidth < 550) {
			// Add the 'tp-vertical' class to the wrapper element
			this.utils.addClass(this.uiElements.wrapper, 'tp-vertical');
		} else {
			// If the skin setting is not 'vertical', remove the 'tp-vertical' class
			if(this.settings.skin !== 'vertical') {
				this.utils.removeClass(this.uiElements.wrapper, 'tp-vertical');
			}
		}
	}

	init() {
		// Validate Player Config
		this.validatePlayerConfig();
		// Create Player Interface
		this.createPlayerInterface();
		// Apply Player Styles
		this.applyPlayerStyles();
		// Initialize Player Controls
		this.initializePlayerControls();
		// Apply User Defined Settings
		this.applyUserDefinedSettings();
		// Setup Event Listeners
		this.setupEventListeners();
		// Load And Prepare The Initial Track For Playback
		this.switchTrack();
		// Update The Position And Size Of The Scrollbar
		this.updateScrollbarThumb();
		// Adjust The Player Size To Fit It's Container Or Screen
		this.playerResize();
		// If Radio
		// If In Radio Mode And A Plugin Path Is Specified, Set Up Periodic Info Updates
		if(this.settings.isRadio && this.settings.pluginDirectoryPath) {
			setInterval(this.updateRadioInfo.bind(this), this.settings.updateRadioInterval);
		}
	}

	/* UTILITES */
	utils = {
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
			var toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
			return toMatch.some(function(toMatchItem) {
				return navigator.userAgent.match(toMatchItem);
			});
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
		},
		getShuffledPlaylistOrder: () => {
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
		},
		animatePathD: (pathElement, fromD, toD, duration = 1000, easing = 'linear', callback) => {
			let startTime = null;
		
			// Function to interpolate the 'd' attribute of the path element
			function interpolateD(from, to, progress) {
				// Split 'd' attribute values into commands and numbers
				const fromCommands = from.match(/[a-zA-Z]+|[-.\d]+/g);
				const toCommands = to.match(/[a-zA-Z]+|[-.\d]+/g);
		
				let result = '';
				let isNumber = false;
		
				// Iterate over each command/number pair
				for (let i = 0; i < fromCommands.length; i++) {
					if (isNaN(fromCommands[i])) {
						// If it's a command (e.g., M, L), append it to the result
						result += (isNumber ? ' ' : '') + fromCommands[i];
						isNumber = false; // The next value will be a number
					} else {
						// If it's a number, interpolate between 'from' and 'to' values
						const fromValue = parseFloat(fromCommands[i]);
						const toValue = parseFloat(toCommands[i]);
						const interpolatedValue = fromValue + (toValue - fromValue) * progress;
		
						// Determine decimal places based on progress (more precise during animation)
						result += (isNumber ? ',' : ' ') + interpolatedValue;
		
						isNumber = true; // The next value will be a number
					}
				}
		
				return result;
			}
		
			// Function to handle the animation frame
			const animate = (currentTime) => {
				if (!startTime) startTime = currentTime; // Initialize start time on first frame
				const elapsedTime = currentTime - startTime; // Calculate elapsed time
				const progress = Math.min(elapsedTime / duration, 1); // Normalize progress to a value between 0 and 1
		
				// Apply easing function to smooth the progress
				const easedProgress = this.utils.easingFunctions[easing](progress);
		
				// Update the 'd' attribute of the path element with interpolated values
				pathElement.setAttribute('d', interpolateD(fromD, toD, easedProgress));
		
				// Continue animating if progress is less than 1, otherwise call the callback function
				if (progress < 1) {
					requestAnimationFrame(animate); // Request next animation frame
				} else if (callback) {
					callback(); // Call the callback function when animation is complete
				}
			};
		
			requestAnimationFrame(animate); // Start the animation
		},
		easingFunctions: {
			linear: (time) => {
				return time;
			},
			easeInSine: (time) => {
				return -1 * Math.cos(time * (Math.PI / 2)) + 1;
			},
			easeOutSine: (time) => {
				return Math.sin(time * (Math.PI / 2));
			},
			easeInOutSine: (time) => {
				return -0.5 * (Math.cos(Math.PI * time) - 1);
			},
			easeInQuad: (time) => {
				return time * time;
			},
			easeOutQuad: (time) => {
				return time * (2 - time);
			},
			easeInOutQuad: (time) => {
				return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
			},
			easeInCubic: (time) => {
				return time * time * time;
			},
			easeOutCubic: (time) => {
				const time1 = time - 1;
				return time1 * time1 * time1 + 1;
			},
			easeInOutCubic: (time) => {
				return time < 0.5 ?
					4 * time * time * time :
					(time - 1) * (2 * time - 2) * (2 * time - 2) + 1;
			},
			easeInQuart: (time) => {
				return time * time * time * time;
			},
			easeOutQuart: (time) => {
				const time1 = time - 1;
				return 1 - time1 * time1 * time1 * time1;
			},
			easeInOutQuart: (time) => {
				const time1 = time - 1;
				return time < 0.5 ? 8 * time * time * time * time : 1 - 8 * time1 * time1 * time1 * time1;
			},
			easeInQuint: (time) => {
				return time * time * time * time * time;
			},
			easeOutQuint: (time) => {
				const time1 = time - 1;
				return 1 + time1 * time1 * time1 * time1 * time1;
			},
			easeInOutQuint: (time) => {
				const time1 = time - 1;
				return time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * time1 * time1 * time1 * time1 * time1;
			},
			easeInExpo: (time) => {
				if (time === 0) {
					return 0;
				}
				return Math.pow(2, 10 * (time - 1));
			},
			easeOutExpo: (time) => {
				if (time === 1) {
					return 1;
				}
				return (-Math.pow(2, -10 * time) + 1);
			},
			easeInOutExpo: (time) => {
				if (time === 0 || time === 1) {
					return time;
				}
		
				const scaledTime = time * 2;
				const scaledTime1 = scaledTime - 1;
		
				if (scaledTime < 1) {
					return 0.5 * Math.pow(2, 10 * (scaledTime1));
				}
		
				return 0.5 * (-Math.pow(2, -10 * scaledTime1) + 2);
			},
			easeInCirc: (time) => {
				const scaledTime = time / 1;
				return -1 * (Math.sqrt(1 - scaledTime * time) - 1);
			},
			easeOutCirc: (time) => {
				const time1 = time - 1;
				return Math.sqrt(1 - time1 * time1);
			},
			easeInOutCirc: (time) => {
				const scaledTime = time * 2;
				const scaledTime1 = scaledTime - 2;
		
				if (scaledTime < 1) {
					return -0.5 * (Math.sqrt(1 - scaledTime * scaledTime) - 1);
				}
		
				return 0.5 * (Math.sqrt(1 - scaledTime1 * scaledTime1) + 1);
			},
			easeInBack: (time, magnitude = 1.70158) => {
				return time * time * ((magnitude + 1) * time - magnitude);
			},
			easeOutBack: (time, magnitude = 1.70158) => {
				const scaledTime = time / 1 - 1;
				return (scaledTime * scaledTime * ((magnitude + 1) * scaledTime + magnitude)) + 1;
			},
			easeInOutBack: (time, magnitude = 1.70158) => {
				const scaledTime = time * 2;
				const scaledTime2 = scaledTime - 2;
				const s = magnitude * 1.525;
		
				if (scaledTime < 1) {
					return 0.5 * scaledTime * scaledTime * ((s + 1) * scaledTime - s);
				}
		
				return (0.5 * (scaledTime2 * scaledTime2 * ((s + 1) * scaledTime2 + s) + 2));
			},
			easeInElastic: (time, magnitude = 0.7) => {
				if (time === 0 || time === 1) {
					return time;
				}
		
				const scaledTime = time / 1;
				const scaledTime1 = scaledTime - 1;
				const p = 1 - magnitude;
				const s = p / (2 * Math.PI) * Math.asin(1);
		
				return -(Math.pow(2, 10 * scaledTime1) * Math.sin((scaledTime1 - s) * (2 * Math.PI) / p));
			},
			easeOutElastic: (time, magnitude = 0.7) => {
				if (time === 0 || time === 1) {
					return time;
				}
		
				const p = 1 - magnitude;
				const scaledTime = time * 2;
				const s = p / (2 * Math.PI) * Math.asin(1);
		
				return (Math.pow(2, -10 * scaledTime) * Math.sin((scaledTime - s) * (2 * Math.PI) / p)) + 1;
			},
			easeInOutElastic: (time, magnitude = 0.65) => {
				if (time === 0 || time === 1) {
					return time;
				}
		
				const p = 1 - magnitude;
				const scaledTime = time * 2;
				const scaledTime1 = scaledTime - 1;
				const s = p / (2 * Math.PI) * Math.asin(1);
		
				if (scaledTime < 1) {
					return -0.5 * (Math.pow(2, 10 * scaledTime1) * Math.sin((scaledTime1 - s) * (2 * Math.PI) / p));
				}
		
				return (Math.pow(2, -10 * scaledTime1) * Math.sin((scaledTime1 - s) * (2 * Math.PI) / p) * 0.5) + 1;
			},
			easeOutBounce: (time) => {
				const scaledTime = time / 1;
		
				if (scaledTime < (1 / 2.75)) {
					return 7.5625 * scaledTime * scaledTime;
				} else if (scaledTime < (2 / 2.75)) {
					const scaledTime2 = scaledTime - (1.5 / 2.75);
					return (7.5625 * scaledTime2 * scaledTime2) + 0.75;
				} else if (scaledTime < (2.5 / 2.75)) {
					const scaledTime2 = scaledTime - (2.25 / 2.75);
					return (7.5625 * scaledTime2 * scaledTime2) + 0.9375;
				} else {
					const scaledTime2 = scaledTime - (2.625 / 2.75);
					return (7.5625 * scaledTime2 * scaledTime2) + 0.984375;
				}
			},
			easeInBounce: (time) => {
				return 1 - this.utils.easingFunctions.easeOutBounce(1 - time);
			},
			easeInOutBounce: (time) => {
				if (time < 0.5) {
					return this.utils.easingFunctions.easeInBounce(time * 2) * 0.5;
				}
				return (this.utils.easingFunctions.easeOutBounce((time * 2) - 1) * 0.5) + 0.5;
			}
		}
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
	const settings = {
		container: userOptions.container,
		playlist: userOptions.playlist,
		album: {
			artist: userOptions.album?.artist ?? userOptions.albumArtist ?? null,
			cover: userOptions.album?.cover ?? userOptions.albumCover ?? null
		},
		skin: userOptions.skin ?? userOptions.options?.skin ?? "default",
		rounded: userOptions.rounded ?? userOptions.options?.rounded ?? false,
		showCover: userOptions.showCover ?? userOptions.options?.cover ?? true,
		showPlaylist: userOptions.showPlaylist ?? userOptions.options?.playlist ?? true,
		showRepeatButton: userOptions.showRepeatButton ?? userOptions.options?.repeat ?? true,
		showShuffleButton: userOptions.showShuffleButton ?? userOptions.options?.shuffle ?? true,
		showShareButton: userOptions.showShareButton ?? userOptions.options?.share ?? true,
		allowPlaylistScroll: userOptions.allowPlaylistScroll ?? (userOptions.options?.scrollAfter !== null),
		maxVisibleTracks: userOptions.maxVisibleTracks ?? userOptions.options?.scrollAfter ?? userOptions.options.scrollAfter > 0 ? userOptions.options.scrollAfter : 5,
		volume: userOptions.volume ?? userOptions.options?.volume ?? 1,
		isRadio: userOptions.isRadio ?? userOptions.options?.radio ?? false,
		pluginDirectoryPath: userOptions.pluginDirectoryPath ?? userOptions.options?.pluginPath ?? null,
		autoUpdateRadioCovers: userOptions.autoUpdateRadioCovers ?? userOptions.options?.coverUpdate ?? true,
		updateRadioInterval: userOptions.updateRadioInterval ?? userOptions.options?.updateRadioInterval ?? 10000,
		style: {
			player: {
				background: userOptions.style?.player?.background ?? "#FFF",
				cover: {
					background: userOptions.style?.player?.cover?.background ?? "#3EC3D5",
					loader: userOptions.style?.player?.cover?.loader ?? "#FFF"
				},
				tracktitle: userOptions.style?.player?.tracktitle ?? userOptions.style?.player?.songtitle ?? "#555",
				buttons: {
					wave: userOptions.style?.player?.buttons?.wave ?? "#3EC3D5",
					normal: userOptions.style?.player?.buttons?.normal ?? "#555",
					hover: userOptions.style?.player?.buttons?.hover ?? "#3EC3D5",
					active: userOptions.style?.player?.buttons?.active ?? "#3EC3D5",
				},
				seekbar: userOptions.style?.player?.seekbar ?? "#555",
				buffered: userOptions.style?.player?.buffered ?? "rgba(255, 255, 255, 0.15)",
				progress: userOptions.style?.player?.progress ?? "#3EC3D5",
				timestamps: userOptions.style?.player?.timestamps ?? "#FFF",
				loader: {
					background: userOptions.style?.player?.loader?.background ?? "#555",
					color: userOptions.style?.player?.loader?.color ?? "#3EC3D5"
				},
				volume: {
					levelbar: userOptions.style?.player?.volume?.levelbar ?? "#555",
					level: userOptions.style?.player?.volume?.level ?? "#3EC3D5"
				}
			},
				playlist: {
				scrollbar: {
					track: userOptions.style?.playlist?.scrollbar?.track ?? userOptions.style?.playlist?.scroll?.track ?? "rgba(255, 255, 255, 0.5)",
					thumb: userOptions.style?.playlist?.scrollbar?.thumb ?? userOptions.style?.playlist?.scroll?.thumb ?? "rgba(255, 255, 255, 0.75)"
				},
				background: userOptions.style?.playlist?.background ?? "#3EC3D5",
				color: userOptions.style?.playlist?.color ?? "#FFF",
				separator: userOptions.style?.playlist?.separator ?? "rgba(255, 255, 255, 0.25)",
				hover: {
					background: userOptions.style?.playlist?.hover?.background ?? "#42CFE2",
					color: userOptions.style?.playlist?.hover?.color ?? "#FFF",
					separator: userOptions.style?.playlist?.hover?.separator ?? "rgba(255, 255, 255, 0.25)"
				},
				active: {
					background: userOptions.style?.playlist?.active?.background ?? "#42CFE2",
					color: userOptions.style?.playlist?.active?.color ?? "#FFF",
					separator: userOptions.style?.playlist?.active?.separator ?? "rgba(255, 255, 255, 0.25)"
				}
			}
		}
	};

	return new tPlayerClass(settings);
}
