import qs from "qs";
import createServices from "../../util/createServices";

// 查询能量单元整体风险等级
export const getEfficiency = function ({ deviceId, dtime }) {
  return createServices<any>("get",`/information-room/getEfficiency?${qs.stringify({ deviceId, dtime })}`,);
};