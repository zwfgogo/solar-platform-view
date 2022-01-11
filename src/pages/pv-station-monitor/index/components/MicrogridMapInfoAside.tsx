import React from 'react'
import { history } from 'umi'
import classnames from 'classnames'
import styles from './styles/microgrid-map-info-aside.less'
import { Wanke1ScreenOutlined, CaretRightOutlined, WankeConstructionOutlined, WankeRunningStatusOutlined } from 'wanke-icon';
import RealTimeChart from './RealTimeChart';
import StationImageCard from './StationImageCard';
import { formatEmptyValue, addSpaceWidthUnit } from './powerStationTable';
import { GlobalState } from '../../../../models/global';
import { makeConnect } from '../../../umi.helper';
import { globalNS } from '../../../constants';
import MakeConnectProps from '../../../../interfaces/MakeConnectProps';
import Util from '../../../../public/js/utils';
import { Alert, Col, FullLoading, Row } from 'wanke-gui';
import { isZh } from '../../../../core/env';
import utils from '../../../../public/js/utils';

enum FeedinMethodType {
  FullRefund = '0', // 全额
  Remaining = '1', // 余额
}

// 0:全部故障 1:正常 2:部分故障 3.未获取到通讯状态（自定义默认值）
const colorList = ['#fc5a5a', '#3DD598', '#ff974a', undefined];

interface Props extends MakeConnectProps<GlobalState>,
  Pick<GlobalState, 'stationDetail' > {
    node: any
    realData: any
    chartData: any
    chartLoading: boolean
}

const MicrogridMapInfoAside: React.FC<Props> = ({ node, realData = {}, chartData, updateState, theme, chartLoading }) => {
  const stationStatus = node?.stationStatus;
  const ratedPowerAndScaleList = node.ratedPowerAndScaleList || []
  const properties = node.properties || {}
  const { FeedinMethod } = properties

  const jumpTopAbnormal = () => {
    history.push('/alert-service/abnormal')
  }

  const abnormalNum = ['Serious', 'Moderate', 'Slight'].map(key => realData[key] || 0).reduce((prev, next) => prev + next)

  // const isOffLine = realData['heartBeat'] === 1
  const isOffLine = true

  const jump = () => {
    sessionStorage.setItem('station-id', node.id)
    updateState({
      selectedStation: node,
      selectedStationId: node.id,
      selectedStationCode: node.code
    })
    history.push('/station-monitor/operation-monitor')
  }

  return (
    <article className={styles['map-info-aside']}>
      <header className={styles['header']}>
        <div className={styles['station-title']}>
          <span className={classnames({ [styles['offline']]: isOffLine })} style={{ display: 'flex', overflow: 'hidden' }}>
            <span className="text-ellipsis">{node.title}</span>
            {isOffLine && <img src={require('./img/offline-icon.svg')} style={{ marginLeft: 16 }} />}
          </span>
        </div>
        <div className={styles['desc']}>{node.address}</div>
        <StationImageCard
          filePath={node.filePath}
          stationStatus={stationStatus}
        />
        <div className={styles['common-title']} style={{ marginTop: 18 }}>
          <WankeConstructionOutlined />
          <span style={{ marginLeft: 8 }}>{Util.intl('建设规模')}:</span>
        </div>
        <div className={styles['content']} style={{ marginLeft: 16 }}>
          <Row>
            {ratedPowerAndScaleList.map((item, index) => (
              <Col span={12} style={{ marginBottom: 16 }}>
                <span className={styles['label']}>{item.title}:</span>
                <span>{item.ratedPowerDisplay || ''}/{item.scaleDisplay || ''}</span>
              </Col>
            ))}
            {node.ACChargingPileNum ? (
              <Col span={12} style={{ marginBottom: 16 }}>
                <span className={styles['label']}>{Util.intl('交流充电桩')}:</span>
                <span>{node.ACChargingPileNum}个</span>
              </Col>
            ) : null}
            {node.DCChargingPileNum ? (
              <Col span={12} style={{ marginBottom: 16 }}>
                <span className={styles['label']}>{Util.intl('直流充电桩')}:</span>
                <span>{node.DCChargingPileNum}个</span>
              </Col>
            ) : null}
          </Row>
        </div>
      </header>
      <section  className={styles['chart-container']}>
        <div className={styles['common-title']}>
          <WankeRunningStatusOutlined />
          <span style={{ marginLeft: 8 }}>{Util.intl('运行状况')}:</span>
        </div>
        <div className={styles['chart']}>
          {chartLoading && <FullLoading />}
          <RealTimeChart chartData={chartData} theme={theme}/>
          <div className={styles['chart-click-mash']} onClick={jump}></div>
        </div>
      </section>
      <Alert
        message={`${Util.intl('microgrid.当前异常')}：${abnormalNum}${isZh() ? '个' : ''}`}
        type="warning"
        showIcon
        action={(
          <a onClick={jumpTopAbnormal}>{Util.intl('microgrid.立即查看')}</a>
        )}
      />
    </article>
  );
};

function mapStateToProps(model: GlobalState, getLoading, state) {
  return {
    theme: state.global.theme
  }
}

export default makeConnect(globalNS, mapStateToProps)(MicrogridMapInfoAside)
