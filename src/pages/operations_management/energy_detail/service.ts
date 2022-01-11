import createServices from '../../../util/createServices';

export function getEnergyDetail(params) {
  return createServices<{ id: number }>(
    "get",
    "/api/operation/power/detail",
    params
  );
}

export function updateEnergy(params) {
  return createServices(
    "patch",
    "/api/operation/power",
    params
  );
}

export function updateStatus(params) {
  return createServices(
    "patch",
    "/api/operation/power/execute",
    params
  );
}

export function getPlan(params) {
  return createServices<{ deviceId: number }>(
    "get",
    "/api/operation/power/plans",
    params
  );
}

export function addPlan(params) {
  return createServices(
    "post",
    "/api/operation/power/plans",
    params
  );
}

export function updatePlan(params) {
  return createServices(
    "put",
    "/api/operation/power/plans",
    params
  );
}

export function deletePlan(params) {
  return createServices(
    "delete",
    "/api/operation/power/plans",
    params
  );
}