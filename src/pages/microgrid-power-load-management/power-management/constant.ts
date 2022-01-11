export enum RepairStatus {
  NONE = "none",
  WAIT_REPAIR = "toBeProgress",
  REPAIRING = "inProgress",
}

export const RepairStatusClassName = {
  [RepairStatus.REPAIRING]: 'repairing',
  [RepairStatus.WAIT_REPAIR]: 'wait-repair',
}

export const RepairStatusTitleMap = {
  [RepairStatus.NONE]: '',
  [RepairStatus.REPAIRING]: '检修中',
  [RepairStatus.WAIT_REPAIR]: '待检修',
}