import { EChartOption } from "echarts";
import { getToolTipFormatter, getCustomOption } from "./chartsTool";
import { formatData, getLegend, LineChartProps, getBasicConfig, calcShowSymbolPoint } from "./lineType";

export interface BarChartProps extends LineChartProps {
  theme?: 'light' | 'dark',
}

export default function calcBarOption(props: BarChartProps): EChartOption {
  const { showLegend, customOption, theme } = props;
  const option = getBasicConfig(props, "bar");
  option.tooltip.axisPointer = {
    type: "shadow",
    shadowStyle: {
      color: "rgba(61,126,255,0.05)"
    }
  }
  option.legend = showLegend ? getLegend(option.series, {
    legend: {
      itemWidth: 12,
      itemHeight: 12,
      icon:'circle',
      textStyle: {
        color: theme === 'dark' ? '#ccc' : '#333'
      },
      inactiveColor: theme === 'dark' ? '#555' : '#ccc',
      ...(customOption.legend || {})
    }
  }) : undefined;
  // // 断点才显示圆圈 其余不显示圆圈
  const symbolMap: any = {}
  option.series.forEach((item: any, index) => {
    if (item.type === 'line') {
      calcShowSymbolPoint(item.data, symbolMap, index)
      // @ts-ignore
      item.symbol = (value, params) => {
        if (!symbolMap[`${params.componentIndex},${params.dataIndex}`]) {
          return 'none'
        }
        return 'emptyCircle'
      }
    }
  })
  return option;
}
