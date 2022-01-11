import React from "react";
import classnames from "classnames";
import { Bubble } from "wanke-gui";
import {
  getStationStatus,
  getRunningStatus,
  formatEmptyValue
} from "./powerStationTable";
import EmptyImg from "./emptyImg";
import styles from "./styles/powerStationCard.less";
import { jumpToTerminalSystem } from "../contant";
import { getImageUrl } from "../../page.helper";

interface CardLineProps {
  iconColor?: string;
  label?: React.ReactNode;
}

const CardLine: React.FC<CardLineProps> = ({
  iconColor = "#3d7eff",
  label,
  children
}) => {
  return (
    <div className={styles["card-line"]}>
      <div className={styles["label"]}>
        <i className={styles["icon"]} style={{ backgroundColor: iconColor }} />
        {label}
      </div>
      <div className={styles["content"]}>
        <Bubble bubble={true} placement={undefined}>
          {children}
        </Bubble>
      </div>
    </div>
  );
};

interface Data {
  id: number;
  title: string;
  stationType: any;
  stationStatus: any;
  pvPower: string;
  pvCapacity: string;
  photoFiles: string[];
  workStatus: string;
  power: number;
  charge: number;
  discharge: number;
  warning: number;
  filePath: string;
  offLine?: boolean;
  ratedPowerDisplay?: string;
  scaleDisplay?: string;
}
interface Props {
  data: Data;
  realData: any;
  dispatch: any;
}

const PowerStationCard: React.FC<Props> = ({ data = {}, realData = {}, dispatch }) => {
  const { title = "" } = data;
  const stationStatus = data.stationStatus || {};
  const stationType = data.stationType || {};

  const handleTitleClick = () => {
    jumpToTerminalSystem(data.id);
  }

  return (
    <section className={styles["power-station-card"]}>
      <header className={styles["header"]}>
        {data.filePath ? (
          <img className={styles["image"]} src={getImageUrl(data.filePath)} />
        ) : (
          <EmptyImg />
        )}
        <p
          className={classnames(
            styles["station-status"],
            styles[getStationStatus(stationStatus.code)]
          )}
        >
          {stationStatus.title}
        </p>
        <p
          className={classnames(
            styles["station-title"],
            styles[getStationStatus(stationStatus.code)]
          )}
          onClick={handleTitleClick}
          title={`${title}(${stationType.title})`}
        >
          <span className={styles['title-before']}>{title}</span>
          <span className={styles['title-after']}>({stationType.title})</span>
        </p>
      </header>
      <footer className={styles["footer"]}>
        <CardLine label="工作状态">
          {getRunningStatus(realData['workStatus'], data.offLine)}
        </CardLine>
        <CardLine label="建设规模">
          <span style={{ color: "#009297" }}>
            {formatEmptyValue(data.ratedPowerDisplay)}
          </span>
          /
          <span style={{ color: "#3d7eff" }}>
            {formatEmptyValue(data.scaleDisplay)}
          </span>
        </CardLine>
        <CardLine label="实时功率">
          {formatEmptyValue(realData['activePower'], "-")}
        </CardLine>
        <CardLine label="今日充电量">
          {formatEmptyValue(realData['charge'], "-")}
        </CardLine>
        <CardLine label="今日放电量">
          {formatEmptyValue(realData['discharge'], "-")}
        </CardLine>
        <CardLine iconColor="#ff284b" label="异常告警数">
          {realData['warning']}条
        </CardLine>
      </footer>
    </section>
  );
};

export default PowerStationCard;
