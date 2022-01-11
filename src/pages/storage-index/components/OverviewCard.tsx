import React from "react";
import MyCard from "./MyCard";
import CommonTitle from "./CommonTitle";
import styles from "./styles/overviewCard.less";
import utils from "../../../util/utils";
import { WankeBenefit1Outlined, WankeInPowerOutlined, WankeLowPowerOutlined } from 'wanke-icon'

function getPrevSymbol(str: string) {
  if (str === "元") return "¥";
  return "";
}

function formatEmptyValue(value: any) {
  return value === null || value === undefined ? "" : value;
}

interface CardData {
  name?: string;
  title?: string;
  prevTitle?: string;
  value?: string;
  unit?: string;
}

interface Props {
  dataList: CardData[];
  index: number;
}

const OverviewCard: React.FC<Props> = props => {
  let { dataList, index } = props;
  dataList = dataList.concat([{}, {}, {}, {}]).slice(0, 4);
  const totalItem = dataList[0];
  const detailList = dataList.slice(1, 4);

  const getNumber = (item: CardData, widthUnit?: boolean) => {
    return `${getPrevSymbol(item.unit)}${utils.addMicrometerOperator(
      formatEmptyValue(item.value).toString()
    )}${widthUnit && totalItem.unit ? `${totalItem.unit}` : ""}`;
  };

  return (
    <MyCard className={styles["overview-card"]}>
      <div className={styles["total"]}>
        <CommonTitle title={(totalItem.title || "")} />
        <div className={styles["icon"]}>
          {index == 0 && <WankeBenefit1Outlined/>}
          {index == 1 && <WankeInPowerOutlined/>}
          {index == 2 && <WankeLowPowerOutlined/>}
        </div>
        <p className={styles["number"]}>
          {getNumber(totalItem)}
        </p>
        <p className={styles["label"]}>
          {totalItem.name}
          {totalItem.unit ? `(${totalItem.unit})` : ""}
        </p>
      </div>
      <ul className={styles["detail"]}>
        {detailList.map(item => (
          <li className={styles["detail-item"]}>
            <p className={styles["number"]}>
              {getNumber(item)}
            </p>
            <p className={styles["label"]}>
              {(item.prevTitle || "")}
              {item.unit ? `(${item.unit})` : ""}
            </p>
          </li>
        ))}
      </ul>
    </MyCard>
  );
};

export default OverviewCard;
