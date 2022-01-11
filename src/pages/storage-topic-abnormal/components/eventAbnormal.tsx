import React, { useState, useEffect } from "react";
import { connect } from "dva";
import CommonTitle from "./commonTitle";
import TabSelect from "../../../components/TabSelect";
import FullLoading from "../../../components/FullLoading";
import EventAbnormalModal from "./eventAbnormalModal";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/eventAbnormal.less";
import { message } from "wanke-gui";
import { getDefaultTimeByMode } from "./commonAbnormalModal";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";
import { crumbsNS } from "../../constants";
import utils from "../../../public/js/utils";

const colorList = ["#3d7eff"];

const grid = {
  left: "120",
  right: "30",
  top: "40",
  bottom: "30"
};

const tabList = [
  {
    key: "day-7",
    name: utils.intl('近7天'),
    value: "day-7"
  },
  {
    key: "day-30",
    name: utils.intl('近30天'),
    value: "day-30"
  }
];

export function splitString(string, splitLen) {
  if(string.length <= splitLen) return string;
  let str = string.slice(splitLen);
  let result = string.slice(0, splitLen);
  while(str.length > splitLen) {
    result += `\n${str.slice(0, splitLen)}`;
    str = str.slice(splitLen);
  }
  return `${result}\n${str}`;
}

interface Props {
  dispatch?: any;
  chartLoading?: boolean;
  eventChart?: any;
  stationId?: string;
}

const EventAbnormal: React.FC<Props> = ({
  dispatch,
  chartLoading,
  eventChart = {},
  stationId
}) => {
  const [modalVisiable, setModalVisiable] = useState(false);
  const [mode, setMode] = useState("day-7");
  const { option } = useEchartsOption<CustomChartOption.BarChart>({
    colorList,
    showUnit: true,
    data: eventChart,
    reverseAxis: true,
    seriesOption: {
      barMaxWidth: 100,
    },
    customOption: {
      grid,
      xAxis: { minInterval: 1 },
      yAxis: {
        name: eventChart.xData ? utils.intl('异常名称') : undefined,
        axisLabel: {
          formatter: function(value) {
            return splitString(value, 8);
          }
        }
      }
    }
  });

  const checkStation = () => {
    if (!stationId) {
      message.error(utils.intl('请先选择电站'));
      return false;
    }
    return true;
  };

  const changeTime = item => {
    setMode(item.value);
  };

  const fetchData = () => {
    dispatch({
      type: "abnormal/getEventAbnormalChart",
      payload: { stationId, mode }
    });
  };

  const viewDetail = params => {
    const timeRange = getDefaultTimeByMode(mode);
    dispatch({
      type: "abnormalDetail/updateToView",
      payload: {
        // queryTime: params.name,
        queryStr: params.name,
        startDate: timeRange[0].format("YYYY-MM-DD"),
        endDate: timeRange[1].format("YYYY-MM-DD"),
        visible: true
      }
    });
  };

  useEffect(() => {
    if (stationId) {
      fetchData();
    }
  }, [stationId, mode]);

  return (
    <section className={styles["page-container"]}>
      <header className={styles["header"]}>
        <div className={styles["title"]}>
          <CommonTitle title={utils.intl('异常事件Top10')} />
          <a
            className={styles["detail-btn"]}
            onClick={() => checkStation() && setModalVisiable(true)}
          >
            {utils.intl('详情')}
          </a>
        </div>
        <TabSelect list={tabList} onClick={changeTime} value={mode} />
      </header>
      <footer className={styles["footer"]}>
        {chartLoading && <FullLoading />}
        <CommonEcharts option={option} onClick={viewDetail} />
      </footer>
      <EventAbnormalModal
        mode={mode}
        title={utils.intl('异常事件Top10')}
        visible={modalVisiable}
        onOk={() => setModalVisiable(false)}
        onCancel={() => setModalVisiable(false)}
      />
    </section>
  );
};

const mapStateToProps = state => ({
  ...state.abnormal,
  // stationId: state.stationTree.activeKey,
  stationId: state.global.selectedStationId,
  chartLoading: state.loading.effects["abnormal/getEventAbnormalChart"]
});
export default connect(mapStateToProps)(EventAbnormal);
