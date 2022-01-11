import React, { useEffect, useRef, useState } from 'react'
import { Checkbox, FullLoading, Input, Modal, Radio, Tabs } from 'wanke-gui'
import OriginTabs from '../../../../components/OriginTabs'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps'
import utils from '../../../../public/js/utils'
import TagList from '../../../common-history-data-new/components/TagList'
import { alarm_config, Tree_Type } from '../../../constants'
import { makeConnect } from '../../../umi.helper'
import { AlarmState } from '../../model'
import './point-data-modal.less'
import PointDataTree, { PointDataTreeRef } from './PointDataTree'

const { Search } = Input

export interface DeviceItem {
  deviceId: number
  deviceTitle: string
  measureId?: number
  measureTitle?: string
  pointId: number
  pointTitle: string
}

enum TabEnum {
  DataCollect = 'DataCollect',
  TechParams = 'TechParams',
}

enum DataEnum {
  Measure = 'Measure',
  Other = 'Ohter'
}

const { TabPane } = OriginTabs

interface Props extends MakeConnectProps<AlarmState>, AlarmState {
  id: number
  isStation: boolean
  disabledPointIds: string[] // 禁用数据项id列表 设备id:测点id:数据项id 或者 设备id:模型id
  onClose: () => void
  onFinish: (values: DeviceItem[]) => void
  showTechnologyParams?: boolean // 是否显示技术参数

  // 不用传的参数
  getPointDataTreeLoading?: boolean
  getPointDataLoading?: boolean
  getTechPointDataLoading?: boolean
}

const PointDataModal: React.FC<Props> = (props) => {
  const {
    showTechnologyParams,
    id,
    isStation,
    pointTreeData,
    pointDataList,
    techPointDataList,
    disabledPointIds,
  } = props
  const [tabKey, setTabKey] = useState<TabEnum>(TabEnum.DataCollect)
  const [dataType, setDataType] = useState<DataEnum>()
  const [queryStr, setQueryStr] = useState<string>()
  const [selectedDevice, setSelectedDevice] = useState<any>()
  const [checkedPoints, setCheckedPoints] = useState<DeviceItem[]>([])
  const pointDataTreeRef = useRef<PointDataTreeRef>()

  const isTech = tabKey === TabEnum.TechParams
  const isOther = dataType === DataEnum.Other
  const isEnergyUnitOrStation = selectedDevice && isStationOrEnergyUnit(selectedDevice)

  const handleOk = () => {
    props.onFinish(checkedPoints)
  }

  const handleCloseTag = (item) => {
    const newList = checkedPoints.filter(point => point.deviceId !== item.deviceId)
    setCheckedPoints(newList)
    if (!item.extraNumber || item.deviceId === selectedDevice.id) {
      if (newList.length) {
        pointDataTreeRef.current.selectNode(newList[0].deviceId)
      } else {
        setSelectedDevice(null)
        pointDataTreeRef.current.clearSelect()
        props.updateState({
          pointDataList: [],
          techPointDataList: [],
        })
      }
    }
  }

  const handleClickTag = (item) => {
    if (selectedDevice?.id !== item.deviceId) {
      pointDataTreeRef.current.selectNode(item.deviceId)
    }
  }

  const handleCheck = (item, checked, measure?) => {
    if (checked) {
      setCheckedPoints(checkedPoints.concat(formatPoint(item, selectedDevice, measure)))
    } else {
      setCheckedPoints(checkedPoints.filter(point => point.pointId !== item.id))
    }
  }

  // 选择设备
  const handleSelectDevice = (node: any) => {
    const isEnergyUnitOrStation = node && isStationOrEnergyUnit(node)
    setSelectedDevice(node)
    // 能量单元和电站没有量测数据, 选中其他数据
    if (isEnergyUnitOrStation && !isOther) {
      setDataType(DataEnum.Other)
    } else if (!dataType) {
      setDataType(DataEnum.Measure)
    }
  }

  // 获取数据项
  const fetchPointData = (selectedDevice, tabKey, dataType) => {
    if (!selectedDevice || !tabKey) return
    if (tabKey === TabEnum.DataCollect) {
      if (!dataType) return
      props.action('getPointData', { deviceId: selectedDevice.id, isOther })
    } else {
      props.action('getTechPointData', { deviceId: selectedDevice.id })
    }
  }

  useEffect(() => {
    if (id) {
      // 获取设备树
      props.action('getPointDataTree', { id, isStation })
    }
  }, [id])

  // 选中设备，切换tab，请求数据项
  useEffect(() => {
    fetchPointData(selectedDevice, tabKey, dataType)
  }, [selectedDevice, tabKey, dataType])

  useEffect(() => {
    return () => {
      props.updateState({
        pointDataList: [],
        techPointDataList: [],
      })
    }
  }, [])

  const filterPointData = (list) => {
    if (!queryStr) return list
    return list.filter(item => item.title && item.title.indexOf(queryStr) > -1)
  }
  
  const [techDisabledList, disabledMap] = formatDisabledPointIds(disabledPointIds, selectedDevice)

  return (
    <Modal
      visible
      width={1000}
      title={utils.intl('选择数据项')}
      onOk={handleOk}
      onCancel={props.onClose}
      wrapClassName="alarm-point-data-modal"
    >
      <section className="alarm-point-data">
        <aside className="alarm-point-data-tree-container">
          {props.getPointDataTreeLoading ? <FullLoading /> : null}
          <PointDataTree
            ref={pointDataTreeRef}
            treeData={pointTreeData}
            onSelect={handleSelectDevice}
          />
        </aside>
        <div className="alarm-point-data-body">
          <div className="alarm-point-data-tags">
            <div className="alarm-point-data-tags-label">{utils.intl('当前选中')}:</div>
            <div className="alarm-point-data-tags-body">
              <TagList
                dataSource={getTagList(selectedDevice, checkedPoints)}
                onClick={handleClickTag}
                onClose={handleCloseTag}
                style={{}}
              />
            </div>
          </div>
          <OriginTabs
            onChange={setTabKey as any}
            type="card"
            activeKey={tabKey}
            style={{ flexShrink: 0 }}
            size="small"
          >
            <TabPane tab={utils.intl('数据采集')} key={TabEnum.DataCollect}>
            </TabPane>
            {showTechnologyParams ? (
              <TabPane tab={utils.intl('技术参数')} key={TabEnum.TechParams}>
              </TabPane>
            ) : null}
          </OriginTabs>
          <div className="alarm-point-data-filter">
            <Search
              onSearch={setQueryStr}
              placeholder={utils.intl('请输入关键字')}
              style={{ width: 200, marginBottom: 8 }}
            />
            {!isTech && selectedDevice ? (
              <div>
                <Radio.Group onChange={e => setDataType(e.target.value)} value={dataType}>
                  {!isEnergyUnitOrStation ? (
                    <Radio value={DataEnum.Measure} style={{ marginRight: 16 }}>{utils.intl('量测数据')}</Radio>
                  ) : null}
                  <Radio value={DataEnum.Other}>{utils.intl('其他数据')}</Radio>
                </Radio.Group>
              </div>
            ) : null}
          </div>
          <div className="alarm-point-data-point-container">
            {props.getPointDataLoading || props.getTechPointDataLoading ? (
              <FullLoading />
            ) : null}
            {isTech ? (
              <PointDataList
                key="tech"
                checkedIds={checkedPoints.map(point => point.pointId)}
                disabledPointIds={techDisabledList}
                list={filterPointData(techPointDataList)}
                onChange={(item, checked) => handleCheck(item, checked)}
              />
            ) : null}
            {!isTech && isOther ? (
              pointDataList.map(measure => (
                <PointDataList
                  key={measure.id}
                  checkedIds={checkedPoints.map(point => point.pointId)}
                  disabledPointIds={disabledMap[measure.id] || []}
                  list={filterPoints(filterPointData(measure.points))}
                  onChange={(item, checked) => handleCheck(item, checked, measure)}
                />
              ))
            ) : null}
            {!isTech && !isOther ? (
              pointDataList.map(measure => (
                <PointDataList
                  key={measure.id}
                  checkedIds={checkedPoints.map(point => point.pointId)}
                  disabledPointIds={disabledMap[measure.id] || []}
                  label={measure.title}
                  list={filterPoints(filterPointData(measure.points))}
                  onChange={(item, checked) => handleCheck(item, checked, measure)}
                />
              ))
            ) : null}
          </div>
        </div>
      </section>
    </Modal>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    getPointDataTreeLoading: getLoading('getPointDataTree'),
    getPointDataLoading: getLoading('getPointData'),
    getTechPointDataLoading: getLoading('getTechPointData'),
  }
}

export default makeConnect(alarm_config, mapStateToProps)(PointDataModal)

interface PointDataListProps {
  label?: string
  disabledPointIds: any[]
  checkedIds: number[]
  list: any[]
  onChange: (item: any, checked: boolean) => void
}

const PointDataList: React.FC<PointDataListProps> = ({ label, checkedIds, disabledPointIds, list, onChange }) => {
  const handleCheck = (item, checked) => {
    onChange(item, checked)
  }

  return (
    <div className="alarm-point-data-point-list">
      {label ? (
        <div className="alarm-point-data-point-list-label">{label}:</div>
      ) : null}
      <div className="alarm-point-data-point-list-body">
        {list.map(item => (
          <Checkbox
            key={item.id}
            checked={checkedIds.includes(item.id)}
            disabled={disabledPointIds.includes(item.id)}
            onChange={(e) => handleCheck(item, e.target.checked)}
          >{item.title}</Checkbox>
        ))}
      </div>
    </div>
  )
}

function filterPoints(points) {
  return points?.filter(point => point.title)
}

function formatPoint(node, device, measure?): DeviceItem {
  const target: DeviceItem = {
    deviceId: device.id,
    deviceTitle: device.title,
    pointId: node.id,
    pointTitle: node.title,
  }

  if (measure) {
    target.measureId = measure.id
    target.measureTitle = measure.title
  }

  return target
}

function isStationOrEnergyUnit(device) {
  return device.type === Tree_Type.station || device.type === Tree_Type.energyUnit
}

function getTagList(device: any, list: DeviceItem[]) {
  const tags = [];
  list.forEach(item => {
    const target = tags.find(tag => tag.deviceId === item.deviceId);
    if (target) {
      target.extraNumber++
    } else {
      tags.push({
        deviceId: item.deviceId,
        extraNumber: 1,
        name: item.deviceTitle,
      })
    }
  })
  if (device) {
    const target = tags.find(tag => tag.deviceId === device.id);
    if (!target) {
      tags.push({
        deviceId: device.id,
        extraNumber: 0,
        name: device.title,
      })
    }
  }

  return tags
}

function formatDisabledPointIds(ids, selectedDevice): [number[], { [key: string]: number[] }] {
  const techDisabledList = []
  const disabledMap = {}
  if (selectedDevice?.id) {
    ids.forEach(id => {
      const strList = id.split(':')
      if (strList[0] === selectedDevice.id.toString()) {
        if (strList.length === 2) {
          techDisabledList.push(Number(strList[1]))
        } else if(strList.length === 3) {
          const measureId = strList[1]
          if (!disabledMap[measureId]) {
            disabledMap[measureId] = []
          }
          disabledMap[measureId].push(Number(strList[2]))
        }
      }
    })
  }
  return [techDisabledList, disabledMap]
}
