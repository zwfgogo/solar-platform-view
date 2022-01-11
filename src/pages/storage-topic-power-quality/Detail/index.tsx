import React, { useEffect, useState } from "react";
import moment from "moment";
import Page from "../../../components/Page";
import { power_quality_common_detail } from "../../constants";
import { makeConnect } from "../../umi.helper";
import PageProps from "../../../interfaces/PageProps";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import PowerQualityCommonTable from "../components/PowerQualityCommonTable";
import { DetailPageType, PageTitle } from "../constant";
import PowerQualityFilter from "../components/PowerQualityFilter";
import styles from "./index.less";
import { PowerDetailModal } from "../models/detail";

interface Props
  extends PowerDetailModal,
    PageProps,
    MakeConnectProps<PowerDetailModal> {
  pageId: any;
  loading?: boolean;
  energyUnitCode?: string;
  energyList?: any[];
  defaultStartTime?: moment.Moment;
  defaultEndTime?: moment.Moment;
  type?: DetailPageType;
  stationId?: number;
}

const EnergyUnitDetail: React.FC<Props> = props => {
  const { tableData, energyUnitCode, energyList, type, stationId } = props;
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

  const fetchData = (code, range, extraParams = {}) => {
    props.action("getData", {
      type,
      stationId,
      energyUnitCode: code,
      startDate: range[0].format("YYYY-MM-DD"),
      endDate: range[1].format("YYYY-MM-DD"),
      page: 1,
      size: tableData.size,
      ...extraParams
    });
  };

  const handleSearch = () => {
    fetchData(selectedUnitCode, rangeValue);
  };

  const handlePageChange = params => {
    fetchData(energyUnitCode, rangeValue, params);
  };

  return (
    <Page
      pageId={props.pageId}
      pageTitle={PageTitle[type]}
      style={{ backgroundColor: "unset" }}
    >
      <section className={styles["page-container"]}>
        <PowerQualityFilter
          back={props.back}
          rangeValue={rangeValue}
          selectedUnitCode={selectedUnitCode}
          energyList={energyList}
          setRangeValue={setRangeValue}
          setSelectedUnitCode={setSelectedUnitCode}
          onSearch={handleSearch}
        />
        <PowerQualityCommonTable
          className={styles["table-container"]}
          type={type}
          fetchData={handlePageChange}
          rangeValue={rangeValue}
          selectedUnitCode={selectedUnitCode}
          stationId={stationId}
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
  power_quality_common_detail,
  mapStateToProps
)(EnergyUnitDetail);
