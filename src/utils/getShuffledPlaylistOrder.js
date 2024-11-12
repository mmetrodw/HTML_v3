getShuffledPlaylistOrder() {
	let array = [], i, j, temp = null;
	// Create Array of Nums from 0 to Playlist Length
	for (i = 0; i < this.playlist.length; i++) {
		if (i !== this.currentSong.index) {
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
}