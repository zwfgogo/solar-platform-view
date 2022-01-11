import React from 'react'
import { history, utils } from 'umi'
import styles from './styles/map-info-aside.less'
import { Wanke1ScreenOutlined, CaretRightOutlined } from 'wanke-icon';
import RealTimeChart from './RealTimeChart';
import StationImageCard from './StationImageCard';
import { formatEmptyValue, addSpaceWidthUnit } from './powerStationTable';
import { GlobalState } from '../../../../models/global';
import { makeConnect } from '../../../umi.helper';
import { globalNS } from '../../../constants';
import MakeConnectProps from '../../../../interfaces/MakeConnectProps';
import Util from '../../../../public/js/utils';
import { FullLoading } from 'wanke-gui';

export const StatusMap = {
  'activate': Util.intl('已投产'),
  'constructing': Util.intl('建设中'),
  'debugging': Util.intl('调试中'),
  'testing': Util.intl('试运行'),
  'deactivated': Util.intl('monitor.已停运'),
}

const StatusClassNameMap = {
  'activate': 'put-in',
  'constructing': 'building',
  'debugging': 'debug',
  'testing': 'try-running',
  'deactivated': 'stop',
}

enum FeedinMethodType {
  FullRefund = '0', // 全额
  Remaining = '1', // 余额
}

interface Props extends MakeConnectProps<GlobalState>,
  Pick<GlobalState, 'stationDetail' > {
    node: any
    realData: any
    chartData: any
    chartLoading: boolean
}

const MapInfoAside: React.FC<Props> = ({ node, realData = {}, chartData, updateState, theme, chartLoading }) => {
  const stationStatus = node?.stationStatus;
  const properties = node.properties || {}
  const { FeedinMethod } = properties

  const jumpToDetail = (url: string) => {
    updateState({
      stationDetail: node,
      activeNode: node
    })
    history.push(url)
  }

  return (
    <article className={styles['map-info-aside']}>
      <header className={styles['header']}>
        <StationImageCard
          filePath={node.filePath}
          heartBeat={realData['heartBeat']}
          temperature={formatEmptyValue(realData['temperature'])}
          weatherStatus={formatEmptyValue(realData['weather'])}
          windSpeed={formatEmptyValue(realData['windSpeed'])}
        />
        <div className={styles['station-title']}>
          <span>{node.title}</span>
          <span className={styles[StatusClassNameMap[stationStatus]]}>{StatusMap?.[stationStatus] || ' '}</span>
        </div>
        <div className={styles['common-title']}>{Util.intl('地址')}:</div>
        <div className={styles['content']}>{node.address}</div>
        <div className={styles['common-title']}>{Util.intl('建设规模')}:</div>
        <div className={styles['content']}>
          <span>
            <span style={{ color: "#009297" }}>
              {formatEmptyValue(node.ratedPowerDisplay)}
            </span>
            /
            <span style={{ color: "#3d7eff" }}>
              {formatEmptyValue(node.scaleDisplay)}
            </span>
          </span>
        </div>
      </header>
      <section  className={styles['chart-container']}>
        <div className={styles['common-title']}>{Util.intl('实时发电功率')}:</div>
        <div className={styles['chart']} style={{ position: 'relative' }}>
          {chartLoading && <FullLoading />}
          <RealTimeChart chartData={chartData} theme={theme}/>
        </div>
      </section>
      <section  className={styles['runnint-status']}>
        <div className={styles['common-title']}>{Util.intl('运行概况')}:</div>
        <ul>
          {FeedinMethod?.name === '1' ? (
            <>
              <li><span>{Util.intl('今日上网电量')}:</span><span>{addSpaceWidthUnit(formatEmptyValue(realData['ongridEnergy'], "-"))}</span></li>
              <li><span>{Util.intl('今日自发自用电量')}:</span><span>{addSpaceWidthUnit(formatEmptyValue(realData['selfConsumptionEnergy'], "-"))}</span></li>
            </>
          ) : (
            <li><span>{Util.intl('今日发电量')}:</span><span>{addSpaceWidthUnit(formatEmptyValue(realData['generation'], "-"))}</span></li>
          )}
          <li><span>{Util.intl('今日收益')}:</span><span>{addSpaceWidthUnit(formatEmptyValue(realData['revenue'], "-"))}</span></li>
          <li><span>{Util.intl('今日累计辐照')}:</span><span>{addSpaceWidthUnit(formatEmptyValue(realData['irradiance'], "-"))}</span></li>
          <li><span>{Util.intl('今日满发时长')}:</span><span>{addSpaceWidthUnit(formatEmptyValue(realData['yield'], "-"))}</span></li>
          <li><span>{Util.intl('今日PR')}:</span><span>{formatEmptyValue(realData['pr'], "-")}</span></li>
        </ul>
      </section>
    </article>
  );
};

function mapStateToProps(model: GlobalState, getLoading, state) {
  return {
    theme: state.global.theme
  }
}

export default makeConnect(globalNS, mapStateToProps)(MapInfoAside)
