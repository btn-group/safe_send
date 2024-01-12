import { HELPERS } from "../../../application";
import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

export const CHEQUES_NEW = {
  init: async () => {
    let cryptocurrencies = await HELPERS.getCryptocurrencies();
    console.log(cryptocurrencies);
    $("html").attr("data-preloader", "disable");
    POLKADOTJS.listenForConnectButtonClick(ALEPH_ZERO);
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
};
