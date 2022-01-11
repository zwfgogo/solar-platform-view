import { EChartOption } from "echarts";
import { getToolTipFormatter, getCustomOption } from "./chartsTool";
import { formatData, getLegend, LineChartProps, getBasicConfig } from "./lineType";

export interface ScatterChartProps extends LineChartProps {
    theme?: 'light' | 'dark',
}

export default function calcScatterOption(props: ScatterChartProps): EChartOption {
    const { showLegend, customOption, theme } = props;
    const option = getBasicConfig(props, "scatter");
    option.tooltip.axisPointer.type = "shadow";
    option.legend = showLegend ? getLegend(option.series, {
        legend: {
            ...(customOption.legend || {})
        }
    }) : undefined;
    return option;
}
