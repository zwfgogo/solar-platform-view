import React, { useEffect } from "react";
import classnames from "classnames";
import { Pagination, Table1 } from 'wanke-gui'
import CustomDownload, {
  formatExportData
} from "../../../components/CustomDownload";
import styles from "./styles/PowerQualityCommonTable.less";
import { Columns, DetailPageType } from "../constant";
import { useTable } from "../../../components/useTable";
import { power_quality_common_detail } from "../../constants";
import { makeConnect } from "../../umi.helper";
import { EnergyDetailModal } from "../models/EnergyUnitDetail";
import PageProps from "../../../interfaces/PageProps";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import moment from "moment";
import { CrumbsPortal } from "../../../frameset/Crumbs";
import utils from "../../../public/js/utils";

interface Props
  extends EnergyDetailModal,
  PageProps,
  MakeConnectProps<EnergyDetailModal> {
  className?: string;
  list?: Array<any>;
  tableLoading?: boolean;
  type: DetailPageType;
  size?: number;
  page?: number;
  totalCount?: number;
  exportTableLoading?: boolean;
  fetchData: (params: any) => void;
  rangeValue: moment.Moment[];
  selectedUnitCode: string;
  stationId: number
}

const PowerQualityCommonTable: React.FC<Props> = ({
  className,
  tableLoading,
  list,
  type,
  exportTableLoading,
  page,
  size,
  totalCount,
  fetchData,
  action,
  rangeValue,
  selectedUnitCode,
  stationId
}) => {
  const columns: any = Columns[type];

  const showTotal = (total: number) => {
    return <span className={styles["total-account"]}>{utils.intl('共{$}条', total)}</span>;
  };

  const { changePage, changeSize } = useTable({
    page,
    size,
    fetchData,
    dataSource: list
  });

  const exportTableData = () => {
    return new Promise(r => {
      action("exportTableData", {
        type,
        stationId,
        energyUnitCode: selectedUnitCode,
        startDate: rangeValue[0].format("YYYY-MM-DD"),
        endDate: rangeValue[1].format("YYYY-MM-DD"),
        success: tableData => {
          r({ results: formatExportData(tableData, columns) });
        }
      });
    });
  };

  return (
    <div
      className={classnames(styles["page-container"], {
        [className]: !!className
      })}
    >
      <div className={styles["table-container"]}>
        <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
          <Table1
            x={500}
            columns={columns}
            dataSource={list}
            loading={tableLoading}
          />
        </div>
      </div>
      <CrumbsPortal pageName='powerQualityDetail'>
        <CustomDownload
          dataSource={() => {
            return exportTableData();
            // return { results: formatExportData(list, columns) };
          }}
          className={styles["export-btn"]}
          columns={columns}
          loading={exportTableLoading}
        />
      </CrumbsPortal>
      <div className={styles["page-footer"]}>
        <div className={styles["export-btn"]}></div>
        {list && list.length ?
          <Pagination
            current={page}
            total={totalCount}
            pageSize={size}
            pageSizeOptions={["20", "30", "50", "100"]}
            showTotal={showTotal}
            onChange={changePage}
            onShowSizeChange={changeSize}
            showSizeChanger
            showQuickJumper={true}
          />
          : ''}
      </div>
    </div>
  );
};

const mapStateToProps = (model, getLoading) => {
  return {
    ...model.tableData,
    tableLoading: getLoading("getData"),
    exportTableLoading: getLoading("exportTableData")
  };
};

export default makeConnect(
  power_quality_common_detail,
  mapStateToProps
)(PowerQualityCommonTable);
