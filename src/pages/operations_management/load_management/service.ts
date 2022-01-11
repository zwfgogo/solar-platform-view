import createServices from '../../../util/createServices';

export function getLoadList(params) {
  return createServices<{ stationId: number, page: number, size: number }>(
    "get",
    "/api/operation/load",
    params
  );
}

export function deleteLoad(params) {
  return createServices<{ id: number }>(
    "delete",
    "/api/operation/load",
    params
  );
}

export function addLoad(params) {
  return createServices(
    "post",
    "/api/operation/load",
    params
  );
}

export function getBreaker(params) {
  return createServices(
    "get",
    "/api/enums",
    params
  );
}