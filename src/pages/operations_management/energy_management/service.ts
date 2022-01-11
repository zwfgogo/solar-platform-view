import createServices from '../../../util/createServices';

export function getEnergyList(params) {
  return createServices<{ stationId: number, page: number, size: number }>(
    "get",
    "/api/operation/power",
    params
  );
}