import React, { FC, useEffect, useState } from 'react'
import { Button, Form, FullLoading, Table, Table1 } from 'wanke-gui'
import { DEVICE_TYPE, Mode, stationUpdateNS } from '../../constants'
import { FormContainer } from '../../../components/input-item/InputItem'
import FullContainer from '../../../components/layout/FullContainer'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import TypeManager, { Model } from '../station-update/input-type/TypeManager'
import {
  __temporaryDeviceModelLogic,
  getFormatDateStr,
  handleModelAreaValues,
  handleModelParentValues,
  handleModelValue,
} from '../station.helper'
import { ValueName } from '../../../interfaces/CommonInterface'
import ParentType from './ParentType'
import utils from '../../../public/js/utils'
import BorderHeader from '../../../components/BorderHeader'
import { makeConnect } from '../../umi.helper'
import { extractByKey } from '../../page.helper'

interface Props extends ActionProp {
  stationId: number
  mode: Mode
  energyUnitId: number
  deviceId: number
  deviceTypeId: number
  deviceModels: Model[]
  parent1Options: ValueName[]
  parent2Options: ValueName[]
  parent3Options: ValueName[]
  title: string
  detail: any
  deviceTypeList: { title: string; id: number; name: string }[];
  provinceOptions: ValueName[]
  cityOptions: ValueName[]
  districtOptions: ValueName[]
  toMapSelect: (latitude, longitude, onSuccess: ({ lat, lng }) => void) => void
  cancelUpdate: () => void
  onAdd: (values) => void
  loading: boolean
  fetchDeviceNameSuccess: boolean
  newDeviceInfo: { title: string, serial: string }
  dataPointTotal: any
  list: any[]
  bindCollectDevices: any
  treeList: any
  dispatch: any
}

const PropertyList: FC<Props> = function (this: null, props) {
  // const [recordModal, setRecordModal] = useState(false)
  const [values, setValues] = useState<any>({})
  const [form] = Form.useForm()
  const [deviceCategories, setDeviceCategories] = useState('')

  const getTitle = (value, options) => {
    return options.find(item => item.value == value)?.name || ''
  }

  const handleValueItem = (model, results) => {
    const type = model.dataType?.name
    const name = model.name
    const timeAccuracy = model.timeAccuracy?.name
    if (name == 'parentDevice') {
      let value = props.parent1Options.find(item => item.value == values.parentDevice?.parent1Id)?.value
      results.batteryUnit = { id: value }
      if (values.parentDevice?.parent2Id) {
        value = props.parent2Options.find(item => item.value == values.parentDevice.parent2Id)?.value
        results.batteryCluster = { id: value }
      }
      if (values.parentDevice?.parent3Id) {
        value = props.parent3Options.find(item => item.value == values.parentDevice.parent3Id)?.value
        results.pack = { id: value }
      }
    } else if (type == 'enum') {
      results[name] = model.enumValues.find(option => option.name == values[name])
    } else if (type == 'date') {
      results[name] = getFormatDateStr(values[name], timeAccuracy)
    } else if (type == 'bool') {
      results[name] = values[name] == 1
    } else if (type == 'area') {
      results.province = { id: values[name].provinceId, title: getTitle(values[name].provinceId, props.provinceOptions) }
      results.city = { id: values[name].cityId, title: getTitle(values[name].cityId, props.cityOptions) }
      results.district = { id: values[name].districtId, title: getTitle(values[name].districtId, props.districtOptions) }
    } else {
      results[name] = values[name]
    }
  }

  const handleDeviceModelValues = (models: Model[], detail) => {
    let values: any = {}
    models.forEach(model => {
      let dataType = model.dataType?.name
      const name = model.name
      if (dataType == 'area') {
        values[name] = handleModelAreaValues(detail)
      } else {
        values[name] = handleModelValue(model, detail[name])
      }
    })
    values.parentDevice = handleModelParentValues(detail)
    return values
  }

  const onSave = () => {
    form.validateFields().then(() => {
      let values1: Record<string, any> = {}
      props.deviceModels.forEach(item => {
        handleValueItem(item, values1)
      })
      let deviceType = props.deviceTypeList.find(item => item.id == props.deviceTypeId)?.name
      if (deviceType == DEVICE_TYPE.batteryGroup || deviceType == DEVICE_TYPE.batteryPackage || deviceType == DEVICE_TYPE.singleBattery) {
        values1.serial = props.newDeviceInfo.serial || props.detail.serial
      }
      props.onAdd(values1)
    })
  }

  const fetchParent2 = (parent1) => props.action('fetchParent2Options', {
    parentId: parent1,
    energyUnitId: props.energyUnitId,
    deviceTypeName: 'batteryCluster'
  })

  const fetchParent3 = (parent2) => {
    props.action('fetchParent3Options', {
      parentId: parent2,
      energyUnitId: props.energyUnitId,
      deviceTypeName: 'pack'
    })
  }

  useEffect(() => {
    const energyUnit = props.deviceTypeList.find(item => item.id === props.deviceTypeId)
    if (props.energyUnitId) {
      props.action('fetchParent1Options', {
        parentId: props.energyUnitId,
        energyUnitId: props.energyUnitId,
        deviceTypeName: energyUnit?.name === 'Stack' ? 'RFBUnit' : 'batteryUnit' // 针对电堆类型的设备特殊处理
      })
    }
  }, [])

  useEffect(() => {
    if (props.deviceId) {
      props.dispatch({
        type: 'stationRecordModel/getDeviceCategoriesByDeviceId', payload: { deviceId: props.deviceId }
      }).then(res => {
        setDeviceCategories(res?.name)
      });
    }
  }, [props.deviceId])
  
  useEffect(() => {
    if (props.detail && props.detail?.batteryUnit) {
      const energyUnitId = props.energyUnitId
      const batteryUnitId = props.detail?.batteryUnit.id
      props.action('fetchParent1Options', {
        parentId: energyUnitId,
        energyUnitId: energyUnitId,
        deviceTypeName: 'batteryUnit'
      })
      if (props.detail && props.detail?.batteryCluster) {
        const batteryClusterId = props.detail?.batteryCluster.id
        props.action('fetchParent2Options', {
          parentId: batteryUnitId,
          energyUnitId: energyUnitId,
          deviceTypeName: 'batteryCluster'
        })
        if (props.detail && props.detail?.pack) {
          props.action('fetchParent3Options', {
            parentId: batteryClusterId,
            energyUnitId: energyUnitId,
            deviceTypeName: 'pack'
          })
        }
      }
    }
  }, [props.detail])

  useEffect(() => {
    if (props.deviceTypeId) {
      props.action('fetchDeviceModel', { modelTypeId: props.deviceTypeId, modId: props.deviceId })
    }
  }, [props.deviceTypeId])

  useEffect(() => {
    setValues(handleDeviceModelValues(props.deviceModels, props.detail))
  }, [props.deviceModels, props.detail])

  useEffect(() => {
    if (props.mode == Mode.add && values.parentDevice) {
      let deviceType = props.deviceTypeList.find(item => item.id == props.deviceTypeId)?.name
      if (deviceType == DEVICE_TYPE.batteryGroup && values.parentDevice.parent1Id) {
        props.action('fetchDeviceName', { parentId: values.parentDevice.parent1Id, type: deviceType })
      }
      if (deviceType == DEVICE_TYPE.batteryPackage && values.parentDevice.parent2Id) {
        props.action('fetchDeviceName', { parentId: values.parentDevice.parent2Id, type: deviceType })
      }
      if (deviceType == DEVICE_TYPE.singleBattery && (values.parentDevice.parent2Id || values.parentDevice.parent3Id)) {
        props.action('fetchDeviceName', { parentId: values.parentDevice.parent3Id || values.parentDevice.parent2Id, type: deviceType })
      }
    }
  }, [props.mode, values.parentDevice])

  useEffect(() => {
    if (props.fetchDeviceNameSuccess) {
      setValues({
        ...values, title: props.newDeviceInfo.title
      })
    }
  }, [props.fetchDeviceNameSuccess])

  // render

  if (props.mode == Mode.update && !props.detail) {
    return <FullLoading />
  }
  let unit = '';
  let beforeTitle = '';
  let afterTitle = '';

  if (deviceCategories === 'ConverterInverter') {
    unit = "kW"
    beforeTitle = utils.intl('更换前额定功率')
    afterTitle = utils.intl('更换前额定功率')
  } else if (deviceCategories === 'Transformer') {
    unit = "kVA"
    beforeTitle = utils.intl('更换前容量')
    afterTitle = utils.intl('更换后容量')
  } else if (deviceCategories === 'LithiumIonBattery' || deviceCategories === 'LeadCarbonBattery') {
    unit = "Ah"
    beforeTitle = utils.intl('更换前容量')
    afterTitle = utils.intl('更换后容量')
  }
  const columns: any = [
    {
      title: utils.intl('序号'), dataIndex: 'num', width: 80
    },
    {
      title: utils.intl('运维时间'), dataIndex: 'dtime', key: 'sbxz',
    },
    {
      title: utils.intl('运维内容'), dataIndex: 'content', width: 120
    },
    {
      title: beforeTitle, dataIndex: 'beforeValue', width: beforeTitle === '' ? 0 : 180,
      render: (text, record, index) => {
        return (
          <span>
            {text ? text + unit : ''}
          </span>
        )
      }
    },
    {
      title: afterTitle, dataIndex: 'afterValue', width: afterTitle === '' ? 0 : 180,
      render: (text, record, index) => {
        return (
          <span>
            {text ? text + unit : ''}
          </span>
        )
      }
    },
    {
      title: utils.intl('备注'), dataIndex: 'remarks',
    }
  ]
  return (
    <FullContainer>
      {/* <CrumbsPortal pageName='stationUpdate'>
        {props.mode == Mode.update && <Button style={{ marginLeft: '16px' }} onClick={props.cancelUpdate}>{utils.intl('取消')}</Button>}
        <Button type="primary" style={{ marginLeft: '16px' }} loading={props.loading}
          onClick={onSave}
        >
          {utils.intl('保存')}
        </Button>
      </CrumbsPortal> */}
      <div className="flex1" style={{ overflowY: 'auto' }}>
        {/* {recordModal ?
          <RecordModal
            cancel={() => { setRecordModal(false) }}
            visible={recordModal}
            detail={props.detail}
          /> : ''} */}
        <FormContainer form={form}
          className="flex-wrap"
          style={{ overflowY: 'auto' }}
          scrollToFirstError={true}
        >
          <BorderHeader title={utils.intl('基本信息')}>
            <div style={{ position: 'absolute', right: 16, top: 20 }}>
              <Button
                type="primary"
                loading={props.loading}
                style={{ fontSize: 12 }}
                onClick={onSave}
                size="small"
              >
                {utils.intl('保存')}
              </Button>
              {props.mode == Mode.update && <Button size="small" style={{ marginLeft: 8, fontSize: 12 }} onClick={props.cancelUpdate}>{utils.intl('取消')}</Button>}
            </div>

            {
              __temporaryDeviceModelLogic(props.deviceModels, props.detail).map(model => {
                const name = model.name
                let deviceType
                if (props.mode == Mode.add) {
                  deviceType = props.deviceTypeList.find(item => item.id == props.deviceTypeId)?.name
                } else {
                  deviceType = props.detail?.deviceType?.name
                }
                if (name == 'parentDevice') {
                  return (
                    <ParentType
                      disabled={props.mode == Mode.update}
                      deviceType={deviceType}
                      value={values[name] || { parent1Id: null, parent2Id: null, parent3Id: null }}
                      onChange={(obj) => setValues({ ...values, ...obj })}
                      onParent1Change={fetchParent2}
                      onParent2Change={fetchParent3}
                      parentOption1={props.parent1Options}
                      parentOption2={props.parent2Options}
                      parentOption3={props.parent3Options}
                    />
                  )
                }
                let placeholder
                if (name == 'title' &&
                  (deviceType == DEVICE_TYPE.batteryPackage || deviceType == DEVICE_TYPE.batteryGroup || deviceType == DEVICE_TYPE.singleBattery)) {
                  placeholder = utils.intl('选择上级后自动获取')
                }
                return (
                  <TypeManager
                    key={model.name}
                    values={values}
                    onChange={setValues}
                    model={model}
                    placeholder={placeholder}
                    provinceOptions={props.provinceOptions}
                    cityOptions={props.cityOptions}
                    districtOptions={props.districtOptions}
                    onProvinceChange={(provinceId) => props.action('fetchCityOptions', { parentId: provinceId })}
                    onCityChange={(cityId) => props.action('fetchDistrictOptions', { parentId: cityId })}
                    toMapSelect={props.toMapSelect}
                  />
                )
              })
            }
          </BorderHeader>
          {props.mode === Mode.update &&
            <BorderHeader title={utils.intl('台账运维记录')} btnsStyle={{ paddingRight: 11 }} style={{ marginTop: '16px' }}>
              {/* <Button
                style={{ color: '#356edf', borderColor: '#3D7EFF', position: 'absolute', right: 16, top: 20, fontSize: 12 }}
                size="small"
                onClick={() => setRecordModal(true)}
              >
                {utils.intl("新增")}
              </Button> */}
              <div className="flex1 f-pr">
                <Table
                  dataSource={props.list}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                />
              </div>
            </BorderHeader>
          }
          {/*props.mode === Mode.update &&
            <BorderHeader title={utils.intl('采集设备')} style={{ marginTop: '16px' }}>
              <div style={{ marginLeft: 8 }}>{extractByKey(props.bindCollectDevices || [], 'name')}</div>
            </BorderHeader>
          */}
          {/*props.mode === Mode.update &&
            <BorderHeader title={utils.intl('采集信号')} style={{ marginTop: '16px' }}>
              <div style={{ marginLeft: 8 }}>{utils.intl('共')}
                <span style={{ fontSize: 24, color: '#3D7EFF', padding: '0 4px' }}>
                  {props.dataPointTotal}
                </span>{utils.intl('个')}
              </div>
            </BorderHeader>
          */}

        </FormContainer>
      </div>
    </FullContainer>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
  }
}

export default makeConnect(stationUpdateNS, mapStateToProps)(PropertyList)