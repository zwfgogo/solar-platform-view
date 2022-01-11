import React from "react";
import classnames from "classnames";
import CommonTitle from "../../../components/CommonTitle";
import { Progress } from "wanke-gui";
import BatteryImg from "../../../static/img/overview-battery-icon.png";
import styles from "./styles/batteryInfoCard.less";

interface Props {
  className?: string;
  data: any;
}

const BatteryInfoCard: React.FC<Props> = props => {
  const { className = "", data = {} } = props;
  const { energy = {}, capacity = {}, SOC = {} } = data;

  return (
    <div className={classnames(className, styles["battery-info"])}>
      <CommonTitle title="储能信息" style={{ flexShrink: 0 }} />
      <div className={styles["content"]}>
        <div className={styles["icon"]}>
          <img src={BatteryImg} />
        </div>
        <div className={styles["text-box"]}>
          <p className={styles["desc"]}>
            <span>当前剩余电量</span>
            <span>{SOC.value ? `${SOC.value}${SOC.unit}` : ""}</span>
          </p>
        </div>
      </div>
      <Progress
        style={{ flexShrink: 0 }}
        percent={SOC.value ? SOC.value : 0}
        showInfo={false}
        strokeColor={{
          "0%": "#1752c8",
          "100%": "#3d7eff"
        }}
      />
      <div className={styles["footer"]}>
        储能容量:{capacity.value}
        {capacity.unit}
      </div>
    </div>
  );
};

export default BatteryInfoCard;
