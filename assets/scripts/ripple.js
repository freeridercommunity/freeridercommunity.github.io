document.addEventListener("pointerdown", function(event) {
	// event.target.style.setProperty("--clientX", event.offsetX);
	// event.target.style.setProperty("--clientY", event.offsetY);
	// // remove after transition
	// setTimeout();

	this.documentElement.style.setProperty("--clientX", event.offsetX);
	this.documentElement.style.setProperty("--clientY", event.offsetY);
});