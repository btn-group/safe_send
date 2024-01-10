$(document).on("turbo:load", function () {
	if (sessionStorage.getItem("data-bs-theme")) {
		$("html").attr("data-bs-theme", sessionStorage.getItem("data-bs-theme"))
	}
})
