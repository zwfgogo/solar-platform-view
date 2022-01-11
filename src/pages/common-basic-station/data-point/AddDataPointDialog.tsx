import React, { useEffect, useState } from 'react'
import { Modal, Form } from 'wanke-gui'
import { DEVICE_TYPE, Mode } from '../../constants'
import { FormContainer } from '../../../components/input-item/InputItem'
import { ValueName } from '../../../interfaces/CommonInterface'
import SelectItem from '../../../components/input-item/SelectItem'
import TextItem from '../../../components/input-item/TextItem'
import { numberStringRule } from '../../../util/ruleUtil'
import utils from '../../../public/js/utils';

//新增数据采集配置
interface Props {
  visible: boolean
  mode: Mode
  detail: any
  typeList: any[]
  onConfirm: (values: any) => void
  onCancel: () => void
  type?: any
  terminalTypes: any[]
  inputOutputOptions: ValueName[]
  fetchSignalName: (pointId) => void
  fetchSignalNameSuccess: boolean
  newSignalName: string
}

const AddDataPointDialog: React.FC<Props> = function (this: null, props) {
  let [form] = Form.useForm()

  const confirm = () => {
    form.validateFields().then(() => {
      props.onConfirm({
        title: props.typeList.find(item => item.value == dataItemId)?.name,
        typeId: dataItemId,
        terminalId,
        pointID,
        signalTitle
      })
    })
  }

  const cancel = () => {
    props.onCancel()
  }

  const getInitValue = name => {
    if (!props.detail) {
      return null
    }
    return props.detail[name] || null
  }

  useEffect(() => {
    if (props.fetchSignalNameSuccess) {
      setSignalTitle(props.newSignalName)
    }
  }, [props.fetchSignalNameSuccess])

  const [dataItemId, setDataItemId] = useState(getInitValue('typeId'))
  const [terminalTypeId, setTerminalTypeId] = useState(getInitValue('terminalTypeId'))
  const [terminalId, setTerminalId] = useState(getInitValue('terminalId'))
  const [pointID, setPointID] = useState<string>(getInitValue('pointNumber') || '')
  const [signalTitle, setSignalTitle] = useState(getInitValue('signalTitle'))

  return (
    <Modal
      centered
      bodyStyle={{ color: 'white' }}
      width={380}
      title={props.mode == Mode.add ? utils.intl("新增") : utils.intl("编辑")}
      visible={props.visible}
      onOk={confirm}
      onCancel={cancel}
      className="add-data-point-dialog fixed-form-label-135"
    >
      <FormContainer form={form} className="input-unit-container">
        <SelectItem
          label={utils.intl("数据项名称")}
          dataSource={props.typeList}
          rules={[{ required: true, message: utils.intl("请输入数据项名称") }]}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          value={dataItemId} onChange={setDataItemId}
        />

        {
          (props.type === DEVICE_TYPE.pcs || props.type === DEVICE_TYPE.transformer) && (
            <SelectItem
              label={utils.intl("设备端子")}
              value={terminalTypeId} onChange={setTerminalTypeId}
              dataSource={props.terminalTypes}></SelectItem>
          )
        }

        {
          props.inputOutputOptions.length > 0 && (
            <SelectItem
              label={utils.intl("输入/输出端名称")}
              rules={[{ required: true, message: utils.intl('请选择输入/输出端名称') }]}
              dataSource={props.inputOutputOptions}
              value={terminalId} onChange={setTerminalId}
            />
          )
        }

        <TextItem
          label="PointID"
          rules={[{ required: true, message: utils.intl('请输入PointID') }, numberStringRule()]}
          onBlur={() => pointID && props.fetchSignalName(pointID)}
          value={pointID} onChange={setPointID}
        />

        <TextItem
          label={utils.intl("信号名称")} rules={[{ required: true, message: utils.intl('PointID无效') }]}
          placeholder={utils.intl("输入PointID后，自动获取")}
          disabled={true}
          value={signalTitle}
        />
      </FormContainer>
    </Modal>
  )
}

export default AddDataPointDialog
