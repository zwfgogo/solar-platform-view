import createServices from '../../../util/createServices';

export function getLoadDetail(params) {
  return createServices<{ id: number }>(
    "get",
    "/api/operation/load/detail",
    params
  );
}

export function updateLoad(params) {
  return createServices(
    "put",
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