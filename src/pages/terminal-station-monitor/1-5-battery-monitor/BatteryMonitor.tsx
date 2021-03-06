import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { Table } from 'antd'
import Page from '../../../components/Page'
import PageProps from '../../../interfaces/PageProps'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { BatteryMonitorState } from './model'
import SocketClient from 'socket.io-client'
import { makeConnect } from '../../umi.helper'
import { terminal_battery_monitor, Socket_Port } from '../../constants'
import FullContainer from '../../../components/layout/FullContainer'
import Label from '../../../components/Label'
import { Select, FullLoading, Row, Col } from 'wanke-gui'
import DetailItem from '../../../components/layout/DetailItem'
import { ColumnProps } from 'antd/lib/table'
import { TemporaryHistoryDialog } from './dialog/TemporaryHistoryDialog'
import { VoltageHistoryDialog } from './dialog/VoltageHistoryDialog'
import { ResistanceHistoryDialog } from './dialog/ResistanceHistoryDialog'
import { getDateStr } from '../../../util/dateUtil'
import { WankeDown1Outlined, WankeUp1Outlined } from 'wanke-icon'
import styles from './battery-monitor.less'
import { copy } from '../../../util/utils'
import utils from '../../../public/js/utils'

interface Props extends PageProps, MakeConnectProps<BatteryMonitorState>, BatteryMonitorState {
  loading: boolean
  dialogLoading: boolean
  selectedStationId: number,
  stationList: any[]
}

export let socketClient = null

function ColorNumber(props) {
  if (props.max) {
    return (
      <span style={{ color: '#ff3649' }}>{props.value}</span>
    )
  }
  if (props.min) {
    return (
      <span style={{ color: '#22d34c' }}>{props.value}</span>
    )
  }
  return props.value
}

const BatteryMonitor: React.FC<Props> = function (this: null, props) {
  const { selectedStationId, stationList } = props;
  const target = stationList.find(item => item.id === selectedStationId);
  const timeZone = target?.timeZone;
  const [sort, setSort] = useState('batteryNumber');
  const [list1, setList1] = useState(props.detail.list.slice(0, Math.round(props.detail.list.length / 2)));
  const [list2, setList2] = useState(props.detail.list.slice(Math.round(props.detail.list.length / 2)))
  let detailRef = useRef(props.detail);
  let pointNumberMapRef = useRef(props.pointNumberMap);
  const showTemporaryDialog = (temperaturePointNumber) => {
    props.updateState({
      showTemporaryDialog: true,
      pointNumber: temperaturePointNumber,
      historyStartDate: getDateStr(moment()),
      historyEndDate: getDateStr(moment())
    })
  }

  const showVoltageDialog = (voltagePointNumber) => {
    props.updateState({
      showVoltageDialog: true,
      pointNumber: voltagePointNumber,
      historyStartDate: getDateStr(moment()),
      historyEndDate: getDateStr(moment())
    })
  }

  const showResistanceDialog = (resistancePointNumber) => {
    props.updateState({
      showResistanceDialog: true,
      pointNumber: resistancePointNumber,
      historyStartDate: getDateStr(moment()),
      historyEndDate: getDateStr(moment())
    })
  }

  const sortOptions = props.batteryType === 'Temperature,Voltage,Resistance'
    ? [
      { value: 'batteryNumber', name: utils.intl('????????????') },
      { value: 'voltage', name: utils.intl('???????????????') },
      { value: 'temperature', name: utils.intl('???????????????') },
      { value: 'resistance', name: utils.intl('???????????????') }
    ]
    : [
      { value: 'batteryNumber', name: utils.intl('????????????') },
      { value: 'voltage', name: utils.intl('???????????????') },
      { value: 'temperature', name: utils.intl('???????????????') }
    ]

  const varColumn = props.batteryType === 'Temperature,Voltage,Resistance'
    ? [
      {
        title: utils.intl('??????') + '(V)', width: 120, dataIndex: 'voltage', render: (value, record) => {
          return <ColorNumber max={record.isMaxVoltage} min={record.isMinVoltage} value={value} />
        }
      },
      {
        title: utils.intl('??????') + '(???)', width: 120, dataIndex: 'temperature', render: (value, record) => {
          return <ColorNumber max={record.isMaxTemperature} min={record.isMinTemperature} value={value} />
        }
      },
      {
        title: utils.intl('??????') + '(??)', width: 120, dataIndex: 'resistance', render: (value, record) => {
          return <ColorNumber max={record.isMaxResistance} min={record.isMinResistance} value={value} />
        }
      }
    ]
    : [
      {
        title: utils.intl('??????') + '(V)', width: 120, dataIndex: 'voltage', render: (value, record) => {
          return <ColorNumber max={record.isMaxVoltage} min={record.isMinVoltage} value={value} />
        }
      },
      {
        title: utils.intl('??????') + '(???)', width: 120, dataIndex: 'temperature', render: (value, record) => {
          return <ColorNumber max={record.isMaxTemperature} min={record.isMinTemperature} value={value} />
        }
      },
    ]

  const columns: ColumnProps<any>[] = [
    { title: utils.intl('?????????'), width: 120, dataIndex: 'batteryNumber' },
    ...varColumn,
    {
      title: utils.intl('??????????????????'), width: 120, dataIndex: '', render: (value, item) => {
        if (props.batteryType === 'Temperature,Voltage,Resistance') {
          return (
            <div>
              <a onClick={() => showTemporaryDialog(item.temperaturePointNumber)}>{utils.intl('??????')}</a>
              <a onClick={() => showVoltageDialog(item.voltagePointNumber)} style={{ marginLeft: 10 }}>{utils.intl('??????')}</a>
              <a onClick={() => showResistanceDialog(item.resistancePointNumber)} style={{ marginLeft: 10 }}>{utils.intl('??????')}</a>
            </div>
          )
        } else {
          return (
            <div>
              <a onClick={() => showTemporaryDialog(item.temperaturePointNumber)}>{utils.intl('??????')}</a>
              <a onClick={() => showVoltageDialog(item.voltagePointNumber)} style={{ marginLeft: 10 }}>{utils.intl('??????')}</a>
            </div>
          )
        }
      }
    }
  ]

  const onOptionChange = (state) => {
    props.updateState(state)
    props.action('reConnectSocket', { socketClient, timeZone: timeZone })
  }

  const onEnergyUnitChange = (v) => {
    props.action('fetchBatteryUnitOptions', { energyUnitId: v, socketClient, timeZone: timeZone })
    props.updateState({ value1: v, value2: null })
  }

  const onBatteryUnitChange = (v, o) => {
    props.action('fetchPackOptions', { deviceId: v, deviceTypeName: 'BatteryCluster', socketClient, timeZone: timeZone })
    props.updateState({ value2: v, value3: null })
  }

  const onPackModuleChange = (v, o) => {
    props.action('fetchPackDetailOptions', { deviceId: v, deviceTypeName: 'Pack', socketClient, timeZone: timeZone })
    props.updateState({ value3: v, value4: null })
  }

  const onSortChange = (v) => {
    setSort(v);
    const list = copy(props.detail.list);
    // ????????????????????????????????????????????????????????????????????????????????????????????????????????????
    if (v !== 'batteryNumber') {
      list.sort((a, b) => {
        return b[v] > a[v] ? 1 : -1;
      });
    }
    setList1(list.slice(0, Math.round(list.length / 2)));
    setList2(list.slice(Math.round(list.length / 2)))
  }

  useEffect(() => {
    if (selectedStationId) {
      props.action('reset')
      socketClient = SocketClient(Socket_Port + '/battery', {
        transports: ['websocket'],
        'query': 'token=' + sessionStorage.getItem('token') + '&stationId=' + selectedStationId + '&timeZone=' + sessionStorage.getItem('timeZone')
      })
      props.action('fetchEnergyUnitOptions', { socketClient, stationId: selectedStationId, timeZone: timeZone })

      detailRef.current = props.detail;
      pointNumberMapRef.current = props.pointNumberMap;
      socketClient.on('detail', (data) => {
        const detail = copy(detailRef.current);
        const pointNumberMap = copy(pointNumberMapRef.current);
        const toJson = JSON.parse(data);
        detail.lastUpdateTime = toJson.results.updateTime ? toJson.results.updateTime : null;
        for (const key in toJson?.results?.results ?? {}) {
          if (pointNumberMap[key]) {
            const batteryId = pointNumberMap[key].batteryId;
            const one = detail.list.find(item => item.batteryId === batteryId);
            pointNumberMap[key].val = toJson.results.results[key];
            const temp = pointNumberMap[key].property;
            const property = temp.slice(0, 1).toUpperCase() + temp.slice(1);
            one[temp] = pointNumberMap[key].val;
            // ???????????????1?????????????????????????????????????????????
            if (detail.list.length === 1) {
              if (pointNumberMap[key].val > detail[`max${property}`]) {
                detail[`max${property}`] = pointNumberMap[key].val;
                detail[`min${property}`] = pointNumberMap[key].val;
              } else {
                detail[`max${property}`] = pointNumberMap[key].val;
                detail[`min${property}`] = pointNumberMap[key].val;
              }
              continue;
            }
            if (pointNumberMap[key].val > detail[`max${property}`]) {
              detail[`max${property}`] = pointNumberMap[key].val;
            }
            if (pointNumberMap[key].val < detail[`min${property}`]) {
              detail[`min${property}`] = pointNumberMap[key].val;
            }
          }
        }
        detail.maxVoltage = null;
        detail.minVoltage = null;
        detail.maxTemperature = null;
        detail.minTemperature = null;
        detail.maxResistance = null;
        detail.minResistance = null;
        if (detail.list && detail.list.length) {
          // ??????????????????max???min????????????????????????????????????????????????????????????false
          let maxVoltageIndex = [];
          let minVoltageIndex = [];
          let maxTemperatureIndex = [];
          let minTemperatureIndex = [];
          let maxResistanceIndex = [];
          let minResistanceIndex = [];
          detail.maxVoltage = detail.list[0].voltage;
          detail.minVoltage = detail.list[0].voltage;
          detail.maxTemperature = detail.list[0].temperature;
          detail.minTemperature = detail.list[0].temperature;
          detail.maxResistance = detail.list[0].resistance;
          detail.minResistance = detail.list[0].resistance;
          detail.list = detail.list.map((item, i) => {
            item.isMaxVoltage = false;
            item.isMinVoltage = false;
            item.isMaxTemperature = false;
            item.isMinTemperature = false;
            item.isMaxResistance = false;
            item.isMinResistance = false;
            if (item.voltage && item.voltage >= detail.maxVoltage) {
              item.isMaxVoltage = true;
              // ?????????????????????????????????
              // ????????????????????????????????????????????????false
              if (item.voltage === detail.maxVoltage) {
                detail.maxVoltage = item.voltage;
                maxVoltageIndex.push(i);
              } else {
                for (const index of maxVoltageIndex) {
                  detail.maxVoltage = item.voltage;
                  detail.list[index].isMaxVoltage = false;
                }
                maxVoltageIndex = [i];
              }
            }
            if (item.voltage && item.voltage <= detail.minVoltage) {
              item.isMinVoltage = true;
              // ?????????????????????????????????
              // ????????????????????????????????????????????????false
              if (item.voltage === detail.minVoltage) {
                detail.minVoltage = item.voltage;
                minVoltageIndex.push(i);
              } else {
                for (const index of minVoltageIndex) {
                  detail.minVoltage = item.voltage;
                  detail.list[index].isMinVoltage = false;
                }
                minVoltageIndex = [i];
              }
            }
            if (item.temperature && item.temperature >= detail.maxTemperature) {
              item.isMaxTemperature = true;
              // ?????????????????????????????????
              // ????????????????????????????????????????????????false
              if (item.temperature === detail.maxTemperature) {
                detail.maxTemperature = item.temperature;
                maxTemperatureIndex.push(i);
              } else {
                detail.maxTemperature = item.temperature;
                for (const index of maxTemperatureIndex) {
                  detail.list[index].isMaxTemperature = false;
                }
                maxTemperatureIndex = [i];
              }
            }
            if (item.temperature && item.temperature <= detail.minTemperature) {
              item.isMinTemperature = true;
              // ?????????????????????????????????
              // ????????????????????????????????????????????????false
              if (item.temperature === detail.minTemperature) {
                detail.minTemperature = item.temperature;
                minTemperatureIndex.push(i);
              } else {
                detail.minTemperature = item.temperature;
                for (const index of minTemperatureIndex) {
                  detail.list[index].isMinTemperature = false;
                }
                minTemperatureIndex = [i];
              }
            }
            if (item.resistance && item.resistance >= detail.maxResistance) {
              item.isMaxResistance = true;
              // ?????????????????????????????????
              // ????????????????????????????????????????????????false
              if (item.resistance === detail.maxResistance) {
                detail.maxResistance = item.resistance;
                maxResistanceIndex.push(i);
              } else {
                detail.maxResistance = item.resistance;
                for (const index of maxResistanceIndex) {
                  detail.list[index].isMaxResistance = false;
                }
                maxResistanceIndex = [i];
              }
            }
            if (item.resistance && item.resistance <= detail.minResistance) {
              item.isMinResistance = true;
              // ?????????????????????????????????
              // ????????????????????????????????????????????????false
              if (item.resistance === detail.minResistance) {
                detail.minResistance = item.resistance;
                minResistanceIndex.push(i);
              } else {
                detail.minResistance = item.resistance;
                for (const index of minResistanceIndex) {
                  detail.list[index].isMinResistance = false;
                }
                minResistanceIndex = [i];
              }
            }
            return item;
          });
        }
        props.updateState({
          pointNumberMap,
          detail
        })
      })
      socketClient.on('error', (err) => {
      })
      socketClient.on('err', (err) => {
      })
      socketClient.on('connect_error', (err) => {
      })
      socketClient.on('reconnect', (data) => {
        props.action('reConnectSocket', { socketClient, timeZone: timeZone })
      })
      socketClient.on('connect_timeout', (err) => {
      })
      socketClient.on('authenticated', function () {
      })
      socketClient.on('unauthorized', function () {
      })
      return () => {
        if (socketClient) {
          socketClient.close()
        }
      }
    }
  }, [selectedStationId])

  useEffect(() => {
    detailRef.current = props.detail;
    const list = props.detail.list;
    setList1(list.slice(0, Math.round(list.length / 2)));
    setList2(list.slice(Math.round(list.length / 2)))
  }, [JSON.stringify(props.detail.list)])

  useEffect(() => {
    pointNumberMapRef.current = props.pointNumberMap;
  }, [JSON.stringify(props.pointNumberMap)])

  const detail = props.detail;
  return (
    <Page showStation={true} pageId={props.pageId} className="benefit-monitor-page" style={{ padding: 10 }}>
      {
        props.showTemporaryDialog && (
          <TemporaryHistoryDialog
            pointNumber={props.pointNumber}
            chartInfo={props.chartInfo}
            historyStartDate={props.historyStartDate}
            historyEndDate={props.historyEndDate}
            action={props.action}
            visible={props.showTemporaryDialog}
            updateState={props.updateState}
            onExited={() => props.updateState({ showTemporaryDialog: false })}
            onConfirm={() => null}
            loading={props.dialogLoading}
          />
        )
      }
      {
        props.showVoltageDialog && (
          <VoltageHistoryDialog
            pointNumber={props.pointNumber}
            chartInfo={props.chartInfo}
            historyStartDate={props.historyStartDate}
            historyEndDate={props.historyEndDate}
            visible={props.showVoltageDialog}
            action={props.action}
            updateState={props.updateState}
            onExited={() => props.updateState({ showVoltageDialog: false })}
            onConfirm={() => null}
            loading={props.dialogLoading}
          />
        )
      }
      {
        props.showResistanceDialog && (
          <ResistanceHistoryDialog
            pointNumber={props.pointNumber}
            chartInfo={props.chartInfo}
            historyStartDate={props.historyStartDate}
            historyEndDate={props.historyEndDate}
            visible={props.showResistanceDialog}
            action={props.action}
            updateState={props.updateState}
            onExited={() => props.updateState({ showResistanceDialog: false })}
            onConfirm={() => null}
            loading={props.dialogLoading}
          />
        )
      }
      <FullContainer>
        <Row>
          <Col className="v-center">
            <Label>{utils.intl('????????????')}</Label>
            <Select style={{ width: 200 }}
              value={props.value1} onChange={onEnergyUnitChange}
              dataSource={props.options1}
            />
          </Col>
          <Col className="v-center e-ml20">
            <Label>{utils.intl('????????????')}</Label>
            <Select style={{ width: 200 }}
              value={props.value2} onChange={onBatteryUnitChange}
              dataSource={props.options2} />
          </Col>
          <Col className="v-center e-ml20">
            <Label>{utils.intl('?????????')}</Label>
            <Select style={{ width: 200 }}
              value={props.value3} onChange={onPackModuleChange}
              dataSource={props.options3} />
          </Col>
          {
            props.options4.length ? (
              <Col className="v-center e-ml20">
                <Label>{utils.intl('?????????')}</Label>
                <Select style={{ width: 200 }}
                  value={props.value4} onChange={v => onOptionChange({ value4: v })}
                  dataSource={props.options4} />
              </Col>
            ) : null
          }
          <Col className="v-center e-ml20">
            <Label>{utils.intl('????????????')}</Label>
            <Select style={{ width: 200 }}
              value={sort} onChange={v => onSortChange(v)}
              dataSource={sortOptions} />
          </Col>
        </Row>
        <Row className="e-mt20">
          <Col>
            <DetailItem label={utils.intl('????????????')}>
              {detail.maxVoltage}V
                <WankeUp1Outlined style={{ marginLeft: 3 }} />
            </DetailItem>
          </Col>
          <Col>
            <DetailItem label={utils.intl('????????????')}>
              {detail.minVoltage}V
                <WankeDown1Outlined style={{ marginLeft: 3 }} />
            </DetailItem>
          </Col>
          <Col>
            <DetailItem label={utils.intl('????????????')}>
              {detail.maxTemperature}???
                <WankeUp1Outlined style={{ marginLeft: 3 }} />
            </DetailItem>
          </Col>
          <Col>
            <DetailItem label={utils.intl('????????????')}>
              {detail.minTemperature}???
                <WankeDown1Outlined style={{ marginLeft: 3 }} />
            </DetailItem>
          </Col>
          {
            props.batteryType === 'Temperature,Voltage,Resistance' && (
              <>
                <Col>
                  <DetailItem label={utils.intl('????????????')}>
                    {detail.maxResistance}??
                    <WankeUp1Outlined style={{ marginLeft: 3 }} />
                  </DetailItem>
                </Col>
                <Col>
                  <DetailItem label={utils.intl('????????????')}>
                    {detail.minResistance}??
                    <WankeDown1Outlined style={{ marginLeft: 3 }} />
                  </DetailItem>
                </Col>
              </>
            )
          }
          <Col>
            <DetailItem label={utils.intl('??????????????????')} labelStyle={{ width: 120 }}>
              {detail.lastUpdateTime}
            </DetailItem>
          </Col>
        </Row>
        <div className={`flex1 d-flex ${styles['benefit-monitor-table']}`} style={{ flexDirection: 'column' }}>
          {
            props.loading && (<FullLoading />)
          }
          <div className={styles['table-header']}>
            {columns.concat(columns).map(item => (
              <span className={styles['table-header-cell']}>{item.title}</span>
            ))}
          </div>
          <div className="flex1 d-flex" style={{ overflow: 'auto', position: 'relative' }}>
            <div className={`flex1 ${styles["table-left"]}`} style={{ overflow: 'visible' }}>
              <Table
                columns={columns}
                dataSource={list1}
                pagination={false}
              />
            </div>
            <div className="flex1" style={{ overflow: 'visible' }}>
              <Table
                columns={columns}
                dataSource={list2}
                pagination={false}
              />
            </div>
          </div>
        </div>
      </FullContainer>
    </Page>
  )
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    selectedStationId: state.global.selectedStationId,
    stationList: state.global.stationList,
    loading: getLoading('fetchBatteryInfo'),
    dialogLoading: getLoading('fetchHistoryChart')
  }
}

export default makeConnect(terminal_battery_monitor, mapStateToProps)(BatteryMonitor)
