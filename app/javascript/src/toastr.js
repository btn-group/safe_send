import toastr from "toastr";

document.showAlertInfo = function (text, autoHide = true) {
  toastr.options.closeButton = true;
  toastr.options.closeDuration = 0;
  toastr.options.extendedTimeOut = 0;
  toastr.options.preventDuplicates = true;
  toastr.options.tapToDismiss = false;
  toastr.options.timeOut = 0;
  if (autoHide) {
    toastr.options = {
      progressBar: true,
      preventDuplicates: false,
      showDuration: "300",
      hideDuration: "1000",
      timeOut: "5000",
      extendedTimeOut: "1000",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
  }
  toastr.info(text);
};

document.showAlertWarning = function (error, autoHide = true) {
  toastr.options.closeButton = true;
  toastr.options.closeDuration = 0;
  toastr.options.extendedTimeOut = 0;
  toastr.options.preventDuplicates = true;
  toastr.options.tapToDismiss = false;
  toastr.options.timeOut = 0;
  if (autoHide) {
    toastr.options = {
      progressBar: true,
      preventDuplicates: false,
      showDuration: "300",
      hideDuration: "1000",
      timeOut: "5000",
      extendedTimeOut: "1000",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
  }
  toastr.warning(error);
};

document.showAlertDanger = function (error, autoHide = false) {
  document.eeeeee = error;
  if (error != "Error: Request rejected") {
    if (error.msg) {
      error = error.msg;
    } else if (error.message) {
      error = error.message;
    } else if (error.responseJSON && error.responseJSON.error) {
      error = error.responseJSON.error;
    } else if (error.statusText && error.statusText != "error") {
      error = error.responseText;
    } else if (error.errorMessage) {
      error = error.errorMessage;
      // Subwallet return "Error" when user cancels
      if (error.toLowerCase() == "usercancelled" || error == "Error") {
        return;
      }
    }
    if (
      error == "Response closed without headers" ||
      (error.statusText && error.statusText == "error") ||
      error == ""
    ) {
      autoHide = true;
      error =
        "Unknown error... Please check your internet connection or contact btn.group through Discord or Telegram.";
    } else if (
      error.includes("Enclave: failed to verify transaction signature")
    ) {
      error =
        "Keplr issue. Please restart your browser. Do not refresh, restart.";
    }
    toastr.options.closeButton = true;
    toastr.options.closeDuration = 0;
    toastr.options.extendedTimeOut = 0;
    toastr.options.preventDuplicates = true;
    toastr.options.tapToDismiss = false;
    toastr.options.timeOut = 0;
    if (autoHide) {
      toastr.options = {
        progressBar: true,
        preventDuplicates: false,
        showDuration: "300",
        hideDuration: "1000",
        timeOut: "5000",
        extendedTimeOut: "1000",
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut",
      };
    }
    toastr.error(error);
  }
};

document.showAlertSuccess = function (text, autoHide = false) {
  toastr.options.closeButton = true;
  toastr.options.closeDuration = 0;
  toastr.options.extendedTimeOut = 0;
  toastr.options.preventDuplicates = true;
  toastr.options.tapToDismiss = false;
  toastr.options.timeOut = 0;
  if (autoHide) {
    toastr.options = {
      progressBar: true,
      preventDuplicates: false,
      showDuration: "300",
      hideDuration: "1000",
      timeOut: "5000",
      extendedTimeOut: "1000",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
  }
  toastr.success(text);
};
