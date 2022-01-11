import React, { useEffect } from "react";
import classnames from "classnames";
import CustomDownload, {
  formatExportData
} from "../../../components/CustomDownload";
import styles from "./styles/benefitDetailTable.less";
import { Table1, Table2 } from "wanke-gui";
import { CrumbsPortal } from "../../../frameset/Crumbs";
import utils from "../../../public/js/utils";
import { intlFormatEfficiency } from "../models";
import useLocalTablePage from "../../../hooks/useLocalTablePage";

interface Props {
  className?: string;
  list?: Array<any>;
  tableLoading?: boolean;
  columns?: any[];
  stationId: any
}

const BenefitDetailTable: React.FC<Props> = ({
  className,
  tableLoading,
  list,
  columns,
  stationId,
}) => {
  const tableColumns = columns.map(item => {
    const row: any = {
      title: item.title,
      dataIndex: item.param,
      width: 150
    };
    switch (row.title) {
      case '序号':
        row.width = 65;
        break;
      case '数据时间':
        break;
      default:
        // row.align = 'right'
        break;
    }
    row.title = intlFormatEfficiency(row.title)
    return row;
  });

  const x = tableColumns.length * 150 || 500;

  const {
    list: dataSource,
    page,
    pageSize,
    onPageChange
  } = useLocalTablePage({
    data: list,
    defaultPageSize: 20
  })

  useEffect(() => {
    onPageChange(1, pageSize)
  }, [JSON.stringify(list), stationId])

  return (
    <div
      className={classnames(styles["benefit-detail"], {
        [className]: !!className
      })}
    >
      <CrumbsPortal pageName='benefitDetail'>
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
        {tableColumns.length > 0 && (
          <Table2
            x={x}
            columns={tableColumns}
            dataSource={dataSource}
            loading={tableLoading}
            page={page}
            size={pageSize}
            total={list.length}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
};

export default BenefitDetailTable;
