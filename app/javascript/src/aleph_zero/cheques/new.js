import { HELPERS } from "../../../application";
import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

export const CHEQUES_NEW = {
  fee: undefined,
  init: async () => {
    await CHEQUES_NEW.initTokenListAndButton();
    // === LIST ===
    HELPERS.initTokenLists(["token-list"]);
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
    $(".token-list .list-group-item").on("click", function (e) {
      e.preventDefault();
      let modal = $(e.currentTarget).closest(".token-list");
      // Hide tokenList
      $(modal).modal("hide");
      // Refresh input and search
      $(modal).find("input.search").val("");
      HELPERS.lists["token-list"].search();

      CHEQUES_NEW.updateAfterTokenSelect(e);
    });
    $("#cheque-to").on("input", async () => {
      document.chequesNewForm.azeroId.value = "";
      let address = $("#cheque-to").val();
      if (POLKADOTJS.validateAddress(address)) {
        document.chequesNewForm.azeroId.value =
          await ALEPH_ZERO.contracts.azeroIdRouter.getPrimaryDomain(address);
      }
    });
    // If selectedCryptocurrencyId > 0, we can do all that stuff with the allowance and decimals etc
    // But otherwise only do it when address is valid
    $('form[name="chequesNewForm"] input[name="amount"]').on(
      "input",
      async (_evt) => {
        let amount = BigNumber(
          $('form[name="chequesNewForm"] input[name="amount"]').val(),
        );
        if (amount.isGreaterThan(0)) {
          CHEQUES_NEW.setSubmitLabelBasedOnAllowance();
        }
      },
    );

    // === FORMS ===
    // 0 == Pending Collection
    // 1 == Collected
    // 2 == Cancelled
    // pub fn create(
    //     &mut self,
    //     to: AccountId,
    //     amount: Balance,
    //     token_address: Option<AccountId>,
    //     azero_id: Option<String>,
    //     memo: Option<String>,
    document.chequesNewForm.onsubmit = async (e) => {
      e.target.classList.add("was-validated");
      e.stopPropagation();
      e.preventDefault();
      if (!e.target.checkValidity()) {
        return;
      }
      HELPERS.button.disable(e.submitter);
      try {
        let to = document.chequesNewForm.to.value;
        let amount = document.chequesNewForm.amount.value;
        let cryptocurrency =
          HELPERS.cryptocurrenciesByAddress[
            $("form[name=chequesNewForm] .balance-container").attr(
              "data-smart-contract-address",
            )
          ];
        amount = document.formatHumanizedNumberForSmartContract(
          amount,
          cryptocurrency.decimals,
        );

        // Check allowance first
        if (
          cryptocurrency.smart_contract &&
          cryptocurrency[ALEPH_ZERO.account.address].allowance.lt(
            BigNumber(amount),
          )
        ) {
          await ALEPH_ZERO.psp22.increaseAllowance(
            cryptocurrency.smart_contract.address,
            ALEPH_ZERO.contracts.safeSend.address(),
            BigNumber(POLKADOTJS.maxU128).minus(
              cryptocurrency[ALEPH_ZERO.account.address].allowance,
            ),
          );
          await CHEQUES_NEW.setSubmitLabelBasedOnAllowance(true);
          document.showAlertSuccess("Success.", true);
        } else {
          let tokenAddress = undefined;
          let value = BigNumber(CHEQUES_NEW.fee);
          if (cryptocurrency.smart_contract) {
            tokenAddress = cryptocurrency.smart_contract.address;
          } else {
            value = BigNumber(amount).plus(value);
          }
          let azeroId = undefined;
          if (document.chequesNewForm.azeroId.value.length) {
            azeroId = document.chequesNewForm.azeroId.value;
          }
          let memo = document.chequesNewForm.memo.value;
          let api = await ALEPH_ZERO.api();
          let account = ALEPH_ZERO.account;
          api.setSigner(ALEPH_ZERO.getSigner());
          const contract = await ALEPH_ZERO.contracts["safeSend"].getContract();
          value = new POLKADOTJS.BN(value.toFixed());
          let response = await POLKADOTJS.contractTx(
            api,
            account.address,
            contract,
            "create",
            { value },
            [to, amount, tokenAddress, azeroId, memo],
          );
          await ALEPH_ZERO.subsquid.waitForSync(response);
          HELPERS.toastr.message = "Success";
          HELPERS.toastr.alertType = document.showAlertSuccess;
          Turbo.visit("/");
        }
      } catch (err) {
        document.showAlertDanger(err);
      } finally {
        HELPERS.button.enable(e.submitter);
      }
    };
  },
  initTokenListAndButton: async () => {
    let cryptocurrencies = await HELPERS.getCryptocurrencies();
    let selector = "#fungible-token-button";
    HELPERS.button.setTokenButton(selector, "");
    _.sortBy(cryptocurrencies, ["symbol"]).forEach(function (c) {
      // https://themesbrand.com/velzon/html/saas/ui-lists.html#
      let smartContractAddress = "";
      if (c.smart_contract) {
        smartContractAddress = c.smart_contract.address;
      }
      let cloudinaryPublicId = "external-content.duckduckgo-1_memqe7";
      if (c.attachments[0]) {
        cloudinaryPublicId = c.attachments[0].cloudinary_public_id;
      }
      $(".token-list .list-group").append(
        `<a href="javascript:void(0);" class="d-flex align-items-center border-0 list-group-item list-group-item-action px-0" data-cryptocurrency-address='${smartContractAddress}'><div class='text-center me-2 logo-container'><img class="h-100" src='https://res.cloudinary.com/hv5cxagki/image/upload/c_pad,dpr_2,f_auto,h_25,w_25,q_100/v1/${cloudinaryPublicId}'></div><div class="flex-fill"><h5 class="token-list-label list-title fs-15 mb-1">${c.symbol}</h5><span class="token-list-address d-none">${smartContractAddress}</span><span class="token-list-name d-none">${c.name}</span></div></a>`,
      );
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
      CHEQUES_NEW.fee = parseFloat(
        response.output.asOk.toHuman().fee.replace(/,/g, ""),
      );
      let fee = CHEQUES_NEW.fee / 1_000_000_000_000;
      if (HELPERS.environment == "production") {
        $("#fee-amount").text(`${fee} AZERO`);
      } else {
        $("#fee-amount").text(`${fee} TZERO`);
      }
    } catch (err) {
      document.showAlertDanger(err);
    }
  },
  setSubmitLabelBasedOnAllowance: async (refreshAllowance = false) => {
    let tokenAddress = $("form[name=chequesNewForm] .balance-container").attr(
      "data-smart-contract-address",
    );
    let cryptocurrency = HELPERS.cryptocurrenciesByAddress[tokenAddress];
    if (cryptocurrency.smart_contract) {
      // Disable button before checking
      HELPERS.button.disable(
        'form[name="chequesNewForm"] button[type="submit"]',
      );
      let allowance;
      if (refreshAllowance) {
        allowance = await ALEPH_ZERO.psp22.allowance(
          tokenAddress,
          ALEPH_ZERO.account.address,
          ALEPH_ZERO.contracts.safeSend.address(),
        );
      } else if (
        cryptocurrency[ALEPH_ZERO.account.address] &&
        cryptocurrency[ALEPH_ZERO.account.address].allowance
      ) {
        allowance = cryptocurrency[ALEPH_ZERO.account.address].allowance;
      } else {
        allowance = await ALEPH_ZERO.psp22.allowance(
          tokenAddress,
          ALEPH_ZERO.account.address,
          ALEPH_ZERO.contracts.safeSend.address(),
        );
      }
      let amount = BigNumber(
        document.formatHumanizedNumberForSmartContract(
          document.chequesNewForm.amount.value,
          cryptocurrency.decimals,
        ),
      );
      if (allowance.isGreaterThanOrEqualTo(amount)) {
        $('form[name="chequesNewForm"] button[type="submit"] .ready').text(
          "Create",
        );
      } else {
        $('form[name="chequesNewForm"] button[type="submit"] .ready').text(
          `Enable ${cryptocurrency.symbol}`,
        );
      }
      HELPERS.button.enable(
        'form[name="chequesNewForm"] button[type="submit"]',
      );
    }
  },
  updateAfterTokenSelect: async (event) => {
    let selector = "#fungible-token-button";
    let address = event.currentTarget.dataset.cryptocurrencyAddress;
    let cryptocurrency = HELPERS.cryptocurrenciesByAddress[address];
    $("form[name=chequesNewForm] .balance-container").attr(
      "data-smart-contract-address",
      address,
    );
    HELPERS.button.setTokenButton(selector, address);
    ALEPH_ZERO.updateWalletBalance(address);
    CHEQUES_NEW.setSubmitLabelBasedOnAllowance();
  },
};
