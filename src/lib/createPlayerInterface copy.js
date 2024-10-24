createElement(node) {
	if (node.skip) return null;

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

buildDOMTree(json) {
	const fragment = document.createDocumentFragment();
	const stack = [{ node: json, parent: fragment }];

	while (stack.length) {
		const { node, parent } = stack.pop();
		const element = this.createElement(node);
		if (element) parent.appendChild(element);

		if (node.children) {
			for (let i = node.children.length - 1; i >= 0; i--) {
				stack.push({ node: node.children[i], parent: element });
			}
		}
	}

	return fragment;
}

async createPlayerInterface() {
	return new Promise((resolve, reject) => {
		try {
			this.playerState.status = 'Create Player Interface';
			const { wrapper } = this.uiElements;
			const { rounded, skin, showRepeatButton, showShuffleButton, showShareButton} = this.settings;
			const { addClass, createElement } = utils;
			const { isMobile, isPlaylist } = this.playerState;

			// Add classes to the wrapper
			addClass(wrapper, ["tp-wrapper", rounded ? "tp-rounded" : "", skin === "vertical" ? "tp-vertical" : ""]);

			// Set button icons based on 'rounded' setting
			this.buttonIcons = rounded ? this.buttonIcons.rounded : this.buttonIcons.default;

			// @include('data/playerDOMTree.js')
			console.log(playerDOMTree);

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