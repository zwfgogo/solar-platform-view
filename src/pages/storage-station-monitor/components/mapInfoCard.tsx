import React, { useEffect, useState } from "react";
import classnames from "classnames";
import EmptyImg from "./emptyImg";
import {
  getStationStatus,
  getRunningStatus,
  formatEmptyValue
} from "./powerStationTable";
import {makeConnect} from '../../umi.helper'
import styles from "./styles/mapInfoCard.less";

import { WankeRunningOutlined } from "wanke-icon";
import { jumpToTerminalSystem } from "../contant";
import {storage_station_monitor} from '../../constants'
import Service from "../service";
import FullLoading from "../../../components/FullLoading";
import { getImageUrl } from "../../page.helper";

async function getStationDetail(id) {
  const res = await Service.getStationDetail({ id });
  const data = res.results || {};
  return data;
}

interface CardDataBlockProps {
  label;
}

const CardDataBlock: React.FC<CardDataBlockProps> = ({ label, children }) => {
  return (
    <div className={styles["card-data-block"]}>
      <p className={styles["content"]}>{children}</p>
      <p className={styles["label"]}>{label}</p>
    </div>
  );
};

interface Props {
  info: any;
}

let isClick = false;

const MapInfoCard: React.FC<Props> = props => {
  const {
    info
  } = props
  const [realStationMap, setRealStationMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [mapInfo, setMapInfo] = useState<any>({});

  const realData = realStationMap[info.id] || {};

  const stationStatus = mapInfo.stationStatus || {};
  const stationType = mapInfo.stationType || {};

  useEffect(() => {
    setLoading(true);
    getStationDetail(info.id).then(data => {
      setLoading(false);
      setMapInfo(data);
    });
  }, [info.id]);

  useEffect(() => {
    window.addEventListener('updateMapCard', handleUpdateInfo)
    return () => {
      window.removeEventListener('updateMapCard', handleUpdateInfo)
    }
  }, [])

  const handleUpdateInfo = (e) => {
    const { data = {} } = e
    setRealStationMap(data.realStationMap || {})
  }

  const handleMouseDown = () => {
    isClick = true;
  }

  const handleMouseMove = () => {
    if(isClick) {
      console.log('move');
      isClick = false;
    }
  };

  const handleMouseUp = () => {
    console.log(isClick);
    if(isClick) {
      isClick = false;
      jumpToTerminalSystem(info.id);
    }
  }

  return (
    <section className={styles["map-info-card"]}>
      { loading && (<FullLoading />) }
      <header className={styles["header"]}>
        {mapInfo.filePath ? (
          <img className={styles["image"]} src={getImageUrl(mapInfo.filePath)} />
        ) : (
          <EmptyImg />
        )}
      </header>
      <footer className={styles["footer"]}>
        <div className={styles["info"]}>
          <div className={styles["title"]}>
            <p
              className={styles["label"]}
              onMouseDown={handleMouseDown}
              // onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              title={mapInfo.title || ""}
            >
              {mapInfo.title || ""}
            </p>
            <p className={styles["desc"]}>
              电站类型：
              <span style={{ color: "#3d7eff" }}>
                {stationType.title}
              </span>
            </p>
            <p className={styles["desc"]}>
              建设规模：
              <span style={{ color: "#009297" }}>
                {formatEmptyValue(mapInfo.ratedPowerDisplay)}
              </span>
              /
              <span style={{ color: "#3d7eff" }}>
                {formatEmptyValue(mapInfo.scaleDisplay)}
              </span>
            </p>
          </div>
          <div className={styles["status"]}>
            <WankeRunningOutlined
              className={classnames(
                styles[getStationStatus(stationStatus.code)]
              )}
              style={{ fontSize: 20, marginRight: 5 }} />

            <span
              className={classnames(
                styles[getStationStatus(stationStatus.code)]
              )}
            >
              {stationStatus.title}
            </span>
          </div>
        </div>
        <div className={styles["data"]}>
          <CardDataBlock label="工作状态">
            {getRunningStatus(realData.workStatus, mapInfo.offLine)}
          </CardDataBlock>
          <CardDataBlock label="实时功率">
            {formatEmptyValue(realData.activePower, "-")}
          </CardDataBlock>
          <CardDataBlock label="今日充电量">
            {formatEmptyValue(realData.charge, "-")}
          </CardDataBlock>
          <CardDataBlock label="今日放电量">
            {formatEmptyValue(realData.discharge, "-")}
          </CardDataBlock>
        </div>
        <div className={styles["abnormal"]}>
          异常数量：<span className={styles["number"]}>{realData.warning}</span>个
        </div>
      </footer>
    </section>
  );
};


// const mapStateToProps = (model, {getLoading}, state) => {
//   // const {tableData, queryStr, realStationMap} = model
// console.log(model)
//   // let results = {
//   //   realStationMap
//   // }
//   // return results
// }

export default MapInfoCard
