import { EChartOption } from "echarts";
import { getToolTipFormatter, getCustomOption } from "./chartsTool";
import { formatData, getLegend, LineChartProps, getBasicConfig } from "./lineType";
import calcSplitLineOption from "./splitLine";

export interface SplitBarChartProps extends LineChartProps {
  theme?: 'light' | 'dark',
}

export default function splitBarType(props: SplitBarChartProps): EChartOption {
  const { showLegend, customOption, theme } = props;
  const option = calcSplitLineOption(props);
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
  return option;
}
