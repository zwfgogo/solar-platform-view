import React, { useEffect } from "react";
import classnames from "classnames";
import CustomDownload, {
  formatExportData
} from "../../../components/CustomDownload";
import styles from "./styles/incomeTable.less";
import moment from "moment";
import { Table1 } from 'wanke-gui'
import { CrumbsPortal } from "../../../frameset/Crumbs";
import utils from "../../../public/js/utils";

interface Props {
  className?: string;
  list?: Array<any>;
  tableLoading?: boolean;
  rangeType: string;
}

const IncomeTable: React.FC<Props> = ({
  className,
  tableLoading,
  rangeType,
  list = []
}) => {
  const columns: any = [
    {
      title: utils.intl('序号'),
      dataIndex: "key",
      width: 65,
    },
    {
      title: utils.intl('日期'),
      dataIndex: "date",
      exportFormat: text => {
        if (text === "合计") return text;
        return rangeType === "month" ? moment(text).format("YYYY年MM月") : text;
      }
    },
    {
      title: utils.intl('周期充电量') + "(kWh)",
      dataIndex: "cycleChargeCapacity",
    },
    {
      title: utils.intl('周期收益(元)'),
      dataIndex: "cycleIncome",
    },
    {
      title: utils.intl('平均度电收益(元/kWh)'),
      dataIndex: "averageIncome",
    },
    {
      title: utils.intl('收益可提升空间'),
      dataIndex: "spaceLifting",
    }
  ];
  return (
    <div
      className={classnames(styles["income"], {
        [className]: !!className
      })}
    >
      <CrumbsPortal>
        <CustomDownload
          dataSource={() => {
            return { results: formatExportData(list, columns) };
          }}
          className={styles["export-btn"]}
          columns={columns}
          loading={false}
        />
      </CrumbsPortal>
      <div className={styles["table-container"]}>
        <Table1
          x={500}
          columns={columns}
          dataSource={list}
          loading={tableLoading}
        />
      </div>
    </div>
  );
};

export default IncomeTable;
