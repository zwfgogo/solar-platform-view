import React, { ReactNode, useEffect, useState, useMemo } from "react";
import classnames from "classnames";
import { connect } from "dva";
import GenerationCharts from "./components/generationCharts";
import StatisticalCard from "./components/statisticalCard";
import EnergyStoredCharts from "./components/energyStoredCharts";
import BatteryInfoCard from "./components/batteryInfoCard";
import { Bubble } from "wanke-gui";
import VppImg from "../../static/img/overview-vpp-icon.png";
import PvImg from "../../static/img/overview-pv-icon.png";
import EnergyImg from "../../static/img/overview-energy-icon.png";
import OnlineImg from "../../static/img/overview-online-icon.png";
import styles from "./index.less";
import _ from 'lodash'
import { Vpp_Socket_Port, globalNS } from "../constants"

import SocketClient from 'socket.io-client';
let socketClient;
function formatEmptyValue(val) {
  return val === null || val === undefined ? "" : val;
}

interface SummaryCardProps {
  iconSize: number;
  icon: string;
  label: { text: ReactNode; unit?: string }[];
  desc: { text: ReactNode }[];
  className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  iconSize,
  icon,
  label,
  desc,
  className = ""
}) => {
  return (
    <div className={classnames(styles["summary-card"], className)}>
      <div className={styles["icon"]}>
        <img src={icon} />
      </div>
      <div className={styles["summary-content"]}>
        <p className={styles["label"]}>
          <Bubble bubble={true} placement={undefined}>
            {label.map((item, index) => (
              <span key={index}>
                {index > 0 ? <span style={{ margin: "0 5px" }}>/</span> : ""}
                {item.text}
                <span className={styles["unit"]}>{item.unit}</span>
              </span>
            ))}
          </Bubble>
        </p>
        {desc.map((item, index) => (
          <p key={index} className={styles["desc"]}>
            {item.text}
          </p>
        ))}
      </div>
    </div>
  );
};

interface Props {
  dispatch: any;
  generationChartLoading: boolean;
  energyChartLoading: boolean;
  generationEnergyChartLoading: boolean;
  profitChartLoading: boolean;
  summaryData: any;
  batteryData: any;
  generationChart: any;
  energyStoredChart: any;
  generationEnergyData: any;
  profitData: any;
  time: any;
}

const Overview: React.FC<Props> = ({
  dispatch,
  generationChartLoading,
  energyChartLoading,
  generationEnergyChartLoading,
  profitChartLoading,
  summaryData,
  batteryData,
  generationChart,
  energyStoredChart,
  generationEnergyData,
  profitData,
  time
}) => {
  const [showLoading, setShowLoading] = useState(true);

  const curDay = useMemo(() => {
    if (!time.year || !time.month || !time.day) return '';
    return `${time.year}-${time.month}-${time.day}`;
  }, [time])

  useEffect(() => {
    fetchData();
    // const timer = setInterval(() => {
    //   if(showLoading) setShowLoading(false);
    //   fetchData();
    // }, 300000);
    return () => {
      // ??????socket??????
      dispatch({ type: "overview/closeSocket" });
    };
  }, []);

  const fetchData = () => {
    dispatch({ type: "overview/init", payload: {} });
  };

  const { site = {}, PV = {}, battery = {} } = summaryData;

  useEffect(() => {
    if(curDay) {
      dispatch({ type: "overview/initSocket", payload: { dispatch } })
    }
  }, [curDay])

  return (
    <article className={styles["page-container"]}>
      <section className={styles["header"]}>
        <div className={styles["card"]}>
          <SummaryCard
            className={styles["vpp-summary-card"]}
            iconSize={48}
            icon={VppImg}
            label={[{ text: summaryData.VPP }]}
            desc={[{ text: "VPP??????" }]}
          />
        </div>
        <div className={styles["card"]}>
          <SummaryCard
            className={styles["half-height"]}
            iconSize={30}
            icon={PvImg}
            label={[
              // {
              //   text: PV.power,
              //   unit: PV.powerUnit
              // },
              {
                text: PV.capacity,
                unit: PV.capacityUnit
              }
            ]}
            desc={[{ text: "??????????????????" }]}
          />
          <SummaryCard
            className={styles["half-height"]}
            iconSize={30}
            icon={EnergyImg}
            label={[
              {
                text: battery.power,
                unit: battery.powerUnit
              },
              {
                text: battery.capacity,
                unit: battery.capacityUnit
              }
            ]}
            desc={[{ text: "??????????????????" }]}
          />
        </div>
        <div className={styles["card"]}>
          <SummaryCard
            iconSize={48}
            icon={OnlineImg}
            label={[
              {
                text: site.onLine
              }
            ]}
            desc={[
              { text: "????????????" },
              { text: `????????????:${formatEmptyValue(site.total)}` }
            ]}
          />
        </div>
        <BatteryInfoCard
          className={classnames(styles["card"], styles["card-right"])}
          data={batteryData}
        />
      </section>
      <footer className={styles["footer"]}>
        <section className={styles["content"]}>
          <GenerationCharts
            className={classnames(styles["card"], styles["card-left"])}
            data={generationChart}
            loading={showLoading && generationChartLoading}
          />
          <StatisticalCard
            className={classnames(styles["card"], styles["card-right"])}
            title="????????????"
            infoList={[
              {
                value: generationEnergyData.curGeneration,
                desc: "????????????"
              },
              {
                value: generationEnergyData.cumulativeGeneration,
                desc: "???????????????"
              }
            ]}
            data={generationEnergyData}
            loading={showLoading && generationEnergyChartLoading}
          />
        </section>
        <section className={styles["content"]}>
          <EnergyStoredCharts
            className={classnames(styles["card"], styles["card-left"])}
            data={energyStoredChart}
            loading={showLoading && energyChartLoading}
          />
          <StatisticalCard
            className={classnames(styles["card"], styles["card-right"])}
            title="??????"
            infoList={[
              {
                value: profitData.curProfit,
                desc: "?????????"
              },
              {
                value: profitData.totalProfit,
                desc: "????????????"
              }
            ]}
            isUnitPrev={true}
            data={profitData}
            loading={showLoading && profitChartLoading}
          />
        </section>
      </footer>
    </article>
  );
};

const mapStateToProps = state => ({
  ...state.overview,
  generationChartLoading: state.loading.effects["overview/getGenerationChart"],
  energyChartLoading: state.loading.effects["overview/getEnergyStoredChart"],
  generationEnergyChartLoading:
    state.loading.effects["overview/getGenerationEnergy"],
  profitChartLoading: state.loading.effects["overview/getProfit"],
  time: state[globalNS].time
});
export default connect(mapStateToProps)(Overview);
