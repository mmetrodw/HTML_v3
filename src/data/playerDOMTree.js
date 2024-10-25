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