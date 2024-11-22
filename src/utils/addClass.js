addClass(elements, classes) {
	const elementList = (typeof elements === "string") ? document.querySelectorAll(elements) : (elements instanceof Element) ? [elements] : elements;
	
	if(!elementList) return;

	const classList = Array.isArray(classes) ? classes : [classes];
	elementList.forEach(element => {
		classList.forEach(cls => {
			if (cls) element.classList.add(cls);
		});
	});
}