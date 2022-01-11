import React, { useState } from 'react'
import { Modal, Radio, Form } from 'wanke-gui'
import { OBJECT_TYPE, DEVICE_TYPE, Tree_Type } from '../../constants'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import { FormContainer } from '../../../components/input-item/InputItem'
import SelectItem from '../../../components/input-item/SelectItem'
import NumberItem from '../../../components/input-item/NumberItem'
import { ValueName } from '../../../interfaces/CommonInterface'
import TextItem from '../../../components/input-item/TextItem'
import RadioGroupItem from '../../../components/input-item/RadioGroupItem'
import utils from '../../../public/js/utils'

interface Props extends ActionProp {
  showAddDevice: boolean;
  visible: boolean;
  onCancel: () => void;
  energyUnitTypes: ValueName[]
  energyUnitOptions: any[];
  deviceTypeList: { title: string; id: number; name: string }[];
  parentDeviceList: { value: number; name: string }[];
  onAdd: (info) => void
}

const AddObjectDialog: React.FC<Props> = function (this: null, props) {
  const [form] = Form.useForm()

  const onOk = () => {
    // 面板选择完成
    form.validateFields().then(() => {
      let title = ''
      let treeType = ''
      if (objectType == OBJECT_TYPE.energyUnit) {
        treeType = Tree_Type.energyUnit
        title = utils.intl('能量单元')
      } else if (objectType == OBJECT_TYPE.device) {
        let match = props.deviceTypeList.find(item => item.id == deviceTypeId)
        if (match) {
          treeType = match.name
          title = match.title
        }
      }
      props.onAdd({
        treeType,
        values: { objectType, energyUnitType, energyUnitId: energyUnitId === 'null' ? '' : energyUnitId, addType, sn: snCode, deviceTypeId, deviceCount },
        title
      })
    })
  }

  const onEnergyUnitChange = (v) => {
    setEnergyUnitId(v)
    // 设备类型设置为空
    setDeviceTypeId(null)
    let energyUnitTypeId = props.energyUnitOptions.find(item => item.value == v)?.energyUnitType?.id
    // 获取设备类型
    props.action('fetchDeviceType', { energyUnitTypeId })
  }

  const [objectType, setObjectType] = useState(null)
  const [energyUnitType, setEnergyUnitType] = useState(null)
  const [energyUnitId, setEnergyUnitId] = useState(null)
  const [addType, setAddType] = useState(1)
  const [deviceTypeId, setDeviceTypeId] = useState(null)
  const [deviceCount, setDeviceCount] = useState(null)
  const [snCode, setSnCode] = useState(null)


  //render
  let match = props.deviceTypeList.find(item => item.id == deviceTypeId)
  let deviceType = match ? match.name : ''

  let objectTypeOptions = []
  objectTypeOptions.push({ name: utils.intl('能量单元'), value: OBJECT_TYPE.energyUnit })
  if (props.showAddDevice) {
    objectTypeOptions.push({ name: utils.intl('设备'), value: OBJECT_TYPE.device })
  }

  return (
    <Modal
      title={utils.intl('添加对象')}
      visible={props.visible}
      width={700}
      onOk={onOk}
      onCancel={props.onCancel}
      className="energy-unit-dialog"
      destroyOnClose={true}
      maskClosable={false}
    >
      <FormContainer form={form}>
        <div className="add-object">
          <SelectItem
            label={utils.intl('对象类型')}
            dataSource={objectTypeOptions}
            rules={[{ required: true, message: utils.intl('请选择对象类型') }]}
            value={objectType} onChange={setObjectType}
          />
          {
            objectType == OBJECT_TYPE.energyUnit && (
              <SelectItem
                label={utils.intl('能量单元类型')}
                dataSource={props.energyUnitTypes}
                rules={[{ required: true }]}
                value={energyUnitType} onChange={setEnergyUnitType}
              />
            )
          }
          {
            objectType == 'device' && (
              <SelectItem
                label={utils.intl('所属能量单元')}
                dataSource={props.energyUnitOptions}
                rules={[{ required: true, message: utils.intl('请选择所属能量单元') }]}
                value={energyUnitId} onChange={onEnergyUnitChange}
              />
            )
          }
          {/* {
            objectType == 'device' && energyUnitId && (
              <RadioGroupItem label={utils.intl('添加方式')} value={addType} onChange={(v: number) => setAddType(v)}>
                <Radio value={1}>{utils.intl("手动")}</Radio>
                <Radio value={2}>{utils.intl("SN码自动")}</Radio>
              </RadioGroupItem>
            )
          }
          {
            objectType == 'device' && addType == 2 && (
              <TextItem
                rules={[{ required: true }]}
                label={utils.intl("SN码")}
                value={snCode} onChange={setSnCode}
              />
            )
          } */}
          {
            addType == 1 && objectType == 'device' && energyUnitId != null && (
              <SelectItem
                label={utils.intl('设备类型')}
                dataSource={props.deviceTypeList.map(item => ({
                  value: item.id,
                  name: item.title
                }))}
                rules={[{ required: true, message: utils.intl('请选择设备类型') }]}
                value={deviceTypeId} onChange={setDeviceTypeId}
              />
            )
          }
          {/* {
            addType == 1 && objectType == 'device' && energyUnitId != null && (
              <SelectItem
                label={utils.intl('设备上级')}
                dataSource={props.deviceTypeList.map(item => ({
                  value: item.id,
                  name: item.title
                }))}
                rules={[{ required: true, message: utils.intl('请选择设备上级') }]}
                value={deviceTypeId} onChange={setDeviceTypeId}
              />
            )
          } */}
          {
            addType == 1 && deviceType == DEVICE_TYPE.singleBattery && (
              <NumberItem
                label={utils.intl('单体电池数量')}
                rules={[{ required: true, message: utils.intl('请输入单体电池数量') }]}
                value={deviceCount} onChange={setDeviceCount}
                placeholder="" precision={0} min={1} max={999}
              />
            )
          }
        </div>
      </FormContainer>
    </Modal>
  )
}

export default AddObjectDialog
