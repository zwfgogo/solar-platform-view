import React from "react";
import { EChartOption } from "echarts/lib/echarts";
import CommonEcharts from "../../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/summaryPieChart.less";
import utils from "../../../../util/utils";

import { WankeBenefit1Outlined } from "wanke-icon";

function formatEmptyValue(val) {
  return val || val === 0 ? val : "";
}

const tooltip = {
  trigger: "item",
  position: "right",
  formatter: params => {
    return `${params.name}: ${params.data.unit}${params.value}(${params.percent}%)`;
  }
};

const colorList = ["#426afc", "#3cecd9"];

const emptyItem = {
  value: 0,
  itemStyle: {
    color: "#bdbdbd"
  },
  name: "",
  unit: "",
  tooltip: { show: false }
};

interface CardData {
  [key: string]: {
    unit?: string;
    value?: number;
  };
}

interface Props {
  cardData: CardData;
  summaryTitle: string;
  summaryKey: string;
  legendList: string[];
  keyMap: string[];
}

interface State {
  hideList: string[];
}

class SummaryPieChart extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      hideList: []
    };
  }

  toggleItem = key => {
    let { hideList } = this.state;
    console.log(hideList, key);
    if (hideList.indexOf(key) > -1) {
      hideList = hideList.filter(item => item !== key);
    } else {
      hideList = hideList.concat(key);
    }
    this.setState({ hideList });
  };

  getSeries = () => {
    let { hideList } = this.state;
    const { cardData = {}, keyMap, legendList } = this.props;
    const data = keyMap
      .filter(key => hideList.indexOf(key) === -1)
      .map(key => {
        const index = keyMap.indexOf(key);
        const item = cardData[key] || {};
        return {
          value: item.value || 0,
          itemStyle: {
            color: colorList[index]
          },
          name: legendList[index],
          unit: item.unit || ""
        };
      });

    if (data.length === 0) {
      data.push(emptyItem);
    }

    return legendList.map((name, index) => ({
      label: {
        position: "inner",
        formatter: "{d}%"
      },
      labelLine: {
        show: false
      },
      name: name,
      type: "pie",
      radius: ["20%", "70%"],
      data
    }));
  };

  getOption = () => {
    return {
      series: this.getSeries(),
      tooltip
    };
  };

  componentDidMount() {}

  render() {
    let { hideList } = this.state;
    const {
      cardData = {},
      keyMap,
      legendList,
      summaryTitle,
      summaryKey
    } = this.props;
    const summaryItem = cardData[summaryKey] || {};

    return (
      <div className={styles["summary-card"]}>
        <div className={styles["left"]}>
          <CommonEcharts
            option={this.getOption() as EChartOption<EChartOption.Series>}
          />
        </div>
        <div className={styles["right"]}>
          <div className={styles["summary-body"]}>
            <p>
              <WankeBenefit1Outlined style={{ fontSize: 28, color: "#20e6be" }} />
            </p>
            <div style={{ display: "inline-block", textAlign: "left" }}>
              <p className={styles["number"]}>
                <span className={styles["unit"]}>
                  {summaryItem.unit || " "}
                </span>
                <span className={styles["value"]}>
                  {utils.addMicrometerOperator(
                    formatEmptyValue(summaryItem.value).toString()
                  )}
                </span>
              </p>
              <p>{summaryTitle}</p>
            </div>
          </div>
          <ul className={styles["legend-list"]}>
            {keyMap.map((key, index) => (
              <li
                className={`${styles["legend"]} ${
                  hideList.indexOf(key) > -1 ? styles["legend-item-hide"] : ""
                }`}
                key={key}
              >
                <div className={styles["legend-number"]}>
                  <span className={styles["unit"]}>
                    {(cardData[key] && cardData[key].unit) || " "}
                  </span>
                  <span className={styles["value"]}>
                    {utils.addMicrometerOperator(
                      formatEmptyValue(
                        cardData[key] && cardData[key].value
                      ).toString()
                    )}
                  </span>
                </div>
                <div
                  className={styles["legend-item"]}
                  onClick={() => this.toggleItem(key)}
                >
                  <i
                    className={styles["icon"]}
                    style={{
                      backgroundColor:
                        hideList.indexOf(key) > -1
                          ? "#bdbdbd"
                          : colorList[index]
                    }}
                  />
                  <span className={styles["legend-title"]}>
                    {legendList[index]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default SummaryPieChart;
