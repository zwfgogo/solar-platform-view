import React, { useState, useEffect } from "react";
import styles from "./styles/PowerQualityFilter.less";
import { Select, Button } from "wanke-gui";
import moment from "moment";
import { disabledDateAfterToday } from "../../../util/dateUtil";
import RangePicker from "../../../components/rangepicker";
import utils from "../../../public/js/utils";

const { Option } = Select;

interface Props {
  energyList: any[];
  rangeValue: moment.Moment[];
  selectedUnitCode: string;
  back?: any;
  onSearch?: (selectedUnitCode: string, rangeValue?: moment.Moment[]) => void;
  setRangeValue: any;
  setSelectedUnitCode: any;
}

const PowerQualityFilter: React.FC<Props> = props => {
  const {
    energyList,
    onSearch,
    rangeValue,
    setRangeValue,
    selectedUnitCode,
    setSelectedUnitCode
  } = props;

  const handleSearch = () => {
    onSearch && onSearch(selectedUnitCode, rangeValue);
  };

  const onRangeChange = (date, dateString) => {
    setRangeValue(date);
  };

  const changeEnergyUnit = val => {
    setSelectedUnitCode(val);
  };

  return (
    <div className={styles["menu"]}>
      <div>
        <span className={styles["label"]}>{utils.intl('能量单元')}:</span>
        <Select
          placeholder={utils.intl('请选择能量单元')}
          style={{ width: 150, marginRight: 16 }}
          onChange={changeEnergyUnit}
          value={selectedUnitCode}
          allowClear={false}
        >
          {energyList.map(item => (
            <Option key={item.value} value={item.value}>
              <span title={item.name}>{item.name}</span>
            </Option>
          ))}
        </Select>
        <span className={styles["label"]}>{utils.intl('日期')}:</span>
        <RangePicker
          disabledDate={current => disabledDateAfterToday(current)}
          allowClear={false}
          onChange={onRangeChange}
          value={rangeValue as any}
        />
        <Button type="primary" onClick={handleSearch} style={{ marginLeft: 10 }}>
          {utils.intl('查询')}
        </Button>
      </div>
    </div>
  );
};

export default PowerQualityFilter;
