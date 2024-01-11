import { HELPERS } from "../application";

export const CHEQUES_NEW = {
  init: async () => {
    let cryptocurrencies = await HELPERS.getCryptocurrencies();
    console.log(cryptocurrencies);
    $("html").attr("data-preloader", "disable");
  }
};
