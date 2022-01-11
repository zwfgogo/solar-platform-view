import React, { useState, useEffect } from "react";
import { connect } from "dva";
import CommonTitle from "./commonTitle";
import TabSelect from "../../../components/TabSelect";
import FullLoading from "../../../components/FullLoading";
import DeviceAbnormalModal from "./deviceAbnormalModal";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/deviceAbnormal.less";
import { message } from "wanke-gui";
import moment from "moment";
import { getDefaultTimeByMode } from "./commonAbnormalModal";
import { splitString } from "./eventAbnormal";
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

interface Props {
  dispatch?: any;
  chartLoading?: boolean;
  deviceChart?: any;
  stationId?: string;
}

const DeviceAbnormal: React.FC<Props> = ({
  dispatch,
  chartLoading,
  deviceChart = {},
  stationId
}) => {
  const [modalVisiable, setModalVisiable] = useState(false);
  const [mode, setMode] = useState("day-7");
  const { option } = useEchartsOption<CustomChartOption.BarChart>({
    colorList,
    showUnit: true,
    data: deviceChart,
    reverseAxis: true,
    seriesOption: {
      barMaxWidth: 100,
    },
    customOption: {
      grid,
      xAxis: { minInterval: 1 },
      yAxis: {
        name: deviceChart.xData ? utils.intl('设备名称') : undefined,
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
      message.error("请先选择电站");
      return false;
    }
    return true;
  };

  const changeTime = item => {
    setMode(item.value);
  };

  const fetchData = () => {
    dispatch({
      type: "abnormal/getDeviceAbnormalChart",
      payload: { stationId, mode }
    });
  };

  useEffect(() => {
    if (stationId) {
      console.log('stationId', stationId)
      fetchData();
    }
  }, [stationId, mode]);

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

  return (
    <section className={styles["page-container"]}>
      <header className={styles["header"]}>
        <div className={styles["title"]}>
          <CommonTitle title={utils.intl('设备异常Top10')} />
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
      <DeviceAbnormalModal
        mode={mode}
        title={utils.intl('设备异常Top10')}
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
  chartLoading: state.loading.effects["abnormal/getDeviceAbnormalChart"]
});
export default connect(mapStateToProps)(DeviceAbnormal);
