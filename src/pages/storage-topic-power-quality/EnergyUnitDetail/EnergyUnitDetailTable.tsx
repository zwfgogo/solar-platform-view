import React, { useEffect } from "react";
import classnames from "classnames";
import { Pagination, Table1 } from 'wanke-gui'
import CustomDownload, {
  formatExportData
} from "../../../components/CustomDownload";
import { Columns, DetailPageType } from "../constant";
import styles from "./EnergyUnitDetailTable.less";
import { CrumbsPortal } from "../../../frameset/Crumbs";

interface Props {
  className?: string;
  list?: Array<any>;
  tableLoading?: boolean;
  type: DetailPageType;
}

const EnergyUnitDetailTable: React.FC<Props> = ({
  className,
  tableLoading,
  list,
  type
}) => {
  const columns: any = Columns[type];
  return (
    <div
      className={classnames(styles["page-container"], {
        [className]: !!className
      })}
    >
      <div className={styles["table-container"]}>
        <Table1
          x={500}
          columns={columns}
          dataSource={list}
          loading={tableLoading}
        />
      </div>
      <CrumbsPortal pageName='energyUnitDetail'>
        <CustomDownload
          dataSource={() => {
            return { results: formatExportData(list, columns) };
          }}
          className={styles["export-btn"]}
          columns={columns}
          loading={false}
        />
      </CrumbsPortal>
    </div>
  );
};

export default EnergyUnitDetailTable;
