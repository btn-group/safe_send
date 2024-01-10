$(document).on("turbo:load", function () {
	$(".navbar-header .light-dark-mode").on("click", function() {
		let theme;
		if ($("html").attr("data-bs-theme") == "light") {
			theme = "dark"
		} else {
			theme = "light"
		}
		sessionStorage.setItem("data-bs-theme", theme)
		$("html").attr("data-bs-theme", theme)
	});
});
