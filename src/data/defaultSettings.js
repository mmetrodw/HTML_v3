const defaultPlayerSettings = {
	container: null,
	playlist: null,
	album: {
		artist: null,
		cover: null
	},
	skin: 'default',
	rounded: false,
	showCover: true,
	showPlaylist: true,
	showRepeatButton: true,
	showShuffleButton: true,
	showShareButton: true,
	allowPlaylistScroll: true,
	maxVisibleSongs: 5,
	volume: 1,
	isRadio: false,
	pluginDirectoryPath: null,
	autoUpdateRadioCovers: true,
	updateRadioInterval: 10000,
	style: {
		player: {
			background: '#FFF',
			cover: {
				background: '#3EC3D5',
				loader: '#FFF'
			},
			songtitle: '#555',
			buttons: {
				wave: '#3EC3D5',
				normal: '#555',
				hover: '#3EC3D5',
				active: '#3EC3D5',
			},
			seekbar: '#555',
			buffered: 'rgba(255, 255, 255, 0.15)',
			progress: '#3EC3D5',
			timestamps: '#FFF',
			loader: {
				background: '#555',
				color: '#3EC3D5'
			},
			volume: {
				levelbar: '#555',
				level: '#3EC3D5'
			}
		},
		playlist: {
			scrollbar: {
				track: 'rgba(255, 255, 255, 0.5)',
				thumb: 'rgba(255, 255, 255, 0.75)'
			},
			background: '#3EC3D5',
			color: '#FFF',
			separator: 'rgba(255, 255, 255, 0.25)',
			hover: {
				background: '#42CFE2',
				color: '#FFF',
				separator: 'rgba(255, 255, 255, 0.25)',
			},
			active: {
				background: '#42CFE2',
				color: '#FFF',
				separator: 'rgba(255, 255, 255, 0.25)',
			}
		}
	}
};