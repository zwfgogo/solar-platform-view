import React, { useEffect, useState } from "react";
import { Button, Modal, Table1 } from 'wanke-gui'
import { ModalProps } from 'antd/lib/modal';
import moment, { Moment } from "moment";
import styles from "./styles/commonAbnormalModal.less";
import Export from "../../../components/layout/Export";
import { exportFile } from "../../../util/fileUtil";
import Tools from "../../../components/layout/Tools";
import { disabledDateAfterToday } from "../../../util/dateUtil";
import RangePicker from "../../../components/rangepicker";
import utils from "../../../public/js/utils";

export function getDefaultTimeByMode(mode: string) {
  const timeArr = [];
  if (/day/.test(mode)) {
    let range = Number(mode.replace("day-", ""));
    range = isNaN(range) ? 29 : range - 1;
    timeArr.push(moment().subtract(range, "days"));
    timeArr.push(moment());
  } else if (mode === "month") {
    timeArr.push(moment().subtract(11, "month"));
    timeArr.push(moment());
  }
  return timeArr;
}

interface Props extends ModalProps {
  fetchData: (date: Moment[]) => void;
  fetchExportData: () => any;
  columns: any[];
  dataSource?: any[];
  tableLoading?: boolean;
  exportTableLoading?: boolean;
  mode?: string;
}

const CommonAbnormalModal: React.FC<Props> = ({
  visible,
  dataSource,
  tableLoading,
  exportTableLoading,
  fetchData,
  fetchExportData,
  columns,
  mode,
  ...restProps
}) => {
  // const { height } = useWindowResize();
  const [rangeValue, setRangeValue] = useState([]);

  const handleExport = () => {
    const data = fetchExportData();
    exportFile(columns, data.results, null, { fileType: data.fileType });
  };

  const onRangeChange = (date, dateString) => {
    setRangeValue(date);
  };

  const handlePanelChange = date => {
    setRangeValue(date);
  };

  useEffect(() => {
    setRangeValue(getDefaultTimeByMode(mode));
  }, [mode]);

  useEffect(() => {
    if (visible && rangeValue.length > 0) {
      setTimeout(() => {
        fetchData(rangeValue);
      }, 300);
    }
  }, [visible, rangeValue]);

  const disabledDate = current => {
    return current && current > moment().endOf("day");
  };

  return (
    <Modal
      {...restProps}
      footer={null}
      className={styles["modal"]}
      visible={visible}
      width={800}
    >
      <div className={styles["content"]}>
        <div className={styles["menu"]}>
          <div>
            <span>{utils.intl('日期')}：</span>
            {mode === "month" ? (
              <RangePicker
                disabledDate={current => disabledDateAfterToday(current, 'month')}
                allowClear={false}
                format={"YYYY-MM"}
                onPanelChange={handlePanelChange}
                value={rangeValue as any}
                picker="month"
              />
            ) : (
                <RangePicker
                  disabledDate={disabledDateAfterToday}
                  allowClear={false}
                  mode={["date", "date"]}
                  format={"YYYY-MM-DD"}
                  onChange={onRangeChange}
                  value={rangeValue as any}
                />
              )}
          </div>
          <div style={{ flexGrow: 1, textAlign: 'right' }}>
            <Button onClick={() => handleExport()} type="primary">
              {utils.intl('导出')}
            </Button>
          </div>
        </div>
        <div className={styles["table-container"]}>
          <Table1
            x={500}
            columns={columns}
            dataSource={dataSource}
            loading={tableLoading}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CommonAbnormalModal;
