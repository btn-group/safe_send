import { HELPERS } from "../../../application";
import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

export const CHEQUES_NEW = {
  init: async () => {
    let cryptocurrencies = await HELPERS.getCryptocurrencies();
    cryptocurrencies.forEach((c) => {
      // set token button
      if (!c.smart_contract_id) {
        $("#fungible-token-button .token-symbol").text(c.symbol);
        $("#fungible-token-button").attr("data-smart-contract-address", "");
        if (c.attachments.length) {
          $("#fungible-token-button img").attr(
            "src",
            `https://res.cloudinary.com/hv5cxagki/image/upload/c_scale,dpr_2,f_auto,h_25,q_100,w_25/${c.attachments[0].cloudinary_public_id}`,
          );
        } else {
          $("#fungible-token-button img").attr(
            "src",
            `https://res.cloudinary.com/hv5cxagki/image/upload/c_scale,dpr_2,f_auto,h_25,q_100,w_25/external-content.duckduckgo-1_memqe7`,
          );
        }
      }
      // set balance
    });
    CHEQUES_NEW.setFee();
    CHEQUES_NEW.activateListeners();
    $("html").attr("data-preloader", "disable");
    POLKADOTJS.listenForConnectButtonClick(ALEPH_ZERO);
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  activateListeners: () => {
    $(document).on("aleph_zero_account_selected", () => {
      ALEPH_ZERO.updateWalletBalance("");
      $(".balance-container").removeClass("d-none");
    });
  },
  setFee: async () => {
    try {
      const contract = await ALEPH_ZERO.contracts["safeSend"].getContract();
      let api = await ALEPH_ZERO.api();
      window.api = api;
      let response = await POLKADOTJS.contractQuery(
        api,
        ALEPH_ZERO.b3,
        contract,
        "config",
        undefined,
        [],
      );
      let fee =
        parseFloat(response.output.asOk.toHuman().fee.replace(/,/g, "")) /
        1_000_000_000_000;
      if (HELPERS.environment == "production") {
        $("#fee-amount").text(`${fee} AZERO`);
      } else {
        $("#fee-amount").text(`${fee} TZERO`);
      }
    } catch (err) {
      document.showAlertDanger(err);
    }
  },
};
