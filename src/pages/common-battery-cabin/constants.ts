import utils from "../../public/js/utils"

export enum ViewMode {
  BatteryUnit = "BatteryUnit", // 电池单元
  BatteryCluster = "BatteryCluster", // 电池组/簇/串
  Pack = "Pack" // 电池包/模组
}

export const ViewTypeDataSource = [
  { value: ViewMode.BatteryUnit, name: utils.intl('按电池单元') },
  { value: ViewMode.BatteryCluster, name: utils.intl('按电池组/簇/串') },
  { value: ViewMode.Pack, name: utils.intl('按电池包/模组') },
]

export const ParentSelectPlaceholderMap = {
  [ViewMode.BatteryUnit]: '',
  [ViewMode.BatteryCluster]: utils.intl('请选择电池单元'),
  [ViewMode.Pack]: utils.intl('请选择电池组/簇/串'),
}

export const MultipleSelectPlaceholderMap = {
  [ViewMode.BatteryUnit]: utils.intl('请选择电池单元'),
  [ViewMode.BatteryCluster]: utils.intl('请选择电池组/簇/串'),
  [ViewMode.Pack]: utils.intl('请选择电池包/模组'),
}
