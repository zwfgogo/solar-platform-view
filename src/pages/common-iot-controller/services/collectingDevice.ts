import createServices from "../../../public/js/createServices";
import myAxios from "../../../util/myAxios";

export default createServices({
  getChangeEnum: "/enums",
  getTable: "/basic-data-management/lot-control-management/micro-controllers/:id/device-record|get",
  changeRecordType: "/basic-data-management/lot-control-management/micro-controllers/:id/device-record|put",
  newChangeRecord: "/basic-data-management/lot-control-management/device-change-records|post",
  editChangeRecord: "/basic-data-management/lot-control-management/device-change-records/:id|put",
  getChangeHistoryByDeviceId: "/basic-data-management/lot-control-management/device-change-records/by-device-record|get"
});

export function getDeviceList(data) {
  return myAxios({
    method: 'get',
    url: '/enums/devices/collect-device',
    data,
    results: true
  })
}
