/**
 * 安全评估
 */
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GlobalState, SafeAssessState } from 'umi'
import { Select, Table2 } from 'wanke-gui'
import { WarningFilled } from 'wanke-icon'
import AbsoluteFullDiv from '../../components/AbsoluteFullDiv'
import Page from '../../components/Page'
import { useEnergyUnit } from '../../hooks/useEnergyUnitSelect'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { battery_safe_assess, globalNS } from '../constants'
import { makeConnect } from '../umi.helper'
import classNames from 'classnames'
import "./index.less"

interface Props extends PageProps, GlobalState, MakeConnectProps<SafeAssessState>, SafeAssessState {
  loading: Boolean
}

// interface State{
//   batteryUintValue: number
// }

const SafeAssess: React.FC<Props> = (props) => {
  const { pageId, dispatch, batteryUintList, batteryAlarm, batteryAlarmList, page, size, total, loading } = props
  const { selectedEnergyUnitId, selectEnergyUnit, energyUnitList } = useEnergyUnit();
  const [batteryUintValue, setBatteryUintValue] = useState(null);
  useEffect(() => {
    setBatteryUintValue(null);
    dispatch({ type: `${battery_safe_assess}/getBatteryUnitList`, payload: { energyUnitId: selectedEnergyUnitId } });
    // 查询能量单元整体风险等级
    dispatch({ type: `${battery_safe_assess}/getBatteryAlarm`, payload: { deviceId: selectedEnergyUnitId } });
    // 查询能量单元整体风险等级列表
    dispatch({ type: `${battery_safe_assess}/getBatteryAlarmList`, payload: { energyUnitId: selectedEnergyUnitId, page: 1, size: 20 } });
  }, [selectedEnergyUnitId])

  const batteryUnits = useMemo(() => [
    { value: null, name: utils.intl('全部') },
    ...batteryUintList.map(item => ({ value: item.id, name: item.title })),
  ], [JSON.stringify(batteryUintList)]);

  const columns = useMemo(() => ([{
    title: utils.intl('序号'),
    dataIndex: 'num',
    key: 'num',
    width: 65,
    render: (text, record, index) => (page - 1) * size + index + 1
  }, {
    title: utils.intl('电池对象'),
    dataIndex: 'title',
    key: 'title',
    width: 180,
  }, {
    title: utils.intl('所属电池单元'),
    dataIndex: 'batteryUnitTitle',
    key: 'batteryUnitTitle',
    width: 220,
  }, {
    title: utils.intl('最高风险等级'),
    dataIndex: 'maxRisk',
    key: 'maxRisk',
    width: 160,
    render: (text, record) => <div className={classNames("safeAssess-table-icon", { "safeAssess-table-icon-hidden": !text })}><WarningFilled style={{ color: transformColor(text), marginRight: 8, opacity: text ? 1 : 0 }} />{transformName(text)}</div>
  }, {
    title: utils.intl('容量异常'),
    dataIndex: 'capacityRisk',
    key: 'capacityRisk',
    width: 160,
    render: (text, record) => <div className={classNames("safeAssess-table-icon", { "safeAssess-table-icon-hidden": !text })}><WarningFilled style={{ color: transformColor(text), marginRight: 8, opacity: text ? 1 : 0 }} />{transformName(text)}</div>
  }, {
    title: utils.intl('电压异常'),
    dataIndex: 'voltageRisk',
    key: 'voltageRisk',
    width: 160,
    render: (text, record) => <div className={classNames("safeAssess-table-icon", { "safeAssess-table-icon-hidden": !text })}><WarningFilled style={{ color: transformColor(text), marginRight: 8, opacity: text ? 1 : 0 }} />{transformName(text)}</div>
  }, {
    title: utils.intl('温度异常'),
    dataIndex: 'tempRisk',
    key: 'tempRisk',
    width: 160,
    render: (text, record) => <div className={classNames("safeAssess-table-icon", { "safeAssess-table-icon-hidden": !text })}><WarningFilled style={{ color: transformColor(text), marginRight: 8, opacity: text ? 1 : 0 }} />{transformName(text)}</div>
  }, {
    title: utils.intl('析锂预警'),
    dataIndex: 'liOutRisk',
    key: 'liOutRisk',
    width: 160,
    render: (text, record) => <div className={classNames("safeAssess-table-icon", { "safeAssess-table-icon-hidden": !text })}><WarningFilled style={{ color: transformColor(text), marginRight: 8, opacity: text ? 1 : 0 }} />{transformName(text)}</div>
  }, {
    title: utils.intl('微短路异常'),
    dataIndex: 'shortCircuitRisk',
    key: 'shortCircuitRisk',
    width: 160,
    render: (text, record) => <div className={classNames("safeAssess-table-icon", { "safeAssess-table-icon-hidden": !text })}><WarningFilled style={{ color: transformColor(text), marginRight: 8, opacity: text ? 1 : 0 }} />{transformName(text)}</div>
  },]), [page, size])

  const fieldsToCN = useMemo(() => columns.reduce((pre, column) => ({ ...pre, [column.key]: column.title }), {}), [])

  const handleBatteryUnitChange = useCallback(
    (value) => {
      setBatteryUintValue(value);
      // 查询能量单元整体风险等级
      dispatch({ type: `${battery_safe_assess}/getBatteryAlarm`, payload: { deviceId: value ? value : selectedEnergyUnitId } });
      // 查询能量单元整体风险等级列表
      dispatch({ type: `${battery_safe_assess}/getBatteryAlarmList`, payload: { energyUnitId: selectedEnergyUnitId, batteryUnitId: value || undefined, page: 1, size: 20 } });
    },
    [selectedEnergyUnitId],
  )

  // 字段转换方法
  const transformName = useCallback((name) => {
    if (name === 'high') return utils.intl('高风险')
    else if (name === 'middle') return utils.intl('中风险')
    else if (name === null) return utils.intl('低风险')
    return null;
  }, [])

  const transformColor = useCallback((name) => {
    if (name === 'high') return '#E0252F'
    else if (name === 'middle') return '#FFAD38'
    else if (name === null) return '#62D46E'
    return 'rgba(0,0,0,0)';
  }, [])


  const batteryAlarmKeys = useMemo(() => {
    const keys = Object.keys(batteryAlarm).filter(key => key !== 'overallRisk' && (batteryAlarm[key] === 'high' || batteryAlarm[key] === 'middle'));
    return keys
  }, [batteryAlarm]);

  const tablePageChange = useCallback(
    (page, size) => {
      // 查询能量单元整体风险等级
      dispatch({ type: `${battery_safe_assess}/getBatteryAlarm`, payload: { deviceId: batteryUintValue ? batteryUintValue : selectedEnergyUnitId } });
      // 查询能量单元整体风险等级列表
      dispatch({ type: `${battery_safe_assess}/getBatteryAlarmList`, payload: { energyUnitId: selectedEnergyUnitId, batteryUnitId: batteryUintValue || undefined, page, size } });
    },
    [selectedEnergyUnitId, batteryUintValue],
  )

  return (
    <Page pageId={pageId} showStation showEnergyUnit>
      <div className="page-header">
        <span style={{ width: 120 }}>{utils.intl('所属电池单元')}</span>
        <Select
          dataSource={batteryUnits}
          className="card-detail-select"
          style={{ width: 192, fontWeight: "normal" }}
          value={batteryUintValue}
          onChange={handleBatteryUnitChange} />
      </div>
      <div className="page-body">
        <div className="page-body-header">
          <span className="label">{utils.intl('整体')}</span>
          <span style={{ color: transformColor(batteryAlarm.overallRisk || null), marginRight: 16 }}>{transformName(batteryAlarm.overallRisk || null)}</span>
          <span className="label">{utils.intl('风险项')}</span>
          <span>
            {
              batteryAlarmKeys.length ? batteryAlarmKeys.map(key => (
                <span style={{ color: transformColor(batteryAlarm[key]), marginRight: 8 }}>{fieldsToCN[key]}</span>
              )) : '--'
            }
          </span>
        </div>
        <div className="page-table-box">
          <Table2
            x={1120}
            dataSource={batteryAlarmList}
            columns={columns}
            loading={loading}
            page={page}
            size={size}
            total={total}
            onPageChange={tablePageChange}
          />
        </div>
      </div>
    </Page>
  )
}


const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationList: state[globalNS].stationList,
    loading: getLoading('getBatteryAlarmList')
  }
}

export default makeConnect(battery_safe_assess, mapStateToProps)(SafeAssess);
