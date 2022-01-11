import React, { useEffect, useState } from "react";
import moment from "moment";
import Page from "../../../components/Page";
import { power_quality_energy_unit_detail } from "../../constants";
import { makeConnect } from "../../umi.helper";
import { EnergyDetailModal } from "../models/EnergyUnitDetail";
import PageProps from "../../../interfaces/PageProps";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import styles from "./index.less";
import FullLoading from "../../../components/FullLoading";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import { DetailPageType, PageTitle } from "../constant";
import PowerQualityFilter from "../components/PowerQualityFilter";
import EnergyUnitDetailTable from "./EnergyUnitDetailTable";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";

const colorList = ["#3d7eff"];

interface Props
  extends EnergyDetailModal,
    PageProps,
    MakeConnectProps<EnergyDetailModal> {
  pageId: any;
  loading?: boolean;
  energyUnitCode?: string;
  energyList?: any[];
  defaultStartTime?: moment.Moment;
  defaultEndTime?: moment.Moment;
  stationId?: number;
}

const EnergyUnitDetail: React.FC<Props> = props => {
  const { tableData, chartData, loading, energyUnitCode, energyList, stationId } = props;
  let { defaultStartTime, defaultEndTime } = props;
  if (!defaultStartTime || !defaultEndTime) {
    defaultStartTime = moment().subtract(29, "days");
    defaultEndTime = moment();
  }
  const [rangeValue, setRangeValue] = useState([
    defaultStartTime,
    defaultEndTime
  ]);
  const [selectedUnitCode, setSelectedUnitCode] = useState(energyUnitCode);

  useEffect(() => {
    fetchData(selectedUnitCode, rangeValue);
    return () => {
      props.action("reset");
    };
  }, []);

  const fetchData = (code, range) => {
    props.action("getData", {
      stationId,
      energyUnitCode: code,
      startDate: range[0].format("YYYY-MM-DD"),
      endDate: range[1].format("YYYY-MM-DD")
    });
  };

  const handleSearch = () => {
    fetchData(selectedUnitCode, rangeValue);
  };

  const { option } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    showLegend: true,
    colorList,
    showUnit: true,
    data: chartData,
    customOption: { yAxis: { minInterval: 1 }, legend: { right: '60px' } }
  });
  console.log(option, chartData);

  return (
    <Page
      pageId={props.pageId}
      pageTitle={PageTitle[DetailPageType.ENERGYUIT]}
      style={{ backgroundColor: "unset" }}
    >
      <section className={styles["page-container"]}>
        <header className={styles["header"]}>
          <PowerQualityFilter
            back={props.back}
            rangeValue={rangeValue}
            selectedUnitCode={selectedUnitCode}
            energyList={energyList}
            setRangeValue={setRangeValue}
            setSelectedUnitCode={setSelectedUnitCode}
            onSearch={handleSearch}
          />
          <div className={styles["chart-container"]}>
            {loading && <FullLoading />}
            <CommonEcharts option={option} />
          </div>
        </header>
        <EnergyUnitDetailTable
          list={tableData}
          className={styles["footer"]}
          tableLoading={loading}
          type={DetailPageType.ENERGYUIT}
        />
      </section>
    </Page>
  );
};

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationId: state.global.selectedStationId,
    loading: getLoading("getData")
  };
};

export default makeConnect(
  power_quality_energy_unit_detail,
  mapStateToProps
)(EnergyUnitDetail);
