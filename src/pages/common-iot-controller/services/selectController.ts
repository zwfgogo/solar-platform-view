import createServices from "../../../public/js/createServices";

export default createServices({
  getTable: "/basic-data-management/lot-control-management/micro-controllers|get",
  bindController: "/basic-data-management/equipment-ledger/stations/:id/bind-controllers|put"
});
