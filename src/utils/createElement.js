createElement: (
  tagName,
  classNames = [],
  parentElement = null,
  innerHtml = false,
  shouldReturn = true
) => {
  // Create a new element with the specified tag name
  const element = document.createElement(tagName);

  // Add classes to the element using a utility function
  this.utils.addClass(element, classNames);

  // If innerHtml is provided, set the element's inner HTML
  if (innerHtml) {
    element.innerHTML = innerHtml;
  }

  // If a parent element is specified, append the new element to it
  if (parentElement) {
    parentElement.appendChild(element);
  }

  // Return the created element or null based on the shouldReturn parameter
  return shouldReturn ? element : null;
}