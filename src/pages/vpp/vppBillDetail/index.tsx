import React, { useEffect } from "react";
import Page from "../../../components/Page";
import PageProps from "../../../interfaces/PageProps";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import { VppBillDetailModal, DATE_TYPE } from "../models/vppBillDetail";
import styles from "./index.less";
import { makeConnect } from "../../umi.helper";
import { vpp_bill_detail } from "../../constants";
import VppBillDetailTable from "./components/vppBillDetailTable";
import Tools from "../../../components/layout/Tools";
import Export from "../../../components/layout/Export";
import Back1 from "../../../components/layout/Back1";
import FullContainer from "../../../components/layout/FullContainer";
import { BOARD_TYPE } from "../models/vppBill";
import moment from "moment";

const nextBoardType = {
  [DATE_TYPE.YEAR]: DATE_TYPE.MONTH,
  [DATE_TYPE.MONTH]: DATE_TYPE.DAY
};

const prevBoardType = {
  [DATE_TYPE.DAY]: DATE_TYPE.MONTH,
  [DATE_TYPE.MONTH]: DATE_TYPE.YEAR
};

interface Props
  extends VppBillDetailModal,
    PageProps,
    MakeConnectProps<VppBillDetailModal> {
  loading?: boolean;
  vppId?: number;
  enterBoardType?: BOARD_TYPE;
}

const VppBillDetail: React.FC<Props> = props => {
  const {
    action,
    loading,
    query,
    onPageChange,
    totalCount,
    list,
    headerUnit,
    vppId,
    enterBoardType,
    updateQuery,
    updateState
  } = props;

  const fetchData = () => {
    action("getTableData", { vppId });
  };

  const handleTimeClick = (timeStr: string) => {
    updateState({
      list: [],
      totalCount: 0
    });
    updateQuery({
      page: 1,
      size: 20,
      dateType: nextBoardType[query.dateType],
      date: moment(timeStr)
    });
  };

  const handlePageChange = (page, size) => {
    updateQuery({ page, size });
    fetchData();
  };

  const handleBack = () => {
    if (query.dateType === (enterBoardType as any)) {
      props.back();
      return;
    }
    updateState({
      list: [],
      totalCount: 0
    });
    updateQuery({
      page: 1,
      size: 20,
      dateType: prevBoardType[query.dateType]
    });
  };

  useEffect(() => {
    if (query.dateType !== DATE_TYPE.EMPTY) {
      fetchData();
    }
  }, [query.dateType]);

  useEffect(() => {
    return () => {
      action("reset");
    };
  }, []);

  return (
    <Page
      pageId={props.pageId}
      pageTitle="详细"
      style={{ backgroundColor: "unset" }}
    >
      <section className={styles["page-container"]}>
        <div className="flex1">
          <VppBillDetailTable
            onTimeClick={handleTimeClick}
            headerUnit={headerUnit}
            dateType={query.dateType}
            loading={loading}
            page={query.page}
            size={query.size}
            onPageChange={handlePageChange}
            total={totalCount}
            dataSource={list}
          />
        </div>
        <Tools>
          <Export onExport={() => action("onExport", { vppId })} />
          <Back1 back={handleBack} />
        </Tools>
      </section>
    </Page>
  );
};

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    loading: getLoading("getTableData")
  };
};

export default makeConnect(vpp_bill_detail, mapStateToProps)(VppBillDetail);
