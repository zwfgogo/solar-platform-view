import React, {useEffect, useMemo} from 'react'
import {connect} from 'dva'
import {Col, Row} from 'wanke-gui'
import OverviewCard from './components/OverviewCard'
import StatisticCard from './components/StatisticCard'
import ReportCard from './components/ReportCard'
import PowerAnalysisChart from './components/PowerAnalysisChart'
import ReportAnalysisChart from './components/ReportAnalysisChart'
import MyCard from './components/MyCard'
import styles from './home.less'
import {makeConnect} from '../umi.helper'
import {storage_index, globalNS} from '../constants'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import utils from '../../public/js/utils'

const statisticTitleList = [utils.intl('index.电站总量'), utils.intl('index.装机总量')]

interface Props extends MakeConnectProps<any>{
  dispatch: any;
  overviewList: any[];
  statisticList: any[];
  reportList: any[];
  stationList: any[];
  time: any
  socketLoading: any
}

const Index: React.FC<Props> = props => {
  const {overviewList, statisticList, reportList, stationList, time, dispatch, socketLoading = {}} = props

  const curDay = useMemo(() => {
    if (!time.year || !time.month || !time.day) return '';
    return `${time.year}-${time.month}-${time.day}`;
  }, [time])

  useEffect(() => {
    props.action("getStationEnum")
  }, [])

  useEffect(() => {
    // 用户无电站的时候不调用查询接口
    console.log('start 1', stationList, curDay)
    if(stationList && stationList.length && curDay) {
      console.log('start')
      fetchData();
      return () => {
        console.log('close')
        props.action("resetSocketDate")
        props.action("closeSocket")
      }
    } else if(!stationList || !stationList.length) {
      props.action("reset")
    }
  }, [JSON.stringify(stationList), curDay])

  // useEffect(() => {
  //   let timer
  //   // 用户无电站的时候不调用查询接口
  //   if (stationList && stationList.length) {
  //     fetchData()
  //     timer = setInterval(fetchData, 60000)
  //   } else {
  //     props.action("reset")
  //   }
  //   return () => {
  //     if (timer) {
  //       clearInterval(timer)
  //     }
  //   }
  // }, [JSON.stringify(stationList)])

  const fetchData = () => {
    props.action("init", { dispatch })
    // fetchOverviewList()
    fetchStatisticList()
    // fetchReportList()
  }

  const fetchOverviewList = () => {
    props.action("getOverviewList", {})
  }

  const fetchStatisticList = () => {
    props.action("getStatisticList", {})
  }

  const fetchReportList = () => {
    props.action("getReportList", {})
  }

  return (
    <article className={styles['page-container']}>
      <Row gutter={10} className={styles['header']}>
        {overviewList.map((item, index) => (
          <Col span={8}>
            <OverviewCard
              key={index}
              dataList={item}
              index={index}
            />
          </Col>
        ))}
      </Row>
      <footer className={styles['footer']}>
        <section
          className={`${styles['chart-container']} ${styles['footer-card']}`}
        >
          <PowerAnalysisChart className={styles['footer-half-height']} viewTime={curDay} loading={socketLoading['electric']} />
          <ReportAnalysisChart className={styles['footer-half-height']} viewTime={curDay} loading={socketLoading['abnormalChart']} />
        </section>
        <section className={styles['footer-card']}>
          <div
            className={`${styles['station-install-statistics']} ${styles['footer-half-height']}`}
          >
            {statisticList.map((item, index) => (
              <MyCard className={styles['statistics-container']}>
                <StatisticCard
                  key={index}
                  cardData={item.list?.slice(0, 3) || [{}, {}, {}]}
                  total={item.total || ''}
                  title={statisticTitleList[index]}
                  defaultUnit={index === 0 ? utils.intl('index.座') : ''}
                />
              </MyCard>
            ))}
          </div>
          <ReportCard
            className={`${styles['report-container']} ${styles['footer-half-height']}`}
            reportList={reportList}
            loading={socketLoading['abnormalDetail']}
          />
        </section>
      </footer>
    </article>
  )
}

const mapStateToProps = (model, {}, state) => ({
  ...model,
  time: state[globalNS].time
})
export default makeConnect(storage_index, mapStateToProps)(Index)
