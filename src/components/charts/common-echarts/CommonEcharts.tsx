import React, { Component } from "react";
import { EChartOption } from "echarts";
import _ from "lodash";
import styles from "./common-echarts.less";
import AutoSizer from "../../AutoSizer";
import { ConfigConsumer } from 'wanke-gui/es/config-provider'
import utils from "../../../public/js/utils";

function setValue(target, key, value) {
  if (!target) return target;
  if (Array.isArray(target)) {
    target.forEach(item => {
      item[key] = value
    });
    return target;
  }
  target[key] = value
  return target;
}

interface Props {
  theme?: any
  option?: EChartOption<EChartOption.Series>;
  onClick?: (params: any) => void;
  width?: number;
  height?: number;
  resizeTitle?: boolean;
  hideTitle?: boolean;
  onCreateMap?: (chart: any) => void
}

class _CommonEcharts extends Component<Props> {
  chartRef = React.createRef<HTMLDivElement>();
  chart: any;
  timer: any;
  yAxiscount: number;

  getYAxisCount = (height) => {
    let yHeight = height - 70;
    yHeight = yHeight > 0 ? yHeight : 0;
    let count = Math.ceil(yHeight / 30) || 1;
    return count > 5 ? 5 : count;
  }

  getChartOption = () => {
    const { option = {}, width, height, resizeTitle, hideTitle } = this.props;
    if (option.legend) {
      if (!option.legend.textStyle) {
        option.legend.textStyle = {}
      }
      option.legend.pageIconColor = this.props.theme.pageIconColor
      option.legend.pageIconInactiveColor = this.props.theme.pageIconInactiveColor
      option.legend.textStyle.color = this.props.theme.seriesLabelColor
      option.legend.pageTextStyle = { color: this.props.theme.seriesLabelColor }
    }
    if (option.xAxis instanceof Array) {
      option.xAxis?.forEach(item => {
        if (item.splitLine) {
          item.splitLine.lineStyle = item.splitLine.lineStyle || {}
          item.splitLine.lineStyle.color = this.props.theme.splitLineColor
        }
        if (item.axisLine) {
          item.axisLine.lineStyle = item.axisLine.lineStyle || {}
          item.axisLine.lineStyle.color = this.props.theme.axisColor
        }
      })
    }
    if (option.yAxis instanceof Array) {
      option.yAxis?.forEach(item => {
        if (item.splitLine) {
          item.splitLine.lineStyle = item.splitLine.lineStyle || {}
          item.splitLine.lineStyle.color = this.props.theme.splitLineColor
        }
        if (item.axisLine) {
          item.axisLine.lineStyle = item.axisLine.lineStyle || {}
          item.axisLine.lineStyle.color = this.props.theme.axisColor
        }
      })
    }
    if (option.tooltip) {
      option.tooltip.backgroundColor = this.props.theme.tooltipBg
      option.tooltip.extraCssText = `box-shadow: ${this.props.theme.tooltipBoxShadow};color: ${this.props.theme.tooltipTextColor}`
    }
    const newOption: EChartOption<EChartOption.Series> = {
      ...option
    };
    this.yAxiscount = this.getYAxisCount(height);
    if (newOption.yAxis) {
      setValue(newOption.yAxis, 'splitNumber', this.yAxiscount);
    }
    // 针对饼图的标题字体大小
    if (resizeTitle && newOption.title) {
      const minLength = width > height ? height : width;
      let fontSize = Math.floor(minLength / 10);
      fontSize = fontSize > 14 ? 14 : fontSize;
      setValue(newOption.title, 'textStyle', {
        //@ts-ignore
        ...newOption?.title?.textStyle,
        color: this.props.theme.barTitleColor,
        fontSize
      });
    }
    if (hideTitle) {
      delete newOption.title;
    }
    return newOption;
  };

  refresh = () => {
    const option = this.getChartOption();
    this.paintChart(option);
  };

  paintChart = _.debounce((option) => {
    this.chart.setOption(option, true);
    setTimeout(() => {
      this.chart.resize();
    });
  }, 100)

  handleClick = params => {
    this.props.onClick && this.props.onClick(params);
  };

  createChart = () => {
    const option = this.getChartOption();
    this.chart = echarts.init(this.chartRef.current);
    this.chart.setOption(option);
    this.chart.on("click", this.handleClick);
  };

  handleResize = _.throttle(
    () => {
      setTimeout(() => {
        this.chart && this.chart.resize();
      }, 300);
    },
    300,
    { trailing: true }
  );

  componentDidMount() {
    this.createChart();
    this.props.onCreateMap?.(this.chart);
    window.addEventListener("resize", this.handleResize);
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const count = this.getYAxisCount(this.props.height);
    if (
      JSON.stringify(this.props.option) !== JSON.stringify(prevProps.option) ||
      this.yAxiscount !== count || JSON.stringify(this.props.theme) !== JSON.stringify(prevProps.theme)
    ) {
      // 防止连续的两次更新，后一次失效
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.refresh());
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    if (this.chart) {
      this.chart.off("click", this.handleClick);
      this.chart.dispose();
    }
  }

  render() {
    const emptyImg = this.props.theme.emptyImg
    let isEmpty = true
    this.props.option.series?.forEach(item => {
      if (item.data && item.data.length > 0) {
        isEmpty = false
      }
      if (item.type === 'pie') {
        isEmpty = false
      }
    })
    this.props.option.dataset?.forEach(item => {
      if (item.source && item.source.length > 0) {
        isEmpty = false
      }
    })
    return (
      <div className={styles["common-echart"]}>
        <div className={styles["chart-body"]} ref={this.chartRef}></div>
        {isEmpty ? (
          <div className={styles["common-echart-empty"]}>
            <img src={emptyImg} />
            <span>{utils.intl('暂无数据')}</span>
          </div>
        ) : null}
      </div>
    );
  }
}

const CommonEcharts: React.FC<Omit<Props, 'height'>> = (props) => {

  return (
    <ConfigConsumer>
      {
        ({ theme }) => {
          return (
            <AutoSizer style={{ overflow: 'visible' }}>
              {({ width, height }) => (
                <_CommonEcharts {...props} width={width} height={height} theme={theme} />
              )}
            </AutoSizer>
          )
        }
      }
    </ConfigConsumer>
  );
}

export default CommonEcharts;
