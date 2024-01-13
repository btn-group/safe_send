import { SupportedChainId, resolveAddressToDomain } from "@azns/resolver-core";
import { HELPERS } from "../../application";
import { POLKADOTJS } from "./../polkadotjs";

export const ALEPH_ZERO = {
  account: undefined,
  allAccounts: undefined,
  apisStaging: undefined,
  apisProduction: undefined,
  b3: "5HimuS19MhHX9EggD9oZzx297qt3UxEdkcc5NWAianPAQwHG",
  contracts: {
    azeroIdRouter: {
      domains: [],
      primaryDomain: undefined,
      address: () => {
        if (HELPERS.environment == "production") {
          return "5FfRtDtpS3Vcr7BTChjPiQNrcAKu3VLv4E1NGF6ng6j3ZopJ";
        } else {
          return "5HXjj3xhtRMqRYCRaXTDcVPz3Mez2XBruyujw6UEkvn8PCiA";
        }
      },
      getContract: async () => {
        let address = ALEPH_ZERO.contracts.azeroIdRouter.address();
        if (!ALEPH_ZERO.contractsByAddress[address]) {
          let api = await ALEPH_ZERO.api();
          let metadata = await $.ajax({
            url: "https://link.storjshare.io/s/juldos5d7qtuwqx2itvdhgtgp3vq/smart-contract-hub-production/jt86lapudzdtrjxbz0ljdyi66jp9.json?download=1",
          });
          ALEPH_ZERO.contractsByAddress[address] =
            new POLKADOTJS.ContractPromise(api, metadata, address);
        }
        return ALEPH_ZERO.contractsByAddress[address];
      },
      getAndSetDomains: async () => {
        try {
          ALEPH_ZERO.contracts.azeroIdRouter.domains = [];
          ALEPH_ZERO.contracts.azeroIdRouter.primaryDomain = undefined;
          let address = ALEPH_ZERO.account.address;
          let chainId;
          if (HELPERS.environment == "production") {
            chainId = SupportedChainId.AlephZero;
          } else {
            chainId = SupportedChainId.AlephZeroTestnet;
          }
          let response = await resolveAddressToDomain(address, {
            chainId,
          });
          if (response.error) {
            throw response.error.message;
          }

          ALEPH_ZERO.contracts.azeroIdRouter.domains =
            response.allPrimaryDomains;
          ALEPH_ZERO.contracts.azeroIdRouter.primaryDomain =
            response.primaryDomain;
        } catch (err) {
          document.showAlertDanger(err);
        }
      },
    },
    safeSend: {
      address: () => {
        if (HELPERS.environment == "production") {
          return "";
        } else {
          return "5EvmKgK2wiPLnoa53KfsPBpzEpn9DZs54u73xPHL1JWQBzm2";
        }
      },
      getContract: async () => {
        let address = ALEPH_ZERO.contracts.safeSend.address();
        if (!ALEPH_ZERO.contractsByAddress[address]) {
          let api = await ALEPH_ZERO.api();
          let metadata = await $.ajax({
            url: "https://link.storjshare.io/s/juldos5d7qtuwqx2itvdhgtgp3vq/smart-contract-hub-production/j01fl47o6l6dv6xh7z2k7nc7tli7.json?download=1",
          });
          ALEPH_ZERO.contractsByAddress[address] =
            new POLKADOTJS.ContractPromise(api, metadata, address);
        }
        return ALEPH_ZERO.contractsByAddress[address];
      },
    },
  },
  contractsByAddress: {},
  extensions: undefined,
  subsquid: {
    url: "https://squid.subsquid.io/squid-safe-send/graphql",
    height: async () => {
      try {
        let response = await $.ajax({
          type: "post",
          url: ALEPH_ZERO.subsquid.url,
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify({
            query: `query MyQuery {
              squidStatus {
                height
              }
            }`,
          }),
        });
        return response.data.squidStatus.height;
      } catch (err) {
        document.showAlertDanger(err);
      }
    },
    cheques: async () => {
      let response = await $.ajax({
        type: "post",
        url: ALEPH_ZERO.subsquid.url,
        contentType: "application/json; charset=utf-8",
        data: ALEPH_ZERO.subsquid.queryData(),
      });
      return response.data.cheques;
    },
    queryData: () => {
      let query = `query MyQuery {
        cheques(orderBy: id_DESC, where: {from_eq: "${ALEPH_ZERO.account.address}", OR: {to_eq: "${ALEPH_ZERO.account.address}"}}) {
          id
          from
          to
          amount
          memo
          fee
          tokenAddress
          status
          createdAt
          updatedAt
        }
      }`;
      return JSON.stringify({
        query,
      });
    },
    waitForSync: async (response) => {
      let attempt = 1;
      let height = response.result.blockNumber.toNumber();
      let syncing = true;
      while (syncing) {
        await HELPERS.delay(3_000);
        let squidHeight = await ALEPH_ZERO.subsquid.height();
        if (squidHeight >= height) {
          syncing = false;
        }
        attempt += 1;
        if (attempt == 20) {
          syncing = true;
          document.showAlertInfo(
            "Subsquid is out of sync. Transaction was successful but results will not appear in search until sync is fixed.",
          );
        }
      }
    },
  },
  activatePolkadotJsExtension: async () => {
    let response = await POLKADOTJS.connectPolkadotjsExtension();
    ALEPH_ZERO.extensions = response.extensions;
    ALEPH_ZERO.allAccounts = response.allAccounts;
    // Set account
    // There's three options here
    if (ALEPH_ZERO.allAccounts.length) {
      POLKADOTJS.listenForAccountSelect(ALEPH_ZERO);
      // 1. User has previously selected account and that info is stored in cookies
      if (
        HELPERS.cookies.get("sch_polkadot_account_name") &&
        HELPERS.cookies.get("sch_polkadot_extension")
      ) {
        ALEPH_ZERO.allAccounts.forEach(function (account) {
          if (
            account.meta.name ==
              HELPERS.cookies.get("sch_polkadot_account_name") &&
            account.meta.source == HELPERS.cookies.get("sch_polkadot_extension")
          ) {
            ALEPH_ZERO.account = account;
            ALEPH_ZERO.updateAfterAccountSet();
          }
        });
      }
      if (!ALEPH_ZERO.account) {
        // 2. User has one account: Auto-select that account
        if (ALEPH_ZERO.allAccounts.length == 1) {
          ALEPH_ZERO.account = ALEPH_ZERO.allAccounts[0];
          ALEPH_ZERO.updateAfterAccountSet();
          // 3. User has multiple accounts: Show modal to select account
        } else {
          $("#polkadot-account-list").modal("show");
          HELPERS.button.enable(POLKADOTJS.connectButtonSelector);
        }
      }
    }
  },
  // AKA API
  api: async () => {
    let apis;
    let httpUrls = await ALEPH_ZERO.httpUrls();
    switch (HELPERS.environment) {
      case "production":
        if (!ALEPH_ZERO.apisProduction) {
          ALEPH_ZERO.apisProduction = [];
          for (const url of httpUrls) {
            let wsProvider = new POLKADOTJS.WsProvider(url);
            let c = await POLKADOTJS.ApiPromise.create({
              provider: wsProvider,
            });
            ALEPH_ZERO.apisProduction.push(c);
          }
        }
        while (ALEPH_ZERO.apisProduction.length == 0) {
          await HELPERS.delay(1_000);
        }
        apis = ALEPH_ZERO.apisProduction;
        break;
      default:
        if (!ALEPH_ZERO.apisStaging) {
          ALEPH_ZERO.apisStaging = [];
          for (const url of httpUrls) {
            let wsProvider = new POLKADOTJS.WsProvider(url);
            let c = await POLKADOTJS.ApiPromise.create({
              provider: wsProvider,
            });
            ALEPH_ZERO.apisStaging.push(c);
          }
        }
        apis = ALEPH_ZERO.apisStaging;
        break;
    }
    return _.sample(apis);
  },
  getBlockHeight: async () => {
    try {
      let api = await ALEPH_ZERO.api();
      return api.query.system.number();
    } catch (err) {
      document.showAlertDanger(err);
    }
  },
  getSigner: () => {
    let signer;
    ALEPH_ZERO.extensions.forEach(function (extension) {
      if (extension.name == ALEPH_ZERO.account.meta.source) {
        signer = extension.signer;
      }
    });
    return signer;
  },
  httpUrls: async () => {
    let urls = ["wss://ws.test.azero.dev"];
    if (HELPERS.environment == "production") {
      urls = ["wss://ws.azero.dev"];
    }
    return urls;
  },
  linkToExplorer: (identifier, type = "account") => {
    let link;
    link = `https://alephzero.subscan.io/${type}/${identifier}`;
    return link;
  },
  updateAfterAccountSelect: (event) => {
    let setNewAccount = false;
    let newAddress = event.currentTarget.dataset.accountAddress;
    let newSource = event.currentTarget.dataset.accountSource;
    if (ALEPH_ZERO.account) {
      if (
        ALEPH_ZERO.account.address != newAddress ||
        ALEPH_ZERO.account.meta.source != newSource
      ) {
        setNewAccount = true;
      }
    } else {
      setNewAccount = true;
    }
    if (setNewAccount) {
      ALEPH_ZERO.allAccounts.forEach(function (account) {
        if (account.address == newAddress && account.meta.source == newSource) {
          ALEPH_ZERO.account = account;
          ALEPH_ZERO.updateAfterAccountSet();
        }
      });
    }
  },
  updateAfterAccountSet: () => {
    $("#page-header-user-dropdown").removeClass("d-none");
    $(".dropdown-menu .wallet-address").text(ALEPH_ZERO.account.address);
    HELPERS.copyToClipboard("polkadot-user-account-menu-wallet-address");
    document.cookie = `sch_polkadot_account_name=${ALEPH_ZERO.account.meta.name};`;
    document.cookie = `sch_polkadot_extension=${ALEPH_ZERO.account.meta.source};`;
    $(POLKADOTJS.connectButtonSelector).addClass("d-none");
    HELPERS.button.enable(POLKADOTJS.connectButtonSelector);
    HELPERS.setUserAccountMenuToggle(
      "#page-header-user-dropdown",
      ALEPH_ZERO.account.address,
      ALEPH_ZERO.account.meta.name,
      ALEPH_ZERO.account.meta.source,
    );
    $(document).trigger("aleph_zero_account_selected", {});
  },
};
