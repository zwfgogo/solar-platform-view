import React from "react";
import { history } from 'umi'
import classnames from "classnames";
import { Bubble } from "wanke-gui";
import {
  getStationStatus,
  getRunningStatus,
  formatEmptyValue,
  addSpaceWidthUnit
} from "./powerStationTable";
import EmptyImg from "./emptyImg";
import styles from "./styles/powerStationCard.less";
import { jumpToTerminalSystem } from "../contant";
import StationImageCard from "./StationImageCard";
import { StatusMap } from "./MapInfoAside";
import { globalNS } from "../../../constants";
import Util from '../../../../public/js/utils';

const StatusClassNameMap = {
  'activate': 'put-in',
  'constructing': 'building',
  'debugging': 'debug',
  'testing': 'try-running',
  'deactivated': 'stop',
}

interface CardLineProps {
  label?: React.ReactNode;
}

const CardLine: React.FC<CardLineProps> = ({
  label,
  children
}) => {
  return (
    <div className={styles["card-line"]}>
      <div className={styles["label"]}>
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
  address?: string;
}
interface Props {
  data: Data;
  realData: any;
  dispatch: any;
}

const PowerStationCard: React.FC<Props> = ({ data = {}, realData = {}, dispatch }) => {
  const { title = "" } = data;
  const stationStatus = data.stationStatus;
  const stationType = data.stationType || {};

  const jumpToDetail = (url: string) => {
    dispatch({
      type: `${globalNS}/updateToView`,
      payload: {
        stationDetail: data,
        activeNode: data
      }
    })
    history.push(url)
  }

  const handleTitleClick = () => {
    jumpToDetail('/station-monitor/station_monitor')
  }

  return (
    <section className={styles["power-station-card"]}>
      <header className={styles["header"]}>
        <StationImageCard
          filePath={data.filePath}
          style={{ height: '9.3vw' }}
          heartBeat={realData['heartBeat']}
          temperature={formatEmptyValue(realData['temperature'])}
          weatherStatus={formatEmptyValue(realData['weatherStatus'])}
          windSpeed={formatEmptyValue(realData['windSpeed'])}
        />
        <div className={styles['station-title']}>
          <span title={data.title} onClick={handleTitleClick} style={{ cursor: 'pointer' }}>{data.title}</span>
          <span className={styles[StatusClassNameMap[stationStatus]]}>{StatusMap?.[stationStatus] || ' '}</span>
        </div>
        <div className={styles['station-desc']}>
          <span title={data.address}>{data.address}</span>
          <span>
            {Util.intl('建设规模')}:
            <span>
              <span style={{ color: "#009297" }}>
                {formatEmptyValue(data.ratedPowerDisplay)}
              </span>
              /
              <span style={{ color: "#3d7eff" }}>
                {formatEmptyValue(data.scaleDisplay)}
              </span>
            </span>
          </span>
        </div>
      </header>
      <footer className={styles["footer"]}>
        <CardLine label={Util.intl('实时发电功率')}>
          {addSpaceWidthUnit(formatEmptyValue(realData['activePower'], "-"))}
        </CardLine>
        <CardLine label={Util.intl('今日发电量')}>
          {addSpaceWidthUnit(formatEmptyValue(realData['generation'], "-"))}
        </CardLine>
        <CardLine label={Util.intl('今日收益')}>
          {addSpaceWidthUnit(formatEmptyValue(realData['revenue'], "-"))}
        </CardLine>
        <CardLine label={Util.intl('今日累计辐照')}>
          {addSpaceWidthUnit(formatEmptyValue(realData['irradiance'], "-"))}
        </CardLine>
        <CardLine label={Util.intl('今日满发时长')}>
          {addSpaceWidthUnit(formatEmptyValue(realData['yield'], "-"))}
        </CardLine>
        <CardLine label={Util.intl('今日PR')}>
          {formatEmptyValue(realData['pr'], "-")}
        </CardLine>
      </footer>
    </section>
  );
};

export default PowerStationCard;
