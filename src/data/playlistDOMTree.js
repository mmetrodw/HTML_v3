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