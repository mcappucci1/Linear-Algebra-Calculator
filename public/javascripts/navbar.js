// Function alters the display of the sidebar and the opaque page covering
function toggle() {
	$("#navbar-side-menu").toggleClass("move");
	$("#opaque").toggle();
}

// Switch appearance of sidebar on navbar button press
$(document).on("click", "#navbar-toggle", function() {
	toggle();
});

// Switch appearance of sidebar on opaque div press
$(document).on("click", "#opaque", function() {
	toggle();
});

// Close the sidebar if the page is resized to be large
$(window).resize(function() {
	if(!$("#navbar-toggle").is(":visible") && $("#opaque").is(":visible")) {
		$("#navbar-side-menu").toggleClass("move");
		$("#opaque").toggle();
	}
});