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

async buildDOMTree(jsonArray) {
	const fragment = document.createDocumentFragment();
  const stack = [];

  jsonArray.forEach(json => {
    stack.push({ node: json, parent: fragment });
  });

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
	this.playerState.status = 'Create Player Interface';
	const { wrapper } = this.uiElements;
	const { rounded, skin, showRepeatButton, showShuffleButton, showShareButton} = this.settings;
	const { addClass } = utils;
	const { isMobile, isPlaylist } = this.playerState;

	// Add classes to the wrapper
	addClass(wrapper, ["tp-wrapper", rounded ? "tp-rounded" : "", skin === "vertical" ? "tp-vertical" : ""]);

	// Set button icons based on 'rounded' setting
	this.buttonIcons = rounded ? this.buttonIcons.rounded : this.buttonIcons.default;

	// @include('data/playerDOMTree.js')

	const fragment = await this.buildDOMTree(playerDOMTree);
	wrapper.appendChild(fragment);
	console.log(this)

	this.playerState.status = 'The Player Interface is Created';
}