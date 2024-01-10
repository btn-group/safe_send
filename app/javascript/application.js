import "@hotwired/turbo-rails";
import "./src/jquery";

// === VELZON ===
import "../../lib/assets/js/layout";
import "../../lib/assets/js/app";

// === CUSTOM ===
import { CHEQUES_INDEX } from "./cheques/index";

// === GLOBAL LISTENERS ===
$(document).on("turbo:load", function () {
  $("html").attr("data-preloader", "enable");
  if ($("#cheques-index").length) {
    CHEQUES_INDEX.init();
  }
});

// === HELPERS ===
export const HELPERS = {
  cryptocurrencies: undefined,
  getCryptocurrencies: async() => {
    if (!HELPERS.cryptocurrencies) {
      HELPERS.cryptocurrencies = await $.ajax({
        url: `https://btn.group/cryptocurrencies?blockchain_id=185&official=true&include_attachments=true`,
        type: "get",
        dataType: "json",
      });
    }
    return HELPERS.cryptocurrencies;
  }
};
