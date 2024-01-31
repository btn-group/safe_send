import "@hotwired/turbo-rails";
import "bootstrap";
import "./src/big_number";
import "./src/jquery";
import "./src/list";
import "./src/lodash";
import "./src/toastr";

// === VELZON ===
import "../../lib/assets/js/layout";
import "../../lib/assets/js/app";

// === CUSTOM ===
import { CHEQUES_INDEX } from "./src/aleph_zero/cheques/index";
import { CHEQUES_NEW } from "./src/aleph_zero/cheques/new";

// === GLOBAL LISTENERS ===
$(document).on("turbo:load", function () {
  $("html").attr("data-preloader", "enable");
  if ($("#cheques-index").length) {
    CHEQUES_INDEX.init();
  }
  if ($("#cheques-new").length) {
    CHEQUES_NEW.init();
  }
});

// === HELPERS ===
export const HELPERS = {
  button: {
    disable: function (selector) {
      let $button = $(selector);
      $button.prop("disabled", true);
      $button.find(".loading").removeClass("d-none");
      $button.find(".ready").addClass("d-none");
    },
    enable: function (selector) {
      let $button = $(selector);
      $button.prop("disabled", false);
      $button.find(".loading").addClass("d-none");
      $button.find(".ready").removeClass("d-none");
    },
    setTokenButton: (selector, address) => {
      let cryptocurrency = HELPERS.cryptocurrenciesByAddress[address];
      let cloudinaryPublicId = "external-content.duckduckgo-1_memqe7";
      if (cryptocurrency.attachments[0]) {
        cloudinaryPublicId = cryptocurrency.attachments[0].cloudinary_public_id;
      }
      $(selector).find(".token-symbol").text(cryptocurrency.symbol);
      $(selector).attr("data-smart-contract-address", address);
      $(selector)
        .find("img")
        .attr(
          "src",
          `https://res.cloudinary.com/hv5cxagki/image/upload/c_scale,dpr_2,f_auto,h_25,q_100,w_25/${cloudinaryPublicId}`,
        );
    },
  },
  cookies: {
    get: (id) => {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${id}=`))
        ?.split("=")[1];
    },
  },
  cryptocurrencies: undefined,
  cryptocurrenciesByAddress: {},
  environment: "testnet",
  lists: {},
  toastr: {},
  copyToClipboard: (selectorId) => {
    // Select elements
    const target = document.getElementById(selectorId);
    const button = target.nextElementSibling;

    // Init clipboard -- for more info, please read the offical documentation: https://clipboardjs.com/
    let clipboard = new ClipboardJS(button, {
      target,
      text: function () {
        return target.innerHTML;
      },
    });

    // Success action handler
    clipboard.on("success", function () {
      var checkIcon = button.querySelector(".bi-check");
      var copyIcon = button.querySelector(".bi-clipboard");

      // Exit check icon when already showing
      if (checkIcon) {
        return;
      }

      // Create check icon
      checkIcon = document.createElement("i");
      checkIcon.classList.add("bi");
      checkIcon.classList.add("bi-check");
      checkIcon.classList.add("fs-4");

      // Append check icon
      button.appendChild(checkIcon);

      // Highlight target
      const classes = ["text-success", "fw-boldest"];
      target.classList.add(...classes);

      // Highlight button
      button.classList.add("btn-success");

      // Hide copy icon
      copyIcon.classList.add("d-none");

      // Revert button label after 3 seconds
      setTimeout(function () {
        // Remove check icon
        copyIcon.classList.remove("d-none");

        // Revert icon
        button.removeChild(checkIcon);

        // Remove target highlight
        target.classList.remove(...classes);

        // Remove button highlight
        button.classList.remove("btn-success");
      }, 3_000);
    });
  },
  delay: async (ms) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("");
      }, ms);
    });
  },
  // production = 185
  // testnet = 184
  getCryptocurrencies: async () => {
    if (!HELPERS.cryptocurrencies) {
      let blockchainId = 184;
      if (HELPERS.environment == "production") {
        blockchainId = 185;
      }
      HELPERS.cryptocurrencies = await $.ajax({
        url: `https://btn.group/cryptocurrencies?blockchain_id=${blockchainId}&include_attachments=true`,
        type: "get",
        dataType: "json",
      });
      HELPERS.cryptocurrencies.forEach((cryptocurrency) => {
        if (cryptocurrency.smart_contract) {
          HELPERS.cryptocurrenciesByAddress[
            cryptocurrency.smart_contract.address
          ] = cryptocurrency;
        } else {
          HELPERS.cryptocurrenciesByAddress[""] = cryptocurrency;
        }
      });
    }
    return HELPERS.cryptocurrencies;
  },
  initTokenLists: (listIds) => {
    let options = {
      valueNames: ["token-list-address", "token-list-label", "token-list-name"],
    };
    listIds.forEach(function (listId) {
      HELPERS.lists[listId] = new List(listId, options);
    });
  },
  setUserAccountMenuToggle: (parentSelector, address, name, source) => {
    $(`${parentSelector} img.user-address-alias-avatar`).attr(
      "src",
      `https://res.cloudinary.com/hv5cxagki/image/upload/c_scale,dpr_2,f_auto,h_25,q_100/${HELPERS.walletCloudinaryPublicId(
        source,
      )}`,
    );
    $(`${parentSelector} .account-name`).text(name);
    $(`${parentSelector} .account-address-abbreviated`).text(
      `${address.substring(0, 3)}...${address.slice(-3)}`,
    );
  },
  walletCloudinaryPublicId: function (id) {
    switch (id) {
      case "keplr":
        return "logos/b8thbiihwftyjolgjjz2_dhy5mr";
      case "polkadot-js":
        return "logos/download_qbpd9p";
      case "subwallet-js":
        return "logos/subwallet.3be275bc71284f30e5bc_cwag5o";
      case "talisman":
        return "logos/Talisman-Icon-Red_e75eas.png";
      default:
        return "external-content.duckduckgo-1_memqe7";
    }
  },
};

document.applyDecimals = function (amount, decimals) {
  return amount / parseFloat("1" + "0".repeat(decimals));
};

document.formatHumanizedNumberForSmartContract = function (
  humanizedNumber,
  decimals,
) {
  if (humanizedNumber == "") {
    humanizedNumber = "0";
  }
  humanizedNumber = String(humanizedNumber);
  return BigNumber(humanizedNumber.replace(/,/g, ""))
    .shiftedBy(decimals)
    .toFixed();
};

document.humanizeStringNumberFromSmartContract = function (
  stringNumber,
  decimals,
  toFormatDecimals = undefined,
  replaceCommas = false,
) {
  let amount = BigNumber(stringNumber)
    .shiftedBy(decimals * -1)
    .toFormat(toFormatDecimals);
  if (replaceCommas) {
    amount = amount.replace(/,/g, "");
  }
  return amount;
};
