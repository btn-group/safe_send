import { HELPERS } from "../application";

export const CHEQUES_INDEX = {
  datatable: undefined,
  init: async () => {
    let cryptocurrencies = await HELPERS.getCryptocurrencies();
    console.log(cryptocurrencies);
    CHEQUES_INDEX.datatable = new DataTable("#cheques-table", {
      autoWidth: false,
      columns: [
        {
          data: "created",
          title: "Created",
        },
        {
          data: "description",
          title: "Description",
        },
        {
          data: "amount",
          title: "Amount",
        },
        {
          data: "status",
          title: "Status",
        },
        {
          className: "text-end",
          defaultContent: "",
          fnCreatedCell: function (nTd, _sData, oData, _iRow) {
            let html =
              '<div class="d-flex justify-content-end flex-shrink-0">';
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
        $("#cheques-index .cancel-cheque-link").on(
          "click",
          async function (e) {
            e.preventDefault();
            let chequeId = e.currentTarget.getAttribute(
              "data-cheque-id"
            );
            console.log("Implement cheque destruction here")
          }
        );
        $("#cheques-table").removeClass("dataTable");
      },
    });
    $("html").attr("data-preloader", "disable");
  }
};
