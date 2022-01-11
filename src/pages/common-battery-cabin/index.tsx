import React, { Component } from "react";
import * as echarts from "echarts";
import "echarts-gl";
import { battery_cabin, Socket_Port } from "../../pages/constants";
import { DispatchProp } from "dva";
import { makeConnect } from "../../pages/umi.helper";
import SocketHelper from "../../pages/socket.helper";
import { BatteryCabinState } from "./models";
import { Card, Select, Tabs, Pagination, Spin, Three } from "wanke-gui";
import PanelChart from "./PanelChart";
import { card_list, point_color, point_tooltip } from "./dataCfg";
import _ from "lodash";
import "./index.less";
import { CaretLeftOutlined, CaretRightOutlined } from "wanke-icon";
import { numberLength } from "../terminal-station-monitor/utils";
import { GlobalState } from '../../config-battery/models/global'
import BatteryRunningChart from "./components/BatteryRunningChart";
import stationLight from '../../static/img/station_light.svg'
import stationDark from '../../static/img/station_dark.svg'
import classNames from 'classnames'
import utils from "../../public/js/utils";
import { UniformsUtils } from "three";
import Page from "../../components/Page";

const { BatteryModel } = Three

const { Option } = Select;
const { TabPane } = Tabs;

const socket = new SocketHelper(battery_cabin, Socket_Port, "/measurements");

export interface IndexProps extends BatteryCabinState, DispatchProp, GlobalState { }
export interface IndexState {
  realEnergyId: number; // 实时工况能量单元id
  batteryEnergyId: number; // 电池工况能量单元id
  realSocketIsConnect: boolean; // socket是否连接成功
  realObj: any; // 实时工况的websockt推过来的数据
  tpObj: any[]; // 电池工况温度热点图websockt推过来的数据
  activeKey: string; // tabs切换的key值
  nowTpObj: any[];
  page: number;
  size: number;
  loading: boolean;
  batteryModalData: any[];
  batteryModalIndex: number;
  stationId: number
}

@makeConnect(battery_cabin, (model, getLoading, state: any) => ({
  ...model,
  theme: state.global.theme,
  stationId: state.global.stationId,
  stations: state.global.stations,
  energyList: state.global.energyList
}))
class index extends Component<IndexProps, IndexState> {
  constructor(props) {
    super(props);
    this.state = {
      realEnergyId: null,
      batteryEnergyId: null,
      realSocketIsConnect: false,
      realObj: {},
      tpObj: [],
      nowTpObj: [],
      page: 1,
      size: 8,
      activeKey: '1',
      loading: false,
      batteryModalData: [],
      batteryModalIndex: 0,
      stationId: null,
    };
  }

  componentDidMount() {
    this.setState({ 
      stationId: this.props.stationId,      
      realEnergyId: this.props.energyList[0]?.value,
      batteryEnergyId: this.props.energyList[0]?.value,
     }, () => {
        this.initEnergyList();
     })
  }

  componentDidUpdate(preProps: IndexProps, preState: IndexState) {
    if (!_.isEqual(preProps.energyList, this.props.energyList)) {
      this.setState({ realEnergyId: this.props.energyList[0]?.value, batteryEnergyId: this.props.energyList[0]?.value }, () => {
        this.initEnergyList();
      })
    }

    if (!_.isEqual(preState.nowTpObj, this.state.nowTpObj)) { // 重绘数据
      this.charts3D();
    }

    if(this.props.stationId !== preProps.stationId){
      this.setState({ stationId: this.props.stationId })
    }
  }

  // 初始化能量单元
  initEnergyList = () => {
    this.setState({
      // realEnergyId: this.props.energyList[0]?.value,
      // batteryEnergyId: this.props.energyList[0]?.value,
      realObj: {},
      tpObj: [],
      nowTpObj: [],
    });
    if (!this.props.stationId) this.props.dispatch({
      type: `global/updateToView`,
      payload: { stationId: this.props.stations?.[0]?.value },
    });
    // 获取量测数据(实时工况)
    if (this.props.energyList && this.props.energyList.length) {
      console.log('this.props.energyList',this.props.energyList)
      this.getRealWsData(this.state.realEnergyId || this.props.energyList[0]?.value);
    }
  };

  // 查询能量单元(电站改变)
  handleStationChange = (stationId: number) => {
    this.setState({ stationId })
    this.props.dispatch({
      type: `global/getEnergyListByStationId`,
      payload: { stationId },
    });
    this.props.dispatch({
      type: `global/updateToView`,
      payload: { stationId },
    });
  };

  // 实时工况能量单元改变
  handleRealEnergyChange = (realEnergyId: number) => {
    this.getRealWsData(realEnergyId, 1);
    this.setState({ realEnergyId });
  };

  handleBatteryEnergyChange = (batteryEnergyId: number) => {
    this.getRealWsData(batteryEnergyId, 2);
    this.setState({ batteryEnergyId });
  };

  // websocket 数据
  getRealWsData = (EnergyId: number, type?: number) => {
    const { dispatch } = this.props;
    const { page, size, batteryEnergyId } = this.state
    if (this.state.realSocketIsConnect) {
      if (type === 1 || !type) socket.emit("open", { deviceId: EnergyId }); // ebsocket 获取量测数据(实时工况)
      if (type === 2 || !type) {
        this.setState({ loading: true })
        socket.emit("point", { deviceId: batteryEnergyId || EnergyId });
      } // websocket 获取热力图的温度详情(电池工况)
    } else {
      socket.start(
        dispatch,
        {},
        {
          connect: () => {
            const { realEnergyId, batteryEnergyId } = this.state
            this.setState({ realSocketIsConnect: true });
            if (type === 1 || !type)
              socket.emit("open", { deviceId: realEnergyId });
            if (type === 2 || !type) {
              this.setState({ loading: true })
              socket.emit("point", { deviceId: batteryEnergyId });
            }
          },
          message: (message: any) => {
            // 获取量测数据(实时工况)
            this.setState({ realObj: { ...this.state.realObj, ...message } });
          },
          getPoint: (message: any) => {
            // 获取热力图的温度详情(电池工况)
            const nowTpObj = message.filter((item, index) => index >= (page - 1) * size && index < page * size)
            this.setState({ loading: false, tpObj: message, nowTpObj: this.translateBatteryData(nowTpObj), batteryModalIndex: 0, page: 1 });
          },
        }
      );
    }
  };

  // 重绘echarts3d热力图
  charts3D = () => {
    // const { nowTpObj } = this.state
    // console.log('tpObj', nowTpObj)

    // // const batteryModalData = nowTpObj.map(item => ({

    // // }))


    // const batteryModalData = (nowTpObj || []).map((item, index) => {
    //   // const color = colors[parseInt(Math.random() * colors.length)]
    //   let x = 0;
    //   let y = 0;
    //   return {
    //     ...item,
    //     batteryData: (item.batteryList || []).map((bItem, bIndex) => {
    //       const z = parseInt(index / 36);
    //       // const y = index % 36
    //       // const z = y % 6
    //       if (index % 6 === 0 && index != 0) {
    //         y++;
    //         x = 0;
    //       } else if (index % 6 != 0 && index != 0) {
    //         x++;
    //       }
    //       if (index % 36 === 0 && index != 0) {
    //         x = 0;
    //         y = 0;
    //       }

    //       return {
    //         position: [x * 22, y * 22, z * 50],
    //         color: this.getColor(item.batteryList[bIndex]),
    //         opacity: 0.9
    //       }

    //     })
    //   }
    // })

    // this.setState({ batteryModalData })

    // nowTpObj.forEach((item, index) => {
    //   const data = [];
    //   if (item.batteryList && item.batteryList.length) {
    //     // const max = Math.max(...item.batteryList)
    //     let ii = 0
    //     for (let i = 1; i <= 6; i++) {
    //       for (let j = 1; j <= 10; j++) {
    //         for (let k = 1; k <= parseInt(`${item.batteryList.length / 60}`) + 1; k++) {
    //           if (ii < item.batteryList.length) {
    //             // console.log(parseFloat((item.batteryList[ii] / max).toFixed(3)))
    //             data.push({
    //               value: [i, k, j],
    //               itemStyle: {
    //                 color: this.getColor(item.batteryList[ii]),
    //                 opacity: 0.7,
    //               },
    //             });
    //             ii++;
    //           } else {
    //             break;
    //           }
    //         }
    //       }
    //     }
    //     const myCharts = echarts.init(
    //       document.getElementById(`chart_${index}`) as HTMLDivElement
    //     );
    //     myCharts.setOption(
    //       {
    //         xAxis3D: {
    //           name: '',
    //           type: "value",
    //           min: 0,
    //           max: 7,
    //           axisLabel: {
    //             show: false,
    //           },
    //           axisLine: {
    //             lineStyle: {
    //               color: "rgba(125,125,125,0.05)",
    //             },
    //           },
    //           splitLine: {
    //             lineStyle: {
    //               color: "rgba(125,125,125,0.05)",
    //             },
    //           },
    //           minInterval: 1,
    //         },
    //         yAxis3D: {
    //           name: '',
    //           type: "value",
    //           min: 0,
    //           max: parseInt(`${item.batteryList.length / 60}`) + 2,
    //           axisLabel: {
    //             show: false,
    //           },
    //           splitLine: {
    //             lineStyle: {
    //               color: "rgba(125,125,125,0.05)",
    //             },
    //           },
    //           minInterval: 1,
    //         },
    //         zAxis3D: {
    //           name: '',
    //           type: "value",
    //           min: 0,
    //           max: 11,
    //           axisLabel: {
    //             show: false,
    //           },
    //           splitLine: {
    //             lineStyle: {
    //               color: "rgba(125,125,125,0.05)",
    //             },
    //           },
    //           minInterval: 1,
    //         },
    //         grid3D: {
    //           axisLine: {
    //             lineStyle: { color: "rgba(125,125,125,0.05)" },
    //           },
    //           axisPointer: {
    //             lineStyle: { color: "rgba(125,125,125,0.05)" },
    //           },
    //           viewControl: {
    //             projection: "orthographic",
    //             autoRotate: true,
    //             autoRotateAfterStill: 1,
    //           },
    //           postEffect: {
    //             enable: true,
    //             bloom: {
    //               enable: true,
    //               bloomIntensity: 0.9,
    //             },
    //           },
    //           // environment: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
    //           //   offset: 0, color: '#00aaff' // 天空颜色
    //           // }, {
    //           //   offset: 0.7, color: '#998866' // 地面颜色
    //           // }, {
    //           //   offset: 1, color: '#998866' // 地面颜色
    //           // }], false),
    //           light: {
    //             main: {
    //               color: "#fff",
    //               intensity: 0.8,
    //             },
    //             ambient: {
    //               color: "#fff",
    //               intensity: 0.8,
    //             },
    //             ambientCubemap: {
    //               specularIntensity: 5,
    //               diffuseIntensity: 0.5
    //             },
    //           },
    //           boxWidth: 180,
    //           boxHeight: 100,
    //           boxDepth: 100,
    //         },
    //         // tooltip:{
    //         //   show: true,
    //         //   formatter: ({ dataIndex }) => {

    //         //     return `温度：${item.batteryList[dataIndex]}℃`
    //         //   },
    //         // },
    //         series: [
    //           {
    //             type: "scatter3D",
    //             // symbol: "path://M679.7 201c-73.1 0-136.5 40.8-167.7 100.4C480.8 241.8 417.4 201 344.3 201c-104 0-188.3 82.6-188.3 184.5 0 201.2 356 429.3 356 429.3s356-228.1 356-429.3C868 283.6 783.7 201 679.7 201z",
    //             symbolSize: 12,
    //             // itemStyle:{
    //             //   borderWidth:0.1,
    //             //   borderColor: "#fff"
    //             // },
    //             data,
    //           },
    //         ],
    //       });
    //   }
    // })
  }


  getColor = (tem: number) => {
    const obj = _.pickBy(point_color, (value, key) => new Function('a', `return ${key}`)(tem))
    return Object.values(obj)[0] || '#000'
  }

  translateBatteryData = (tab) => {
    return tab.map((item, index) => {
      // const color = colors[parseInt(Math.random() * colors.length)]
      let x = 0;
      let y = 0;
      return {
        ...item,
        maxNum: item.batteryList?.length ? Math.max(...item.batteryList) : undefined,
        batteryData: (item.batteryList || []).map((bItem, bIndex) => {
          const z = parseInt(bIndex / 36);
          // const y = index % 36
          // const z = y % 6
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
            color: this.getColor(item.batteryList[bIndex]),
            opacity: 0.9
          }

        })
      }
    })
  }


  tabsChange = (activeKey) => {
    this.setState({ activeKey })
  }


  render() {
    const { stations, energyList } = this.props;
    const { realEnergyId, batteryEnergyId, realObj, tpObj, activeKey, page, size, nowTpObj, loading, batteryModalData, batteryModalIndex, stationId } = this.state;
    return (
      <Page className="pageBox" style={{ background: 'transparent' }}>
        <div className="pageHeader">
          <div>
            <img src={this.props.theme === 'dark-theme' ? stationLight : stationDark} style={{ display: 'inline-block' }} />
            <div style={{ width: 180, marginRight: 15, display: "inline-block", marginLeft: -16 }}>
              <Select
                className="system-crumbs-select"
                style={{ width: 200 }}
                placeholder={utils.intl("请选择电站名称")}
                value={stationId || undefined}
                onChange={this.handleStationChange}
              >
                {stations.map((item) => (
                  <Option value={item.value}>{item.name}</Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="pageBody">
          <div className="pageBody1">
            <Card
              size="small"
              extra={false}
              title={
                <div>
                  {utils.intl('实时工况')}
                  <Select
                    placeholder={utils.intl("请选择能量单元")}
                    style={{ width: 148, float: "right" }}
                    value={realEnergyId || undefined}
                    onChange={this.handleRealEnergyChange}
                  >
                    {energyList.map((item) => (
                      <Option value={item.value}>{item.name}</Option>
                    ))}
                  </Select>
                  {/* 最近一次满充({realObj?.RealChargeCapacityDate || "--"})电量
                <span className="info_value">
                    {realObj?.RealChargeCapacity || "--"}kWh
                </span>
                ，满放({realObj?.RealDischargeCapacityDate || "--"})电量
                <span className="info_value">
                    {realObj?.RealDischargeCapacity || "--"}kWh
                </span> */}
                </div>
              }
            >
              <div className="card_box">
                {card_list.map((item) => (
                  <div className="sub_card">
                    <div className="charts_box">
                      <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
                        <PanelChart value={item.value(realObj)} />
                        <div className="charts_value">
                          {item.chartValue(realObj)}
                        </div>
                      </div>
                    </div>
                    <div className="info_box">
                      <div style={{ color: "#2F80ED" }}>{item.state ? item.state(realObj?.ActivePower || 0) : item.title}</div>
                      {/* <div className="info_sub_title">
                        {typeof item.subTitle === "function"
                          ? item.subTitle(realObj?.ActivePower || 0)
                          : item.subTitle}
                      </div> */}
                      <div className="info_box_value" style={{ fontSize: 14 }}>
                        {item.rightValue(realObj, realObj?.ActivePower || 0)}
                        <span
                          className="info_sub_title"
                          style={{ marginLeft: 5 }}
                        >
                          {item.rightValue(realObj, realObj?.ActivePower || 0) !== '' ? item.unit : null}
                        </span>
                      </div>
                    </div>
                    {/* {item.state ? (
                      <div className="other_box">
                        {item.state(realObj?.ActivePower || 0)}
                      </div>
                    ) : null} */}
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="pageBody2">
            <Card
              size="small"
              extra={false}
              title={
                <div>
                  {utils.intl("电池工况")}
                  <Select
                    placeholder={utils.intl("请选择能量单元")}
                    style={{ width: 148, marginLeft: 10 }}
                    value={batteryEnergyId || undefined}
                    onChange={this.handleBatteryEnergyChange}
                  >
                    {energyList.map((item) => (
                      <Option value={item.value}>{item.name}</Option>
                    ))}
                  </Select>
                </div>
              }
            >
              <Tabs defaultActiveKey="1" onChange={this.tabsChange}>
                <TabPane tab={utils.intl("单体电池温度热点图")} key="1">
                  {
                    activeKey === '1' ?
                      <div className="battery-charts-body">
                        {loading ? <Spin size="large" /> :
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
                                  <div className="sub_charts_box" onClick={() => this.setState({ batteryModalIndex: index })}>
                                    <div style={{ width: "100%", position: "absolute", bottom: 5, textAlign: "center" }}>{item.name}</div>
                                    { item.maxNum ? <div style={{ position: "absolute", right: 5, top: 3, textAlign: "center", color: this.getColor(item.maxNum) }}>{item.maxNum}℃</div> : null}
                                    <div id={`chart_${index}`} className={classNames("my_charts", { "my_charts_active": index === batteryModalIndex })} >
                                      <BatteryModel pointData={item.batteryData} background="#0b1026" openControl={false} />
                                    </div>
                                  </div>
                                ))
                              }
                              {page > 1 ? <div className="battery_page_btn" style={{ left: 0 }} onClick={() => {
                                const newPage = page - 1;
                                this.setState({ page: newPage, batteryModalIndex: 0, nowTpObj: this.translateBatteryData(tpObj.filter((item, index) => index >= (newPage - 1) * size && index < newPage * size)) })
                              }}><CaretLeftOutlined /></div> : null}
                              {page < Math.ceil(tpObj.length / size) ? <div className="battery_page_btn" style={{ right: 0 }} onClick={() => {
                                const newPage = page + 1;
                                this.setState({ page: newPage, batteryModalIndex: 0, nowTpObj: this.translateBatteryData(tpObj.filter((item, index) => index >= (newPage - 1) * size && index < newPage * size)) })
                              }}><CaretRightOutlined /></div> : null}
                            </div>
                          </>
                        }
                      </div>
                      : null
                  }
                </TabPane>
                <TabPane tab={utils.intl("电池运行数据曲线")} key="2">
                  {activeKey === "2" ? <BatteryRunningChart realEnergyId={batteryEnergyId} /> : null}
                </TabPane>
              </Tabs>
            </Card>
          </div>
        </div>
      </Page>
    );
  }
}

export default index;
