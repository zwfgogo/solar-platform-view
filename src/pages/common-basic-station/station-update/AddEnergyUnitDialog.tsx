import React, { useEffect, useState } from 'react'
import { Form, Modal } from 'wanke-gui'
import { FormContainer } from '../../../components/input-item/InputItem'
import SelectItem from '../../../components/input-item/SelectItem'
import { ValueName } from '../../../interfaces/CommonInterface'
import utils from '../../../public/js/utils'
// 设备信息页签 新增能量单元
interface Props {
  energyUnitTypes: ValueName[]
  visible: boolean
  onExited: () => void
  onConfirm: (energyTypeId: number) => void
}

const AddEnergyUnitDialog: React.FC<Props> = function (this: null, props) {
  const [form] = Form.useForm()
  const [type, setType] = useState(null)

  const handleSubmit = () => {
    form.validateFields().then(() => {
      props.onConfirm(type)
    })
  }

  return (
    <Modal
      title={utils.intl('新增能量单元')}
      visible={props.visible}
      onCancel={props.onExited}
      onOk={handleSubmit}
    >
      <FormContainer form={form}>
        <SelectItem label={utils.intl('能量单元类型')} dataSource={props.energyUnitTypes}
          value={type} onChange={v => setType(v)} rules={[{ required: true }]}
        />
      </FormContainer>
    </Modal>
  )
}

export default AddEnergyUnitDialog
