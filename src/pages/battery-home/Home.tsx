/**
 * 安全评估
 */
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GlobalState, HomeState } from 'umi'
import { Select, Table2 } from 'wanke-gui'
import Card from './component/Card'
import AbsoluteFullDiv from '../../components/AbsoluteFullDiv'
import Page from '../../components/Page'
import { useEnergyUnit } from '../../hooks/useEnergyUnitSelect'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { battery_cabin, battery_home, globalNS, Socket_Port } from '../constants'
import { makeConnect } from '../umi.helper'
import classNames from 'classnames'
import "./index.less"
import Circle, { typeMap } from './component/Circle'
import EchartsLineChart from '../../components/charts/EchartsLineChart'
import moment from 'moment'
import EchartsBarLineChart from './component/EchartsBarLineChart'
import { RightCircleOutlined } from 'wanke-icon'
import SocketHelper from '../socket.helper'
import PointWaves from './component/PointWaves'

interface Props extends PageProps, GlobalState, MakeConnectProps<HomeState>, HomeState {
  sohLoading: boolean,
  efficiencyLoading: boolean
  cycleLifeLoading: boolean
  theme: 'dark' | 'light'
  batteryLifeLoading: boolean
}

const socket = new SocketHelper(battery_cabin, Socket_Port, "/measurements");

let realSocketIsConnect = false;
let originSocketValue = {}; 
const Home: React.FC<Props> = (props) => {
  const { pageId, dispatch, batteryAlarm, sohChartData, nowSOH, sohLoading, efficiencyLoading, efficiencyChartData, nowEfficiency,
    cycleLifeChartData, cycleLifeLoading, remainingRecycleDays, remainingRecycleTimes, theme, batteryLifeLoading, batteryLifeCount, batteryLifeRange, batteryLifeChartData, forward } = props;
  const [socketValue, setSocketValue] = useState({});
  const { selectedEnergyUnitId, selectEnergyUnit, energyUnitList } = useEnergyUnit();

  const nowDate = useMemo(() => moment().format('YYYY-MM-DD'), []);
  const mergeSocketValue = (message) => {
    originSocketValue = {...originSocketValue, ...message}
    setSocketValue(originSocketValue)
  };

  useEffect(() => {
    originSocketValue = {};
    setSocketValue(originSocketValue);
    if (selectEnergyUnit) {
      const { id, productionTime } = selectEnergyUnit
      // 查询能量单元整体风险等级
      dispatch({ type: `${battery_home}/getBatteryAlarm`, payload: { deviceId: id } });
      // 查询电池容量
      dispatch({ type: `${battery_home}/getSOHChartData`, payload: { deviceId: id, dtime: productionTime } });
      // 查询电池效率
      dispatch({ type: `${battery_home}/getEfficiencyChartData`, payload: { deviceId: id, dtime: `${productionTime},${moment().format('YYYY-MM-DD HH:mm:ss')}` } });
      // 查询循环寿命
      dispatch({ type: `${battery_home}/getCycleLife`, payload: { deviceId: id } });
      // 根据能量单元id查询电池里程
      dispatch({ type: `${battery_home}/getBatteryLife`, payload: { deviceId: id } });

      // socket
      if (realSocketIsConnect) {
        socket.emit("energyUnitValue", { deviceId: id });
      } else {
        socket.start(
          dispatch,
          {},
          {
            connect: () => {
              realSocketIsConnect = true;
              socket.emit("energyUnitValue", { deviceId: id });
            },
            energyUnitValue: (message: any) => {
              mergeSocketValue(message);
            },
          }
        );
      }
    }

    return () => {
      realSocketIsConnect = false;
      originSocketValue = {};
      socket.close();
    }
  }, [JSON.stringify(selectEnergyUnit)]);


  return (
    <Page pageId={pageId} showStation showEnergyUnit style={{ background: "transparent", position: "relative", height: '100%' }}>
      <div className="battery-home-page-box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
        <div className="battery-point-waves-box">
          <PointWaves color="#14C891" />
          <div className="battery-icon"></div>
        </div>
        <Card style={{ position: 'absolute', top: 0, left: 0 }}>
          <div className="home-card-title">{utils.intl('电池容量')}</div>
          <div className="home-card-sub-title">
            <div className="sub-label">{utils.intl('当前剩余')}</div>
            <div className="sub-value">{nowSOH || nowSOH === 0 ? nowSOH : '--'}<span>%</span></div>
            <div className="sub-label">{utils.intl('衰减容量')}</div>
            <div className="sub-value">{nowSOH || nowSOH === 0 ? 100 - (nowSOH as number) : '--'}<span>%</span></div>
          </div>
          <div className="sub-soc-icon"></div>
          <div className="charts-box">
            <EchartsLineChart
              {...sohChartData}
              colorList={["rgba(66,206,206,1)", "#FA9B14"]}
              grid={{ left: 40 }}
              dividing={[nowDate, nowDate]}
              loading={sohLoading}
            />
          </div>
        </Card>
        <Card style={{ position: 'absolute', bottom: 23, left: 0 }}>
          <div className="home-card-title">{utils.intl('电池里程')}</div>
          <div className="home-card-sub-title">
            <div className="sub-label">{utils.intl('总里程')}</div>
            <div className="sub-value">{batteryLifeCount ?? '--'}<span>MWh</span></div>
            <div className="sub-label">{utils.intl('里程极差')}</div>
            <div className="sub-value">{batteryLifeRange ?? '--'}<span>MWh</span></div>
          </div>
          <div className="sub-batteryMileage-icon"></div>
          <div className="charts-box">
            <EchartsBarLineChart
              {...batteryLifeChartData}
              theme={theme}
              colorList={['#6397FF', '#FA9B14']}
              grid={{
                left: '60'
              }}
              loading={batteryLifeLoading}
            />
          </div>
        </Card>
        <Card style={{ position: 'absolute', right: 0, top: 0 }}>
          <div className="home-card-title">{utils.intl('循环寿命')}<span>{utils.intl('按100%DOD')}</span></div>
          <div className="home-card-sub-title">
            <div className="sub-label">{utils.intl('剩余')}</div>
            <div className="sub-value">{remainingRecycleTimes ?? '--'}<span>{utils.intl('次')}</span></div>
            <div className="sub-label">{utils.intl('还剩')}</div>
            <div className="sub-value">{remainingRecycleDays ?? '--'}<span>{utils.intl('天')}</span></div>
          </div>
          <div className="sub-cycleLife-icon"></div>
          <div className="charts-box">
            <EchartsBarLineChart
              {...cycleLifeChartData}
              theme={theme}
              colorList={['#6397FF', '#FA9B14']}
              grid={{
                left: '60'
              }}
              loading={cycleLifeLoading}
            />
          </div>
        </Card>
        <Card style={{ position: 'absolute', bottom: 23, right: 0 }}>
          <div className="home-card-title">{utils.intl('电池效率')}</div>
          <div className="home-card-sub-title">
            <div className="sub-label">{utils.intl('当前')}</div>
            <div className="sub-value">{nowEfficiency ?? '--'}<span>%</span></div>
          </div>
          <div className="sub-batteryEfficiency-icon"></div>
          <div className="charts-box">
            <EchartsLineChart
              {...efficiencyChartData}
              colorList={["rgba(116,207,71,1)"]}
              grid={{ left: 40 }}
              loading={efficiencyLoading}
            />
          </div>
        </Card>
        <Card type="alarm" style={{ position: 'relative', maxWidth: 'calc(100% - 936px)', width: 'calc(41.6% - 32px)', height: 350, marginBottom: 32 }}>
          <div className="home-alarm-card-title">{utils.intl('安全警告')}</div>
          <div className="home-alarm-card-body">
            <Circle type={batteryAlarm.capacityRisk ?? 'low'} title={utils.intl('容量异常')} />
            <div className="home-alarm-card-sub-body">
              <div style={{ fontSize: 16, color: "#FA9B14" }}>{utils.intl('整体')}</div>
              <div style={{ fontSize: 46 }}>{typeMap[batteryAlarm.overallRisk ?? 'low'].zh}</div>
            </div>
            <Circle type={batteryAlarm.tempRisk ?? 'low'} title={utils.intl('温度异常')} />
          </div>
          <div className="home-alarm-card-body" style={{ justifyContent: 'center' }}>
            <Circle type={batteryAlarm.liOutRisk ?? 'low'} title={utils.intl('析锂预警')} style={{ margin: '0px 3%' }} />
            <Circle type={batteryAlarm.voltageRisk ?? 'low'} title={utils.intl('电压异常')} style={{ margin: '0px 3%' }} />
            <Circle type={batteryAlarm.shortCircuitRisk ?? 'low'} title={utils.intl('微短路预警')} style={{ margin: '0px 3%' }} />
          </div>
        </Card>
        <div className="battery-middle-socket-box">
          <div className="battery-middle-socket-item">
            <div className="battery-middle-socket-value">{socketValue.SOC || socketValue.SOC === 0 ? Number(socketValue.SOC.toFixed(2)) : '--'}<span>%</span></div>
            <div className="battery-middle-socket-label">SOC</div>
          </div>
          <div className="battery-middle-socket-item">
            <div className="battery-middle-socket-value">{socketValue.CellMaxTemp || socketValue.CellMaxTemp === 0 ? Number(socketValue.CellMaxTemp.toFixed(2)) : '--'}<span>℃</span></div>
            <div className="battery-middle-socket-label">{utils.intl('单体最高温度')}</div>
          </div>
          <div className="battery-middle-socket-item">
            <div className="battery-middle-socket-value">{socketValue.MaxCellTempRange || socketValue.MaxCellTempRange === 0 ? Number(socketValue.MaxCellTempRange.toFixed(2)) : '--'}<span>℃</span></div>
            <div className="battery-middle-socket-label">{utils.intl('最大温度极差')}</div>
          </div>
        </div>
        <div className="battery-middle-btn" onClick={() => forward('RealMonitoring')}>
          {utils.intl('实时监测')}
          <RightCircleOutlined style={{ marginLeft: 8 }} />
        </div>
      </div>
    </Page>
  )
}


const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    theme: state[globalNS].theme,
    stationList: state[globalNS].stationList,
    sohLoading: getLoading('getSOHChartData'),
    efficiencyLoading: getLoading('getEfficiencyChartData'),
    cycleLifeLoading: getLoading('getCycleLife'),
    batteryLifeLoading: getLoading('getBatteryLife')
  }
}

export default makeConnect(battery_home, mapStateToProps)(Home);
