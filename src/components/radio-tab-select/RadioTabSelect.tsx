import React, { useState, useEffect, useRef } from "react";
import { Radio } from "wanke-gui";
import "./radio-tab-select.less";

interface Item {
  name: string;
  key: string;
  value: any;
}

interface Props {
  list: Item[];
  onClick?: (item: Item) => void;
  value: string;
  size?: 'normal' | 'large';
}

const RadioTabSelect: React.FC<Props> = props => {
  const { list = [], onClick, value, size = 'normal' } = props;

  const handleClick = item => {
    onClick && onClick(item);
  };

  return (
    <Radio.Group value={value} className="radio-tab-select">
      {list.map(tab => (
        <Radio.Button value={tab.key} onClick={() => handleClick(tab)}>{tab.name}</Radio.Button>
      ))}
    </Radio.Group>
  );
};

export default RadioTabSelect;
