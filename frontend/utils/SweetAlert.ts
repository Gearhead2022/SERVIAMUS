import Swal from "sweetalert2";

const SweetAlert = {
  successAlert: (title: string = "Success", text: string = "") => {
    return Swal.fire({
      title,
      text,
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
    });
  },

  successAlertFunction: (title: string = "Success", text: string = "", runFuction: () => void, onCLose: () => void) => {
    return Swal.fire({
      title,
      text,
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed && typeof runFuction === "function" || result.isDismissed) {
        runFuction();
        onCLose();
      }
    });
  },

  warningAlert: (title: string = "Warning", text: string = "") => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });
  },

  errorAlert: (title: string = "Error", text: string = "") => {
    return Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#d33",
    });
  },



  confirmationAlert: (
    title: string = "Are you sure?",
    text: string = "",
    onConfirm: () => void // Typing `onConfirm` as a callback function with no arguments
  ) => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed && typeof onConfirm === "function") {
        onConfirm();
      }
    });
  },

  confirmationAlert2: async (
    title: string = "Are you sure?",
    text: string = ""
  ): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    return result.isConfirmed;
  },
};

export default SweetAlert;
