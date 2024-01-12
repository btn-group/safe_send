import { HELPERS } from "../../../application";
import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

export const CHEQUES_NEW = {
  init: async () => {
    let cryptocurrencies = await HELPERS.getCryptocurrencies();
    console.log(cryptocurrencies);
    CHEQUES_NEW.setFee();
    $("html").attr("data-preloader", "disable");
    POLKADOTJS.listenForConnectButtonClick(ALEPH_ZERO);
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  setFee: async () => {
      try {
        const contract = await ALEPH_ZERO.contracts[
          "safeSend"
        ].getContract();
        let api = await ALEPH_ZERO.api();
        let response = await POLKADOTJS.contractQuery(
          api,
          ALEPH_ZERO.b3,
          contract,
          "config",
          undefined,
          []
        );
        let fee = parseFloat(response.output.asOk.toHuman().fee.replace(/,/g, '')) / 1_000_000_000_000;
        if (HELPERS.environment == 'production') {
          $("#fee-amount").text(`${fee} AZERO`)
        } else {
          $("#fee-amount").text(`${fee} TZERO`)
        }
      } catch (err) {
        document.showAlertDanger(err);
      }
  }
};
