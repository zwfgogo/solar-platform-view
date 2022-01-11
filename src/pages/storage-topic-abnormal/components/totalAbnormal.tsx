import React, { useState, useEffect } from "react";
import { connect } from "dva";
import CommonTitle from "./commonTitle";
import TabSelect from "../../../components/TabSelect";
import FullLoading from "../../../components/FullLoading";
import TotalAbnormalModal from "./totalAbnormalModal";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import styles from "./styles/totalAbnormal.less";
import { message } from "wanke-gui";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";
import { crumbsNS } from "../../constants";
import utils from "../../../public/js/utils";

const colorList = ["#3d7eff"];

const grid = {
  left: "60",
  right: "16",
  top: "40",
  bottom: "30"
};

const tabList = [
  {
    key: "day-30",
    name: utils.intl('近30天'),
    value: "day-30"
  },
  {
    key: "month",
    name: utils.intl('近12月'),
    value: "month"
  }
];

interface Props {
  dispatch?: any;
  chartLoading?: boolean;
  totalChart?: any;
  stationId?: string;
}

const TotalAbnormal: React.FC<Props> = ({
  dispatch,
  chartLoading,
  totalChart = {},
  stationId
}) => {
  const [modalVisiable, setModalVisiable] = useState(false);
  const [mode, setMode] = useState("day-30");
  const { option } = useEchartsOption<CustomChartOption.BarChart>({
    type: 'bar',
    colorList,
    showUnit: true,
    data: totalChart,
    customOption: { grid, yAxis: { minInterval: 1 } }
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
      type: "abnormal/getTotalAbnormalChart",
      payload: { stationId, mode }
    });
  };

  useEffect(() => {
    if (stationId) {
      fetchData();
    }
  }, [stationId, mode]);

  const viewDetail = params => {
    dispatch({
      type: "abnormalDetail/updateToView",
      payload: {
        // queryTime: params.name,
        queryStr: "",
        startDate: params.name,
        endDate: params.name,
        visible: true
      }
    });
  };

  return (
    <section className={styles["page-container"]}>
      <header className={styles["header"]}>
        <div className={styles["title"]}>
          <CommonTitle title={utils.intl('异常合计')} />
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
      <TotalAbnormalModal
        mode={mode}
        title={utils.intl('异常合计')}
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
  chartLoading: state.loading.effects["abnormal/getTotalAbnormalChart"]
});
export default connect(mapStateToProps)(TotalAbnormal);
