import React from "react";
import { EChartOption } from "echarts/lib/echarts";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/statisticCard.less";
import utils from "../../../public/js/utils";

const legendList = [utils.intl('index.1MW以下'), "1~10MW", utils.intl('index.10MW以上')];

const tooltip = {
  trigger: "item",
  borderWidth: 0,
  formatter: params => {
    return `${params.name}: ${params.data.displayValue}(${params.percent}%)`;
  }
};

const colorList = ["#fe7877", "#60e6df", "#3d7eff"];

const emptyItem = {
  value: 0,
  displayValue: '0',
  itemStyle: {
    color: "#bdbdbd"
  },
  name: "",
  tooltip: { show: false }
};

interface CardData {
  value: number;
  display: string;
}

interface Props {
  cardData: CardData[];
  title: string;
  total: string;
  defaultUnit?: string;
}

interface State {
  hideList: number[];
}

class StatisticCard extends React.Component<Props, State> {
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

  getTitle = () => {
    const { hideList } = this.state;
    const { total, title, defaultUnit } = this.props;

    return {
      text: `${total}\n${title}`,
      textStyle: {
        fontSize: 14
      },
      top: "center",
      left: "center"
    };
  };

  getSeries = () => {
    let { hideList } = this.state;
    const { cardData = [] } = this.props;
    const data = cardData
      .map((item, index) => ({ ...item, index }))
      .filter((item, index) => hideList.indexOf(index) === -1)
      .map(item => {
        const index = item.index;
        return {
          value: item.value || 0,
          itemStyle: {
            color: colorList[index]
          },
          name: legendList[index],
          displayValue: item.display || '0'
        };
      });

    if (data.length === 0) {
      data.push(emptyItem);
    }

    return legendList.map((name, index) => ({
      label: {
        show: false
      },
      name: name,
      type: "pie",
      radius: ["55%", "70%"],
      data
    }));
  };

  getOption = () => {
    return {
      series: this.getSeries(),
      tooltip,
      title: this.getTitle()
    };
  };

  componentDidMount() {}

  render() {
    let { hideList } = this.state;
    const { cardData = [] } = this.props;

    return (
      <div className={styles["statistic-card"]}>
        <div className={styles["header"]}>
          <CommonEcharts
            resizeTitle
            option={this.getOption() as EChartOption<EChartOption.Series>}
          />
        </div>
        <ul className={styles["footer"]}>
          {cardData.map((item, index) => (
            <li
              className={`${styles["legend-item"]} ${
                hideList.indexOf(index) > -1 ? styles["legend-item-hide"] : ""
              }`}
              key={index}
              onClick={() => this.toggleItem(index)}
            >
              <i
                className={styles["icon"]}
                style={{
                  backgroundColor:
                    hideList.indexOf(index) > -1 ? "#bdbdbd" : colorList[index]
                }}
              />
              <span className={styles["legend-title"]}>
                {legendList[index]}:
              </span>
              <span className={styles["legend-value"]}>
                {item.display || 0}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default StatisticCard;
