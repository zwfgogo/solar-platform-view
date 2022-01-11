import { isDev } from "../core/env";
import utils from "../public/js/utils";

export const Socket_Use_Mock = false;

export const Socket_Port = isDev()
  ? "http://localhost:4510"
  : "replace-string-01"; // http://192.168.2.112:4510 // http://39.108.9.122:5090
export const Socket_Port1 = isDev()
  ? "http://192.168.3.69:4510"
  : "replace-string-02";
export const Socket_Screen = isDev()
  ? "http://192.168.2.35:4005"
  : "replace-string-03";
export const Terminal_SocketUrl = isDev()
  ? "ws://192.168.2.35:5065"
  : "replace-string-04";
export const Vpp_Socket_Port = isDev()
  ? "http://192.168.2.35:4511"
  : "replace-string-05";
export const Storage_Web_Url = isDev()
  ? "http://192.168.3.28:4510"
  : "replace-string-storage-web-url";
export const Pv_Web_Url = isDev()
  ? "http://192.168.2.35:8000"
  : "replace-string-pv-web-url";
export const Terminal_Web_Url = isDev()
  ? "http://192.168.2.35:8000"
  : "replace-string-terminal-web-url";
export const Old_Storage_Web_Url = isDev()
  ? "http://192.168.2.35:3000"
  : "replace-string-old-web-url";
export const Screen_Web_Url = isDev()
  ? "http://192.168.2.35:3000"
  : "replace-string-screen-url";

export const OBJECT_TYPE = {
  energyUnit: "EnergyUnit",
  device: "device",
};

//数据频率常量
export const FREQUENCY_TYPE = {
  Original: "original",
  Minute15: "15m",
  Hour: "1h",
  Day: "1d",
};

export const DEVICE_TYPE = {
  switch: "Breaker",
  batteryGroup: "BatteryCluster", //电池簇/组/串 有父级
  pcs: "PCS/UPS",
  batteryUnit: "BatteryUnit", // 电池单元
  batteryPackage: "Pack", // 电池包 有父级
  singleBattery: "Cell", // 单体电池 有父级
  transformer: "PowerTransformer",
};

export const Tree_Name = {
  powerGrid: "PowerGrid",
  gridConnectedUnit: "GridConnectedUnit",
};

export const Tree_Type = {
  energyUnit: "EnergyUnit",
  batteryUnit: "BatteryUnit",
  switch: "Breaker",
  batteryGroup: "BatteryCluster",
  pcs: "PCS/UPS",
  batteryPackage: "Pack",
  singleBattery: "Cell",
  transformer: "PowerTransformer",
  virtualNode: "VirtualNode",
  station: "Station",
  gatewayBreaker: "GatewayBreaker",
};

export enum Indicator_Type {
  ongridEnergy = "OngridEnergy", // 上网电量
  generation = "Generation", // 发电量
}

export const yesNoOptions = [
  { value: 1, name: "是" },
  { value: -1, name: "否" },
];
export const yesNoBooleanOptions = [
  { value: 1, name: utils.intl("是") },
  { value: 0, name: utils.intl("否") },
];

export enum Mode {
  look,
  update,
  add,
  stationAdd,
}

export enum IndicatorTypeName {
  Divergence = "Divergence", // 组串离散率
  CO2Reduction = "CO2Reduction", // co2减排
  Irradiance = "Irradiance", // 累计辐照量
  PerformanceRatio = "PerformanceRatio", // 系统效率（PR）
  Yield = "Yield", // 满发时常
  DeviceEfficiency = "DeviceEfficiency", // 系统效率
}
export enum ETimeZone {
  Australia = "Australia/Queensland",
  Asia = "Asia/Shanghai",
}

// 天气枚举
export enum WeatherEnum {
  Thunderstorm = utils.intl("weather.Thunderstorm"),
  Drizzle = utils.intl("weather.Drizzle"),
  Rain = utils.intl("weather.Rain"),
  Snow = utils.intl("weather.Snow"),
  Mist = utils.intl("weather.Mist"),
  Smoke = utils.intl("weather.Smoke"),
  Haze = utils.intl("weather.Haze"),
  Dust = utils.intl("weather.Dust"),
  Fog = utils.intl("weather.Fog"),
  Sand = utils.intl("weather.Sand"),
  Ash = utils.intl("weather.Ash"),
  Clear = utils.intl("weather.Clear"),
  Clouds = utils.intl("weather.Clouds"),
  Squall = utils.intl("weather.Squall"),
  Tornado = utils.intl("weather.Tornado"),
}

// 精度枚举
export enum accuracyEnum {
  Integer = 0,
  OneDecimalPlaces = 1,
  TwoDecimalPlaces = 2,
  ThreeDecimalPlaces = 3,
  FourDecimalPlaces = 4,
  FiveDecimalPlaces = 5,
  SixDecimalPlaces = 6,
}

// 模块namespace 常量
export const globalNS = "global";
export const settingNS = "setting";
export const enumsNS = "enums";
export const firmEnumsNS = "firmEnumsNS";
export const loginNS = "login";
export const common_login = "common_login";
export const crumbsNS = "crumbs";
export const storage_battery_monitor = "storage_battery_monitor";
export const terminal_battery_monitor = "terminal_battery_monitor";
export const battery_monitor = "battery_monitor";
export const benefit_monitor = "benefit_monitor";

export const stationListNS = "stationList";
export const stationStatusListNS = "stationStatusListNS";
export const stationUpdateNS = "stationUpdate";
export const stationDataPointNS = "stationDataPoint";
export const strategySettingNS = "strategySetting";

export const c_list = "c_list";
export const c_station_list = "c_station_list";

export const r_e_batch_addition = "r_e_batch_addition";
export const r_e_data_item = "r_e_data_item";
export const r_e_parameter_library = "r_e_parameter_library";
export const r_e_equipment_list = "r_e_equipment_list";

export const r_m = "r_m";

export const r_o_menu_select = "r_o_menu_select";
export const r_o_role_list = "r_o_role_list";

export const r_u_station = "r_u_station";
export const r_u_user_list = "r_u_user_list";

export const benefit_detail = "benefit_detail";
export const income = "income";

export const power_quality_energy_unit_detail =
  "power_quality_energy_unit_detail";
export const power_quality_common_detail = "power_quality_common_detail";

export const vpp_bill = "vpp_bill";
export const vpp_bill_detail = "vpp_bill_detail";

export const iot_index = "iot_index";
export const iot_select_controller = "iot_select_controller";
export const iot_device_info = "iot_device_info";
export const iot_collecting_device = "iot_collecting_device";
export const iot_change_history = "iot_change_history";

export const station_form = "station_form";
export const device_form = "device_form";
export const running_data_anaylze = "running_data_anaylze";

// 站端EMS迁移
export const a_u_l = "account_user_list";
export const a_a_u_l = "account_add_user_list";
export const r_d_q = "real_data_query";
export const s_q = "soe_query";
export const h_d_q = "history_data_query";
export const a_r_q = "alarm_records_query";
export const a_c = "alarm_config";
export const s_p = "station_price";
export const v_m = "video_monitor";

// 平台1.8

export const run_data_analysis = "run_data_analysis";

export const optimize_running_list = "optimize_running_list";
export const optimize_running_update = "optimize_running_update";
export const power_quality = "power_quality";

export const day_report_list = "day_report_list";
export const day_report_detail = "day_report_detail";
export const day_report_diff = "day_report_diff";
export const fee_query_station_list = "fee_query_station_list";
export const fee_query_fee_list = "fee_query_fee_list";
export const fee_query_fee_result = "fee_query_fee_result";
export const fee_query_month_list = "fee_query_month_list";
export const fee_electricity_meter = "fee_electricity_meter";
export const indicator_config = "indicator_config";

//工作台
export const workspace_list = "workspace_list";
export const data_mock = "data_mock";

// 电池健康
export const battery_cabin = "battery_cabin"; // 电池驾驶舱
export const battery_operation = "battery_operation"; // 电池运维
export const battery_safe_assess = "battery_safe_assess"; // 电池安全评估
export const battery_efficiency_analysis = "battery_efficiency_analysis"; // 电池效率分析
export const battery_home = "battery_home"; // 电池驾驶舱

// 异常告警配置
export const alarm_config = "alarm_config";

export const currency = {
  China: "元",
  Australia: "澳元",
};

export const Currency = {
  CNY: "元",
  AUD: "澳元",
};

export const t_benefit_detail = "t_benefit_detail";
export const t_benefit = "t_benefit";
export const t_fee_electricity_meter = "t_fee_electricity_meter";
export const t_fee_query_fee_list = "t_fee_query_fee_list";
export const t_fee_query_fee_result = "t_fee_query_fee_result";
export const t_fee_query_month_list = "t_fee_query_month_list";
export const t_diagram = "t_diagram";
export const t_battery = "t_battery";
export const t_index = "t_index";
export const t_abnormal_warning = "t_abnormal_warning";
export const t_check_abnormal = "t_check_abnormal";

// 储能
export const storage_index = "storage_index";
export const storage_station_monitor = "storage_station_monitor";
export const storage_diagram_video = "storage_diagram_video";
export const storage_run_strategy = "storage_run_strategy";
export const storage_run_strategy_shaving = "storage_run_strategy_shaving";
export const storage_run_strategy_socket = "storage_run_strategy_socket";
export const storage_run_strategy_log = "storage_run_strategy_log";
export const storage_today_command = "storage_today_command";
export const storage_run_strategy_info = "storage_run_strategy_info";

// 公共
export const common_battery_analyze = "common_battery_analyze";
export const common_benefit_analyze = "common_benefit_analyze";
export const common_benefit_detail = "common_benefit_detail";

export const indicator_analysis = "indicator_analysis";
export const remind_management = "remind_management";

// 源荷管理
export const load_management = "load_management";
export const load_management_info = "load_management_info";
export const power_management = "power_management";
export const power_management_info = "power_management_info";

// 电池健康
export const battery_milestone_analysis = "battery_milestone_analysis";
export const battery_capacity_analysis = "battery_capacity_analysis";

// 收益分析
export const income_analyse = "income_analyse";

//
export const device_management_twice = "device_management_twice";
export const device_management_twice_signal = "device_management_twice_signal";
