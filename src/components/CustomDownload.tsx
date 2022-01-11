import React from "react";
import classnames from "classnames";
import styles from "./style/custom-download.less";
import Export from "./layout/Export";
import { exportFile } from "../util/fileUtil";
import Tools from "./layout/Tools";
import { Button } from "wanke-gui";
import utils from "../public/js/utils";

// 根据exportFormat格式化导出数据
export function formatExportData(dataSource: any = [], columns: any[] = []) {
  const data = [];
  dataSource.forEach(item => {
    const columnData = { ...item };
    columns.forEach(column => {
      const key = column.dataIndex;
      if (key && column.exportFormat) {
        columnData[key] = column.exportFormat(item[key], item);
      }
    });
    data.push(columnData);
  });
  return data;
}

interface Props {
  columns: Array<any>;
  dataSource: Array<any> | Function;
  loading?: boolean;
  className?: string;
}

const CustomDownload: React.FC<Props> = props => {
  const {
    columns,
    dataSource,
    className,
    loading
  } = props;

  const handleExport = () => {
    let data = [];
    if (Array.isArray(dataSource)) {
      data = dataSource;
      exportFile(columns, data);
    } else {
      const dataSourceRes = dataSource();
      if (dataSourceRes instanceof Promise) {
        dataSourceRes.then(result => {
          data = result.results || [];
          exportFile(columns, data);
        });
      } else {
        data = dataSourceRes.results;
        exportFile(columns, data);
      }
    }
  }

  return (
    <div
      className={classnames({
        [styles["custom-download"]]: true,
        [className]: !!className
      })}
    >
      <Button style={{ marginLeft: 8 }} onClick={() => handleExport()} type="primary">
        {utils.intl('导出')}
      </Button>
    </div>
  );
};

export default CustomDownload;
