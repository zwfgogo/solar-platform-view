import React, { useEffect, useState } from "react";
import classnames from "classnames";
import CommonStationTree from "../../components/common-station-tree/CommonStationTree";
import { makeConnect } from "../umi.helper";
import MakeConnectProps from "../../interfaces/MakeConnectProps";
import PageProps from "../../interfaces/PageProps";
import { PowerQualityState } from "./models/index";
import { power_quality } from "../constants";
import Page from "../../components/Page";
import CommonEcharts from "../../components/charts/common-echarts/CommonEcharts";
import PowerTable from "./PowerTable";
import moment from "moment";
import styles from "./PowerQuality.less";
import FullLoading from "../../components/FullLoading";
import { disabledDateAfterToday } from "../../util/dateUtil";
import { usePowerQualityChart } from "./components/usePowerQualityChart";

import RangePicker from "../../components/rangepicker";
import { Button, message } from "wanke-gui";
import utils from "../../public/js/utils";

const colorList = ["#3d7eff"];

interface Props
  extends PowerQualityState,
  MakeConnectProps<PowerQualityState>,
  PageProps {
  loading?: boolean;
  stationId?: string;
}

const PowerQuality: React.FC<Props> = function (this: null, props) {
  const { action, loading, pageId, tableData, chartData, stationId } = props;

  const { option } = usePowerQualityChart({
    colorList,
    showLegend: true,
    showUnit: true,
    data: chartData,
    customOption: {}
  });

  const [rangeValue, setRangeValue] = useState([
    moment().subtract(29, "days"),
    moment()
  ]);

  const onRangeChange = (date, dateString) => {
    setRangeValue(date);
  };

  const fetchData = () => {
    action("getData", {
      stationId,
      startTime: rangeValue[0].format("YYYY-MM-DD"),
      endTime: rangeValue[1].format("YYYY-MM-DD")
    });
  };

  const handleSearch = () => {
    if (!stationId) {
      message.error(utils.intl('请先选择电站'));
      return;
    }
    fetchData();
  };

  useEffect(() => {
    if (stationId) {
      action("reset");
      fetchData();
    }
  }, [stationId]);

  useEffect(() => {
    return () => {
      action("reset");
    };
  }, []);

  useEffect(() => {
    if (rangeValue) {
      handleSearch();
    }
  }, [rangeValue]);
  return (
    <Page
      pageId={pageId}
      className="d-flex"
      pageTitle={utils.intl('电能质量分析')}
      showStation
      style={{ backgroundColor: "unset" }}
    >
      <article className={styles["page-container"]}>
        {/* <aside className={styles["aside"]}>
          <CommonStationTree className={styles["tree-container"]} />
        </aside> */}
        <section className={classnames("flex1 d-flex-c", styles["section"])}>
          <header className={styles["header"]}>
            <div className={styles["menu"]}>
              <div>
                <span className={styles["label"]}>{utils.intl('选择时间')}:</span>
                <RangePicker
                  disabledDate={current => disabledDateAfterToday(current)}
                  // maxLength={90}
                  allowClear={false}
                  onChange={onRangeChange}
                  value={rangeValue as any}
                />
              </div>
            </div>
            <div className={styles["chart-container"]}>
              {loading && <FullLoading />}
              <CommonEcharts option={option} />
            </div>
          </header>
          <footer className={styles["footer"]}>
            <PowerTable
              list={tableData}
              tableLoading={loading}
              rangeValue={rangeValue}
            />
          </footer>
        </section>
      </article>
    </Page>
  );
};

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    // stationId: state.stationTree.activeKey,
    stationId: state.global.selectedStationId,
    loading: getLoading("getData")
  };
}

export default makeConnect(power_quality, mapStateToProps)(PowerQuality);
