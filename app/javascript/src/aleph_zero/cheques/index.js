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
            let decimals =
              HELPERS.cryptocurrenciesByAddress[smartContractAddress].decimals;
            let amount = sData;
            if (oData.from == ALEPH_ZERO.account.address) {
              amount = amount * -1;
            }
            $(nTd).html(document.applyDecimals(amount, decimals));
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
            let html = '<div class="d-flex justify-content-end flex-shrink-0">';
            html += `<a href="#" data-cheque-id=${oData.id} class="cancel-cheque-link btn btn-icon btn-color-muted btn-bg-light btn-active-color-primary btn-sm"><i class="bi bi-trash-square fs-4 link-primary"></i></a>`;
            html += "</div>";
            $(nTd).html(html);
          },
        },
      ],
      ordering: false,
      paging: false,
      processing: true,
      bInfo: false,
      searching: false,
      drawCallback: function () {
        $("#cheques-index .cancel-cheque-link").on("click", async function (e) {
          e.preventDefault();
          let chequeId = e.currentTarget.getAttribute("data-cheque-id");
          console.log("Implement cheque destruction here");
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
    $(document).on("aleph_zero_account_selected", async () => {
      let response = await ALEPH_ZERO.subsquid.cheques();
      CHEQUES_INDEX.datatable.rows.add(response);
      CHEQUES_INDEX.datatable.columns.adjust().draw();
    });
  },
};
