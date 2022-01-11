import React, { useEffect, useState } from "react";
import { Select, Button, message } from "wanke-gui";
import PageProps from "../../interfaces/PageProps";
import Page from "../../components/Page";
import IncomeChart from "./components/incomeChart";
import IncomeTable from "./components/incomeTable";
import MakeConnectProps from "../../interfaces/MakeConnectProps";
import { IncomeModal } from "./model";
import { makeConnect } from "../umi.helper";
import { income } from "../constants";
import styles from "./index.less";
import CommonStationTree from "../../components/common-station-tree/CommonStationTree";
import moment from "moment";
import FullLoading from "../../components/FullLoading";
import { disabledDateAfterToday, disabledDateAfterYesterday } from "../../util/dateUtil";
import RangePicker from "../../components/rangepicker";
import utils from "../../public/js/utils";

const { Option } = Select;

interface Props extends IncomeModal, PageProps, MakeConnectProps<IncomeModal> {
  loading?: boolean;
  stationId?: string;
  energyListLoading?: boolean;
}

const Income: React.FC<Props> = ({
  pageId,
  action,
  loading,
  stationId,
  tableData,
  chartData,
  energyList,
  energyListLoading
}) => {
  const [rangeValue, setRangeValue] = useState([
    moment().subtract(30, "days"),
    moment().subtract(1, "days")
  ]);
  const [monthRangeValue, setMonthRangeValue] = useState([
    moment().subtract(11, "month"),
    moment()
  ]);
  const [rangeType, setRangeType] = useState("day");
  const [selectedEnergyCode, setSelectedEnergyCode] = useState();

  useEffect(() => {
    return () => {
      action("reset");
    };
  }, []);

  /* 更改电站时候 获取能量单元 */
  useEffect(() => {
    if (stationId) {
      action('updateToView', {
        tableData: [],
        chartData: {},
      })
      fetchEnergyList();
    }
  }, [stationId]);

  /* 更改能量单元变化时，设置默认值 */
  useEffect(() => {
    if (!energyListLoading) {
      if (energyList.length && stationId) {
        setSelectedEnergyCode(energyList[0].value);
        fetchData(energyList[0].value, stationId);
      } else {
        setSelectedEnergyCode(undefined);
        action("resetData");
      }
    }
  }, [energyListLoading]);

  const onRangeChange = date => {
    rangeType === "month" ? setMonthRangeValue(date) : setRangeValue(date);
  };

  const handlePanelChange = date => {
    rangeType === "month" ? setMonthRangeValue(date) : setRangeValue(date);
  };
  const handleChangeEnergy = val => {
    setSelectedEnergyCode(val);
  };
  const handleChangeRangeType = val => {
    setRangeType(val);
  };
  const treeNodeClick = () => { };

  const handleSearch = () => {
    if (!stationId) {
      message.error(utils.intl('请先选择电站'));
      return;
    } else if (energyListLoading) {
      message.error(utils.intl('请等待能量单元加载完成'));
      return;
    } else if (!selectedEnergyCode) {
      message.error(utils.intl('未获取到该电站下的能量单元'));
      return;
    }
    fetchData(selectedEnergyCode, stationId);
  };

  const fetchEnergyList = () => {
    action("getEnergyList", { stationId });
  };

  const fetchData = (energyUnitCode, stationId) => {
    action("getData", {
      stationId,
      rangeType,
      rangeValue: rangeType === "month" ? monthRangeValue : rangeValue,
      energyUnitCode
    });
  };

  // console.log('chartData', chartData)

  return (
    <Page
      pageId={pageId}
      pageTitle={utils.intl('收益分析')}
      showStation
      style={{ backgroundColor: "unset" }}
    >
      <article className={styles["page-container"]}>
        {/* <aside className={styles["aside"]}>
          <CommonStationTree
            className={styles["tree-container"]}
            onChildrenClick={treeNodeClick}
          />
        </aside> */}
        <section className={styles["section"]}>
          <header className={styles["header"]}>
            <div className={styles["menu"]}>
              <div>
                <span className={styles["label"]}>{utils.intl('能量单元')}:</span>
                <Select
                  placeholder={utils.intl('请选择能量单元')}
                  style={{ width: 150, marginRight: 16 }}
                  onChange={handleChangeEnergy}
                  value={selectedEnergyCode}
                  allowClear={false}
                >
                  {energyList.map(item => (
                    <Option key={item.value} value={item.value}>
                      <span title={item.name}>{item.name}</span>
                    </Option>
                  ))}
                </Select>
                <span className={styles["label"]}>{utils.intl('日期')}:</span>
                <Select
                  style={{ width: 100, marginRight: 16 }}
                  onChange={handleChangeRangeType}
                  value={rangeType}
                >
                  <Option value="day">{utils.intl('按日')}</Option>
                  <Option value="month">{utils.intl('按月')}</Option>
                </Select>
                {rangeType === "month" ? (
                  <RangePicker
                    disabledDate={current => disabledDateAfterToday(current, 'month')}
                    allowClear={false}
                    format={"YYYY-MM"}
                    onPanelChange={handlePanelChange}
                    value={monthRangeValue as any}
                    picker="month"
                  />
                ) : (
                    <RangePicker
                      // maxLength={90}
                      disabledDate={current => disabledDateAfterYesterday(current)}
                      allowClear={false}
                      format={"YYYY-MM-DD"}
                      onChange={onRangeChange}
                      value={rangeValue as any}
                    />
                  )}
              </div>
              <Button style={{ marginLeft: 16 }} type="primary" onClick={handleSearch}>
                {utils.intl('查询')}
              </Button>
              {energyListLoading && <FullLoading tip="" />}
            </div>
            <div className={styles["chart-container"]}>
              <IncomeChart data={chartData} chartLoading={loading} />
            </div>
          </header>
          <IncomeTable
            rangeType={rangeType}
            className={styles["footer"]}
            list={tableData}
            tableLoading={loading}
          />
        </section>
      </article>
    </Page>
  );
};

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    // stationId: state.stationTree.activeKey,
    stationId: state.global.selectedStationId,
    energyListLoading: getLoading("getEnergyList"),
    loading: getLoading("getData")
  };
};

export default makeConnect(income, mapStateToProps)(Income);
