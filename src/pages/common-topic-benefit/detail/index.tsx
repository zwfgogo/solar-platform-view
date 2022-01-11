import React, { useEffect, useState } from "react";
import { Select, Button, Tabs, Radio } from "wanke-gui";
import Page from "../../../components/Page";
import BenefitDetailTable from "../components/benefitDetailTable";
import BenefitDetailChart from "../components/benefitDetailChart";
import { common_benefit_detail } from "../../constants";
import { makeConnect } from "../../umi.helper";
import { BenefitDetailModal } from "../models/detail";
import PageProps from "../../../interfaces/PageProps";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import styles from "./index.less";
import moment, { Moment } from "moment";
import { disabledDateAfterToday, disabledDateAfterYesterday } from "../../../util/dateUtil";
import RangePicker from "../../../components/rangepicker";
import { isTerminalSystem } from "../../../core/env";
import utils from "../../../public/js/utils";

const { Option } = Select;
const timeRangeList = [{
  title: utils.intl('近30天'),
  timeRange: [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
  value: 'd30',
}, {
  title: utils.intl('近3月'),
  timeRange: [moment().subtract(1, 'days').subtract(2, 'month'), moment().subtract(1, 'days')],
  value: 'm3',
}, {
  title: utils.intl('近12月'),
  timeRange: [moment().subtract(1, 'days').subtract(11, 'month'), moment().subtract(1, 'days')],
  value: 'm12',
}]

interface Props
  extends BenefitDetailModal,
  MakeConnectProps<BenefitDetailModal> {
  energyUnitCode: string;
  loading?: boolean;
  stationId?: string;
}

const Detail: React.FC<Props> = props => {
  const {
    tableData,
    chartData,
    loading,
    energyUnitCode,
    stationId,
    columns
  } = props;
  const [rangeValue, setRangeValue] = useState(timeRangeList[0].timeRange);
  const [timeMode, setTimeMode] = useState(timeRangeList[0].value);

  const handleChange = (e) => {
    const key = e.target.value;
    const target = timeRangeList.find(item => item.value === key)
    if (target) {
      setRangeValue(target.timeRange)
      setTimeMode(key)
    }
  }

  useEffect(() => {
    return () => {
      props.action("reset");
    };
  }, []);

  useEffect(() => {
    if (energyUnitCode) {
      fetchData(energyUnitCode, rangeValue);
    } else {
      props.action("reset");
    }
  }, [energyUnitCode, rangeValue]);

  const fetchData = (energyUnitCode, rangeValue) => {
    props.action("getData", {
      energyUnitCode,
      stationId,
      startDate: rangeValue[0].format("YYYY-MM-DD"),
      endDate: rangeValue[1].format("YYYY-MM-DD")
    });
  };

  return (
    <section className={styles["page-container"]}>
      <div className={styles["menu"]}>
        <Radio.Group onChange={handleChange} value={timeMode} size="small">
          {
            timeRangeList.map((item) => {
              return (
                <Radio.Button key={item.value} value={item.value}>{item.title}</Radio.Button>
              )
            })
          }
        </Radio.Group>
      </div>
      <header className={styles["header"]}>
        <div className={styles["chart-container"]}>
          <BenefitDetailChart data={chartData} chartLoading={loading} />
        </div>
      </header>
      <BenefitDetailTable
        stationId={stationId}
        columns={columns}
        list={tableData}
        className={styles["footer"]}
        tableLoading={loading}
      />
    </section>
  );
};

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationId: isTerminalSystem() ? sessionStorage.getItem("station-id") : state.global.stationId || state.global.selectedStationId,
    loading: getLoading("getData")
  };
};

export default makeConnect(common_benefit_detail, mapStateToProps)(Detail);
