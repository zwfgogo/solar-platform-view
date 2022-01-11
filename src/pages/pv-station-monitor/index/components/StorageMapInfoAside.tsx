import React from 'react'
import { history } from 'umi'
import classnames from 'classnames'
import styles from './styles/storage-map-info-aside.less'
import { Wanke1ScreenOutlined, CaretRightOutlined, WankeConstructionOutlined, WankeRunningStatusOutlined, WankeCircleRightOutlined, WankeTodayOverviewOutlined } from 'wanke-icon';
import RealTimeChart from './RealTimeChart';
import StationImageCard, { StatusClassNameMap } from './StationImageCard';
import { formatEmptyValue, addSpaceWidthUnit } from './powerStationTable';
import { GlobalState } from '../../../../models/global';
import { makeConnect } from '../../../umi.helper';
import { globalNS } from '../../../constants';
import MakeConnectProps from '../../../../interfaces/MakeConnectProps';
import Util from '../../../../public/js/utils';
import { Alert, AnimationNumber, Col, FullLoading, Row } from 'wanke-gui';
import { isZh } from '../../../../core/env';
import utils from '../../../../public/js/utils';
import Forward from '../../../../public/components/Forward';
import DetailFormItem from '../../../../components/DetailFormItem';
import { StatusMap } from './MapInfoAside';
import { weatherMap } from '../../../common-operation-monitor/dataCfg';
import { triggerEvent } from '../../../../util/utils';

enum FeedinMethodType {
  FullRefund = '0', // 全额
  Remaining = '1', // 余额
}

const img_weather = [...Object.keys(weatherMap).map(key => <img src={weatherMap[key].img} />), '--']

// 0:全部故障 1:正常 2:部分故障 3.未获取到通讯状态（自定义默认值）
const colorList = ['#fc5a5a', '#3DD598', '#ff974a', undefined];

interface Props extends MakeConnectProps<GlobalState>,
  Pick<GlobalState, 'stationDetail' > {
    node: any
    realData: any
    chartData: any
    chartLoading: boolean
}

const StorageMapInfoAside: React.FC<Props> = ({ node, realData = {}, chartData, updateState, theme, chartLoading }) => {
  const stationStatus = node?.stationStatus;
  const ratedPowerAndScaleList = node.ratedPowerAndScaleList || []
  const properties = node.properties || {}
  const { FeedinMethod } = properties

  const isOffLine = realData['heartBeat'] === 1
  const temperature = realData['temperature']
  const weatherStatus = realData['weather']

  return (
    <>
      <article className={styles['map-info-aside']}>
        <span className={classnames(styles['image-tip'], styles[StatusClassNameMap[stationStatus]])}>{StatusMap?.[stationStatus] || ' '}</span>
        <header className={styles['header']}>
          <div className={styles['station-title']}>
            <span className={classnames({ [styles['offline']]: isOffLine })} style={{ display: 'flex', overflow: 'hidden' }}>
              <span className="text-ellipsis">
                {node.title}
              </span>
              {/* {isOffLine && <img src={require('./img/offline-icon.svg')} style={{ marginLeft: 16 }} />} */}
            </span>
            {/* <div className={styles['station-weather']}>
              <AnimationNumber
                style={{ display: "inline-block" }}
                value={weatherMap[weatherStatus]?.index ?? Object.keys(weatherMap).length}
                numList={img_weather}
                isWhole
                time={0.8} />
              <span style={{ fontSize: 24, fontWeight: "bold", marginLeft: 8 }}>
                {temperature ? Number(Number(`${temperature}`.replace('℃', '')).toFixed(2)) : '--'}
              </span>
              <span className="weather_label" style={{ fontSize: 14, verticalAlign: 'super' }}>℃</span>
              <span className="weather_value" style={{ marginLeft: 8, fontSize: 14, fontWeight: 400, }}>
                {weatherStatus ? utils.intl(`weather.${weatherStatus}`) : '--'}
              </span>
            </div> */}
          </div>
          <div className={styles['desc']}>{node.address || ' '}</div>
          <StationImageCard
            filePath={node.filePath}
            stationStatus={stationStatus}
          />
          <div className={styles['common-title']} style={{ marginTop: 18 }}>
            <WankeConstructionOutlined />
            <span style={{ marginLeft: 8 }}>{Util.intl('建设规模')}:</span>
          </div>
          <div className={styles['content']}>
            <span>
              <span /* style={{ color: "#009297" }} */>
                {formatEmptyValue(node.ratedPowerDisplay)}
              </span>
              /
              <span /* style={{ color: "#3d7eff" }} */>
                {formatEmptyValue(node.scaleDisplay)}
              </span>
            </span>
          </div>
        </header>
        <section className={styles['chart-container']}>
          <div className={styles['common-title']}>
            <WankeRunningStatusOutlined />
            <span style={{ marginLeft: 8 }}>{Util.intl('运行状况')}:</span>
          </div>
          <div className={styles['chart']}>
            {chartLoading && <FullLoading />}
            <RealTimeChart chartData={chartData} theme={theme}/>
          </div>
        </section>
        <div className={styles['detail-container']}>
          <div className={styles['common-title']}>
            <WankeTodayOverviewOutlined style={{ opacity: '0.45' }} />
            <span style={{ marginLeft: 8 }}>{Util.intl('今日概况')}:</span>
          </div>
          <div className={styles['detail-form']}>
            <div className={styles['detail-item']}>
              <DetailFormItem label={utils.intl('储能充电量')} value={realData['chargeDay']} />
            </div>
            <div className={styles['detail-item']}>
              <DetailFormItem label={utils.intl('储能放电量')} value={realData['dischargeDay']} />
            </div>
            <div className={styles['detail-item']}>
              <DetailFormItem label={utils.intl('收益')} value={realData['profitDay']} />
            </div>
            <div className={styles['detail-item']}></div>
          </div>
        </div>
      </article>
      <footer className={styles['footer']}>
        <Forward onClick={() => {triggerEvent('close-fullscreen', window)}} to="detail" data={{ stationId: node.id, stationName: node.title, stationDetail: node }}>
          <span style={{ marginRight: 8 }}>{utils.intl('查看电站详情')}</span>
          <WankeCircleRightOutlined />
        </Forward>
      </footer>
    </>
  );
};

function mapStateToProps(model: GlobalState, getLoading, state) {
  return {
    theme: state.global.theme
  }
}

export default makeConnect(globalNS, mapStateToProps)(StorageMapInfoAside)
