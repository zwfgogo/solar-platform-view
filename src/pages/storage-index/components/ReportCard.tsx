import React, { useEffect, useRef } from "react";
import { history } from "umi";
import Scrolling, { ScrollingRefProps } from "./Scrolling";
import MyCard from "./MyCard";
import CommonTitle from "./CommonTitle";
import styles from "./styles/reportCard.less";
import utils from "../../../public/js/utils";
import { FullLoading } from "wanke-gui";

enum SEVERITY_LEVEL {
  MIDDLE = "middle",
  BADLY = "badly",
  NORMAL = "normal"
}

interface Props {
  reportList: any[];
  className?: string;
  loading?: boolean
}

const ReportCard: React.FC<Props> = props => {
  const { className = "", reportList } = props;
  const scrollingRef = useRef<ScrollingRefProps>()

  useEffect(() => {
    scrollingRef.current.resetScrolling()
  }, [JSON.stringify(reportList)])

  const getSeverityLevel = item => {
    const { alarmLevelName = "" } = item;
    switch (alarmLevelName.toString()) {
      case "Moderate":
        return SEVERITY_LEVEL.MIDDLE;
      case "Serious":
        return SEVERITY_LEVEL.BADLY;
      default:
        return SEVERITY_LEVEL.NORMAL;
    }
  };

  const jumpToDetail = () => {
    history.push("/abnormal-alarm/abnormal");
  };

  return (
    <MyCard className={`${styles["report-card"]} ${className}`}>
      <CommonTitle className={styles["title"]} title={utils.intl('index.实时异常')} />
      <div className={styles["scroll-container"]}>
        {props.loading && <FullLoading />}
        <Scrolling ref={scrollingRef}>
          {reportList.map((item, index) => (
            <p
              className={`${styles["report-item"]} ${
                styles[getSeverityLevel(item)]
              }`}
              key={item.id}
              onClick={jumpToDetail}
            >
              <i className={styles["icon"]} />
              <span className={styles["level-tag"]}>
                [{item.alarmLevelTitle}]
              </span>
              <span className={styles["content"]}>
                【{item.alarmTypeTitle ? item.alarmTypeTitle : ''}】{item.startTime + " "}
                {item.stationTitle},{item.devTitle}{item.alarmTitle ? `,${item.alarmTitle}` : ""}
              </span>
            </p>
          ))}
        </Scrolling>
      </div>
    </MyCard>
  );
};

export default ReportCard;
