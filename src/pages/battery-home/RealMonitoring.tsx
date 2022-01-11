/**
 * 实时监测子页面
 */
/**
 * 效率分析
 */
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GlobalState, HomeState } from 'umi'
import { message, Spin, Tabs, Three } from 'wanke-gui'
import Page from '../../components/Page'
import { useEnergyUnit } from '../../hooks/useEnergyUnitSelect'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { battery_cabin, battery_efficiency_analysis, battery_home, globalNS, Socket_Port } from '../constants'
import { makeConnect } from '../umi.helper'
import "./index.less"
import classNames from 'classnames'
import BatteryRunningChart from '../common-battery-cabin/components/BatteryRunningChart'
import SocketHelper from '../socket.helper'
import { getDefaultColor, point_color, point_tooltip } from '../common-battery-cabin/dataCfg'
import { CaretLeftOutlined, CaretRightOutlined } from 'wanke-icon'
import { triggerEvent } from '../../util/utils'


const { BatteryModel } = Three
const { TabPane } = Tabs
let realSocketIsConnect = false;
const size = 8;
const socket = new SocketHelper(battery_cabin, Socket_Port, "/measurements");

interface Props extends PageProps, GlobalState, MakeConnectProps<HomeState>, HomeState {
  chartDataLoading: boolean
}

const getColor = (tem: number) => {
  // const obj = _.pickBy(point_color, (value, key) => getDefaultColor(tem))
  return getDefaultColor(tem) || '#000'
}

const RealMonitoring: React.FC<Props> = (props) => {
  const { pageId, dispatch } = props
  const [activeKey, setActiveKey] = useState('1')
  const [pointLoading, setPointLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [nowTpObj, setNowTpObj] = useState([]);
  const [tpObj, setTpObj] = useState([]);
  const [batteryModalIndex, setBatteryModalIndex] = useState(0);
  const [workingData, setWorkingData] = useState({})

  const { selectedEnergyUnitId, selectEnergyUnit, energyUnitList } = useEnergyUnit();

  useEffect(() => {
    setNowTpObj([]);
    setTpObj([]);
    setBatteryModalIndex(0);
    setPage(1);
    setWorkingData({});
    if (selectedEnergyUnitId) {
      getRealWsData(selectedEnergyUnitId);
    }

    return () => {
      realSocketIsConnect = false;
      socket.close();
    }
  }, [selectedEnergyUnitId])

  // 迁移项目
  const getRealWsData = useCallback(
    (EnergyId: number) => {
      if (realSocketIsConnect) {
        setPointLoading(true);
        socket.emit("point", { deviceId: EnergyId });
        socket.emit("realTimeWorking", { deviceId: EnergyId });
      } else {
        socket.start(
          dispatch,
          {},
          {
            connect: () => {
              realSocketIsConnect = true;
              setPointLoading(true);
              socket.emit("point", { deviceId: EnergyId });
              socket.emit("realTimeWorking", { deviceId: EnergyId });
            },
            getPoint: (message: any) => {
              // 获取热力图的温度详情(电池工况)
              const nowTpObj = message.filter((item, index) => index >= (page - 1) * size && index < page * size)
              // this.setState({ loading: false, tpObj: message, nowTpObj: translateBatteryData(nowTpObj), batteryModalIndex: 0, page: 1 });
              setNowTpObj(translateBatteryData(nowTpObj));
              setTpObj(message);
              setPointLoading(false);
              setBatteryModalIndex(0);
              setPage(1);
            },
            realTimeWorking: (message: any) => {
              setWorkingData(_.merge(workingData, message))
            }
          }
        );
      }
    },
    [page, JSON.stringify(workingData)],
  );

  const translateBatteryData = (tab) => {
    return tab.map((item, index) => {
      // const color = colors[parseInt(Math.random() * colors.length)]
      let x = 0;
      let y = 0;

      item.maxNum = item.batteryList?.length ? Math.max(...item.batteryList) : undefined;


      item.batteryData = (item.batteryList || []).map((bItem, bIndex) => {
        const z = parseInt(`${bIndex / 36}`);
        if (bIndex % 6 === 0 && bIndex != 0) {
          y++;
          x = 0;
        } else if (bIndex % 6 != 0 && bIndex != 0) {
          x++;
        }
        if (bIndex % 36 === 0 && bIndex != 0) {
          x = 0;
          y = 0;
        }

        return {
          position: [x * 22, y * 22, z * 50],
          color: getDefaultColor(item.batteryList[bIndex]),
          opacity: 0.9
        }
      })
      return item
    })
  }

  const numberToFixed2 = useCallback(
    (num: number) => {
      return num || num === 0 ? Number(num.toFixed(2)) : '--'
    },
    [],
  )


  return (
    <Page pageId={pageId} className="real-page" pageTitle={utils.intl("实时工况")} showStation showEnergyUnit>
      <Tabs defaultActiveKey="1" onChange={(v) => {
        setActiveKey(v)
        setTimeout(() => {
          triggerEvent('resize', window)
        })
      }}>
        <TabPane tab={utils.intl('电池实时工况')} key="1">
          <div className="workingBox">
            {
              Object.keys(workingData).map(title => (
                <div className="card-box">
                  <div className="card-title">{title}</div>
                  <div className="card-sub-context">
                    <div className="card-sub-item" style={{ marginRight: 8 }}>{utils.intl('电流')}: {numberToFixed2(workingData[title].Current)}A</div>
                    <div className="card-sub-item">{utils.intl('功率')}: {numberToFixed2(workingData[title].ActivePower)}kW</div>
                  </div>
                  <div className="card-iconBox">SOC: {numberToFixed2(workingData[title].SOC)}%</div>
                  <div className="card-context-box">
                    <div className="card-context" style={{ marginRight: 16 }}>
                      <div className="card-context-item">
                        <div className={classNames("card-label", "card-context-icon", { "card-context-icon-first": workingData[title].CellMaxTemp && (workingData[title].CellMaxTemp < 5 || workingData[title].CellMaxTemp > 45) })}>{utils.intl('最高温度')}</div>
                        <div className="card-value">{numberToFixed2(workingData[title].CellMaxTemp)}℃</div>
                      </div>
                      <div className="card-context-item">
                        <div className={classNames("card-label", "card-context-icon", { "card-context-icon-first": workingData[title].CellTempRange &&  (workingData[title].CellTempRange < 0 || workingData[title].CellTempRange > 10) })}>{utils.intl('温度极差')}</div>
                        <div className="card-value">{numberToFixed2(workingData[title].CellTempRange)}℃</div>
                      </div>
                      <div className="card-context-item">
                        <div className={classNames("card-label", "card-context-icon", { "card-context-icon-first": workingData[title].CellAvgTemp && (workingData[title].CellAvgTemp < 5 || workingData[title].CellAvgTemp > 45) })}>{utils.intl('平均温度')}</div>
                        <div className="card-value">{numberToFixed2(workingData[title].CellAvgTemp)}℃</div>
                      </div>
                    </div>
                    <div className="card-context">
                      <div className="card-context-item">
                        <div className={classNames("card-label", "card-context-icon", { "card-context-icon-first": workingData[title].CellMaxVoltage && (workingData[title].CellMaxVoltage < 2.8 || workingData[title].CellMaxVoltage > 3.6) })}>{utils.intl('最大电压')}</div>
                        <div className="card-value">{numberToFixed2(workingData[title].CellMaxVoltage)}V</div>
                      </div>
                      <div className="card-context-item">
                        <div className={classNames("card-label", "card-context-icon", { "card-context-icon-first": workingData[title].CellVoltageRange && (workingData[title].CellVoltageRange < 0 || workingData[title].CellVoltageRange > 0.4) })}>{utils.intl('电压极差')}</div>
                        <div className="card-value">{numberToFixed2(workingData[title].CellVoltageRange)}V</div>
                      </div>
                      <div className="card-context-item">
                        <div className={classNames("card-label", "card-context-icon", { "card-context-icon-first": workingData[title].CellAvgVoltage && (workingData[title].CellAvgVoltage < 2.8 || workingData[title].CellAvgVoltage > 3.6) })}>{utils.intl('平均电压')}</div>
                        <div className="card-value">{numberToFixed2(workingData[title].CellAvgVoltage)}V</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </TabPane>
        <TabPane tab={utils.intl('运行对比曲线')} key="2">
          {activeKey === '2' &&<BatteryRunningChart realEnergyId={selectedEnergyUnitId} />}
        </TabPane>
        <TabPane tab={utils.intl('温度热点图')} key="3">
          <div className="battery-charts-body">
            {pointLoading ? <Spin size="large" /> :
              <>
                <div className="battery-charts-window">
                  {nowTpObj[batteryModalIndex]?.batteryData ? (
                    <>
                      <div style={{ position: "absolute", top: 5, left: 10, color: "#fff" }}>{nowTpObj[batteryModalIndex].name}</div>
                      <div className="point_tooltip_box" style={{ position: "absolute", top: 5, right: 10, color: "#fff" }}>
                        {
                          Object.keys(point_tooltip).map(key => (
                            <div className="point_tooltip">
                              <div style={{ display: "inline-block", padding: 2, border: `1px solid ${point_tooltip[key]}`, borderRadius: "50%", marginRight: 5 }}>
                                <div style={{ background: point_tooltip[key], width: "100%", height: "100%" }} />
                              </div>
                              <span>{key}</span>
                            </div>
                          ))
                        }<span style={{ marginLeft: 5 }}>(℃)</span></div>
                      <BatteryModel pointData={nowTpObj[batteryModalIndex]?.batteryData} background="#0b1026" isRotate />
                    </>
                  ) : null}
                </div>
                <div className="battery-charts-list">
                  {
                    nowTpObj.map((item, index) => (
                      <div className="sub_charts_box" onClick={() => setBatteryModalIndex(index)}>
                        <div style={{ width: "100%", position: "absolute", bottom: 5, textAlign: "center" }}>{item.name}</div>
                        {item.maxNum ? <div style={{ position: "absolute", right: 5, top: 3, textAlign: "center", color: getColor(item.maxNum) }}>{item.maxNum}℃</div> : null}
                        <div id={`chart_${index}`} className={classNames("my_charts", { "my_charts_active": index === batteryModalIndex })} >
                          <BatteryModel pointData={item.batteryData} background="#0b1026" openControl={false} />
                        </div>
                      </div>
                    ))
                  }
                  {page > 1 ? <div className="battery_page_btn" style={{ left: 0 }} onClick={() => {
                    const newPage = page - 1;
                    setPage(newPage);
                    setBatteryModalIndex(0);
                    setNowTpObj(translateBatteryData(tpObj.filter((item, index) => index >= (newPage - 1) * size && index < newPage * size)))
                  }}><CaretLeftOutlined /></div> : null}
                  {page < Math.ceil(tpObj.length / size) ? <div className="battery_page_btn" style={{ right: 0 }} onClick={() => {
                    const newPage = page + 1;
                    setPage(newPage);
                    setBatteryModalIndex(0);
                    setNowTpObj(translateBatteryData(tpObj.filter((item, index) => index >= (newPage - 1) * size && index < newPage * size)))
                  }}><CaretRightOutlined /></div> : null}
                </div>
              </>
            }
          </div>
        </TabPane>
      </Tabs>
    </Page>
  )
}


const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationList: state[globalNS].stationList,
    chartDataLoading: getLoading('getEfficiency')
  }
}

export default makeConnect(battery_home, mapStateToProps)(RealMonitoring);
