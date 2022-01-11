import React, { useState, useEffect, useRef } from "react";
import styles from "./style/tab-select.less";

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

const TabSelect: React.FC<Props> = props => {
  const { list = [], onClick, value, size = 'normal' } = props;
  const childWidthList = useRef([])

  const handleClick = item => {
    onClick && onClick(item);
  };

  const handleChangeWidth = (width, index) => {
    childWidthList.current[index] = width
  }

  let activeIndex = -1
  list.forEach((item, index) => {
    if (item.key === value) {
      activeIndex = index
    }
  })

  const getLeft = (index): number => {
    if (index === -1) return 0

    return childWidthList.current
      .slice(0, index)
      .reduce((prev, next) => prev + next, 0)
  }

  return (
    <div className={`${styles["tab-select"]} ${styles[size]}`}>
      {list.map((item, index) => (
        <TabItem
          key={index}
          index={index}
          active={value === item.key}
          name={item.name}
          onClick={() => handleClick(item)}
          changeWidth={handleChangeWidth}
        />
      ))}
      <div
        className={styles["tab-block"]}
        style={{
          width: activeIndex > -1 ? (childWidthList.current[activeIndex] ?? 0) : 0,
          transform: `translateX(${getLeft(activeIndex)}px)`
        }}
      />
    </div>
  );
};

export default TabSelect;

interface TabItemProps {
  active: boolean
  name: string
  index: number
  onClick: () => void
  changeWidth: (width, index) => void
}

const TabItem : React.FC<TabItemProps> = props => {
  const ref = React.createRef<HTMLAnchorElement>()

  useEffect(() => {
    props.changeWidth?.(ref.current.offsetWidth, props.index)
  }, [props.name, props.index])

  useEffect(() => {
    return () => {
      props.changeWidth?.(0, props.index)
    }
  }, [])

  return (
    <a
      ref={ref}
      className={`${styles["option"]} ${
        props.active ? styles["active"] : ""
      }`}
      onClick={props.onClick}
    >{props.name}</a>
  )
}
