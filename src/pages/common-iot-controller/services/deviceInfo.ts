import createServices from "../../../public/js/createServices";

export default createServices({
  getTable: "/basic-data-management/equipment-ledger/stations/:id/controllers|get",
  getTableWithoutId: "/basic-data-management/lot-control-management/micro-controllers|get",
});
