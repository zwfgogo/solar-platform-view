import { useState } from "react";
import { ChartsType } from "./calcOption/chartsTool";
import { EChartOption } from "echarts";

interface Props {
  option: EChartOption;
  type: ChartsType;
}

// 自定义饼图隐藏功能
export function useCustomLegend(props: Props): {
  option: EChartOption;
  hideList: string[]; // 被隐藏的name数组
  toggleLegend: (name: string) => void; // 改变图例状态
} {
  const { option, type } = props;
  const [hideList, setHideList] = useState([]);

  const getOption = () => {
    if (type === "pie") {
      const newOption = {
        ...option,
        series: (option.series || []).map((serie: any) => {
          return {
            ...serie,
            data: (serie.data || []).filter(
              item => hideList.indexOf(item.name) < 0
            )
          };
        })
      };
      return newOption;
    }
    return option;
  };

  const toggleLegend = (name: string) => {
    let newHideList = hideList.slice(0);
    if (newHideList.indexOf(name) > -1) {
      newHideList = newHideList.filter(item => item !== name);
    } else {
      newHideList = newHideList.concat(name);
    }
    setHideList(newHideList);
  };

  return {
    option: getOption(),
    hideList,
    toggleLegend
  };
}
