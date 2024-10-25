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

// Easings 
const easingFunctions = {
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
		return time < 0.5
			? 4 * time * time * time
			: (time - 1) * (2 * time - 2) * (2 * time - 2) + 1;
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
		return time < 0.5
			? 8 * time * time * time * time
			: 1 - 8 * time1 * time1 * time1 * time1;
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
		return time < 0.5
			? 16 * time * time * time * time * time
			: 1 + 16 * time1 * time1 * time1 * time1 * time1;
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
		return -Math.pow(2, -10 * time) + 1;
	},
	easeInOutExpo: (time) => {
		if (time === 0 || time === 1) {
			return time;
		}

		const scaledTime = time * 2;
		const scaledTime1 = scaledTime - 1;

		if (scaledTime < 1) {
			return 0.5 * Math.pow(2, 10 * scaledTime1);
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
		return (
			scaledTime * scaledTime * ((magnitude + 1) * scaledTime + magnitude) + 1
		);
	},
	easeInOutBack: (time, magnitude = 1.70158) => {
		const scaledTime = time * 2;
		const scaledTime2 = scaledTime - 2;
		const s = magnitude * 1.525;

		if (scaledTime < 1) {
			return 0.5 * scaledTime * scaledTime * ((s + 1) * scaledTime - s);
		}

		return 0.5 * (scaledTime2 * scaledTime2 * ((s + 1) * scaledTime2 + s) + 2);
	},
	easeInElastic: (time, magnitude = 0.7) => {
		if (time === 0 || time === 1) {
			return time;
		}

		const scaledTime = time / 1;
		const scaledTime1 = scaledTime - 1;
		const p = 1 - magnitude;
		const s = (p / (2 * Math.PI)) * Math.asin(1);

		return -(
			Math.pow(2, 10 * scaledTime1) *
			Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p)
		);
	},
	easeOutElastic: (time, magnitude = 0.7) => {
		if (time === 0 || time === 1) {
			return time;
		}

		const p = 1 - magnitude;
		const scaledTime = time * 2;
		const s = (p / (2 * Math.PI)) * Math.asin(1);

		return (
			Math.pow(2, -10 * scaledTime) *
				Math.sin(((scaledTime - s) * (2 * Math.PI)) / p) +
			1
		);
	},
	easeInOutElastic: (time, magnitude = 0.65) => {
		if (time === 0 || time === 1) {
			return time;
		}

		const p = 1 - magnitude;
		const scaledTime = time * 2;
		const scaledTime1 = scaledTime - 1;
		const s = (p / (2 * Math.PI)) * Math.asin(1);

		if (scaledTime < 1) {
			return (
				-0.5 *
				(Math.pow(2, 10 * scaledTime1) *
					Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p))
			);
		}

		return (
			Math.pow(2, -10 * scaledTime1) *
				Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p) *
				0.5 +
			1
		);
	},
	easeOutBounce: (time) => {
		const scaledTime = time / 1;

		if (scaledTime < 1 / 2.75) {
			return 7.5625 * scaledTime * scaledTime;
		} else if (scaledTime < 2 / 2.75) {
			const scaledTime2 = scaledTime - 1.5 / 2.75;
			return 7.5625 * scaledTime2 * scaledTime2 + 0.75;
		} else if (scaledTime < 2.5 / 2.75) {
			const scaledTime2 = scaledTime - 2.25 / 2.75;
			return 7.5625 * scaledTime2 * scaledTime2 + 0.9375;
		} else {
			const scaledTime2 = scaledTime - 2.625 / 2.75;
			return 7.5625 * scaledTime2 * scaledTime2 + 0.984375;
		}
	},
	easeInBounce: (time) => {
		return 1 - easingFunctions.easeOutBounce(1 - time);
	},
	easeInOutBounce: (time) => {
		if (time < 0.5) {
			return easingFunctions.easeInBounce(time * 2) * 0.5;
		}
		return easingFunctions.easeOutBounce(time * 2 - 1) * 0.5 + 0.5;
	},
};

class tPlayerClass {
	constructor(options) {
		this.settings = this.utils.deepObjectMerge(defaultPlayerSettings, options);
		this.playlist = JSON.parse(JSON.stringify(this.settings.playlist)); // Clone Palylist to variable
		this.uiElements = [];
		this.playerId = this.utils.getRandomID();
		
		// PLAYER STATE
		this.playerState = {
			_audioEvent: null,
			_autoplay: false,
			_repeat: false,
			_scrollbarTimeOutId: null,
			_shuffle: false,
			_status: [],
			_titleAnimationInterval: null,
			_volumeToggle: false,
			_isLoading: false,
			_isMobile: this.utils.isMobileDevice(),
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
					this._status.push(`Audio Event: ${this._audioEvent}`);
				}
			},
			set autoplay(value) { this._autoplay = value;	},
			set repeat(value) { this._repeat = value; },
			set scrollbarTimeOutId(value) { this._scrollbarTimeOutId = value; },
			set shuffle(value) { this._shuffle = value; },
			set status(value) {	this._status.push(value);
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
		
			handleIsLoadingChange: () => {
				if(this._isLoading) {
					// Add the loading class to the player UI
					this.utils.addClass(this.uiElements.wrapper, 'tp-loading');
				} else {
					// Remove the loading class from the player UI
					this.utils.removeClass(this.uiElements.wrapper, 'tp-loading');
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
		this.playerState.status = "Validating Player Configuration";
		const startTime = new Date().getTime();
	
		const playerContainerElement = document.getElementById(this.settings.container);
	
		// Check if the 'id' property is missing or invalid
		if (!this.settings.container) {
			console.log("tPlayer Error: Please enter a valid container name.");
		}
	
		// Check if the 'wrapper' element associated with the given 'id' is missing
		if (!playerContainerElement) {
			console.log(`tPlayer Error: Element with id "${this.settings.container}" not found.`);
		}
	
		this.uiElements.wrapper = playerContainerElement;
	
		// Check if the 'playlist' property is missing or not provided
		if (!Array.isArray(this.playlist) || this.playlist.length === 0) {
			console.log("tPlayer Error: Please, add a valid Playlist to tPlayer.");
		}
	
		// Check for audio link for each playlist item and update properties
		for( const item of this.playlist) {
			if(item.audio === undefined || item.audio === "") {
				console.log("tPlayer Error: Not all tracks in the playlist have the audio property.");
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
		this.playerState.status = `The Configuration Has Been Validated ${duration} ms.`;
	}

	// Create Player Interface
	createElement(node) {
		const element = node.isSvg ? document.createElementNS('http://www.w3.org/2000/svg', node.tag) : document.createElement(node.tag);
	
		if (node.id) element.id = node.id;
		if (node.class) element.classList.add(...node.class.split(' '));
		if (node.attributes) {
			for (let attr in node.attributes) {
				element.setAttribute(attr, node.attributes[attr]);
			}
		}
		if (node.html) element.innerHTML = node.html;
		if (node.text) element.textContent = node.text;
		if (node.storeAs) this.uiElements[node.storeAs] = element;
	
		return element;
	}
	
	async buildDOMTree(jsonArray) {
		const fragment = document.createDocumentFragment();
		const stack = [];
	
		for (let i = jsonArray.length - 1; i >= 0; i--) {
			stack.push({ node: jsonArray[i], parent: fragment });
		}
	
		while (stack.length) {
			const { node, parent } = stack.pop();
	
			if(node.skip) continue;
	
			const element = this.createElement(node);
			parent.appendChild(element);
	
			if (node.children) {
				for (let i = node.children.length - 1; i >= 0; i--) {
					stack.push({ node: node.children[i], parent: element });
				}
			}
		}
		return fragment;
	}
	
	createPlaylistDOMTree() {
		const playlistArray = [];
		this.playlist.map(track => {
			// Determine the track name to display, including artist and title if available
			const trackName = track.title ? `<b>${track.artist}</b> - ${track.title}` : `<b>${track.artist}</b>`;
			// Determine the full track title for the tooltip, including artist and title if available
			const trackTitle = track.title ? `${track.artist} - ${track.title}` : track.artist;
	
			const playlistItem = {
				tag: "li",
				class: "tp-playlist-item",
				attributes: {
					title: trackTitle,
				},
				children: [
					{
						tag: "div",
						class: "tp-playlist-indicator",
						html: "<span></span><span></span><span></span>",
					},
					{
						tag: "div",
						class: "tp-playlist-track",
						html: trackName,
					},
					{
						tag: "a",
						class: "tp-playlist-track-buy",
						skip: track.buy ? false : true,
						attributes: {
							href: track.buy,
							target: "_blank",
						},
						children: [
							{
								tag: "svg",
								isSvg: true,
								attributes: {
									viewBox: "0 0 20 20",
								},
								children: [
									{
										tag: "path",
										isSvg: true,
										class: "tp-stroke",
										attributes: {
											d: this.buttonIcons.buy,
										},
									},
								],
							},
						],
					},
					{
						tag: "a",
						class: "tp-playlist-track-download",
						skip: track.download ? false : true,
						attributes: {
							href: track.download,
							target: "_blank",
							download: "",
						},
						children: [
							{
								tag: "svg",
								isSvg: true,
								attributes: {
									viewBox: "0 0 20 20",
								},
								children: [
									{
										tag: "path",
										isSvg: true,
										class: "tp-stroke",
										attributes: {
											d: this.buttonIcons.download,
										},
									},
								],
							},
						],
					},
				],
			};
	
			playlistArray.push(playlistItem);
		});
		return playlistArray;
	}
	
	async createPlayerInterface() {
		this.playerState.status = 'Create Player Interface';
		const startTime = new Date().getTime();
	
		const { wrapper } = this.uiElements;
		const { rounded, skin, showRepeatButton, showShuffleButton, showShareButton} = this.settings;
		const { addClass } = this.utils;
		const { isMobile, isPlaylist } = this.playerState;
	
		// Add classes to the wrapper
		addClass(wrapper, ["tp-wrapper", "tp-loading", rounded ? "tp-rounded" : "", skin === "vertical" ? "tp-vertical" : ""]);
	
		// Set button icons based on 'rounded' setting
		this.buttonIcons = rounded ? this.buttonIcons.rounded : this.buttonIcons.default;
	
		const playerDOMTree = [
			{
				tag: "div",
				class: "tp-player-container",
				children: [
					{
						tag: "div",
						class: "tp-cover-container",
						skip: this.settings.showCover ? false : true,
						children: [
							{
								tag: "div",
								class: "tp-cover-loading-spinner",
								html: "<span></span><span></span><span></span>",
							},
							{
								tag: "div",
								class: "tp-cover",
								storeAs: "cover",
								children: [
									{
										tag: "img",
										class: "tp-cover-image",
										storeAs: "coverImage",
									},
								],
							},
						],
					},
					{
						tag: "div",
						class: "tp-player",
						children: [
							{
								tag: "div",
								class: "tp-player-header",
								children: [
									{
										tag: "div",
										class: "tp-track-title",
										storeAs: "trackTitle",
										text: "Loading...",
									},
								],
							},
							{
								tag: "div",
								class: "tp-player-controls",
								children: [
									{
										tag: "button",
										class: "tp-button tp-playback-button",
										storeAs: "playbackButton",
										children: [
											{
												tag: "svg",
												isSvg: true,
												attributes: {
													viewBox: "0 0 20 20",
												},
												children: [
													{
														tag: "path",
														isSvg: true,
														attributes: {
															d: this.buttonIcons.playback.play,
														},
													},
												],
											},
										],
									},
									{
										tag: "div",
										class: "tp-audio-seekbar",
										storeAs: "audioSeekBar",
										children: [
											{
												tag: "div",
												class: "tp-audio-buffered-progress",
												storeAs: "audioBufferedProgress",
											},
											{
												tag: "div",
												class: "tp-audio-playback-progress",
												storeAs: "audioPlaybackProgress",
											},
											{
												tag: "div",
												class: "tp-audio-current-time",
												storeAs: "audioCurrentTime",
												text: "00:00",
											},
											{
												tag: "div",
												class: "tp-audio-duration",
												storeAs: "audioDuration",
												text: "00:00",
											},
											{
												tag: "div",
												class: "tp-player-loader",
												html: "<span></span><span></span><span></span>",
											},
										],
									},
									{
										tag: "button",
										class: "tp-button tp-prev-button",
										storeAs: "prevButton",
										skip: isPlaylist ? false : true,
										children: [
											{
												tag: "svg",
												isSvg: true,
												attributes: {
													viewBox: "0 0 20 20",
												},
												children: [
													{
														tag: "path",
														isSvg: true,
														class: "tp-fill",
														attributes: {
															d: this.buttonIcons.prev.fill,
														},
													},
													{
														tag: "path",
														isSvg: true,
														class: "tp-stroke",
														attributes: {
															d: this.buttonIcons.prev.stroke,
														},
													},
												],
											},
										],
									},
									{
										tag: "button",
										class: "tp-button tp-repeat-button",
										storeAs: "repeatButton",
										skip: this.settings.showRepeatButton ? false : true,
										children: [
											{
												tag: "svg",
												isSvg: true,
												attributes: {
													viewBox: "0 0 20 20",
												},
												children: [
													{
														tag: "path",
														isSvg: true,
														class: "tp-fill",
														attributes: {
															d: this.buttonIcons.repeat.fill,
														},
													},
													{
														tag: "path",
														isSvg: true,
														class: "tp-stroke",
														attributes: {
															d: this.buttonIcons.repeat.stroke,
														},
													},
												],
											},
										],
									},
									{
										tag: "button",
										class: "tp-button tp-next-button",
										storeAs: "nextButton",
										skip: isPlaylist ? false : true,
										children: [
											{
												tag: "svg",
												isSvg: true,
												attributes: {
													viewBox: "0 0 20 20",
												},
												children: [
													{
														tag: "path",
														isSvg: true,
														class: "tp-fill",
														attributes: {
															d: this.buttonIcons.next.fill,
														},
													},
													{
														tag: "path",
														isSvg: true,
														class: "tp-stroke",
														attributes: {
															d: this.buttonIcons.next.stroke,
														},
													},
												],
											},
										],
									},
									{
										tag: "button",
										class: "tp-button tp-shuffle-button",
										storeAs: "shuffleButton",
										skip:
											isPlaylist && this.settings.showShuffleButton ? false : true,
										children: [
											{
												tag: "svg",
												isSvg: true,
												attributes: {
													viewBox: "0 0 20 20",
												},
												children: [
													{
														tag: "path",
														isSvg: true,
														class: "tp-fill",
														attributes: {
															d: this.buttonIcons.shuffle.fill,
														},
													},
													{
														tag: "path",
														isSvg: true,
														class: "tp-stroke",
														attributes: {
															d: this.buttonIcons.shuffle.stroke,
														},
													},
												],
											},
										],
									},
									{
										tag: "button",
										class: "tp-button tp-share-button",
										storeAs: "shareButton",
										skip: this.settings.showShareButton ? false : true,
										children: [
											{
												tag: "svg",
												isSvg: true,
												attributes: {
													viewBox: "0 0 20 20",
												},
												children: [
													{
														tag: "path",
														isSvg: true,
														class: "tp-fill",
														attributes: {
															d: this.buttonIcons.share.closed.fill,
														},
													},
													{
														tag: "path",
														isSvg: true,
														class: "tp-stroke",
														attributes: {
															d: this.buttonIcons.share.closed.stroke,
														},
													},
												],
											},
										],
									},
								],
							},
							{
								tag: "div",
								class: "tp-player-footer",
								children: [
									{
										tag: "button",
										class: "tp-button tp-toggle-playlist-button",
										storeAs: "togglePlaylistButton",
										skip: isPlaylist ? false : true,
										children: [
											{
												tag: "svg",
												isSvg: true,
												attributes: {
													viewBox: "0 0 20 20",
												},
												children: [
													{
														tag: "path",
														isSvg: true,
														class: "tp-stroke",
														attributes: {
															d: this.buttonIcons.playlist.closed,
														},
													},
												],
											},
										],
									},
									{
										tag: "a",
										class: "tp-button tp-playlist-track-buy",
										skip: isPlaylist ? true : this.playlist[0].buy ? false : true,
										attributes: {
											href: this.playlist[0].buy,
											target: "_blank",
										},
										children: [
											{
												tag: "svg",
												isSvg: true,
												attributes: {
													viewBox: "0 0 20 20",
												},
												children: [
													{
														tag: "path",
														isSvg: true,
														class: "tp-stroke",
														attributes: {
															d: this.buttonIcons.buy,
														},
													},
												],
											},
										],
									},
									{
										tag: "a",
										class: "tp-button tp-playlist-track-download",
										skip: isPlaylist
											? true
											: this.playlist[0].download
											? false
											: true,
										attributes: {
											href: this.playlist[0].download,
											target: "_blank",
											download: "",
										},
										children: [
											{
												tag: "svg",
												isSvg: true,
												attributes: {
													viewBox: "0 0 20 20",
												},
												children: [
													{
														tag: "path",
														isSvg: true,
														class: "tp-stroke",
														attributes: {
															d: this.buttonIcons.download,
														},
													},
												],
											},
										],
									},
									{
										tag: "div",
										class: "tp-volume-control",
										skip: isMobile ? true : false,
										children: [
											{
												tag: "button",
												class: "tp-button tp-volume-button",
												storeAs: "volumeButton",
												children: [
													{
														tag: "svg",
														isSvg: true,
														attributes: {
															viewBox: "0 0 20 20",
														},
														children: [
															{
																tag: "path",
																isSvg: true,
																class: "tp-fill",
																attributes: {
																	d: this.buttonIcons.volume.speaker,
																},
															},
															{
																tag: "path",
																isSvg: true,
																class: "tp-stroke",
																attributes: {
																	d: this.buttonIcons.volume.line_1,
																},
															},
															{
																tag: "path",
																isSvg: true,
																class: "tp-stroke",
																attributes: {
																	d: this.buttonIcons.volume.line_2,
																},
															},
															{
																tag: "path",
																isSvg: true,
																class: "tp-stroke",
																attributes: {
																	d: this.buttonIcons.volume.muted,
																},
															},
														],
													},
												],
											},
											{
												tag: "div",
												class: "tp-volume-level-bar",
												storeAs: "volumeLevelBar",
												children: [
													{
														tag: "div",
														class: "tp-volume-level",
														storeAs: "volumeLevel",
													},
												],
											},
										],
									},
								],
							},
						],
					},
					{
						tag: "div",
						class: "tp-social-media-container",
						skip: this.settings.showShareButton ? false : true,
						children: [
							{
								tag: "button",
								class: "tp-button tp-facebook-button",
								storeAs: "facebookButton",
								children: [
									{
										tag: "svg",
										isSvg: true,
										attributes: {
											viewBox: "0 0 20 20",
										},
										children: [
											{
												tag: "path",
												isSvg: true,
												class: "tp-fill",
												attributes: {
													d: this.buttonIcons.facebook,
												},
											},
										],
									},
								],
							},
							{
								tag: "button",
								class: "tp-button tp-twitter-button",
								storeAs: "twitterButton",
								children: [
									{
										tag: "svg",
										isSvg: true,
										attributes: {
											viewBox: "0 0 20 20",
										},
										children: [
											{
												tag: "path",
												isSvg: true,
												class: "tp-fill",
												attributes: {
													d: this.buttonIcons.twitter,
												},
											},
										],
									},
								],
							},
							{
								tag: "button",
								class: "tp-button tp-tumblr-button",
								storeAs: "tumblrButton",
								children: [
									{
										tag: "svg",
										isSvg: true,
										attributes: {
											viewBox: "0 0 20 20",
										},
										children: [
											{
												tag: "path",
												isSvg: true,
												class: "tp-fill",
												attributes: {
													d: this.buttonIcons.tumblr,
												},
											},
										],
									},
								],
							},
						],
					},
				],
			},
			{
				tag: "div",
				class: "tp-playlist-container",
				storeAs: "playlistContainer",
				children: [
					{
						tag: "div",
						class: "tp-scrollbar-track",
						storeAs: "scrollbarTrack",
						children: [
							{
								tag: "div",
								class: "tp-scrollbar-thumb",
								storeAs: "scrollbarThumb",
							},
						],
					},
					{
						tag: "ul",
						class: "tp-playlist",
						storeAs: "playlist",
					},
				],
			},
			{
				tag: "div",
				class: "tp-error-container",
				children: [
					{
						tag: "div",
						class: "tp-error-message",
						storeAs: "errorMessage",
					},
					{
						tag: "button",
						class: "tp-error-close",
						storeAs: "errorClose",
						children: [
							{
								tag: "svg",
								isSvg: true,
								attributes: {
									viewBox: "0 0 20 20",
								},
								children: [
									{
										tag: "path",
										isSvg: true,
										class: "tp-stroke",
										attributes: {
											d: this.buttonIcons.playlist.closed,
										},
									},
								],
							},
						],
					},
				],
			},
		];
	
		// if Has Playlist add the playlist to the playerDOMTree
		if(isPlaylist) playerDOMTree[1].children[1].children = this.createPlaylistDOMTree();
	
		// Create Player Fragment
		const fragment = await this.buildDOMTree(playerDOMTree);
		// Appent Player
		wrapper.appendChild(fragment);
		// Get playlist items if they exist
		if(isPlaylist) this.uiElements.playlistItem = wrapper.querySelectorAll('.tp-playlist-item');
	
		const endTime = new Date().getTime();
		const duration = (endTime - startTime);
		this.playerState.status = `The Player Interface is Created in ${duration} ms`;
	}

	// Function to apply styles from the JSON object as CSS variables
	async applyPlayerStyles(styles, element, prefix = '') {
		this.playerState.status = 'Aplly Custom Styles';
		const startTime = new Date().getTime();
	
		// Call the applyPlayerStyles function with the styles and playerElement
		this.addPlayerStyle(styles, element, prefix);
	
		const endTime = new Date().getTime();
		const duration = (endTime - startTime);
		this.playerState.status = `Custom Styles Applied in ${duration} ms`;
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
		const { audioDuration } = this.uiElements;
	
		// Update the duration display in the UI
		audioDuration.textContent = this.utils.secondsToTimecode(this.audio.duration);
		// Show or hide the duration element based on whether the duration is not Infinity
		audioDuration.style = this.audio.duration !== Infinity ? "block" : "none";
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
		this.utils.addClass(this.uiElements.wrapper, 'tp-error');
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
		const { audioDuration } = this.uiElements;
	
		// Update the duration display in the UI
		audioDuration.textContent = this.utils.secondsToTimecode(this.audio.duration);
		// Show or hide the duration element based on whether the duration is not Infinity
		audioDuration.style = this.audio.duration !== Infinity ? "block" : "none";
		// Set the seeking state to true
		this.isSeeking(true);
		// Set loading status to false
		this.playerState.isLoading = false;
	}
	
	pause() {
		this.playerState.audioEvent = 'pause';
		const { playlistItem, playbackButton } = this.uiElements;
		const { removeClass } = this.utils;
	
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
		const { addClass } = this.utils;
		// Pause all other players in the collection
		for (let player in tPlayersCollection) {
			if (player !== this.playerId) {
				tPlayersCollection[player].pause();
			}
		}
		// Add the 'playing' class to the current playlist item
		if(this.playerState.isPlaylist) addClass(playlistItem[this.currentTrack.index], 'tp-playing');
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
			this.uiElements.audioCurrentTime.textContent = this.utils.secondsToTimecode(this.audio.currentTime);
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
			this.utils.addClass(this.uiElements.volumeButton, 'tp-active');
		} else {
			this.playerState.isVolumeMuted = false;
			this.utils.removeClass(this.uiElements.volumeButton, 'tp-active');
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
	switchTrack() {
		this.playerState.status = 'Changing the Track';
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
	}

	// Function to animate the text change for the track title and artist
	animateTextChange(previousTrack, currentTrack) {
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
					response[key] = utils.deepObjectMerge(value, destination[key]);
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
		// Shuffle Array
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
		// Animate Path Svg
		animatePathSvg: (pathElement, fromD, toD, duration = 1000, easing = 'linear', callback) => {
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
				const easedProgress = easingFunctions[easing](progress);
		
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