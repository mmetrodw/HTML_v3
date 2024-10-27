deepObjectMerge(source, destination) {
	return Object.entries(source).reduce((response, [key, value]) => {
		if (!(key in destination)) {
			response[key] = value;
		} else if (typeof value === "object" && value !== null) {
			response[key] = this.deepObjectMerge(value, destination[key]);
		} else {
			response[key] = destination[key];
		}

		return response;
	}, {})
}