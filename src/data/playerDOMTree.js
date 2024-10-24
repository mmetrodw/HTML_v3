const playerDOMTree = [
	{
		tag: "div",
		class: "tp-player-container",
		children: [
			{
				tag: "div",
				class: "tp-cover-container",
				children: [
					{
						tag: "div",
						class: "tp-cover-loading-spinner",
						html: "<span></span><span></span><span></span>",
					},
					{
						tag: "div",
						class: "tp-cover",
						streAs: "cover",
						children: [
							{
								tag: "img",
								class: "tp-cover-image",
								streAs: "coverImage",
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
									{
										tag: "div",
										class: "tp-player-status",
										storeAs: "playerStatus",
									},
								],
							},
							{
								tag: "button",
								class: "tp-button tp-prev-button",
								storeAs: "prevButton",
								skip: this.playerState.isPlaylist ? false : true,
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
								skip: this.playerState.isPlaylist ? false : true,
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
									this.playerState.isPlaylist && this.settings.showShuffleButton
										? false
										: true,
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
						children: [{}],
					},
				],
			},
			{
				tag: "div",
				class: "tp-social-media-container",
				children: [
					{
						tag: "button",
						class: "tp-button tp-facebook-button",
						streAs: "facebookButton",
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
						streAs: "twitterButton",
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
						streAs: "tumblrButton",
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
		streAs: "playlistContainer",
		children: [
			{
				tag: "div",
				class: "tp-scrollbar-track",
				streAs: "scrollbarTrack",
				children: [
					{
						tag: "div",
						class: "tp-scrollbar-thumb",
						streAs: "scrollbarThumb",
					},
				],
			},
			{
				tag: "div",
				class: "tp-playlist",
				streAs: "playlist",
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
				streAs: "errorMessage",
			},
			{
				tag: "button",
				class: "tp-error-close",
				streAs: "errorClose",
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
