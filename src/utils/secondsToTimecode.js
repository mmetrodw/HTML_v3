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
}