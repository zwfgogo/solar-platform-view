import React, { useEffect } from "react";
import { Select } from "wanke-gui";
import DatePicker from '../../../components/date-picker' 
import Page from "../../../components/Page";
import PageProps from "../../../interfaces/PageProps";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import { VppBillModal, BOARD_TYPE } from "../models/vppBill";
import styles from "./index.less";
import { makeConnect } from "../../umi.helper";
import { vpp_bill, vpp_bill_detail } from "../../constants";
import moment, { Moment } from "moment";
import CommonTitle from "../../../components/CommonTitle";
import Forward from "../../../public/components/Forward";
import SummaryPieChart from "./components/summaryPieChart";
import ProfitChart from "./components/profitChart";
import { FullLoading } from "wanke-gui";
import { DATE_TYPE } from "../models/vppBillDetail";

const { Option } = Select;
const { MonthPicker, YearPicker } = DatePicker;

const options = [
  {
    value: BOARD_TYPE.MONTH,
    text: "月"
  },
  {
    value: BOARD_TYPE.YEAR,
    text: "年"
  }
];

interface Props
  extends VppBillModal,
    PageProps,
    MakeConnectProps<VppBillModal> {
  record?: any;
  summaryLoading?: boolean;
}

const VppBill: React.FC<Props> = props => {
  const {
    boardType,
    updateState,
    query,
    updateQuery,
    record = {},
    action,
    summaryData,
    summaryLoading,
    dispatch
  } = props;

  const handleBoardTypeChange = val => {
    console.log(boardType, val);
    updateState({ boardType: val });
    fetchData();
  };

  const handleChange = (value: Moment, mode) => {
    updateQuery({
      date: value
    });
    fetchData();
  };

  const fetchData = () => {
    const vppId = record.id || "";
    action("getSummary", { vppId });
    action("getProfitChart", { vppId });
  };

  const viewDetail = () => {
    const vppId = record.id || "";
    dispatch({
      type: `${vpp_bill_detail}/updateToView`,
      payload: {
        query: {
          page: 1,
          size: 20,
          dateType: boardType,
          date: query.date
        }
      }
    });
    props.forward("vppBillDetail", { vppId, enterBoardType: boardType });
  };

  const disabledDate = (current, type: any = "month") => {
    console.log(type);
    let flag = current && current > moment().endOf(type);
    if(record.establishDate && current < moment(record.establishDate).startOf(type)) {
      flag = true;
    }
    return flag;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isMonthBoard = boardType === BOARD_TYPE.MONTH;

  return (
    <Page
      pageId={props.pageId}
      pageTitle={`${record.title || ""}账单`}
      style={{ backgroundColor: "unset" }}
    >
      <section className={styles["page-container"]}>
        <header className={styles["menu"]}>
          <div className={styles["time-picker"]}>
            <div>
              <Select
                value={boardType}
                style={{ width: 90 }}
                onChange={handleBoardTypeChange}
              >
                {options.map(option => (
                  <Option key={option.value} value={option.value}>{option.text}</Option>
                ))}
              </Select>
            </div>
            {boardType === BOARD_TYPE.MONTH ? (
              <MonthPicker
                disabledDate={disabledDate}
                defaultValue={query.date}
                allowClear={false}
                onChange={value => handleChange(value, boardType)}
              />
            ) : (
              <YearPicker
                disabledDate={current => disabledDate(current, 'year')}
                defaultValue={query.date}
                allowClear={false}
                onChange={value => handleChange(value, boardType)}
              />
            )}
          </div>
          <div className={styles["right-label"]}>
            <span className={styles["title"]}>结算日期: </span>
            <span className={styles["text"]}>
              {summaryData.calculationDate || ""}
            </span>
          </div>
        </header>
        <footer className={styles["content"]}>
          <section className={styles["summary"]}>
            {summaryLoading && <FullLoading />}
            <div className={styles["pie-chart-container"]}>
              <SummaryPieChart
                cardData={summaryData}
                summaryTitle="收益"
                summaryKey="profit"
                legendList={["市场交易", "辅助服务"]}
                keyMap={["energyTrade", "demandResponse"]}
              />
            </div>
            <div className={styles["pie-chart-container"]}>
              <SummaryPieChart
                cardData={summaryData}
                summaryTitle={isMonthBoard ? "平均日收益" : "平均月收益"}
                summaryKey="avgProfit"
                legendList={[
                  `市场交易平均${isMonthBoard ? "日" : "月"}收益`,
                  `辅助服务平均${isMonthBoard ? "日" : "月"}收益`
                ]}
                keyMap={["avgEnergyTrade", "avgDemandResponse"]}
              />
            </div>
          </section>
          <section className={styles["profit"]}>
            <header className={styles["title"]}>
              <CommonTitle
                fontSize={18}
                iconHeight={28}
                title={boardType === BOARD_TYPE.MONTH ? "月度收益" : "年度收益"}
              />
              <a className={styles["detail-btn"]} onClick={viewDetail}>
                详细
              </a>
            </header>
            <footer className={styles["profit-chart"]}>
              <ProfitChart />
            </footer>
          </section>
        </footer>
      </section>
    </Page>
  );
};

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    summaryLoading: getLoading("getSummary")
  };
};

export default makeConnect(vpp_bill, mapStateToProps)(VppBill);
