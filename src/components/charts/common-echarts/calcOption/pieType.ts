import { EChartOption } from "echarts";
import { ChartsType } from "./chartsTool";

const tooltip: EChartOption.Tooltip = {
  trigger: "item",
  //@ts-ignore
  appendToBody: true,
  // confine: true,
  formatter: (params: EChartOption.Tooltip.Format) => {
    return `${params.name}: ${params.value}${params.data.unit}(${params.percent}%)`;
  }
};

const emptyItem = {
  value: 0,
  itemStyle: {
    color: "#bdbdbd"
  },
  name: "",
  unit: "",
  tooltip: { show: false }
};

interface ChartData {
  series?: any[];
}

export interface PieChartProps {
  data?: ChartData;
  type?: ChartsType;
  colorList?: any[];
  showLegend?: boolean;
  showTotalCount?: boolean;
  title?: string;
  customOption?: echarts.EChartOption<EChartOption.SeriesPie>;
}

export function calcPieOption(props: PieChartProps): EChartOption {
  const { customOption = {} } = props;
  const { series = [], ...restCustomOption } = customOption;
  const option: EChartOption = {
    series: getSeries(props, "pie"),
    tooltip,
    title: getTitle(props),
    ...restCustomOption
  };
  return option;
}

function getTitle(props: PieChartProps) {
  const { data = {}, title = "", showTotalCount, theme } = props;
  if (!showTotalCount && !title) return undefined;
  const { series = [] } = data;
  const count = series
    .map(item => item.value || 0)
    .reduce((prev, cur) => prev + cur, 0)
    .toString();
  const unit = series[0] && series[0].unit ? series[0].unit : "";
  const countStr = showTotalCount ? `${count}${unit}\n` : "";

  return {
    text: `${countStr}${title}`,
    textStyle: {
      fontSize: 14,
      color: theme === 'dark' ? '#ccc' : '#333'
    },
    top: "center",
    left: "center"
  };
}

function getSeries(props: PieChartProps, type: string) {
  const { data = {}, colorList = [], customOption = {} } = props;
  let { series: seriesOption = [] } = customOption;
  if (!Array.isArray(seriesOption)) {
    seriesOption = [seriesOption];
  }

  const { series = [] } = data;
  const seriesData = series.map((item, index) => ({
    name: item.name,
    value: item.value || 0,
    itemStyle: {
      color: colorList[index]
    },
    unit: item.unit || ""
  }));

  if (seriesData.length === 0) {
    seriesData.push(emptyItem);
  }

  return [
    {
      label: {
        show: false
      },
      type,
      radius: ["55%", "70%"],
      data: seriesData,
      ...(seriesOption[0] || {})
    }
  ];
}
