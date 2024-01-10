import "@hotwired/turbo-rails";
import "./src/jquery";

// === VELZON ===
import "../../lib/assets/js/layout";
import "../../lib/assets/js/app";

// === GLOBAL LISTENERS ===
$(document).on("turbo:load", function () {
  $("html").attr("data-preloader", "enable");
  // Set this up in separate pages where required
	$("html").attr("data-preloader", "disable");
});
