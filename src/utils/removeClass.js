removeClass(elements, classes) {
	const elementList = (typeof elements === "string") ? document.querySelectorAll(elements) : (elements instanceof Element) ? [elements] : elements;
	const classList = Array.isArray(classes) ? classes : [classes];
	elementList.forEach(element => {
		classList.forEach(cls => {
			if (cls) element.classList.remove(cls);
		});
	});
}