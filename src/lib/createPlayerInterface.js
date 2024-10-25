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

		// @include('data/playlistDOMTree.js')

		playlistArray.push(playlistItem);
	});
	return playlistArray;
}

async createPlayerInterface() {
	this.playerState.status = 'Create Player Interface';
	const startTime = new Date().getTime();

	const { wrapper } = this.uiElements;
	const { rounded, skin, showRepeatButton, showShuffleButton, showShareButton} = this.settings;
	const { addClass } = utils;
	const { isMobile, isPlaylist } = this.playerState;

	// Add classes to the wrapper
	addClass(wrapper, ["tp-wrapper", "tp-loading", rounded ? "tp-rounded" : "", skin === "vertical" ? "tp-vertical" : ""]);

	// Set button icons based on 'rounded' setting
	this.buttonIcons = rounded ? this.buttonIcons.rounded : this.buttonIcons.default;

	// @include('data/playerDOMTree.js')

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