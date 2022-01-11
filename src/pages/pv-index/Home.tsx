import React, { useEffect, useMemo } from "react";
import { connect } from "dva";
import { Col, Row } from "wanke-gui";
import OverviewCard from "./components/OverviewCard";
import ReportCard from "./components/ReportCard";
import PowerAnalysisChart from "./components/PowerAnalysisChart";
import IncomeAnalysisChart from "./components/IncomeAnalysisChart";
import MyCard from "./components/MyCard";
import styles from "./home.less";
import RankCard from "./components/RankCard";
import { GfGenerateElectricityCircleOutlined, GfIncomeCircleOutlined, GfLeafCircleOutlined } from "wanke-icon";
import { addSpaceWidthUnit } from "../pv-station-monitor/index/components/powerStationTable";
import utils from '../../public/js/utils'
import classnames from 'classnames'
import { traverseTree } from "../page.helper";
import { globalNS } from "../constants";

const overviewTitle = [utils.intl("index.发电量"), utils.intl("index.收益"), utils.intl("index.CO2减排")];
const overviewSubTitle = [utils.intl("index.今日发电量"), utils.intl("index.今日收益"), utils.intl("index.今日CO2减排")];
const rankTitle = [utils.intl("index.满发时长排行"), utils.intl("index.PR排行")];
const rankKey = ["timeRank", "PRRank"]

function isEmpty(value) {
  if(value || value === 0) return false
  return true
}

interface Props {
  dispatch: any
  overviewList: any[]
  rankList: any[]
  incomeChart: any
  stationList: any[]
  baseInfo: any
  abnormalChart: any[]
  rankMods: string[]
  menu: any[]
  time: any
  socketLoading: any
}

const Index: React.FC<Props> = props => {
  const {
    overviewList,
    rankList,
    dispatch,
    stationList,
    baseInfo,
    abnormalChart,
    rankMods,
    menu,
    socketLoading,
    time
  } = props;

  const curDay = useMemo(() => {
    if (!time.year || !time.month || !time.day) return '';
    return `${time.year}-${time.month}-${time.day}`;
  }, [time])

  useEffect(() => {
    dispatch({ type: "indexPage/getStationEnum" });
    return () => {
      dispatch({ type: "indexPage/reset" })
      dispatch({ type: "indexPage/closeSocket" });
    }
  }, []);

  useEffect(() => {
    // 用户无电站的时候不调用查询接口
    console.log('start 1', stationList, curDay)
    if(stationList && stationList.length && curDay) {
      console.log('start')
      fetchData();
      return () => {
        console.log('close')
        dispatch({ type: "indexPage/resetSocketDate" })
        dispatch({ type: "indexPage/closeSocket" });
      }
    } else if(!stationList || !stationList.length) {
      dispatch({ type: "indexPage/reset" })
    }
  }, [JSON.stringify(stationList), curDay])

  const fetchData = () => {
    dispatch({ type: "indexPage/init", payload: { dispatch } })
  };

  const handleRangeChange = (key: string, index: number) => {
    if(rankMods[index] !== key) {
      const newRankMods = rankMods.slice()
      newRankMods[index] = key
      const newRankList = rankList.slice()
      newRankList[index] = []
      dispatch({ type: "indexPage/updateToView", payload: { rankMods: newRankMods, rankList: newRankList } })
      dispatch({ type: "indexPage/emitSocket", payload: { eventName: rankKey[index], params: { mod: key, viewTime: curDay } } })
    }
  }

  // 用于判断是否有告警菜单权限
  const warningMenuItem = traverseTree(menu, item => item.key === '/alert-service/abnormal' ? item : null)

  return (
    <article className={classnames(styles["page-container"], "home-container")}>
      <header className={styles["summary"]}>
        <p className={styles["station-count"]}>{utils.intl("index.电站数量")}:{baseInfo.station?.count ?? ''}</p>
        <p className={styles["station-info"]}>
          <span>{utils.intl("index.装机总容量")}:<span className={styles["value"]}>{addSpaceWidthUnit(baseInfo.scale?.value ?? '')}</span>
          </span>
          <span>{utils.intl("index.集中式电站")}:<span className={styles["value"]}>
              {!isEmpty(baseInfo.centralizedStation?.count) ? `${utils.intl('index.{0}座', baseInfo.centralizedStation.count)}` : ''}
              {baseInfo.centralizedStation?.value ? ` (${addSpaceWidthUnit(baseInfo.centralizedStation.value)})` : ''}
            </span>
          </span>
          <span>{utils.intl("index.分布式电站")}:<span className={styles["value"]}>
              {!isEmpty(baseInfo.distributedStation?.count)? `${utils.intl('index.{0}座', baseInfo.distributedStation.count)}` : ''}
              {baseInfo.distributedStation?.value ? ` (${addSpaceWidthUnit(baseInfo.distributedStation.value)})` : ''}
            </span>
          </span>
        </p>
      </header>
      <Row gutter={10} className={styles["header"]}>
        {overviewList.map((item, index) => (
          <Col span={8}>
            <OverviewCard
              key={index}
              title={overviewTitle[index]}
              subTitle={overviewSubTitle[index]}
              dataList={item}
              index={index}
              getIcon={(props) => {
                if(index === 0) {
                  return <GfGenerateElectricityCircleOutlined {...props} />
                }
                if(index === 1) {
                  return <GfIncomeCircleOutlined {...props} />
                }
                return <GfLeafCircleOutlined {...props} style={{ ...props.style, color: '#3dd598' }} />
              }}
            />
          </Col>
        ))}
      </Row>
      <footer className={styles["footer"]}>
        <section
          className={`${styles["chart-container"]} ${styles["footer-card"]}`}
          // style={{ paddingRight: 10}}
        >
          <PowerAnalysisChart className={styles["footer-half-height"]} theme={props.theme} viewTime={curDay} loading={socketLoading['electric']} />
          <IncomeAnalysisChart className={styles["footer-half-height"]} theme={props.theme} viewTime={curDay} loading={socketLoading['profit']} />
        </section>
        <section className={styles["footer-card"]}>
          <div
            className={`${styles["station-install-statistics"]}`}
          >
            {rankList.map((list, index) => (
              <MyCard className={styles["statistics-container"]} style={{  }}>
                <RankCard
                  title={rankTitle[index]}
                  key={index}
                  list={list}
                  isPercent={index === 1}
                  mod={rankMods[index]}
                  handleRangeChange={(key) => handleRangeChange(key, index)}
                  loading={socketLoading[index === 1 ? 'PRRank' : 'timeRank']}
                />
              </MyCard>
            ))}
          </div>
          <ReportCard
            jumpAllowed={!!warningMenuItem}
            className={`${styles["report-container"]}`}
            abnormalChart={abnormalChart}
          />
        </section>
      </footer>
    </article>
  );
};

const mapStateToProps = state => ({
  ...state.indexPage,
  theme: state[globalNS].theme,
  menu: state[globalNS].menu,
  time: state[globalNS].time
});
export default connect(mapStateToProps)(Index);
