import React, { useEffect } from "react";
import CustomDownload, {
  formatExportData
} from "../../../components/CustomDownload";
import Forward from "../../../public/components/Forward";
import styles from "./styles/benefitTable.less";
import { Moment } from "moment";
import { Table1 } from "wanke-gui";
import { CrumbsPortal } from "../../../frameset/Crumbs";
import utils from "../../../public/js/utils";
import { intlFormatEfficiency } from "../models";

interface Props {
  list?: Array<any>;
  tableLoading?: boolean;
  rangeValue?: Moment[];
  columns?: any[];
}

const BenefitTable: React.FC<Props> = ({
  tableLoading,
  list = [],
  rangeValue,
  columns = []
}) => {
  const getEnergyList = () => {
    return list.map(item => ({
      name: item.name,
      value: item.energyUnitId
    }));
  };

  const tableColumns = columns.map(item => {
    const row: any = {
      title: item.title,
      dataIndex: item.param,
    };
    switch (row.title) {
      case '序号':
        row.width = 100;
        break;
      case '能量单元':
        row.render = (text, record) => (
          <Forward
            to="benefitDetail"
            data={{
              energyUnitCode: record.energyUnitId,
              energyList: getEnergyList(),
              defaultRangeValue: rangeValue
            }}
          >
            {text}
          </Forward>
        )
        break;
      default:
        // row.align = 'right'
        break;
    }
    row.title = intlFormatEfficiency(row.title)
    return row;
  });

  const x = tableColumns.length * 150 || 500;

  return (
    <>
      <CrumbsPortal pageName='benefit'>
        <CustomDownload
          dataSource={() => {
            return { results: formatExportData(list, tableColumns) };
          }}
          className={styles["export-btn"]}
          columns={tableColumns}
          loading={false}
        />
      </CrumbsPortal>
      <div className={styles["table-container"]}>
        <Table1
          x={x}
          columns={tableColumns}
          dataSource={list}
          loading={tableLoading}
        />
      </div>
    </>
  );
};

export default BenefitTable;
