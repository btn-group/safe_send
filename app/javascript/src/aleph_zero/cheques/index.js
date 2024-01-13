import { HELPERS } from "../../../application";
import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

export const CHEQUES_INDEX = {
  datatable: undefined,
  init: async () => {
    let cryptocurrencies = await HELPERS.getCryptocurrencies();
    CHEQUES_INDEX.datatable = new DataTable("#cheques-table", {
      autoWidth: false,
      columns: [
        {
          data: "createdAt",
          title: "Date",
          fnCreatedCell: function (nTd, sData, _oData, _iRow) {
            $(nTd).html(
              new Date(sData).toLocaleString("default", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            );
          },
        },
        {
          data: "from",
          title: "Description",
          fnCreatedCell: function (nTd, sData, oData, _iRow) {
            let description = oData.from;
            if (sData == ALEPH_ZERO.account.address) {
              description = oData.to;
            }
            if (oData.memo) {
              description += `<br>Memo: ${oData.memo}`;
            }
            $(nTd).html(description);
          },
        },
        {
          data: "amount",
          title: "Amount",
          fnCreatedCell: function (nTd, sData, oData, _iRow) {
            let smartContractAddress = "";
            if (oData.tokenAddress) {
              smartContractAddress = oData.tokenAddress;
            }
            let cryptocurrency =
              HELPERS.cryptocurrenciesByAddress[smartContractAddress];
            let amount = sData;
            if (oData.from == ALEPH_ZERO.account.address) {
              amount = amount * -1;
            }
            $(nTd).html(
              `${document.applyDecimals(amount, cryptocurrency.decimals)} ${
                cryptocurrency.symbol
              }`,
            );
          },
        },
        {
          data: "status",
          title: "Status",
          fnCreatedCell: function (nTd, sData, _oData, _iRow) {
            let status = "Cancelled";
            if (sData == 0) {
              status = "Pending collection";
            } else if (sData == 1) {
              status = "Collected";
            }
            $(nTd).html(status);
          },
        },
        {
          className: "text-end",
          defaultContent: "",
          fnCreatedCell: function (nTd, _sData, oData, _iRow) {
            if (oData.status == 0 && oData.from == ALEPH_ZERO.account.address) {
              let html = `<a href="#" data-cheque-id=${oData.id} class="cancel-cheque-link btn btn-link btn-sm"><span class="d-none loading"><em aria-hidden="true" class="spinner-grow spinner-grow-sm" role="status"></em><em class="loading-status">Loading...</em></span><span class="ready">Cancel</span></a>`;
              $(nTd).html(html);
            }
          },
        },
      ],
      ordering: false,
      paging: false,
      processing: true,
      bInfo: false,
      searching: false,
      drawCallback: function () {
        $(".cancel-cheque-link").on("click", async function (e) {
          e.preventDefault();
          HELPERS.button.disable(e.currentTarget);
          let chequeId = e.currentTarget.getAttribute("data-cheque-id");
          let api = await ALEPH_ZERO.api();
          let account = ALEPH_ZERO.account;
          api.setSigner(ALEPH_ZERO.getSigner());
          try {
            const contract =
              await ALEPH_ZERO.contracts["safeSend"].getContract();
            let response = await POLKADOTJS.contractTx(
              api,
              account.address,
              contract,
              "cancel",
              undefined,
              [chequeId],
            );
            await ALEPH_ZERO.subsquid.waitForSync(response);
            document.showAlertSuccess(`Cheque cancelled`, true);
            CHEQUES_INDEX.refreshChequesTable();
          } catch (err) {
            document.showAlertDanger(err);
            HELPERS.button.enable(e.currentTarget);
          }
        });
        $("#cheques-table").removeClass("dataTable");
      },
    });
    CHEQUES_INDEX.activateListeners();
    $("html").attr("data-preloader", "disable");
    POLKADOTJS.listenForConnectButtonClick(ALEPH_ZERO);
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  activateListeners: () => {
    $(document).on("aleph_zero_account_selected", () => {
      CHEQUES_INDEX.refreshChequesTable();
    });
  },
  refreshChequesTable: async () => {
    try {
      CHEQUES_INDEX.datatable.clear();
      let response = await ALEPH_ZERO.subsquid.cheques();
      CHEQUES_INDEX.datatable.rows.add(response);
      CHEQUES_INDEX.datatable.columns.adjust().draw();
    } catch (err) {
      document.showAlertDanger(err);
    }
  },
};
